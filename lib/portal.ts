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
  /** El campo de antes de que una cuenta pudiera tener varios roles. */
  role: Rol
  /** Los roles de verdad. El backend siempre los manda. */
  roles?: Rol[]
  mustChangePassword: boolean
  permisos: string[]
}

export type Rol =
  | 'ADMIN'
  | 'AGENDADOR'
  | 'ADMISION'
  | 'COORDINADOR_CASOS'
  | 'LIDERES_COMUNITARIOS'
  | 'PROFESIONAL'
  | 'LECTURA'

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

/**
 * ¿Es administradora esta cuenta?
 *
 * Se mira `permisos`, no `role`. El portal comparaba `role === 'ADMIN'` en
 * ocho sitios, y ese es el campo viejo: una administradora con varios roles
 * podía acabar viendo el menú de otra cosa.
 *
 * Aquí eso solo descuadra botones —el backend es la única autoridad sobre
 * permisos y rechaza igual—, pero un portal que enseña lo que no debería o
 * esconde lo que sí genera reportes de error que nadie sabe explicar.
 */
export function esAdministrador(usuario: Usuario | null): boolean {
  return Boolean(usuario?.permisos.includes('*'))
}

/**
 * Los textos de los mensajes, desde Parametrización.
 *
 * Vive aquí y no junto a `renderPlantilla` porque esto necesita la sesión, y
 * ese módulo tiene que quedarse puro: lo importan componentes de cliente, y
 * arrastrarles `next/headers` rompe el build entero.
 *
 * Devuelve `{}` si algo falla. Los constructores de mensaje caen entonces a su
 * texto de respaldo: un mensaje viejo es mejor que ninguno cuando hay alguien
 * esperando respuesta.
 */
export async function traerPlantillas(): Promise<Record<string, string>> {
  const respuesta = await portalFetch<Record<string, string>>('/settings/plantillas')
  return respuesta.success && respuesta.data ? respuesta.data : {}
}

/** ¿Tiene esta cuenta este rol? Para el menú y los atajos, no para permisos. */
export function tieneRol(usuario: Usuario | null, rol: Rol): boolean {
  if (!usuario) return false
  const lista = usuario.roles?.length ? usuario.roles : usuario.role ? [usuario.role] : []
  return lista.includes(rol)
}

// Los formateadores viven en `fechas.ts` para que los componentes de cliente
// también puedan usarlos: este archivo importa `next/headers` y es solo de servidor.
export { enBogota, soloHora, diaLargo } from './fechas'
