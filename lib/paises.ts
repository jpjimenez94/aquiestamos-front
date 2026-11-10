import { ETIQUETA, type Idioma } from './i18n/idiomas'

/**
 * Los países que ofrecen los tres formularios del sitio.
 *
 * Los formularios solo preguntaban por municipios de Colombia, y escribía
 * gente de fuera: con teléfono de España o de Venezuela, elegían una ciudad
 * colombiana de la lista porque no había otra cosa. Nadie sabía que esa
 * persona estaba en otro país, con otra hora y sin la posibilidad de una cita
 * presencial.
 *
 * Se guarda el código ISO 3166-1 alfa-2 (CO, ES, MX…) y el nombre se pone al
 * pintar, en el idioma de la página: «España», «Spain», «Espanha», «Espagne»
 * salen del mismo `ES`. Los nombres los da `Intl.DisplayNames`, así que no hay
 * una lista de 240 nombres por idioma que mantener.
 *
 * Están todos los códigos asignados menos los territorios sin población
 * (la Antártida, la isla Bouvet, las islas Heard y McDonald, las islas menores
 * de Estados Unidos, Georgia del Sur y las tierras australes francesas), más
 * Kosovo (XK), que no tiene código oficial pero sí gente.
 */
export const PAISES = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BW', 'BY', 'BZ',
  'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ',
  'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ',
  'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET',
  'FI', 'FJ', 'FK', 'FM', 'FO', 'FR',
  'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GT', 'GU', 'GW', 'GY',
  'HK', 'HN', 'HR', 'HT', 'HU',
  'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT',
  'JE', 'JM', 'JO', 'JP',
  'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ',
  'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY',
  'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ',
  'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ',
  'OM',
  'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY',
  'QA',
  'RE', 'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ',
  'TC', 'TD', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ',
  'UA', 'UG', 'US', 'UY', 'UZ',
  'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU',
  'WF', 'WS',
  'XK',
  'YE', 'YT',
  'ZA', 'ZM', 'ZW',
] as const

export const COLOMBIA = 'CO'

export type OpcionDePais = { codigo: string; nombre: string }

/** ¿Escribe desde fuera de Colombia? «No se sabe» no cuenta como fuera. */
export function esDeFuera(pais: string | null | undefined): boolean {
  return typeof pais === 'string' && /^[A-Z]{2}$/.test(pais) && pais !== COLOMBIA
}

/** El nombre de un país en un idioma; el código tal cual si no se reconoce. */
export function nombreDelPais(codigo: string, idioma: Idioma = 'es'): string {
  try {
    return new Intl.DisplayNames([ETIQUETA[idioma]], { type: 'region' }).of(codigo) ?? codigo
  } catch {
    return codigo
  }
}

/**
 * La lista del desplegable: Colombia arriba y el resto por orden alfabético
 * en el idioma de la página («Estados Unidos» va con la E en español y
 * «United States» con la U en inglés).
 *
 * Se calcula en el servidor y le llega hecha al formulario: si la calculara
 * también el navegador, su versión de los nombres podría no coincidir letra a
 * letra con la del servidor, y React se quejaría al hidratar.
 */
export function opcionesDePais(idioma: Idioma): OpcionDePais[] {
  const nombres = new Intl.DisplayNames([ETIQUETA[idioma]], { type: 'region', fallback: 'code' })
  const orden = new Intl.Collator(ETIQUETA[idioma])
  const nombre = (codigo: string) => nombres.of(codigo) ?? codigo

  const resto = PAISES.filter((codigo) => codigo !== COLOMBIA)
    .map((codigo) => ({ codigo, nombre: nombre(codigo) }))
    .sort((a, b) => orden.compare(a.nombre, b.nombre))

  return [{ codigo: COLOMBIA, nombre: nombre(COLOMBIA) }, ...resto]
}
