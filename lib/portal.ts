import { cookies } from 'next/headers'
import { BACKEND_URL } from './api'

/**
 * Acceso al backend desde el portal.
 *
 * El token de sesión vive en una cookie httpOnly de PRIMERA parte: el navegador
 * habla con Next, que está en el mismo dominio, y Next reenvía al backend. Así
 * el token nunca es visible para JavaScript y no hay cookies de terceros ni
 * CORS que pelear en producción.
 */

export const COOKIE_SESION = 'ae_sesion'

export type Usuario = {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'AGENDADOR' | 'PROFESIONAL' | 'LECTURA'
  mustChangePassword: boolean
  permisos: string[]
}

export async function tokenDeSesion(): Promise<string | null> {
  const almacen = await cookies()
  return almacen.get(COOKIE_SESION)?.value ?? null
}

type Respuesta<T> = {
  success: boolean
  message?: string
  data?: T
  details?: Record<string, unknown>
  meta?: Record<string, unknown>
}

/** Llama al backend con la sesión de quien esté navegando. Solo en servidor. */
export async function portalFetch<T>(
  ruta: string,
  init: RequestInit = {},
): Promise<Respuesta<T>> {
  const token = await tokenDeSesion()

  try {
    const respuesta = await fetch(`${BACKEND_URL}/api${ruta}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
      cache: 'no-store',
    })

    return (await respuesta.json()) as Respuesta<T>
  } catch (error) {
    console.error('[portal] backend inalcanzable:', ruta, error)
    return { success: false, message: 'No pudimos conectarnos con el servidor' }
  }
}

/** Quién está usando el portal, o null si la sesión ya no vale. */
export async function usuarioActual(): Promise<Usuario | null> {
  const token = await tokenDeSesion()
  if (!token) return null

  const respuesta = await portalFetch<Usuario>('/auth/me')
  return respuesta.success && respuesta.data ? respuesta.data : null
}

export function puede(usuario: Usuario | null, permiso: string): boolean {
  if (!usuario) return false
  return usuario.permisos.includes('*') || usuario.permisos.includes(permiso)
}

// Los formateadores viven en `fechas.ts` para que los componentes de cliente
// también puedan usarlos: este archivo importa `next/headers` y es solo de servidor.
export { enBogota, soloHora, diaLargo } from './fechas'
