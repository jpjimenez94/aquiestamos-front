import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Download } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { ButtonLink } from '@/components/ui/Button'
import { getResource } from '@/lib/api'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const resource = await getResource(slug)

  if (!resource) return { title: 'Recurso no encontrado' }

  return {
    title: resource.title,
    description: resource.description,
  }
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params
  const resource = await getResource(slug)

  if (!resource) notFound()

  return (
    <>
      <PageHeader
        cover={resource.coverImage}
        icon={resource.icon}
        title={resource.title}
        crumbs={[
          { href: '/recursos', label: 'Recursos para todos' },
          { href: `/recursos/${resource.slug}`, label: resource.title },
        ]}
      />

      <section className="content section">
        <div className="resource-detail__meta">
          {resource.category ? (
            <div>
              <div className="resource-detail__meta-label">Categoría</div>
              <span className="pill" style={{ marginBottom: 0 }}>
                {resource.category.name}
              </span>
            </div>
          ) : null}

          <div>
            <div className="resource-detail__meta-label">Archivos y multimedia</div>
            <a
              href={resource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline', fontSize: '0.9rem' }}
            >
              {resource.fileName}
            </a>
          </div>
        </div>

        <p>{resource.description}</p>

        <div className="button-row" style={{ marginBottom: 32 }}>
          <ButtonLink
            href={resource.fileUrl}
            external
            variant="primary"
            icon={<Download size={16} />}
          >
            Abrir el material
          </ButtonLink>
          <ButtonLink href="/recursos">Volver a la biblioteca</ButtonLink>
        </div>

        <object
          data={resource.fileUrl}
          type="application/pdf"
          width="100%"
          height="720"
          aria-label={`Vista previa de ${resource.title}`}
          style={{ borderRadius: 'var(--border-radii-layout)', border: '1px solid var(--color-border-default)' }}
        >
          <p className="notice">
            Tu navegador no puede mostrar el PDF aquí.{' '}
            <a href={resource.fileUrl} style={{ textDecoration: 'underline' }}>
              Ábrelo en una pestaña nueva
            </a>
            .
          </p>
        </object>
      </section>
    </>
  )
}
