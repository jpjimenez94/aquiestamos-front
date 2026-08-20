import { NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/api'
import { COOKIE_SESION } from '@/lib/portal'

export const dynamic = 'force-dynamic'

/**
 * Inicia sesión y guarda el token en una cookie httpOnly.
 * El token nunca llega a JavaScript del navegador.
 */
export async function POST(request: Request) {
  let cuerpo: unknown
  try {
    cuerpo = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Petición no válida' }, { status: 400 })
  }

  try {
    const respuesta = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
      cache: 'no-store',
    })

    const datos = await respuesta.json()

    if (!respuesta.ok || !datos.success) {
      return NextResponse.json(datos, { status: respuesta.status })
    }

    const salida = NextResponse.json({
      success: true,
      data: { usuario: datos.data.usuario },
    })

    salida.cookies.set(COOKIE_SESION, datos.data.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: new Date(datos.data.expiresAt),
    })

    return salida
  } catch (error) {
    console.error('[portal/login] backend inalcanzable:', error)
    return NextResponse.json(
      { success: false, message: 'No pudimos conectarnos con el servidor' },
      { status: 502 },
    )
  }
}
