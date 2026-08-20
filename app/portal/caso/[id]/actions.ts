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
