import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { usuarioActual, portalFetch, traerPlantillas } from '@/lib/portal'
import { PlantillasProvider } from '@/components/portal/Plantillas'
import { LateralPortal, type ContadoresBadges } from './LateralPortal'
import '../portal.css'

export const metadata: Metadata = {
  title: { default: 'Portal', template: '%s · Portal Aquí Estamos' },
  robots: { index: false, follow: false },
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const usuario = await usuarioActual()

  // La cookie existía pero la sesión ya no vale (caducó o la revocaron).
  if (!usuario) redirect('/portal/entrar')

  // Los textos editables van al contexto: los usan once componentes sueltos.
  const [respuestaBadges, plantillas] = await Promise.all([
    portalFetch<ContadoresBadges>('/dashboard/badges'),
    traerPlantillas(),
  ])
  const contadores = respuestaBadges.data ?? {
    solicitudes: 0,
    postulaciones: 0,
    colaboradores: 0,
    verificaciones: 0,
    agenda: 0,
    miAgenda: 0,
    tareas: 0,
    personas: 0,
  }

  // data-rol existe para el modo solo lectura: el CSS apaga los controles de
  // acción cuando vale LECTURA. Es cortesía visual; la seguridad real está en
  // el backend, que rechaza cada escritura de ese rol con 403.
  return (
    <div className="portal" data-rol={usuario.role}>
      <LateralPortal usuario={usuario} contadores={contadores} />
      <main className="portal__principal">
        <PlantillasProvider valor={plantillas}>{children}</PlantillasProvider>
      </main>
    </div>
  )
}
