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

/**
 * El número tal como lo quiere WhatsApp: solo dígitos, con indicativo de país
 * y sin el `+`. Devuelve null si no se puede saber a qué país llamar.
 *
 * Existe porque la regla "si no empieza por 57, ponle 57" estaba escrita a
 * mano en tres sitios y es falsa: a un número español —34600123456— le pegaba
 * el 57 delante y salía 5734600123456, que es un enlace a ninguna parte. La
 * red ya tiene gente escribiendo desde España, Ecuador y México, así que eso
 * no es un caso raro.
 *
 * Lo que decide es si el número YA trae indicativo:
 *
 *   +34 600 123 456   lo trae explícito     → se respeta
 *   0034600123456     lo trae con prefijo   → se le quita el 00 y se respeta
 *   573001234567      lo trae sin el +      → se respeta
 *   3001234567        celular colombiano    → se le pone 57
 *   601 234 5678      fijo colombiano       → se le pone 57
 *   2345678           fijo sin indicativo   → null, no hay forma de saberlo
 *
 * Devolver null y no un enlace roto es deliberado: un botón que no aparece se
 * nota y se corrige; uno que abre WhatsApp con un número inexistente parece
 * que funcionó y nadie se entera hasta que alguien pregunta por qué esa
 * persona nunca contestó.
 */
export function paraWhatsapp(valor: string | null | undefined): string | null {
  const texto = String(valor ?? '').trim()
  if (!texto) return null

  // El `+` y el `00` son la misma cosa: "lo que sigue lleva indicativo".
  const explicito = texto.startsWith('+') || texto.replace(/[\s()-]/g, '').startsWith('00')

  let digitos = texto.replace(/\D/g, '')
  if (digitos.startsWith('00')) digitos = digitos.slice(2)
  if (!digitos) return null

  // Diez dígitos empezando por 3 es un celular colombiano y nada más: no hay
  // ningún país cuyo indicativo más número dé exactamente esa forma. Se
  // resuelve antes que nada, para rescatar también a quien escribió
  // "+3001234567" creyendo que el + era obligatorio.
  if (/^3\d{9}$/.test(digitos)) return `57${digitos}`

  if (explicito) return digitos

  // Ya venía con el 57 aunque sin el +.
  if (/^57\d{10}$/.test(digitos)) return digitos

  // Fijo colombiano en el formato de diez dígitos (601…, 604…, 605…).
  if (/^60\d{8}$/.test(digitos)) return `57${digitos}`

  // Once dígitos o más sin `+`: lo normal es que sea un indicativo escrito sin
  // el signo. Se respeta en vez de inventarle uno.
  if (digitos.length >= 11) return digitos

  // Corto y sin indicativo: un fijo de siete dígitos, una extensión, un número
  // a medias. No hay forma honesta de completarlo.
  return null
}
