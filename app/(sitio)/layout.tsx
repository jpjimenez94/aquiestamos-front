import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BotonFlotanteAcciones } from '@/components/sitio/BotonFlotanteAcciones'

/**
 * Envoltura del sitio público: la barra de navegación, el pie y botones flotantes.
 */
export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <Navbar />
      <main className="page__main">{children}</main>
      <BotonFlotanteAcciones />
      <Footer />
    </div>
  )
}
