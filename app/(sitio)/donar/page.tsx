import type { Metadata } from 'next'
import { DonarVista } from '@/components/sitio/vistas/DonarVista'
import { metadatosDeRuta } from '@/lib/i18n/metadatos'

export const metadata: Metadata = metadatosDeRuta('es', '/donar')

export default function DonarPage() {
  return <DonarVista idioma="es" />
}
