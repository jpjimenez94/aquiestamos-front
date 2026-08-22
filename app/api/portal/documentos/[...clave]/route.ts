import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { BACKEND_URL } from '@/lib/api'
import { COOKIE_SESION } from '@/lib/portal'

export const dynamic = 'force-dynamic'

/**
 * Pide al backend una URL firmada para ver un documento.
 *
 * Existe aparte del proxy general porque la clave lleva una barra dentro
 * (`tarjetas/uuid.jpg`) y este catch-all la recompone sin que haya que
 * escaparla en cada sitio que la use.
 *
 * Lo que devuelve es una URL que caduca en un minuto, no el archivo. El
 * backend comprueba permisos y anota en la auditoría quién la pidió.
 */
export async function GET(request: Request, { params }: { params: Promise<{ clave: string[] }> }) {
  const almacen = await cookies()
  const token = almacen.get(COOKIE_SESION)?.value

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Necesitas iniciar sesión' },
      { status: 401 },
    )
  }

  const { clave } = await params

  try {
    const respuesta = await fetch(
      `${BACKEND_URL}/api/documentos/${clave.map(encodeURIComponent).join('/')}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
    )

    const datos = await respuesta.json().catch(() => ({
      success: false,
      message: 'Respuesta no válida del servidor',
    }))

    return NextResponse.json(datos, { status: respuesta.status })
  } catch (error) {
    console.error('[documentos] backend inalcanzable:', error)
    return NextResponse.json(
      { success: false, message: 'No pudimos conectarnos con el servidor' },
      { status: 502 },
    )
  }
}
