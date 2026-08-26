
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { portalFetch, usuarioActual, puede } from '@/lib/portal'
import { Cabecera, Vacio } from '../componentes'
import type { Tarea, TareaStatus } from './tipos'
import { STATUS_TAREA_COLOR, PRIORITY_COLOR } from './tipos'

export const metadata = { title: 'Tareas de voluntariado' }

function TarjetaTarea({ tarea }: { tarea: Tarea }) {
  const colores = STATUS_TAREA_COLOR[tarea.status] ?? STATUS_TAREA_COLOR.BORRADOR
  const pColor = PRIORITY_COLOR[tarea.priority] ?? PRIORITY_COLOR.MEDIA
  const hoy = new Date()
  const vencida =
    tarea.dueDate &&
    new Date(tarea.dueDate + 'T23:59:59') < hoy &&
    !['COMPLETADA', 'CANCELADA'].includes(tarea.status)

  return (
    <Link
      href={'/portal/tareas/' + tarea.id}
      style={{
        display: 'block',
        background: '#fff',
        border: '1px solid',
        borderColor: colores.border,
        borderRadius: 12,
        padding: '15px 16px',
        textDecoration: 'none',
        color: 'inherit',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
      }}
    >
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
    <div style={{ minWidth: 260, flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: colores.bg, border: '1px solid ' + colores.border, marginBottom: 4 }}>
        <strong style={{ fontSize: '0.82rem', color: colores.color }}>{titulo}</strong>
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 800, color: colores.color, background: '#fff', border: '1px solid ' + colores.border, borderRadius: 5, padding: '1px 7px' }}>{tareas.length}</span>
      </div>
      {tareas.length === 0
        ? <p style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>Sin tareas</p>
        : tareas.map((t) => <TarjetaTarea key={t.id} tarea={t} />)}
    </div>
  )
}

export default async function TareasPage() {
  const usuario = await usuarioActual()
  if (!usuario || !puede(usuario, 'tarea:leer')) notFound()

  const puedeCrear = puede(usuario, 'tarea:crear')
  const respuesta = await portalFetch<Tarea[]>('/tasks')
  const tareas = respuesta.data ?? []
  const agrupar = (estado: TareaStatus) => tareas.filter((t) => t.status === estado)

  return (
    <>
      <Cabecera
        titulo="Tareas de voluntariado"
        descripcion="Labores internas que los voluntarios realizan para que la fundacion funcione."
        acciones={
          puedeCrear ? (
            <Link href="/portal/tareas/nueva" className="boton boton--primario" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.86rem' }}>
              <Plus size={15} />
              Nueva tarea
            </Link>
          ) : null
        }
      />
      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar las tareas.'}</Vacio>
      ) : tareas.length === 0 ? (
        <Vacio>Todavia no hay tareas creadas. Crea la primera con el boton de arriba.</Vacio>
      ) : (
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12, alignItems: 'flex-start' }}>
          <Columna titulo="Abiertas" tareas={agrupar('ABIERTA')} estado="ABIERTA" />
          <Columna titulo="En progreso" tareas={agrupar('EN_PROGRESO')} estado="EN_PROGRESO" />
          <Columna titulo="Borradores" tareas={agrupar('BORRADOR')} estado="BORRADOR" />
          <Columna titulo="Completadas" tareas={agrupar('COMPLETADA')} estado="COMPLETADA" />
        </div>
      )}
    </>
  )
}
