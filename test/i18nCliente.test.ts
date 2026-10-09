import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

/**
 * Los diccionarios no viajan al navegador.
 *
 * Los tres idiomas juntos pesan unos 180 KB de texto. En el servidor eso no le
 * cuesta nada a nadie: cada página toma el suyo y manda HTML. Pero basta con
 * que UN componente de cliente importe `lib/i18n/diccionario` —directamente o
 * a través de otro archivo— para que los tres idiomas enteros entren en el
 * JavaScript que baja cada visitante, también el que solo quería pedir ayuda
 * desde un teléfono con mala señal.
 *
 * Por eso los componentes de cliente reciben por props el trozo que necesitan.
 * Y como saltarse esa regla no rompe nada —compila, funciona, solo pesa—,
 * hay que vigilarla aquí.
 *
 * Se sigue la cadena entera de importaciones, no solo la primera: lo que un
 * componente de cliente importa, y lo que eso importa a su vez, también acaba
 * en el navegador.
 */

const RAIZ = process.cwd()
const CARPETAS = ['app', 'components', 'lib']

const normal = (archivo: string) => relative(RAIZ, archivo).split(sep).join('/')

function archivos(dir: string, acc: string[] = []): string[] {
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada)
    if (statSync(ruta).isDirectory()) archivos(ruta, acc)
    else if (/\.(tsx|ts)$/.test(entrada) && !entrada.endsWith('.d.ts')) acc.push(ruta)
  }
  return acc
}

/** ¿Es este archivo un diccionario, o el que los reúne? */
function esDiccionario(archivo: string): boolean {
  const ruta = normal(archivo)
  return ruta === 'lib/i18n/diccionario.ts' || ruta.startsWith('lib/i18n/diccionarios/')
}

/**
 * Lo que un archivo importa DE VERDAD: los `import type` no cuentan, porque
 * desaparecen al compilar y no arrastran nada.
 *
 * `import { type A, b }` sí cuenta —trae `b`—. Y `import { type A }` también,
 * a propósito: que desaparezca o no depende del compilador, y la forma de
 * decir sin ambigüedad «solo quiero el tipo» es `import type`.
 */
function importaciones(codigo: string): string[] {
  const sinComentarios = codigo.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  const destinos: string[] = []
  const patron =
    /\b(?:import|export)\s+(type\s+)?(?:[\w*\s{},$]+?\s+from\s+)?['"]([^'"]+)['"]/g
  for (const m of sinComentarios.matchAll(patron)) {
    if (!m[1]) destinos.push(m[2])
  }
  return destinos
}

/** El archivo al que apunta una importación, si es del proyecto. */
function resolver(desde: string, destino: string): string | null {
  let base: string
  if (destino.startsWith('@/')) base = join(RAIZ, destino.slice(2))
  else if (destino.startsWith('.')) base = resolve(dirname(desde), destino)
  else return null // un paquete

  for (const sufijo of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
    const candidato = base + sufijo
    if (existsSync(candidato) && statSync(candidato).isFile()) return candidato
  }
  return null // una hoja de estilos, una imagen
}

const TODOS = CARPETAS.flatMap((carpeta) => archivos(join(RAIZ, carpeta)))
const CODIGO = new Map(TODOS.map((archivo) => [archivo, readFileSync(archivo, 'utf8')]))
const DE_CLIENTE = TODOS.filter((archivo) => /^\s*['"]use client['"]/.test(CODIGO.get(archivo) ?? ''))

/** La cadena de importaciones que lleva de un archivo a un diccionario, si la hay. */
function caminoAlDiccionario(inicio: string): string[] | null {
  const vistos = new Set<string>([inicio])
  const cola: string[][] = [[inicio]]

  while (cola.length > 0) {
    const camino = cola.shift()!
    const actual = camino[camino.length - 1]

    for (const destino of importaciones(CODIGO.get(actual) ?? '')) {
      const archivo = resolver(actual, destino)
      if (!archivo || vistos.has(archivo)) continue
      if (esDiccionario(archivo)) return [...camino, archivo].map(normal)
      vistos.add(archivo)
      cola.push([...camino, archivo])
    }
  }
  return null
}

describe('los diccionarios se quedan en el servidor', () => {
  it('encuentra los componentes de cliente (el escáner ve lo que debe ver)', () => {
    expect(DE_CLIENTE.length).toBeGreaterThan(10)
    // Y sabe seguir una importación hasta un diccionario cuando la hay: el
    // archivo que los reúne los importa, y eso tiene que verse.
    const reune = join(RAIZ, 'lib/i18n/diccionario.ts')
    expect(importaciones(CODIGO.get(reune) ?? '').map((d) => resolver(reune, d)).some(
      (archivo) => archivo !== null && esDiccionario(archivo),
    )).toBe(true)
  })

  it('distingue un `import type` de una importación de verdad', () => {
    expect(importaciones("import type { A } from './a'\nimport { b } from './b'")).toEqual(['./b'])
    expect(importaciones("import {\n  type A,\n  b,\n} from './mixto'")).toEqual(['./mixto'])
    expect(importaciones("import './estilos.css'")).toEqual(['./estilos.css'])
    expect(importaciones("export { x } from './x'\nexport type { Y } from './y'")).toEqual(['./x'])
  })

  it.each(DE_CLIENTE.map(normal))('%s no arrastra los diccionarios al navegador', (ruta) => {
    const camino = caminoAlDiccionario(join(RAIZ, ruta))
    expect(
      camino,
      camino
        ? `Este componente de cliente acaba importando un diccionario: ${camino.join(' → ')}. ` +
            'Pásale por props el trozo que necesita, o usa `import type` si solo quiere el tipo.'
        : undefined,
    ).toBeNull()
  })
})
