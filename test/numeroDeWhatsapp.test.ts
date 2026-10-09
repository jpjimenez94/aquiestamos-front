import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { site, whatsappHref } from '../lib/site'

/**
 * El WhatsApp de la red se escribe en un solo sitio: `lib/site.ts`.
 *
 * La sala de videollamada tenía el suyo escrito a mano. Cuando el enlace de
 * una sesión no servía, la pantalla decía «Sesión no disponible» y ofrecía un
 * botón, «Contactar a Coordinación», que llevaba a `wa.me/573009121234`: un
 * número de relleno que se quedó así al publicar. Lo veía justo quien no podía
 * entrar a su sesión —el peor momento para mandarla a escribirle a un
 * desconocido—, y duró mes y medio porque esa pantalla solo aparece cuando
 * algo falla: nadie la abre para revisarla.
 *
 * El mismo descuido, con otra cara, estaba en el cartel de «Quiero ser parte»:
 * una imagen con un celular dibujado que dejó de ser el de la red.
 *
 * La regla que sale de las dos: un `wa.me/` seguido de dígitos, escrito en el
 * código, tiene que ser el número oficial. Los enlaces hacia el celular de una
 * persona o de una profesional se arman con su dato (`wa.me/${telefono}`) y no
 * entran aquí: ahí no hay ningún número escrito.
 */

const RAIZ = ['app', 'components', 'lib']

function fuentesDe(dir: string): string[] {
  const salida: string[] = []
  for (const entrada of readdirSync(dir)) {
    if (entrada === 'node_modules' || entrada.startsWith('.')) continue
    const ruta = join(dir, entrada)
    if (statSync(ruta).isDirectory()) salida.push(...fuentesDe(ruta))
    else if (entrada.endsWith('.ts') || entrada.endsWith('.tsx')) salida.push(ruta)
  }
  return salida
}

/** Los números que aparecen escritos detrás de un `wa.me/`. */
export function numerosEscritos(fuente: string): string[] {
  return [...fuente.matchAll(/wa[.]me[/]([0-9]+)/g)].map((hallazgo) => hallazgo[1])
}

describe('el WhatsApp de la red', () => {
  it('no está escrito a mano en ninguna pantalla con otro número', () => {
    const ajenos: string[] = []

    for (const raiz of RAIZ) {
      for (const archivo of fuentesDe(raiz)) {
        for (const numero of numerosEscritos(readFileSync(archivo, 'utf8'))) {
          if (numero !== site.whatsappNumber) ajenos.push(`${archivo}: wa.me/${numero}`)
        }
      }
    }

    expect(ajenos).toEqual([])
  })

  it('el enlace, el número y sus dos formas de mostrarlo dicen lo mismo', () => {
    const soloDigitos = (texto: string) => texto.split(/[^0-9]/).join('')

    expect(whatsappHref).toBe(`https://wa.me/${site.whatsappNumber}`)
    expect(soloDigitos(site.whatsappInternacional)).toBe(site.whatsappNumber)
    expect(site.whatsappNumber.endsWith(soloDigitos(site.whatsappDisplay))).toBe(true)
  })

  it('distingue un número escrito de un enlace armado con el dato de alguien', () => {
    expect(numerosEscritos('<a href="https://wa.me/573009121234">')).toEqual(['573009121234'])
    expect(numerosEscritos('`https://wa.me/${telefono}?text=${mensaje}`')).toEqual([])
    expect(numerosEscritos('https://wa.me/?text=hola')).toEqual([])
  })
})
