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

  return (
    <div className="portal">
      <LateralPortal usuario={usuario} />
      <main className="portal__principal">{children}</main>
    </div>
  )
}
