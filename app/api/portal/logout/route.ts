import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { BACKEND_URL } from '@/lib/api'
import { COOKIE_SESION } from '@/lib/portal'

export const dynamic = 'force-dynamic'

export async function POST() {
  const almacen = await cookies()
  const token = almacen.get(COOKIE_SESION)?.value

  // Se revoca en el backend para que el token no sirva aunque alguien lo tenga.
  if (token) {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
    } catch {
      // Si el backend no responde, igual se borra la cookie local.
    }
  }

  const salida = NextResponse.json({ success: true })
  salida.cookies.set(COOKIE_SESION, '', { httpOnly: true, path: '/', maxAge: 0 })
  return salida
}
