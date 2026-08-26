
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { portalFetch, usuarioActual, puede } from '@/lib/portal'
import { Cabecera, Vacio } from '../componentes'
import type { Tarea, TareaStatus } from './tipos'
import { TableroKanbanCliente } from './TableroKanbanCliente'

export const metadata = { title: 'Tareas de voluntariado' }

export default async function TareasPage() {
  const usuario = await usuarioActual()
  if (!usuario || !puede(usuario, 'tarea:leer')) notFound()

  const puedeCrear = puede(usuario, 'tarea:crear')
  const respuesta = await portalFetch<Tarea[]>('/tasks')
  const tareas = respuesta.data ?? []

  const agrupar = (estado: TareaStatus) => tareas.filter((t) => t.status === estado)

  const resumen = [
    { estado: 'ABIERTA', count: agrupar('ABIERTA').length, label: 'Abiertas' },
    { estado: 'EN_PROGRESO', count: agrupar('EN_PROGRESO').length, label: 'En progreso' },
    { estado: 'COMPLETADA', count: agrupar('COMPLETADA').length, label: 'Completadas' },
    { estado: 'BORRADOR', count: agrupar('BORRADOR').length, label: 'Borradores' },
  ]

  return (
    <>
      <Cabecera
        titulo="Tareas de voluntariado"
        descripcion="Gestión de labores internas de la fundación: asignaciones por disponibilidad, entregas y seguimiento."
        acciones={
          puedeCrear ? (
            <Link
              href="/portal/tareas/nueva"
              className="boton boton--primario"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.86rem' }}
            >
              <Plus size={15} />
              Nueva tarea
            </Link>
          ) : null
        }
      />

      {/* Indicadores numéricos */}
      <div className="indicadores" style={{ marginBottom: 20 }}>
        {resumen.map((r) => (
          <div key={r.estado} className="indicador">
            <span className="indicador__cifra">{r.count}</span>
            <span className="indicador__etiqueta">{r.label}</span>
          </div>
        ))}
      </div>

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar las tareas.'}</Vacio>
      ) : tareas.length === 0 ? (
        <Vacio>Todavía no hay tareas creadas. Crea la primera con el botón de arriba.</Vacio>
      ) : (
        <TableroKanbanCliente tareasIniciales={tareas} />
      )}
    </>
  )
}
