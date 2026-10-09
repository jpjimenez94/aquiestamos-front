import type { Metadata } from 'next'
import { QuieroSerParteVista } from '@/components/sitio/vistas/FormulariosVista'
import { metadatosDeRuta } from '@/lib/i18n/metadatos'

export const metadata: Metadata = metadatosDeRuta('es', '/quiero-ser-parte')

export default function QuieroSerPartePage() {
  return <QuieroSerParteVista idioma="es" />
}
