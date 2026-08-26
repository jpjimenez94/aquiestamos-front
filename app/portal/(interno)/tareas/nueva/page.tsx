
import { notFound } from 'next/navigation'
import { usuarioActual, puede } from '@/lib/portal'
import { FormularioTarea } from './FormularioTarea'

export const metadata = { title: 'Nueva tarea' }

export default async function NuevaTareaPage() {
  const usuario = await usuarioActual()
  if (!usuario || !puede(usuario, 'tarea:crear')) notFound()
  return (
    <>
      <header className="portal__cabecera">
        <div>
          <h1>Nueva tarea</h1>
          <p>Define la tarea y luego asigna al voluntario mas adecuado segun su area y disponibilidad.</p>
        </div>
      </header>
      <FormularioTarea />
    </>
  )
}
