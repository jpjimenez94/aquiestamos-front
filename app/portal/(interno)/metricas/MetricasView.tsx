'use client'

import { useState } from 'react'
import { BarChart3, Video, Layers, CheckCircle2, Clock, Users, ShieldCheck, HeartHandshake } from 'lucide-react'

type Metricas = {
  personas: {
    total: number
    porEstado: Record<string, number>
    porPrioridad: Record<string, number>
  }
  /** El camino desde que alguien pide ayuda. Cada paso encaja dentro del anterior. */
  camino?: {
    etapa: string
    cuantas: number
    porcentaje: number | null
    seQuedaronAqui: number | null
  }[]
  caminoSobreCuantas?: number
  tamizaje?: {
    enviados: number
    respondidos: number
    tasaRespuesta: number | null
    admitidasSinResponder: number
  }
  esperaHastaLaPrimeraSesion?: {
    diasMediana: number | null
    diasPromedio: number | null
    sobreCuantasPersonas: number
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

/**
 * El camino desde que alguien pide ayuda hasta que se sienta con un profesional.
 *
 * Se dibuja como barras y no como tabla a propósito: lo que hay que ver de un
 * vistazo no son los números, es en qué escalón se cae la gente. Cada paso
 * está encajado dentro del anterior, así que la resta entre dos significa
 * personas que no llegaron al siguiente.
 */
function Camino({
  pasos,
  sobreCuantas,
}: {
  pasos: NonNullable<Metricas['camino']>
  sobreCuantas?: number
}) {
  const pocas = (sobreCuantas ?? 0) < 20

  return (
    <div className="panel">
      <h2>El camino de quien pide ayuda</h2>
      <p className="tabla__secundario" style={{ margin: '0 0 14px', fontSize: '0.82rem' }}>
        {pocas
          ? `Sobre ${sobreCuantas} solicitudes. Con tan pocas, cada porcentaje es una persona o dos: sirve para ver el orden de las cosas, no como tendencia.`
          : `Sobre ${sobreCuantas} solicitudes.`}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pasos.map((p) => (
          <div key={p.etapa} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.etapa}</span>
              {p.seQuedaronAqui && p.seQuedaronAqui > 0 ? (
                <span className="tabla__secundario" style={{ fontSize: '0.78rem', color: '#b45309' }}>
                  −{p.seQuedaronAqui} {p.seQuedaronAqui === 1 ? 'persona' : 'personas'}
                </span>
              ) : null}
            </div>
            <span
              style={{
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 700,
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
              }}
            >
              {p.cuantas}
              {p.porcentaje !== null ? (
                <span style={{ fontWeight: 400, opacity: 0.6 }}> · {p.porcentaje}%</span>
              ) : null}
            </span>
            <div
              style={{
                gridColumn: '1 / -1',
                height: 8,
                borderRadius: 999,
                background: '#e2e8f0',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${p.porcentaje ?? 0}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: '#059669',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MetricasView({ m }: { m: Metricas }) {
  const [tab, setTab] = useState<'operacion' | 'virtual' | 'todo'>('operacion')
  const e = m.encuesta
  const tv = m.telemetriaVirtual

  const totalVirtuales = tv?.totalSesionesVirtuales ?? 0

  return (
    <div>
      {/* Navegación por pestañas */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <button
          type="button"
          onClick={() => setTab('operacion')}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: tab === 'operacion' ? '#059669' : '#f1f5f9',
            color: tab === 'operacion' ? '#ffffff' : '#475569',
            transition: 'all 0.15s ease',
          }}
        >
          <BarChart3 size={16} />
          Impacto y Operación General
        </button>

        <button
          type="button"
          onClick={() => setTab('virtual')}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: tab === 'virtual' ? '#059669' : '#f1f5f9',
            color: tab === 'virtual' ? '#ffffff' : '#475569',
            transition: 'all 0.15s ease',
          }}
        >
          <Video size={16} />
          Telemetría de Sesiones Virtuales
          {totalVirtuales > 0 ? (
            <span style={{ background: tab === 'virtual' ? 'rgba(255,255,255,0.3)' : '#e2e8f0', padding: '2px 7px', borderRadius: 10, fontSize: '0.74rem' }}>
              {totalVirtuales}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => setTab('todo')}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: tab === 'todo' ? '#059669' : '#f1f5f9',
            color: tab === 'todo' ? '#ffffff' : '#475569',
            transition: 'all 0.15s ease',
          }}
        >
          <Layers size={16} />
          Vista Completa
        </button>
      </div>

      {/* Pestaña: Telemetría de Sesiones Virtuales */}
      {(tab === 'virtual' || tab === 'todo') && (
        <div style={{ marginBottom: 28 }}>
          {tab === 'todo' && (
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4, color: '#0f172a' }}>
              📹 Telemetría de Sesiones Virtuales (Salas de Videollamada)
            </h2>
          )}
          <p className="panel__nota" style={{ marginBottom: 14 }}>
            Métricas técnicas en tiempo real: medición de asistencia a la sala, puntualidad y duración efectiva de las sesiones online.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <Indicador
              titulo="Sesiones virtuales"
              valor={String(tv?.totalSesionesVirtuales ?? 0)}
              nota="total programadas en modalidad virtual"
            />
            <Indicador
              titulo="Conexión de ambas partes"
              valor={tv?.tasaConexionAmbos != null ? `${tv.tasaConexionAmbos}%` : '—'}
              nota={`${tv?.sesionesCompletasConAmbos ?? 0} de ${tv?.totalSesionesVirtuales ?? 0} sesiones con ambos conectados`}
            />
            <Indicador
              titulo="Duración promedio"
              valor={tv?.duracionPromedioMinutos != null ? `${tv.duracionPromedioMinutos} min` : '—'}
              nota="tiempo medido en llamada virtual"
            />
            <Indicador
              titulo="Asistencia de pacientes"
              valor={tv?.tasaIngresoPaciente != null ? `${tv.tasaIngresoPaciente}%` : '—'}
              nota="pacientes que abrieron su enlace"
            />
            <Indicador
              titulo="Asistencia de psicólogos"
              valor={tv?.tasaIngresoProfesional != null ? `${tv.tasaIngresoProfesional}%` : '—'}
              nota="profesionales que abrieron su enlace"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginTop: 18 }}>
            <Tabla
              titulo="Desglose técnico de videollamadas"
              filas={[
                ['Sesiones virtuales programadas', String(tv?.totalSesionesVirtuales ?? 0)],
                ['Sesiones con al menos un ingreso', String(tv?.sesionesConIngreso ?? 0)],
                ['Sesiones completas (paciente + psicólogo)', String(tv?.sesionesCompletasConAmbos ?? 0)],
                ['Tasa de conexión paciente', tv?.tasaIngresoPaciente != null ? `${tv.tasaIngresoPaciente}%` : '—'],
                ['Tasa de conexión psicólogo', tv?.tasaIngresoProfesional != null ? `${tv.tasaIngresoProfesional}%` : '—'],
                ['Duración promedio en llamada', tv?.duracionPromedioMinutos != null ? `${tv.duracionPromedioMinutos} min` : '—'],
              ]}
            />
          </div>
        </div>
      )}

      {/* Pestaña: Impacto y Operación General */}
      {(tab === 'operacion' || tab === 'todo') && (
        <div>
          {tab === 'todo' && (
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4, color: '#0f172a', marginTop: 32 }}>
              📊 Impacto y Operación General
            </h2>
          )}
          {m.camino?.length ? (
            <div style={{ marginBottom: 18 }}>
              <Camino pasos={m.camino} sobreCuantas={m.caminoSobreCuantas} />
            </div>
          ) : null}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <Indicador titulo="Personas en la red" valor={String(m.personas.total)} />

            {m.esperaHastaLaPrimeraSesion?.diasMediana !== null &&
            m.esperaHastaLaPrimeraSesion !== undefined ? (
              <Indicador
                titulo="De pedir ayuda a la primera sesión"
                valor={`${m.esperaHastaLaPrimeraSesion.diasMediana} días`}
                nota={`mediana · promedio ${m.esperaHastaLaPrimeraSesion.diasPromedio} · sobre ${m.esperaHastaLaPrimeraSesion.sobreCuantasPersonas} personas`}
              />
            ) : null}

            {m.tamizaje ? (
              <Indicador
                titulo="Responden el tamizaje"
                valor={m.tamizaje.tasaRespuesta !== null ? `${m.tamizaje.tasaRespuesta}%` : '—'}
                nota={
                  m.tamizaje.admitidasSinResponder > 0
                    ? `${m.tamizaje.respondidos} de ${m.tamizaje.enviados} · ${m.tamizaje.admitidasSinResponder} entraron sin responder, con prioridad supuesta`
                    : `${m.tamizaje.respondidos} de ${m.tamizaje.enviados}`
                }
              />
            ) : null}
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
        </div>
      )}
    </div>
  )
}
