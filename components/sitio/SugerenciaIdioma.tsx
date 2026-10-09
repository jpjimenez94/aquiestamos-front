'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import {
  CLAVE_IDIOMA_ELEGIDO,
  ETIQUETA,
  equivalente,
  idiomaPreferido,
  type Idioma,
} from '@/lib/i18n/idiomas'

type Textos = { sugerencia: string; ver: string; cerrar: string }

/**
 * «Este sitio también está en inglés».
 *
 * A quien llega a una página en un idioma con el navegador puesto en otro que
 * el sitio también tiene, se le ofrece —una vez— verla en el suyo. Lo normal
 * es que alguien de fuera llegue por un enlace que le pasaron, que apunta a la
 * versión en español, y el selector de arriba es fácil de no ver.
 *
 * Se OFRECE, no se redirige. Mandar a la gente sola a otro idioma según su
 * navegador falla justo donde más molesta: medio país tiene el teléfono en
 * inglés y lee en español. Aquí la persona decide, y lo que decida —aceptar,
 * cerrar, o elegir a mano en el selector— se apunta para no volver a
 * preguntarle.
 *
 * El aviso va escrito en el idioma que se ofrece, no en el de la página: se le
 * está hablando a quien quizá no entiende la página.
 *
 * No aparece en el HTML que manda el servidor, que no sabe qué navegador hay
 * al otro lado; se decide al montar. Por eso flota en vez de empujar el
 * contenido: un aviso que aparece tarde y desplaza la página hace que la
 * gente toque lo que no quería tocar.
 */
export function SugerenciaIdioma({
  actual,
  textos,
}: {
  actual: Idioma
  /** Las tres versiones del aviso: se usa la del idioma que se ofrece. */
  textos: Record<Idioma, Textos>
}) {
  const pathname = usePathname()
  const [ofrecido, setOfrecido] = useState<Idioma | null>(null)

  useEffect(() => {
    try {
      if (window.localStorage.getItem(CLAVE_IDIOMA_ELEGIDO)) return
    } catch {
      // Sin almacenamiento (modo privado estricto) no se puede recordar la
      // respuesta, y un aviso que vuelve a salir en cada página es peor que
      // ninguno.
      return
    }

    const preferido = idiomaPreferido(navigator.languages ?? [navigator.language])
    setOfrecido(preferido && preferido !== actual ? preferido : null)
  }, [actual])

  function recordar() {
    try {
      window.localStorage.setItem(CLAVE_IDIOMA_ELEGIDO, '1')
    } catch {
      // Ver arriba: si no se puede guardar, al menos se cierra ahora.
    }
    setOfrecido(null)
  }

  if (!ofrecido) return null
  const t = textos[ofrecido]

  return (
    <aside className="sugerencia-idioma" lang={ETIQUETA[ofrecido]} role="status">
      <p className="sugerencia-idioma__texto">{t.sugerencia}</p>
      <Link
        className="sugerencia-idioma__ver"
        href={equivalente(pathname, ofrecido)}
        hrefLang={ETIQUETA[ofrecido]}
        onClick={recordar}
      >
        {t.ver}
      </Link>
      <button
        className="sugerencia-idioma__cerrar"
        type="button"
        onClick={recordar}
        aria-label={t.cerrar}
        title={t.cerrar}
      >
        <X size={16} aria-hidden />
      </button>
    </aside>
  )
}
