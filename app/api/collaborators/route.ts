import { NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/api'

export const dynamic = 'force-dynamic'

/**
 * Proxy hacia el backend en Railway.
 * Así el navegador nunca ve la URL del API y no hay que lidiar con CORS.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, message: 'Cuerpo de la petición no válido' },
      { status: 400 },
    )
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const payload = await response.json()
    return NextResponse.json(payload, { status: response.status })
  } catch (error) {
    console.error('[api/collaborators] backend inalcanzable:', error)
    return NextResponse.json(
      {
        success: false,
        message:
          'No pudimos guardar tu registro en este momento. Escríbenos por WhatsApp mientras lo resolvemos.',
      },
      { status: 502 },
    )
  }
}
