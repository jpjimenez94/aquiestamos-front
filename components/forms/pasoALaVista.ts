'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Llevar la vista a lo que se acaba de pintar: el paso nuevo, la confirmación
 * o el campo que hay que corregir.
 *
 * Los tres formularios van por pasos, y al cambiar de paso —o al enviar— lo
 * que hay en pantalla se sustituye entero. Lo resolvían con
 * `window.scrollTo({ top: 180, behavior: 'smooth' })` justo después de cambiar
 * el estado, y eso fallaba de dos maneras:
 *
 *   · «180» es donde empezaba el formulario cuando se escribió. Hoy tiene
 *     encima la portada, el aviso y el botón de WhatsApp: empieza unos mil
 *     píxeles más abajo, y 180 enseña la cabecera de la página.
 *
 *   · El desplazamiento suave arranca ANTES de que React cambie el contenido.
 *     Cuando el contenido cambia de alto, el navegador lo cancela (medido en
 *     Chrome). La persona se quedaba donde estaba el botón: a media altura
 *     del paso nuevo, con las primeras preguntas por encima; y, al enviar, al
 *     pie de la página, con el «¡Recibimos tu solicitud!» fuera de la vista.
 *     Es el momento en que más importa que vea que sí llegó.
 *
 * Aquí el desplazamiento se hace en un efecto, que corre DESPUÉS de pintar, y
 * sin animación: se mide sobre lo que ya está en pantalla y se va allí.
 */
export function usePasoALaVista() {
  const elemento = useRef<HTMLElement | null>(null)
  const [destino, setDestino] = useState<{ a: 'inicio' | 'error'; vez: number } | null>(null)

  useEffect(() => {
    const contenedor = elemento.current
    if (!destino || !contenedor) return

    // Al campo marcado, si lo hay; si no, al principio de lo que se pintó.
    const marcado = destino.a === 'error' ? contenedor.querySelector('.field__error') : null
    if (marcado) marcado.scrollIntoView({ block: 'center', behavior: 'instant' })
    else contenedor.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [destino])

  /**
   * Va en el `ref` de la raíz de lo que el formulario pinta —el formulario o,
   * tras enviar, la confirmación—. Es una función y no un objeto para poder
   * ponerla igual en un `<form>` que en un `<div>`.
   */
  const ancla = useCallback((nodo: HTMLElement | null) => {
    elemento.current = nodo
  }, [])

  // El contador hace que pedir dos veces lo mismo vuelva a desplazar.
  const alInicio = useCallback(
    () => setDestino((d) => ({ a: 'inicio', vez: (d?.vez ?? 0) + 1 })),
    [],
  )
  const alError = useCallback(
    () => setDestino((d) => ({ a: 'error', vez: (d?.vez ?? 0) + 1 })),
    [],
  )

  return { ancla, alInicio, alError }
}

/**
 * Cuánto dejar por encima al ir «al inicio»: la barra de navegación es
 * pegajosa y taparía el arranque del formulario. Va en el estilo del elemento
 * que lleva el `ancla`.
 */
export const HUECO_PARA_LA_BARRA = 112
