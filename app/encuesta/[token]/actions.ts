'use server'

import { BACKEND_URL } from '@/lib/api'

/**
 * Guarda la encuesta. Server action por lo mismo de siempre: el token no debe
 * viajar en URLs que el navegador guarda y reenvía.
 */
export async function responderEncuestaAction(
  token: string,
  datos: { helped: 'SI' | 'ALGO' | 'NO'; wouldRecommend: boolean; comment: string },
) {
  try {
    const respuesta = await fetch(`${BACKEND_URL}/api/encuesta/${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
      cache: 'no-store',
    })
    const cuerpo = await respuesta.json()
    if (!respuesta.ok || !cuerpo.success) {
      return { success: false, message: cuerpo.message ?? 'No se pudo enviar. Intenta de nuevo.' }
    }
    return { success: true, message: cuerpo.message as string }
  } catch {
    return {
      success: false,
      message: 'No pudimos conectarnos. Intenta en un momento, o escríbenos por WhatsApp.',
    }
  }
}
