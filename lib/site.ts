import type { Idioma } from './i18n/idiomas'

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

/** Una cuenta para transferencias. Ver `site.donaciones`. */
export type CuentaBancaria = {
  entidad: string
  /** El logo del banco, en `public/donar/`. */
  logo: string | null
  titular: string
  tipo: string
  numero: string
  /** El NIT del titular, si se quiere enseñar. */
  documento: string | null
}

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
    'Aquí Estamos es una red colaborativa de profesionales y voluntarios comprometidos con el bienestar emocional, el acompañamiento psicosocial y la atención en situaciones de crisis.',
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
  /**
   * El equipo directivo, cada uno con su WhatsApp. Va en «Contáctanos», aparte
   * del WhatsApp de la red, que es por donde escribe quien pide ayuda: no
   * conviene que una cosa tape a la otra. El cargo de cada uno cambia con el
   * idioma y vive en el diccionario (`inicio.equipo`), con el mismo `id`.
   *
   * Aleja tiene número de Chile: se enseña con indicativo también en español.
   */
  equipo: [
    {
      id: 'direccion',
      nombre: 'Paula (Poli) Ramírez',
      whatsappNumber: '573234199846',
      whatsappDisplay: '323 419 9846',
      whatsappInternacional: '+57 323 419 9846',
    },
    {
      id: 'subdireccion',
      nombre: 'Mª Alejandra Alvarez',
      whatsappNumber: '56999458961',
      whatsappDisplay: '+56 9 9945 8961',
      whatsappInternacional: '+56 9 9945 8961',
    },
    {
      id: 'relaciones',
      nombre: 'Daniel Mancera',
      whatsappNumber: '573244588619',
      whatsappDisplay: '324 458 8619',
      whatsappInternacional: '+57 324 458 8619',
    },
  ],
  /**
   * Las donaciones. La campaña de WhyDonate está a nombre de María Ramírez,
   * que es Poli, la fundadora y directora: la página lo dice, para que nadie
   * dude al ver un nombre de persona y no el de la Fundación.
   *
   * El QR y la cuenta se pintan solo cuando están. Mientras sean `null`, la
   * página «Donar» no enseña esas secciones: es mejor que no estén a que
   * aparezcan a medias. El QR y el logo del banco van en `public/donar/`.
   */
  donaciones: {
    whydonate: 'https://whydonate.com/donate/aqui-estamos-por-colombia-ayuda-para-la-emergencia',
    campana: 'https://whydonate.com/fundraising/aqui-estamos-por-colombia-ayuda-para-la-emergencia',
    qr: null as string | null,
    banco: null as CuentaBancaria | null,
  },
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://www.instagram.com/aquiestamos.red',
  instagramHandle: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? '@aquiestamos.red',
} as const

export const whatsappHref = `https://wa.me/${site.whatsappNumber}`

/** Alguien del equipo directivo. */
export type ContactoDelEquipo = (typeof site.equipo)[number]

/** El WhatsApp de alguien del equipo directivo. */
export function whatsappDe(contacto: ContactoDelEquipo): string {
  return `https://wa.me/${contacto.whatsappNumber}`
}

/**
 * El WhatsApp de la red con un mensaje ya escrito, para que quien escribe no
 * tenga que pensar cómo empezar. El mensaje llega en el idioma de la página.
 */
export function whatsappConMensaje(mensaje: string): string {
  return `${whatsappHref}?text=${encodeURIComponent(mensaje)}`
}

/**
 * El menú, en el orden en que se enseña.
 *
 * Los nombres —que están en el diccionario, bajo `nav.enlaces[id]`— dicen qué
 * viene a hacer la persona, no cómo se llama el módulo: «Necesito ayuda» se
 * entiende en crisis; «Atención Psicológica» es lenguaje de quien opera.
 */
/**
 * El video institucional de la portada, por idioma.
 *
 * Por ahora solo hay uno, en inglés (noviembre de 2026), y va solo en la
 * portada en inglés: en las demás sería un video en otro idioma. Va con
 * `preload="none"` y su imagen de portada: no se descarga nada hasta que
 * alguien le da a reproducir, que importa a quien llega desde el celular.
 *
 * El video es texto animado. Ese texto va también escrito debajo, para quien
 * no lo puede ver o usa lector de pantalla. Está en inglés como el video, y
 * por eso vive aquí y no en los diccionarios.
 */
export type VideoDePortada = {
  src: string
  poster: string
  ancho: number
  alto: number
  titulo: string
  leerTexto: string
  transcripcion: readonly string[]
}

export const VIDEO_PORTADA: Partial<Record<Idioma, VideoDePortada>> = {
  en: {
    src: '/videos/aqui-estamos-en.mp4',
    poster: '/videos/aqui-estamos-en.png',
    ancho: 1920,
    alto: 1080,
    titulo: 'Threads of hope, roots of peace: Fundación Red Aquí Estamos (video, 46 seconds)',
    leerTexto: 'Read the words in the video',
    transcripcion: [
      'Threads of hope. Roots of peace.',
      'Across Colombia, we are weaving new connections through psychological support, collective action, and community-led initiatives.',
      'We bring together professionals, organizations, and communities to rebuild the social fabric, strengthen psychosocial well-being, and cultivate cultures of peace rooted in empathy, solidarity, dialogue, and mutual care.',
      'From individual healing to collective transformation, we are creating opportunities for communities to reconnect, grow, and shape more peaceful futures.',
      'Explore our work. Connect with our mission. Know more about Fundación Red Aquí Estamos: www.redaquiestamos.org',
    ],
  },
}

export const ENLACES_NAV = [
  { id: 'serParte', href: '/quiero-ser-parte', cta: false },
  { id: 'apoyar', href: '/quiero-apoyar', cta: false },
  // La puerta para quien está en crisis no puede verse igual que «Recursos»:
  // va como botón relleno, con los tokens de botón que el diseño ya traía.
  { id: 'ayuda', href: '/atencion-psicologica', cta: true },
  { id: 'recursos', href: '/recursos', cta: false },
  { id: 'donar', href: '/donar', cta: false },
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
