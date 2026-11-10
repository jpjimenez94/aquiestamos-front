/**
 * Los socios estratégicos de la red: la franja de logos de la portada.
 *
 * Los logos los mandó el equipo en una carpeta de Drive (noviembre de 2026),
 * con la nota «faltan algunos, cargar los disponibles». Por eso la lista tiene
 * a todos y la portada enseña solo los que ya tienen logo: cuando llegue uno
 * nuevo, basta con dejarlo en `public/socios/` y escribir aquí su ruta y sus
 * medidas.
 *
 * El enlace va a la página oficial de cada uno. Sin un enlace confirmado, el
 * logo sale sin enlace: mejor eso que mandar a alguien a la página de otra
 * organización con el mismo nombre.
 */
export type Socio = {
  slug: string
  nombre: string
  /** El archivo en `public/socios/`, con sus medidas en píxeles. Null si todavía no llegó. */
  logo: { src: string; ancho: number; alto: number } | null
  url: string | null
  /**
   * Escribir el nombre debajo del logo. Solo para los logos que no lo traen
   * escrito —un ícono suelto no le dice a nadie de quién es—.
   */
  conNombre?: boolean
}

export const SOCIOS: readonly Socio[] = [
  {
    slug: 'phb',
    nombre: 'Psychologische Hochschule Berlin',
    logo: { src: '/socios/phb.png', ancho: 638, alto: 319 },
    url: 'https://www.psychologische-hochschule.de',
  },
  // Sin página encontrada: el manual de marca no trae dirección ni cuenta.
  { slug: 'renacer', nombre: 'Renacer', logo: { src: '/socios/renacer.png', ancho: 639, alto: 236 }, url: null },
  // Por confirmar: instagram.com/victucol («VICTU CARE – Sanidad Emocional»).
  { slug: 'victu', nombre: 'Victu', logo: { src: '/socios/victu.png', ancho: 639, alto: 315 }, url: null },
  // Por confirmar: psicoayuda.app. El logo vino en un PDF hecho con ChatGPT: confirmar que es el suyo.
  { slug: 'psicoayuda', nombre: 'PsicoAyuda', logo: { src: '/socios/psicoayuda.png', ancho: 639, alto: 178 }, url: null },
  {
    slug: 'be2gether',
    nombre: 'be2Gether',
    // Solo el ícono de la app, recortado de una captura: pedirles el archivo original.
    logo: { src: '/socios/be2gether.png', ancho: 244, alto: 243 },
    url: 'https://play.google.com/store/apps/details?id=com.mybe2gether.app',
    conNombre: true,
  },
  // Sin logo todavía. Por confirmar: instagram.com/zentikids.
  { slug: 'zentikids', nombre: 'Zentikids', logo: null, url: null },
  { slug: 'dicha-y-gracia', nombre: 'Dicha & Gracia', logo: null, url: null },
  { slug: 'nodos', nombre: 'Nodos', logo: null, url: null },
  // Sin logo todavía: en su carpeta había una captura de su página de donaciones.
  { slug: 'sin-vendas', nombre: 'Sin Vendas', logo: null, url: 'https://sinvendas.org' },
  { slug: 'corredor-de-sonrisas', nombre: 'Corredor de Sonrisas', logo: null, url: 'https://www.instagram.com/corredordesonrisas' },
]

/** Los que se enseñan: los que ya tienen logo. */
export function sociosConLogo(): (Socio & { logo: NonNullable<Socio['logo']> })[] {
  return SOCIOS.filter((s): s is Socio & { logo: NonNullable<Socio['logo']> } => s.logo !== null)
}
