import {
  Accessibility,
  ArrowRight,
  Feather,
  Heart,
  Instagram,
  Lightbulb,
  Sparkles,
  Sun,
  type LucideIcon,
} from 'lucide-react'

/**
 * Los iconos del sitio original son emojis/iconos de Notion en color.
 * Aquí se replican con Lucide manteniendo el mismo color de acento.
 */
const REGISTRY: Record<string, { Icon: LucideIcon; color: string }> = {
  sun: { Icon: Sun, color: 'var(--color-yellow)' },
  sparkles: { Icon: Sparkles, color: 'var(--color-yellow)' },
  heart: { Icon: Heart, color: 'var(--color-orange)' },
  feather: { Icon: Feather, color: 'var(--color-gray)' },
  accessibility: { Icon: Accessibility, color: 'var(--color-green)' },
  'arrow-right-blue': { Icon: ArrowRight, color: 'var(--color-blue)' },
  'arrow-right-red': { Icon: ArrowRight, color: 'var(--color-red)' },
  'arrow-right-orange': { Icon: ArrowRight, color: 'var(--color-orange)' },
  bulb: { Icon: Lightbulb, color: 'var(--color-yellow)' },
  instagram: { Icon: Instagram, color: 'var(--color-blue)' },
}

export type IconName = keyof typeof REGISTRY

export function Icon({
  name,
  size = 20,
  strokeWidth = 2,
}: {
  name: string
  size?: number
  strokeWidth?: number
}) {
  const entry = REGISTRY[name] ?? REGISTRY.sparkles
  const { Icon: LucideGlyph, color } = entry

  return <LucideGlyph size={size} color={color} strokeWidth={strokeWidth} aria-hidden />
}
