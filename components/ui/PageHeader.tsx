import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

export type Crumb = { href: string; label: string }

/**
 * Reproduce la cabecera de una página de Notion: migas de pan, portada ancha,
 * icono superpuesto sobre la portada y título.
 *
 * `inicio` y `rutaAria` son lo único que la cabecera dice por su cuenta, y por
 * eso llegan de fuera: quien la usa sabe en qué idioma está la página y a qué
 * portada tiene que volver la primera miga. Sin ellos se queda en español, que
 * es como estaba.
 */
export function PageHeader({
  cover,
  icon,
  title,
  crumbs = [],
  inicio = { href: '/', label: 'Inicio' },
  rutaAria = 'Ruta de navegación',
  children,
}: {
  cover: string
  icon: string
  title: string
  crumbs?: Crumb[]
  /** La primera miga: la portada, en el idioma de la página. */
  inicio?: Crumb
  /** Cómo se llama la ruta de migas para un lector de pantalla. */
  rutaAria?: string
  children?: ReactNode
}) {
  return (
    <header>
      {crumbs.length > 0 ? (
        <div className="content content--wide">
          <nav className="breadcrumbs" aria-label={rutaAria}>
            <Link href={inicio.href}>{inicio.label}</Link>
            {crumbs.map((crumb) => (
              <span key={crumb.href} style={{ display: 'inline-flex', gap: 6 }}>
                <span aria-hidden>/</span>
                <Link href={crumb.href}>{crumb.label}</Link>
              </span>
            ))}
          </nav>
        </div>
      ) : null}

      <div className="page-header__cover">
        <Image src={cover} alt="" fill priority sizes="100vw" />
      </div>

      <div className="content page-header__body">
        <div className="page-header__icon">
          <Icon name={icon} size={34} strokeWidth={1.7} />
        </div>

        <h1 className="page-header__title">{title}</h1>
        {children}
      </div>
    </header>
  )
}
