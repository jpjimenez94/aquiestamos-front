'use client'

import { useEffect } from 'react'

/**
 * Pone el idioma de la página en `<html lang>`.
 *
 * Por qué hace falta. El `<html>` lo pinta el layout raíz, que es uno solo
 * para todo: el sitio, el portal y los enlaces con token. Ese layout no sabe
 * en qué idioma está la página —no recibe el tramo `[lang]` de la URL—, así
 * que escribe `lang="es"` siempre. Para que supiera el idioma habría que
 * colgar todo, portal incluido, de varios layouts raíz, y eso es mover medio
 * proyecto para cambiar un atributo.
 *
 * Así que se corrige aquí, en dos tiempos:
 *
 *   · Un `<script>` en línea lo cambia mientras el navegador todavía está
 *     leyendo el HTML, antes de pintar nada. Es lo que cuenta en una visita
 *     directa: un lector de pantalla ya encuentra el idioma correcto.
 *   · Un efecto lo vuelve a poner al navegar sin recargar (de `/en` a `/pt`, o
 *     de vuelta al español), que es cuando el script ya no se ejecuta.
 *
 * Además, toda la página va envuelta en un `<div lang>` (ver `SitioShell`), de
 * modo que incluso sin JavaScript el contenido lleva su idioma bien dicho.
 *
 * Al salir, devuelve el español: si alguien pasa de `/en` al portal sin
 * recargar, el portal no puede quedarse anunciado como inglés.
 */
export function IdiomaDelDocumento({ etiqueta }: { etiqueta: string }) {
  useEffect(() => {
    document.documentElement.lang = etiqueta
    return () => {
      document.documentElement.lang = 'es'
    }
  }, [etiqueta])

  // En español no hay nada que corregir: es lo que ya dice el layout raíz.
  if (etiqueta === 'es') return null

  return (
    <script
      // En el servidor es un script de verdad; en el cliente, texto inerte.
      // Así React no intenta ejecutarlo dos veces ni avisa de que no lo hará.
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.lang=${JSON.stringify(etiqueta)}`,
      }}
    />
  )
}
