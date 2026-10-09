import { ConsentimientoVista } from '@/components/sitio/vistas/ConsentimientoVista'
import { idiomaDeLaRuta, metadatosDeLaRuta, type ParametrosDeIdioma } from '@/lib/i18n/pagina'

type Props = { params: ParametrosDeIdioma }

export function generateMetadata({ params }: Props) {
  return metadatosDeLaRuta(params, '/consentimiento-informado')
}

export default async function ConsentimientoInformadoPage({ params }: Props) {
  return <ConsentimientoVista idioma={await idiomaDeLaRuta(params)} />
}
