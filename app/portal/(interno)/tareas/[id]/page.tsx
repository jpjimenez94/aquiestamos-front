
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { portalFetch, usuarioActual, puede } from '@/lib/portal'
import { Vacio } from '../../componentes'
import { PanelDetalleTarea } from './PanelDetalleTarea'
import type { Tarea } from '../tipos'

export const metadata = { title: 'Detalle de tarea' }

export default async function DetalleTareaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const usuario = await usuarioActual()
  if (!usuario || !puede(usuario, 'tarea:leer')) notFound()

  const [respuestaTarea, respuestaColabs] = await Promise.all([
    portalFetch<Tarea>('/tasks/' + id),
    portalFetch<any[]>('/collaborators?all=true'),
  ])

  if (!respuestaTarea.success || !respuestaTarea.data) notFound()

  const tarea = respuestaTarea.data
  const colaboradores = respuestaColabs.data ?? []
  const puedeAsignar = puede(usuario, 'tarea:asignar')
  const puedeEditar = puede(usuario, 'tarea:editar')

  return (
    <>
      <header className="portal__cabecera">
        <div>
          <Link href="/portal/tareas" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: '#64748b', textDecoration: 'none', marginBottom: 8 }}>
            <ArrowLeft size={13} />
            Volver a tareas
          </Link>
          <h1 style={{ marginTop: 4 }}>{tarea.title}</h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>{tarea.areaLegible}</p>
        </div>
      </header>
      <PanelDetalleTarea
        tarea={tarea}
        colaboradoresDisponibles={colaboradores}
        puedeAsignar={puedeAsignar}
        puedeEditar={puedeEditar}
      />
    </>
  )
}
