import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

/**
 * Envoltura del sitio público: la barra de navegación y el pie.
 *
 * Va en un grupo de rutas y no en el layout raíz para que el portal no la
 * herede. Cuando la heredaba, una página del portal dibujaba dos menús —el
 * del sitio y el suyo— y dos elementos <main> anidados, que además es HTML
 * inválido. El nombre entre paréntesis no aparece en la URL: /quiero-apoyar
 * sigue siendo /quiero-apoyar.
 */
export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <Navbar />
      <main className="page__main">{children}</main>
      <Footer />
    </div>
  )
}
