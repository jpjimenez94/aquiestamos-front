import type { Metadata } from 'next'
import { RecursoVista, metadatosDeRecurso } from '@/components/sitio/vistas/RecursosVista'
import { esIdiomaConPrefijo } from '@/lib/i18n/idiomas'
import { idiomaDeLaRuta } from '@/lib/i18n/pagina'

type Props = { params: Promise<{ lang: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  return esIdiomaConPrefijo(lang) ? metadatosDeRecurso(lang, slug) : {}
}

export default async function ResourcePage({ params }: Props) {
  const idioma = await idiomaDeLaRuta(params)
  const { slug } = await params
  return <RecursoVista idioma={idioma} slug={slug} />
}
