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

describe('lo que se cuenta de cada paso', async () => {
  const { armarHechos } = await import('../lib/pasosDelCaso')

  it('siempre devuelve siete listas, sepa lo que sepa', () => {
    expect(armarHechos({})).toHaveLength(7)
    expect(armarHechos({}).every((l) => Array.isArray(l))).toBe(true)
  })

  it('cada dato cae en su paso', () => {
    const h = armarHechos({
      recibida: '28/08/2026',
      admision: 'En admisión',
      asignacion: { profesional: 'Sofía Vélez', desde: '28/08/2026' },
      eleccion: { cuando: 'lunes 9:00 a. m.' },
      preparacion: { confirmada: false, consentimiento: false },
      sesion: { cuando: 'lunes 9:00 a. m.', estadoLegible: 'Programada' },
      seguimiento: { reportes: 2, cerrado: false },
    })
    expect(h[0][0]).toContain('28/08/2026')
    expect(h[2][0]).toContain('Sofía Vélez')
    expect(h[3][0]).toContain('lunes')
    // Lo pendiente se dice, no se calla: «sin confirmar» y «pendiente» son
    // información, no ausencia de ella.
    expect(h[4].join(' ')).toMatch(/sin confirmar/i)
    expect(h[4].join(' ')).toMatch(/pendiente/i)
    expect(h[6][0]).toContain('2 reportes')
  })

  it('lo que no se sabe queda como lista vacía, no inventado', () => {
    const h = armarHechos({ eleccion: { cuando: 'lunes' } })
    expect(h[0]).toEqual([])
    expect(h[6]).toEqual([])
  })
})
