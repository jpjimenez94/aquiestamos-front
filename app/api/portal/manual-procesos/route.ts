import { NextResponse } from 'next/server'
import { usuarioActual } from '@/lib/portal'
import { MANUAL_HTML } from './manualHtml'

/**
 * GET /api/portal/manual-procesos — el manual técnico de procesos.
 *
 * Es un documento del equipo, no del público: se sirve solo con sesión del
 * portal, la misma puerta que protege todo lo demás. Sin sesión, a entrar.
 *
 * Con ?descargar=1 baja como archivo; sin eso se abre en el navegador. El
 * documento es autocontenido, así que el archivo descargado funciona igual
 * fuera del portal.
 */
export async function GET(request: Request) {
  const usuario = await usuarioActual()
  if (!usuario) {
    return NextResponse.redirect(new URL('/portal/entrar', request.url))
  }

  const descargar = new URL(request.url).searchParams.get('descargar') === '1'

  return new Response(MANUAL_HTML, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
      ...(descargar
        ? { 'Content-Disposition': 'attachment; filename="manual-procesos-aqui-estamos.html"' }
        : {}),
    },
  })
}
