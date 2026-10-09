import { SitioShell } from '@/components/sitio/SitioShell'

/**
 * Envoltura del sitio público EN ESPAÑOL: la barra de navegación, el pie y los
 * botones flotantes.
 *
 * Las páginas en español viven aquí, sin prefijo en la URL —`/recursos`, no
 * `/es/recursos`—, que es donde han estado siempre. Las de los demás idiomas
 * cuelgan de `app/[lang]` y usan esta misma envoltura con su idioma.
 */
export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return <SitioShell idioma="es">{children}</SitioShell>
}
