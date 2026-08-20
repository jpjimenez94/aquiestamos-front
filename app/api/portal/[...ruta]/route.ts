import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { BACKEND_URL } from '@/lib/api'
import { COOKIE_SESION } from '@/lib/portal'

export const dynamic = 'force-dynamic'

/**
 * Proxy autenticado hacia el backend.
 *
 * Todo lo que el portal hace desde el navegador pasa por aquí: Next añade el
 * token de la cookie y reenvía. El backend sigue siendo la única autoridad
 * sobre permisos; esto solo transporta.
 */
async function reenviar(request: Request, ruta: string[], metodo: string) {
  const almacen = await cookies()
  const token = almacen.get(COOKIE_SESION)?.value

  if (!token) {
    return NextResponse.json({ success: false, message: 'Necesitas iniciar sesión' }, { status: 401 })
  }

  const url = new URL(request.url)
  const destino = `${BACKEND_URL}/api/${ruta.join('/')}${url.search}`

  let cuerpo: string | undefined
  if (metodo !== 'GET' && metodo !== 'DELETE') {
    cuerpo = await request.text()
  }

  try {
    const respuesta = await fetch(destino, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      ...(cuerpo ? { body: cuerpo } : {}),
      cache: 'no-store',
    })

    const datos = await respuesta.json().catch(() => ({
      success: false,
      message: 'Respuesta no válida del servidor',
    }))

    return NextResponse.json(datos, { status: respuesta.status })
  } catch (error) {
    console.error('[portal] backend inalcanzable:', destino, error)
    return NextResponse.json(
      { success: false, message: 'No pudimos conectarnos con el servidor' },
      { status: 502 },
    )
  }
}

type Contexto = { params: Promise<{ ruta: string[] }> }

export async function GET(request: Request, { params }: Contexto) {
  const { ruta } = await params
  return reenviar(request, ruta, 'GET')
}

export async function POST(request: Request, { params }: Contexto) {
  const { ruta } = await params
  return reenviar(request, ruta, 'POST')
}

export async function PATCH(request: Request, { params }: Contexto) {
  const { ruta } = await params
  return reenviar(request, ruta, 'PATCH')
}

export async function PUT(request: Request, { params }: Contexto) {
  const { ruta } = await params
  return reenviar(request, ruta, 'PUT')
}

export async function DELETE(request: Request, { params }: Contexto) {
  const { ruta } = await params
  return reenviar(request, ruta, 'DELETE')
}
