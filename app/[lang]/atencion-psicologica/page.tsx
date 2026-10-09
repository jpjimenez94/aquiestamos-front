import { AtencionVista } from '@/components/sitio/vistas/FormulariosVista'
import { idiomaDeLaRuta, metadatosDeLaRuta, type ParametrosDeIdioma } from '@/lib/i18n/pagina'

type Props = { params: ParametrosDeIdioma }

export function generateMetadata({ params }: Props) {
  return metadatosDeLaRuta(params, '/atencion-psicologica')
}

export default async function AtencionPsicologicaPage({ params }: Props) {
  return <AtencionVista idioma={await idiomaDeLaRuta(params)} />
}
