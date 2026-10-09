import type { Metadata } from 'next'
import { RecursoVista, metadatosDeRecurso } from '@/components/sitio/vistas/RecursosVista'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return metadatosDeRecurso('es', slug)
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params
  return <RecursoVista idioma="es" slug={slug} />
}
