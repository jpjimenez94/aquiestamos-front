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

/**
 * Lo que pasó en cada paso, dicho en líneas cortas.
 *
 * La tira dejó de ser solo un mapa: cada paso se puede abrir y cuenta su
 * historia — cuándo llegó la solicitud, a quién se asignó, cuándo eligió su
 * hora. Las dos pantallas alimentan esto con lo que cada una sabe, y lo que
 * una no sabe lo enlaza a la otra en vez de callarlo.
 *
 * Devuelve siete listas de líneas, una por paso. Lista vacía = esta vista no
 * sabe nada de ese paso (que no es lo mismo que «no pasó nada»: el componente
 * decide qué decir según si el paso ya llegó o no).
 */
export type EntradaDeHechos = {
  /** Cuándo llegó la solicitud, ya en palabras. */
  recibida?: string | null
  prioridad?: string | null
  /** Estado legible de la persona, para el paso de admisión. */
  admision?: string | null
  asignacion?: {
    profesional: string
    desde?: string | null
    estadoLegible?: string | null
    motivo?: string | null
  } | null
  /** La hora que la persona eligió (o la próxima sesión agendada). */
  eleccion?: { cuando: string } | null
  preparacion?: { confirmada?: boolean; consentimiento?: boolean } | null
  sesion?: { cuando?: string | null; estadoLegible?: string | null } | null
  seguimiento?: {
    reportes?: number
    notas?: number
    encuestaRespondida?: boolean
    cerrado?: boolean
  } | null
}

export function armarHechos(e: EntradaDeHechos): string[][] {
  const h: string[][] = [[], [], [], [], [], [], []]

  // Las fechas legibles terminan en «p. m.», que ya trae punto: añadir otro a
  // ciegas imprimía «p. m..» en la pantalla.
  const frase = (t: string) => (t.endsWith('.') ? t : t + '.')

  if (e.recibida) h[0].push(frase(`Recibida el ${e.recibida}`))
  if (e.prioridad) h[0].push(frase(`Prioridad: ${e.prioridad}`))

  if (e.admision) h[1].push(frase(`Estado: ${e.admision}`))

  if (e.asignacion) {
    h[2].push(
      frase(
        e.asignacion.desde
          ? `Asignado a ${e.asignacion.profesional} desde el ${e.asignacion.desde}`
          : `Asignado a ${e.asignacion.profesional}`,
      ),
    )
    if (e.asignacion.estadoLegible) h[2].push(frase(e.asignacion.estadoLegible))
    if (e.asignacion.motivo) h[2].push(frase(`Motivo: ${e.asignacion.motivo}`))
  }

  if (e.eleccion) h[3].push(frase(`Eligió: ${e.eleccion.cuando}`))

  if (e.preparacion) {
    h[4].push(e.preparacion.confirmada ? 'Cita confirmada.' : 'Cita sin confirmar todavía.')
    h[4].push(
      e.preparacion.consentimiento
        ? 'Consentimiento informado firmado.'
        : 'Consentimiento informado pendiente.',
    )
  }

  if (e.sesion) {
    if (e.sesion.cuando) h[5].push(frase(`Sesión: ${e.sesion.cuando}`))
    if (e.sesion.estadoLegible) h[5].push(frase(`Estado: ${e.sesion.estadoLegible}`))
  }

  if (e.seguimiento) {
    const s = e.seguimiento
    if (s.reportes) h[6].push(`${s.reportes} ${s.reportes === 1 ? 'reporte' : 'reportes'} del profesional.`)
    if (s.notas) h[6].push(`${s.notas} ${s.notas === 1 ? 'nota' : 'notas'} de seguimiento.`)
    if (s.encuestaRespondida) h[6].push('La persona respondió la encuesta.')
    if (s.cerrado) h[6].push('El caso está cerrado.')
  }

  return h
}

/** Estados en los que una cita ya no va a ocurrir o ya ocurrió. */
export const CITAS_TERMINADAS = ['REALIZADA', 'NO_ASISTIO', 'CANCELADA'] as const

/**
 * Si una sesión virtual ya terminó de verdad.
 *
 * La pantalla lo deducía de «hay duración registrada y nadie late ahora
 * mismo», y anunciaba «Sesión virtual finalizada» con la llamada en curso: si
 * los latidos se pierden un momento —la pestaña de la sala en segundo plano,
 * la red, alguien que sale a abrir la puerta— la ausencia de latido se leía
 * como el final.
 *
 * Es peor que no decir nada. Quien coordina lee «finalizada», deja de mirar y
 * cierra el caso mientras las dos personas siguen hablando.
 *
 * Terminó cuando lo dice el estado de la cita o cuando ya pasó su hora de fin.
 * Lo demás —duración registrada pero sin latidos y todavía dentro de su
 * horario— es «ahora mismo no hay nadie», que no es lo mismo.
 */
export function sesionTerminada({
  estado,
  fin,
  ahora = Date.now(),
}: {
  estado?: string | null
  fin?: string | Date | null
  ahora?: number
}): boolean {
  if (estado && (CITAS_TERMINADAS as readonly string[]).includes(estado)) return true
  return fin ? new Date(fin).getTime() <= ahora : false
}

/**
 * La próxima y la última cita de un caso, con una sola regla.
 *
 * «Próxima sesión» enseñaba la más ANTIGUA abierta, porque la calculaba por su
 * cuenta sobre una lista ordenada al revés de lo que suponía, y una sesión ya
 * pasada que nadie marcó como realizada sigue CONFIRMADA. Próxima es por
 * delante y viva; última, la más reciente ya pasada. Qué toca hacer con ellas
 * lo decide `seguimientoPendiente`, la misma regla que enciende la lista de
 * personas: la ficha y la lista no pueden decir cosas distintas.
 */
export type CitaBreve = {
  inicio: string | Date
  estado?: string | null
  /** Si el profesional ya escribió la nota de esa sesión. */
  reportada?: boolean
}

export function proximaYUltima<T extends CitaBreve>(
  citas: T[],
  ahora = Date.now(),
): { proxima: T | null; ultima: T | null } {
  const viva = (c: T) => c.estado === 'PROGRAMADA' || c.estado === 'CONFIRMADA'
  const t = (c: T) => new Date(c.inicio).getTime()
  const futuras = citas.filter((c) => viva(c) && t(c) > ahora).sort((a, b) => t(a) - t(b))
  const pasadas = citas.filter((c) => t(c) <= ahora).sort((a, b) => t(b) - t(a))
  return { proxima: futuras[0] ?? null, ultima: pasadas[0] ?? null }
}


/**
 * Si un reporte con fecha acordada todavía es una invitación válida para
 * agendar, o ya quedó viejo.
 *
 * El botón «Agendar cita acordada del reporte» vivía sin fecha de
 * caducidad: seguía ofreciendo agendar una hora mucho después de que esa
 * hora ya pasara y ya estuviera reservada. Carolina tenía tres reportes —el
 * de en medio ("Quedamos en una cita", con fecha 29/08) seguía ofreciendo esa
 * fecha aunque un reporte MÁS NUEVO ("Otra cosa") ya contara que esa sesión
 * se reprogramó por salud, y aunque la tabla de citas ya tuviera esa hora
 * reservada.
 *
 * Solo vale si es el reporte más reciente de todos —uno viejo no puede
 * competir con lo que se dijo después— y si esa fecha no se agendó ya.
 */
export function citaAcordadaVigente(
  reporte: { id: string; meetsAt?: string | Date | null },
  todosLosReportes: { id: string }[],
  citas: { inicio: string | Date }[],
): boolean {
  if (!reporte.meetsAt) return false
  if (reporte.id !== todosLosReportes[0]?.id) return false

  const t = new Date(reporte.meetsAt).getTime()
  return !citas.some((c) => new Date(c.inicio).getTime() === t)
}
