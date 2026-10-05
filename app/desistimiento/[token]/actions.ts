'use server'

import { headers } from 'next/headers'
import { BACKEND_URL } from '@/lib/api'

/**
 * Acepta la constancia de desistimiento.
 *
 * Por server action y no por fetch desde el navegador, por lo mismo que el
 * tamizaje y el consentimiento: el token no debe viajar en una URL que el
 * navegador guarda en el historial y manda en el `Referer`.
 *
 * Y por eso mismo hay que reenviar a mano de quién viene. Al pasar por aquí,
 * el backend ve la petición de ESTE servidor: la primera prueba quedó
 * archivada diciendo que la firmó un navegador llamado «node» y sin IP. Para
 * una constancia eso no es un dato de menos, es un dato falso — lo que el
 * documento afirma es justamente que lo hizo ella, desde su aparato.
 */
export async function aceptarDesistimientoAction(
  token: string,
  datos: { nombre: string; motivo?: string },
) {
  try {
    const suyas = await headers()
    const deElla: Record<string, string> = {}
    const ip = suyas.get('x-forwarded-for')
    const navegador = suyas.get('user-agent')
    if (ip) deElla['x-forwarded-for'] = ip
    if (navegador) deElla['user-agent'] = navegador

    const respuesta = await fetch(
      `${BACKEND_URL}/api/desistimiento/${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...deElla },
        body: JSON.stringify(datos),
        cache: 'no-store',
      },
    )

    const cuerpo = await respuesta.json()

    if (!respuesta.ok || !cuerpo.success) {
      return {
        success: false,
        message: cuerpo.message ?? 'No pudimos registrarlo. Intenta de nuevo.',
      }
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
