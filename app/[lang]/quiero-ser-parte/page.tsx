import { QuieroSerParteVista } from '@/components/sitio/vistas/FormulariosVista'
import { idiomaDeLaRuta, metadatosDeLaRuta, type ParametrosDeIdioma } from '@/lib/i18n/pagina'

type Props = { params: ParametrosDeIdioma }

export function generateMetadata({ params }: Props) {
  return metadatosDeLaRuta(params, '/quiero-ser-parte')
}

export default async function QuieroSerPartePage({ params }: Props) {
  return <QuieroSerParteVista idioma={await idiomaDeLaRuta(params)} />
}
