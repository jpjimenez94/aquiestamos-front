import { describe, it, expect } from 'vitest'
import {
  cuandoLargo,
  documentoDelInforme,
  resumenDeCierres,
  type InformeSemanal,
} from '../lib/informeSemanal'

/**
 * Los casos cerrados del informe, abiertos por motivo.
 *
 * La operación leyó «se cerró un caso la semana pasada» y buscó un
 * acompañamiento terminado que no existía: era una persona que no quiso
 * empezar. Estas pruebas fijan que el informe lo diga con nombre y motivo, y
 * que «activos» deje de leerse como «atendiendo».
 */

const informe = (cambios: Partial<InformeSemanal> = {}): InformeSemanal => ({
  periodo: { desde: '2026-10-19T05:00:00.000Z', hasta: '2026-10-26T04:59:59.999Z' },
  voluntariado: { registrados: 10, nuevosEnLaSemana: 1, activosEnLaSemana: 3, porcentajeActivos: 30, porArea: [] },
  atenciones: {
    solicitudesRecibidas: 4,
    enAcompanamiento: 12,
    enAdmision: 2,
    nuevas: 1,
    asignadas: 3,
    cerradas: 9,
    citasHistorico: 100,
    citasCanceladasHistorico: 10,
    citasDeLaSemana: 0,
    citasRealizadasEnLaSemana: 0,
    citasMarcadasRealizadas: 0,
    citasPendientesDeCerrar: 0,
    citasCanceladasEnLaSemana: 0,
    citasSinAsistirEnLaSemana: 0,
    citasPorDelante: 0,
  },
  casos: { nuevosEnLaSemana: 2, cerradosEnLaSemana: 1, cerradosPorMotivo: { DESISTIO: 1 }, derivadosRedExterna: null },
  profesionales: {
    activos: 122,
    verificados: 56,
    conSesionesEnLaSemana: 8,
    pausados: 0,
    inactivos: 21,
    pendientesDeValidar: 0,
    conCasosAsignados: 16,
    nuevosEnLaSemana: 0,
    pidieronApoyoEnLaSemana: 0,
  },
  pendientes: { noContestan: [], sinElegirHora: [], sinProfesional: [] },
  citasDeLaSemana: [],
  casosCerradosDeLaSemana: [
    {
      id: 'a1',
      cuando: '2026-10-19T21:36:00.000Z',
      personaId: 'p1',
      persona: 'Persona de prueba',
      profesional: 'Profesional de prueba',
      motivo: 'La persona desistió o ya no lo necesita',
      porQue: 'DESISTIO',
    },
  ],
  ...cambios,
})

describe('los casos cerrados del informe', () => {
  it('dicen en una frase cuántos y por qué', () => {
    expect(resumenDeCierres({ DESISTIO: 1 })).toBe('1 desistió')
    expect(resumenDeCierres({ COMPLETADO: 2, DESISTIO: 1 })).toBe('2 terminaron · 1 desistió')
    expect(resumenDeCierres({})).toBe('')
    expect(resumenDeCierres(undefined)).toBe('')
  })

  it('el documento los trae uno por uno, separados por motivo', () => {
    const html = documentoDelInforme(informe())
    expect(html).toContain('Los casos cerrados, uno por uno')
    expect(html).toContain('Desistieron o ya no lo necesitan · 1')
    expect(html).toContain('Persona de prueba')
  })

  it('y no pinta la sección cuando no hubo cierres', () => {
    const html = documentoDelInforme(
      informe({ casos: { nuevosEnLaSemana: 0, cerradosEnLaSemana: 0, derivadosRedExterna: null }, casosCerradosDeLaSemana: [] }),
    )
    expect(html).not.toContain('Los casos cerrados, uno por uno')
  })
})

describe('los profesionales del informe', () => {
  it('se llaman habilitados, no activos, y traen verificados y con sesiones', () => {
    const html = documentoDelInforme(informe())
    expect(html).toContain('Profesionales habilitados')
    expect(html).not.toContain('Profesionales activos')
    expect(html).toContain('Con tarjeta profesional verificada')
    expect(html).toContain('Dieron al menos una sesión en la semana')
  })
})

describe('las fechas del informe', () => {
  it('llevan el día de la semana, en hora de Bogotá', () => {
    // Lunes 5 de octubre a las 9:00 a. m. en Bogotá.
    expect(cuandoLargo('2026-10-05T14:00:00.000Z')).toMatch(/^lun/)
    // A las 8 de la noche del lunes en Bogotá ya es martes en UTC: sigue siendo lunes.
    expect(cuandoLargo('2026-10-06T01:00:00.000Z')).toMatch(/^lun/)
  })
})
