import { ChevronLeft } from 'lucide-react'
import { Cabecera } from '../../componentes'
import { CrearUsuarioForm } from '@/components/forms/CrearUsuarioForm'
import { ButtonLink } from '@/components/ui/Button'

export const metadata = { title: 'Nueva cuenta' }

export default function NuevoUsuarioPage() {
  return (
    <>
      <Cabecera
        titulo="Crear nueva cuenta"
        descripcion="Completa los datos para dar acceso a un nuevo miembro del equipo."
        acciones={
          <ButtonLink href="/portal/usuarios" variant="default" icon={<ChevronLeft size={16} />}>
            Volver a cuentas
          </ButtonLink>
        }
      />
      <div style={{ marginTop: '2rem' }}>
        <CrearUsuarioForm />
      </div>
    </>
  )
}
