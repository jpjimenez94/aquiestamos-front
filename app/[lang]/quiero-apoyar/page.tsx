import { QuieroApoyarVista } from '@/components/sitio/vistas/FormulariosVista'
import { idiomaDeLaRuta, metadatosDeLaRuta, type ParametrosDeIdioma } from '@/lib/i18n/pagina'

type Props = { params: ParametrosDeIdioma }

export function generateMetadata({ params }: Props) {
  return metadatosDeLaRuta(params, '/quiero-apoyar')
}

export default async function QuieroApoyarPage({ params }: Props) {
  return <QuieroApoyarVista idioma={await idiomaDeLaRuta(params)} />
}
