import { describe, it, expect } from 'vitest'
import { COLOMBIA, PAISES, esDeFuera, nombreDelPais, opcionesDePais } from '../lib/paises'
import { avisoDePais, etiquetaDePais, paisDeFuera } from '../lib/paisDelFormulario'
import { IDIOMAS } from '../lib/i18n/idiomas'

/**
 * El país en los formularios del sitio y su etiqueta en el portal.
 *
 * Los formularios solo ofrecían municipios de Colombia, y escribía gente de
 * otros países. Ahora se elige el país —Colombia de entrada— y el portal avisa
 * «Desde España» cuando la persona está fuera.
 */

describe('la lista de países', () => {
  it('son códigos de dos letras, sin repetir, y Colombia está', () => {
    expect(new Set(PAISES).size).toBe(PAISES.length)
    for (const codigo of PAISES) expect(codigo, codigo).toMatch(/^[A-Z]{2}$/)
    expect(PAISES).toContain(COLOMBIA)
  })

  it('no ofrece territorios donde no vive nadie', () => {
    for (const vacio of ['AQ', 'BV', 'HM', 'UM', 'GS', 'TF']) {
      expect(PAISES as readonly string[], vacio).not.toContain(vacio)
    }
  })

  it.each([...IDIOMAS])('en %s pone Colombia arriba y el resto en orden alfabético', (idioma) => {
    const opciones = opcionesDePais(idioma)
    expect(opciones[0].codigo).toBe(COLOMBIA)
    expect(opciones).toHaveLength(PAISES.length)

    const resto = opciones.slice(1).map((o) => o.nombre)
    const orden = new Intl.Collator(idioma === 'pt' ? 'pt-BR' : idioma)
    expect([...resto].sort((a, b) => orden.compare(a, b))).toEqual(resto)
  })

  it('nombra cada país en el idioma de la página', () => {
    expect(nombreDelPais('ES', 'es')).toBe('España')
    expect(nombreDelPais('ES', 'en')).toBe('Spain')
    expect(nombreDelPais('ES', 'pt')).toBe('Espanha')
  })
})

describe('quién escribe desde fuera', () => {
  it('solo un país conocido distinto de Colombia', () => {
    expect(esDeFuera('ES')).toBe(true)
    expect(esDeFuera('CO')).toBe(false)
    // «No se sabe» no es «de fuera».
    for (const nada of [null, undefined, '', 'es', 'España']) expect(esDeFuera(nada), String(nada)).toBe(false)
  })
})

describe('la etiqueta del portal', () => {
  it('dice desde dónde, en español, cuando es fuera de Colombia', () => {
    expect(paisDeFuera('ES')).toBe('España')
    expect(etiquetaDePais('VE')).toBe('Desde Venezuela')
    expect(avisoDePais('ES')).toBe('España — solo virtual, y en otra zona horaria')
  })

  it('calla si es Colombia o si no se sabe', () => {
    for (const nada of ['CO', null, undefined, '']) {
      expect(etiquetaDePais(nada), String(nada)).toBeNull()
      expect(avisoDePais(nada), String(nada)).toBeNull()
    }
  })
})
