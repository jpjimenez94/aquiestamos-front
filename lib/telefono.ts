/**
 * Validación de celular, compartida por los formularios públicos.
 *
 * La red empezó siendo colombiana, pero se está sumando gente desde fuera del
 * país, así que el número no puede seguir atado a Colombia. La regla acepta
 * las dos formas en que la gente escribe de verdad su número:
 *
 *   3001234567          celular colombiano, como se marca aquí
 *   +57 300 123 4567    el mismo, con indicativo
 *   +34 600 123 456     cualquier otro país
 *
 * El límite de 15 dígitos no es arbitrario: es el máximo que permite el
 * estándar E.164, que es el que usa WhatsApp.
 */

export const PISTA_TELEFONO =
  'Con WhatsApp, si lo tienes. Es por donde te contactaremos. Si tu número es de otro país, escríbelo con el indicativo: +34 600 123 456.'

export const ERROR_TELEFONO =
  'Escribe un celular colombiano (10 dígitos que empiezan por 3) o uno de otro país con su indicativo, como +34 600 123 456'

/** Quita lo que la gente usa para separar y que no cambia el número. */
function limpiar(valor: string): string {
  return valor.replace(/[\s()-]/g, '')
}

export function telefonoValido(valor: string): boolean {
  const limpio = limpiar(valor.trim())

  // Con indicativo: el prefijo de país mide de 1 a 3 dígitos y el total,
  // según E.164, no pasa de 15.
  if (limpio.startsWith('+')) return /^\+\d{8,15}$/.test(limpio)

  // Sin indicativo se asume Colombia, que es de donde escribe la mayoría.
  return /^3\d{9}$/.test(limpio)
}
