import type { Metadata } from 'next'
import { FormularioEntrar } from './FormularioEntrar'
import '../portal.css'

export const metadata: Metadata = {
  title: 'Entrar al portal',
  robots: { index: false, follow: false },
}

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string; vencida?: string }>
}) {
  const { volver, vencida } = await searchParams

  return (
    <div className="entrar">
      <div className="entrar__caja">
        <h1>Portal de coordinación</h1>
        <p>Aquí Estamos · acceso del equipo</p>
        {/* Llega aquí desde /api/portal/sesion-vencida: que sepa por qué. */}
        {vencida ? (
          <p className="entrar__aviso" role="status">
            Tu sesión terminó. Vuelve a entrar para seguir.
          </p>
        ) : null}
        <FormularioEntrar volver={volver} />
      </div>
    </div>
  )
}
