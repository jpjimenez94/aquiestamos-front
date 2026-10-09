import { PoliticaVista } from '@/components/sitio/vistas/PoliticaVista'
import { idiomaDeLaRuta, metadatosDeLaRuta, type ParametrosDeIdioma } from '@/lib/i18n/pagina'

type Props = { params: ParametrosDeIdioma }

export function generateMetadata({ params }: Props) {
  return metadatosDeLaRuta(params, '/politica-de-datos')
}

export default async function PoliticaDeDatosPage({ params }: Props) {
  return <PoliticaVista idioma={await idiomaDeLaRuta(params)} />
}
