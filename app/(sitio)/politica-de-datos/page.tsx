import type { Metadata } from 'next'
import { PoliticaVista } from '@/components/sitio/vistas/PoliticaVista'
import { metadatosDeRuta } from '@/lib/i18n/metadatos'

export const metadata: Metadata = metadatosDeRuta('es', '/politica-de-datos')

export default function PoliticaDeDatosPage() {
  return <PoliticaVista idioma="es" />
}
