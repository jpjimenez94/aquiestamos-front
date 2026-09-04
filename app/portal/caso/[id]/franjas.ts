/**
 * Cómo se dicen y se escriben las franjas de una agenda.
 *
 * Vive aparte porque lo necesitan los dos lados: la pantalla del caso, que es
 * de servidor y las pinta, y el editor, que es de cliente y las cambia. Tenerlo
 * en el componente de cliente obligaría al servidor a arrastrar esa frontera
 * para usar dos funciones puras.
 */

export type Franja = {
  weekday: string
  startMinute: number
  endMinute: number
  modality?: string
}

export const DIAS: [string, string][] = [
  ['LUNES', 'Lunes'],
  ['MARTES', 'Martes'],
  ['MIERCOLES', 'Miércoles'],
  ['JUEVES', 'Jueves'],
  ['VIERNES', 'Viernes'],
  ['SABADO', 'Sábado'],
  ['DOMINGO', 'Domingo'],
]

const NOMBRE = Object.fromEntries(DIAS)

/** El orden de la semana, no el del enum ni el de inserción. */
const ORDEN = DIAS.map(([clave]) => clave)

export function nombreDelDia(weekday: string) {
  return NOMBRE[weekday] ?? weekday
}

/** 480 → "08:00", que es lo que entiende un <input type="time">. */
export function aHora(minutos: number) {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function aMinutos(hora: string) {
  const [h, m] = hora.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** 1080 → "6:00 p. m.", como se dice en Colombia. */
export function enPalabras(minutos: number) {
  const h24 = Math.floor(minutos / 60)
  const m = minutos % 60
  const sufijo = h24 < 12 ? 'a. m.' : 'p. m.'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(m).padStart(2, '0')} ${sufijo}`
}

/** De lunes a domingo, agrupando los tramos de un mismo día. */
export function porDia(franjas: Franja[]) {
  const mapa = new Map<string, Franja[]>()
  for (const f of franjas) {
    const lista = mapa.get(f.weekday) ?? []
    lista.push(f)
    mapa.set(f.weekday, lista)
  }
  return ORDEN.filter((d) => mapa.has(d)).map((d) => ({
    weekday: d,
    dia: nombreDelDia(d),
    tramos: (mapa.get(d) ?? []).sort((a, b) => a.startMinute - b.startMinute),
  }))
}
