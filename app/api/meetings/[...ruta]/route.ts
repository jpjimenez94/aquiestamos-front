import { NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/api'

export const dynamic = 'force-dynamic'

type Contexto = { params: Promise<{ ruta: string[] }> }

/**
 * Proxy público hacia la telemetría de salas.
 *
 * No lleva sesión a propósito: quien entra a una sala —la persona acompañada,
 * el profesional— no tiene cuenta en el portal, solo un enlace. El backend
 * decide qué endpoint de `/api/meetings` es público y cuál no; esto solo
 * transporta.
 */

/**
 * La IP de quien de verdad está pidiendo.
 *
 * El backend limita peticiones por IP, y sin esto veía siempre la misma: la de
 * Vercel. Es decir, el límite se habría repartido entre TODAS las personas del
 * país a la vez, y una sala concurrida habría dejado sin telemetría a las
 * demás. Un límite mal medido es peor que no tenerlo, porque falla justo
 * cuando hay mucha gente conectada.
 *
 * `x-forwarded-for` puede traer una cadena de saltos; el primero es el cliente.
 */
function ipDelCliente(request: Request): string | null {
  const cadena = request.headers.get('x-forwarded-for')
  if (cadena) {
    const primera = cadena.split(',')[0]?.trim()
    if (primera) return primera
  }
  return request.headers.get('x-real-ip')
}

function cabeceras(request: Request): Record<string, string> {
  const ip = ipDelCliente(request)
  return {
    'Content-Type': 'application/json',
    ...(ip ? { 'x-forwarded-for': ip } : {}),
  }
}

export async function GET(request: Request, { params }: Contexto) {
  const { ruta } = await params
  const url = new URL(request.url)
  const destino = `${BACKEND_URL}/api/meetings/${ruta.join('/')}${url.search}`

  try {
    const response = await fetch(destino, {
      method: 'GET',
      headers: cabeceras(request),
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
      headers: cabeceras(request),
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
