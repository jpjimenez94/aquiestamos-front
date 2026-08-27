import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { usuarioActual } from '@/lib/portal'
import { ParametrizacionView } from './ParametrizacionView'

export const metadata: Metadata = {
  title: 'Parametrización y Plantillas · Portal Aquí Estamos',
  description: 'Configuración de mensajes de WhatsApp, plantillas de correo y parámetros operativos del sistema.',
}

export default async function ParametrizacionPage() {
  const usuario = await usuarioActual()
  if (!usuario) {
    redirect('/portal/entrar')
  }

  return (
    <div className="portal__contenido">
      <ParametrizacionView usuario={usuario} />
    </div>
  )
}
