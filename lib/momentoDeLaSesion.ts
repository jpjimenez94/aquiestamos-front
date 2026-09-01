/**
 * Si ya es hora de entrar a la sala, o todavía no.
 *
 * El botón de la sala decía «Entrar a la videollamada» a cualquier hora del
 * día. Quien abría su enlace tres horas antes leía una invitación a entrar,
 * entraba, y encontraba una sala vacía. Ahí no hay forma de saber si se
 * equivocó de hora, si el enlace está roto, o si la otra persona no llegó —
 * y esta pantalla la abre alguien que pidió ayuda psicológica: la lectura
 * más fácil es «me dejaron plantada».
 *
 * La puerta sigue abierta a cualquier hora, a propósito: entrar antes para
 * probar cámara y micrófono es justo lo que conviene hacer. Lo que cambia es
 * lo que el botón promete.
 */

/** Desde cuánto antes se considera que ya es la hora. */
export const ANTELACION_SALA_MINUTOS = 10

export type MomentoDeLaSesion = {
  /** `temprano`: falta para la hora acordada. `ahora`: es el momento. */
  clave: 'temprano' | 'ahora'
  /** Cuánto falta, ya en palabras. Solo cuando es `temprano`. */
  faltan: string | null
}

/**
 * Cuánto falta, dicho como lo diría una persona.
 *
 * Sin redondeos que mientan: a falta de 1 h 59 min no dice «2 horas».
 */
export function enCuanto(milisegundos: number): string {
  const minutos = Math.floor(milisegundos / 60000)
  if (minutos < 1) return 'menos de un minuto'

  const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

  if (minutos < 60) return plural(minutos, 'minuto', 'minutos')

  const horas = Math.floor(minutos / 60)
  if (horas < 24) {
    const resto = minutos % 60
    const cabeza = plural(horas, 'hora', 'horas')
    return resto ? `${cabeza} y ${plural(resto, 'minuto', 'minutos')}` : cabeza
  }

  const dias = Math.floor(horas / 24)
  const resto = horas % 24
  const cabeza = plural(dias, 'día', 'días')
  return resto ? `${cabeza} y ${plural(resto, 'hora', 'horas')}` : cabeza
}

export function momentoDeLaSesion({
  inicio,
  ahora = Date.now(),
  antelacionMinutos = ANTELACION_SALA_MINUTOS,
}: {
  inicio: string | Date
  ahora?: number
  antelacionMinutos?: number
}): MomentoDeLaSesion {
  const arranca = new Date(inicio).getTime()

  // Una fecha ilegible no puede convertirse en «todavía no es la hora»: eso
  // le cerraría la puerta, con una razón falsa, a quien sí llegó a tiempo.
  if (!Number.isFinite(arranca)) return { clave: 'ahora', faltan: null }

  const seAbre = arranca - antelacionMinutos * 60000
  if (ahora >= seAbre) return { clave: 'ahora', faltan: null }

  /**
   * Lo que falta se cuenta hasta la hora acordada, no hasta que se abre la
   * puerta. Decir «faltan 50 minutos» para una sesión de las 6:00 cuando son
   * las 5:00 sería contarle a la persona una hora que no es la suya.
   */
  return { clave: 'temprano', faltan: enCuanto(arranca - ahora) }
}
