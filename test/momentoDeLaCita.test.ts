import { describe, it, expect } from 'vitest'
import { momentoDeLaCita } from '../lib/momentoDeLaCita'

const AHORA = new Date('2026-09-04T20:00:00Z').getTime() // 4 sep, 3 p. m. Bogotá
const HORA = 3600 * 1000
const en = (h: number) => new Date(AHORA + h * HORA).toISOString()
const hace = (h: number) => new Date(AHORA - h * HORA).toISOString()

/** Una cita normal: firmada, con correo, agendada hace rato. */
const BASE = {
  estado: 'CONFIRMADA',
  consentimientoFirmado: true,
  personaTieneCorreo: true,
  ahora: AHORA,
}

describe('en qué momento está una cita', () => {
  /**
   * El caso reportado. La persona eligió su hora para esta misma noche y, dos
   * minutos después, la ficha decía «La sesión es hoy: recuérdasela a los
   * dos». Recordarle a alguien algo que todavía no se le ha contado no es un
   * recordatorio: primero hay que confirmársela.
   */
  it('recién agendada para esta noche: confirmar, no recordar', () => {
    expect(
      momentoDeLaCita({ ...BASE, inicio: en(4), creadaEn: hace(0.05) }),
    ).toBe('recien-agendada')
  })

  /**
   * Y el caso contrario, que es el que la tarjeta sí acertaba: lleva dos
   * semanas agendada y hoy llegó el día. Eso sí es recordar.
   */
  it('agendada hace dos semanas y la sesión es hoy: recordar', () => {
    expect(momentoDeLaCita({ ...BASE, inicio: en(4), creadaEn: hace(14 * 24) })).toBe('recordar')
  })

  /** La ventana de confirmar es corta: pasado ese rato, toca esperar al día. */
  it('agendada ayer para dentro de una semana: ya no toca nada', () => {
    expect(momentoDeLaCita({ ...BASE, inicio: en(7 * 24), creadaEn: hace(20) })).toBe('nada')
  })

  it('recién agendada para dentro de un mes: también toca confirmar', () => {
    expect(momentoDeLaCita({ ...BASE, inicio: en(30 * 24), creadaEn: hace(1) })).toBe(
      'recien-agendada',
    )
  })

  /**
   * Sin consentimiento no se empieza la sesión, así que eso manda sobre todo
   * lo demás: confirmarle una cita que no se puede hacer es peor que callarse.
   */
  it('sin firma, pedir la firma manda sobre confirmar y sobre recordar', () => {
    expect(
      momentoDeLaCita({ ...BASE, consentimientoFirmado: false, inicio: en(4), creadaEn: hace(0.1) }),
    ).toBe('falta-firma')
    expect(
      momentoDeLaCita({ ...BASE, consentimientoFirmado: false, inicio: en(4), creadaEn: hace(200) }),
    ).toBe('falta-firma')
  })

  /** Pero no se pide una firma que no se puede mandar a ninguna parte. */
  it('sin enlace de firma no se pide la firma', () => {
    expect(
      momentoDeLaCita({
        ...BASE,
        consentimientoFirmado: false,
        puedePedirFirma: false,
        inicio: en(4),
        creadaEn: hace(0.1),
      }),
    ).toBe('recien-agendada')
  })

  /**
   * Una cita resuelta no tiene nada que preparar. Sin esto la tarjeta seguía
   * pidiendo firmas y recordatorios por la hora original de una cita cancelada.
   */
  it.each(['REALIZADA', 'NO_ASISTIO', 'CANCELADA', 'REPROGRAMADA'])(
    'una cita %s no tiene nada que preparar',
    (estado) => {
      expect(momentoDeLaCita({ ...BASE, estado, inicio: en(4), creadaEn: hace(0.1) })).toBe(
        'resuelta',
      )
    },
  )

  /** Su hora ya pasó y nadie la cerró: eso es del paso 6, no de este. */
  it('una sesión cuya hora ya pasó no se prepara', () => {
    expect(momentoDeLaCita({ ...BASE, inicio: hace(2), creadaEn: hace(48) })).toBe('nada')
  })

  /**
   * Quien no dejó correo no recibió nada, y eso no se arregla solo: sigue
   * pendiente después de que se cierre la ventana de confirmar.
   */
  it('sin correo, sigue pendiente confirmársela a mano', () => {
    expect(
      momentoDeLaCita({
        ...BASE,
        personaTieneCorreo: false,
        inicio: en(7 * 24),
        creadaEn: hace(20),
      }),
    ).toBe('sin-correo')
  })

  /** Pero cuando llega el día, el recordatorio manda: lleva lo mismo y urge más. */
  it('sin correo y la sesión es hoy: el recordatorio manda', () => {
    expect(
      momentoDeLaCita({ ...BASE, personaTieneCorreo: false, inicio: en(4), creadaEn: hace(20) }),
    ).toBe('recordar')
  })

  /** Sin fecha de creación no se inventa un momento que no se puede saber. */
  it('sin saber cuándo se agendó, no se supone que sea reciente', () => {
    expect(momentoDeLaCita({ ...BASE, inicio: en(4), creadaEn: null })).toBe('recordar')
  })
})
