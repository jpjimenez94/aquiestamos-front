import Image from 'next/image'
import Link from 'next/link'
import { Instagram, MessageCircle } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { Icon } from '@/components/ui/Icon'
import { homeCards, site, whatsappHref } from '@/lib/site'
import { SeccionPreguntasFrecuentes } from '@/components/sitio/SeccionPreguntasFrecuentes'

export default function HomePage() {
  return (
    <>
      {/* ---------- Portada ---------- */}
      <section className="content section">
        <div className="block-image" style={{ marginBottom: 28 }}>
          <Image
            src="/images/hero.png"
            alt="Ilustración de la red Aquí Estamos"
            width={1440}
            height={623}
            priority
            sizes="(max-width: 780px) 100vw, 720px"
          />
        </div>

        <h1>Red de acompañamiento psicológico y atención en crisis</h1>

        <p>{site.description}</p>

        <p>
          Brindará acompañamiento y atención durante los próximos <strong>3 a 4 meses</strong>,
          aportando así a la reconstrucción del tejido social.
        </p>

        <Callout icon="arrow-right-red">
          <p>
            Durante esta primera etapa, estamos construyendo una comunidad colaborativa de
            profesionales comprometidos con el cuidado emocional, la prevención y la atención
            en situaciones de crisis.
          </p>
        </Callout>
      </section>

      <div className="content">
        <hr className="divider" />
      </div>

      {/* ---------- Accesos ---------- */}
      <section className="content content--wide section" id="como-ayudamos">
        <h2 style={{ marginBottom: 24 }}>¿Cómo podemos ayudarte?</h2>

        <div className="columns columns--3">
          {homeCards.map((card) => (
            <Link className="nav-card" href={card.href} key={card.href}>
              <div className="nav-card__image">
                <Image
                  src={card.image}
                  alt=""
                  fill
                  sizes="(max-width: 780px) 100vw, 320px"
                />
              </div>
              <h3 className="nav-card__title">
                <Icon name={card.icon} size={22} />
                {card.title}
              </h3>
              <p className="nav-card__text">{card.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="content">
        <hr className="divider" />
      </div>

      {/* ---------- Sobre nosotros ---------- */}
      <section className="content content--wide section" id="sobre-nosotros">
        <div className="columns columns--about">
          <div className="block-image">
            <Image
              src="/images/sobre-nosotros.png"
              alt="Manos que se acompañan"
              width={768}
              height={606}
              sizes="(max-width: 900px) 100vw, 400px"
            />
          </div>
          <div>
            <h2>Sobre Aquí Estamos</h2>
            <p>
              Somos una red colaborativa que busca facilitar el acceso a la atención
              psicológica y promover el bienestar emocional a través de la comunidad, la
              información y el acompañamiento.
            </p>
          </div>
        </div>
      </section>

      <div className="content">
        <hr className="divider" />
      </div>

      {/* ---------- Preguntas Frecuentes ---------- */}
      <SeccionPreguntasFrecuentes />

      <div className="content">
        <hr className="divider" />
      </div>

      {/* ---------- Contacto ---------- */}
      <section className="content content--wide section" id="contacto">
        {/* Igual que en el original: la infografía se muestra completa, sin recortar. */}
        <div className="block-image block-image--tall" style={{ marginBottom: 32 }}>
          <Image
            src="/images/contacto.png"
            alt="Infografía: cómo acompañar después de una emergencia"
            width={1024}
            height={1536}
            sizes="(max-width: 900px) 100vw, 704px"
          />
        </div>

        <h2 style={{ marginBottom: 24 }}>Contáctanos</h2>

        <div className="contact-grid">
          <div>
            <h3 className="contact-card__title">
              <span aria-hidden style={{ color: 'var(--color-red)' }}>
                ♡
              </span>
              No estás sola/o.
            </h3>
            <p className="text-muted">Estamos aquí para acompañarte.</p>
          </div>

          <div>
            <h3 className="contact-card__title">
              <Icon name="sparkles" size={20} />
              Escríbenos por WhatsApp
            </h3>
            <p className="text-muted">{site.whatsappDisplay}</p>
            <ButtonLink href={whatsappHref} external icon={<MessageCircle size={16} />}>
              Enviar mensaje a Whatsapp
            </ButtonLink>
          </div>

          <div>
            <h3 className="contact-card__title">
              <Icon name="instagram" size={20} />
              Síguenos en Instagram
            </h3>
            <p className="text-muted">{site.instagramHandle}</p>
            <ButtonLink href={site.instagramUrl} external icon={<Instagram size={16} />}>
              Síguenos
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ---------- Cierre ---------- */}
      <section className="content section">
        <div className="block-image" style={{ marginBottom: 28 }}>
          <Image
            src="/images/cierre.png"
            alt="Ilustración de comunidad"
            width={672}
            height={538}
            sizes="(max-width: 780px) 100vw, 720px"
          />
        </div>

        <hr className="divider" />

        <h2 className="text-center">Acompañar es una forma de reconstruir nuestro país</h2>
      </section>
    </>
  )
}
