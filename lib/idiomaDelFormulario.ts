/**
 * En qué idioma llenó alguien el formulario del sitio, dicho para el equipo.
 *
 * El sitio público existe en español, inglés y portugués, y los tres guardan
 * las respuestas con los mismos valores: en el portal, una solicitud llegada
 * en portugués se veía idéntica a una en español. El backend ahora anota el
 * idioma (`formLocale`: `es`, `en`, `pt`, o nada si no se sabe) y el portal lo
 * enseña.
 *
 * Solo se dice algo cuando fue en OTRO idioma. «En español» es lo esperado, y
 * una etiqueta en cada fila deja de leerse; además, «no se sabe» —todo lo que
 * llegó antes de que el sitio tuviera idiomas— no es lo mismo que «en
 * español», y aquí los dos casos callan igual, que es lo correcto.
 */

const NOMBRES: Record<string, string> = {
  en: 'inglés',
  pt: 'portugués',
}

/** «inglés» o «portugués». Null si fue en español o si no se sabe. */
export function idiomaDistintoDelEspanol(formLocale: string | null | undefined): string | null {
  if (!formLocale) return null
  return Object.prototype.hasOwnProperty.call(NOMBRES, formLocale) ? NOMBRES[formLocale] : null
}

/** «Formulario en inglés». Null cuando no hay nada que avisar. */
export function etiquetaDeIdioma(formLocale: string | null | undefined): string | null {
  const idioma = idiomaDistintoDelEspanol(formLocale)
  return idioma ? `Formulario en ${idioma}` : null
}

/**
 * La frase para la ficha, donde hay sitio para decir qué implica: «Inglés —
 * puede que no hable español».
 *
 * Dice «puede que», no «no habla»: llenar el formulario en inglés solo prueba
 * que lo prefirió para leer, y mucha gente que vive en Colombia tiene el
 * teléfono en otro idioma. Se confirma hablando con la persona.
 */
export function avisoDeIdioma(formLocale: string | null | undefined): string | null {
  const idioma = idiomaDistintoDelEspanol(formLocale)
  if (!idioma) return null
  return `${idioma.charAt(0).toUpperCase()}${idioma.slice(1)} — puede que no hable español`
}
