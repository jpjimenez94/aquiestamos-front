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

  /**
   * Y el 2 no se enciende desde la ficha, a propósito.
   *
   * Existir como ficha ES haber sido admitida. Había una rama que buscaba
   * `EN_REVISION`, que es un estado de SOLICITUD y no de persona: parecía
   * cubrir la admisión y no se cumplía nunca. Se deja fijado para que nadie
   * «arregle» el 2 mapeándolo a un estado que significa otra cosa.
   */
  it('desde la ficha nunca se está en el paso 2: admitir es lo que la creó', () => {
    const desdeLaFicha = ['EN_ADMISION', 'ASIGNADO', 'EN_ACOMPANAMIENTO', 'CERRADO']
    for (const estado of desdeLaFicha) {
      expect(pasoDelCaso({ estadoPersona: estado, ahora: AHORA }).n).not.toBe(2)
    }
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

  /**
   * El caso de Juan Pablo: su única cita se canceló y la ficha seguía en el
   * paso 5, «Preparar la sesión» — no había ninguna sesión que preparar. La
   * tira encendía el 5 por descarte: si no había cita viva por delante ni
   * ninguna con hora ya pasada, se quedaba en el 5.
   *
   * Cancelada la única cita, lo que falta es volver a elegir hora: el 4.
   */
  it('cancelada la única cita: vuelve a «elige su hora», no a «prepara la sesión»', () => {
    expect(
      pasoDelCaso({
        estadoPersona: 'EN_ACOMPANAMIENTO',
        estadoAsignacion: 'ACTIVA',
        citas: [{ startsAt: enHoras(48), status: 'CANCELADA' }],
        ahora: AHORA,
      }).n,
    ).toBe(4)
  })

  /**
   * Y una cancelada cuya hora ya pasó tampoco es una sesión ocurrida. Antes
   * contaba: cualquier cita con hora pasada empujaba al paso 6, y la ficha
   * pedía el reporte de algo que nunca pasó.
   */
  it('una cancelada con hora ya pasada tampoco cuenta como sesión', () => {
    expect(
      pasoDelCaso({
        estadoPersona: 'EN_ACOMPANAMIENTO',
        estadoAsignacion: 'ACTIVA',
        citas: [{ startsAt: enHoras(-48), status: 'CANCELADA' }],
        ahora: AHORA,
      }).n,
    ).toBe(4)
  })

  /**
   * Pero si ya hubo una sesión de verdad y la siguiente se cayó, el caso no
   * retrocede: seis sesiones hechas no se borran porque la séptima se cancele.
   */
  it('con una sesión ya hecha, una cancelada después no lo devuelve al 4', () => {
    expect(
      pasoDelCaso({
        estadoPersona: 'EN_ACOMPANAMIENTO',
        estadoAsignacion: 'ACTIVA',
        citas: [
          { startsAt: enHoras(-72), status: 'REALIZADA' },
          { startsAt: enHoras(48), status: 'CANCELADA' },
        ],
        ahora: AHORA,
      }).n,
    ).toBe(6)
  })

  /** No presentarse sí gasta la hora: la sesión llegó, aunque nadie entrara. */
  it('no asistir cuenta como sesión ocurrida', () => {
    expect(
      pasoDelCaso({
        estadoPersona: 'EN_ACOMPANAMIENTO',
        estadoAsignacion: 'ACTIVA',
        citas: [{ startsAt: enHoras(-2), status: 'NO_ASISTIO' }],
        ahora: AHORA,
      }).n,
    ).toBe(6)
  })

  /** Y una cancelada no tapa la que sí está viva por delante. */
  it('una cancelada no le quita el paso a la que sigue en pie', () => {
    expect(
      pasoDelCaso({
        estadoPersona: 'EN_ACOMPANAMIENTO',
        estadoAsignacion: 'ACTIVA',
        citas: [
          { startsAt: enHoras(24), status: 'CANCELADA' },
          { startsAt: enHoras(48), status: 'CONFIRMADA' },
        ],
        ahora: AHORA,
      }).n,
    ).toBe(5)
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

describe('cuándo se puede decir que la sesión terminó', async () => {
  const { sesionTerminada } = await import('../lib/pasosDelCaso')

  /**
   * El caso reportado: la pantalla anunciaba «Sesión virtual finalizada» con
   * la llamada en curso, porque lo deducía de «hay duración registrada y nadie
   * late ahora mismo». Los latidos no llegaban —otro fallo— pero la inferencia
   * era mala de por sí: un latido que falta puede ser la pestaña de fondo o la
   * red.
   *
   * Es peor que no decir nada: quien coordina lee «finalizada», deja de mirar
   * y cierra el caso mientras las dos personas siguen hablando.
   */
  it('dentro de su horario NO ha terminado, latan o no', () => {
    expect(sesionTerminada({ estado: 'PROGRAMADA', fin: enHoras(1), ahora: AHORA })).toBe(false)
  })

  it('pasada su hora de fin, sí', () => {
    expect(sesionTerminada({ estado: 'PROGRAMADA', fin: enHoras(-1), ahora: AHORA })).toBe(true)
  })

  /** Y si alguien ya la resolvió a mano, se respeta aunque falte para su hora. */
  it('marcada realizada o cancelada, terminó', () => {
    expect(sesionTerminada({ estado: 'REALIZADA', fin: enHoras(1), ahora: AHORA })).toBe(true)
    expect(sesionTerminada({ estado: 'CANCELADA', fin: enHoras(1), ahora: AHORA })).toBe(true)
    expect(sesionTerminada({ estado: 'NO_ASISTIO', fin: enHoras(1), ahora: AHORA })).toBe(true)
  })

  it('sin hora de fin ni estado terminal, no se inventa un final', () => {
    expect(sesionTerminada({ estado: 'PROGRAMADA', ahora: AHORA })).toBe(false)
  })
})
