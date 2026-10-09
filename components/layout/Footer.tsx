import Image from 'next/image'
import Link from 'next/link'
import { Instagram, MessageCircle } from 'lucide-react'
import { ENLACES_NAV, site, whatsappHref } from '@/lib/site'
import { IDIOMA_BASE, ruta, type Idioma } from '@/lib/i18n/idiomas'
import { diccionario } from '@/lib/i18n/diccionario'

export function Footer({ idioma = IDIOMA_BASE }: { idioma?: Idioma }) {
  const t = diccionario(idioma)
  // Fuera del español se enseña el número con indicativo: quien lee en inglés
  // o portugués puede estar en otro país, y sin el +57 no le sirve para llamar.
  const whatsapp = idioma === IDIOMA_BASE ? site.whatsappDisplay : site.whatsappInternacional

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Image src="/images/logo.png" alt={t.sitio.nombre} width={150} height={58} />
          <p>{t.pie.presentacion}</p>
        </div>

        <nav className="footer__nav" aria-label={t.pie.enlaces}>
          {ENLACES_NAV.map((enlace) => (
            <Link key={enlace.id} href={ruta(idioma, enlace.href)}>
              {t.nav.enlaces[enlace.id].etiqueta}
            </Link>
          ))}
        </nav>

        <div className="footer__nav">
          <Link href={ruta(idioma, '/#preguntas-frecuentes')}>{t.pie.preguntas}</Link>
          <Link href={ruta(idioma, '/politica-de-datos')}>{t.pie.politica}</Link>
          {/* Al lado de la política: son los dos textos que la gente acepta. */}
          <Link href={ruta(idioma, '/consentimiento-informado')}>{t.pie.consentimiento}</Link>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            WhatsApp {whatsapp}
          </a>
          <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer">
            <Instagram size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            {site.instagramHandle}
          </a>
        </div>
      </div>

      <div className="footer__bottom">
        {t.sitio.nombre} — {t.sitio.lema}. {t.pie.cierre}
      </div>
    </footer>
  )
}
