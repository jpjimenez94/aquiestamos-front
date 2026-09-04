import { describe, it, expect } from 'vitest'
import { proximaYUltima } from '../lib/pasosDelCaso'

const HORA = 3600000
const ahora = Date.parse('2026-09-02T20:00:00.000Z') // 2 sep, 3 p. m. Bogotá
const en = (h: number) => new Date(ahora + h * HORA).toISOString()

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

  /**
   * Pero alguien tiene que verla. La de Juan Pablo se canceló con su hora
   * todavía por delante: no era «próxima» —no está viva— ni «última» —no ha
   * pasado—, así que la ficha calculaba con cita nula y decía «nada
   * pendiente» con el caso esperando que le agendaran otra.
   */
  it('una cita cancelada que aún no llega es «caída», para que no la pierda nadie', () => {
    const { proxima, ultima, caida } = proximaYUltima(
      [{ inicio: en(24), estado: 'CANCELADA' }],
      ahora,
    )
    expect(proxima).toBeNull()
    expect(ultima).toBeNull()
    expect(caida?.inicio).toBe(en(24))
  })

  it('la caída es la más reciente de las que se cayeron', () => {
    const { caida } = proximaYUltima(
      [
        { inicio: en(-72), estado: 'CANCELADA' },
        { inicio: en(-2), estado: 'NO_ASISTIO' },
      ],
      ahora,
    )
    expect(caida?.inicio).toBe(en(-2))
  })

  /** Sin ninguna que se haya caído, no se inventa una. */
  it('sin citas caídas, «caida» es nula', () => {
    const { caida } = proximaYUltima([{ inicio: en(24), estado: 'CONFIRMADA' }], ahora)
    expect(caida).toBeNull()
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
