'use server'

import { BACKEND_URL } from '@/lib/api'

/**
 * Sube un archivo y envía el paquete final. Server actions por lo de siempre:
 * el token no viaja en URLs del navegador, y el archivo va del formulario al
 * backend sin pasar por ningún chat.
 */

export async function subirArchivoAction(token: string, formData: FormData) {
  const archivo = formData.get('archivo')
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { success: false as const, message: 'Elige un archivo primero.' }
  }
  if (archivo.size > 10 * 1024 * 1024) {
    return { success: false as const, message: 'El archivo pesa más de 10 MB. Prueba con una foto más liviana.' }
  }

  try {
    const respuesta = await fetch(
      `${BACKEND_URL}/api/documentos-profesional/${encodeURIComponent(token)}/archivo`,
      {
        method: 'POST',
        headers: { 'Content-Type': archivo.type || 'application/octet-stream' },
        body: Buffer.from(await archivo.arrayBuffer()),
        cache: 'no-store',
      },
    )
    const datos = await respuesta.json()
    if (!respuesta.ok || !datos.success) {
      return { success: false as const, message: datos.message ?? 'No se pudo subir. Intenta de nuevo.' }
    }
    return { success: true as const, clave: datos.data.clave as string }
  } catch {
    return { success: false as const, message: 'No pudimos conectarnos. Revisa tu señal e intenta de nuevo.' }
  }
}

export async function enviarDocumentosAction(
  token: string,
  datos: { claveTarjeta: string; claveIdentidad: string; numeroTarjeta: string },
) {
  try {
    const respuesta = await fetch(
      `${BACKEND_URL}/api/documentos-profesional/${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
        cache: 'no-store',
      },
    )
    const cuerpo = await respuesta.json()
    if (!respuesta.ok || !cuerpo.success) {
      return { success: false as const, message: cuerpo.message ?? 'No se pudo enviar. Intenta de nuevo.' }
    }
    return { success: true as const, message: cuerpo.message as string }
  } catch {
    return { success: false as const, message: 'No pudimos conectarnos. Intenta en un momento.' }
  }
}
