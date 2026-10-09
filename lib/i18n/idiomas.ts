/**
 * Los idiomas del sitio público y cómo se llega a cada uno.
 *
 * El español NO lleva prefijo: `/atencion-psicologica` es y seguirá siendo la
 * dirección de siempre. Es la que está en los mensajes de WhatsApp que ya se
 * mandaron, en los correos y en lo que Google tiene indexado; moverla a `/es/…`
 * habría roto todo eso para ganar una simetría que no le sirve a nadie.
 *
 * Los demás idiomas cuelgan de su prefijo: `/en/…` y `/pt/…`, con las mismas
 * rutas por dentro. Así cambiar de idioma es cambiar el prefijo y nada más: no
 * hay tabla de equivalencias que mantener ni enlace que pueda quedar huérfano.
 *
 * Solo el sitio público se traduce. El portal y los enlaces con token
 * (tamizaje, consentimiento, agenda, sala…) siguen en español: el
 * acompañamiento se presta en español, y traducir la puerta sin poder
 * atender detrás de ella sería prometer algo que la red no puede cumplir.
 */

export const IDIOMAS = ['es', 'en', 'pt'] as const
export type Idioma = (typeof IDIOMAS)[number]

export const IDIOMA_BASE: Idioma = 'es'

/** Los que viven bajo un prefijo en la URL. */
export const IDIOMAS_CON_PREFIJO = ['en', 'pt'] as const
export type IdiomaConPrefijo = (typeof IDIOMAS_CON_PREFIJO)[number]

/**
 * Lo que va en `lang=""` y en `hreflang`.
 *
 * El portugués es el de Brasil y se dice: un lector de pantalla pronuncia
 * distinto `pt-BR` que `pt-PT`, y a Google le sirve para saber a quién
 * enseñarle la página. En la URL se queda en `/pt` porque es más corto y
 * nadie escribe `/pt-BR` a mano.
 */
export const ETIQUETA: Record<Idioma, string> = {
  es: 'es',
  en: 'en',
  pt: 'pt-BR',
}

/** Para Open Graph, que usa guion bajo y siempre quiere país. */
export const LOCALE_OG: Record<Idioma, string> = {
  es: 'es_CO',
  en: 'en_US',
  pt: 'pt_BR',
}

/** Cada idioma se nombra a sí mismo: quien busca el suyo lo reconoce escrito así. */
export const NOMBRE: Record<Idioma, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
}

/** La sigla del selector, que en la barra no hay sitio para más. */
export const SIGLA: Record<Idioma, string> = {
  es: 'ES',
  en: 'EN',
  pt: 'PT',
}

export function esIdioma(valor: unknown): valor is Idioma {
  return typeof valor === 'string' && (IDIOMAS as readonly string[]).includes(valor)
}

export function esIdiomaConPrefijo(valor: unknown): valor is IdiomaConPrefijo {
  return typeof valor === 'string' && (IDIOMAS_CON_PREFIJO as readonly string[]).includes(valor)
}

/**
 * Las rutas del sitio que existen en todos los idiomas.
 *
 * El selector de idioma la consulta: desde una página que solo existe en
 * español —la confirmación de un turno, por ejemplo— no puede mandar a
 * `/en/turno/…`, que no existe; manda a la portada de ese idioma.
 *
 * Hay una prueba que compara esta lista con las carpetas de `app/`: una página
 * nueva que se añada en español y no aquí (o al revés) la hace fallar.
 */
export const RUTAS_TRADUCIDAS = [
  '/',
  '/atencion-psicologica',
  '/quiero-ser-parte',
  '/quiero-apoyar',
  '/recursos',
  '/politica-de-datos',
  '/consentimiento-informado',
] as const

export type RutaTraducida = (typeof RUTAS_TRADUCIDAS)[number]

/** ¿Existe esta ruta (ya sin prefijo) en los otros idiomas? */
export function estaTraducida(rutaSinPrefijo: string): boolean {
  const limpia = rutaSinPrefijo.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  if ((RUTAS_TRADUCIDAS as readonly string[]).includes(limpia)) return true
  // El detalle de un recurso: `/recursos/<slug>`, un solo nivel.
  return /^\/recursos\/[^/]+$/.test(limpia)
}

/**
 * De qué idioma es una ruta, mirando solo su primer tramo.
 *
 * `/en` y `/en/recursos` son inglés; `/entrar` no lo es aunque empiece igual:
 * se compara el tramo entero, no el principio de la cadena.
 */
export function idiomaDeRuta(pathname: string | null | undefined): Idioma {
  const primero = (pathname ?? '').split('/')[1] ?? ''
  return esIdiomaConPrefijo(primero) ? primero : IDIOMA_BASE
}

/** La misma ruta sin su prefijo de idioma: `/en/recursos` → `/recursos`. */
export function sinPrefijo(pathname: string | null | undefined): string {
  const ruta = pathname || '/'
  const idioma = idiomaDeRuta(ruta)
  if (idioma === IDIOMA_BASE) return ruta
  const resto = ruta.slice(idioma.length + 1)
  if (!resto) return '/'
  return resto.startsWith('/') ? resto : `/${resto}`
}

/**
 * La dirección de una ruta interna en un idioma.
 *
 *   ruta('es', '/recursos')              → '/recursos'
 *   ruta('en', '/recursos')              → '/en/recursos'
 *   ruta('pt', '/')                      → '/pt'
 *   ruta('en', '/#preguntas-frecuentes') → '/en#preguntas-frecuentes'
 *
 * Todo enlace interno del sitio público pasa por aquí. Un `href="/recursos"`
 * escrito a mano dentro de una página en inglés saca a la persona al español
 * sin avisarle, y no falla nada: solo se nota navegando.
 *
 * Lo que no es una ruta del sitio —un `https://…`, un `tel:`, un ancla suelta—
 * se devuelve intacto.
 */
export function ruta(idioma: Idioma, destino: string): string {
  if (!destino.startsWith('/') || destino.startsWith('//')) return destino
  if (idioma === IDIOMA_BASE) return destino

  const corte = destino.search(/[?#]/)
  const camino = corte === -1 ? destino : destino.slice(0, corte)
  const cola = corte === -1 ? '' : destino.slice(corte)

  const limpio = camino === '/' ? '' : camino.replace(/\/+$/, '')
  return `/${idioma}${limpio}${cola}`
}

/**
 * A dónde lleva el selector de idioma desde la página actual.
 *
 * Si la página existe en el otro idioma, a esa misma página; si no, a su
 * portada. Nunca a un 404.
 */
export function equivalente(pathname: string | null | undefined, destino: Idioma): string {
  const actual = sinPrefijo(pathname)
  return ruta(destino, estaTraducida(actual) ? actual : '/')
}

/**
 * Las versiones de una página en cada idioma, como las pide `hreflang`.
 *
 * Es lo que le dice a un buscador «esto mismo existe en inglés aquí», para que
 * a quien busca en inglés le enseñe la versión en inglés y no la española.
 * `x-default` es la que se enseña cuando el idioma de quien busca no es
 * ninguno de los tres: la española, que es la original.
 */
export function alternativas(rutaSinPrefijo: string): Record<string, string> {
  const versiones: Record<string, string> = {}
  for (const idioma of IDIOMAS) versiones[ETIQUETA[idioma]] = ruta(idioma, rutaSinPrefijo)
  versiones['x-default'] = ruta(IDIOMA_BASE, rutaSinPrefijo)
  return versiones
}

/**
 * Rellena `{variables}` en una frase del diccionario.
 *
 * Lo que la frase pide y nadie le pasó se queda a la vista, con sus llaves: un
 * `{nombre}` suelto en pantalla es feo y se corrige; un hueco silencioso se
 * publica y nadie lo ve.
 */
export function rellenar(
  frase: string,
  variables: Record<string, string | number | null | undefined>,
): string {
  return frase.replace(/\{(\w+)\}/g, (completo, clave: string) => {
    const valor = variables[clave]
    return valor === undefined || valor === null ? completo : String(valor)
  })
}

/**
 * El idioma del sitio que más le conviene a alguien, según su navegador.
 *
 * El navegador manda una lista ordenada por preferencia —«pt-BR, pt, en»—. Se
 * recorre en ese orden y se devuelve el primero que el sitio tenga. Solo se
 * mira la lengua, no el país: a quien tiene `en-GB` o `pt-PT` le sirve mejor
 * la versión en inglés o en portugués que la española, aunque no sea
 * exactamente su variante.
 *
 * Devuelve `null` si no hay ninguno, y entonces no se sugiere nada: a quien
 * navega en francés o en alemán no hay por qué empujarlo a ningún sitio.
 */
export function idiomaPreferido(preferencias: readonly string[] | null | undefined): Idioma | null {
  for (const preferencia of preferencias ?? []) {
    const lengua = String(preferencia).toLowerCase().split('-')[0]
    if (esIdioma(lengua)) return lengua
  }
  return null
}

/**
 * Dónde se apunta que la persona ya eligió idioma (o descartó la sugerencia).
 * A partir de ahí no se le vuelve a ofrecer nada: ya contestó.
 */
export const CLAVE_IDIOMA_ELEGIDO = 'ae_idioma_elegido'
