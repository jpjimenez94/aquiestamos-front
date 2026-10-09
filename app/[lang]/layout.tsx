import { SitioShell } from '@/components/sitio/SitioShell'
import { IDIOMAS_CON_PREFIJO } from '@/lib/i18n/idiomas'
import { idiomaDeLaRuta } from '@/lib/i18n/pagina'

/**
 * El sitio público en los idiomas que NO son el español: `/en/…` y `/pt/…`.
 *
 * Cada página de aquí dentro tiene su gemela en `app/(sitio)/…` y las dos
 * pintan la misma vista (`components/sitio/vistas`), cada una con su idioma.
 * Hay una prueba que compara las dos carpetas: una página que se añada en
 * español y se olvide aquí —o al revés— la hace fallar.
 *
 * `generateStaticParams` hace que las páginas que no dependen de nada externo
 * se construyan una vez, al desplegar, como las españolas.
 */
export function generateStaticParams() {
  return IDIOMAS_CON_PREFIJO.map((lang) => ({ lang }))
}

export default async function LayoutDeIdioma({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const idioma = await idiomaDeLaRuta(params)
  return <SitioShell idioma={idioma}>{children}</SitioShell>
}
