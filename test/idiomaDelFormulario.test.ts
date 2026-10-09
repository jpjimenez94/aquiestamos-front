import { describe, it, expect } from 'vitest'
import {
  avisoDeIdioma,
  etiquetaDeIdioma,
  idiomaDistintoDelEspanol,
} from '../lib/idiomaDelFormulario'
import { IDIOMAS } from '../lib/i18n/idiomas'

/**
 * La etiqueta «Formulario en inglés» del portal.
 *
 * El sitio guarda en qué idioma se llenó cada formulario, y el portal lo dice
 * solo cuando fue en otro idioma: es un aviso para quien va a llamar, y un
 * aviso en todas las filas deja de ser un aviso.
 */

describe('el idioma del formulario, dicho para el equipo', () => {
  it('avisa cuando el formulario se llenó en inglés o en portugués', () => {
    expect(etiquetaDeIdioma('en')).toBe('Formulario en inglés')
    expect(etiquetaDeIdioma('pt')).toBe('Formulario en portugués')
  })

  it('no dice nada si fue en español: es lo esperado', () => {
    expect(etiquetaDeIdioma('es')).toBeNull()
    expect(idiomaDistintoDelEspanol('es')).toBeNull()
    expect(avisoDeIdioma('es')).toBeNull()
  })

  it('no dice nada si no se sabe, que no es lo mismo que «en español»', () => {
    // Todo lo que llegó antes de que el sitio tuviera idiomas viene sin dato.
    for (const desconocido of [null, undefined, '']) {
      expect(etiquetaDeIdioma(desconocido)).toBeNull()
      expect(avisoDeIdioma(desconocido)).toBeNull()
    }
  })

  it('no se inventa un idioma con un valor que no conoce', () => {
    for (const raro of ['fr', 'EN', 'pt-BR', 'toString', 'constructor']) {
      expect(etiquetaDeIdioma(raro), raro).toBeNull()
    }
  })

  it('en la ficha dice qué implica, sin afirmar de más', () => {
    // «Puede que», no «no habla»: llenar el formulario en inglés solo prueba
    // que lo prefirió para leer.
    expect(avisoDeIdioma('en')).toBe('Inglés — puede que no hable español')
    expect(avisoDeIdioma('pt')).toBe('Portugués — puede que no hable español')
  })

  it('tiene nombre para cada idioma del sitio que no es el español', () => {
    // Si el sitio gana un idioma y aquí no se le pone nombre, sus formularios
    // llegarían al portal sin etiqueta: justo lo que esto vino a evitar.
    for (const idioma of IDIOMAS.filter((i) => i !== 'es')) {
      expect(idiomaDistintoDelEspanol(idioma), idioma).toBeTruthy()
    }
  })
})
