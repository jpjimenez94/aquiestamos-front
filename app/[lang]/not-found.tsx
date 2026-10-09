import { NoEncontradaSegunRuta } from '@/components/sitio/NoEncontradaSegunRuta'
import { diccionario } from '@/lib/i18n/diccionario'

/**
 * El 404 de las páginas en inglés y portugués.
 *
 * Se pinta dentro de `app/[lang]/layout.tsx`, así que la barra y el pie ya
 * salen en el idioma de la dirección. Lo que falta por saber es en cuál
 * escribir el mensaje, y eso lo resuelve `NoEncontradaSegunRuta`.
 */
export default function NotFound() {
  return (
    <NoEncontradaSegunRuta
      textos={{
        es: diccionario('es').noEncontrada,
        en: diccionario('en').noEncontrada,
        pt: diccionario('pt').noEncontrada,
      }}
    />
  )
}
