'use server'

import { BACKEND_URL } from '@/lib/api'

/**
 * Manda las respuestas del tamizaje.
 *
 * Va por server action y no por fetch desde el navegador para que el token del
 * enlace no tenga que viajar en una URL que el navegador guarda en el
 * historial y manda en el `Referer`. Aquí el token se queda en el servidor.
 */
export async function responderTamizajeAction(
  token: string,
  respuestas: Record<string, unknown>,
) {
  try {
    const respuesta = await fetch(`${BACKEND_URL}/api/triage/${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(respuestas),
      cache: 'no-store',
    })

    const datos = await respuesta.json()

    if (!respuesta.ok || !datos.success) {
      return {
        success: false,
        message: datos.message ?? 'No pudimos guardar tus respuestas.',
        details: datos.details as Record<string, string> | undefined,
      }
    }

    return { success: true, message: datos.message as string }
  } catch {
    return {
      success: false,
      message:
        'No pudimos conectarnos. Intenta de nuevo en un momento, o escríbenos por WhatsApp.',
    }
  }
}
