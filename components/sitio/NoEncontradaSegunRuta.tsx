'use client'

import { usePathname } from 'next/navigation'
import { NoEncontrada } from '@/components/sitio/NoEncontrada'
import { idiomaDeRuta, type Idioma } from '@/lib/i18n/idiomas'
import type { Diccionario } from '@/lib/i18n/diccionarios/es'

/**
 * El 404 de `/en/…` y `/pt/…`, que averigua su idioma mirando la dirección.
 *
 * Un `not-found.tsx` no recibe los parámetros de la ruta: Next no le dice si
 * lo que no se encontró estaba bajo `/en` o bajo `/pt`. La dirección sí lo
 * dice, y la dirección solo se puede leer desde el cliente. Por eso llegan
 * aquí los textos de los idiomas —son cuatro frases cada uno— y se elige al
 * pintar.
 */
export function NoEncontradaSegunRuta({
  textos,
}: {
  textos: Record<Idioma, Diccionario['noEncontrada']>
}) {
  const idioma = idiomaDeRuta(usePathname())
  return <NoEncontrada idioma={idioma} t={textos[idioma]} />
}
