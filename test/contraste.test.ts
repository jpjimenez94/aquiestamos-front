import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * El sitio tiene dos fondos: el crema de la página y el blanco de las tarjetas.
 * Todo texto debe cumplir WCAG AA (4.5:1) sobre AMBOS, porque los mismos
 * colores se usan en los dos sitios.
 *
 * Esta prueba lee los tokens del CSS real: si alguien aclara un color, falla.
 */

const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')

function token(nombre: string): string {
  const m = css.match(new RegExp(`--${nombre}:\\s*(#[0-9a-fA-F]{6})`))
  if (!m) throw new Error(`No se encontró el token --${nombre} en globals.css`)
  return m[1]
}

function canalLineal(c: number): number {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminancia(hex: string): number {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  return 0.2126 * canalLineal(r) + 0.7152 * canalLineal(g) + 0.0722 * canalLineal(b)
}

function contraste(a: string, b: string): number {
  const [la, lb] = [luminancia(a), luminancia(b)]
  const [alto, bajo] = la > lb ? [la, lb] : [lb, la]
  return (alto + 0.05) / (bajo + 0.05)
}

const CREMA = token('color-bg-default')
const TARJETA = token('color-card-bg')

describe('contraste de la paleta', () => {
  const textos = [
    ['texto principal', 'color-text-default'],
    ['texto atenuado', 'color-text-light'],
    ['rojo de error', 'color-red'],
  ] as const

  for (const [etiqueta, nombre] of textos) {
    it(`${etiqueta} cumple AA sobre el fondo crema`, () => {
      expect(contraste(token(nombre), CREMA)).toBeGreaterThanOrEqual(4.5)
    })

    it(`${etiqueta} cumple AA sobre las tarjetas`, () => {
      expect(contraste(token(nombre), TARJETA)).toBeGreaterThanOrEqual(4.5)
    })
  }

  it('el texto de la barra de navegación cumple AA', () => {
    expect(contraste(token('navbar-text-color'), token('navbar-background-color'))).toBeGreaterThanOrEqual(4.5)
  })

  it('los iconos de color cumplen el mínimo de elementos no textuales (3:1)', () => {
    for (const nombre of ['color-blue', 'color-orange', 'color-green']) {
      expect(contraste(token(nombre), CREMA)).toBeGreaterThanOrEqual(3)
    }
  })

  it('los dos fondos siguen siendo claros (la paleta no se invirtió sin querer)', () => {
    expect(luminancia(CREMA)).toBeGreaterThan(0.5)
    expect(luminancia(TARJETA)).toBeGreaterThan(0.5)
  })
})
