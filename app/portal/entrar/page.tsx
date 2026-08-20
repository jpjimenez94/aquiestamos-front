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
  searchParams: Promise<{ volver?: string }>
}) {
  const { volver } = await searchParams

  return (
    <div className="entrar">
      <div className="entrar__caja">
        <h1>Portal de coordinación</h1>
        <p>Aquí Estamos · acceso del equipo</p>
        <FormularioEntrar volver={volver} />
      </div>
    </div>
  )
}
