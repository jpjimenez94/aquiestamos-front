/**
 * En qué momento está una CITA, para saber qué toca hacer con ella.
 *
 * El paso 5 —preparar la sesión— no es un instante: tiene momentos, y son
 * distintos entre sí.
 *
 *   1. Se agendó          → confirmársela a los dos
 *   2. Falta la firma     → pedirla (casi nunca: ahora se firma al agendar)
 *   3. Se acerca la hora  → recordárselo a los dos
 *
 * La ficha solo conocía el tercero. Preguntaba «¿es hoy?» y con eso no puede
 * distinguir una cita recién agendada para esta noche de una agendada hace dos
 * semanas cuyo día llegó: a la primera todavía no se le ha dicho nada a nadie.
 * La persona elegía su hora y dos minutos después la pantalla decía «La sesión
 * es hoy: recuérdasela a los dos». Recordarle a alguien algo que nunca se le
 * contó no es un recordatorio.
 *
 * Confirmar y recordar son dos actos con dos textos distintos —«quedó
 * agendada, aquí tienes tu enlace» contra «es hoy, nos vemos»— y entre uno y
 * otro puede haber dos semanas.
 *
 * Vive aquí y no dentro de la pantalla para poder probarlo sin montar React, y
 * para que el día que aparezca otro momento haya un sitio donde decidir cuándo
 * toca en vez de añadirlo suelto. Es la misma razón por la que existen
 * `momentoDelCaso` y `seguimientoPendiente`.
 */

const HORA = 3600 * 1000

/**
 * Cuánto dura el momento de confirmar.
 *
 * Es un momento, no un estado: nadie apunta si el WhatsApp se mandó, así que
 * pasado ese rato la tarjeta deja de pedirlo en vez de insistir para siempre
 * sobre algo que no puede comprobar. No se afirma en ningún sitio que se haya
 * confirmado —solo se dice qué hacer ahora—, y los dos mensajes siguen
 * disponibles debajo para cuando haga falta.
 *
 * Doce horas cubre el caso normal: se agenda de noche y quien coordina lo ve
 * a la mañana siguiente.
 */
export const VENTANA_PARA_CONFIRMAR_HORAS = 12

/** A partir de cuándo recordar. Un recordatorio para dentro de una semana no lo es. */
export const VENTANA_PARA_RECORDAR_HORAS = 24

/**
 * Los mismos estados finales que la máquina del backend
 * (`appointmentState.service.js`): desde ellos no sale ninguna transición, y
 * la sesión o ya pasó, o se movió, o no va a ocurrir.
 */
export const CITAS_RESUELTAS = ['REALIZADA', 'NO_ASISTIO', 'CANCELADA', 'REPROGRAMADA'] as const

export type MomentoDeLaCita =
  /** Ya pasó, se movió o no va a ocurrir: no hay nada que preparar. */
  | 'resuelta'
  /** Sin consentimiento no se empieza la sesión. Va primero por eso. */
  | 'falta-firma'
  /** Acaba de agendarse: todavía nadie sabe que esta cita existe. */
  | 'recien-agendada'
  /** Se acerca la hora. */
  | 'recordar'
  /** No dejó correo, así que el WhatsApp no es un extra: es su único aviso. */
  | 'sin-correo'
  | 'nada'

export function momentoDeLaCita({
  estado,
  inicio,
  creadaEn,
  consentimientoFirmado = false,
  puedePedirFirma = true,
  personaTieneCorreo,
  ahora = Date.now(),
}: {
  estado?: string | null
  inicio?: string | Date | null
  creadaEn?: string | Date | null
  consentimientoFirmado?: boolean
  /** Si hay un enlace de firma que mandar. Sin él, pedirla no lleva a ninguna parte. */
  puedePedirFirma?: boolean
  /** Si el sistema pudo avisarle solo. Dar correo es opcional al pedir ayuda. */
  personaTieneCorreo?: boolean
  ahora?: number
}): MomentoDeLaCita {
  if ((CITAS_RESUELTAS as readonly string[]).includes(String(estado ?? ''))) return 'resuelta'

  if (!consentimientoFirmado && puedePedirFirma) return 'falta-firma'

  const arranca = inicio ? new Date(inicio).getTime() : NaN
  const porDelante = Number.isFinite(arranca) && arranca > ahora
  if (!porDelante) return 'nada'

  /**
   * Confirmar va ANTES que recordar aunque la sesión sea esta misma noche.
   * Es el orden en que ocurren las cosas: primero se cuenta que existe, y solo
   * después tiene sentido recordarla. Y si la sesión llega antes de que se
   * acabe la ventana, el recordatorio sencillamente no hace falta: nadie
   * confirma y recuerda con dos horas de diferencia.
   */
  const seAgendo = creadaEn ? new Date(creadaEn).getTime() : NaN
  if (Number.isFinite(seAgendo) && ahora - seAgendo <= VENTANA_PARA_CONFIRMAR_HORAS * HORA) {
    return 'recien-agendada'
  }

  if (arranca - ahora <= VENTANA_PARA_RECORDAR_HORAS * HORA) return 'recordar'

  // Quien no dejó correo no recibió nada, y eso no se arregla solo.
  if (personaTieneCorreo === false) return 'sin-correo'

  return 'nada'
}
