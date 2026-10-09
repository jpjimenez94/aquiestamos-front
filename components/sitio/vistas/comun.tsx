import Link from 'next/link'
import { Callout } from '@/components/ui/Callout'
import { TextoRico } from '@/components/sitio/TextoRico'
import { site } from '@/lib/site'
import { ETIQUETA, IDIOMA_BASE, rellenar, ruta, type Idioma } from '@/lib/i18n/idiomas'
import type { Bloque } from '@/lib/i18n/diccionarios/es'

/**
 * Piezas que comparten las páginas del sitio.
 */

type Variables = Record<string, string | number | null | undefined>

/**
 * El WhatsApp de la red como hay que enseñarlo en cada idioma.
 *
 * En español, como se marca en Colombia. En los demás, con el indicativo:
 * quien lee en inglés o portugués puede estar en otro país, y «310 218 6299»
 * a secas no le sirve para llamar.
 */
export function numeroWhatsapp(idioma: Idioma): string {
  return idioma === IDIOMA_BASE ? site.whatsappDisplay : site.whatsappInternacional
}

/**
 * Pinta una lista de bloques del diccionario: párrafos, viñetas y recuadros.
 * Es como se escriben los textos largos —la política de datos— para que los
 * tres idiomas tengan exactamente la misma estructura.
 */
export function Bloques({
  bloques,
  idioma,
  variables = {},
}: {
  bloques: readonly Bloque[]
  idioma: Idioma
  variables?: Variables
}) {
  return (
    <>
      {bloques.map((bloque, i) => {
        if (typeof bloque === 'string') {
          return (
            <p key={i}>
              <TextoRico texto={rellenar(bloque, variables)} idioma={idioma} />
            </p>
          )
        }

        if ('lista' in bloque) {
          return (
            <ul className="plain" key={i}>
              {bloque.lista.map((linea) => (
                <li key={linea}>
                  <TextoRico texto={rellenar(linea, variables)} idioma={idioma} />
                </li>
              ))}
            </ul>
          )
        }

        return (
          <Callout icon="arrow-right-red" key={i}>
            <p style={{ margin: 0 }}>
              <TextoRico texto={rellenar(bloque.aviso, variables)} idioma={idioma} />
            </p>
          </Callout>
        )
      })}
    </>
  )
}

/**
 * «Esta es una traducción de cortesía.»
 *
 * Va arriba de las dos páginas legales en inglés y portugués. La política de
 * datos y el consentimiento se rigen por la ley colombiana y lo que la gente
 * firma es el texto en español; la traducción ayuda a entenderlo, pero no lo
 * sustituye, y eso hay que decirlo antes de que nadie lo dé por hecho.
 *
 * En español no pinta nada: `aviso` viene vacío.
 */
export function AvisoDeTraduccion({
  aviso,
  verOriginal,
  rutaSinPrefijo,
}: {
  aviso: string
  verOriginal: string
  rutaSinPrefijo: string
}) {
  if (!aviso) return null

  return (
    <div className="aviso-traduccion" role="note">
      <p>
        {aviso}{' '}
        <Link
          href={ruta(IDIOMA_BASE, rutaSinPrefijo)}
          hrefLang={ETIQUETA[IDIOMA_BASE]}
          className="enlace-texto"
        >
          {verOriginal}
        </Link>
      </p>
    </div>
  )
}
