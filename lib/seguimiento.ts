/**
 * Qué le toca hacer a coordinación con cada persona, hoy.
 *
 * La lista de personas contaba en qué estado está cada una —«En admisión»,
 * «Asignado», la cita si la hay— pero no lo que hay que HACER. Y son cosas
 * distintas: alguien con cita mañana y alguien cuya sesión fue ayer se ven
 * igual en la tabla, cuando lo que se necesita de cada uno es lo contrario.
 *
 * Lo que se pierde por no verlo es siempre lo mismo, y siempre en silencio: la
 * persona a la que nadie le recordó la cita y no apareció; aquella cuya sesión
 * pasó hace una semana y nadie preguntó cómo le fue, ni si quiere seguir con el
 * mismo profesional; la que lleva tres días sin elegir hora y mañana el barrido
 * le suelta el caso.
 *
 * Vive aparte de la pantalla para poder probarlo sin montar React, y porque el
 * día que aparezca otro aviso haya un sitio donde decidir cuándo toca — en vez
 * de añadirlo suelto en una celda.
 */

export type Urgencia = 'ahora' | 'pronto' | 'cuando-puedas'

/**
 * El aviso va en dos piezas y no en una frase.
 *
 * Al principio era un solo texto —«No ha elegido hora · el caso se libera
 * mañana»— y en una columna estrecha se partía en una tira de siete líneas que
 * estiraba la fila entera y desalineaba la tabla.
 *
 * Partido en acción y detalle encaja con el idioma que la tabla ya usa en las
 * demás columnas: el dato arriba y su matiz debajo, en gris. Y se lee mejor,
 * que era el punto: quien mira una lista de veinte personas escanea verbos,
 * no frases.
 */
export type Seguimiento = {
  clave: 'recordar-cita' | 'preguntar-como-fue' | 'sin-elegir-hora' | 'sin-asignar'
  /** El verbo, corto y en una línea: «Preguntar cómo le fue». */
  accion: string
  /** El porqué o el cuándo, en pequeño. Puede faltar. */
  detalle: string | null
  urgencia: Urgencia
}

type Entrada = {
  estadoPersona?: string | null
  estadoAsignacion?: string | null
  /** Días que lleva esperando desde que llegó. */
  diasEsperando?: number
  cita?: { inicio: string | Date; estado?: string | null } | null
  /** Si el profesional ya contó qué pasó con la última sesión. */
  hayReporte?: boolean
  /** Desde cuándo está asignada sin que ella elija hora. */
  asignadaDesde?: string | Date | null
  ahora?: number
}

const HORA = 3600 * 1000
const DIA = 24 * HORA

/** A los 3 días sin elegir hora, el barrido libera el caso. */
const LIBERA_A_LOS_DIAS = 3

/**
 * Devuelve el seguimiento pendiente, o null si no hay ninguno.
 *
 * Solo uno: una tabla con tres avisos por fila no se lee, se ignora. Se elige
 * el más urgente, que casi siempre es también el que caduca antes.
 */
export function seguimientoPendiente({
  estadoPersona,
  estadoAsignacion,
  diasEsperando = 0,
  cita,
  hayReporte = false,
  asignadaDesde,
  ahora = Date.now(),
}: Entrada): Seguimiento | null {
  const cuandoCita = cita ? new Date(cita.inicio).getTime() : null
  const citaViva = cita?.estado === 'PROGRAMADA' || cita?.estado === 'CONFIRMADA'

  /**
   * La sesión ya pasó y nadie contó cómo fue.
   *
   * Va primero porque es el que más tarda en resolverse solo: un recordatorio
   * que se pasa de hora deja de importar al día siguiente, pero una sesión sin
   * seguimiento se queda sin preguntar para siempre. Y es la conversación en la
   * que se decide si sigue con el mismo profesional o si hay que reasignar.
   */
  if (cuandoCita !== null && cuandoCita <= ahora && citaViva && !hayReporte) {
    const dias = Math.floor((ahora - cuandoCita) / DIA)
    return {
      clave: 'preguntar-como-fue',
      accion: 'Preguntar cómo le fue',
      detalle:
        dias >= 1
          ? `la sesión fue hace ${dias} ${dias === 1 ? 'día' : 'días'}`
          : 'la sesión ya pasó',
      urgencia: dias >= 2 ? 'ahora' : 'pronto',
    }
  }

  /**
   * La cita es dentro de poco y conviene recordársela.
   *
   * Un día antes, no una semana: recordar algo que es el mes que viene no
   * ayuda, y quien coordina no puede vivir con veinte avisos abiertos.
   */
  if (cuandoCita !== null && citaViva && cuandoCita > ahora && cuandoCita - ahora <= DIA) {
    const horas = Math.round((cuandoCita - ahora) / HORA)
    return {
      clave: 'recordar-cita',
      accion: 'Recordarle la cita',
      detalle: horas <= 1 ? 'es en menos de una hora' : `es en ${horas} horas`,
      urgencia: horas <= 3 ? 'ahora' : 'pronto',
    }
  }

  /**
   * Asignada y todavía sin elegir hora. Al tercer día el barrido suelta el
   * caso, así que el aviso se enciende antes de que eso pase — no después.
   */
  if (estadoAsignacion === 'ACEPTADA' && asignadaDesde) {
    const dias = Math.floor((ahora - new Date(asignadaDesde).getTime()) / DIA)
    if (dias >= 1) {
      const faltan = LIBERA_A_LOS_DIAS - dias
      return {
        clave: 'sin-elegir-hora',
        accion: 'No ha elegido hora',
        detalle:
          faltan <= 1
            ? 'el caso se libera mañana'
            : `lleva ${dias} ${dias === 1 ? 'día' : 'días'}`,
        urgencia: faltan <= 1 ? 'ahora' : 'pronto',
      }
    }
  }

  /**
   * Admitida y sin nadie que la acompañe. Es el más viejo de los avisos y el
   * que ya cuenta la columna «esperando», pero aquí dice qué hacer y no solo
   * cuánto lleva.
   */
  const sinAsignacionViva =
    estadoAsignacion !== 'PROPUESTA' &&
    estadoAsignacion !== 'ACEPTADA' &&
    estadoAsignacion !== 'ACTIVA'

  if (sinAsignacionViva && estadoPersona !== 'CERRADO' && estadoPersona !== 'NUEVO') {
    return {
      clave: 'sin-asignar',
      accion: 'Asignarle profesional',
      detalle:
        diasEsperando >= 1
          ? `lleva ${diasEsperando} ${diasEsperando === 1 ? 'día' : 'días'}`
          : null,
      urgencia: diasEsperando >= 3 ? 'ahora' : 'cuando-puedas',
    }
  }

  return null
}
