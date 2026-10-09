import Link from 'next/link'
import { ruta, type Idioma } from '@/lib/i18n/idiomas'
import { partes } from '@/lib/i18n/textoRico'

/**
 * Pinta una frase del diccionario con sus negritas y sus enlaces.
 *
 * Los enlaces internos pasan por `ruta()`: un `[política](/politica-de-datos)`
 * dentro de una página en inglés lleva a `/en/politica-de-datos`, sin que
 * quien tradujo la frase tenga que acordarse del prefijo. Es la mitad del
 * motivo por el que los enlaces van dentro de la cadena y no a mano.
 *
 * No lleva `'use client'` ni nada del servidor: lo usan las páginas (servidor)
 * y las preguntas frecuentes (cliente) por igual.
 */
export function TextoRico({
  texto,
  idioma,
  claseEnlace = 'enlace-texto',
  nuevaPestana = false,
}: {
  texto: string
  idioma: Idioma
  claseEnlace?: string
  /** Abre los enlaces internos en otra pestaña. Para dentro de un formulario. */
  nuevaPestana?: boolean
}) {
  return (
    <>
      {partes(texto).map((parte, i) => {
        if (parte.tipo === 'texto') return parte.texto
        if (parte.tipo === 'fuerte') return <strong key={i}>{parte.texto}</strong>
        if (parte.tipo === 'codigo') {
          return (
            <code key={i} className="codigo-texto">
              {parte.texto}
            </code>
          )
        }

        const { href, texto: etiqueta } = parte

        /**
         * Solo destinos conocidos. Lo demás —un `javascript:`, un `data:`— se
         * pinta como texto y no como enlace.
         *
         * Las frases salen del diccionario, que escribimos nosotros, así que
         * hoy esto no frena a nadie. Está por el día en que alguien rellene
         * una frase con algo que tecleó un visitante: que el peor resultado
         * posible sea un corchete a la vista y no un enlace que ejecuta código.
         */
        if (!/^(\/|#|https?:|tel:|mailto:|sms:)/i.test(href)) return etiqueta

        // Dentro del sitio: con el prefijo del idioma.
        if (href.startsWith('/')) {
          // En mitad de un formulario, el enlace se abre aparte: seguirlo en la
          // misma pestaña borraría lo que la persona lleva escrito.
          if (nuevaPestana) {
            return (
              <a
                key={i}
                className={claseEnlace}
                href={ruta(idioma, href)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {etiqueta}
              </a>
            )
          }
          return (
            <Link key={i} className={claseEnlace} href={ruta(idioma, href)}>
              {etiqueta}
            </Link>
          )
        }

        // Un teléfono o un correo abren su aplicación: una pestaña nueva en
        // blanco detrás de la llamada solo estorba.
        if (/^(tel|mailto|sms):/.test(href)) {
          return (
            <a key={i} className={claseEnlace} href={href}>
              {etiqueta}
            </a>
          )
        }

        return (
          <a key={i} className={claseEnlace} href={href} target="_blank" rel="noopener noreferrer">
            {etiqueta}
          </a>
        )
      })}
    </>
  )
}
