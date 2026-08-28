/**
 * Los siete pasos del acompañamiento, en un solo sitio.
 *
 * No existían en ninguna parte. La ficha de la persona numeraba sus mensajes
 * 1·2·3 y el detalle de la cita numeraba los suyos 7·8·9·10 — dos trozos del
 * manual viejo de diez pasos, de antes de que el flujo cambiara. Quien
 * agendaba veía dos numeraciones que no encajaban y ningún sitio donde mirar
 * el camino completo: los pasos 4, 5 y 6 no estaban escritos en ninguna
 * pantalla.
 *
 * Es el mismo patrón que ya costó salas vacías y plantillas que no llegaban:
 * una verdad derivada en dos sitios se separa sola. La secuencia vive aquí y
 * las dos pantallas la leen.
 *
 * La frontera entre pantallas sale de la propia lista: los pasos 5 y 6 se
 * repiten POR CADA SESIÓN y son del detalle de la cita; el resto son del caso
 * y viven en la ficha de la persona.
 */

export type PasoDelCaso = {
  n: 1 | 2 | 3 | 4 | 5 | 6 | 7
  titulo: string
  /** Qué pantalla es dueña del paso. La otra enlaza, no repite. */
  dueno: 'solicitudes' | 'ficha' | 'cita'
}

export const PASOS_DEL_CASO: readonly PasoDelCaso[] = [
  { n: 1, titulo: 'Llega la solicitud', dueno: 'solicitudes' },
  { n: 2, titulo: 'Admisión', dueno: 'solicitudes' },
  { n: 3, titulo: 'Asignar profesional', dueno: 'ficha' },
  { n: 4, titulo: 'Elige su hora', dueno: 'ficha' },
  { n: 5, titulo: 'Preparar la sesión', dueno: 'cita' },
  { n: 6, titulo: 'La sesión', dueno: 'cita' },
  { n: 7, titulo: 'Seguimiento y cierre', dueno: 'ficha' },
] as const

/**
 * En qué paso está un CASO, mirando lo que la ficha ya sabe.
 *
 * `citas` son las de la asignación viva. La regla de «ya pasó» usa la hora y
 * no el estado REALIZADA, porque marcar la cita realizada es justo parte del
 * paso 6: si dependiera de eso, el paso nunca avanzaría solo.
 */
export function pasoDelCaso({
  estadoPersona,
  estadoAsignacion,
  citas = [],
  ahora = Date.now(),
}: {
  estadoPersona?: string | null
  estadoAsignacion?: string | null
  citas?: { startsAt: string | Date; status?: string | null }[]
  ahora?: number
}): PasoDelCaso {
  const paso = (n: PasoDelCaso['n']) => PASOS_DEL_CASO[n - 1]

  if (estadoPersona === 'NUEVO') return paso(1)
  if (estadoPersona === 'EN_REVISION') return paso(2)

  // Cerrado o sin asignación viva tras haberla tenido: lo que queda es el
  // cierre — encuesta, reporte final, o volver a asignar desde la ficha.
  if (estadoPersona === 'CERRADO') return paso(7)

  const viva = estadoAsignacion === 'PROPUESTA' || estadoAsignacion === 'ACEPTADA' || estadoAsignacion === 'ACTIVA'
  if (!viva) return paso(3)

  // PROPUESTA es de asignaciones antiguas, pero sigue siendo «falta profesional firme».
  if (estadoAsignacion === 'PROPUESTA' || estadoAsignacion === 'ACEPTADA') {
    return estadoAsignacion === 'PROPUESTA' ? paso(3) : paso(4)
  }

  // ACTIVA: hay cita. ¿Está por delante, o ya pasó?
  const vivasPorDelante = citas.some(
    (c) =>
      new Date(c.startsAt).getTime() > ahora &&
      (c.status === 'PROGRAMADA' || c.status === 'CONFIRMADA'),
  )
  if (vivasPorDelante) return paso(5)

  const algunaPaso = citas.some((c) => new Date(c.startsAt).getTime() <= ahora)
  return algunaPaso ? paso(6) : paso(5)
}

/**
 * En qué paso está una CITA concreta. Más simple que el del caso: una sesión
 * solo vive entre prepararse (5) y ocurrir (6); lo demás es del caso.
 */
export function pasoDeLaCita({
  inicio,
  estado,
  ahora = Date.now(),
}: {
  inicio: string | Date
  estado?: string | null
  ahora?: number
}): PasoDelCaso {
  const yaPaso = new Date(inicio).getTime() <= ahora
  const terminada = estado === 'REALIZADA' || estado === 'NO_ASISTIO' || estado === 'CANCELADA'
  return PASOS_DEL_CASO[(yaPaso || terminada ? 6 : 5) - 1]
}
