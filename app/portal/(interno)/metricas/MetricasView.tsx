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
  /** Lo que está parado ahora mismo y ya pasó de su plazo. */
  atascos?: {
    etapa: string
    cuantas: number
    /** Lo que lleva el más viejo. En horas: hay atascos de horas y de días. */
    horasMaximo: number | null
    umbralHoras: number
    quePasaSiSeIgnora: string
  }[]
  /** Lo que el profesional responde al cerrar el caso. */
  loQueDicenAlCerrar?: {
    totalReportes: number
    conRespuesta: number
    necesitaMas: number
    suficiente: number
    noSabe: number
    noSePresento: number
  }
  /** Por qué cae el último escalón: no todo lo que falta es una pérdida. */
  desgloseUltimoPaso?: {
    conSesionPorDelante: number
    esperandoCierre: number
  }
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
    diasPromedioHastaElegirHora: number | null
  }
  asignaciones: {
    total: number
    aceptadas: number
    rechazadas: number
    vencidasSinRespuesta: number
    canceladasOtras: number
    tasaDeclinada: number | null
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
  desglose,
}: {
  pasos: NonNullable<Metricas['camino']>
  sobreCuantas?: number
  desglose?: Metricas['desgloseUltimoPaso']
}) {
  const porDelante = desglose?.conSesionPorDelante ?? 0
  const sinCerrar = desglose?.esperandoCierre ?? 0
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

      {/*
        Por qué cae el último escalón.

        La caída salía como «−4 personas» en el mismo ámbar que las demás, y
        un embudo resta gente que se quedó en el camino. Pero estas no se
        quedaron: su sesión es el jueves. Sin esta línea, el informe pedía
        arreglar una cola como si fuera una fuga — y de paso escondía la parte
        que sí lo es.
      */}
      {porDelante > 0 || sinCerrar > 0 ? (
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 18,
            fontSize: '0.82rem',
          }}
        >
          {porDelante > 0 ? (
            <span>
              <strong style={{ color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
                {porDelante}
              </strong>{' '}
              <span className="tabla__secundario">
                {porDelante === 1 ? 'tiene su sesión' : 'tienen su sesión'} agendada, todavía sin
                llegar. No {porDelante === 1 ? 'se perdió' : 'se perdieron'}: están en cola.
              </span>
            </span>
          ) : null}
          {sinCerrar > 0 ? (
            <span>
              <strong style={{ color: '#b45309', fontVariantNumeric: 'tabular-nums' }}>
                {sinCerrar}
              </strong>{' '}
              <span className="tabla__secundario">
                {sinCerrar === 1 ? 'sesión pasó' : 'sesiones pasaron'} sin que nadie
                {sinCerrar === 1 ? ' dijera' : ' dijera'} qué ocurrió. No {sinCerrar === 1 ? 'cuenta' : 'cuentan'} como
                sesión ni como ausencia: {sinCerrar === 1 ? 'falta' : 'faltan'} de cerrar.
              </span>
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/**
 * Lo que está parado ahora, y desde cuándo.
 *
 * El camino de arriba es historia acumulada: dice que la mitad eligió hora,
 * no si la otra mitad está atascada o entró ayer. Un porcentaje no se puede
 * atender; «tres personas llevan doce días» sí.
 *
 * Solo entra lo que ya pasó de su plazo, y el plazo es el mismo con el que
 * los barridos liberan casos. Si esta pantalla dijera «atrasado» con un
 * umbral propio, contradiría al tablero de al lado.
 */
/**
 * Horas o días, según cuánto sea.
 *
 * El panel contaba todo en días: un atasco de dos horas salía como «plazo:
 * 0.083 días» y el que más llevaba, como «0 días» — que se lee como «ninguno»
 * justo cuando sí hay uno.
 */
function enPalabras(horas: number): string {
  if (horas < 24) {
    const h = Math.max(1, Math.round(horas))
    return `${h} ${h === 1 ? 'hora' : 'horas'}`
  }
  const d = Math.floor(horas / 24)
  return `${d} ${d === 1 ? 'día' : 'días'}`
}

function Atascos({ filas }: { filas: NonNullable<Metricas['atascos']> }) {
  const conCosas = filas.filter((f) => f.cuantas > 0)

  return (
    <div className="panel">
      <h2>Lo que está esperando</h2>
      <p className="tabla__secundario" style={{ margin: '0 0 14px', fontSize: '0.82rem' }}>
        Solo lo que ya pasó de su plazo. Los plazos se cambian en Parametrización.
      </p>

      {conCosas.length === 0 ? (
        <p className="tabla__secundario" style={{ margin: 0, fontSize: '0.86rem' }}>
          Nada atrasado. Todo lo que está abierto va dentro de su plazo.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {conCosas.map((f) => (
            <div
              key={f.etapa}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                paddingBottom: 12,
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <span
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#b45309',
                  fontVariantNumeric: 'tabular-nums',
                  minWidth: 34,
                  lineHeight: 1.1,
                }}
              >
                {f.cuantas}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.etapa}</div>
                <div className="tabla__secundario" style={{ fontSize: '0.8rem', marginTop: 2 }}>
                  {f.horasMaximo !== null ? (
                    <>
                      {/* El más viejo, no el promedio: es el que hay que mirar hoy. */}
                      El que más lleva, <strong>{enPalabras(f.horasMaximo)}</strong>. Plazo:{' '}
                      {enPalabras(f.umbralHoras)}.
                    </>
                  ) : null}{' '}
                  {f.quePasaSiSeIgnora}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Lo que responde el profesional al cerrar: si hizo falta más de una sesión.
 *
 * Se recogía en cada reporte y no salía en ninguna pantalla. Es lo más
 * parecido a «¿sirvió?» que hay hoy, y además dice cuánta segunda sesión
 * viene encima — que es lo que decide si la red aguanta.
 */
function AlCerrar({ d }: { d: NonNullable<Metricas['loQueDicenAlCerrar']> }) {
  const total = d.conRespuesta
  const filas = [
    { etiqueta: 'Necesita más sesiones', valor: d.necesitaMas, color: '#b45309' },
    { etiqueta: 'Con esta fue suficiente', valor: d.suficiente, color: '#059669' },
    { etiqueta: 'Todavía no lo sé', valor: d.noSabe, color: '#64748b' },
  ]
  const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0)

  return (
    <div className="panel">
      <h2>Lo que dicen los profesionales al cerrar</h2>
      <p className="tabla__secundario" style={{ margin: '0 0 14px', fontSize: '0.82rem' }}>
        {total === 0
          ? 'Todavía ningún reporte responde si hizo falta continuar.'
          : `Sobre ${total} ${total === 1 ? 'reporte' : 'reportes'} de ${d.totalReportes} en total.`}
      </p>

      {total > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filas.map((f) => (
            <div key={f.etiqueta} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 4 }}>
              <span style={{ fontSize: '0.88rem' }}>{f.etiqueta}</span>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', fontVariantNumeric: 'tabular-nums' }}>
                {f.valor}
                <span style={{ fontWeight: 400, opacity: 0.6 }}> · {pct(f.valor)}%</span>
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
                    width: `${pct(f.valor)}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: f.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {d.noSePresento > 0 ? (
        <p
          className="tabla__secundario"
          style={{ margin: '14px 0 0', paddingTop: 12, borderTop: '1px solid #e2e8f0', fontSize: '0.82rem' }}
        >
          Aparte, <strong>{d.noSePresento}</strong>{' '}
          {d.noSePresento === 1 ? 'vez el profesional reportó' : 'veces los profesionales reportaron'} que
          la persona no se presentó a una sesión acordada.
        </p>
      ) : null}
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
          {/*
            «Lo que está esperando» va ANTES del camino, y no al final.

            El camino cuenta lo que pasó; esto cuenta lo que hay que hacer hoy.
            Quien abre el informe por la mañana viene a lo segundo, y si está
            debajo de cuatro paneles de historia no lo ve.
          */}
          {m.atascos?.length ? (
            <div style={{ marginBottom: 18 }}>
              <Atascos filas={m.atascos} />
            </div>
          ) : null}

          {m.camino?.length ? (
            <div style={{ marginBottom: 18 }}>
              <Camino
                pasos={m.camino}
                sobreCuantas={m.caminoSobreCuantas}
                desglose={m.desgloseUltimoPaso}
              />
            </div>
          ) : null}

          {m.loQueDicenAlCerrar ? (
            <div style={{ marginBottom: 18 }}>
              <AlCerrar d={m.loQueDicenAlCerrar} />
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
              titulo="Días hasta la primera asignación"
              valor={m.embudo.diasPromedioHastaPrimeraPropuesta?.toString() ?? '—'}
              nota="promedio, desde la admisión"
            />
            {/*
              Estas dos medían el paso de pedirle permiso al profesional, que ya
              no existe. Tal cual estaban marcarían 0 días y 100 % para siempre
              —en la pantalla que existe para enseñar lo que va mal—, así que
              miran ahora donde de verdad se puede parar un caso.
            */}
            <Indicador
              titulo="La persona tarda en elegir hora"
              valor={m.embudo.diasPromedioHastaElegirHora != null ? `${m.embudo.diasPromedioHastaElegirHora}d` : '—'}
              nota="promedio desde que se le asigna. A los 3 días se libera"
            />
            <Indicador
              titulo="Declinadas por el profesional"
              valor={m.asignaciones.tasaDeclinada != null ? `${m.asignaciones.tasaDeclinada}%` : '—'}
              nota={`${m.asignaciones.rechazadas} de ${m.asignaciones.total} asignaciones`}
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
              titulo="Asignaciones a profesionales"
              filas={[
                ['Aceptadas', String(m.asignaciones.aceptadas)],
                ['Declinadas (el profesional no podía)', String(m.asignaciones.rechazadas)],
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
