import { describe, it, expect } from 'vitest'
import { PASOS_DEL_CASO, pasoDelCaso, pasoDeLaCita } from '../lib/pasosDelCaso'

const AHORA = new Date('2026-08-28T15:00:00Z').getTime()
const enHoras = (h: number) => new Date(AHORA + h * 3600000).toISOString()

/**
 * La secuencia que las dos pantallas leen. Si esto se rompe, el agendador
 * vuelve a ver dos numeraciones que no encajan — que es de donde venimos.
 */

describe('los siete pasos', () => {
  it('son siete, numerados en orden y sin huecos', () => {
    expect(PASOS_DEL_CASO).toHaveLength(7)
    PASOS_DEL_CASO.forEach((p, i) => expect(p.n).toBe(i + 1))
  })

  /**
   * La frontera entre pantallas sale de aquí: 5 y 6 se repiten por cada
   * sesión y son de la cita; el resto son del caso. Si alguien mueve un
   * dueño, está moviendo paneles de pantalla — que lo haga sabiéndolo.
   */
  it('la cita es dueña solo de preparar y tener la sesión', () => {
    expect(PASOS_DEL_CASO.filter((p) => p.dueno === 'cita').map((p) => p.n)).toEqual([5, 6])
  })
})

describe('en qué paso está el caso', () => {
  it('sin asignación viva, falta asignar', () => {
    expect(pasoDelCaso({ estadoPersona: 'EN_ADMISION', ahora: AHORA }).n).toBe(3)
    expect(pasoDelCaso({ estadoPersona: 'EN_ADMISION', estadoAsignacion: 'RECHAZADA', ahora: AHORA }).n).toBe(3)
  })

  it('asignado sin cita: falta que elija hora', () => {
    expect(
      pasoDelCaso({ estadoPersona: 'EN_ACOMPANAMIENTO', estadoAsignacion: 'ACEPTADA', ahora: AHORA }).n,
    ).toBe(4)
  })

  it('con la sesión por delante: prepararla', () => {
    expect(
      pasoDelCaso({
        estadoPersona: 'EN_ACOMPANAMIENTO',
        estadoAsignacion: 'ACTIVA',
        citas: [{ startsAt: enHoras(48), status: 'PROGRAMADA' }],
        ahora: AHORA,
      }).n,
    ).toBe(5)
  })

  /**
   * «Ya pasó» se mide con la hora, no con el estado REALIZADA: marcarla
   * realizada es parte del paso 6, y si el paso dependiera de eso, nunca
   * avanzaría solo.
   */
  it('pasada la hora, la sesión — aunque nadie la haya marcado', () => {
    expect(
      pasoDelCaso({
        estadoPersona: 'EN_ACOMPANAMIENTO',
        estadoAsignacion: 'ACTIVA',
        citas: [{ startsAt: enHoras(-2), status: 'PROGRAMADA' }],
        ahora: AHORA,
      }).n,
    ).toBe(6)
  })

  it('cerrado: seguimiento y cierre', () => {
    expect(pasoDelCaso({ estadoPersona: 'CERRADO', ahora: AHORA }).n).toBe(7)
  })

  it('las asignaciones antiguas en PROPUESTA siguen contando como «falta profesional»', () => {
    expect(
      pasoDelCaso({ estadoPersona: 'ASIGNADO', estadoAsignacion: 'PROPUESTA', ahora: AHORA }).n,
    ).toBe(3)
  })
})

describe('en qué paso está una cita', () => {
  it('por delante: prepararla', () => {
    expect(pasoDeLaCita({ inicio: enHoras(24), estado: 'PROGRAMADA', ahora: AHORA }).n).toBe(5)
  })

  it('pasada o resuelta: la sesión', () => {
    expect(pasoDeLaCita({ inicio: enHoras(-1), estado: 'PROGRAMADA', ahora: AHORA }).n).toBe(6)
    expect(pasoDeLaCita({ inicio: enHoras(24), estado: 'CANCELADA', ahora: AHORA }).n).toBe(6)
  })
})
