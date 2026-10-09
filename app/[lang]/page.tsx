import { InicioVista } from '@/components/sitio/vistas/InicioVista'
import { idiomaDeLaRuta, metadatosDeLaRuta, type ParametrosDeIdioma } from '@/lib/i18n/pagina'

type Props = { params: ParametrosDeIdioma }

export function generateMetadata({ params }: Props) {
  return metadatosDeLaRuta(params, '/')
}

export default async function HomePage({ params }: Props) {
  return <InicioVista idioma={await idiomaDeLaRuta(params)} />
}
