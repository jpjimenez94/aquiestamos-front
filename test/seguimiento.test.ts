import { describe, it, expect } from 'vitest'
import { seguimientoPendiente } from '../lib/seguimiento'

const AHORA = new Date('2026-08-28T15:00:00Z').getTime()
const enHoras = (h: number) => new Date(AHORA + h * 3600000).toISOString()
const enDias = (d: number) => enHoras(d * 24)

/**
 * Lo que le toca hacer a coordinación con cada persona.
 *
 * La tabla contaba el estado, no la tarea. Alguien con cita mañana y alguien
 * cuya sesión fue ayer se veían igual, cuando lo que hay que hacer con cada uno
 * es lo contrario.
 */

describe('la sesión ya pasó', () => {
  it('toca preguntar cómo le fue', () => {
    const s = seguimientoPendiente({
      estadoAsignacion: 'ACTIVA',
      cita: { inicio: enHoras(-3), estado: 'PROGRAMADA' },
      ahora: AHORA,
    })
    expect(s?.clave).toBe('preguntar-como-fue')
  })

  /** Si el profesional ya contó qué pasó, no hay nada que preguntar. */
  it('con el reporte hecho, ya no', () => {
    const s = seguimientoPendiente({
      estadoAsignacion: 'ACTIVA',
      cita: { inicio: enHoras(-3), estado: 'PROGRAMADA' },
      hayReporte: true,
      ahora: AHORA,
    })
    expect(s?.clave).not.toBe('preguntar-como-fue')
  })

  it('a los dos días sin preguntar, es urgente', () => {
    const s = seguimientoPendiente({
      estadoAsignacion: 'ACTIVA',
      cita: { inicio: enDias(-2), estado: 'PROGRAMADA' },
      ahora: AHORA,
    })
    expect(s?.urgencia).toBe('ahora')
    expect(s?.detalle).toContain('2 días')
  })

  /** Una cita cancelada no deja seguimiento pendiente: no hubo sesión. */
  it('una cita cancelada no pide seguimiento', () => {
    const s = seguimientoPendiente({
      estadoAsignacion: 'ACTIVA',
      cita: { inicio: enHoras(-3), estado: 'CANCELADA' },
      ahora: AHORA,
    })
    expect(s?.clave).not.toBe('preguntar-como-fue')
  })
})

describe('la cita está por llegar', () => {
  it('el día antes, toca recordarla', () => {
    const s = seguimientoPendiente({
      estadoAsignacion: 'ACTIVA',
      cita: { inicio: enHoras(6), estado: 'CONFIRMADA' },
      ahora: AHORA,
    })
    expect(s?.clave).toBe('recordar-cita')
    expect(s?.detalle).toContain('6 horas')
  })

  /**
   * Recordar algo que es la semana que viene no ayuda, y quien coordina no
   * puede vivir con veinte avisos abiertos.
   */
  it('una semana antes, todavía no', () => {
    const s = seguimientoPendiente({
      estadoAsignacion: 'ACTIVA',
      cita: { inicio: enDias(7), estado: 'PROGRAMADA' },
      ahora: AHORA,
    })
    expect(s?.clave).not.toBe('recordar-cita')
  })

  it('a menos de una hora, es urgente', () => {
    const s = seguimientoPendiente({
      estadoAsignacion: 'ACTIVA',
      cita: { inicio: enHoras(0.5), estado: 'CONFIRMADA' },
      ahora: AHORA,
    })
    expect(s?.urgencia).toBe('ahora')
  })
})

describe('asignada pero sin elegir hora', () => {
  it('al día siguiente ya avisa', () => {
    const s = seguimientoPendiente({
      estadoAsignacion: 'ACEPTADA',
      asignadaDesde: enDias(-1),
      ahora: AHORA,
    })
    expect(s?.clave).toBe('sin-elegir-hora')
  })

  /**
   * El aviso se enciende ANTES de que el barrido suelte el caso, no después.
   * Avisar de algo que ya ocurrió no es un aviso, es un parte.
   */
  it('la víspera de liberarse, lo dice y es urgente', () => {
    const s = seguimientoPendiente({
      estadoAsignacion: 'ACEPTADA',
      asignadaDesde: enDias(-2),
      ahora: AHORA,
    })
    expect(s?.detalle).toContain('se libera mañana')
    expect(s?.urgencia).toBe('ahora')
  })

  it('el mismo día de asignarla, todavía no molesta', () => {
    const s = seguimientoPendiente({
      estadoAsignacion: 'ACEPTADA',
      asignadaDesde: enHoras(-4),
      ahora: AHORA,
    })
    expect(s?.clave).not.toBe('sin-elegir-hora')
  })
})

describe('sin profesional', () => {
  it('toca asignarle', () => {
    const s = seguimientoPendiente({
      estadoPersona: 'EN_ADMISION',
      diasEsperando: 4,
      ahora: AHORA,
    })
    expect(s?.clave).toBe('sin-asignar')
    expect(s?.urgencia).toBe('ahora')
  })

  it('un caso cerrado ya no pide nada', () => {
    expect(seguimientoPendiente({ estadoPersona: 'CERRADO', ahora: AHORA })).toBeNull()
  })
})

describe('el orden de los avisos', () => {
  /**
   * Solo uno por fila: una tabla con tres avisos en cada línea no se lee, se
   * ignora. Se elige el que caduca antes — y un recordatorio que se pasa de
   * hora deja de importar, pero una sesión sin seguimiento se queda sin
   * preguntar para siempre.
   */
  it('con sesión pasada y otra por venir, gana preguntar cómo fue', () => {
    const s = seguimientoPendiente({
      estadoAsignacion: 'ACTIVA',
      cita: { inicio: enHoras(-5), estado: 'PROGRAMADA' },
      ahora: AHORA,
    })
    expect(s?.clave).toBe('preguntar-como-fue')
  })

  it('nunca devuelve más de un aviso', () => {
    const casos = [
      { estadoAsignacion: 'ACTIVA', cita: { inicio: enHoras(-5), estado: 'PROGRAMADA' } },
      { estadoAsignacion: 'ACTIVA', cita: { inicio: enHoras(2), estado: 'CONFIRMADA' } },
      { estadoAsignacion: 'ACEPTADA', asignadaDesde: enDias(-2) },
      { estadoPersona: 'EN_ADMISION', diasEsperando: 5 },
    ]
    for (const caso of casos) {
      const s = seguimientoPendiente({ ...caso, ahora: AHORA })
      expect(s).not.toBeNull()
      expect(typeof s?.clave).toBe('string')
    }
  })
})

/**
 * Los dos avisos que la ficha necesitaba y la lista no tenía. Antes la ficha
 * usaba su propia regla para decir «siguiente paso»; ahora lee esta, y esta
 * tenía que saber decir «agenda la siguiente o cierra».
 */
describe('después de la sesión', () => {
  const ahora = Date.parse('2026-09-02T20:00:00.000Z')
  const hace = (h: number) => new Date(ahora - h * 3600000).toISOString()

  it('reportada: toca agendar la siguiente o cerrar', () => {
    const s = seguimientoPendiente({
      estadoPersona: 'EN_ACOMPANAMIENTO',
      estadoAsignacion: 'ACTIVA',
      cita: { inicio: hace(30), estado: 'CONFIRMADA' },
      hayReporte: true,
      ahora,
    })
    expect(s?.clave).toBe('agendar-siguiente')
  })

  /**
   * Cerrada sola como REALIZADA por la sala, sin reporte: sigue tocando
   * preguntar. Sin esto, cerrar la cita la sacaba de la lista de tareas.
   */
  it('cerrada sola pero sin reporte: sigue tocando preguntar cómo fue', () => {
    const s = seguimientoPendiente({
      estadoPersona: 'EN_ACOMPANAMIENTO',
      estadoAsignacion: 'ACTIVA',
      cita: { inicio: hace(30), estado: 'REALIZADA' },
      hayReporte: false,
      ahora,
    })
    expect(s?.clave).toBe('preguntar-como-fue')
  })

  it('cancelada o sin presentarse: toca agendar otra', () => {
    for (const estado of ['CANCELADA', 'NO_ASISTIO']) {
      const s = seguimientoPendiente({
        estadoPersona: 'EN_ACOMPANAMIENTO',
        estadoAsignacion: 'ACTIVA',
        cita: { inicio: hace(30), estado },
        ahora,
      })
      expect(s?.clave).toBe('cita-cancelada')
    }
  })

  it('con cita viva por delante y lejos, no hay nada pendiente', () => {
    const s = seguimientoPendiente({
      estadoPersona: 'EN_ACOMPANAMIENTO',
      estadoAsignacion: 'ACTIVA',
      cita: { inicio: hace(-72), estado: 'CONFIRMADA' },
      ahora,
    })
    expect(s).toBeNull()
  })
})
