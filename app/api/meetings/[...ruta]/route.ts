import { NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/api'

export const dynamic = 'force-dynamic'

type Contexto = { params: Promise<{ ruta: string[] }> }

export async function GET(request: Request, { params }: Contexto) {
  const { ruta } = await params
  const url = new URL(request.url)
  const destino = `${BACKEND_URL}/api/meetings/${ruta.join('/')}${url.search}`

  try {
    const response = await fetch(destino, {
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
    console.error('[api/meetings] backend inalcanzable:', error)
    return NextResponse.json(
      { success: false, message: 'No pudimos conectarnos con el servidor' },
      { status: 502 },
    )
  }
}

export async function POST(request: Request, { params }: Contexto) {
  const { ruta } = await params
  const url = new URL(request.url)
  const destino = `${BACKEND_URL}/api/meetings/${ruta.join('/')}${url.search}`

  let body: unknown
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  try {
    const response = await fetch(destino, {
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
    console.error('[api/meetings] backend inalcanzable:', error)
    return NextResponse.json(
      { success: false, message: 'No pudimos conectarnos con el servidor' },
      { status: 502 },
    )
  }
}
