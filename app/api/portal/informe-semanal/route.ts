import { NextResponse } from 'next/server'
import { portalFetch, usuarioActual } from '@/lib/portal'
import { documentoDelInforme, type InformeSemanal } from '@/lib/informeSemanal'

/**
 * GET /api/portal/informe-semanal — el informe de la semana, para descargar.
 *
 * Mismo patrón que los dos manuales: HTML autocontenido que Word abre con sus
 * tablas y sus títulos. Se descarga, se revisa, y se copia dentro de la
 * plantilla de la fundación o se entrega tal cual.
 *
 * La puerta es la del portal, y las cifras las sirve el backend con su propio
 * permiso: aquí no se consulta nada por cuenta propia.
 */
export async function GET(request: Request) {
  const usuario = await usuarioActual()
  if (!usuario) {
    return NextResponse.redirect(new URL('/portal/entrar', request.url))
  }

  const url = new URL(request.url)
  const desde = url.searchParams.get('desde')
  const consulta = desde ? `?desde=${encodeURIComponent(desde)}` : ''

  const respuesta = await portalFetch<InformeSemanal>(`/dashboard/informe-semanal${consulta}`)
  if (!respuesta.success || !respuesta.data) {
    return new Response(
      `<!doctype html><meta charset="utf-8"><p>No pudimos armar el informe: ${
        respuesta.message ?? 'el servidor no respondió'
      }</p>`,
      { status: 502, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  const documento = documentoDelInforme(respuesta.data)
  const nombre = `informe-semanal-${respuesta.data.periodo.desde.slice(0, 10)}.html`

  return new Response(documento, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
      ...(url.searchParams.get('descargar') === '1'
        ? { 'Content-Disposition': `attachment; filename="${nombre}"` }
        : {}),
    },
  })
}
