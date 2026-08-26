
'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  UserPlus, Trash2, CheckCircle2, XCircle, Clock, RefreshCw,
  Edit3, MessageSquarePlus, ArrowRightLeft, Check, Search, X,
  ExternalLink, MessageCircle, Link2, CheckCheck
} from 'lucide-react'
import type { Tarea, Asignacion, AsignacionStatus, TareaStatus, TareaPriority } from '../tipos'
import {
  STATUS_TAREA_COLOR, STATUS_ASIGNACION_COLOR, PRIORITY_COLOR,
  STATUS_ASIGNACION_TEXTO, DIA_LEGIBLE, FRANJA_LEGIBLE, AREA_ICONS,
  STATUS_TAREA_OPCIONES, DIA_SEMANA_MAP
} from '../tipos'

const AREA_LEGIBLE: Record<string, string> = {
  SALUD: 'Salud y primeros auxilios',
  SOCIAL_LEGAL_EDUCATIVO: 'Social, legal y educativo',
  OPERACION_LOGISTICA: 'Operación y logística',
  COMUNICACION_TECNOLOGIA: 'Comunicación y tecnología',
  GESTION_PROYECTOS: 'Gestión y proyectos',
  OTRA: 'Otra área',
}

const PRIORIDADES = [
  { value: 'ALTA', label: 'Alta' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'BAJA', label: 'Baja' },
]

type ColabSimple = {
  id: string
  fullName: string
  area: string
  discipline: string
  availableDays: string[]
  availableSlots: string[]
  email: string
  phone: string
  status?: string
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

  // Modales
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
  const [mostrarModalReasignar, setMostrarModalReasignar] = useState(false)
  const [mostrarFormNota, setMostrarFormNota] = useState(false)

  // Estados de edición
  const [formEdit, setFormEdit] = useState({
    title: tarea.title,
    description: tarea.description ?? '',
    dueDate: tarea.dueDate ?? '',
    startTime: tarea.startTime ?? '',
    endTime: tarea.endTime ?? '',
    materialsUrl: tarea.materialsUrl ?? '',
    priority: tarea.priority,
    notes: tarea.notes ?? '',
  })

  // Estados de reasignación
  const [reasignandoA, setReasignandoA] = useState<string | null>(null)
  const [notaReasignar, setNotaReasignar] = useState('')
  const [busquedaReasignar, setBusquedaReasignar] = useState('')

  // Estado de nueva nota rápida
  const [nuevaNotaTexto, setNuevaNotaTexto] = useState('')

  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function recargar() {
    const resp = await fetch('/api/portal/tasks/' + tarea.id)
    const data = await resp.json()
    if (data.success && data.data) {
      setTarea(data.data)
      setFormEdit({
        title: data.data.title,
        description: data.data.description ?? '',
        dueDate: data.data.dueDate ?? '',
        startTime: data.data.startTime ?? '',
        endTime: data.data.endTime ?? '',
        materialsUrl: data.data.materialsUrl ?? '',
        priority: data.data.priority,
        notes: data.data.notes ?? '',
      })
    }
  }

  // Guardar modificaciones completas
  async function guardarModificaciones(ev: React.FormEvent) {
    ev.preventDefault()
    setLoadingAction('editar')
    setError(null)
    try {
      const res = await fetch('/api/portal/tasks/' + tarea.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formEdit.title.trim(),
          description: formEdit.description.trim() || null,
          dueDate: formEdit.dueDate || null,
          startTime: formEdit.startTime || null,
          endTime: formEdit.endTime || null,
          materialsUrl: formEdit.materialsUrl.trim() || null,
          priority: formEdit.priority,
          notes: formEdit.notes.trim() || null,
        }),
      })
      const payload = await res.json()
      if (!res.ok || !payload.success) { setError(payload.message ?? 'Error al guardar.'); return }
      setMostrarModalEditar(false)
      await recargar()
    } catch { setError('Error de conexión.') }
    finally { setLoadingAction(null) }
  }

  // Reasignar tarea a otro voluntario
  async function ejecutarReasignacion() {
    if (!reasignandoA) return
    setLoadingAction('reasignar')
    setError(null)
    try {
      const res = await fetch('/api/portal/tasks/' + tarea.id + '/reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newCollaboratorId: reasignandoA,
          note: notaReasignar.trim() || null,
        }),
      })
      const payload = await res.json()
      if (!res.ok || !payload.success) { setError(payload.message ?? 'Error al reasignar.'); return }
      setMostrarModalReasignar(false)
      setReasignandoA(null)
      setNotaReasignar('')
      await recargar()
    } catch { setError('Error de conexión.') }
    finally { setLoadingAction(null) }
  }

  // Agregar nota rápida a la bitácora
  async function agregarNotaRapida(ev: React.FormEvent) {
    ev.preventDefault()
    if (!nuevaNotaTexto.trim()) return
    setLoadingAction('nota')
    setError(null)
    try {
      const res = await fetch('/api/portal/tasks/' + tarea.id + '/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: nuevaNotaTexto.trim() }),
      })
      const payload = await res.json()
      if (!res.ok || !payload.success) { setError(payload.message ?? 'Error al agregar nota.'); return }
      setNuevaNotaTexto('')
      setMostrarFormNota(false)
      await recargar()
    } catch { setError('Error de conexión.') }
    finally { setLoadingAction(null) }
  }

  async function cambiarEstadoTarea(status: string) {
    setLoadingAction('estado-tarea')
    try {
      const res = await fetch('/api/portal/tasks/' + tarea.id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) await recargar()
    } catch {}
    finally { setLoadingAction(null) }
  }

  async function cambiarEstadoAsignacion(assignmentId: string, status: string) {
    setLoadingAction(assignmentId + '-status')
    try {
      const res = await fetch('/api/portal/tasks/' + tarea.id + '/assign/' + assignmentId + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) await recargar()
    } catch {}
    finally { setLoadingAction(null) }
  }

  async function quitarAsignacion(assignmentId: string) {
    if (!confirm('¿Quitar esta asignación?')) return
    setLoadingAction(assignmentId)
    try {
      const res = await fetch('/api/portal/tasks/' + tarea.id + '/assign/' + assignmentId, { method: 'DELETE' })
      if (res.ok) await recargar()
    } catch {}
    finally { setLoadingAction(null) }
  }

  // Generar link de WhatsApp directo
  function abrirWhatsApp(colab: ColabSimple, token?: string) {
    const digitos = colab.phone.replace(/\D/g, '')
    const telefono = digitos.length === 10 ? '57' + digitos : digitos
    const primerNombre = colab.fullName.split(' ')[0] ?? colab.fullName
    const linkConfirmacion = token ? 'https://www.redaquiestamos.org/turno/' + token : ''

    const mensaje = [
      `Hola ${primerNombre}, ¡esperamos que estés muy bien!`,
      `Desde la Red Aquí Estamos te invitamos a apoyarnos con la siguiente labor: *${tarea.title}*.`,
      tarea.dueDate ? `📅 Fecha: ${new Date(tarea.dueDate + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}` : null,
      tarea.startTime ? `⏰ Horario: ${tarea.startTime}${tarea.endTime ? ' a ' + tarea.endTime : ''}` : null,
      linkConfirmacion ? `\nPuedes ver todos los detalles y confirmar tu turno directamente aquí:\n${linkConfirmacion}` : null,
      `\n¡Muchas gracias por tu compromiso!`,
    ].filter(Boolean).join('\n')

    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  const coloresStatus = STATUS_TAREA_COLOR[tarea.status] ?? STATUS_TAREA_COLOR.BORRADOR
  const coloresPriority = PRIORITY_COLOR[tarea.priority] ?? PRIORITY_COLOR.MEDIA

  const diaSemana = useMemo(() => {
    if (!tarea.dueDate) return null
    const [y, m, d] = tarea.dueDate.split('-').map(Number)
    return DIA_SEMANA_MAP[new Date(y, m - 1, d).getDay()] ?? null
  }, [tarea.dueDate])

  const franjasRequeridas = useMemo(() => {
    if (!tarea.startTime && !tarea.endTime) return []
    const parseHour = (t?: string | null) => {
      if (!t) return null
      const [h, m] = t.split(':').map(Number)
      return h + (m || 0) / 60
    }
    const inicio = parseHour(tarea.startTime)
    const fin = parseHour(tarea.endTime)
    const franjas: string[] = []
    if (inicio !== null && fin === null) {
      if (inicio < 12) franjas.push('MANANA')
      else if (inicio < 18) franjas.push('TARDE')
      else franjas.push('NOCHE')
      return franjas
    }
    if (inicio !== null && fin !== null) {
      if (inicio < 12 && fin > 0) franjas.push('MANANA')
      if ((inicio < 18 && fin > 12) || (inicio >= 12 && inicio < 18)) franjas.push('TARDE')
      if (fin > 18 || inicio >= 18) franjas.push('NOCHE')
      return Array.from(new Set(franjas))
    }
    if (fin !== null) {
      if (fin <= 12) franjas.push('MANANA')
      else if (fin <= 18) franjas.push('TARDE')
      else franjas.push('NOCHE')
    }
    return franjas
  }, [tarea.startTime, tarea.endTime])

  const [ignorarFiltroReasignar, setIgnorarFiltroReasignar] = useState(false)

  const voluntariosParaReasignar = useMemo(() => {
    return colaboradoresDisponibles
      .filter((c) => {
        const matchActivo = !c.status || c.status === 'ACTIVO'
        const matchArea = c.area === tarea.area || tarea.area === 'OTRA'
        const matchBusqueda =
          !busquedaReasignar ||
          c.fullName.toLowerCase().includes(busquedaReasignar.toLowerCase()) ||
          c.discipline.toLowerCase().includes(busquedaReasignar.toLowerCase())

        if (!matchActivo || !matchArea || !matchBusqueda) return false

        if (!ignorarFiltroReasignar) {
          if (diaSemana && (!c.availableDays || !c.availableDays.includes(diaSemana))) {
            return false
          }
          if (franjasRequeridas.length > 0) {
            const tieneFranja = franjasRequeridas.some((f) => c.availableSlots?.includes(f))
            if (!tieneFranja) return false
          }
        }

        return true
      })
      .map((c) => {
        const coincideDia = diaSemana ? c.availableDays?.includes(diaSemana) : false
        return { ...c, coincideDia }
      })
      .sort((a, b) => (b.coincideDia ? 1 : 0) - (a.coincideDia ? 1 : 0))
  }, [colaboradoresDisponibles, tarea.area, diaSemana, franjasRequeridas, busquedaReasignar, ignorarFiltroReasignar])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'flex-start' }}>
      {/* Columna Izquierda: Información Principal y Operaciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Barra superior de Estado y Acciones */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: coloresStatus.bg, color: coloresStatus.color, border: '1px solid ' + coloresStatus.border }}>
              {tarea.statusLegible}
            </span>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '4px 9px', borderRadius: 6, background: coloresPriority.bg, color: coloresPriority.color }}>
              {tarea.priorityLegible}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {puedeEditar && (
              <button
                type="button"
                onClick={() => setMostrarModalEditar(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, border: '1.5px solid #e2e8f0', background: '#fff', color: '#1e293b', cursor: 'pointer' }}
              >
                <Edit3 size={13} />
                Realizar modificaciones
              </button>
            )}

            {puedeAsignar && (
              <button
                type="button"
                onClick={() => setMostrarModalReasignar(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, border: '1.5px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer' }}
              >
                <ArrowRightLeft size={13} />
                Reasignar tarea
              </button>
            )}
          </div>
        </div>

        {/* Fechas y Horarios */}
        {(tarea.dueDate || tarea.startTime || tarea.endTime) && (
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {tarea.dueDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', color: '#1e293b' }}>
                <Clock size={16} color="#059669" />
                <span>
                  <strong>Fecha:</strong> {new Date(tarea.dueDate + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
            {(tarea.startTime || tarea.endTime) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', color: '#1e293b' }}>
                <span>
                  <strong>Horario:</strong> {tarea.startTime ?? 'Inicio'} {tarea.endTime ? 'a ' + tarea.endTime : ''}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Enlace de Materiales / Drive */}
        {tarea.materialsUrl && (
          <div style={{ background: '#ecfdf5', borderRadius: 10, padding: '12px 16px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link2 size={16} color="#059669" />
              <span style={{ fontSize: '0.88rem', color: '#065f46', fontWeight: 600 }}>
                Recursos / Materiales de trabajo adjuntos
              </span>
            </div>
            <a
              href={tarea.materialsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6, background: '#059669', color: '#fff', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}
            >
              Abrir carpeta / Drive
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {/* Descripción */}
        {tarea.description && (
          <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', margin: '0 0 6px' }}>Descripción de la labor</p>
            <p style={{ fontSize: '0.92rem', color: '#1e293b', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-wrap' }}>{tarea.description}</p>
          </div>
        )}

        {/* Bitácora y Notas internas */}
        <div style={{ background: '#fffbeb', borderRadius: 12, padding: '16px', border: '1px solid #fde68a', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.86rem', fontWeight: 700, color: '#92400e', margin: 0 }}>
              Notas e instrucciones internas de coordinación
            </p>
            {puedeEditar && !mostrarFormNota && (
              <button
                type="button"
                onClick={() => setMostrarFormNota(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, background: '#fff', color: '#92400e', border: '1px solid #fde68a', cursor: 'pointer' }}
              >
                <MessageSquarePlus size={13} />
                Agregar nota
              </button>
            )}
          </div>

          {tarea.notes ? (
            <p style={{ fontSize: '0.88rem', color: '#78350f', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
              {tarea.notes}
            </p>
          ) : (
            <p style={{ fontSize: '0.82rem', color: '#b45309', margin: 0, fontStyle: 'italic' }}>
              No hay notas internas agregadas a esta tarea.
            </p>
          )}

          {mostrarFormNota && (
            <form onSubmit={agregarNotaRapida} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
              <textarea
                rows={2}
                placeholder="Escribe una actualización o nota de seguimiento..."
                value={nuevaNotaTexto}
                onChange={(e) => setNuevaNotaTexto(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, fontSize: '0.86rem', border: '1.5px solid #fde68a', outline: 'none', background: '#fff' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => { setMostrarFormNota(false); setNuevaNotaTexto('') }}
                  style={{ padding: '5px 12px', borderRadius: 6, fontSize: '0.78rem', background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingAction === 'nota' || !nuevaNotaTexto.trim()}
                  style={{ padding: '5px 14px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, background: '#059669', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  {loadingAction === 'nota' ? 'Guardando...' : 'Guardar nota'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sección de Voluntarios Asignados */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: '0.94rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Voluntarios asignados ({(tarea.assignments ?? []).length})
            </p>
          </div>

          {(tarea.assignments ?? []).length === 0 ? (
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 10, padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 10px' }}>Esta tarea aún no tiene voluntario asignado.</p>
              {puedeAsignar && (
                <button
                  type="button"
                  onClick={() => setMostrarModalReasignar(true)}
                  style={{ padding: '8px 16px', borderRadius: 8, fontSize: '0.84rem', fontWeight: 700, background: '#059669', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  Asignar voluntario ahora
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(tarea.assignments ?? []).map((a) => {
                const ca = STATUS_ASIGNACION_COLOR[a.status] ?? { bg: '#f1f5f9', color: '#475569' }
                return (
                  <div key={a.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <div>
                        <strong style={{ fontSize: '0.96rem', color: '#1e293b', display: 'block' }}>{a.collaborator?.fullName ?? '—'}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#475569' }}>{a.collaborator?.discipline ?? ''} · {a.collaborator?.email ?? ''}</span>
                      </div>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: ca.bg, color: ca.color }}>
                        {STATUS_ASIGNACION_TEXTO[a.status] ?? a.status}
                      </span>
                    </div>

                    {/* Reporte de entrega del voluntario si ya completó */}
                    {(a.completionUrl || a.completionNote) && (
                      <div style={{ background: '#ecfdf5', borderRadius: 8, padding: '10px 12px', border: '1px solid #a7f3d0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#065f46', fontWeight: 700, fontSize: '0.82rem' }}>
                          <CheckCheck size={15} color="#059669" />
                          <span>Entrega realizada por el voluntario:</span>
                        </div>
                        {a.completionNote && <p style={{ fontSize: '0.86rem', color: '#065f46', margin: 0 }}>{a.completionNote}</p>}
                        {a.completionUrl && (
                          <a
                            href={a.completionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#047857', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'underline' }}
                          >
                            Ver enlace de entrega / Drive <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    )}

                    {a.note && (
                      <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, background: '#f8fafc', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                        <strong>Nota de invitación:</strong> {a.note}
                      </p>
                    )}
                    {a.declineReason && (
                      <p style={{ fontSize: '0.82rem', color: '#dc2626', margin: 0, background: '#fef2f2', padding: '6px 10px', borderRadius: 6 }}>
                        <strong>Motivo de rechazo:</strong> {a.declineReason}
                      </p>
                    )}

                    {puedeAsignar && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4, alignItems: 'center' }}>
                        {/* Botón WhatsApp directo */}
                        {a.collaborator?.phone && (
                          <button
                            type="button"
                            onClick={() => abrirWhatsApp(a.collaborator!, a.confirmToken)}
                            style={{
                              padding: '5px 12px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 700,
                              border: '1.5px solid #22c55e', background: '#f0fdf4', color: '#15803d',
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
                            }}
                          >
                            <MessageCircle size={13} />
                            Enviar por WhatsApp
                          </button>
                        )}

                        {a.status === 'ACEPTADO' && (
                          <button onClick={() => cambiarEstadoAsignacion(a.id, 'EN_PROGRESO')} style={{ padding: '5px 12px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 700, border: '1.5px solid #fde68a', background: '#fffbeb', color: '#d97706', cursor: 'pointer' }}>
                            Marcar En progreso
                          </button>
                        )}
                        {a.status === 'EN_PROGRESO' && (
                          <button onClick={() => cambiarEstadoAsignacion(a.id, 'COMPLETADO')} style={{ padding: '5px 12px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 700, border: '1.5px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', cursor: 'pointer' }}>
                            Marcar Completado
                          </button>
                        )}
                        <button
                          onClick={() => setMostrarModalReasignar(true)}
                          style={{ padding: '5px 12px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 700, border: '1.5px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <ArrowRightLeft size={12} />
                          Reasignar
                        </button>
                        <button onClick={() => quitarAsignacion(a.id)} style={{ padding: '5px 10px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 700, border: '1.5px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
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

      {/* Columna Derecha: Metadata y Estado */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Información general
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0 0 2px' }}>Área de labor</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              {AREA_ICONS[tarea.area] ?? ''} {AREA_LEGIBLE[tarea.area] ?? tarea.area}
            </p>
          </div>

          <div>
            <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0 0 2px' }}>Fecha de creación</p>
            <p style={{ fontSize: '0.86rem', color: '#1e293b', margin: 0 }}>
              {new Date(tarea.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {tarea.createdByEmail && (
            <div>
              <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0 0 2px' }}>Creada por</p>
              <p style={{ fontSize: '0.84rem', color: '#1e293b', margin: 0 }}>{tarea.createdByEmail}</p>
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />

          {puedeEditar && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', margin: 0 }}>Cambiar estado:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {STATUS_TAREA_OPCIONES.filter(o => o.value !== tarea.status).map((o) => {
                  const c = STATUS_TAREA_COLOR[o.value]
                  return (
                    <button
                      key={o.value}
                      onClick={() => cambiarEstadoTarea(o.value)}
                      disabled={loadingAction === 'estado-tarea'}
                      style={{
                        padding: '7px 12px', borderRadius: 7, fontSize: '0.8rem', fontWeight: 700,
                        border: '1.5px solid ' + c.border, background: c.bg, color: c.color,
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      → Pasar a {o.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Realizar Modificaciones */}
      {mostrarModalEditar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 600, width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Realizar modificaciones a la tarea</h2>
              <button onClick={() => setMostrarModalEditar(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={guardarModificaciones} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 700 }}>Título de la tarea *</label>
                <input
                  type="text"
                  value={formEdit.title}
                  onChange={(e) => setFormEdit({ ...formEdit, title: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 700 }}>Descripción</label>
                <textarea
                  rows={3}
                  value={formEdit.description}
                  onChange={(e) => setFormEdit({ ...formEdit, description: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 700 }}>Enlace de materiales / Google Drive / Plantilla</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={formEdit.materialsUrl}
                  onChange={(e) => setFormEdit({ ...formEdit, materialsUrl: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Fecha límite</label>
                  <input
                    type="date"
                    value={formEdit.dueDate}
                    onChange={(e) => setFormEdit({ ...formEdit, dueDate: e.target.value })}
                    style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.86rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Hora inicio</label>
                  <input
                    type="time"
                    value={formEdit.startTime}
                    onChange={(e) => setFormEdit({ ...formEdit, startTime: e.target.value })}
                    style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.86rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Hora fin</label>
                  <input
                    type="time"
                    value={formEdit.endTime}
                    onChange={(e) => setFormEdit({ ...formEdit, endTime: e.target.value })}
                    style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.86rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Prioridad</label>
                  <select
                    value={formEdit.priority}
                    onChange={(e) => setFormEdit({ ...formEdit, priority: e.target.value as TareaPriority })}
                    style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.86rem', background: '#fff' }}
                  >
                    {PRIORIDADES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 700 }}>Instrucciones internas</label>
                <textarea
                  rows={3}
                  value={formEdit.notes}
                  onChange={(e) => setFormEdit({ ...formEdit, notes: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.88rem', resize: 'vertical' }}
                />
              </div>

              {error && <p style={{ color: '#dc2626', fontSize: '0.84rem', margin: 0 }}>{error}</p>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setMostrarModalEditar(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loadingAction === 'editar'} style={{ padding: '9px 20px', borderRadius: 8, background: '#059669', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  {loadingAction === 'editar' ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reasignar Tarea */}
      {mostrarModalReasignar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 640, width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Reasignar tarea a otro voluntario</h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Selecciona al nuevo voluntario. Se le enviará automáticamente un nuevo correo con su enlace de confirmación.
                </p>
              </div>
              <button onClick={() => setMostrarModalReasignar(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                {diaSemana || franjasRequeridas.length > 0
                  ? (ignorarFiltroReasignar ? '⚠️ Mostrando todos los voluntarios del área (por excepción):' : `Mostrando únicamente voluntarios disponibles para ${diaSemana ? DIA_LEGIBLE[diaSemana] : ''} ${franjasRequeridas.length > 0 ? '(' + franjasRequeridas.map(f => FRANJA_LEGIBLE[f] ?? f).join(', ') + ')' : ''}:`)
                  : 'Voluntarios disponibles:'}
              </p>
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Buscar por nombre o disciplina..."
                value={busquedaReasignar}
                onChange={(e) => setBusquedaReasignar(e.target.value)}
                style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 8, fontSize: '0.86rem', border: '1.5px solid #e2e8f0', outline: 'none' }}
              />
            </div>

            {voluntariosParaReasignar.length === 0 ? (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={{ fontSize: '0.84rem', color: '#92400e', margin: 0, fontWeight: 600 }}>
                  No hay voluntarios con disponibilidad exacta para este día u horario.
                </p>
                <button
                  type="button"
                  onClick={() => setIgnorarFiltroReasignar(true)}
                  style={{ fontSize: '0.78rem', fontWeight: 700, padding: '5px 12px', borderRadius: 6, background: '#1d4ed8', color: '#fff', border: 'none', cursor: 'pointer', alignSelf: 'center' }}
                >
                  Mostrar todos los voluntarios del área
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                {voluntariosParaReasignar.map((c) => {
                  const sel = reasignandoA === c.id
                  return (
                    <div
                      key={c.id}
                      onClick={() => setReasignandoA(sel ? null : c.id)}
                      style={{
                        display: 'flex', flexDirection: 'column', gap: 4,
                        padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                        border: '2px solid ' + (sel ? '#1d4ed8' : '#e2e8f0'),
                        background: sel ? '#eff6ff' : '#fff',
                      }}
                    >
                      <strong style={{ fontSize: '0.88rem', color: sel ? '#1d4ed8' : '#0f172a' }}>{c.fullName}</strong>
                      <span style={{ fontSize: '0.78rem', color: '#475569' }}>{c.discipline}</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {c.coincideDia && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 5px', borderRadius: 4, background: '#dcfce7', color: '#15803d' }}>
                            ✨ Disponible {diaSemana ? DIA_LEGIBLE[diaSemana] : ''}
                          </span>
                        )}
                        {c.availableSlots?.map((s) => (
                          <span key={s} style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: 4, background: '#f1f5f9', color: '#475569' }}>
                            {FRANJA_LEGIBLE[s] ?? s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {reasignandoA && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                  Nota personalizada para el nuevo voluntario (opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej: Te reasignamos esta labor con fecha límite para esta semana."
                  value={notaReasignar}
                  onChange={(e) => setNotaReasignar(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, fontSize: '0.86rem', border: '1.5px solid #e2e8f0', outline: 'none' }}
                />
              </div>
            )}

            {error && <p style={{ color: '#dc2626', fontSize: '0.84rem', margin: 0 }}>{error}</p>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setMostrarModalReasignar(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button
                type="button"
                disabled={!reasignandoA || loadingAction === 'reasignar'}
                onClick={ejecutarReasignacion}
                style={{
                  padding: '9px 20px', borderRadius: 8, fontWeight: 700,
                  background: !reasignandoA ? '#94a3b8' : '#1d4ed8', color: '#fff', border: 'none', cursor: !reasignandoA ? 'default' : 'pointer'
                }}
              >
                {loadingAction === 'reasignar' ? 'Reasignando...' : 'Confirmar y Enviar Invitación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
