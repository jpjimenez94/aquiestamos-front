import { describe, it, expect } from 'vitest'
import { telefonoValido } from '../lib/telefono'

/**
 * La red empezó siendo colombiana y el formulario exigía un celular de aquí.
 * Se está sumando gente desde fuera del país, así que estas pruebas fijan que
 * un número extranjero entra sin dejar de rechazar lo que no es un número.
 */

describe('validación de celular', () => {
  it('acepta un celular colombiano como se marca aquí', () => {
    expect(telefonoValido('3001234567')).toBe(true)
    expect(telefonoValido('300 123 4567')).toBe(true)
    expect(telefonoValido('300-123-4567')).toBe(true)
  })

  it('acepta números de otros países con su indicativo', () => {
    expect(telefonoValido('+34600123456')).toBe(true)
    expect(telefonoValido('+34 600 123 456')).toBe(true)
    expect(telefonoValido('+1 (415) 555-2671')).toBe(true)
    expect(telefonoValido('+57 300 123 4567')).toBe(true)
    expect(telefonoValido('+593 99 123 4567')).toBe(true)
  })

  it('rechaza lo que no es un número de teléfono', () => {
    expect(telefonoValido('')).toBe(false)
    expect(telefonoValido('no tengo')).toBe(false)
    expect(telefonoValido('300123456a')).toBe(false)
  })

  it('sigue rechazando un colombiano incompleto o mal formado', () => {
    // Nueve dígitos: le falta uno.
    expect(telefonoValido('300123456')).toBe(false)
    // Los celulares colombianos empiezan por 3; esto suele ser una cédula.
    expect(telefonoValido('1015992636')).toBe(false)
  })

  it('respeta el largo máximo de E.164, que es el que usa WhatsApp', () => {
    expect(telefonoValido('+123456789012345')).toBe(true)
    expect(telefonoValido('+1234567890123456')).toBe(false)
    // Demasiado corto para ser un número internacional real.
    expect(telefonoValido('+1234567')).toBe(false)
  })

  it('no acepta un + en mitad del número', () => {
    expect(telefonoValido('300+1234567')).toBe(false)
  })
})
