/**
 * Textos de autorización de tratamiento de datos.
 *
 * Nunca edites el texto de una versión ya publicada: crea una nueva y súbela a
 * VERSION_ACTUAL. Cada envío guarda la versión que la persona aceptó, y esa es
 * la única forma de probar después qué autorizó exactamente.
 *
 * El backend valida la versión contra `src/consent/versions.js`. Si añades una
 * aquí, añádela también allá.
 */

export const VERSION_CONSENTIMIENTO = '2026-08'

export const RESPONSABLE = {
  nombre: 'Red Aquí Estamos',
  /** Pendiente: el NIT está en gestión. */
  nit: null as string | null,
  /** Pendiente: no hay sede física. */
  direccion: null as string | null,
  /** Provisional hasta que exista un correo dedicado de habeas data. */
  canal: 'WhatsApp +57 313 629 5251',
  canalHref: 'https://wa.me/573136295251',
  retencionMeses: 24,
} as const

export const LINEAS_EMERGENCIA = [
  { nombre: 'Línea de emergencias', numero: '123', href: 'tel:123' },
  { nombre: 'Línea de salud mental', numero: '106', href: 'tel:106' },
] as const

/** Párrafo informativo que va encima de las casillas. */
export const AVISO_TRATAMIENTO = {
  atencion:
    'Red Aquí Estamos es responsable de los datos que nos compartes. Los usamos para contactarte, coordinar tu acompañamiento y llevar el registro interno de la red. Se comparten únicamente con el profesional que te acompañe y con el equipo de coordinación: no los vendemos ni los entregamos a terceros.',
  profesionales:
    'Red Aquí Estamos es responsable de los datos que nos compartes. Los usamos para evaluar tu postulación, coordinar los acompañamientos que asumas y llevar el registro interno de la red. No los vendemos ni los entregamos a terceros.',
  apoyo:
    'Red Aquí Estamos es responsable de los datos que nos compartes. Los usamos para tener un directorio del voluntariado de la red y poder buscarte cuando aparezca una necesidad que encaje con lo que sabes hacer. No los vendemos ni los entregamos a terceros.',
} as const

export const AVISO_DERECHOS =
  'Puedes pedirnos en cualquier momento conocer, actualizar o corregir tus datos, eliminarlos, o retirar esta autorización.'

/** Texto exacto de cada casilla. Lo que se guarda como prueba es la versión. */
export const CASILLAS = {
  datos: 'Autorizo a Red Aquí Estamos a tratar mis datos personales para las finalidades descritas arriba.',

  sensiblesAtencion:
    'Entiendo que solicitar acompañamiento psicológico es un dato sensible de salud, que no estoy obligado ni obligada a entregarlo, y autorizo de forma expresa su tratamiento para poder recibir el acompañamiento.',

  sensiblesProfesional:
    'Entiendo que el dato sobre mi vacunación es un dato de salud, que no estoy obligado ni obligada a entregarlo, y autorizo su tratamiento para las salidas de campo.',

  representante:
    'Soy el padre, la madre o el representante legal de la persona menor de edad que va a recibir el acompañamiento, y autorizo su participación.',

  comunicaciones: 'Quiero recibir información sobre otras actividades y recursos de la red.',
} as const
