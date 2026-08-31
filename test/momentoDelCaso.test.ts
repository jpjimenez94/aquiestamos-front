import { describe, it, expect } from 'vitest'
import { momentoDelCaso } from '../lib/momentoDelCaso'

const AHORA = new Date('2026-08-28T15:00:00Z').getTime()
const enHoras = (h: number) => new Date(AHORA + h * 3600000).toISOString()

describe('qué se le pregunta al profesional, y cuándo', () => {
  /**
   * El caso que lo destapó: recién asignado, la pantalla le preguntaba a la vez
   * si podía tomarlo y cómo le había ido. No ha pasado nada todavía.
   */
  it('recién asignado no se le pregunta qué pasó', () => {
    const m = momentoDelCaso({ puedeDeclinar: true, citas: [], reportes: 0, ahora: AHORA })
    expect(m.reciénAsignado).toBe(true)
    expect(m.tocaReportar).toBe(false)
  })

  it('con la sesión por delante tampoco: todavía no hay nada que contar', () => {
    const m = momentoDelCaso({
      citas: [{ startsAt: enHoras(48), status: 'PROGRAMADA' }],
      ahora: AHORA,
    })
    expect(m.tocaReportar).toBe(false)
    expect(m.proximaCita?.startsAt).toBe(enHoras(48))
  })

  it('pasada la sesión, sí', () => {
    const m = momentoDelCaso({
      citas: [{ startsAt: enHoras(-2), status: 'PROGRAMADA' }],
      ahora: AHORA,
    })
    expect(m.tocaReportar).toBe(true)
    expect(m.proximaCita).toBeNull()
  })

  /** Si ya contó algo, el formulario se queda: puede haber más que contar. */
  it('si ya reportó antes, sigue pudiendo reportar', () => {
    const m = momentoDelCaso({
      citas: [{ startsAt: enHoras(48), status: 'PROGRAMADA' }],
      reportes: 1,
      ahora: AHORA,
    })
    expect(m.tocaReportar).toBe(true)
  })

  /**
   * La red de seguridad. Un caso activo sin cita no debería existir, pero si
   * pasa vale más enseñar el formulario de más que dejar sin voz a quien está
   * intentando avisar de algo.
   */
  it('sin cita ninguna, se le deja hablar', () => {
    expect(momentoDelCaso({ citas: [], ahora: AHORA }).tocaReportar).toBe(true)
  })

  /** Una cita cancelada no es una sesión por delante que esperar. */
  it('una cita cancelada no cuenta como próxima', () => {
    const m = momentoDelCaso({
      citas: [{ startsAt: enHoras(48), status: 'CANCELADA' }],
      ahora: AHORA,
    })
    expect(m.proximaCita).toBeNull()
    expect(m.tocaReportar).toBe(true)
  })

  it('con varias por delante, la más próxima', () => {
    const m = momentoDelCaso({
      citas: [
        { startsAt: enHoras(72), status: 'PROGRAMADA' },
        { startsAt: enHoras(24), status: 'CONFIRMADA' },
      ],
      ahora: AHORA,
    })
    expect(m.proximaCita?.startsAt).toBe(enHoras(24))
  })

  /**
   * El invariante: nunca dos preguntas a la vez.
   *
   * Es lo único que impide volver al problema original, que no fue una etiqueta
   * mal puesta sino dos paneles pintándose juntos.
   *
   * Se comprueba «como mucho una» y no «exactamente una» porque hay un momento
   * en el que la respuesta correcta es no preguntar nada: cuando la sesión ya
   * está puesta y todavía no ha llegado, lo que toca es decirle cuándo es. Esta
   * prueba exigía una pregunta siempre y por eso saltó ahí — la que estaba mal
   * era ella. Un momento que solo informa es un momento bien resuelto.
   */
  it('nunca se le hacen dos preguntas del mismo caso a la vez', () => {
    const casos = [
      { puedeDeclinar: true, citas: [] },
      { citas: [{ startsAt: enHoras(48), status: 'PROGRAMADA' }] },
      { citas: [{ startsAt: enHoras(-2), status: 'PROGRAMADA' }] },
      { citas: [] },
    ]

    for (const caso of casos) {
      const m = momentoDelCaso({ ...caso, ahora: AHORA })
      const preguntas = [m.reciénAsignado, m.tocaReportar].filter(Boolean).length
      expect(preguntas).toBeLessThanOrEqual(1)
    }
  })

  /** Y ningún momento se queda en blanco: o se pregunta, o se informa. */
  it('siempre hay algo que enseñarle', () => {
    const casos = [
      { puedeDeclinar: true, citas: [] },
      { citas: [{ startsAt: enHoras(48), status: 'PROGRAMADA' }] },
      { citas: [{ startsAt: enHoras(-2), status: 'PROGRAMADA' }] },
      { citas: [] },
    ]

    for (const caso of casos) {
      const m = momentoDelCaso({ ...caso, ahora: AHORA })
      expect(m.reciénAsignado || m.tocaReportar || m.proximaCita !== null).toBe(true)
    }
  })
})

describe('el momento del día en la pantalla de agenda', async () => {
  /**
   * Se saca de la hora YA formateada por el backend, que es lo único que
   * llega. Aquí no se vuelve a convertir nada: dos formateadores de hora
   * acaban diciendo dos cosas distintas, y esta pantalla es donde alguien
   * elige a qué hora se sienta con su psicóloga.
   */
  const { momentoDelDia } = await import('../lib/momentoDelDia')

  it('la mañana llega hasta el mediodía', () => {
    expect(momentoDelDia('lunes, 31 de agosto, 8:00 a. m.')).toBe('Mañana')
    expect(momentoDelDia('lunes, 31 de agosto, 11:45 a. m.')).toBe('Mañana')
  })

  it('las 12 del mediodía son tarde, no mañana', () => {
    expect(momentoDelDia('lunes, 31 de agosto, 12:00 p. m.')).toBe('Tarde')
  })

  /** Las 12 de la NOCHE son madrugada: hora 0, no 12. */
  it('las 12 a. m. son madrugada', () => {
    expect(momentoDelDia('lunes, 31 de agosto, 12:30 a. m.')).toBe('Mañana')
  })

  it('a partir de las 6 es noche', () => {
    expect(momentoDelDia('lunes, 31 de agosto, 5:45 p. m.')).toBe('Tarde')
    expect(momentoDelDia('lunes, 31 de agosto, 6:00 p. m.')).toBe('Noche')
    expect(momentoDelDia('lunes, 31 de agosto, 8:15 p. m.')).toBe('Noche')
  })
})
