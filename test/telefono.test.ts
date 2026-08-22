import { describe, it, expect } from 'vitest'
import { telefonoValido, paraWhatsapp } from '../lib/telefono'

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

/**
 * Cómo se le pone (o no) el indicativo a un número para abrir WhatsApp.
 *
 * Esto existe porque la regla que había escrita a mano en tres componentes
 * —«si no empieza por 57, ponle 57»— es falsa en cuanto alguien se registra
 * desde fuera de Colombia, y la red ya tiene gente en España, Ecuador y
 * México. El síntoma no era un error en pantalla: era un botón que abría
 * WhatsApp con un número inexistente y parecía que había funcionado.
 */
describe('número para WhatsApp', () => {
  it('a un celular colombiano suelto le pone el 57', () => {
    expect(paraWhatsapp('3001234567')).toBe('573001234567')
    expect(paraWhatsapp('300 123 4567')).toBe('573001234567')
    expect(paraWhatsapp('(300) 123-4567')).toBe('573001234567')
  })

  it('NO le pone el 57 a un número que ya trae indicativo', () => {
    expect(paraWhatsapp('+34 600 123 456')).toBe('34600123456')
    expect(paraWhatsapp('+593 99 123 4567')).toBe('593991234567')
    expect(paraWhatsapp('+52 55 1234 5678')).toBe('525512345678')
    expect(paraWhatsapp('+1 (415) 555-2671')).toBe('14155552671')
  })

  /** El caso exacto que estaba roto antes. */
  it('un número español no se convierte en 5734600123456', () => {
    expect(paraWhatsapp('+34600123456')).not.toContain('5734')
    expect(paraWhatsapp('34600123456')).not.toContain('5734')
  })

  it('respeta un colombiano que ya trae el 57, con + o sin él', () => {
    expect(paraWhatsapp('+57 300 123 4567')).toBe('573001234567')
    expect(paraWhatsapp('573001234567')).toBe('573001234567')
    expect(paraWhatsapp('57 300 123 4567')).toBe('573001234567')
  })

  it('entiende el 00 como lo que es: otra forma de escribir el +', () => {
    expect(paraWhatsapp('0034600123456')).toBe('34600123456')
    expect(paraWhatsapp('00 34 600 123 456')).toBe('34600123456')
  })

  /**
   * No existe país cuyo indicativo más número dé exactamente diez dígitos
   * empezando por 3, así que un "+3001234567" es alguien que creyó que el más
   * era obligatorio. Se rescata en vez de generar un enlace muerto.
   */
  it('rescata un celular colombiano al que le sobró el +', () => {
    expect(paraWhatsapp('+3001234567')).toBe('573001234567')
  })

  it('le pone el 57 a un fijo colombiano de diez dígitos', () => {
    expect(paraWhatsapp('601 234 5678')).toBe('576012345678')
    expect(paraWhatsapp('6042345678')).toBe('576042345678')
  })

  it('deja como está lo que ya parece traer indicativo aunque falte el +', () => {
    expect(paraWhatsapp('5215512345678')).toBe('5215512345678')
  })

  /**
   * Devolver null y no un enlace roto es la decisión importante: un botón que
   * no aparece se nota y se corrige; uno que abre un número inexistente parece
   * que funcionó, y nadie se entera hasta que preguntan por qué esa persona
   * nunca contestó.
   */
  it('devuelve null cuando no hay forma honesta de saber a qué país llamar', () => {
    expect(paraWhatsapp('2345678')).toBeNull()
    expect(paraWhatsapp('')).toBeNull()
    expect(paraWhatsapp('   ')).toBeNull()
    expect(paraWhatsapp(null)).toBeNull()
    expect(paraWhatsapp(undefined)).toBeNull()
    expect(paraWhatsapp('no tengo')).toBeNull()
    expect(paraWhatsapp('123')).toBeNull()
  })
})
