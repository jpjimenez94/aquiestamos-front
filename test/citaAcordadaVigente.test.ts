import { describe, it, expect } from 'vitest'
import { citaAcordadaVigente } from '../lib/pasosDelCaso'

/**
 * El caso real que lo destapó: Carolina tenía tres reportes.
 *
 *   1. «Quedamos en una cita» (27/08) — dice que quedaron para el 29/08, 8pm.
 *   2. «Otra cosa» (2/09) — cuenta que esa sesión del 29/08 se reprogramó
 *      por salud, sin decir para cuándo.
 *
 * El botón «Agendar cita acordada del reporte (29/08, 8:00 p. m.)» del
 * reporte 1 seguía ofreciéndose después de que el reporte 2 ya contara que
 * esa fecha no aplicaba, y después de que la tabla de citas ya tuviera esa
 * hora reservada. Un clic ahí abría el modal de agendar con una fecha que
 * ya había pasado y ya estaba ocupada.
 */
describe('si una cita acordada en un reporte sigue vigente', () => {
  const reporteViejo = { id: 'r1-quedamos', meetsAt: '2026-08-29T20:00:00-05:00' }
  const reporteNuevo = { id: 'r2-otra-cosa', meetsAt: null }
  const todosLosReportes = [reporteNuevo, reporteViejo] // más reciente primero

  it('no, si un reporte más nuevo ya existe: el viejo dejó de ser la última palabra', () => {
    expect(citaAcordadaVigente(reporteViejo, todosLosReportes, [])).toBe(false)
  })

  it('sí, cuando es el reporte más reciente y esa fecha no se ha agendado', () => {
    expect(citaAcordadaVigente(reporteNuevo, [reporteNuevo], [])).toBe(false) // no tiene meetsAt
    const conFecha = { id: 'r3', meetsAt: '2026-09-10T20:00:00-05:00' }
    expect(citaAcordadaVigente(conFecha, [conFecha], [])).toBe(true)
  })

  it('no, si esa fecha ya se convirtió en una cita real', () => {
    const conFecha = { id: 'r3', meetsAt: '2026-09-10T20:00:00-05:00' }
    const citas = [{ inicio: '2026-09-10T20:00:00-05:00' }]
    expect(citaAcordadaVigente(conFecha, [conFecha], citas)).toBe(false)
  })

  it('sin fecha acordada, nunca es una invitación a agendar', () => {
    expect(citaAcordadaVigente({ id: 'x', meetsAt: null }, [{ id: 'x' }], [])).toBe(false)
  })

  it('el caso completo de Carolina: ninguno de los dos reportes ofrece agendar', () => {
    const citas = [{ inicio: '2026-08-27T15:00:00-05:00' }, { inicio: '2026-08-29T20:00:00-05:00' }]
    // El viejo: superado por uno más nuevo.
    expect(citaAcordadaVigente(reporteViejo, todosLosReportes, citas)).toBe(false)
    // El nuevo: no dice fecha, así que tampoco hay nada que agendar desde aquí.
    expect(citaAcordadaVigente(reporteNuevo, todosLosReportes, citas)).toBe(false)
  })
})
