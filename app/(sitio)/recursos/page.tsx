import type { Metadata } from 'next'
import { RecursosVista } from '@/components/sitio/vistas/RecursosVista'
import { metadatosDeRuta } from '@/lib/i18n/metadatos'

export const metadata: Metadata = metadatosDeRuta('es', '/recursos')

export default function RecursosPage() {
  return <RecursosVista idioma="es" />
}
