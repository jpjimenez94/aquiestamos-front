/**
 * Lo que el sitio es, sin lo que el sitio dice.
 *
 * Aquí viven los datos que no cambian con el idioma: el número de WhatsApp, la
 * cuenta de Instagram, a dónde lleva cada enlace del menú y qué imagen lleva
 * cada tarjeta. Las frases —el nombre de cada enlace, el texto de cada
 * tarjeta— están en `lib/i18n/diccionarios`, una vez por idioma.
 *
 * `tagline` y `description` se quedan aquí en español porque son los del
 * documento por defecto (el `<title>` y el Open Graph de la raíz). El
 * diccionario español los toma de aquí; los otros idiomas traen los suyos.
 */

export const site = {
  name: 'Aquí Estamos',
  /**
   * La dirección del sitio, con `www`: es la que responde. `redaquiestamos.org`
   * a secas redirige aquí.
   *
   * Se usa para decirle a los buscadores cuál es la dirección buena de cada
   * página y dónde está su versión en cada idioma (`canonical` y `hreflang`).
   * Esas dos cosas tienen que apuntar a una dirección que conteste, no a una
   * que redirija: una versión en inglés anunciada con una redirección de por
   * medio es una versión que el buscador puede decidir no tener en cuenta.
   */
  url: 'https://www.redaquiestamos.org',
  tagline: 'Red de acompañamiento psicológico y atención en crisis',
  description:
    'Aquí Estamos es una red de profesionales de la salud mental voluntarios que se unen para acercar acompañamiento psicológico, orientación y recursos a personas y comunidades que los necesitan en el marco del terremoto del 10 de agosto de 2026.',
  /**
   * El número oficial vive SOLO aquí, sin variable de entorno a propósito:
   * el mismo dato en dos sitios (código y Vercel) fue exactamente lo que
   * dejó el número viejo en producción cuando se actualizó uno y no el otro.
   * Cambiarlo es editar estas líneas, y el deploy hace el resto.
   */
  whatsappNumber: '573102186299',
  whatsappDisplay: '310 218 6299',
  /**
   * El mismo número como lo marca alguien desde fuera de Colombia. Las
   * versiones en inglés y portugués enseñan este: quien las lee puede estar
   * en otro país, y «310 218 6299» sin indicativo no le sirve para llamar.
   */
  whatsappInternacional: '+57 310 218 6299',
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://www.instagram.com/aquiestamos.red',
  instagramHandle: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? '@aquiestamos.red',
} as const

export const whatsappHref = `https://wa.me/${site.whatsappNumber}`

/**
 * El menú, en el orden en que se enseña.
 *
 * Los nombres —que están en el diccionario, bajo `nav.enlaces[id]`— dicen qué
 * viene a hacer la persona, no cómo se llama el módulo: «Necesito ayuda» se
 * entiende en crisis; «Atención Psicológica» es lenguaje de quien opera.
 */
export const ENLACES_NAV = [
  { id: 'serParte', href: '/quiero-ser-parte', cta: false },
  { id: 'apoyar', href: '/quiero-apoyar', cta: false },
  // La puerta para quien está en crisis no puede verse igual que «Recursos»:
  // va como botón relleno, con los tokens de botón que el diseño ya traía.
  { id: 'ayuda', href: '/atencion-psicologica', cta: true },
  { id: 'recursos', href: '/recursos', cta: false },
] as const

export type IdEnlaceNav = (typeof ENLACES_NAV)[number]['id']

/** Las cuatro puertas de la portada. Su título y su texto, en `inicio.tarjetas[id]`. */
export const TARJETAS_INICIO = [
  { id: 'serParte', href: '/quiero-ser-parte', image: '/images/card-ser-parte.png', icon: 'sun' },
  { id: 'apoyar', href: '/quiero-apoyar', image: '/images/card-ser-parte.png', icon: 'sun' },
  {
    id: 'ayuda',
    href: '/atencion-psicologica',
    image: '/images/card-atencion.png',
    icon: 'arrow-right-blue',
  },
  { id: 'recursos', href: '/recursos', image: '/images/card-recursos.png', icon: 'heart' },
] as const
