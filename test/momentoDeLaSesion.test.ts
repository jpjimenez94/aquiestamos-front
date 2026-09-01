import { describe, it, expect } from 'vitest'
import {
  momentoDeLaSesion,
  enCuanto,
  ANTELACION_SALA_MINUTOS,
} from '../lib/momentoDeLaSesion'

const MIN = 60000
const HORA = 60 * MIN
const DIA = 24 * HORA

const seisDeLaTarde = new Date('2026-09-02T23:00:00.000Z') // 6:00 p. m. en Bogotá
const inicio = seisDeLaTarde.toISOString()
const en = (ms: number) => momentoDeLaSesion({ inicio, ahora: seisDeLaTarde.getTime() + ms })

describe('cuándo es hora de entrar a la sala', () => {
  it('tres horas antes, todavía no es la hora', () => {
    expect(en(-3 * HORA).clave).toBe('temprano')
  })

  it('a la hora en punto, sí lo es', () => {
    expect(en(0).clave).toBe('ahora')
  })

  /**
   * Llegar antes a probar cámara y micrófono es lo que conviene hacer; que la
   * puerta se abra sola diez minutos antes evita que quien llega puntual lea
   * «todavía no» mientras la otra persona ya está dentro.
   */
  it(`se abre ${ANTELACION_SALA_MINUTOS} minutos antes`, () => {
    expect(en(-ANTELACION_SALA_MINUTOS * MIN).clave).toBe('ahora')
    expect(en(-ANTELACION_SALA_MINUTOS * MIN - 1000).clave).toBe('temprano')
  })

  it('una vez empezada, sigue siendo la hora', () => {
    expect(en(40 * MIN).clave).toBe('ahora')
    expect(en(5 * HORA).clave).toBe('ahora')
  })

  /**
   * Una fecha que no se puede leer no puede convertirse en «todavía no es la
   * hora»: eso le cerraría la puerta, y con una razón falsa, a quien sí llegó
   * a tiempo. Ante la duda, se deja pasar.
   */
  it('con una fecha ilegible deja pasar, no bloquea', () => {
    expect(momentoDeLaSesion({ inicio: 'no es una fecha' }).clave).toBe('ahora')
  })
})

describe('cuánto falta, en palabras', () => {
  it('cuenta hasta la hora acordada, no hasta que se abre la puerta', () => {
    // A la hora del ejemplo son las 5:00 para una sesión de las 6:00.
    expect(en(-1 * HORA).faltan).toBe('1 hora')
  })

  it('no redondea hacia arriba: 1 h 59 no es «2 horas»', () => {
    expect(enCuanto(HORA + 59 * MIN)).toBe('1 hora y 59 minutos')
  })

  it.each([
    [30 * 1000, 'menos de un minuto'],
    [1 * MIN, '1 minuto'],
    [45 * MIN, '45 minutos'],
    [2 * HORA, '2 horas'],
    [2 * HORA + 40 * MIN, '2 horas y 40 minutos'],
    [DIA, '1 día'],
    [2 * DIA + 3 * HORA, '2 días y 3 horas'],
  ])('%i ms → %s', (ms, esperado) => {
    expect(enCuanto(ms)).toBe(esperado)
  })

  it('cuando ya es la hora no dice cuánto falta', () => {
    expect(en(0).faltan).toBeNull()
  })
})
