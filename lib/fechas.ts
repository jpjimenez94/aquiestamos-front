/**
 * Formato de fechas en hora de Bogotá.
 *
 * Vive aparte de `portal.ts` a propósito: aquel importa `next/headers` y solo
 * corre en servidor, mientras que estas funciones las necesitan también los
 * componentes de cliente.
 */

export const ZONA = 'America/Bogota'

export function enBogota(iso: string | Date, conHora = true): string {
  const fecha = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: ZONA,
    dateStyle: 'medium',
    ...(conHora ? { timeStyle: 'short' } : {}),
  }).format(fecha)
}

export function soloHora(iso: string | Date): string {
  const fecha = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: ZONA,
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha)
}

export function diaLargo(iso: string | Date): string {
  const fecha = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: ZONA,
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(fecha)
}

/**
 * La semana del calendario, en Bogotá, sin depender de dónde corra el código.
 *
 * El calendario semanal del portal armaba la semana con `getDay()` y
 * `setHours(0)`, que usan la zona horaria del proceso. En un computador en
 * Colombia todo cuadraba; en Vercel el proceso va en UTC, y el martes 6 a las
 * 00:00 UTC es el lunes 5 a las 7 de la noche en Bogotá: la columna «mar 6»
 * enseñaba las citas del lunes 5, y así toda la semana. Las del domingo no
 * salían en ninguna columna, en la del lunes se colaban las del domingo
 * anterior por la noche, y el día marcado como «hoy» era mañana.
 *
 * Aquí un día es su fecha de calendario como texto (`2026-10-05`) y las cuentas
 * se hacen en UTC, que no tiene horario de verano ni cambia con el servidor.
 * Colombia tampoco cambia de hora: siempre UTC−5.
 */

const FECHA_DE_CALENDARIO = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/

/** La fecha de calendario en Bogotá de un instante, como `AAAA-MM-DD`. */
export function fechaEnBogota(instante: string | Date = new Date()): string {
  const fecha = typeof instante === 'string' ? new Date(instante) : instante
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(fecha)
}

/** ¿Es una fecha `AAAA-MM-DD` que existe? (`2026-02-30` no lo es). */
export function esFechaDeCalendario(texto: string | null | undefined): texto is string {
  if (!texto || !FECHA_DE_CALENDARIO.test(texto)) return false
  const [anio, mes, dia] = texto.split('-').map(Number)
  const fecha = new Date(Date.UTC(anio, mes - 1, dia))
  return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia
}

/** La fecha de calendario `dias` días después (o antes, si es negativo). */
export function sumarDias(fecha: string, dias: number): string {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return new Date(Date.UTC(anio, mes - 1, dia + dias)).toISOString().slice(0, 10)
}

/** El lunes de la semana a la que pertenece esa fecha de calendario. */
export function lunesDeLaSemana(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  const diaDeLaSemana = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay() // 0 = domingo
  return sumarDias(fecha, -((diaDeLaSemana + 6) % 7))
}

/** El instante en que empieza ese día en Bogotá. */
export function inicioDelDiaEnBogota(fecha: string): Date {
  return new Date(`${fecha}T00:00:00-05:00`)
}

/**
 * Lo que necesita una vista semanal: los siete días, de lunes a domingo, y el
 * rango que hay que pedirle al backend —del lunes a las 00:00 al lunes
 * siguiente a las 00:00, en Bogotá—.
 */
export function semanaEnBogota(referencia: string = fechaEnBogota()) {
  const lunes = lunesDeLaSemana(referencia)
  const siguiente = sumarDias(lunes, 7)
  return {
    lunes,
    dias: Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i)),
    desde: inicioDelDiaEnBogota(lunes),
    hasta: inicioDelDiaEnBogota(siguiente),
    anterior: sumarDias(lunes, -7),
    siguiente,
  }
}
