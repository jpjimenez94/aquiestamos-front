import type { Metadata } from 'next'
import { QuieroApoyarVista } from '@/components/sitio/vistas/FormulariosVista'
import { metadatosDeRuta } from '@/lib/i18n/metadatos'

export const metadata: Metadata = metadatosDeRuta('es', '/quiero-apoyar')

export default function QuieroApoyarPage() {
  return <QuieroApoyarVista idioma="es" />
}
