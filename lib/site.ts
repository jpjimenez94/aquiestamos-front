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
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573234199846',
  whatsappDisplay: process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY ?? '3234199846',
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://www.instagram.com/aquiestamos.red',
  instagramHandle: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? '@aquiestamos.red',
} as const

export const whatsappHref = `https://wa.me/${site.whatsappNumber}`

export const navLinks = [
  { href: '/quiero-ser-parte', label: 'Quiero ser parte' },
  { href: '/quiero-apoyar', label: 'Quiero apoyar' },
  { href: '/atencion-psicologica', label: 'Atención Psicológica' },
  { href: '/recursos', label: 'Recursos' },
] as const

export const homeCards = [
  {
    href: '/quiero-ser-parte',
    title: 'Quiero ser parte',
    text: 'Haz parte de nuestra red de profesionales y construyamos más posibilidades de acompañamiento.',
    image: '/images/card-ser-parte.png',
    icon: 'sun',
  },
  {
    href: '/quiero-apoyar',
    title: 'Quiero apoyar',
    text: 'Una emergencia no se atiende solo desde la psicología. Súmate desde lo que sabes hacer.',
    image: '/images/card-ser-parte.png',
    icon: 'sun',
  },
  {
    href: '/atencion-psicologica',
    title: 'Atención Psicológica',
    text: 'Encuentra profesionales de la salud mental que te acompañen.',
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
