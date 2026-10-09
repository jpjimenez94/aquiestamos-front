import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Download } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Callout } from '@/components/ui/Callout'
import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { getResource, getResourceGroups } from '@/lib/api'
import type { Resource } from '@/lib/types'
import { rellenar, ruta, type Idioma } from '@/lib/i18n/idiomas'
import { diccionario, type Diccionario } from '@/lib/i18n/diccionario'
import { metadatosDePagina } from '@/lib/i18n/metadatos'

/**
 * La biblioteca «Recursos para todos» y la ficha de cada recurso.
 *
 * Los libros los escribieron sus autores, en español, y así se comparten: no
 * se traducen aquí, porque no son nuestros. Lo que sí es nuestro —el nombre de
 * cada categoría y la descripción que acompaña a cada libro— vive en la base
 * de datos en español, y las traducciones lo sobrescriben por `slug` desde el
 * diccionario (`recursos.categorias` y `recursos.libros`).
 *
 * Lo que no tenga traducción sale tal como viene de la base. Es deliberado: un
 * libro que alguien añada mañana aparece igual en los tres idiomas, con su
 * descripción en español, en vez de desaparecer de dos de ellos hasta que
 * alguien se acuerde de traducirla.
 */

type Textos = Diccionario['recursos']

/** El recurso con lo que el diccionario de este idioma tenga para él. */
function traducido(recurso: Resource, t: Textos): Resource {
  const propio = t.libros[recurso.slug]
  return {
    ...recurso,
    title: propio?.titulo || recurso.title,
    description: propio?.descripcion || recurso.description,
    category: recurso.category
      ? {
          ...recurso.category,
          name: t.categorias[recurso.category.slug] || recurso.category.name,
        }
      : recurso.category,
  }
}

export async function RecursosVista({ idioma }: { idioma: Idioma }) {
  const t = diccionario(idioma)
  const r = t.recursos
  const groups = await getResourceGroups()

  return (
    <>
      <PageHeader
        cover="/images/cover-recursos.png"
        icon="heart"
        title={r.titulo}
        crumbs={[{ href: ruta(idioma, '/recursos'), label: r.titulo }]}
        inicio={{ href: ruta(idioma, '/'), label: t.migas.inicio }}
        rutaAria={t.migas.ruta}
      >
        <p>{r.bajada}</p>
      </PageHeader>

      <section className="content content--wide section">
        <h2 style={{ marginBottom: 24 }}>
          <Icon name="sparkles" size={22} /> {r.seccion}
        </h2>

        {/* Solo en las traducciones: los libros están en español, y se dice. */}
        {r.notaIdioma ? (
          <p className="recursos__nota-idioma" role="note">
            {r.notaIdioma}
          </p>
        ) : null}

        {groups.length === 0 ? (
          <p className="notice">{r.noDisponible}</p>
        ) : (
          groups.map((group) => {
            const nombreGrupo = r.categorias[group.slug] || group.name
            return (
              <div className="resource-group" key={group.slug}>
                <h3 className="resource-group__title">{nombreGrupo}</h3>

                <div className="resource-grid">
                  {group.resources.map((original) => {
                    const resource = traducido(original, r)
                    return (
                      <Link
                        className="resource-card"
                        href={ruta(idioma, `/recursos/${resource.slug}`)}
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
                          {/*
                            El título es el del libro, en su idioma: se marca
                            como español para que un lector de pantalla no lo
                            pronuncie con acento inglés.
                          */}
                          <h4 className="resource-card__title" lang={r.soloEnEspanol ? 'es' : undefined}>
                            <Icon name={resource.icon} size={17} />
                            {resource.title}
                          </h4>
                          <span className="pill">{nombreGrupo}</span>
                          {r.soloEnEspanol ? (
                            <span className="pill pill--idioma">{r.soloEnEspanol}</span>
                          ) : null}
                          <p className="resource-card__text">{resource.description}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}

        <div style={{ marginTop: 40 }}>
          <Callout icon="arrow-right-red">
            <h3 style={{ margin: 0 }}>{r.profesionales}</h3>
            <p className="text-muted" style={{ margin: '8px 0 0' }}>
              {r.proximamente}
            </p>
          </Callout>
        </div>

        <div style={{ marginTop: 16 }}>
          <Callout variant="tip" emoji="💡">
            <p style={{ margin: 0 }}>{r.compartir}</p>
          </Callout>
        </div>
      </section>
    </>
  )
}

/**
 * Los metadatos de la ficha de un recurso, en un idioma. Los comparten la
 * ficha en español y la de los demás idiomas.
 *
 * Vive aquí, junto a la ficha, porque el título que anuncia tiene que ser el
 * mismo que la ficha enseña: los dos pasan por `traducido()`.
 */
export async function metadatosDeRecurso(idioma: Idioma, slug: string): Promise<Metadata> {
  const r = diccionario(idioma).recursos
  const original = await getResource(slug)
  if (!original) return { title: r.noEncontrado }

  const resource = traducido(original, r)
  return metadatosDePagina({
    idioma,
    rutaSinPrefijo: `/recursos/${slug}`,
    titulo: resource.title,
    descripcion: resource.description,
  })
}

export async function RecursoVista({ idioma, slug }: { idioma: Idioma; slug: string }) {
  const t = diccionario(idioma)
  const r = t.recursos
  const original = await getResource(slug)

  if (!original) notFound()
  const resource = traducido(original, r)

  return (
    <>
      <PageHeader
        cover={resource.coverImage}
        icon={resource.icon}
        title={resource.title}
        crumbs={[
          { href: ruta(idioma, '/recursos'), label: r.titulo },
          { href: ruta(idioma, `/recursos/${resource.slug}`), label: resource.title },
        ]}
        inicio={{ href: ruta(idioma, '/'), label: t.migas.inicio }}
        rutaAria={t.migas.ruta}
      />

      <section className="content section">
        <div className="resource-detail__meta">
          {resource.category ? (
            <div>
              <div className="resource-detail__meta-label">{r.categoria}</div>
              <span className="pill" style={{ marginBottom: 0 }}>
                {resource.category.name}
              </span>
              {r.soloEnEspanol ? (
                <span className="pill pill--idioma" style={{ marginBottom: 0 }}>
                  {r.soloEnEspanol}
                </span>
              ) : null}
            </div>
          ) : null}

          <div>
            <div className="resource-detail__meta-label">{r.archivos}</div>
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

        {r.notaIdioma ? (
          <p className="recursos__nota-idioma" role="note">
            {r.notaIdioma}
          </p>
        ) : null}

        <div className="button-row" style={{ marginBottom: 32 }}>
          <ButtonLink
            href={resource.fileUrl}
            external
            variant="primary"
            icon={<Download size={16} />}
          >
            {r.abrir}
          </ButtonLink>
          <ButtonLink href={ruta(idioma, '/recursos')}>{r.volver}</ButtonLink>
        </div>

        <object
          data={resource.fileUrl}
          type="application/pdf"
          width="100%"
          height="720"
          aria-label={rellenar(r.vistaPrevia, { titulo: resource.title })}
          style={{
            borderRadius: 'var(--border-radii-layout)',
            border: '1px solid var(--color-border-default)',
          }}
        >
          <p className="notice">
            {r.sinVisor}{' '}
            <a href={resource.fileUrl} style={{ textDecoration: 'underline' }}>
              {r.abrirPestana}
            </a>
            .
          </p>
        </object>
      </section>
    </>
  )
}
