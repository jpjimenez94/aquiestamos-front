import { ButtonLink } from '@/components/ui/Button'
import { ruta, type Idioma } from '@/lib/i18n/idiomas'
import type { Diccionario } from '@/lib/i18n/diccionarios/es'

/**
 * «No encontramos esta página», en el idioma que se le diga.
 *
 * Es solo el contenido: la barra y el pie los pone quien lo usa. No lleva
 * `'use client'` ni nada del servidor, porque lo pintan los dos 404 del sitio
 * —el de la raíz, desde el servidor, y el de los idiomas, desde el cliente—.
 */
export function NoEncontrada({
  idioma,
  t,
}: {
  idioma: Idioma
  t: Diccionario['noEncontrada']
}) {
  return (
    <section className="content section" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <h1>{t.titulo}</h1>
      <p className="text-muted">{t.texto}</p>
      <div className="button-row" style={{ marginTop: 20 }}>
        <ButtonLink href={ruta(idioma, '/')} variant="primary">
          {t.inicio}
        </ButtonLink>
        <ButtonLink href={ruta(idioma, '/recursos')}>{t.recursos}</ButtonLink>
      </div>
    </section>
  )
}
