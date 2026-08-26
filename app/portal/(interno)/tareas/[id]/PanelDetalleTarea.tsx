
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Trash2, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import type { Tarea, Asignacion, AsignacionStatus, TareaStatus } from '../tipos'
import { STATUS_TAREA_COLOR, STATUS_ASIGNACION_COLOR, PRIORITY_COLOR, STATUS_ASIGNACION_TEXTO, DIA_LEGIBLE, FRANJA_LEGIBLE, AREA_ICONS, STATUS_TAREA_OPCIONES } from '../tipos'

const AREA_LEGIBLE: Record<string, string> = {
  SALUD: 'Salud y primeros auxilios',
  SOCIAL_LEGAL_EDUCATIVO: 'Social, legal y educativo',
  OPERACION_LOGISTICA: 'Operacion y logistica',
  COMUNICACION_TECNOLOGIA: 'Comunicacion y tecnologia',
  GESTION_PROYECTOS: 'Gestion y proyectos',
  OTRA: 'Otra area',
}

type ColabSimple = { id: string; fullName: string; area: string; discipline: string; availableDays: string[]; availableSlots: string[]; email: string; phone: string }

function EtiquetaStatus({ status, tipo }: { status: string; tipo: 'tarea' | 'asignacion' }) {
  const color = tipo === 'tarea'
    ? STATUS_TAREA_COLOR[status as TareaStatus] ?? { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' }
    : STATUS_ASIGNACION_COLOR[status as AsignacionStatus] ?? { bg: '#f1f5f9', color: '#475569' }
  return (
    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: color.bg, color: color.color }}>
      {tipo === 'tarea' ? (STATUS_TAREA_OPCIONES.find(o => o.value === status)?.label ?? status) : (STATUS_ASIGNACION_TEXTO[status as AsignacionStatus] ?? status)}
    </span>
  )
}

export function PanelDetalleTarea({
  tarea: tareaInicial,
  colaboradoresDisponibles,
  puedeAsignar,
  puedeEditar,
}: {
  tarea: Tarea
  colaboradoresDisponibles: ColabSimple[]
  puedeAsignar: boolean
  puedeEditar: boolean
}) {
  const router = useRouter()
  const [tarea, setTarea] = useState(tareaInicial)
  const [busqueda, setBusqueda] = useState('')
  const [asignando, setAsignando] = useState(false)
  const [nota, setNota] = useState('')
  const [colabSeleccionado, setColabSeleccionado] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)

  // IDs ya asignados para no mostrarlos de nuevo
  const yaAsignados = new Set((tarea.assignments ?? []).map(a => a.collaborator?.id).filter(Boolean))

  // Filtrar colaboradores compatibles por area y busqueda
  const compatibles = colaboradoresDisponibles.filter((c) => {
    const mismaArea = c.area === tarea.area || tarea.area === 'OTRA'
    const noAsignado = !yaAsignados.has(c.id)
    const matchBusqueda = !busqueda || c.fullName.toLowerCase().includes(busqueda.toLowerCase()) || c.discipline.toLowerCase().includes(busqueda.toLowerCase())
    return mismaArea && noAsignado && matchBusqueda
  })

  async function recargar() {
    const resp = await fetch('/api/portal/tasks/' + tarea.id)
    const data = await resp.json()
    if (data.success && data.data) setTarea(data.data)
  }

  async function asignarVoluntario() {
    if (!colabSeleccionado) return
    setLoadingId('asignar')
    setError(null)
    try {
      const res = await fetch('/api/portal/tasks/' + tarea.id + '/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collaboratorId: colabSeleccionado, note: nota.trim() || null }),
      })
      const payload = await res.json()
      if (!res.ok || !payload.success) { setError(payload.message ?? 'No se pudo asignar.'); return }
      setAsignando(false)
      setColabSeleccionado(null)
      setNota('')
      await recargar()
    } catch { setError('Error de conexion.') }
    finally { setLoadingId(null) }
  }

  async function quitarAsignacion(assignmentId: string) {
    if (!confirm('Quitar esta asignacion?')) return
    setLoadingId(assignmentId)
    try {
      const res = await fetch('/api/portal/tasks/' + tarea.id + '/assign/' + assignmentId, { method: 'DELETE' })
      if (res.ok) await recargar()
    } catch {}
    finally { setLoadingId(null) }
  }

  async function cambiarEstadoAsignacion(assignmentId: string, status: string) {
    setLoadingId(assignmentId + '-status')
    try {
      const res = await fetch('/api/portal/tasks/' + tarea.id + '/assign/' + assignmentId + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) await recargar()
    } catch {}
    finally { setLoadingId(null) }
  }

  async function cambiarEstadoTarea(status: string) {
    setCambiandoEstado(true)
    try {
      const res = await fetch('/api/portal/tasks/' + tarea.id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const payload = await res.json()
      if (res.ok && payload.success) setTarea(payload.data)
    } catch {}
    finally { setCambiandoEstado(false) }
  }

  const coloresStatus = STATUS_TAREA_COLOR[tarea.status] ?? STATUS_TAREA_COLOR.BORRADOR
  const coloresPriority = PRIORITY_COLOR[tarea.priority] ?? PRIORITY_COLOR.MEDIA

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'flex-start' }}>
      {/* Columna izquierda: info de la tarea */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Estado + Prioridad */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <EtiquetaStatus status={tarea.status} tipo="tarea" />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: coloresPriority.bg, color: coloresPriority.color }}>{tarea.priorityLegible}</span>
          {tarea.dueDate && (
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              📅 Vence: {new Date(tarea.dueDate + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Descripcion */}
        {tarea.description && (
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Descripcion</p>
            <p style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-wrap' }}>{tarea.description}</p>
          </div>
        )}

        {/* Notas internas */}
        {tarea.notes && (
          <div style={{ background: '#fffbeb', borderRadius: 10, padding: '14px 16px', border: '1px solid #fde68a' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400e', marginBottom: 6 }}>Instrucciones internas</p>
            <p style={{ fontSize: '0.88rem', color: '#78350f', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-wrap' }}>{tarea.notes}</p>
          </div>
        )}

        {/* Cambiar estado */}
        {puedeEditar && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', margin: 0 }}>Cambiar estado de la tarea</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {STATUS_TAREA_OPCIONES.filter(o => o.value !== tarea.status).map((o) => {
                const c = STATUS_TAREA_COLOR[o.value]
                return (
                  <button key={o.value} onClick={() => cambiarEstadoTarea(o.value)} disabled={cambiandoEstado} style={{ padding: '6px 14px', borderRadius: 7, fontSize: '0.8rem', fontWeight: 700, border: '1.5px solid ' + c.border, background: c.bg, color: c.color, cursor: 'pointer' }}>
                    {o.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Lista de asignaciones */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Voluntarios asignados ({(tarea.assignments ?? []).length})
            </p>
            {puedeAsignar && (
              <button onClick={() => setAsignando(!asignando)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, border: '1.5px solid #059669', background: asignando ? '#ecfdf5' : '#fff', color: '#059669', cursor: 'pointer' }}>
                <UserPlus size={14} />
                {asignando ? 'Cerrar buscador' : 'Asignar voluntario'}
              </button>
            )}
          </div>

          {/* Buscador de voluntarios compatibles */}
          {asignando && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                Mostrando voluntarios del area <strong>{AREA_LEGIBLE[tarea.area] ?? tarea.area}</strong> que aun no estan asignados.
              </p>
              <input
                type="text"
                placeholder="Buscar por nombre o disciplina..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, fontSize: '0.88rem', border: '1.5px solid #e2e8f0', outline: 'none', color: '#1e293b' }}
              />

              {compatibles.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>No hay voluntarios disponibles con esa area todavia.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                  {compatibles.map((c) => {
                    const sel = colabSeleccionado === c.id
                    return (
                      <button key={c.id} type="button" onClick={() => setColabSeleccionado(sel ? null : c.id)} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', borderRadius: 8, border: '2px solid ' + (sel ? '#059669' : '#e2e8f0'), background: sel ? '#ecfdf5' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: sel ? '#065f46' : '#1e293b' }}>{c.fullName}</span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {c.discipline} · {c.availableDays?.map(d => DIA_LEGIBLE[d] ?? d).join(' ')} · {c.availableSlots?.map(s => FRANJA_LEGIBLE[s] ?? s).join(', ')}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{c.email}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {colabSeleccionado && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea
                    rows={2}
                    placeholder="Nota para el voluntario (opcional): fecha limite, instrucciones especificas..."
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 8, fontSize: '0.88rem', border: '1.5px solid #e2e8f0', outline: 'none', resize: 'vertical', lineHeight: 1.4 }}
                  />
                  {error && <p style={{ color: '#dc2626', fontSize: '0.82rem', margin: 0 }}>{error}</p>}
                  <button onClick={asignarVoluntario} disabled={loadingId === 'asignar'} style={{ alignSelf: 'flex-end', padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: '0.86rem', background: '#059669', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    {loadingId === 'asignar' ? 'Enviando...' : 'Asignar y enviar email'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tabla de asignados */}
          {(tarea.assignments ?? []).length === 0 ? (
            <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>Todavia no hay voluntarios asignados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(tarea.assignments ?? []).map((a) => {
                const ca = STATUS_ASIGNACION_COLOR[a.status] ?? { bg: '#f1f5f9', color: '#475569' }
                return (
                  <div key={a.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block' }}>{a.collaborator?.fullName ?? '—'}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{a.collaborator?.discipline ?? ''} · {a.collaborator?.email ?? ''}</span>
                      </div>
                      <EtiquetaStatus status={a.status} tipo="asignacion" />
                    </div>

                    {a.note && <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, fontStyle: 'italic' }}>Nota: {a.note}</p>}
                    {a.declineReason && <p style={{ fontSize: '0.8rem', color: '#dc2626', margin: 0 }}>Rechazo: {a.declineReason}</p>}
                    {a.respondedAt && <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: 0 }}>Respondio: {new Date(a.respondedAt).toLocaleDateString('es-CO')}</p>}

                    {puedeAsignar && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {a.status === 'ACEPTADO' && (
                          <button onClick={() => cambiarEstadoAsignacion(a.id, 'EN_PROGRESO')} disabled={loadingId === a.id + '-status'} style={{ padding: '5px 12px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 700, border: '1.5px solid #fde68a', background: '#fffbeb', color: '#d97706', cursor: 'pointer' }}>
                            Marcar En progreso
                          </button>
                        )}
                        {a.status === 'EN_PROGRESO' && (
                          <button onClick={() => cambiarEstadoAsignacion(a.id, 'COMPLETADO')} disabled={loadingId === a.id + '-status'} style={{ padding: '5px 12px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 700, border: '1.5px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', cursor: 'pointer' }}>
                            Marcar Completado
                          </button>
                        )}
                        <button onClick={() => quitarAsignacion(a.id)} disabled={loadingId === a.id} style={{ padding: '5px 10px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 700, border: '1.5px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Trash2 size={12} />
                          Quitar
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Columna derecha: metadata */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Detalles</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0 0 2px' }}>Area</p>
            <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>{AREA_ICONS[tarea.area] ?? ''} {AREA_LEGIBLE[tarea.area] ?? tarea.area}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0 0 2px' }}>Creada</p>
            <p style={{ fontSize: '0.88rem', color: '#1e293b', margin: 0 }}>{new Date(tarea.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          {tarea.createdByEmail && (
            <div>
              <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0 0 2px' }}>Creada por</p>
              <p style={{ fontSize: '0.84rem', color: '#1e293b', margin: 0 }}>{tarea.createdByEmail}</p>
            </div>
          )}
          <div>
            <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0 0 2px' }}>Voluntarios asignados</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{(tarea.assignments ?? []).length}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0 0 2px' }}>Respondieron</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', margin: 0 }}>
              {(tarea.assignments ?? []).filter(a => ['ACEPTADO', 'RECHAZADO'].includes(a.status)).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
