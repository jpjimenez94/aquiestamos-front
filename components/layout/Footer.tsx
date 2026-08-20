import Image from 'next/image'
import Link from 'next/link'
import { Instagram, MessageCircle } from 'lucide-react'
import { navLinks, site, whatsappHref } from '@/lib/site'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Image src="/images/logo.png" alt={site.name} width={150} height={58} />
          <p>
            Somos una red colaborativa que busca facilitar el acceso a la atención
            psicológica y promover el bienestar emocional a través de la comunidad, la
            información y el acompañamiento.
          </p>
        </div>

        <nav className="footer__nav" aria-label="Enlaces del pie de página">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="footer__nav">
          <Link href="/politica-de-datos">Política de datos</Link>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            WhatsApp {site.whatsappDisplay}
          </a>
          <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer">
            <Instagram size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            {site.instagramHandle}
          </a>
        </div>
      </div>

      <div className="footer__bottom">
        {site.name} — {site.tagline}. Acompañar es una forma de reconstruir nuestro país.
      </div>
    </footer>
  )
}
