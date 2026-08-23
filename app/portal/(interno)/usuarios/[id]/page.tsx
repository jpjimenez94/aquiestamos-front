import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { portalFetch, enBogota } from '@/lib/portal'
import { Cabecera, Dato, Etiqueta } from '../../componentes'
import { ButtonLink } from '@/components/ui/Button'
import { EditarUsuarioForm } from '@/components/forms/EditarUsuarioForm'
import { CambiarClaveForm } from '@/components/forms/CambiarClaveForm'
import { EliminarUsuarioForm } from '@/components/forms/EliminarUsuarioForm'
import { nombrePropio } from '@/lib/nombre'

type Cuenta = {
  id: string
  email: string
  name: string
  role: string
  active: boolean
  mustChangePassword: boolean
  lastLoginAt: string | null
}

const ROL: Record<string, string> = {
  ADMIN: 'Administración',
  AGENDADOR: 'Agenda',
  PROFESIONAL: 'Profesional',
  LECTURA: 'Solo lectura',
}

export default async function UsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Obtenemos la lista completa y filtramos por ID para evitar tocar el backend
  const respuesta = await portalFetch<Cuenta[]>('/users')
  const usuario = (respuesta.data ?? []).find(u => u.id === id)

  if (!usuario) notFound()

  return (
    <>
      <Cabecera
        titulo="Gestionar cuenta"
        descripcion={`Administrando el acceso de ${nombrePropio(usuario.name)}.`}
        acciones={
          <ButtonLink href="/portal/usuarios" variant="default" icon={<ChevronLeft size={16} />}>
            Volver
          </ButtonLink>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '2rem' }}>
        {/* Bloque 1: Edición Básica */}
        <section>
          <h2>Datos de la cuenta</h2>
          <EditarUsuarioForm usuario={usuario} />
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-borde)' }} />

        {/* Bloque 2: Contraseña */}
        <section>
          <h2>Seguridad</h2>
          <p className="panel__nota" style={{ marginBottom: '1.5rem' }}>
            Si restableces la contraseña, se cerrarán todas las sesiones activas de esta persona y tendrá que ingresar con la nueva clave.
          </p>
          <CambiarClaveForm id={usuario.id} />
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-borde)' }} />

        {/* Bloque 3: Zona de Peligro */}
        <section>
          <h2 style={{ color: 'var(--color-rojo)' }}>Zona de Peligro</h2>
          <p className="panel__nota" style={{ marginBottom: '1.5rem' }}>
            Eliminar esta cuenta impedirá el acceso al portal de forma permanente. Su historial de auditoría se mantendrá.
          </p>
          <EliminarUsuarioForm id={usuario.id} nombre={usuario.name} role={usuario.role} />
        </section>
      </div>
    </>
  )
}
