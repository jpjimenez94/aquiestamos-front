import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

type Variant = 'default' | 'primary'

function classes(variant: Variant, className?: string) {
  return ['button', variant === 'primary' ? 'button--primary' : '', className]
    .filter(Boolean)
    .join(' ')
}

export function ButtonLink({
  href,
  icon,
  children,
  variant = 'default',
  external,
  className,
}: {
  href: string
  icon?: ReactNode
  children: ReactNode
  variant?: Variant
  external?: boolean
  className?: string
}) {
  const content = (
    <>
      {icon ? <span className="button__icon">{icon}</span> : null}
      <span>{children}</span>
    </>
  )

  if (external) {
    return (
      <a
        className={classes(variant, className)}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    )
  }

  return (
    <Link className={classes(variant, className)} href={href}>
      {content}
    </Link>
  )
}

export function Button({
  icon,
  children,
  variant = 'default',
  className,
  ...props
}: ComponentProps<'button'> & { icon?: ReactNode; variant?: Variant }) {
  return (
    <button className={classes(variant, className)} {...props}>
      {icon ? <span className="button__icon">{icon}</span> : null}
      <span>{children}</span>
    </button>
  )
}
