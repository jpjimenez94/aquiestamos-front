import type { Metadata } from 'next'
import { AtencionVista } from '@/components/sitio/vistas/FormulariosVista'
import { metadatosDeRuta } from '@/lib/i18n/metadatos'

export const metadata: Metadata = metadatosDeRuta('es', '/atencion-psicologica')

export default function AtencionPsicologicaPage() {
  return <AtencionVista idioma="es" />
}
