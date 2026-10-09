import type { Metadata } from 'next'
import { InicioVista } from '@/components/sitio/vistas/InicioVista'
import { metadatosDeRuta } from '@/lib/i18n/metadatos'

export const metadata: Metadata = metadatosDeRuta('es', '/')

export default function HomePage() {
  return <InicioVista idioma="es" />
}
