import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import ts from 'typescript'
import { es } from '../lib/i18n/diccionarios/es'

/**
 * Lo que el sitio público dice, lo dice el diccionario.
 *
 * Una frase escrita a mano dentro de un componente del sitio se ve perfecta en
 * español y pasa todas las revisiones… y sale tal cual, en español, en mitad
 * de la página en inglés y de la página en portugués. No falla nada: ni el
 * typecheck, ni el build, ni la versión española, que es la que todo el mundo
 * mira. Solo lo ve quien lee en otro idioma.
 *
 * Esta prueba recorre el código de los componentes que se pintan en los tres
 * idiomas y señala todo texto visible que no venga de una variable:
 *
 *   · texto suelto entre etiquetas («<p>Hola</p>»);
 *   · atributos que se leen o se oyen: `placeholder`, `aria-label`, `alt`…;
 *   · frases dentro del código: el mensaje de un error, un texto de respaldo.
 *
 * Lo único en español que puede quedar son los VALORES que espera el backend
 * («Niños y niñas», «Trabajo Social»): se envían, no se enseñan, y son
 * exactamente las claves de las `opciones` del diccionario.
 */

const RAIZ = process.cwd()
const normal = (archivo: string) => relative(RAIZ, archivo).split(sep).join('/')

function tsx(dir: string, acc: string[] = []): string[] {
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada)
    if (statSync(ruta).isDirectory()) tsx(ruta, acc)
    else if (entrada.endsWith('.tsx')) acc.push(ruta)
  }
  return acc
}

/** Lo que se pinta en español, inglés y portugués. */
const VIGILADOS = [
  ...tsx(join(RAIZ, 'components/sitio')),
  ...tsx(join(RAIZ, 'components/layout')),
  ...tsx(join(RAIZ, 'app/[lang]')),
  // Del grupo en español, todo menos lo que solo existe en español.
  ...tsx(join(RAIZ, 'app/(sitio)')).filter((a) => !normal(a).startsWith('app/(sitio)/turno/')),
  join(RAIZ, 'app/not-found.tsx'),
  ...['SupportRequestForm', 'VolunteerForm', 'CollaboratorForm', 'MunicipioSelector'].map((n) =>
    join(RAIZ, 'components/forms', `${n}.tsx`),
  ),
]

/** Los valores que el backend espera en español: las claves de cada `opciones`. */
function valoresDelBackend(nodo: unknown, acc = new Set<string>()): Set<string> {
  if (!nodo || typeof nodo !== 'object') return acc
  for (const [clave, hijo] of Object.entries(nodo)) {
    if (clave === 'opciones' && hijo && typeof hijo === 'object') {
      for (const valor of Object.keys(hijo)) acc.add(valor)
    }
    valoresDelBackend(hijo, acc)
  }
  return acc
}
const VALORES = valoresDelBackend(es.formularios)

/** Atributos cuyo contenido se lee o se oye. */
const VISIBLES = new Set(['alt', 'title', 'placeholder', 'aria-label', 'label', 'hint', 'titulo'])

/** Atributos cuyo contenido es para la máquina, aunque lleve palabras. */
const TECNICOS = new Set([
  'className',
  'style',
  'rel',
  'sizes',
  'd',
  'viewBox',
  'points',
  'transform',
  'accept',
  'autoComplete',
])

/** Nombres de marca: se escriben igual en los tres idiomas. */
const MARCAS = /\b(WhatsApp|Instagram)\b/g

const TIENE_PALABRA = /\p{L}{2,}/u

/**
 * ¿Lleva palabras este texto suelto? Antes de mirar se le quita lo que parece
 * una palabra y no lo es: las entidades (`&ldquo;` son unas comillas) y las
 * marcas.
 */
function tienePalabras(texto: string): boolean {
  return TIENE_PALABRA.test(texto.replace(/&#?\w+;/g, '').replace(MARCAS, ''))
}
/** Algo que solo se escribe en una frase en español. */
const ES_ESPANOL = /[áéíóúñÁÉÍÓÚÑ¿¡]/
/** Empieza en mayúscula y sigue al menos dos palabras más: una frase. */
const ES_FRASE = /^\p{Lu}\p{Ll}*(\s+\p{L}+[.,;:!?…]*){2,}/u

type Hallazgo = { linea: number; texto: string }

function atributoQueLoContiene(nodo: ts.Node): string | null {
  for (let padre: ts.Node | undefined = nodo.parent; padre; padre = padre.parent) {
    if (ts.isJsxAttribute(padre)) return padre.name.getText()
  }
  return null
}

function dentroDeConsola(nodo: ts.Node): boolean {
  for (let padre: ts.Node | undefined = nodo.parent; padre; padre = padre.parent) {
    if (ts.isCallExpression(padre) && /^console\./.test(padre.expression.getText())) return true
  }
  return false
}

function textosEscritosAMano(archivo: string, codigo = readFileSync(archivo, 'utf8')): Hallazgo[] {
  const fuente = ts.createSourceFile(archivo, codigo, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const hallazgos: Hallazgo[] = []
  const apuntar = (nodo: ts.Node, texto: string) =>
    hallazgos.push({
      linea: fuente.getLineAndCharacterOfPosition(nodo.getStart()).line + 1,
      texto: texto.trim().replace(/\s+/g, ' ').slice(0, 70),
    })

  const recorrer = (nodo: ts.Node): void => {
    // Las importaciones llevan rutas, no frases.
    if (ts.isImportDeclaration(nodo) || ts.isExportDeclaration(nodo)) return

    if (ts.isJsxText(nodo)) {
      if (tienePalabras(nodo.text)) apuntar(nodo, nodo.text)
      return
    }

    if (ts.isStringLiteral(nodo) || ts.isNoSubstitutionTemplateLiteral(nodo) || ts.isTemplateHead(nodo)) {
      const texto = nodo.text
      const atributo = atributoQueLoContiene(nodo)

      if (atributo && TECNICOS.has(atributo)) return
      if (dentroDeConsola(nodo)) return
      if (VALORES.has(texto)) return

      // `placeholder="Nombre"`: una sola palabra ya es texto visible.
      const esValorDirecto = ts.isJsxAttribute(nodo.parent)
      if (esValorDirecto && atributo && VISIBLES.has(atributo) && tienePalabras(texto)) {
        apuntar(nodo, texto)
        return
      }

      if (ES_ESPANOL.test(texto) || ES_FRASE.test(texto)) apuntar(nodo, texto)
      return
    }

    ts.forEachChild(nodo, recorrer)
  }

  recorrer(fuente)
  return hallazgos
}

/**
 * Los `href` que apuntan dentro del sitio sin pasar por `ruta()`.
 *
 * Un `href="/recursos"` escrito a mano funciona en español y, desde una página
 * en inglés, saca a la persona al español sin avisarle.
 */
function enlacesSinIdioma(archivo: string, codigo = readFileSync(archivo, 'utf8')): Hallazgo[] {
  const fuente = ts.createSourceFile(archivo, codigo, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const hallazgos: Hallazgo[] = []

  const pasaPorRuta = (nodo: ts.Node, tope: ts.Node): boolean => {
    for (let padre: ts.Node | undefined = nodo.parent; padre && padre !== tope; padre = padre.parent) {
      if (ts.isCallExpression(padre) && /^(ruta|equivalente)$/.test(padre.expression.getText())) {
        return true
      }
    }
    return false
  }

  const recorrer = (nodo: ts.Node): void => {
    if (ts.isJsxAttribute(nodo) && nodo.name.getText() === 'href' && nodo.initializer) {
      const atributo = nodo
      const buscar = (hijo: ts.Node): void => {
        const esCadena =
          ts.isStringLiteral(hijo) || ts.isNoSubstitutionTemplateLiteral(hijo) || ts.isTemplateHead(hijo)
        if (esCadena && /^\/(?!\/)/.test(hijo.text) && !pasaPorRuta(hijo, atributo)) {
          hallazgos.push({
            linea: fuente.getLineAndCharacterOfPosition(hijo.getStart()).line + 1,
            texto: hijo.text,
          })
        }
        ts.forEachChild(hijo, buscar)
      }
      buscar(nodo.initializer)
      return
    }
    ts.forEachChild(nodo, recorrer)
  }

  recorrer(fuente)
  return hallazgos
}

describe('los enlaces internos del sitio público', () => {
  it('reconoce un enlace sin idioma, y solo eso (el escáner ve lo que debe ver)', () => {
    const ejemplo = `
      export function Ejemplo({ idioma, slug }: { idioma: 'es'; slug: string }) {
        return (
          <nav>
            <a href="/recursos">mal</a>
            <a href={\`/recursos/\${slug}\`}>mal</a>
            <a href={ruta(idioma, '/recursos')}>bien</a>
            <a href={ruta(idioma, \`/recursos/\${slug}\`)}>bien</a>
            <a href="#formulario">bien</a>
            <a href="https://wa.me/573102186299">bien</a>
            <img src="/images/hero.png" />
          </nav>
        )
      }`
    expect(enlacesSinIdioma('ejemplo.tsx', ejemplo).map((h) => h.texto)).toEqual([
      '/recursos',
      '/recursos/',
    ])
  })

  it.each(VIGILADOS.map(normal))('%s no enlaza dentro del sitio sin pasar por ruta()', (ruta) => {
    const hallazgos = enlacesSinIdioma(join(RAIZ, ruta))
    expect(
      hallazgos.map((h) => `línea ${h.linea}: href="${h.texto}"`),
      'Desde una página en inglés o portugués, este enlace lleva al español. ' +
        'Escríbelo como ruta(idioma, "/…").',
    ).toEqual([])
  })
})

describe('los textos del sitio público', () => {
  it('encuentra los componentes que vigila', () => {
    expect(VIGILADOS.length).toBeGreaterThan(30)
    expect(VALORES.has('Niños y niñas')).toBe(true)
  })

  it('reconoce una frase escrita a mano, y solo eso (el escáner ve lo que debe ver)', () => {
    // Un componente inventado con las tres formas de colar texto, rodeadas de
    // lo que NO es texto y se le parece: clases, estilos, valores del backend.
    const ejemplo = `
      import { algo } from '@/una/ruta con espacios'
      const POBLACIONES = ['Niños y niñas', 'Adultos'] as const
      export function Ejemplo({ t }: { t: { hola: string } }) {
        const aviso = 'No pudimos enviar tus datos'
        console.error('Esto es para quien programa, no para quien lee')
        return (
          <div className="caja de ejemplo" style={{ border: '1px solid red' }}>
            <p>Texto suelto</p>
            <input placeholder="Nombre" aria-label={t.hola} />
            <span aria-hidden>*</span>
            <a href="#">WhatsApp {t.hola}</a> &ldquo;{t.hola}&rdquo;
            {t.hola} {aviso}
          </div>
        )
      }`
    expect(textosEscritosAMano('ejemplo.tsx', ejemplo).map((h) => h.texto)).toEqual([
      'No pudimos enviar tus datos',
      'Texto suelto',
      'Nombre',
    ])
  })

  it.each(VIGILADOS.map(normal))('%s no lleva texto escrito a mano', (ruta) => {
    const hallazgos = textosEscritosAMano(join(RAIZ, ruta))
    expect(
      hallazgos.map((h) => `línea ${h.linea}: «${h.texto}»`),
      'Este texto saldría en español en las páginas en inglés y portugués. ' +
        'Llévalo a lib/i18n/diccionarios (es, en y pt) y léelo de ahí.',
    ).toEqual([])
  })
})
