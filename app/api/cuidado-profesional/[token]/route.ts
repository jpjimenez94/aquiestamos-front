import { NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/api'

export const dynamic = 'force-dynamic'

type Contexto = { params: Promise<{ token: string }> }

/**
 * Proxy público hacia «¿Cómo estás tú?», el espacio de quien acompaña.
 *
 * Sin sesión a propósito: quien abre este enlace no tiene cuenta en el portal
 * —los profesionales no la tienen, por decisión de la red—, solo su enlace de
 * WhatsApp. El backend valida la firma del token y decide qué mostrar; esto
 * solo transporta.
 *
 * Reenvía la IP del cliente porque el backend limita peticiones por IP y sin
 * esto vería siempre la de Vercel — el límite se repartiría entre todos a la
 * vez.
 */
function cabeceras(request: Request): Record<string, string> {
  const cadena = request.headers.get('x-forwarded-for')
  const ip = cadena?.split(',')[0]?.trim() || request.headers.get('x-real-ip')
  return {
    'Content-Type': 'application/json',
    ...(ip ? { 'x-forwarded-for': ip } : {}),
  }
}

async function reenviar(request: Request, token: string, metodo: 'GET' | 'POST') {
  const destino = `${BACKEND_URL}/api/cuidado-profesional/${encodeURIComponent(token)}`

  let cuerpo: string | undefined
  if (metodo === 'POST') cuerpo = await request.text()

  try {
    const respuesta = await fetch(destino, {
      method: metodo,
      headers: cabeceras(request),
      ...(cuerpo ? { body: cuerpo } : {}),
      cache: 'no-store',
    })
    const datos = await respuesta.json().catch(() => ({
      success: false,
      message: 'Respuesta no válida del servidor',
    }))
    return NextResponse.json(datos, { status: respuesta.status })
  } catch (error) {
    console.error('[cuidado-profesional] backend inalcanzable:', error)
    return NextResponse.json(
      { success: false, message: 'No pudimos conectarnos con el servidor' },
      { status: 502 },
    )
  }
}

export async function GET(request: Request, { params }: Contexto) {
  const { token } = await params
  return reenviar(request, token, 'GET')
}

export async function POST(request: Request, { params }: Contexto) {
  const { token } = await params
  return reenviar(request, token, 'POST')
}
