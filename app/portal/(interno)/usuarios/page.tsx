import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { portalFetch, enBogota } from '@/lib/portal'
import { Cabecera, Etiqueta, Vacio } from '../componentes'
import { ButtonLink } from '@/components/ui/Button'
import { nombrePropio } from '@/lib/nombre'

export const metadata = { title: 'Cuentas' }

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
  LIDERES_COMUNITARIOS: 'Líderes Comunitarios',
  AGENDADOR: 'Voluntario Digital (General)',
  ADMISION: 'Admisión y Verificaciones',
  COORDINADOR_CASOS: 'Gestión de Casos y Agenda',
  PROFESIONAL: 'Profesional',
  LECTURA: 'Solo lectura',
}

export default async function UsuariosPage() {
  const respuesta = await portalFetch<Cuenta[]>('/users')
  const cuentas = respuesta.data ?? []

  return (
    <>
      <Cabecera
        titulo="Cuentas del portal"
        descripcion="No hay registro público: las cuentas las crea la administración."
        acciones={
          <ButtonLink href="/portal/usuarios/nuevo" variant="primary" icon={<UserPlus size={16} />}>
            Nueva cuenta
          </ButtonLink>
        }
      />

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar las cuentas.'}</Vacio>
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Persona</th>
                <th>Rol</th>
                <th>Último acceso</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuentas.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="tabla__principal">{nombrePropio(c.name)}</span>
                    <span className="tabla__secundario">{c.email}</span>
                  </td>
                  <td>{ROL[c.role] ?? c.role}</td>
                  <td className="tabla__numero">
                    {c.lastLoginAt ? enBogota(c.lastLoginAt) : '—'}
                  </td>
                  <td>
                    {c.active ? (
                      <Etiqueta estado="ACTIVO" texto="Activa" />
                    ) : (
                      <Etiqueta estado="INACTIVO" texto="Inactiva" />
                    )}
                    {c.mustChangePassword ? (
                      <span className="tabla__secundario">debe cambiar la clave</span>
                    ) : null}
                  </td>
                  <td>
                    <Link href={`/portal/usuarios/${c.id}`} style={{ color: 'var(--color-primario)', fontWeight: 500, fontSize: '0.875rem' }}>
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
