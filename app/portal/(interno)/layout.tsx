import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { usuarioActual } from '@/lib/portal'
import { LateralPortal } from './LateralPortal'
import '../portal.css'

export const metadata: Metadata = {
  title: { default: 'Portal', template: '%s · Portal Aquí Estamos' },
  robots: { index: false, follow: false },
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const usuario = await usuarioActual()

  // La cookie existía pero la sesión ya no vale (caducó o la revocaron).
  if (!usuario) redirect('/portal/entrar')

  // data-rol existe para el modo solo lectura: el CSS apaga los controles de
  // acción cuando vale LECTURA. Es cortesía visual; la seguridad real está en
  // el backend, que rechaza cada escritura de ese rol con 403.
  return (
    <div className="portal" data-rol={usuario.role}>
      <LateralPortal usuario={usuario} />
      <main className="portal__principal">{children}</main>
    </div>
  )
}
