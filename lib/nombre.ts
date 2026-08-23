/**
 * Cómo se escribe el nombre de una persona cuando se le enseña a alguien.
 *
 * El formulario público lo recibe tal como lo teclea quien está pidiendo
 * ayuda, muchas veces desde el teléfono y sin mayúsculas. Eso está bien: no es
 * momento de pelearle a nadie por el shift. Pero después ese texto crudo sale
 * en un titular del portal —"juan pablo"— y en el saludo de un WhatsApp
 * —"Hola juan"—, y ahí ya no parece un descuido de quien escribió sino
 * descuido de la red.
 *
 * Se arregla al MOSTRAR, no al guardar: lo que la persona escribió se conserva
 * intacto en la base. Si mañana resulta que alguien firma en minúsculas a
 * propósito, se cambia esta función y no hay que reparar datos.
 */

/** Partículas que van en minúscula salvo que abran el nombre. */
const CONECTORES = new Set([
  'de', 'del', 'la', 'las', 'lo', 'los', 'y', 'e',
  'da', 'das', 'do', 'dos', 'di', 'van', 'von', 'der', 'den', 'du',
])

function capitalizar(palabra: string): string {
  /**
   * "McKinley", "DiCaprio" o "LaTorre" llevan la mayúscula adentro porque
   * alguien la puso a propósito: no se tocan. "JUAN" no es una decisión, es un
   * bloq mayús, y ese sí se arregla.
   */
  const mayusculaInterior = /\p{Lu}/u.test(palabra.slice(1))
  const todoMayusculas = palabra === palabra.toLocaleUpperCase('es')
  if (mayusculaInterior && !todoMayusculas) return palabra

  // Después de un guion o un apóstrofo empieza nombre otra vez:
  // "ana-maría" y "o'connor".
  return palabra
    .toLocaleLowerCase('es')
    .replace(/(^|[-'’])(\p{Ll})/gu, (_, separador, letra) => separador + letra.toLocaleUpperCase('es'))
}

/** "juan pablo jiménez de la cruz" → "Juan Pablo Jiménez de la Cruz" */
export function nombrePropio(valor: string | null | undefined): string {
  if (!valor) return ''

  return valor
    .trim()
    .split(/\s+/)
    .map((palabra, i) =>
      i > 0 && CONECTORES.has(palabra.toLocaleLowerCase('es'))
        ? palabra.toLocaleLowerCase('es')
        : capitalizar(palabra),
    )
    .join(' ')
}

/** Solo el nombre de pila, ya escrito como se debe: para saludar. */
export function nombreDePila(valor: string | null | undefined): string {
  return nombrePropio(valor).split(' ')[0] ?? ''
}
