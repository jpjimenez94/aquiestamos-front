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

/**
 * Desde que se apunta a quién se le avisó, manda el hecho y no el reloj.
 *
 * Byron abrió tres citas iguales —confirmadas, firmadas, con correo— y la
 * ficha decía cosas distintas en cada una: la diferencia era cuántas horas
 * llevaban agendadas. Con doce horas de ventana, quien mandaba el WhatsApp a
 * los cinco minutos seguía viendo «confírmasela» media jornada, y la cita que
 * nadie miró esa noche dejaba de pedirlo sin que nadie hubiera escrito a
 * nadie.
 *
 * Las citas de antes del registro se quedan con el reloj: no tienen marcas ni
 * las van a tener, y exigirlas llenaría la agenda de avisos sobre sesiones
 * confirmadas hace semanas.
 */
describe('con el aviso ya registrado', () => {
  // Después del corte: estas citas sí llevan marcas.
  const AHORA_NUEVO = new Date('2026-09-20T15:00:00Z').getTime()
  const enN = (h: number) => new Date(AHORA_NUEVO + h * HORA).toISOString()
  const haceN = (h: number) => new Date(AHORA_NUEVO - h * HORA).toISOString()
  const NUEVA = { ...BASE, ahora: AHORA_NUEVO }

  it('sin avisar a ninguno, lo sigue pidiendo por vieja que sea', () => {
    expect(
      momentoDeLaCita({ ...NUEVA, inicio: enN(7 * 24), creadaEn: haceN(3 * 24) }),
    ).toBe('recien-agendada')
  })

  it('avisada solo a la persona, sigue faltando el profesional', () => {
    expect(
      momentoDeLaCita({
        ...NUEVA,
        inicio: enN(7 * 24),
        creadaEn: haceN(3 * 24),
        avisadaLaPersona: true,
      }),
    ).toBe('recien-agendada')
  })

  it('avisados los dos, la tarjeta se calla', () => {
    expect(
      momentoDeLaCita({
        ...NUEVA,
        inicio: enN(7 * 24),
        creadaEn: haceN(3 * 24),
        avisadaLaPersona: true,
        avisadoElProfesional: true,
      }),
    ).toBe('nada')
  })

  /** Y cuando llega el día, lo que toca ya es recordar. */
  it('avisados los dos y la sesión es hoy: recordar', () => {
    expect(
      momentoDeLaCita({
        ...NUEVA,
        inicio: enN(5),
        creadaEn: haceN(3 * 24),
        avisadaLaPersona: true,
        avisadoElProfesional: true,
      }),
    ).toBe('recordar')
  })

  /**
   * Confirmar sigue yendo antes que recordar: si no se le ha contado que
   * existe, recordársela no es recordar nada.
   */
  it('sin avisar y la sesión es hoy: primero confirmar', () => {
    expect(momentoDeLaCita({ ...NUEVA, inicio: enN(5), creadaEn: haceN(3 * 24) })).toBe(
      'recien-agendada',
    )
  })

  /** Las de antes del corte no cambian: siguen con el reloj de doce horas. */
  it('una cita anterior al registro sigue callándose a las doce horas', () => {
    expect(momentoDeLaCita({ ...BASE, inicio: en(7 * 24), creadaEn: hace(20) })).toBe('nada')
  })
})
