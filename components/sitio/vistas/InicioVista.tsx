import Image from 'next/image'
import Link from 'next/link'
import { Instagram, MessageCircle } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { Icon } from '@/components/ui/Icon'
import { TARJETAS_INICIO, site, whatsappHref } from '@/lib/site'
import { ruta, type Idioma } from '@/lib/i18n/idiomas'
import { diccionario } from '@/lib/i18n/diccionario'
import { SeccionPreguntasFrecuentes } from '@/components/sitio/SeccionPreguntasFrecuentes'
import { InfografiaEmergencia } from '@/components/sitio/InfografiaEmergencia'
import { TextoRico } from '@/components/sitio/TextoRico'
import { numeroWhatsapp } from './comun'

/**
 * La portada, en el idioma que se le pida.
 *
 * La usan `app/(sitio)/page.tsx` (español) y `app/[lang]/page.tsx` (los
 * demás). Es una sola a propósito: dos portadas que hay que acordarse de
 * mantener iguales acaban siendo dos portadas distintas.
 */
export function InicioVista({ idioma }: { idioma: Idioma }) {
  const t = diccionario(idioma)
  const i = t.inicio

  return (
    <>
      {/* ---------- Portada ---------- */}
      <section className="content section">
        <div className="block-image" style={{ marginBottom: 28 }}>
          <Image
            src="/images/hero.png"
            alt={i.heroAlt}
            width={1440}
            height={623}
            priority
            sizes="(max-width: 780px) 100vw, 720px"
          />
        </div>

        <h1>{i.titulo}</h1>

        <p>{t.sitio.descripcion}</p>

        <p>
          <TextoRico texto={i.duracion} idioma={idioma} />
        </p>

        <Callout icon="arrow-right-red">
          <p>{i.etapa}</p>
        </Callout>
      </section>

      <div className="content">
        <hr className="divider" />
      </div>

      {/* ---------- Accesos ---------- */}
      <section className="content content--wide section" id="como-ayudamos">
        <h2 style={{ marginBottom: 24 }}>{i.accesos}</h2>

        <div className="columns columns--3">
          {TARJETAS_INICIO.map((card) => {
            const texto = i.tarjetas[card.id]
            return (
              <Link className="nav-card" href={ruta(idioma, card.href)} key={card.id}>
                <div className="nav-card__image">
                  <Image src={card.image} alt="" fill sizes="(max-width: 780px) 100vw, 320px" />
                </div>
                <h3 className="nav-card__title">
                  <Icon name={card.icon} size={22} />
                  {texto.titulo}
                </h3>
                <p className="nav-card__text">{texto.texto}</p>
              </Link>
            )
          })}
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
              alt={i.sobreAlt}
              width={768}
              height={606}
              sizes="(max-width: 900px) 100vw, 400px"
            />
          </div>
          <div>
            <h2>{i.sobreTitulo}</h2>
            <p>{i.sobreTexto}</p>
          </div>
        </div>
      </section>

      <div className="content">
        <hr className="divider" />
      </div>

      {/* ---------- Preguntas Frecuentes ---------- */}
      <SeccionPreguntasFrecuentes idioma={idioma} t={t.preguntas} />

      <div className="content">
        <hr className="divider" />
      </div>

      {/* ---------- Contacto ---------- */}
      <section className="content content--wide section" id="contacto">
        {/*
          Donde iba la imagen `contacto.png` va ahora el mismo cartel hecho
          con texto de verdad. Ver `InfografiaEmergencia`.
        */}
        <InfografiaEmergencia idioma={idioma} t={t.emergencia} />

        <h2 style={{ marginBottom: 24 }}>{i.contacto}</h2>

        <div className="contact-grid">
          <div>
            <h3 className="contact-card__title">
              <span aria-hidden style={{ color: 'var(--color-red)' }}>
                ♡
              </span>
              {i.noEstasSola}
            </h3>
            <p className="text-muted">{i.estamosAqui}</p>
          </div>

          <div>
            <h3 className="contact-card__title">
              <Icon name="sparkles" size={20} />
              {i.whatsappTitulo}
            </h3>
            <p className="text-muted">{numeroWhatsapp(idioma)}</p>
            <ButtonLink href={whatsappHref} external icon={<MessageCircle size={16} />}>
              {i.whatsappBoton}
            </ButtonLink>
          </div>

          <div>
            <h3 className="contact-card__title">
              <Icon name="instagram" size={20} />
              {i.instagramTitulo}
            </h3>
            <p className="text-muted">{site.instagramHandle}</p>
            <ButtonLink href={site.instagramUrl} external icon={<Instagram size={16} />}>
              {i.instagramBoton}
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ---------- Cierre ---------- */}
      <section className="content section">
        <div className="block-image" style={{ marginBottom: 28 }}>
          <Image
            src="/images/cierre.png"
            alt={i.cierreAlt}
            width={672}
            height={538}
            sizes="(max-width: 780px) 100vw, 720px"
          />
        </div>

        <hr className="divider" />

        <h2 className="text-center">{i.cierre}</h2>
      </section>
    </>
  )
}
