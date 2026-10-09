import type { Metadata } from 'next'
import { ConsentimientoVista } from '@/components/sitio/vistas/ConsentimientoVista'
import { metadatosDeRuta } from '@/lib/i18n/metadatos'

export const metadata: Metadata = metadatosDeRuta('es', '/consentimiento-informado')

export default function ConsentimientoInformadoPage() {
  return <ConsentimientoVista idioma="es" />
}
