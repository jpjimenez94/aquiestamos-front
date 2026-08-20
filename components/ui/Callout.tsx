import type { ReactNode } from 'react'
import { Icon } from './Icon'

export function Callout({
  icon = 'arrow-right-red',
  emoji,
  variant = 'default',
  children,
}: {
  icon?: string
  emoji?: string
  variant?: 'default' | 'plain' | 'tip'
  children: ReactNode
}) {
  const variantClass =
    variant === 'plain' ? 'callout--plain' : variant === 'tip' ? 'callout--tip' : ''

  return (
    <div className={['callout', variantClass].filter(Boolean).join(' ')}>
      <div className="callout__icon" aria-hidden>
        {emoji ? <span style={{ fontSize: 18 }}>{emoji}</span> : <Icon name={icon} />}
      </div>
      <div className="callout__content">{children}</div>
    </div>
  )
}
