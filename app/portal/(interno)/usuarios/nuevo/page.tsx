
import { ChevronLeft } from 'lucide-react'
import { Cabecera } from '../../componentes'
import { CrearUsuarioForm } from '@/components/forms/CrearUsuarioForm'
import { ButtonLink } from '@/components/ui/Button'
import { portalFetch } from '@/lib/portal'

export const metadata = { title: 'Nueva cuenta' }

export default async function NuevoUsuarioPage() {
  // Cargar voluntarios para sincronizar correos
  const resColabs = await portalFetch<any[]>('/collaborators?all=true')
  const voluntarios = (resColabs.data ?? []).map((c: any) => ({
    id: c.id,
    name: c.fullName,
    email: c.email,
    areaLegible: c.areaLegible ?? c.area,
    discipline: c.discipline,
  }))

  return (
    <>
      <Cabecera
        titulo="Crear nueva cuenta"
        descripcion="Completa los datos o selecciona a un voluntario registrado para darle acceso al portal."
        acciones={
          <ButtonLink href="/portal/usuarios" variant="default" icon={<ChevronLeft size={16} />}>
            Volver a cuentas
          </ButtonLink>
        }
      />
      <div style={{ marginTop: '2rem' }}>
        <CrearUsuarioForm voluntariosRegistrados={voluntarios} />
      </div>
    </>
  )
}
