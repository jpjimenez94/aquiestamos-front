import Image from 'next/image'
import { Heart, MessageCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { ButtonLink } from '@/components/ui/Button'
import { CopiarDato } from '@/components/sitio/CopiarDato'
import { getImpacto, type CifrasDeImpacto } from '@/lib/api'
import { site, whatsappConMensaje } from '@/lib/site'
import { ETIQUETA, rellenar, ruta, type Idioma } from '@/lib/i18n/idiomas'
import { diccionario } from '@/lib/i18n/diccionario'

/**
 * «Donar»: todo en una sola página, como lo pidió el equipo en noviembre de
 * 2026 — un llamado claro a donar, las cifras de la red e imágenes que
 * asocien lo que el aporte hace posible.
 *
 * Las cifras salen del backend (`GET /api/impacto`), que cuenta las sesiones
 * con la misma regla que el informe semanal. Se piden una vez por hora; si el
 * backend no contesta, la sección simplemente no aparece. Una cifra en cero
 * tampoco se enseña: «0 personas acompañadas» en una página para pedir
 * donaciones diría algo que no es verdad, solo que todavía no se ha medido.
 *
 * El QR y la cuenta bancaria salen de `site.donaciones`; mientras no estén,
 * sus secciones no se pintan.
 *
 * Las imágenes son las ilustraciones del sitio mientras el equipo manda fotos
 * de su trabajo (con el permiso de quienes aparezcan en ellas).
 */

const IMAGENES = ['/images/card-atencion.png', '/images/sobre-nosotros.png', '/images/cierre.png'] as const

const ORDEN_DE_CIFRAS = ['profesionales', 'personasAcompanadas', 'sesiones', 'voluntariosDeApoyo'] as const satisfies readonly (keyof CifrasDeImpacto)[]

export async function DonarVista({ idioma }: { idioma: Idioma }) {
  const t = diccionario(idioma)
  const d = t.donar
  const { qr, banco, whydonate } = site.donaciones

  const cifras = await getImpacto()
  const numero = new Intl.NumberFormat(ETIQUETA[idioma])
  const visibles = cifras ? ORDEN_DE_CIFRAS.filter((clave) => cifras[clave] > 0) : []
  const fecha = cifras
    ? new Intl.DateTimeFormat(ETIQUETA[idioma], {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Bogota',
      }).format(new Date(cifras.actualizado))
    : ''

  return (
    <>
      <PageHeader
        cover="/images/cover-atencion.png"
        icon="heart"
        title={d.titulo}
        crumbs={[{ href: ruta(idioma, '/donar'), label: d.meta.titulo }]}
        inicio={{ href: ruta(idioma, '/'), label: t.migas.inicio }}
        rutaAria={t.migas.ruta}
      >
        <p>{d.bajada}</p>
      </PageHeader>

      <section className="content section">
        <p>{d.intro}</p>
        <div className="button-row" style={{ margin: '20px 0 10px' }}>
          <ButtonLink href={whydonate} external variant="primary" icon={<Heart size={16} />}>
            {d.boton}
          </ButtonLink>
        </div>
        <p className="text-muted" style={{ fontSize: '0.86rem' }}>
          {d.botonNota} {d.titular}
        </p>
      </section>

      {cifras && visibles.length > 0 ? (
        <section className="content content--wide section" aria-labelledby="donar-cifras">
          <h2 id="donar-cifras">{d.cifrasTitulo}</h2>
          <ul className="cifras">
            {visibles.map((clave) => (
              <li className="cifra" key={clave}>
                <span className="cifra__numero">{numero.format(cifras[clave])}</span>
                <span className="cifra__texto">{d.cifras[clave]}</span>
              </li>
            ))}
          </ul>
          <p className="text-muted" style={{ fontSize: '0.82rem' }}>
            {rellenar(d.cifrasNota, { fecha })}
          </p>
        </section>
      ) : null}

      <section className="content content--wide section" aria-labelledby="donar-impacto">
        <h2 id="donar-impacto">{d.impactoTitulo}</h2>
        <div className="impacto">
          {d.impacto.map((item, n) => (
            <article className="impacto__tarjeta" key={item.titulo}>
              <div className="impacto__imagen">
                <Image
                  src={IMAGENES[n % IMAGENES.length]}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 320px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="impacto__cuerpo">
                <h3>{item.titulo}</h3>
                <p>{item.texto}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="button-row" style={{ marginTop: 28 }}>
          <ButtonLink href={whydonate} external variant="primary" icon={<Heart size={16} />}>
            {d.boton}
          </ButtonLink>
        </div>
      </section>

      {qr || banco ? (
        <section className="content content--wide section">
          <div className="donar-medios">
            {qr ? (
              <div className="donar-medio">
                <h2>{d.qrTitulo}</h2>
                <p className="text-muted">{d.qrTexto}</p>
                <Image src={qr} alt={d.qrAlt} width={240} height={240} />
              </div>
            ) : null}
            {banco ? (
              <div className="donar-medio">
                <h2>{d.bancoTitulo}</h2>
                {banco.logo ? (
                  <Image src={banco.logo} alt={banco.entidad} width={160} height={48} style={{ objectFit: 'contain' }} />
                ) : null}
                <dl className="donar-banco">
                  <dt>{d.banco.entidad}</dt>
                  <dd>{banco.entidad}</dd>
                  <dt>{d.banco.titular}</dt>
                  <dd>{banco.titular}</dd>
                  {banco.documento ? (
                    <>
                      <dt>{d.banco.documento}</dt>
                      <dd>{banco.documento}</dd>
                    </>
                  ) : null}
                  <dt>{d.banco.tipo}</dt>
                  <dd>{banco.tipo}</dd>
                  <dt>{d.banco.numero}</dt>
                  <dd>{banco.numero}</dd>
                </dl>
                <div style={{ marginTop: 14 }}>
                  <CopiarDato texto={banco.numero} etiqueta={d.copiar} hecho={d.copiado} />
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="content section">
        <p>{d.dudas}</p>
        <ButtonLink href={whatsappConMensaje(d.dudasMensaje)} external icon={<MessageCircle size={16} />}>
          {d.dudasBoton}
        </ButtonLink>
      </section>
    </>
  )
}
