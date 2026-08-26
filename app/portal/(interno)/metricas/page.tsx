import { portalFetch } from '@/lib/portal'
import { Cabecera, Vacio } from '../componentes'

export const metadata = { title: 'Métricas de impacto' }

/**
 * Las métricas de la red, para el informe mensual y para pedir recursos.
 * Solo la ven administración y solo-lectura: el permiso `metricas:leer` lo
 * decide, y el AGENDADOR no lo tiene a propósito.
 */

type Metricas = {
  personas: {
    total: number
    porEstado: Record<string, number>
    porPrioridad: Record<string, number>
  }
  embudo: {
    diasPromedioHastaPrimeraPropuesta: number | null
    diasPromedioRespuestaDelProfesional: number | null
  }
  asignaciones: {
    total: number
    aceptadas: number
    rechazadas: number
    vencidasSinRespuesta: number
    canceladasOtras: number
    tasaAceptacion: number | null
  }
  motivosDeCierre: Record<string, number>
  casosPorProfesional: { nombre: string; casos: number }[]
  citas: { porEstado: Record<string, number>; tasaAsistencia: number | null }
  telemetriaVirtual?: {
    totalSesionesVirtuales: number
    sesionesConIngreso: number
    sesionesCompletasConAmbos: number
    tasaConexionAmbos: number | null
    tasaIngresoPaciente: number | null
    tasaIngresoProfesional: number | null
    duracionPromedioMinutos: number | null
  }
  encuesta: {
    respondidas: number
    leSirvio: number
    algoLeSirvio: number
    noLeSirvio: number
    recomendaria: number
  }
}

const ESTADO_PERSONA: Record<string, string> = {
  NUEVO: 'Nuevas',
  EN_ADMISION: 'En admisión',
  ASIGNADO: 'Asignadas',
  EN_ACOMPANAMIENTO: 'En acompañamiento',
  CERRADO: 'Cerradas',
}

const ESTADO_CITA: Record<string, string> = {
  PROGRAMADA: 'Programadas',
  CONFIRMADA: 'Confirmadas',
  REALIZADA: 'Realizadas',
  CANCELADA: 'Canceladas',
  NO_ASISTIO: 'No asistió',
  REPROGRAMADA: 'Reprogramadas',
}

function Indicador({ titulo, valor, nota }: { titulo: string; valor: string; nota?: string }) {
  return (
    <div className="panel" style={{ padding: '16px 18px' }}>
      <p className="tabla__secundario" style={{ margin: 0, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {titulo}
      </p>
      <p style={{ margin: '4px 0 0', fontSize: '1.7rem', fontWeight: 700 }}>{valor}</p>
      {nota ? (
        <p className="tabla__secundario" style={{ margin: '2px 0 0', fontSize: '0.78rem' }}>
          {nota}
        </p>
      ) : null}
    </div>
  )
}

function Tabla({ titulo, filas }: { titulo: string; filas: [string, string][] }) {
  return (
    <div className="panel">
      <h2>{titulo}</h2>
      <div className="tabla-envoltorio">
        <table className="tabla">
          <tbody>
            {filas.map(([etiqueta, valor]) => (
              <tr key={etiqueta}>
                <td>{etiqueta}</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{valor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default async function MetricasPage() {
  const respuesta = await portalFetch<Metricas>('/dashboard/metricas')

  if (!respuesta.success || !respuesta.data) {
    return (
      <>
        <Cabecera titulo="Métricas de impacto" descripcion="" />
        <Vacio>{respuesta.message ?? 'No pudimos cargar las métricas.'}</Vacio>
      </>
    )
  }

  const m = respuesta.data
  const e = m.encuesta

  return (
    <>
      <Cabecera
        titulo="Métricas de impacto"
        descripcion="Los números de la red para el informe mensual: el embudo, las respuestas de los profesionales, en qué terminan los casos y qué dice la gente."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <Indicador titulo="Personas en la red" valor={String(m.personas.total)} />
        <Indicador
          titulo="Días hasta la primera propuesta"
          valor={m.embudo.diasPromedioHastaPrimeraPropuesta?.toString() ?? '—'}
          nota="promedio, desde la admisión"
        />
        <Indicador
          titulo="Respuesta del profesional"
          valor={m.embudo.diasPromedioRespuestaDelProfesional != null ? `${m.embudo.diasPromedioRespuestaDelProfesional}d` : '—'}
          nota="promedio hasta responder la propuesta"
        />
        <Indicador
          titulo="Tasa de aceptación"
          valor={m.asignaciones.tasaAceptacion != null ? `${m.asignaciones.tasaAceptacion}%` : '—'}
          nota={`${m.asignaciones.aceptadas} de ${m.asignaciones.total} propuestas`}
        />
        <Indicador
          titulo="Asistencia a sesiones"
          valor={m.citas.tasaAsistencia != null ? `${m.citas.tasaAsistencia}%` : '—'}
          nota="realizadas vs. no asistió"
        />
        <Indicador
          titulo="La encuesta dice"
          valor={
            e.respondidas > 0 ? `${Math.round(((e.leSirvio + e.algoLeSirvio) / e.respondidas) * 100)}%` : '—'
          }
          nota={
            e.respondidas > 0
              ? `le sirvió (${e.respondidas} ${e.respondidas === 1 ? 'respuesta' : 'respuestas'})`
              : 'aún sin respuestas'
          }
        />
      </div>

      {/* Sección: Telemetría de Sesiones Virtuales */}
      {m.telemetriaVirtual && m.telemetriaVirtual.totalSesionesVirtuales > 0 ? (
        <div style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4, color: '#0f172a' }}>
            Telemetría de Sesiones Virtuales (Salas de Videollamada)
          </h2>
          <p className="panel__nota" style={{ marginBottom: 14 }}>
            Métricas técnicas en tiempo real: medición de asistencia a la sala, puntualidad y duración efectiva de las sesiones online.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <Indicador
              titulo="Sesiones virtuales"
              valor={String(m.telemetriaVirtual.totalSesionesVirtuales)}
              nota="total programadas en modalidad virtual"
            />
            <Indicador
              titulo="Conexión de ambas partes"
              valor={m.telemetriaVirtual.tasaConexionAmbos != null ? `${m.telemetriaVirtual.tasaConexionAmbos}%` : '—'}
              nota={`${m.telemetriaVirtual.sesionesCompletasConAmbos} de ${m.telemetriaVirtual.totalSesionesVirtuales} sesiones con ambos conectados`}
            />
            <Indicador
              titulo="Duración promedio"
              valor={m.telemetriaVirtual.duracionPromedioMinutos != null ? `${m.telemetriaVirtual.duracionPromedioMinutos} min` : '—'}
              nota="tiempo medido en llamada virtual"
            />
            <Indicador
              titulo="Asistencia de pacientes"
              valor={m.telemetriaVirtual.tasaIngresoPaciente != null ? `${m.telemetriaVirtual.tasaIngresoPaciente}%` : '—'}
              nota="pacientes que abrieron su enlace"
            />
            <Indicador
              titulo="Asistencia de psicólogos"
              valor={m.telemetriaVirtual.tasaIngresoProfesional != null ? `${m.telemetriaVirtual.tasaIngresoProfesional}%` : '—'}
              nota="profesionales que abrieron su enlace"
            />
          </div>
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginTop: 18 }}>
        <Tabla
          titulo="Personas por estado"
          filas={Object.entries(m.personas.porEstado).map(([k, v]) => [ESTADO_PERSONA[k] ?? k, String(v)])}
        />
        <Tabla
          titulo="Personas por prioridad"
          filas={Object.entries(m.personas.porPrioridad).map(([k, v]) => [k, String(v)])}
        />
        <Tabla
          titulo="Propuestas a profesionales"
          filas={[
            ['Aceptadas', String(m.asignaciones.aceptadas)],
            ['Rechazadas (dijo que no)', String(m.asignaciones.rechazadas)],
            ['Vencidas sin respuesta', String(m.asignaciones.vencidasSinRespuesta)],
            ['Canceladas por otra razón', String(m.asignaciones.canceladasOtras)],
          ]}
        />
        <Tabla
          titulo="Citas por estado"
          filas={Object.entries(m.citas.porEstado).map(([k, v]) => [ESTADO_CITA[k] ?? k, String(v)])}
        />
        {Object.keys(m.motivosDeCierre).length > 0 ? (
          <Tabla
            titulo="Motivos de cierre"
            filas={Object.entries(m.motivosDeCierre)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => [k, String(v)])}
          />
        ) : null}
        {m.casosPorProfesional.length > 0 ? (
          <Tabla
            titulo="Casos por profesional (activos y cerrados)"
            filas={m.casosPorProfesional.map((p) => [p.nombre, String(p.casos)])}
          />
        ) : null}
        {e.respondidas > 0 ? (
          <Tabla
            titulo="Encuesta del cierre"
            filas={[
              ['Le sirvió', String(e.leSirvio)],
              ['Algo le sirvió', String(e.algoLeSirvio)],
              ['No le sirvió', String(e.noLeSirvio)],
              ['Lo recomendaría', `${e.recomendaria} de ${e.respondidas}`],
            ]}
          />
        ) : null}
      </div>
    </>
  )
}
