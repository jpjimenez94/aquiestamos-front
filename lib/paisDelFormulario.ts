import { esDeFuera, nombreDelPais } from './paises'

/**
 * Desde qué país llenó alguien el formulario del sitio, dicho para el equipo.
 *
 * Como con el idioma (`lib/idiomaDelFormulario.ts`), solo se dice algo cuando
 * hay algo que avisar: que la persona está FUERA de Colombia. Eso cambia la
 * llamada —hay diferencia de hora— y la cita —solo puede ser virtual—.
 * Colombia es lo esperado, y «no se sabe» —todo lo que llegó antes de que el
 * formulario preguntara el país— no es lo mismo que «Colombia»: los dos callan.
 *
 * El backend guarda el código (ES, MX…); el nombre se pone aquí, en español,
 * que es el idioma del portal.
 */

/** «España». Null si es Colombia o si no se sabe. */
export function paisDeFuera(country: string | null | undefined): string | null {
  return esDeFuera(country) ? nombreDelPais(country as string, 'es') : null
}

/** «Desde España», para la etiqueta junto al nombre. Null cuando no hay nada que avisar. */
export function etiquetaDePais(country: string | null | undefined): string | null {
  const pais = paisDeFuera(country)
  return pais ? `Desde ${pais}` : null
}

/** La frase para la ficha, donde cabe lo que implica. */
export function avisoDePais(country: string | null | undefined): string | null {
  const pais = paisDeFuera(country)
  return pais ? `${pais} — solo virtual, y en otra zona horaria` : null
}
