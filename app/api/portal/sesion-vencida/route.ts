import { NextResponse } from 'next/server'
import { COOKIE_SESION } from '@/lib/portal'

export const dynamic = 'force-dynamic'

/**
 * GET /api/portal/sesion-vencida — borra la cookie de una sesión que ya no
 * vale y manda a entrar otra vez.
 *
 * Tiene que ser una ruta y no el layout: un componente del servidor no puede
 * borrar cookies, y mientras la cookie siga ahí el middleware devuelve
 * /portal/entrar a /portal, el layout lo devuelve a /portal/entrar, y el
 * navegador acaba en «demasiadas redirecciones» (ver `lib/sesion.ts`).
 *
 * El `?vencida=1` hace que la pantalla de entrada diga por qué se está ahí, y
 * que el middleware no rebote aunque la cookie no se hubiera podido borrar.
 */
export async function GET(request: Request) {
  const destino = new URL('/portal/entrar', request.url)
  destino.searchParams.set('vencida', '1')

  const salida = NextResponse.redirect(destino)
  salida.cookies.set(COOKIE_SESION, '', { httpOnly: true, path: '/', maxAge: 0 })
  return salida
}
