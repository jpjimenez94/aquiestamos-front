import { describe, it, expect } from 'vitest'
import { renderPlantilla } from '../lib/plantillas'

/**
 * Que la plantilla mande.
 *
 * Estas pruebas fijan la propiedad de fondo: lo que se envía sale del texto
 * que la coordinación editó en Parametrización, no de una copia en el código.
 * Antes había dos verdades y ganaba siempre la del código, así que editar un
 * mensaje en la pantalla no cambiaba nada.
 */
describe('renderPlantilla', () => {
  it('usa el texto de la plantilla, no el respaldo', () => {
    const salida = renderPlantilla('Hola {nombre}, soy la plantilla.', { nombre: 'Ana' }, 'texto viejo')
    expect(salida).toBe('Hola Ana, soy la plantilla.')
    expect(salida).not.toContain('texto viejo')
  })

  it('cae al respaldo solo si la plantilla está vacía', () => {
    expect(renderPlantilla('', { nombre: 'Ana' }, 'Hola {nombre}')).toBe('Hola Ana')
    expect(renderPlantilla('   ', { nombre: 'Ana' }, 'Hola {nombre}')).toBe('Hola Ana')
    expect(renderPlantilla(undefined, { nombre: 'Ana' }, 'Hola {nombre}')).toBe('Hola Ana')
  })

  it('reemplaza varias veces la misma variable', () => {
    expect(renderPlantilla('{n} y {n}', { n: 'x' })).toBe('x y x')
  })

  describe('cuando falta un dato', () => {
    // «La persona está en .» se lee como un error del sistema. No decir la
    // ciudad se lee como que no la sabemos, que es lo que pasa.
    it('quita la línea entera en vez de dejar un hueco', () => {
      const t = ['Hola {nombre}.', '· Está en {ciudad}.', '· Prefiere {modalidad}.'].join('\n')
      const salida = renderPlantilla(t, { nombre: 'Ana', ciudad: null, modalidad: 'virtual' })
      expect(salida).toBe('Hola Ana.\n· Prefiere virtual.')
    })

    it('una cadena vacía cuenta como falta', () => {
      const salida = renderPlantilla('a\n· {x}\nb', { x: '   ' })
      expect(salida).toBe('a\nb')
    })

    it('conserva la línea si al menos una de sus variables sí tiene valor', () => {
      // La línea sobrevive porque `a` tiene dato; `b` se va en silencio. Se
      // cae solo la línea donde NO se sabe nada.
      const salida = renderPlantilla('· {a} y {b}\nfin', { a: 'uno', b: null })
      expect(salida).toBe('· uno y \nfin')
    })
  })

  it('deja a la vista lo que la plantilla pide y nadie mandó', () => {
    // Un `{profesional}` suelto en el mensaje es feo y se arregla enseguida.
    // Un hueco silencioso se manda cien veces sin que nadie lo note.
    expect(renderPlantilla('Hola {nombre}, con {profesional}.', { nombre: 'Ana' })).toBe(
      'Hola Ana, con {profesional}.',
    )
  })

  it('no deja tres saltos de línea al caerse una', () => {
    const t = ['uno', '', '{sobra}', '', 'dos'].join('\n')
    expect(renderPlantilla(t, { sobra: null })).toBe('uno\n\ndos')
  })

  it('nunca lanza, pase lo que pase', () => {
    expect(() => renderPlantilla('{a}{b}{c}', {})).not.toThrow()
    expect(() => renderPlantilla('sin variables', {})).not.toThrow()
    expect(renderPlantilla('', {}, '')).toBe('')
  })
})
