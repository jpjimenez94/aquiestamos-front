
'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Filter, AlertTriangle, Clock, Users, ArrowUpDown, Plus } from 'lucide-react'
import type { Tarea, TareaStatus, TareaPriority } from './tipos'
import { STATUS_TAREA_COLOR, PRIORITY_COLOR, AREA_ICONS } from './tipos'

const AREAS = [
  { value: '', label: 'Todas las áreas' },
  { value: 'SALUD', label: 'Salud y primeros auxilios' },
  { value: 'SOCIAL_LEGAL_EDUCATIVO', label: 'Social, legal y educativo' },
  { value: 'OPERACION_LOGISTICA', label: 'Operación y logística' },
  { value: 'COMUNICACION_TECNOLOGIA', label: 'Comunicación y tecnología' },
  { value: 'GESTION_PROYECTOS', label: 'Gestión y proyectos' },
  { value: 'OTRA', label: 'Otra área' },
]

const PRIORIDADES = [
  { value: '', label: 'Todas las prioridades' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'BAJA', label: 'Baja' },
]

function TarjetaTarea({ tarea }: { tarea: Tarea }) {
  const colores = STATUS_TAREA_COLOR[tarea.status] ?? STATUS_TAREA_COLOR.BORRADOR
  const pColor = PRIORITY_COLOR[tarea.priority] ?? PRIORITY_COLOR.MEDIA
  const hoy = new Date()

  const vencida =
    tarea.dueDate &&
    new Date(tarea.dueDate + 'T23:59:59') < hoy &&
    !['COMPLETADA', 'CANCELADA'].includes(tarea.status)

  const sinRespuesta48h = useMemo(() => {
    if (!tarea.assignments || tarea.assignments.length === 0) return false
    return tarea.assignments.some((a) => {
      if (a.status !== 'INVITADO') return false
      const creacion = new Date(a.createdAt).getTime()
      const horas = (Date.now() - creacion) / (1000 * 60 * 60)
      return horas >= 48
    })
  }, [tarea.assignments])

  return (
    <Link
      href={'/portal/tareas/' + tarea.id}
      style={{
        display: 'block',
        background: '#fff',
        border: '1px solid',
        borderColor: sinRespuesta48h ? '#f59e0b' : colores.border,
        borderRadius: 12,
        padding: '15px 16px',
        textDecoration: 'none',
        color: 'inherit',
        boxShadow: sinRespuesta48h ? '0 0 0 1px #f59e0b, 0 2px 6px rgba(245,158,11,0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
      }}
    >
      {sinRespuesta48h && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', fontWeight: 800, color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: 5, marginBottom: 8 }}>
          <AlertTriangle size={12} />
          <span>Sin respuesta (+48h) · Requiere atención</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
        <strong style={{ fontSize: '0.92rem', color: '#0f172a', lineHeight: 1.3, flex: 1 }}>{tarea.title}</strong>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: colores.bg, color: colores.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {tarea.statusLegible}
        </span>
      </div>

      {tarea.description && (
        <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 10px', lineHeight: 1.4 }}>
          {tarea.description.length > 110 ? tarea.description.slice(0, 110) + '...' : tarea.description}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: pColor.bg, color: pColor.color }}>{tarea.priorityLegible}</span>
        <span style={{ fontSize: '0.76rem', color: '#64748b' }}>{tarea.areaLegible}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: '0.76rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: 8, marginTop: 4 }}>
        {tarea.dueDate && (
          <span style={{ color: vencida ? '#dc2626' : '#64748b', fontWeight: vencida ? 700 : 400 }}>
            {vencida ? '⚠️ Vencida: ' : '📅 '}
            {new Date(tarea.dueDate + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
          </span>
        )}

        {(tarea.startTime || tarea.endTime) && (
          <span>
            ⏰ {tarea.startTime ?? ''}{tarea.endTime ? ' - ' + tarea.endTime : ''}
          </span>
        )}

        <span style={{ marginLeft: 'auto', fontWeight: 600, color: tarea.totalAssignments > 0 ? '#059669' : '#94a3b8' }}>
          {tarea.totalAssignments > 0 ? '👥 ' + tarea.totalAssignments + ' asignado' + (tarea.totalAssignments > 1 ? 's' : '') : 'Sin asignar'}
        </span>
      </div>
    </Link>
  )
}

function Columna({ titulo, tareas, estado }: { titulo: string; tareas: Tarea[]; estado: TareaStatus }) {
  const colores = STATUS_TAREA_COLOR[estado]
  return (
    <div style={{ minWidth: 270, flex: '1 1 270px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: colores.bg, border: '1px solid ' + colores.border, marginBottom: 4 }}>
        <strong style={{ fontSize: '0.82rem', color: colores.color }}>{titulo}</strong>
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 800, color: colores.color, background: '#fff', border: '1px solid ' + colores.border, borderRadius: 5, padding: '1px 7px' }}>{tareas.length}</span>
      </div>
      {tareas.length === 0
        ? <p style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', padding: '16px 0', background: '#f8fafc', borderRadius: 8, border: '1px dashed #e2e8f0' }}>Sin tareas</p>
        : tareas.map((t) => <TarjetaTarea key={t.id} tarea={t} />)}
    </div>
  )
}

export function TableroKanbanCliente({ tareasIniciales }: { tareasIniciales: Tarea[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroArea, setFiltroArea] = useState('')
  const [filtroPrioridad, setFiltroPrioridad] = useState('')
  const [soloSinRespuesta, setSoloSinRespuesta] = useState(false)

  const tareasFiltradas = useMemo(() => {
    return tareasIniciales.filter((t) => {
      const matchBusqueda =
        !busqueda ||
        t.title.toLowerCase().includes(busqueda.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(busqueda.toLowerCase())) ||
        (t.assignments && t.assignments.some(a => a.collaborator?.fullName.toLowerCase().includes(busqueda.toLowerCase())))

      const matchArea = !filtroArea || t.area === filtroArea
      const matchPrioridad = !filtroPrioridad || t.priority === filtroPrioridad

      const matchSinRespuesta = !soloSinRespuesta || (
        t.assignments && t.assignments.some(a => {
          if (a.status !== 'INVITADO') return false
          const creacion = new Date(a.createdAt).getTime()
          return (Date.now() - creacion) / (1000 * 60 * 60) >= 48
        })
      )

      return matchBusqueda && matchArea && matchPrioridad && matchSinRespuesta
    })
  }, [tareasIniciales, busqueda, filtroArea, filtroPrioridad, soloSinRespuesta])

  const agrupar = (estado: TareaStatus) => tareasFiltradas.filter((t) => t.status === estado)

  const totalSinRespuesta = useMemo(() => {
    return tareasIniciales.filter(t => t.assignments?.some(a => a.status === 'INVITADO' && (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60) >= 48)).length
  }, [tareasIniciales])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Barra de Filtros y Búsqueda */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', flex: '1 1 auto' }}>
          {/* Buscador */}
          <div style={{ position: 'relative', minWidth: 240, flex: '1 1 240px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Buscar por título, descripción o voluntario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: 8, fontSize: '0.86rem', border: '1.5px solid #e2e8f0', outline: 'none' }}
            />
          </div>

          {/* Filtro por Área */}
          <select
            value={filtroArea}
            onChange={(e) => setFiltroArea(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, fontSize: '0.86rem', border: '1.5px solid #e2e8f0', outline: 'none', background: '#fff', color: '#1e293b' }}
          >
            {AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>

          {/* Filtro por Prioridad */}
          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, fontSize: '0.86rem', border: '1.5px solid #e2e8f0', outline: 'none', background: '#fff', color: '#1e293b' }}
          >
            {PRIORIDADES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>

          {/* Toggle Alerta Sin Respuesta */}
          {totalSinRespuesta > 0 && (
            <button
              type="button"
              onClick={() => setSoloSinRespuesta(!soloSinRespuesta)}
              style={{
                padding: '7px 12px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                border: '1.5px solid ' + (soloSinRespuesta ? '#d97706' : '#fde68a'),
                background: soloSinRespuesta ? '#fffbeb' : '#fff',
                color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: 5,
              }}
            >
              <AlertTriangle size={13} />
              Sin respuesta +48h ({totalSinRespuesta})
            </button>
          )}

          {(busqueda || filtroArea || filtroPrioridad || soloSinRespuesta) && (
            <button
              type="button"
              onClick={() => { setBusqueda(''); setFiltroArea(''); setFiltroPrioridad(''); setSoloSinRespuesta(false) }}
              style={{ fontSize: '0.82rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tablero Kanban */}
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, alignItems: 'flex-start' }}>
        <Columna titulo="Abiertas" tareas={agrupar('ABIERTA')} estado="ABIERTA" />
        <Columna titulo="En progreso" tareas={agrupar('EN_PROGRESO')} estado="EN_PROGRESO" />
        <Columna titulo="Borradores" tareas={agrupar('BORRADOR')} estado="BORRADOR" />
        <Columna titulo="Completadas" tareas={agrupar('COMPLETADA')} estado="COMPLETADA" />
      </div>
    </div>
  )
}
