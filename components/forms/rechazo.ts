import type { Diccionario } from '@/lib/i18n/diccionarios/es'

type Comun = Diccionario['formularios']['comun']

/**
 * Qué enseñarle a la persona cuando el servidor rechaza lo que envió.
 *
 * El servidor contesta en español: dice qué campo no le gustó y por qué
 * («Número de celular no válido»). En la versión en español eso se enseña tal
 * cual, que es lo más preciso que hay.
 *
 * En inglés y portugués esa frase llegaría en un idioma que quien la lee quizá
 * no entiende, pegada debajo de un campo que sí está en el suyo. Ahí se marca
 * el campo con una frase genérica del diccionario («Please check this
 * field.»): dice menos, pero se entiende, y el campo marcado ya indica dónde
 * mirar.
 *
 * Se sabe que es una traducción porque `errorCampo` trae texto; en español
 * viene vacío a propósito.
 */
export function rechazoDelServidor(
  comun: Comun,
  respuesta: unknown,
  porDefecto: string,
): { campos: Record<string, string>; mensaje: string } {
  const cuerpo =
    respuesta && typeof respuesta === 'object' ? (respuesta as Record<string, unknown>) : {}
  const detalles =
    cuerpo.details && typeof cuerpo.details === 'object'
      ? (cuerpo.details as Record<string, unknown>)
      : {}
  const esTraduccion = Boolean(comun.errorCampo)

  const campos: Record<string, string> = {}
  for (const [campo, explicacion] of Object.entries(detalles)) {
    if (esTraduccion) campos[campo] = comun.errorCampo
    else if (typeof explicacion === 'string') campos[campo] = explicacion
  }

  const delServidor = typeof cuerpo.message === 'string' ? cuerpo.message : ''
  const mensaje = esTraduccion
    ? comun.errorServidor || porDefecto
    : delServidor || porDefecto

  return { campos, mensaje }
}

/**
 * El primer paso del formulario en el que hay un campo rechazado.
 *
 * Los tres formularios van por pasos y se envían desde el último. Si el
 * servidor rechaza el celular, que se preguntó en el primero, el campo queda
 * marcado… en una pantalla que la persona ya no está viendo. Lo único que ve
 * es «revisa el formulario», sin saber qué. Con esto el formulario la lleva de
 * vuelta al paso donde está lo que hay que corregir.
 *
 * Devuelve `null` si nada de lo rechazado está en el mapa: lo que no se sabe
 * dónde está no mueve a nadie de sitio.
 */
export function pasoConError<Paso extends number>(
  campos: Record<string, string>,
  pasoDeCadaCampo: Readonly<Record<string, Paso>>,
): Paso | null {
  let primero: Paso | null = null
  for (const campo of Object.keys(campos)) {
    if (!Object.prototype.hasOwnProperty.call(pasoDeCadaCampo, campo)) continue
    const paso = pasoDeCadaCampo[campo]
    if (primero === null || paso < primero) primero = paso
  }
  return primero
}
