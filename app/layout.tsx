import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { site } from '@/lib/site'
import './globals.css'

// Mismas familias tipográficas que usa el sitio original.
const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

// En Vercel, VERCEL_URL trae el dominio del despliegue actual.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  icons: { icon: '/favicon.png', apple: '/favicon.png' },
  openGraph: {
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    type: 'website',
    locale: 'es_CO',
    images: ['/images/hero.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#15162e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body>
        <div className="page">
          <Navbar />
          <main className="page__main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
