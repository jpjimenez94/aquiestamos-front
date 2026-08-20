import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

export type Crumb = { href: string; label: string }

/**
 * Reproduce la cabecera de una página de Notion: migas de pan, portada ancha,
 * icono superpuesto sobre la portada y título.
 */
export function PageHeader({
  cover,
  icon,
  title,
  crumbs = [],
  children,
}: {
  cover: string
  icon: string
  title: string
  crumbs?: Crumb[]
  children?: ReactNode
}) {
  return (
    <header>
      {crumbs.length > 0 ? (
        <div className="content content--wide">
          <nav className="breadcrumbs" aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
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
