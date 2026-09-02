import { describe, it, expect } from 'vitest'
import { proximaYUltima, siguientePasoDelCaso } from '../lib/pasosDelCaso'

const HORA = 3600000
const ahora = Date.parse('2026-09-02T20:00:00.000Z') // 2 sep, 3 p. m. Bogotá
const en = (h: number) => new Date(ahora + h * HORA).toISOString()
const cuando = (f: string | Date) => `[${new Date(f).toISOString().slice(0, 10)}]`

/**
 * La ficha de Angie: tres citas, la de hoy ya pasó, y el bloque decía
 * «Próxima sesión: 27/08» — la más antigua — y «ya hay cita, haz seguimiento
 * cuando pase». Ni una ni otra eran verdad.
 */
const citasDeAngie = [
  { inicio: en(-6 * 24), estado: 'CONFIRMADA', reportada: true }, // 27/08, con nota
  { inicio: en(-6 * 24), estado: 'CANCELADA' }, // 27/08, con otra profesional
  { inicio: en(-2), estado: 'CONFIRMADA', reportada: false }, // hoy 1 p. m., sin nota
]

describe('próxima y última', () => {
  it('la próxima es la más cercana POR DELANTE y viva; la última, la más reciente ya pasada', () => {
    const citas = [
      { inicio: en(-48), estado: 'CONFIRMADA' },
      { inicio: en(72), estado: 'CONFIRMADA' },
      { inicio: en(24), estado: 'PROGRAMADA' },
      { inicio: en(-2), estado: 'CONFIRMADA' },
    ]
    const { proxima, ultima } = proximaYUltima(citas, ahora)
    expect(proxima?.inicio).toBe(en(24))
    expect(ultima?.inicio).toBe(en(-2))
  })

  it('una cita futura cancelada no es «próxima»', () => {
    const { proxima } = proximaYUltima([{ inicio: en(24), estado: 'CANCELADA' }], ahora)
    expect(proxima).toBeNull()
  })

  /** El fallo exacto: la lista venía de la más antigua a la más nueva. */
  it('no depende del orden en que vengan las citas', () => {
    const asc = proximaYUltima(citasDeAngie, ahora)
    const desc = proximaYUltima([...citasDeAngie].reverse(), ahora)
    expect(asc).toEqual(desc)
    expect(asc.proxima).toBeNull()
    expect(asc.ultima?.inicio).toBe(en(-2))
  })
})

describe('el siguiente paso, con lo que de verdad hay', () => {
  it('con una cita por delante, la nombra', () => {
    const texto = siguientePasoDelCaso({
      estadoAsignacion: 'ACTIVA',
      citas: [{ inicio: en(24), estado: 'CONFIRMADA' }],
      cuando,
      ahora,
    })
    expect(texto).toContain(`Ya hay cita el ${cuando(en(24))}`)
  })

  it('con la sesión de hoy ya pasada y sin nota, pide cerrarla — no dice «ya hay cita»', () => {
    const texto = siguientePasoDelCaso({ estadoAsignacion: 'ACTIVA', citas: citasDeAngie, cuando, ahora })
    expect(texto).toContain('ya pasó y nadie la ha cerrado')
    expect(texto).not.toContain('Ya hay cita')
  })

  it('con la última ya reportada, invita a agendar la siguiente o cerrar', () => {
    const texto = siguientePasoDelCaso({
      estadoAsignacion: 'ACTIVA',
      citas: [{ inicio: en(-48), estado: 'CONFIRMADA', reportada: true }],
      cuando,
      ahora,
    })
    expect(texto).toContain('ya está reportada')
  })

  it('si la última se canceló, lo dice', () => {
    const texto = siguientePasoDelCaso({
      estadoAsignacion: 'ACTIVA',
      citas: [{ inicio: en(-48), estado: 'CANCELADA' }],
      cuando,
      ahora,
    })
    expect(texto).toContain('se canceló')
  })

  it('sin ninguna cita, falta la primera', () => {
    expect(siguientePasoDelCaso({ estadoAsignacion: 'ACTIVA', citas: [], cuando, ahora })).toBe(
      'Falta agendar la primera sesión.',
    )
  })

  it('solo opina sobre asignaciones activas', () => {
    expect(siguientePasoDelCaso({ estadoAsignacion: 'ACEPTADA', citas: [], cuando, ahora })).toBeNull()
  })
})
