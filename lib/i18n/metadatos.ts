import type { Metadata } from 'next'
import { site } from '../site'
import {
  IDIOMAS,
  IDIOMA_BASE,
  LOCALE_OG,
  alternativas,
  ruta,
  type Idioma,
  type RutaTraducida,
} from './idiomas'
import { diccionario, type Diccionario } from './diccionario'

/**
 * La dirección completa de una ruta del sitio: con dominio, y con el que
 * contesta (ver `site.url`).
 */
export function direccion(camino: string): string {
  return `${site.url}${camino === '/' ? '' : camino}`
}

/**
 * Los metadatos de una página del sitio en un idioma.
 *
 * Dos cosas que hace y que no se ven en pantalla:
 *
 * · `alternates.languages` es el `hreflang`: le dice a un buscador que esta
 *   página existe también en inglés y en portugués, y dónde. Sin eso, a quien
 *   busca en inglés le sale la versión española —o las tres compitiendo entre
 *   sí como si fueran contenido duplicado—.
 *
 * · `canonical` dice cuál es la dirección buena de ESTA versión, para que
 *   `/en/recursos` no se confunda con `/recursos`.
 *
 * Las dos van con el dominio escrito, no relativas: relativas se resolverían
 * contra `metadataBase`, que en Vercel es el dominio sin `www` —el que
 * redirige—.
 *
 * El Open Graph (la tarjeta que sale al pegar el enlace en WhatsApp) solo se
 * escribe en las traducciones. En español no se define, y la página hereda el
 * de la raíz como hasta ahora: esas tarjetas ya están circulando y no hay por
 * qué cambiarlas. En inglés y portugués sí hay que escribirlo entero, porque
 * heredado saldría en español.
 */
export function metadatosDePagina({
  idioma,
  rutaSinPrefijo,
  titulo,
  descripcion,
  tituloAbsoluto = false,
}: {
  idioma: Idioma
  /** La ruta como se escribe en español: `/recursos`, `/`. */
  rutaSinPrefijo: string
  titulo?: string
  descripcion: string
  /** Para la portada: el título va tal cual, sin la coletilla « | Aquí Estamos». */
  tituloAbsoluto?: boolean
}): Metadata {
  const versiones = Object.fromEntries(
    Object.entries(alternativas(rutaSinPrefijo)).map(([etiqueta, camino]) => [
      etiqueta,
      direccion(camino),
    ]),
  )

  const base: Metadata = {
    ...(titulo ? { title: tituloAbsoluto ? { absolute: titulo } : titulo } : {}),
    description: descripcion,
    alternates: {
      canonical: direccion(ruta(idioma, rutaSinPrefijo)),
      languages: versiones,
    },
  }

  if (idioma === IDIOMA_BASE) return base

  return {
    ...base,
    openGraph: {
      title: titulo ? (tituloAbsoluto ? titulo : `${titulo} | ${site.name}`) : site.name,
      description: descripcion,
      type: 'website',
      url: direccion(ruta(idioma, rutaSinPrefijo)),
      siteName: site.name,
      locale: LOCALE_OG[idioma],
      alternateLocale: IDIOMAS.filter((otro) => otro !== idioma).map((otro) => LOCALE_OG[otro]),
      images: ['/images/hero.png'],
    },
  }
}

type Datos = { titulo: string; descripcion: string; tituloAbsoluto?: boolean }

/**
 * De qué parte del diccionario salen el título y la descripción de cada página.
 *
 * Está indexado por `RutaTraducida`: una ruta que se añada a la lista y no
 * aquí no compila, así que no puede existir una página traducida sin título en
 * su idioma.
 */
const DATOS: Record<RutaTraducida, (t: Diccionario) => Datos> = {
  // La portada no lleva la coletilla « | Aquí Estamos»: su título ya es el
  // nombre de la red y su lema.
  '/': (t) => ({
    titulo: `${t.sitio.nombre} | ${t.sitio.lema}`,
    descripcion: t.sitio.descripcion,
    tituloAbsoluto: true,
  }),
  '/atencion-psicologica': (t) => t.atencion.meta,
  '/quiero-ser-parte': (t) => t.serParte.meta,
  '/quiero-apoyar': (t) => t.apoyar.meta,
  '/recursos': (t) => t.recursos.meta,
  '/politica-de-datos': (t) => t.politica.meta,
  '/consentimiento-informado': (t) => t.consentimiento.meta,
}

/** Los metadatos de una de las páginas traducidas, en un idioma. */
export function metadatosDeRuta(idioma: Idioma, rutaSinPrefijo: RutaTraducida): Metadata {
  return metadatosDePagina({
    idioma,
    rutaSinPrefijo,
    ...DATOS[rutaSinPrefijo](diccionario(idioma)),
  })
}
