import { NextResponse } from 'next/server'
import { usuarioActual } from '@/lib/portal'
import { MANUAL_OPERATIVO_HTML } from './manualOperativo'

/**
 * GET /api/portal/manual-operativo — el manual operativo.
 *
 * Hermano del manual técnico y con la misma puerta: es un documento del
 * equipo, se sirve solo con sesión del portal. Sin sesión, a entrar.
 *
 * Con ?descargar=1 baja como archivo; sin eso se abre en el navegador. Es
 * autocontenido —salvo la fuente— así que el archivo descargado funciona
 * igual fuera del portal, y se imprime con los colores puestos.
 */
export async function GET(request: Request) {
  const usuario = await usuarioActual()
  if (!usuario) {
    return NextResponse.redirect(new URL('/portal/entrar', request.url))
  }

  const descargar = new URL(request.url).searchParams.get('descargar') === '1'

  return new Response(MANUAL_OPERATIVO_HTML, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
      ...(descargar
        ? { 'Content-Disposition': 'attachment; filename="manual-operativo-aqui-estamos.html"' }
        : {}),
    },
  })
}
