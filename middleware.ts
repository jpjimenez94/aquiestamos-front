import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_SESION = 'ae_sesion'

/**
 * Puerta del portal.
 *
 * Solo comprueba que exista la cookie: si vale o no lo decide el backend en
 * cada petición. Esto evita mostrar la pantalla del portal a quien ni siquiera
 * ha entrado, sin duplicar la lógica de permisos.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const tieneCookie = Boolean(request.cookies.get(COOKIE_SESION)?.value)

  // Rutas públicas dentro del portal que no requieren sesión de administrador/agendador
  if (pathname === '/portal/entrar' || pathname.startsWith('/portal/caso/')) {
    // Si ya está logueado pero intenta entrar a /entrar, lo redirigimos al dashboard
    if (pathname === '/portal/entrar' && tieneCookie) {
      return NextResponse.redirect(new URL('/portal', request.url))
    }
    return NextResponse.next()
  }

  if (!tieneCookie) {
    const destino = new URL('/portal/entrar', request.url)
    destino.searchParams.set('volver', pathname)
    return NextResponse.redirect(destino)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/portal/:path*'],
}
