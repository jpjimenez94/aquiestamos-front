import type { Usuario } from './portal'

/**
 * Qué significa la respuesta de /auth/me para quien navega el portal.
 *
 * Antes era «hay usuario o no hay», y el «no hay» mezclaba dos cosas muy
 * distintas que acababan igual: en un bucle de redirecciones. El layout del
 * portal mandaba a /portal/entrar; el middleware, al ver la cookie, devolvía a
 * /portal; y vuelta a empezar, hasta que el navegador se rendía con
 * «demasiadas redirecciones». Le pasaba a quien tenía la sesión revocada o la
 * cuenta desactivada —no podía ni volver a entrar— y le pasaba a todo el mundo
 * si el backend se caía un momento.
 *
 * · `vencida`: el backend contestó 401. La sesión ya no vale (caducó, la
 *   revocaron o la cuenta ya no tiene acceso): hay que borrar la cookie y
 *   mandar a entrar otra vez.
 * · `sin-servidor`: cualquier otro fallo, o que no contestara. NO se cierra la
 *   sesión: un tropiezo del backend no puede sacar a todo el equipo del portal.
 *   Se dice que no hubo conexión y se ofrece reintentar.
 *
 * Vive aparte de `lib/portal.ts`, que arrastra `next/headers`, para poder
 * probarla sin servidor.
 */
export type Sesion =
  | { estado: 'valida'; usuario: Usuario }
  | { estado: 'vencida' }
  | { estado: 'sin-servidor'; mensaje: string }

export function leerSesion(respuesta: {
  success: boolean
  data?: Usuario
  status?: number
  message?: string
}): Sesion {
  if (respuesta.success && respuesta.data) return { estado: 'valida', usuario: respuesta.data }
  if (respuesta.status === 401) return { estado: 'vencida' }
  return { estado: 'sin-servidor', mensaje: respuesta.message ?? 'No pudimos conectarnos con el servidor' }
}

/** A dónde se manda a quien tiene la sesión vencida: una ruta que puede borrar la cookie. */
export const RUTA_SESION_VENCIDA = '/api/portal/sesion-vencida'
