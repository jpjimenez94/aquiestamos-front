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
 * Cuánto dura el momento de confirmar en las citas VIEJAS.
 *
 * Era la regla única: nadie apuntaba si el WhatsApp se había mandado, así que
 * pasadas doce horas la tarjeta dejaba de pedirlo. El precio se veía a simple
 * vista — dos citas iguales decían cosas distintas según la hora a la que se
 * miraran, y si nadie abría el portal esa noche el aviso desaparecía sin que
 * nadie hubiera escrito a nadie.
 *
 * Ahora se apunta al mandarlo, así que esto solo gobierna las citas agendadas
 * antes de que empezara el registro.
 */
export const VENTANA_PARA_CONFIRMAR_HORAS = 12

/**
 * Desde cuándo se apunta a quién se le avisó.
 *
 * Las citas de antes no tienen marcas y nunca las van a tener: exigirlas
 * llenaría la agenda de «confírmasela a los dos» sobre sesiones ya confirmadas
 * hace semanas. Para esas sigue mandando el reloj.
 *
 * Es deuda con fecha de caducidad, como la de los enlaces de sala: cuando
 * pasen las citas anteriores a esta fecha, esta constante y la ventana de
 * arriba se van juntas.
 */
export const DESDE_QUE_SE_REGISTRA_EL_AVISO = Date.UTC(2026, 8, 9)

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
  avisadaLaPersona = false,
  avisadoElProfesional = false,
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
  /** Si ya se apuntó que se le contó a cada uno. El hecho, no el reloj. */
  avisadaLaPersona?: boolean
  avisadoElProfesional?: boolean
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
   * después tiene sentido recordarla. Nadie confirma y recuerda con dos horas
   * de diferencia.
   *
   * En las citas nuevas manda el hecho: mientras falte por avisar a alguno, la
   * tarjeta lo sigue pidiendo, sin importar cuánto haya pasado. En las de
   * antes del registro no hay marcas que mirar, así que sigue mandando el
   * reloj — si no, la agenda entera pediría confirmar sesiones ya confirmadas.
   */
  const seAgendo = creadaEn ? new Date(creadaEn).getTime() : NaN
  const seRegistra = Number.isFinite(seAgendo) && seAgendo >= DESDE_QUE_SE_REGISTRA_EL_AVISO

  if (seRegistra) {
    if (!avisadaLaPersona || !avisadoElProfesional) return 'recien-agendada'
  } else if (Number.isFinite(seAgendo) && ahora - seAgendo <= VENTANA_PARA_CONFIRMAR_HORAS * HORA) {
    return 'recien-agendada'
  }

  if (arranca - ahora <= VENTANA_PARA_RECORDAR_HORAS * HORA) return 'recordar'

  // Quien no dejó correo no recibió nada, y eso no se arregla solo.
  if (personaTieneCorreo === false) return 'sin-correo'

  return 'nada'
}
