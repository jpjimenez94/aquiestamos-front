import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { RUTAS_TRADUCIDAS } from '../lib/i18n/idiomas'

/**
 * Cada página del sitio existe en los tres idiomas.
 *
 * El español vive en `app/(sitio)/…` y los demás en `app/[lang]/…`: son dos
 * carpetas con las mismas páginas, y nada obliga a que lo sigan siendo. Una
 * página nueva que se añada solo en español no rompe nada —compila, se
 * despliega—; simplemente no existe en inglés, y el selector de idioma manda a
 * la gente a un 404. Esto lo convierte en una prueba que falla.
 *
 * También vigila que las dos gemelas pinten la MISMA vista. Dos páginas que
 * hay que acordarse de mantener iguales acaban siendo dos páginas distintas.
 */

const APP = join(process.cwd(), 'app')

/**
 * Páginas del sitio público que solo existen en español, y por qué.
 *
 * Son las que llegan por un enlace con token dentro de un mensaje que la red
 * manda en español. Traducir la página sin traducir el mensaje —ni poder
 * atender después en ese idioma— sería prometer algo que no se cumple.
 */
const SOLO_EN_ESPANOL = ['/turno/[token]']

/** El comodín de `app/[lang]` que convierte lo desconocido en un 404 traducido. */
const COMODIN = '/[...resto]'

/** Las rutas que tienen `page.tsx` debajo de una carpeta, relativas a ella. */
function paginas(dir: string, base = ''): string[] {
  const rutas: string[] = []
  for (const entrada of readdirSync(dir)) {
    const completa = join(dir, entrada)
    if (statSync(completa).isDirectory()) rutas.push(...paginas(completa, `${base}/${entrada}`))
    else if (entrada === 'page.tsx') rutas.push(base || '/')
  }
  return rutas
}

const EN_ESPANOL = paginas(join(APP, '(sitio)'))
  .filter((r) => !SOLO_EN_ESPANOL.includes(r))
  .sort()
const EN_OTROS = paginas(join(APP, '[lang]'))
  .filter((r) => r !== COMODIN)
  .sort()

/** El archivo de una página, en español o en los demás idiomas. */
function archivo(grupo: '(sitio)' | '[lang]', ruta: string): string {
  return join(APP, grupo, ruta === '/' ? '' : ruta, 'page.tsx')
}

/** La vista que pinta una página: el componente que importa de `vistas/`. */
function vistaDe(codigo: string): string | null {
  const importada = codigo.match(
    /import\s*\{([^}]+)\}\s*from\s*'@\/components\/sitio\/vistas\/[A-Za-z]+'/,
  )
  if (!importada) return null
  const nombres = importada[1].split(',').map((n) => n.trim())
  return nombres.find((n) => new RegExp(`<${n}[\\s/>]`).test(codigo)) ?? null
}

describe('las páginas del sitio en los tres idiomas', () => {
  it('encuentra las páginas (el escáner ve lo que debe ver)', () => {
    expect(EN_ESPANOL.length).toBeGreaterThan(5)
    expect(EN_OTROS.length).toBeGreaterThan(5)
  })

  it('tiene en inglés y portugués las mismas páginas que en español', () => {
    expect(EN_OTROS).toEqual(EN_ESPANOL)
  })

  it('coincide con la lista que consulta el selector de idioma', () => {
    // `RUTAS_TRADUCIDAS` no puede listar los libros uno a uno: la ficha de un
    // recurso la reconoce por su forma (`estaTraducida`).
    const declaradas = [...RUTAS_TRADUCIDAS, '/recursos/[slug]'].sort()
    expect(EN_ESPANOL).toEqual(declaradas)
  })

  it.each(EN_ESPANOL)('%s pinta la misma vista en español y en los demás idiomas', (ruta) => {
    const enEspanol = vistaDe(readFileSync(archivo('(sitio)', ruta), 'utf8'))
    const enOtros = vistaDe(readFileSync(archivo('[lang]', ruta), 'utf8'))
    expect(enEspanol, `${ruta} no pinta una vista de components/sitio/vistas`).toBeTruthy()
    expect(enOtros).toBe(enEspanol)
  })

  it.each(EN_ESPANOL)('%s anuncia sus otros idiomas a los buscadores', (ruta) => {
    // `metadatosDeRuta` / `metadatosDeRecurso` son las que escriben el
    // `hreflang`. Una página que arme sus metadatos a mano se lo salta.
    for (const grupo of ['(sitio)', '[lang]'] as const) {
      const codigo = readFileSync(archivo(grupo, ruta), 'utf8')
      expect(codigo, `${grupo}${ruta}`).toMatch(/metadatosDe(Ruta|LaRuta|Recurso)\(/)
    }
  })

  it('comprueba el idioma en cada página de app/[lang]', () => {
    // `[lang]` recibe cualquier cosa: `/foo` llega aquí con lang = "foo".
    // Quien no pregunte si es un idioma del sitio pintaría una página con un
    // diccionario que no existe.
    for (const ruta of [...EN_OTROS, COMODIN]) {
      const codigo = readFileSync(archivo('[lang]', ruta), 'utf8')
      expect(codigo, `[lang]${ruta}`).toMatch(/idiomaDeLaRuta\(/)
    }
  })

  it('tiene su propio 404 para /en y /pt', () => {
    expect(existsSync(join(APP, '[lang]', 'not-found.tsx'))).toBe(true)
    expect(existsSync(archivo('[lang]', COMODIN))).toBe(true)
  })
})
