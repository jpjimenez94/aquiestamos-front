
import type { Metadata } from 'next'
import { ConfirmacionTurno } from './ConfirmacionTurno'

export const metadata: Metadata = {
  title: 'Confirmar tarea | Red Aqui Estamos',
  description: 'Responde a la invitacion a apoyar como voluntario.',
}

export default async function TurnoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return (
    <section className="content section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ConfirmacionTurno token={token} />
    </section>
  )
}
