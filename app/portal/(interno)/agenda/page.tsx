import Link from 'next/link'
import { portalFetch, soloHora, enBogota } from '@/lib/portal'
import { Cabecera, Etiqueta, Vacio } from '../componentes'
import { BotonExportarCSV } from '@/components/portal/BotonExportarCSV'
import {
  LayoutGrid,
  CalendarDays,
  History,
  ShieldAlert,
  FileCheck2,
  FileClock,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { nombrePropio } from '@/lib/nombre'

export const metadata = { title: 'Agenda y Gestión de Casos' }

type Cita = {
  id: string
  inicio: string
  fin: string
  inicioLocal: string
  finLocal: string
  estado: string
  estadoLegible: string
  modalidad: string
  consentSigned?: boolean
  consentSignedDocumentUrl?: string | null
  motivoCancelacion?: string | null
  patientFirstJoinedAt?: string | null
  professionalFirstJoinedAt?: string | null
  totalCallDurationSeconds?: number
  totalCallDurationMinutes?: number
  pacienteEnVivo?: boolean
  profesionalEnVivo?: boolean
  llamadaEnVivo?: boolean
  ambosEnVivo?: boolean
  profesional: { id: string; nombre?: string; telefono?: string }
  paciente: { id: string; nombre?: string; telefono?: string; esMenor?: boolean }
}

type HistorialRespuesta = {
  data: Cita[]
  metricas?: {
    total: number
    realizadas: number
    confirmadas: number
    programadas: number
    canceladas: number
    noAsistio: number
    tasaAsistencia: number
  }
}

type Paciente = {
  id: string
  fullName: string
  city: string
  status: string
  estadoLegible?: string
  priority: string
  prioridadLegible?: string
  isMinor: boolean
  createdAt: string
  diasEsperando: number
  /** Solo en Por Asignar: prioridad ALTA con demasiados días sin profesional. */
  slaVencido?: boolean
  ultimaCita?: {
    id: string
    inicio: string
    fin?: string | null
    estado: string
    modalidad: string
  } | null
  ultimoReporte?: {
    id: string
    outcome: string
    fecha: string
    notas?: string | null
  } | null
  asignacion: {
    id: string
    desde: string
    estado?: string
    diasOfrecidos?: string[]
    franjasOfrecidas?: string[]
    notaDisponibilidad?: string | null
    /** Días que faltan para que el barrido libere la asignación. */
    venceEnDias?: number | null
    profesional: {
      id: string
      nombre: string
      professionalCardVerified?: boolean
      professionalCardNumber?: string
      professionalCardDocumentUrl?: string
    }
  } | null
}

const OUTCOME_LABEL: Record<string, string> = {
  YA_ATENDIDA: 'Ya la acompañó',
  CITA_ACORDADA: 'Quedaron en una cita',
  NO_ASISTIO: 'No asistió a la sesión',
  SIGO_INTENTANDO: 'Sigue intentando contactar',
  NO_CONTESTA: 'No contesta',
  DATOS_ERRADOS: 'Datos errados',
  NO_QUIERE: 'No desea acompañamiento',
  OTRO: 'Otro reporte',
}

const DIA_CORTO: Record<string, string> = {
  LUNES: 'lun', MARTES: 'mar', MIERCOLES: 'mié', JUEVES: 'jue',
  VIERNES: 'vie', SABADO: 'sáb', DOMINGO: 'dom',
}
const FRANJA_CORTA: Record<string, string> = { MANANA: 'mañana', TARDE: 'tarde', NOCHE: 'noche' }

/**
 * El aviso de cuándo el barrido va a liberar la asignación. Con 0 días la
 * liberación es cuestión de horas: se dice en rojo, no en gris.
 */
function ChipVence({ dias }: { dias?: number | null }) {
  if (dias == null) return null
  const urgente = dias <= 0
  return (
    <span
      style={{
        fontSize: '0.72rem',
        fontWeight: 600,
        color: urgente ? '#dc2626' : '#92700c',
      }}
    >
      {urgente ? 'Se libera en las próximas horas' : `Se libera en ${dias} ${dias === 1 ? 'día' : 'días'} si no hay respuesta`}
    </span>
  )
}

/** La TP sin verificar es un aviso transversal, no una etapa: se resuelve en postulaciones. */
function AvisoTP({ verificada }: { verificada?: boolean }) {
  if (verificada !== false) return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#dc2626', fontSize: '0.72rem', fontWeight: 600 }}>
      <ShieldAlert size={12} />
      TP sin verificar — revisar en Postulaciones
    </span>
  )
}

const PRIORIDAD_LABEL: Record<string, string> = {
  ALTA: 'Alta', MEDIA: 'Media', BAJA: 'Baja',
}

const ESTADO_PACIENTE_LABEL: Record<string, string> = {
  NUEVO: 'Nuevo',
  EN_ADMISION: 'En admisión',
  ASIGNADO: 'Asignado',
  EN_ACOMPANAMIENTO: 'En acompañamiento',
  CERRADO: 'Cerrado',
}

const ESTADO_CITA_LABEL: Record<string, string> = {
  PROGRAMADA: 'Programada',
  CONFIRMADA: 'Confirmada',
  REALIZADA: 'Realizada',
  CANCELADA: 'Cancelada',
  NO_ASISTIO: 'No asistió',
  REPROGRAMADA: 'Reprogramada',
}

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function lunesDe(fecha: Date) {
  const d = new Date(fecha)
  const dia = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - dia)
  d.setHours(0, 0, 0, 0)
  return d
}

function claveDia(fecha: Date | string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(typeof fecha === 'string' ? new Date(fecha) : fecha)
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{
    vista?: string
    semana?: string
    estado?: string
    q?: string
    desde?: string
    hasta?: string
  }>
}) {
  const params = await searchParams
  const vista = params.vista || 'tablero' // 'tablero' | 'semana' | 'historial'

  // --- Vista 1: Tablero de Casos (Pipeline de Gestión) ---
  if (vista === 'tablero') {
    const [tableroRes, liveRes] = await Promise.all([
      portalFetch<{
        porAsignar: Paciente[]
        esperandoProfesional: Paciente[]
        porCuadrarHorario: Paciente[]
        citasAbiertas: Cita[]
        citasPropuestas?: Cita[]
        citasConfirmadas?: Cita[]
        enAcompanamiento: Paciente[]
        cerrados: {
          id: string
          fullName: string
          city: string
          cerradoEl: string
          motivo: string | null
          profesional: string | null
        }[]
      }>('/dashboard/tablero'),
      portalFetch<{ totalEnVivo: number; sesiones: any[] }>('/meetings/live'),
    ])

    const liveData = liveRes.data ?? { totalEnVivo: 0, sesiones: [] }
    const liveMap = new Map((liveData.sesiones ?? []).map((s) => [s.citaId, s]))

    const porAsignar = tableroRes.data?.porAsignar ?? []
    const esperandoProfesional = tableroRes.data?.esperandoProfesional ?? []
    const porCuadrarHorario = tableroRes.data?.porCuadrarHorario ?? []
    const citasAbiertas = tableroRes.data?.citasAbiertas ?? []
    const citasPropuestas = tableroRes.data?.citasPropuestas ?? citasAbiertas.filter((c) => c.estado === 'PROGRAMADA')
    const citasConfirmadas = tableroRes.data?.citasConfirmadas ?? citasAbiertas.filter((c) => c.estado === 'CONFIRMADA')
    const enAcompanamiento = tableroRes.data?.enAcompanamiento ?? []
    const cerrados = tableroRes.data?.cerrados ?? []

    return (
      <>
        <Cabecera
          titulo="Agenda y Gestión de Casos"
          descripcion="Cada columna es un estado del caso: dónde está y qué respuesta se espera."
        />

        {/* Banner de Supervisión en Tiempo Real */}
        {liveData.totalEnVivo > 0 ? (
          <div
            style={{
              background: '#ecfdf5',
              border: '1.5px solid #a7f3d0',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              boxShadow: '0 2px 10px rgba(16,185,129,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 0 4px rgba(16,185,129,0.25)',
                }}
              />
              <div>
                <strong style={{ color: '#065f46', fontSize: '0.98rem', display: 'block' }}>
                  🟢 {liveData.totalEnVivo} Sesión(es) virtual(es) en vivo ocurriendo en este momento
                </strong>
                <span style={{ fontSize: '0.82rem', color: '#047857' }}>
                  Supervisor activo: los participantes están conectados a la sala virtual.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {liveData.sesiones.map((s: any) => (
                <Link
                  key={s.citaId}
                  href={`/portal/agenda/${s.citaId}`}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #10b981',
                    color: '#065f46',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>👤 {s.paciente}</span>
                  <span style={{ color: '#64748b' }}>con</span>
                  <span>🩺 {s.profesional}</span>
                  <span style={{ background: '#d1fae5', padding: '2px 6px', borderRadius: 6, fontSize: '0.74rem' }}>
                    ⏱️ {s.duracionMinutos} min
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="pestanas-agenda">
          <Link
            className="pestana-boton"
            data-activo={true}
            href="/portal/agenda?vista=tablero"
          >
            <LayoutGrid size={16} />
            Tablero de Casos
          </Link>
          <Link
            className="pestana-boton"
            data-activo={false}
            href="/portal/agenda?vista=semana"
          >
            <CalendarDays size={16} />
            Calendario Semanal
          </Link>
          <Link
            className="pestana-boton"
            data-activo={false}
            href="/portal/agenda?vista=historial"
          >
            <History size={16} />
            Historial General
          </Link>
        </div>

        <div className="pipeline-grid">
          {/* Columna 1: Por Asignar */}
          <div className="pipeline-columna">
            <div className="pipeline-columna__cabecera">
              <span className="pipeline-columna__titulo">
                <AlertCircle size={15} style={{ color: '#d97706' }} />
                1. Por Asignar
              </span>
              <span className="pipeline-columna__contador">{porAsignar.length}</span>
            </div>
            {porAsignar.length === 0 ? (
              <span className="tabla__secundario" style={{ fontSize: '0.8rem' }}>Sin casos pendientes</span>
            ) : (
              porAsignar.map((p) => (
                <Link
                  key={p.id}
                  href={`/portal/personas/${p.id}`}
                  className="pipeline-card"
                  style={p.slaVencido ? { borderLeft: '3px solid #dc2626', background: '#fef2f2' } : undefined}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{nombrePropio(p.fullName)}</strong>
                    <Etiqueta estado={p.priority} texto={PRIORIDAD_LABEL[p.priority] ?? p.priority} />
                  </div>
                  <span className="tabla__secundario" style={{ fontSize: '0.78rem' }}>
                    {p.city} · {p.diasEsperando}d en espera
                  </span>
                  {p.slaVencido ? (
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#dc2626' }}>
                      Prioridad alta sin asignar hace {p.diasEsperando} días
                    </span>
                  ) : null}
                  {p.isMinor && (
                    <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 600 }}>
                      Menor de edad
                    </span>
                  )}
                </Link>
              ))
            )}
          </div>

          {/* Columna 2: la propuesta salió y el profesional no ha respondido */}
          <div className="pipeline-columna">
            <div className="pipeline-columna__cabecera">
              <span className="pipeline-columna__titulo">
                <Clock size={15} style={{ color: '#d97706' }} />
                2. Propuestas antiguas
              </span>
              <span className="pipeline-columna__contador">{esperandoProfesional.length}</span>
            </div>
            {esperandoProfesional.length === 0 ? (
              <span className="tabla__secundario" style={{ fontSize: '0.8rem' }}>Ninguna. Ya no se pide permiso: se asigna y se avisa.</span>
            ) : (
              esperandoProfesional.map((p) => (
                <Link key={p.id} href={`/portal/personas/${p.id}`} className="pipeline-card" style={{ borderLeft: '3px solid #d97706' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{nombrePropio(p.fullName)}</strong>
                    <Etiqueta estado={p.priority} texto={PRIORIDAD_LABEL[p.priority] ?? p.priority} />
                  </div>
                  <span className="tabla__secundario" style={{ fontSize: '0.78rem' }}>
                    Propuesto a: <strong>{nombrePropio(p.asignacion?.profesional.nombre)}</strong>
                  </span>
                  <ChipVence dias={p.asignacion?.venceEnDias} />
                  <AvisoTP verificada={p.asignacion?.profesional.professionalCardVerified} />
                </Link>
              ))
            )}
          </div>

          {/* Columna 3: el profesional aceptó; falta que la persona confirme horario */}
          <div className="pipeline-columna">
            <div className="pipeline-columna__cabecera">
              <span className="pipeline-columna__titulo">
                <UserCheck size={15} style={{ color: '#0284c7' }} />
                3. Asignadas · falta que elija hora
              </span>
              <span className="pipeline-columna__contador">{porCuadrarHorario.length}</span>
            </div>
            {porCuadrarHorario.length === 0 ? (
              <span className="tabla__secundario" style={{ fontSize: '0.8rem' }}>Nadie pendiente de elegir hora</span>
            ) : (
              porCuadrarHorario.map((p) => (
                <Link key={p.id} href={`/portal/personas/${p.id}`} className="pipeline-card" style={{ borderLeft: '3px solid #0284c7' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{nombrePropio(p.fullName)}</strong>
                  <span className="tabla__secundario" style={{ fontSize: '0.78rem' }}>
                    Aceptó: <strong>{nombrePropio(p.asignacion?.profesional.nombre)}</strong>
                  </span>
                  {p.asignacion?.diasOfrecidos?.length || p.asignacion?.franjasOfrecidas?.length ? (
                    <span className="tabla__secundario" style={{ fontSize: '0.76rem' }}>
                      Puede: {(p.asignacion.diasOfrecidos ?? []).map((d) => DIA_CORTO[d] ?? d).join(', ')}
                      {p.asignacion.franjasOfrecidas?.length
                        ? ` · ${p.asignacion.franjasOfrecidas.map((f) => FRANJA_CORTA[f] ?? f).join(', ')}`
                        : ''}
                    </span>
                  ) : null}
                  <ChipVence dias={p.asignacion?.venceEnDias} />
                  <AvisoTP verificada={p.asignacion?.profesional.professionalCardVerified} />
                </Link>
              ))
            )}
          </div>

          {/* Columna 4: Cita propuesta (PROGRAMADA) */}
          <div className="pipeline-columna">
            <div className="pipeline-columna__cabecera">
              <span className="pipeline-columna__titulo">
                <Clock size={15} style={{ color: '#7c3aed' }} />
                4. Cita agendada
              </span>
              <span className="pipeline-columna__contador">{citasPropuestas.length}</span>
            </div>
            {citasPropuestas.length === 0 ? (
              <span className="tabla__secundario" style={{ fontSize: '0.8rem' }}>Sin citas propuestas</span>
            ) : (
              citasPropuestas.map((c) => (
                <Link key={c.id} href={`/portal/agenda/${c.id}`} className="pipeline-card" style={{ borderLeft: '3px solid #7c3aed' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.88rem' }}>{c.paciente.nombre ?? 'Paciente'}</strong>
                    <Etiqueta estado={c.estado} texto={ESTADO_CITA_LABEL[c.estado] ?? c.estado} />
                  </div>
                  <span className="tabla__secundario" style={{ fontSize: '0.78rem' }}>
                    {enBogota(c.inicio)} · {c.profesional.nombre}
                  </span>
                  <div style={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {c.consentSigned ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: '0.74rem', fontWeight: 600 }}>
                        <FileCheck2 size={13} /> Consentimiento firmado
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#d97706', fontSize: '0.74rem', fontWeight: 600 }}>
                        <FileClock size={13} /> Falta consentimiento
                      </span>
                    )}

                    {liveMap.has(c.id) ? (
                      <span
                        style={{
                          background: '#dcfce7',
                          color: '#15803d',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 6,
                          width: 'fit-content',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                        🟢 En sala ahora (⏱️ {liveMap.get(c.id)?.duracionMinutos ?? 0} min)
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Columna 5: Citas confirmadas (CONFIRMADA) */}
          <div className="pipeline-columna">
            <div className="pipeline-columna__cabecera">
              <span className="pipeline-columna__titulo">
                <CheckCircle2 size={15} style={{ color: '#059669' }} />
                5. Citas confirmadas
              </span>
              <span className="pipeline-columna__contador">{citasConfirmadas.length}</span>
            </div>
            {citasConfirmadas.length === 0 ? (
              <span className="tabla__secundario" style={{ fontSize: '0.8rem' }}>Sin citas confirmadas</span>
            ) : (
              citasConfirmadas.map((c) => (
                <Link key={c.id} href={`/portal/agenda/${c.id}`} className="pipeline-card" style={{ borderLeft: '3px solid #059669' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.88rem' }}>{c.paciente.nombre ?? 'Paciente'}</strong>
                    <Etiqueta estado={c.estado} texto={ESTADO_CITA_LABEL[c.estado] ?? c.estado} />
                  </div>
                  <span className="tabla__secundario" style={{ fontSize: '0.78rem' }}>
                    {enBogota(c.inicio)} · {c.profesional.nombre}
                  </span>
                  <div style={{ marginTop: 2 }}>
                    {c.consentSigned ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: '0.74rem', fontWeight: 600 }}>
                        <FileCheck2 size={13} /> Consentimiento firmado
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#d97706', fontSize: '0.74rem', fontWeight: 600 }}>
                        <FileClock size={13} /> Falta consentimiento
                      </span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Columna 6: En Acompañamiento / Seguimiento */}
          <div className="pipeline-columna">
            <div className="pipeline-columna__cabecera">
              <span className="pipeline-columna__titulo">
                <UserCheck size={15} style={{ color: '#0284c7' }} />
                6. En acompañamiento / seguimiento
              </span>
              <span className="pipeline-columna__contador">{enAcompanamiento.length}</span>
            </div>
            {enAcompanamiento.length === 0 ? (
              <span className="tabla__secundario" style={{ fontSize: '0.8rem' }}>Sin acompañamientos activos</span>
            ) : (
              enAcompanamiento.map((p) => (
                <Link
                  key={p.id}
                  href={`/portal/personas/${p.id}`}
                  className="pipeline-card"
                  style={{ borderLeft: '3px solid #0284c7' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{nombrePropio(p.fullName)}</strong>
                    {p.ultimoReporte ? (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#059669',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <CheckCircle2 size={12} /> Con reporte
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#d97706',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <Clock size={12} /> Esperando reporte
                      </span>
                    )}
                  </div>
                  <span className="tabla__secundario" style={{ fontSize: '0.78rem' }}>
                    Psicólogo: <strong>{nombrePropio(p.asignacion?.profesional.nombre) || 'Asignado'}</strong>
                  </span>
                  {p.ultimaCita ? (
                    <span className="tabla__secundario" style={{ fontSize: '0.74rem', marginTop: 2 }}>
                      Sesión: {enBogota(p.ultimaCita.inicio)} ({p.ultimaCita.modalidad === 'PRESENCIAL' ? 'Presencial' : 'Virtual'})
                    </span>
                  ) : null}
                  {p.ultimoReporte?.outcome ? (
                    <span style={{ fontSize: '0.74rem', color: '#4b5563', fontStyle: 'italic', marginTop: 2 }}>
                      {OUTCOME_LABEL[p.ultimoReporte.outcome] ?? p.ultimoReporte.outcome}
                    </span>
                  ) : null}
                </Link>
              ))
            )}
          </div>

          {/* Columna 7: cerrar no es desaparecer. Los últimos, en gris. */}
          <div className="pipeline-columna" style={{ opacity: 0.85 }}>
            <div className="pipeline-columna__cabecera">
              <span className="pipeline-columna__titulo">
                <History size={15} style={{ color: '#6b7280' }} />
                Cerrados recientes
              </span>
              <span className="pipeline-columna__contador">{cerrados.length}</span>
            </div>
            {cerrados.length === 0 ? (
              <span className="tabla__secundario" style={{ fontSize: '0.8rem' }}>Ningún caso cerrado todavía</span>
            ) : (
              cerrados.map((p) => (
                <Link key={p.id} href={`/portal/personas/${p.id}`} className="pipeline-card" style={{ borderLeft: '3px solid #9ca3af' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{nombrePropio(p.fullName)}</strong>
                  <span className="tabla__secundario" style={{ fontSize: '0.78rem' }}>
                    {p.profesional ? `Acompañó: ${nombrePropio(p.profesional)} · ` : ''}
                    {enBogota(p.cerradoEl)}
                  </span>
                  {p.motivo ? (
                    <span className="tabla__secundario" style={{ fontSize: '0.74rem', fontStyle: 'italic' }}>
                      {p.motivo}
                    </span>
                  ) : null}
                </Link>
              ))
            )}
          </div>
        </div>
      </>
    )
  }

  // --- Vista 2: Calendario Semanal ---
  if (vista === 'semana') {
    const referencia = params.semana ? new Date(`${params.semana}T12:00:00`) : new Date()
    const lunes = lunesDe(Number.isNaN(referencia.getTime()) ? new Date() : referencia)
    const domingo = new Date(lunes)
    domingo.setDate(domingo.getDate() + 7)

    const respuesta = await portalFetch<Cita[]>(
      `/appointments?desde=${lunes.toISOString()}&hasta=${domingo.toISOString()}`,
    )
    const citas = respuesta.data ?? []

    const porDia = new Map<string, Cita[]>()
    for (const cita of citas) {
      const clave = claveDia(cita.inicio)
      porDia.set(clave, [...(porDia.get(clave) ?? []), cita])
    }

    const anterior = new Date(lunes)
    anterior.setDate(anterior.getDate() - 7)
    const siguiente = new Date(lunes)
    siguiente.setDate(siguiente.getDate() + 7)
    const aParam = (d: Date) => d.toISOString().slice(0, 10)
    const hoy = claveDia(new Date())

    return (
      <>
        <Cabecera
          titulo="Agenda de la red"
          descripcion={`Semana del ${lunes.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}`}
          acciones={
            <>
              <Link className="boton-mini" href={`/portal/agenda?vista=semana&semana=${aParam(anterior)}`}>
                ← Semana anterior
              </Link>
              <Link className="boton-mini" href="/portal/agenda?vista=semana">
                Esta semana
              </Link>
              <Link className="boton-mini" href={`/portal/agenda?vista=semana&semana=${aParam(siguiente)}`}>
                Semana siguiente →
              </Link>
            </>
          }
        />

        <div className="pestanas-agenda">
          <Link className="pestana-boton" data-activo={false} href="/portal/agenda?vista=tablero">
            <LayoutGrid size={16} />
            Tablero de Casos
          </Link>
          <Link className="pestana-boton" data-activo={true} href="/portal/agenda?vista=semana">
            <CalendarDays size={16} />
            Calendario Semanal
          </Link>
          <Link className="pestana-boton" data-activo={false} href="/portal/agenda?vista=historial">
            <History size={16} />
            Historial General
          </Link>
        </div>

        {!respuesta.success ? (
          <Vacio>{respuesta.message ?? 'No pudimos cargar la agenda.'}</Vacio>
        ) : (
          <div className="semana">
            {DIAS.map((nombre, indice) => {
              const fecha = new Date(lunes)
              fecha.setDate(fecha.getDate() + indice)
              const clave = claveDia(fecha)
              const delDia = (porDia.get(clave) ?? []).sort((a, b) => a.inicio.localeCompare(b.inicio))

              return (
                <div className="dia" key={nombre} data-hoy={clave === hoy}>
                  <div className="dia__cabecera">
                    {nombre.slice(0, 3)}
                    <span className="dia__numero">{fecha.getDate()}</span>
                  </div>

                  {delDia.length === 0 ? (
                    <span className="tabla__secundario" style={{ marginTop: 0 }}>
                      —
                    </span>
                  ) : (
                    delDia.map((cita) => (
                      <Link
                        className="cita-mini"
                        data-estado={cita.estado}
                        href={`/portal/agenda/${cita.id}`}
                        key={cita.id}
                      >
                        <strong>{soloHora(cita.inicio)}</strong>
                        {cita.paciente.nombre ?? 'Persona'}
                        <br />
                        <span style={{ opacity: 0.7 }}>{cita.profesional.nombre ?? ''}</span>
                        {cita.consentSigned ? (
                          <span style={{ display: 'block', fontSize: '0.68rem', color: '#059669', marginTop: 2 }}>
                            ✓ Consentimiento
                          </span>
                        ) : null}
                      </Link>
                    ))
                  )}
                </div>
              )
            })}
          </div>
        )}
      </>
    )
  }

  // --- Vista 3: Historial General con Filtros y KPIs ---
  const queryParams = new URLSearchParams()
  if (params.estado) queryParams.set('estado', params.estado)
  if (params.q) queryParams.set('q', params.q)
  if (params.desde) queryParams.set('desde', params.desde)
  if (params.hasta) queryParams.set('hasta', params.hasta)

  const respuestaHistorial = await portalFetch<Cita[]>(
    `/appointments/historial?${queryParams.toString()}`,
  )

  const citas = respuestaHistorial.data ?? []
  const metricas = (respuestaHistorial as HistorialRespuesta).metricas ?? {
    total: citas.length,
    realizadas: citas.filter((c) => c.estado === 'REALIZADA').length,
    confirmadas: citas.filter((c) => c.estado === 'CONFIRMADA').length,
    programadas: citas.filter((c) => c.estado === 'PROGRAMADA').length,
    canceladas: citas.filter((c) => c.estado === 'CANCELADA').length,
    noAsistio: citas.filter((c) => c.estado === 'NO_ASISTIO').length,
    tasaAsistencia: citas.length ? Math.round((citas.filter((c) => c.estado === 'REALIZADA').length / citas.length) * 100) : 100,
  }

  const citasParaCSV = citas.map((c) => ({
    id: c.id,
    inicioLocal: enBogota(c.inicio),
    finLocal: c.finLocal || enBogota(c.fin),
    pacienteNombre: c.paciente.nombre,
    profesionalNombre: c.profesional.nombre,
    modalidad: c.modalidad,
    estado: c.estado,
    estadoLegible: c.estadoLegible,
    consentSigned: c.consentSigned,
    motivoCancelacion: c.motivoCancelacion,
  }))

  return (
    <>
      <Cabecera
        titulo="Historial General de Agenda"
        descripcion="Registro histórico y auditoría de todas las citas y acompañamientos de la red."
        acciones={<BotonExportarCSV citas={citasParaCSV} filename="historial-agenda-aquiestamos.csv" />}
      />

      <div className="pestanas-agenda">
        <Link className="pestana-boton" data-activo={false} href="/portal/agenda?vista=tablero">
          <LayoutGrid size={16} />
          Tablero de Casos
        </Link>
        <Link className="pestana-boton" data-activo={false} href="/portal/agenda?vista=semana">
          <CalendarDays size={16} />
          Calendario Semanal
        </Link>
        <Link className="pestana-boton" data-activo={true} href="/portal/agenda?vista=historial">
          <History size={16} />
          Historial General
        </Link>
      </div>

      {/* Tarjetas de Métricas (KPIs) */}
      <div className="metricas-grid">
        <div className="metrica-card">
          <span className="metrica-card__titulo">Total Citas</span>
          <span className="metrica-card__valor">{metricas.total}</span>
          <span className="metrica-card__sub">En el filtro seleccionado</span>
        </div>
        <div className="metrica-card">
          <span className="metrica-card__titulo">Realizadas</span>
          <span className="metrica-card__valor" style={{ color: '#059669' }}>
            {metricas.realizadas}
          </span>
          <span className="metrica-card__sub">Sesiones completadas</span>
        </div>
        <div className="metrica-card">
          <span className="metrica-card__titulo">Efectividad</span>
          <span className="metrica-card__valor" style={{ color: '#0284c7' }}>
            {metricas.tasaAsistencia}%
          </span>
          <span className="metrica-card__sub">Tasa de asistencia</span>
        </div>
        <div className="metrica-card">
          <span className="metrica-card__titulo">Canceladas / Ausencias</span>
          <span className="metrica-card__valor" style={{ color: '#dc2626' }}>
            {metricas.canceladas + metricas.noAsistio}
          </span>
          <span className="metrica-card__sub">
            {metricas.canceladas} canceladas · {metricas.noAsistio} ausencias
          </span>
        </div>
      </div>

      {/* Filtros de Búsqueda */}
      <form className="filtros" method="GET" action="/portal/agenda" style={{ marginBottom: 18 }}>
        <input type="hidden" name="vista" value="historial" />
        <div className="filtros__grupo">
          <input
            className="input"
            type="text"
            name="q"
            defaultValue={params.q || ''}
            placeholder="Buscar por paciente, teléfono o psicólogo…"
            style={{ minWidth: 260 }}
          />
          <select className="input" name="estado" defaultValue={params.estado || ''}>
            <option value="">Todos los estados</option>
            <option value="PROGRAMADA">Programada</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="REALIZADA">Realizada</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="NO_ASISTIO">No asistió</option>
            <option value="REPROGRAMADA">Reprogramada</option>
          </select>
          <button className="boton-mini" type="submit">
            Filtrar
          </button>
          {(params.q || params.estado) && (
            <Link className="boton-mini" href="/portal/agenda?vista=historial">
              Limpiar
            </Link>
          )}
        </div>
      </form>

      {citas.length === 0 ? (
        <Vacio>No se encontraron citas con los filtros especificados.</Vacio>
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Cuándo</th>
                <th>Persona Acompañada</th>
                <th>Psicólogo Asignado</th>
                <th>Modalidad</th>
                <th>Estado</th>
                <th>Consentimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="tabla__principal">{enBogota(c.inicio, false)}</span>
                    <span className="tabla__secundario">
                      {soloHora(c.inicio)} – {soloHora(c.fin)}
                    </span>
                  </td>
                  <td>
                    <Link href={`/portal/personas/${c.paciente.id}`} style={{ fontWeight: 600 }}>
                      {c.paciente.nombre ?? 'Persona'}
                    </Link>
                    {c.paciente.telefono && (
                      <span className="tabla__secundario">{c.paciente.telefono}</span>
                    )}
                  </td>
                  <td>
                    <Link href={`/portal/profesionales/${c.profesional.id}`}>
                      {c.profesional.nombre ?? 'Psicólogo'}
                    </Link>
                  </td>
                  <td>
                    <span style={{ textTransform: 'capitalize' }}>{c.modalidad.toLowerCase()}</span>
                  </td>
                  <td>
                    <Etiqueta estado={c.estado} texto={c.estadoLegible} />
                  </td>
                  <td>
                    {c.consentSigned ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: '0.82rem', fontWeight: 600 }}>
                        <FileCheck2 size={15} /> Firmado
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#d97706', fontSize: '0.82rem', fontWeight: 600 }}>
                        <FileClock size={15} /> Pendiente
                      </span>
                    )}
                  </td>
                  <td>
                    <Link className="boton-mini" href={`/portal/agenda/${c.id}`}>
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
