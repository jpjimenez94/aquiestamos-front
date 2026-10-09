'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe } from 'lucide-react'
import {
  CLAVE_IDIOMA_ELEGIDO,
  ETIQUETA,
  IDIOMAS,
  NOMBRE,
  SIGLA,
  equivalente,
  type Idioma,
} from '@/lib/i18n/idiomas'

function recordarEleccion() {
  try {
    window.localStorage.setItem(CLAVE_IDIOMA_ELEGIDO, '1')
  } catch {
    // Sin almacenamiento no pasa nada: el enlace funciona igual.
  }
}

/**
 * El selector de idioma: tres enlaces, no un desplegable.
 *
 * Son tres opciones. Un desplegable las escondería detrás de un toque y de un
 * icono que hay que saber interpretar; tres enlaces a la vista se entienden
 * sin leer nada más, y cada uno es una dirección de verdad que se puede abrir
 * en otra pestaña o copiar.
 *
 * Cada idioma va escrito en su propio idioma —«English», no «Inglés»—: quien
 * lo busca es quien no entiende el que tiene delante.
 *
 * Lleva a la MISMA página en el otro idioma, no a la portada: quien está
 * leyendo la política de datos y cambia a inglés quiere la política de datos.
 * Desde una página que solo existe en español —la confirmación de un turno—
 * no hay equivalente, y ahí sí lleva a la portada (`equivalente()` lo decide).
 */
export function SelectorIdioma({ idioma, etiqueta }: { idioma: Idioma; etiqueta: string }) {
  const pathname = usePathname()

  return (
    <nav className="idiomas" aria-label={etiqueta}>
      <Globe className="idiomas__icono" size={14} aria-hidden />
      <ul className="idiomas__lista">
        {IDIOMAS.map((otro) => {
          const activo = otro === idioma
          return (
            <li key={otro}>
              <Link
                className="idiomas__opcion"
                href={equivalente(pathname, otro)}
                // La página en otro idioma es otra página entera: precargar
                // las tres en cada visita sería bajar el sitio tres veces.
                prefetch={false}
                hrefLang={ETIQUETA[otro]}
                lang={ETIQUETA[otro]}
                // El nombre va aquí y no solo en el texto: en el teléfono se
                // enseña la sigla y el nombre se oculta, y un enlace que solo
                // dice «EN» —o que no dice nada— no le sirve a quien no ve.
                aria-label={NOMBRE[otro]}
                aria-current={activo ? 'true' : undefined}
                data-activo={activo || undefined}
                // Elegir idioma a mano es contestar a la sugerencia antes de
                // que se haga: desde aquí ya no se le ofrece nada.
                onClick={recordarEleccion}
              >
                <span className="idiomas__nombre">{NOMBRE[otro]}</span>
                <span className="idiomas__sigla" aria-hidden>
                  {SIGLA[otro]}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
