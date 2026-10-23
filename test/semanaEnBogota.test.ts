import { describe, it, expect, afterEach } from 'vitest'
import {
  esFechaDeCalendario,
  fechaEnBogota,
  inicioDelDiaEnBogota,
  lunesDeLaSemana,
  semanaEnBogota,
  sumarDias,
} from '../lib/fechas'

/**
 * El calendario semanal del portal corría todas las citas un día.
 *
 * La semana se armaba con la zona horaria del proceso, y en Vercel el proceso
 * va en UTC: la columna «mar 6» enseñaba las citas del lunes 5. En local, con
 * el computador en Colombia, no se veía nada raro.
 *
 * Estas pruebas fijan la semana de la queja —del lunes 5 al domingo 11 de
 * octubre de 2026— y la calculan con el proceso en varias zonas: tiene que
 * salir siempre igual.
 */

const ZONA_DEL_PROCESO = process.env.TZ

afterEach(() => {
  if (ZONA_DEL_PROCESO === undefined) delete process.env.TZ
  else process.env.TZ = ZONA_DEL_PROCESO
})

describe('la semana del calendario, en hora de Bogotá', () => {
  it.each(['UTC', 'America/Bogota', 'Asia/Tokyo'])('sale igual con el servidor en %s', (zona) => {
    process.env.TZ = zona
    const semana = semanaEnBogota('2026-10-07')

    expect(semana.dias).toEqual([
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
    ])
    expect(semana.desde.toISOString()).toBe('2026-10-05T05:00:00.000Z')
    expect(semana.hasta.toISOString()).toBe('2026-10-12T05:00:00.000Z')
    expect(semana.anterior).toBe('2026-09-28')
    expect(semana.siguiente).toBe('2026-10-12')
  })

  it('cada cita cae en el día que es en Bogotá, también con el servidor en UTC', () => {
    process.env.TZ = 'UTC'
    // Las de la queja: el lunes 5 a las 9:00 a. m., el miércoles 7 a las
    // 6:00 p. m. y el viernes 9 a las 10:00 a. m.
    expect(fechaEnBogota('2026-10-05T14:00:00.000Z')).toBe('2026-10-05')
    expect(fechaEnBogota('2026-10-07T23:00:00.000Z')).toBe('2026-10-07')
    expect(fechaEnBogota('2026-10-09T15:00:00.000Z')).toBe('2026-10-09')
    // A las 8 de la noche del lunes en Bogotá ya es martes en UTC: sigue siendo lunes.
    expect(fechaEnBogota('2026-10-06T01:00:00.000Z')).toBe('2026-10-05')
  })

  it('el lunes de cualquier día de la semana, el domingo incluido', () => {
    expect(lunesDeLaSemana('2026-10-05')).toBe('2026-10-05')
    expect(lunesDeLaSemana('2026-10-08')).toBe('2026-10-05')
    expect(lunesDeLaSemana('2026-10-11')).toBe('2026-10-05')
    expect(lunesDeLaSemana('2026-10-12')).toBe('2026-10-12')
  })

  it('cruza meses y años sin perder la cuenta', () => {
    expect(sumarDias('2026-10-31', 1)).toBe('2026-11-01')
    expect(sumarDias('2026-03-01', -1)).toBe('2026-02-28')
    expect(sumarDias('2026-12-28', 7)).toBe('2027-01-04')
    expect(lunesDeLaSemana('2027-01-01')).toBe('2026-12-28')
  })

  it('el día empieza a la medianoche de Bogotá', () => {
    expect(inicioDelDiaEnBogota('2026-10-05').toISOString()).toBe('2026-10-05T05:00:00.000Z')
  })

  it('de la dirección solo acepta fechas que existen', () => {
    expect(esFechaDeCalendario('2026-10-05')).toBe(true)
    expect(esFechaDeCalendario('2026-02-30')).toBe(false)
    expect(esFechaDeCalendario('5/10/2026')).toBe(false)
    expect(esFechaDeCalendario('')).toBe(false)
    expect(esFechaDeCalendario(undefined)).toBe(false)
  })
})
