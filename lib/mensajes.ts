/**
 * El mensaje que la coordinación le manda al profesional cuando le asigna un
 * acompañamiento.
 *
 * Vive aquí, en un solo sitio, porque lo usan tres caminos distintos: el botón
 * de copiar, el enlace de WhatsApp y —más adelante— el correo. Si el texto se
 * escribiera en cada uno, se irían separando.
 *
 * Decisión importante: el mensaje NO lleva el nombre ni el teléfono de la
 * persona acompañada. Esos datos solo se ven al abrir el enlace y confirmar el
 * correo del profesional. Mandarlos también por WhatsApp los sacaría de esa
 * protección y los dejaría en el historial de dos teléfonos.
 */

const DIA_LARGO: Record<string, string> = {
  LUNES: 'lunes',
  MARTES: 'martes',
  MIERCOLES: 'miércoles',
  JUEVES: 'jueves',
  VIERNES: 'viernes',
  SABADO: 'sábado',
  DOMINGO: 'domingo',
}

const FRANJA_LARGA: Record<string, string> = {
  MANANA: 'en la mañana',
  TARDE: 'en la tarde',
  NOCHE: 'en la noche',
}

const MODALIDAD_LARGA: Record<string, string> = {
  PRESENCIAL: 'presencial',
  VIRTUAL: 'virtual',
  INDIFERENTE: 'presencial o virtual, le da igual',
}

const URGENCIA: Record<string, string> = {
  ALTA: 'Es un caso de prioridad alta: te pedimos buscarla hoy mismo si puedes.',
  MEDIA: 'Te pedimos buscarla en los próximos días.',
  BAJA: 'Puedes buscarla cuando tengas espacio esta semana.',
}

/** "lunes, miércoles y viernes" — con la coma y la "y" donde van. */
function enumerar(partes: string[]): string {
  if (partes.length === 0) return ''
  if (partes.length === 1) return partes[0]
  return `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`
}

export type DatosDelMensaje = {
  profesional: string
  ciudad: string
  prioridad: string
  modalidad: string | null
  dias: string[]
  franjas: string[]
  enlace: string
}

export function mensajeDeAsignacion(d: DatosDelMensaje): string {
  const dias = enumerar(d.dias.map((x) => DIA_LARGO[x] ?? x.toLowerCase()))
  const franjas = enumerar(d.franjas.map((x) => FRANJA_LARGA[x] ?? x.toLowerCase()))
  const modalidad = d.modalidad ? MODALIDAD_LARGA[d.modalidad] ?? d.modalidad.toLowerCase() : null

  const cuando = [dias, franjas].filter(Boolean).join(' ')

  // Solo el nombre de pila: en un saludo, el apellido sobra.
  const nombre = d.profesional.trim().split(/\s+/)[0]

  const lineas = [
    `Hola ${nombre}, gracias por sumarte a Red Aquí Estamos.`,
    '',
    'Te asignamos un acompañamiento.',
    '',
    `· Está en ${d.ciudad}.`,
    modalidad ? `· Prefiere que sea ${modalidad}.` : null,
    cuando ? `· Puede ${cuando}.` : null,
    '',
    'Sus datos de contacto están en este enlace. Entras con el correo con el que te registraste:',
    d.enlace,
    '',
    URGENCIA[d.prioridad] ?? URGENCIA.MEDIA,
    '',
    'Cuando la busques, cuéntanos cómo te fue desde ese mismo enlace: si lograste hablar con ella, si quedaron en una cita y de qué tipo, o si tuviste dificultades para contactarla. Eso es lo que nos permite saber en qué va el caso sin tener que llamarte a preguntar.',
    '',
    'Es un acompañamiento voluntario y confidencial. Te pedimos manejarlo con responsabilidad ética y profesional, y no compartir los datos de la persona con nadie más.',
    '',
    'Gracias por tu tiempo.',
  ]

  return lineas.filter((l) => l !== null).join('\n')
}

/**
 * Enlace que abre WhatsApp con el mensaje ya escrito.
 *
 * Se usa `wa.me` y no la API de WhatsApp Business a propósito: Meta quitó el
 * tramo gratuito en julio de 2025 y desde octubre de 2026 cobra también las
 * plantillas de utilidad. Esto es gratis, no necesita verificación de negocio
 * ni aprobación de plantillas, y lo único que cambia es que alguien tiene que
 * darle a enviar.
 */
export function enlaceWhatsapp(telefono: string, mensaje: string): string {
  // wa.me quiere el número con indicativo y sin nada más. Un celular
  // colombiano de diez dígitos se asume local y se le antepone el 57.
  const limpio = telefono.replace(/\D/g, '')
  const conIndicativo = /^3\d{9}$/.test(limpio) ? `57${limpio}` : limpio

  return `https://wa.me/${conIndicativo}?text=${encodeURIComponent(mensaje)}`
}
