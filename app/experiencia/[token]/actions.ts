'use server'

import { BACKEND_URL } from '@/lib/api'

export async function responderExperienciaAction(
  token: string,
  datos: {
    howFelt: 'MUY_BIEN' | 'BIEN' | 'REGULAR' | 'INCOMODO'
    respectfulTreatment?: 'EXCELENTE' | 'ADECUADO' | 'A_MEJORAR' | null
    gotTools?: 'MUCHA_CLARIDAD' | 'ALGO' | 'POCO_O_NADA' | null
    sessionQuality?: 'SIN_PROBLEMAS' | 'CON_DIFICULTADES' | 'PREFIERO_OTRA_MODALIDAD' | null
    wantsToContinue: 'SI_MISMO' | 'CAMBIAR' | 'SUFICIENTE'
    comment: string
  },
) {
  try {
    const respuesta = await fetch(`${BACKEND_URL}/api/experiencia/${encodeURIComponent(token)}`, {
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
