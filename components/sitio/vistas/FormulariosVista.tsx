import { Languages, MessageCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Callout } from '@/components/ui/Callout'
import { ButtonLink } from '@/components/ui/Button'
import { SupportRequestForm } from '@/components/forms/SupportRequestForm'
import { VolunteerForm } from '@/components/forms/VolunteerForm'
import { CollaboratorForm } from '@/components/forms/CollaboratorForm'
import { InfografiaCamino } from '@/components/sitio/InfografiaCamino'
import { TextoRico } from '@/components/sitio/TextoRico'
import { ConHueco } from '@/components/sitio/ConHueco'
import { site, whatsappHref } from '@/lib/site'
import { RESPONSABLE } from '@/lib/consentimiento'
import { rellenar, ruta, type Idioma } from '@/lib/i18n/idiomas'
import { diccionario } from '@/lib/i18n/diccionario'
import { numeroWhatsapp } from './comun'

/**
 * Las tres páginas con formulario: pedir ayuda, postularse como profesional y
 * sumarse como voluntario general.
 *
 * Cada vista le pasa a su formulario —que es un componente de cliente— el
 * trozo del diccionario que necesita. El formulario no lo importa por su
 * cuenta: si lo hiciera, los tres idiomas enteros viajarían al navegador.
 */

/** Los años que se guardan los datos, que es como lo dicen los formularios. */
const ANOS_DE_RETENCION = RESPONSABLE.retencionMeses / 12

/**
 * Un aviso que solo llevan las traducciones: en qué idioma se atiende.
 * En español viene vacío y no pinta nada.
 */
function AvisoDeIdioma({ texto }: { texto: string }) {
  if (!texto) return null
  return (
    <div className="aviso-idioma" role="note">
      <Languages size={18} aria-hidden />
      <p>{texto}</p>
    </div>
  )
}

/** «Necesito ayuda» */
export function AtencionVista({ idioma }: { idioma: Idioma }) {
  const t = diccionario(idioma)
  const a = t.atencion

  return (
    <>
      <PageHeader
        cover="/images/cover-atencion.png"
        icon="arrow-right-blue"
        title={a.titulo}
        crumbs={[{ href: ruta(idioma, '/atencion-psicologica'), label: a.titulo }]}
        inicio={{ href: ruta(idioma, '/'), label: t.migas.inicio }}
        rutaAria={t.migas.ruta}
      >
        <p>{a.bajada}</p>
      </PageHeader>

      <section className="content section">
        <div style={{ marginTop: 24, marginBottom: 20 }}>
          <Callout icon="heart">
            <p style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.5 }}>
              <TextoRico texto={a.aviso} idioma={idioma} />
            </p>
          </Callout>
        </div>

        {/*
          Antes del formulario y no después: quien necesita atención en otro
          idioma tiene que saber cómo se atiende ANTES de contar lo que le pasa.
        */}
        <AvisoDeIdioma texto={t.avisos.atencionEnEspanol} />

        <div className="button-row" style={{ margin: '16px 0 28px' }}>
          <ButtonLink href={whatsappHref} external icon={<MessageCircle size={16} />}>
            {rellenar(a.whatsapp, { numero: numeroWhatsapp(idioma) })}
          </ButtonLink>
        </div>

        <SupportRequestForm
          idioma={idioma}
          t={t.formularios.atencion}
          comun={t.formularios.comun}
        />
      </section>
    </>
  )
}

/** «Quiero dar apoyo psicológico» */
export function QuieroSerParteVista({ idioma }: { idioma: Idioma }) {
  const t = diccionario(idioma)
  const s = t.serParte

  return (
    <>
      <PageHeader
        cover="/images/cover-ser-parte.png"
        icon="sun"
        title={s.titulo}
        crumbs={[{ href: ruta(idioma, '/quiero-ser-parte'), label: s.titulo }]}
        inicio={{ href: ruta(idioma, '/'), label: t.migas.inicio }}
        rutaAria={t.migas.ruta}
      >
        <p>{s.bajada}</p>
      </PageHeader>

      <section className="content section">
        <Callout icon="arrow-right-orange">
          {s.aviso.map((parrafo) => (
            <p key={parrafo}>{parrafo}</p>
          ))}
        </Callout>

        <AvisoDeIdioma texto={t.avisos.redEnEspanol} />

        <div className="button-row" style={{ margin: '24px 0 32px' }}>
          <ButtonLink href={whatsappHref} external icon={<MessageCircle size={16} />}>
            {s.whatsapp}
          </ButtonLink>
        </div>

        <h2 id="formulario" style={{ scrollMarginTop: 100 }}>
          {s.formulario}
        </h2>
        <p className="text-muted" style={{ marginBottom: 24 }}>
          <ConHueco frase={s.obligatorios} hueco="asterisco">
            <span style={{ color: 'var(--color-red)' }}>*</span>
          </ConHueco>
        </p>

        <VolunteerForm
          idioma={idioma}
          t={t.formularios.profesional}
          comun={t.formularios.comun}
          // Aquí siempre con indicativo, como ya lo decía el formulario: es el
          // número al que alguien manda sus documentos, quizá desde otro país.
          whatsapp={site.whatsappInternacional}
          anosDeRetencion={ANOS_DE_RETENCION}
        />
      </section>

      {/*
        Donde iba la imagen `ser-parte-body.png` va ahora el mismo cartel hecho
        con texto de verdad. Sale del ancho de la columna de lectura porque el
        cartel es más ancho que un párrafo. Ver `InfografiaCamino`.
      */}
      <section className="content content--wide section">
        <InfografiaCamino t={t.camino} whatsapp={numeroWhatsapp(idioma)} />
      </section>
    </>
  )
}

/** «Quiero ser voluntario general» */
export function QuieroApoyarVista({ idioma }: { idioma: Idioma }) {
  const t = diccionario(idioma)
  const a = t.apoyar

  return (
    <>
      <PageHeader
        cover="/images/cover-ser-parte.png"
        icon="sun"
        title={a.titulo}
        crumbs={[{ href: ruta(idioma, '/quiero-apoyar'), label: a.titulo }]}
        inicio={{ href: ruta(idioma, '/'), label: t.migas.inicio }}
        rutaAria={t.migas.ruta}
      >
        <p>{a.bajada}</p>
      </PageHeader>

      <section className="content section">
        <div style={{ marginTop: 24, marginBottom: 20 }}>
          <Callout icon="arrow-right-orange">
            <p style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.5 }}>
              <TextoRico texto={a.aviso} idioma={idioma} />
            </p>
          </Callout>
        </div>

        <AvisoDeIdioma texto={t.avisos.redEnEspanol} />

        <div className="button-row" style={{ margin: '16px 0 28px' }}>
          <ButtonLink href={whatsappHref} external icon={<MessageCircle size={16} />}>
            {rellenar(a.whatsapp, { numero: numeroWhatsapp(idioma) })}
          </ButtonLink>
        </div>

        <CollaboratorForm
          idioma={idioma}
          t={t.formularios.apoyo}
          comun={t.formularios.comun}
          anosDeRetencion={ANOS_DE_RETENCION}
        />
      </section>
    </>
  )
}
