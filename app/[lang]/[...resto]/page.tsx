import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { diccionario } from '@/lib/i18n/diccionario'
import { esIdiomaConPrefijo } from '@/lib/i18n/idiomas'
import { idiomaDeLaRuta, type ParametrosDeIdioma } from '@/lib/i18n/pagina'

type Props = { params: ParametrosDeIdioma }

/**
 * Todo lo que empieza por `/en/…` o `/pt/…` y no es una página.
 *
 * Sin esto, `/en/lo-que-sea` no casaría con ninguna ruta y Next enseñaría el
 * 404 de la raíz, que está en español: quien llegó leyendo en inglés se
 * encontraría de pronto con una página que no entiende, justo cuando ya algo
 * había salido mal.
 *
 * Con esto la dirección sí casa —con este archivo—, y lo único que hace es
 * decir «no existe» desde dentro del layout del idioma. Así el 404 que sale es
 * `app/[lang]/not-found.tsx`, con el menú y el texto en ese idioma.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  // El título de la pestaña, también en su idioma. Y que no se indexe: no hay
  // nada aquí que un buscador deba guardar.
  return esIdiomaConPrefijo(lang)
    ? { title: diccionario(lang).noEncontrada.titulo, robots: { index: false } }
    : {}
}

export default async function NoExiste({ params }: Props) {
  await idiomaDeLaRuta(params)
  notFound()
}
