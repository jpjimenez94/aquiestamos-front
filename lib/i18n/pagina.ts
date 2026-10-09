import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { esIdiomaConPrefijo, type IdiomaConPrefijo, type RutaTraducida } from './idiomas'
import { metadatosDeRuta } from './metadatos'

/** Lo que recibe toda página de `app/[lang]/…`. */
export type ParametrosDeIdioma = Promise<{ lang: string }>

/**
 * El idioma de una página de `app/[lang]/…`, ya comprobado.
 *
 * `[lang]` es un tramo dinámico en la raíz, así que Next le manda cualquier
 * cosa que no sea otra ruta: `/en` y `/pt`, pero también `/foo`, `/wp-admin` o
 * `/favicon.ico`. Todo lo que no sea un idioma del sitio es un 404, y se
 * decide aquí para que ninguna página se olvide de preguntarlo.
 *
 * El español NO pasa por aquí: sus páginas viven en `app/(sitio)/…`, sin
 * prefijo. Por eso `/es` también es un 404 —la dirección de la portada en
 * español es `/`, y no conviene que exista dos veces—.
 */
export async function idiomaDeLaRuta(params: ParametrosDeIdioma): Promise<IdiomaConPrefijo> {
  const { lang } = await params
  if (!esIdiomaConPrefijo(lang)) notFound()
  return lang
}

/**
 * El `generateMetadata` de una página traducida.
 *
 * Con un idioma que no existe no hay nada que anunciar: la página va a ser un
 * 404, y de eso se encarga `idiomaDeLaRuta` al pintarla.
 */
export async function metadatosDeLaRuta(
  params: ParametrosDeIdioma,
  rutaSinPrefijo: RutaTraducida,
): Promise<Metadata> {
  const { lang } = await params
  return esIdiomaConPrefijo(lang) ? metadatosDeRuta(lang, rutaSinPrefijo) : {}
}
