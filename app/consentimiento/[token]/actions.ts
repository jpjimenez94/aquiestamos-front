'use server'

import { BACKEND_URL } from '@/lib/api'

/**
 * Firma el consentimiento. Va por server action y no por fetch desde el
 * navegador por lo mismo que el tamizaje: el token no debe viajar en una URL
 * que el navegador guarda en el historial y manda en el `Referer`.
 */
export async function firmarConsentimientoAction(
  token: string,
  datos: { acepta: true; nombreFirma: string; version: string },
) {
  try {
    const respuesta = await fetch(`${BACKEND_URL}/api/consentimiento/${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
      cache: 'no-store',
    })

    const cuerpo = await respuesta.json()

    if (!respuesta.ok || !cuerpo.success) {
      return { success: false, message: cuerpo.message ?? 'No se pudo firmar. Intenta de nuevo.' }
    }

    return { success: true, message: cuerpo.message as string }
  } catch {
    return {
      success: false,
      message:
        'No pudimos conectarnos. Intenta de nuevo en un momento, o escríbenos por WhatsApp.',
    }
  }
}
