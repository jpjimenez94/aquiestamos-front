import { DonarVista } from '@/components/sitio/vistas/DonarVista'
import { idiomaDeLaRuta, metadatosDeLaRuta, type ParametrosDeIdioma } from '@/lib/i18n/pagina'

type Props = { params: ParametrosDeIdioma }

export function generateMetadata({ params }: Props) {
  return metadatosDeLaRuta(params, '/donar')
}

export default async function DonarPage({ params }: Props) {
  return <DonarVista idioma={await idiomaDeLaRuta(params)} />
}
