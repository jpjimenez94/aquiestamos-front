import { RecursosVista } from '@/components/sitio/vistas/RecursosVista'
import { idiomaDeLaRuta, metadatosDeLaRuta, type ParametrosDeIdioma } from '@/lib/i18n/pagina'

type Props = { params: ParametrosDeIdioma }

export function generateMetadata({ params }: Props) {
  return metadatosDeLaRuta(params, '/recursos')
}

export default async function RecursosPage({ params }: Props) {
  return <RecursosVista idioma={await idiomaDeLaRuta(params)} />
}
