import { NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/api'

export const dynamic = 'force-dynamic'

type Contexto = { params: Promise<{ token: string }> }

export async function GET(request: Request, { params }: Contexto) {
  const { token } = await params
  try {
    const response = await fetch(`${BACKEND_URL}/api/turno-confirmacion/${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    const payload = await response.json().catch(() => ({
      success: false,
      message: 'Respuesta no válida del servidor',
    }))
    return NextResponse.json(payload, { status: response.status })
  } catch (error) {
    console.error('[api/turno-confirmacion] backend inalcanzable:', error)
    return NextResponse.json(
      { success: false, message: 'No pudimos conectarnos con el servidor' },
      { status: 502 },
    )
  }
}

export async function POST(request: Request, { params }: Contexto) {
  const { token } = await params
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
    const response = await fetch(`${BACKEND_URL}/api/turno-confirmacion/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    const payload = await response.json().catch(() => ({
      success: false,
      message: 'Respuesta no válida del servidor',
    }))
    return NextResponse.json(payload, { status: response.status })
  } catch (error) {
    console.error('[api/turno-confirmacion] backend inalcanzable:', error)
    return NextResponse.json(
      { success: false, message: 'No pudimos conectarnos con el servidor' },
      { status: 502 },
    )
  }
}
