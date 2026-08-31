/**
 * Mañana, tarde o noche, a partir de la hora ya formateada.
 *
 * El backend manda «lunes, 31 de agosto, 6:00 p. m.» y aquí no se vuelve a
 * convertir nada: dos formateadores de hora acaban diciendo dos cosas
 * distintas, y esta es la pantalla donde alguien elige a qué hora se sienta
 * con su psicóloga.
 *
 * Vive fuera de la pantalla para poder probar los bordes —las doce del
 * mediodía y las doce de la noche, que en formato de 12 horas son la misma
 * cifra y momentos opuestos— sin montar React.
 */
export function momentoDelDia(cuando: string): 'Mañana' | 'Tarde' | 'Noche' {
  const i = cuando.lastIndexOf(',')
  const hora = (i < 0 ? cuando : cuando.slice(i + 1)).trim()

  const esPm = /p\.\s?m\./i.test(hora)
  const h = Number(hora.match(/^(\d{1,2})/)?.[1] ?? 0)

  // En formato de 12 horas, «12 p. m.» es mediodía y «12 a. m.» medianoche.
  const hora24 = esPm ? (h === 12 ? 12 : h + 12) : h === 12 ? 0 : h

  if (hora24 < 12) return 'Mañana'
  if (hora24 < 18) return 'Tarde'
  return 'Noche'
}
