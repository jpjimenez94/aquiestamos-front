import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { leerSesion, RUTA_SESION_VENCIDA } from '../lib/sesion'
import { middleware } from '../middleware'
import { GET } from '../app/api/portal/sesion-vencida/route'
import type { Usuario } from '../lib/portal'

/**
 * El bucle de redirección con la sesión vencida.
 *
 * Con la cookie en el navegador y la sesión ya sin valor en el backend, el
 * layout mandaba a /portal/entrar y el middleware, al ver la cookie, lo
 * devolvía a /portal: «demasiadas redirecciones», y nadie podía volver a
 * entrar sin borrar las cookies a mano. Le pasaba a quien tenía la sesión
 * revocada o la cuenta desactivada, y a todo el equipo si el backend se caía.
 *
 * Estas pruebas fijan las tres piezas del arreglo: qué cuenta como sesión
 * vencida (y qué no), que la ruta nueva borra la cookie, y que el middleware
 * no rebota a quien viene de ahí.
 */

const USUARIO: Usuario = {
  id: 'u1',
  email: 'ana@pruebas.local',
  name: 'Ana',
  role: 'AGENDADOR',
  mustChangePassword: false,
  permisos: ['agenda:leer'],
}

describe('qué significa la respuesta de /auth/me', () => {
  it('con usuario, la sesión vale', () => {
    expect(leerSesion({ success: true, data: USUARIO, status: 200 })).toEqual({ estado: 'valida', usuario: USUARIO })
  })

  it('un 401 es una sesión vencida: caducó, la revocaron o la cuenta ya no tiene acceso', () => {
    for (const message of ['Tu sesión expiró. Vuelve a iniciar sesión', 'Esta cuenta ya no tiene acceso']) {
      expect(leerSesion({ success: false, status: 401, message })).toEqual({ estado: 'vencida' })
    }
  })

  it('que el servidor no conteste NO cierra la sesión de nadie', () => {
    // Un reinicio del backend no puede sacar a todo el equipo del portal.
    expect(leerSesion({ success: false, status: 0, message: 'No pudimos conectarnos con el servidor' })).toEqual({
      estado: 'sin-servidor',
      mensaje: 'No pudimos conectarnos con el servidor',
    })
    expect(leerSesion({ success: false, status: 502 }).estado).toBe('sin-servidor')
    expect(leerSesion({ success: false, status: 500, message: 'Error interno' }).estado).toBe('sin-servidor')
  })
})

describe('la ruta de la sesión vencida', () => {
  it('borra la cookie y manda a entrar, diciendo por qué', async () => {
    const respuesta = await GET(new Request(`http://localhost:3000${RUTA_SESION_VENCIDA}`))

    expect([302, 303, 307, 308]).toContain(respuesta.status)
    const destino = new URL(respuesta.headers.get('location') ?? '')
    expect(destino.pathname).toBe('/portal/entrar')
    expect(destino.searchParams.get('vencida')).toBe('1')

    const cookie = respuesta.headers.get('set-cookie') ?? ''
    expect(cookie).toMatch(/ae_sesion=;/)
    expect(cookie).toMatch(/Max-Age=0/i)
  })
})

describe('el middleware del portal', () => {
  const pedir = (ruta: string, conCookie: boolean) =>
    middleware(
      new NextRequest(`http://localhost:3000${ruta}`, {
        headers: conCookie ? { cookie: 'ae_sesion=token-viejo' } : {},
      }),
    )

  it('a quien ya entró y abre /portal/entrar lo sigue llevando al portal', () => {
    const r = pedir('/portal/entrar', true)
    expect(new URL(r.headers.get('location') ?? '').pathname).toBe('/portal')
  })

  it('pero no rebota a quien viene de una sesión vencida, aunque la cookie siga', () => {
    const r = pedir('/portal/entrar?vencida=1', true)
    expect(r.headers.get('location')).toBeNull()
  })

  it('sin cookie, al portal no se entra', () => {
    const r = pedir('/portal/agenda', false)
    const destino = new URL(r.headers.get('location') ?? '')
    expect(destino.pathname).toBe('/portal/entrar')
    expect(destino.searchParams.get('volver')).toBe('/portal/agenda')
  })
})
