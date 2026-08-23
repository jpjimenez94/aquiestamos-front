/**
 * Contenido estático del sitio (textos tomados del sitio original).
 * Vive aparte de los componentes para que editar una frase no obligue a
 * tocar la vista.
 */

export const site = {
  name: 'Aquí Estamos',
  tagline: 'Red de acompañamiento psicológico y atención en crisis',
  description:
    'Aquí Estamos es una red de profesionales de la salud mental voluntarios que se unen para acercar acompañamiento psicológico, orientación y recursos a personas y comunidades que los necesitan en el marco del terremoto del 10 de agosto de 2026.',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573136295251',
  whatsappDisplay: process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY ?? '313 629 5251',
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://www.instagram.com/aquiestamos.red',
  instagramHandle: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? '@aquiestamos.red',
} as const

export const whatsappHref = `https://wa.me/${site.whatsappNumber}`

/**
 * Los nombres dicen qué viene a hacer la persona, no cómo se llama el módulo:
 * "Necesito ayuda" se entiende en crisis; "Atención Psicológica" es lenguaje
 * de quien opera. La aclaración entre paréntesis sale en el menú desplegable,
 * donde hay espacio; en la barra de escritorio iría apretada.
 */
export const navLinks = [
  {
    href: '/quiero-ser-parte',
    label: 'Quiero dar apoyo psicológico',
    sublabel: '(Graduados o estudiantes de últimos semestres)',
  },
  {
    href: '/quiero-apoyar',
    label: 'Quiero ser voluntario general',
    sublabel: '(Abogados, administrativos, logística, diseño, etc.)',
  },
  {
    href: '/atencion-psicologica',
    label: 'Necesito ayuda',
    sublabel: '(Solicitar apoyo emocional y atención psicológica)',
    // La puerta para quien está en crisis no puede verse igual que "Recursos":
    // va como botón relleno, con los tokens de botón que el diseño ya traía.
    cta: true,
  },
  { href: '/recursos', label: 'Recursos' },
] as const

export const homeCards = [
  {
    href: '/quiero-ser-parte',
    title: 'Quiero dar apoyo psicológico',
    text: 'Para graduados o estudiantes de últimos semestres de psicología que quieran acompañar.',
    image: '/images/card-ser-parte.png',
    icon: 'sun',
  },
  {
    href: '/quiero-apoyar',
    title: 'Quiero ser voluntario general',
    text: 'Abogados, administrativos, logística, diseño y más: súmate desde lo que sabes hacer.',
    image: '/images/card-ser-parte.png',
    icon: 'sun',
  },
  {
    href: '/atencion-psicologica',
    title: 'Necesito ayuda',
    text: 'Solicita apoyo emocional y atención psicológica: te acompañamos.',
    image: '/images/card-atencion.png',
    icon: 'arrow-right-blue',
  },
  {
    href: '/recursos',
    title: 'Recursos para todos',
    text: 'Guías, libros y herramientas para situaciones que requieren apoyo.',
    image: '/images/card-recursos.png',
    icon: 'heart',
  },
] as const
