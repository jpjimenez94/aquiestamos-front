
import { notFound } from 'next/navigation'
import { portalFetch, usuarioActual, puede } from '@/lib/portal'
import { FormularioTarea } from './FormularioTarea'

export const metadata = { title: 'Nueva tarea' }

export default async function NuevaTareaPage() {
  const usuario = await usuarioActual()
  if (!usuario || !puede(usuario, 'tarea:crear')) notFound()

  const respuestaColabs = await portalFetch<any[]>('/collaborators?all=true&status=ACTIVO')
  const colaboradores = respuestaColabs.data ?? []

  return (
    <>
      <header className="portal__cabecera">
        <div>
          <h1>Nueva tarea</h1>
          <p>Define la tarea con horario y asígnala de una vez al voluntario disponible más adecuado.</p>
        </div>
      </header>
      <FormularioTarea colaboradoresDisponibles={colaboradores} />
    </>
  )
}
