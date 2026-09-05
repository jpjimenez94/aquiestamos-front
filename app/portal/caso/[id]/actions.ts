'use server'

import { cookies } from 'next/headers'
import { BACKEND_URL } from '@/lib/api'

export async function authorizeCaseAction(patientId: string, email: string) {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Correo no válido' }
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/shared-cases/${patientId}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      cache: 'no-store'
    })

    const payload = await response.json()

    if (!response.ok || !payload.success) {
      return { success: false, message: payload.message || 'No se pudo autorizar el acceso.' }
    }

    const { token } = payload.data

    // Guardar el token en una cookie por 12 horas.
    const cookieStore = await cookies()
    cookieStore.set(`case_token_${patientId}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 12 // 12 horas
    })

    return { success: true }
  } catch (error) {
    return { success: false, message: 'Error de conexión con el servidor.' }
  }
}

/**
 * Manda el reporte del profesional. Va por server action y no por fetch desde
 * el navegador porque el token del caso vive en una cookie httpOnly: el
 * cliente no puede leerlo, y así sigue sin poder.
 */
export async function reportarCasoAction(
  patientId: string,
  datos: {
    outcome: string
    modality: string
    meetsAt: string
    followUp: string
    contactDifficulties: string
    notes: string
  },
) {
  const cookieStore = await cookies()
  const token = cookieStore.get(`case_token_${patientId}`)?.value

  if (!token) {
    return { success: false, message: 'El acceso venció. Vuelve a ingresar tu correo.' }
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/shared-cases/${patientId}/reporte`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-shared-case-token': token,
      },
      body: JSON.stringify(datos),
      cache: 'no-store',
    })

    const payload = await response.json()

    if (!response.ok || !payload.success) {
      return {
        success: false,
        message: payload.message ?? 'No pudimos registrar tu respuesta.',
        details: payload.details as Record<string, string> | undefined,
      }
    }

    return { success: true, message: payload.message as string }
  } catch {
    return { success: false, message: 'Error de conexión con el servidor.' }
  }
}

/**
 * El profesional dice si puede tomar el caso, y si puede, cuándo.
 *
 * Va por server action por lo mismo que el reporte: el token del caso vive en
 * una cookie httpOnly y el navegador no puede leerlo. Aquí se queda en el
 * servidor.
 */
export async function decidirPropuestaAction(
  patientId: string,
  datos: {
    acepta: boolean
    /** Un matiz que la agenda no dice. Su disponibilidad ya vive en su perfil. */
    nota: string
    motivo: string
  },
) {
  const cookieStore = await cookies()
  const token = cookieStore.get(`case_token_${patientId}`)?.value

  if (!token) {
    return { success: false, message: 'El acceso venció. Vuelve a ingresar tu correo.' }
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/shared-cases/${patientId}/propuesta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-shared-case-token': token },
      body: JSON.stringify(datos),
      cache: 'no-store',
    })

    const payload = await response.json()

    if (!response.ok || !payload.success) {
      return {
        success: false,
        message: payload.message ?? 'No pudimos registrar tu respuesta.',
        details: payload.details as Record<string, string> | undefined,
      }
    }

    return { success: true, message: payload.message as string }
  } catch {
    return { success: false, message: 'Error de conexión con el servidor.' }
  }
}

/**
 * El profesional corrige su propia agenda desde su enlace.
 *
 * Va por server action por lo mismo que el reporte y la decisión: el token del
 * caso vive en una cookie httpOnly y el navegador no puede leerlo. Aquí se
 * queda en el servidor.
 *
 * De quién es la agenda que se toca lo decide el backend a partir del token, no
 * de nada que venga de esta pantalla: el enlace no es una credencial para
 * moverse por el sistema, es una llave para una puerta concreta.
 */
export async function actualizarDisponibilidadAction(
  patientId: string,
  franjas: { weekday: string; startMinute: number; endMinute: number; modality?: string }[],
) {
  const cookieStore = await cookies()
  const token = cookieStore.get(`case_token_${patientId}`)?.value

  if (!token) {
    return { success: false, message: 'El acceso venció. Vuelve a ingresar tu correo.' }
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/shared-cases/${patientId}/disponibilidad`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-shared-case-token': token },
      body: JSON.stringify({ franjas }),
      cache: 'no-store',
    })

    const payload = await response.json()

    if (!response.ok || !payload.success) {
      return {
        success: false,
        message: payload.message ?? 'No pudimos guardar tus horarios.',
        details: payload.details as Record<string, string> | undefined,
      }
    }

    return { success: true, message: payload.message as string }
  } catch {
    return { success: false, message: 'Error de conexión con el servidor.' }
  }
}

/**
 * «¿Cómo estás tú?»: el profesional pide el espacio desde su enlace.
 * El token del caso decide de quién es el check-in; nunca viaja un id de
 * profesional desde el navegador.
 */
export async function enviarCheckInAction(
  patientId: string,
  datos: {
    need: 'APOYO_PARA_MI' | 'AYUDA_CON_UN_CASO' | 'DESCARGARME'
    notes: string | null
    questionForGroup: string | null
  },
) {
  const cookieStore = await cookies()
  const token = cookieStore.get(`case_token_${patientId}`)?.value
  if (!token) {
    return { success: false as const, message: 'El acceso venció. Vuelve a ingresar tu correo.' }
  }
  try {
    const response = await fetch(`${BACKEND_URL}/api/shared-cases/${patientId}/cuidado/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-shared-case-token': token },
      body: JSON.stringify(datos),
      cache: 'no-store',
    })
    const payload = await response.json()
    if (!response.ok || !payload.success) {
      return { success: false as const, message: (payload.message as string) ?? 'No pudimos guardar tu respuesta.' }
    }
    return { success: true as const, message: payload.message as string }
  } catch {
    return { success: false as const, message: 'Error de conexión con el servidor.' }
  }
}

// Aquí no hay acción para ofrecerse como supervisor, a propósito: quién puede
// facilitar se sabe por el formulario de voluntarios, se cuadra por WhatsApp
// y lo marca coordinación desde la ficha. Al profesional no se le pregunta.
