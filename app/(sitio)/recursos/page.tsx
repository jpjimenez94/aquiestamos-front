import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { Callout } from '@/components/ui/Callout'
import { Icon } from '@/components/ui/Icon'
import { getResourceGroups } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Recursos para todos',
  description: 'Guías, libros y herramientas para situaciones que requieren apoyo.',
}

export default async function RecursosPage() {
  const groups = await getResourceGroups()

  return (
    <>
      <PageHeader
        cover="/images/cover-recursos.png"
        icon="heart"
        title="Recursos para todos"
        crumbs={[{ href: '/recursos', label: 'Recursos para todos' }]}
      >
        <p>Guías, libros y herramientas para situaciones que requieren apoyo.</p>
      </PageHeader>

      <section className="content content--wide section">
        <h2 style={{ marginBottom: 24 }}>
          <Icon name="sparkles" size={22} /> Cuentos infantiles
        </h2>

        {groups.length === 0 ? (
          <p className="notice">
            La biblioteca no está disponible en este momento. Vuelve a intentarlo en unos
            minutos.
          </p>
        ) : (
          groups.map((group) => (
            <div className="resource-group" key={group.slug}>
              <h3 className="resource-group__title">{group.name}</h3>

              <div className="resource-grid">
                {group.resources.map((resource) => (
                  <Link
                    className="resource-card"
                    href={`/recursos/${resource.slug}`}
                    key={resource.slug}
                  >
                    <div className="resource-card__cover">
                      <Image
                        src={resource.coverImage}
                        alt=""
                        fill
                        sizes="(max-width: 480px) 100vw, (max-width: 780px) 50vw, 300px"
                      />
                    </div>
                    <div className="resource-card__body">
                      <h4 className="resource-card__title">
                        <Icon name={resource.icon} size={17} />
                        {resource.title}
                      </h4>
                      <span className="pill">{group.name}</span>
                      <p className="resource-card__text">{resource.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}

        <div style={{ marginTop: 40 }}>
          <Callout icon="arrow-right-red">
            <h3 style={{ margin: 0 }}>Material para profesionales</h3>
            <p className="text-muted" style={{ margin: '8px 0 0' }}>
              Próximamente.
            </p>
          </Callout>
        </div>

        <div style={{ marginTop: 16 }}>
          <Callout variant="tip" emoji="💡">
            <p style={{ margin: 0 }}>
              Si tienes algún otro recurso que desees compartir puedes contactarnos.
            </p>
          </Callout>
        </div>
      </section>
    </>
  )
}
