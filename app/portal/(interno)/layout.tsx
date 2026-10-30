import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { sesionActual, portalFetch, traerPlantillas } from '@/lib/portal'
import { RUTA_SESION_VENCIDA } from '@/lib/sesion'
import { PlantillasProvider } from '@/components/portal/Plantillas'
import { LateralPortal, type ContadoresBadges } from './LateralPortal'
import '../portal.css'

export const metadata: Metadata = {
  title: { default: 'Portal', template: '%s · Portal Aquí Estamos' },
  robots: { index: false, follow: false },
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const sesion = await sesionActual()

  /**
   * La cookie existía pero la sesión ya no vale (caducó, la revocaron o la
   * cuenta ya no tiene acceso). Antes se mandaba directo a /portal/entrar, y
   * como la cookie seguía ahí el middleware lo devolvía a /portal: un bucle
   * de redirecciones del que no se salía. Ahora pasa por una ruta que borra
   * la cookie primero.
   */
  if (sesion.estado === 'vencida') redirect(RUTA_SESION_VENCIDA)

  // El servidor no contestó: se dice y se ofrece reintentar, sin cerrar la sesión.
  if (sesion.estado === 'sin-servidor') return <SinServidor mensaje={sesion.mensaje} />

  const usuario = sesion.usuario

  // Los textos editables van al contexto: los usan once componentes sueltos.
  const [respuestaBadges, plantillas] = await Promise.all([
    portalFetch<ContadoresBadges>('/dashboard/badges'),
    traerPlantillas(),
  ])
  const contadores = respuestaBadges.data ?? {
    solicitudes: 0,
    postulaciones: 0,
    colaboradores: 0,
    verificaciones: 0,
    agenda: 0,
    miAgenda: 0,
    tareas: 0,
    personas: 0,
  }

  // data-rol existe para el modo solo lectura: el CSS apaga los controles de
  // acción cuando vale LECTURA. Es cortesía visual; la seguridad real está en
  // el backend, que rechaza cada escritura de ese rol con 403.
  return (
    <div className="portal" data-rol={usuario.role}>
      <LateralPortal usuario={usuario} contadores={contadores} />
      <main className="portal__principal">
        <PlantillasProvider valor={plantillas}>{children}</PlantillasProvider>
      </main>
    </div>
  )
}

/**
 * Cuando el portal no logra hablar con el backend.
 *
 * No es «tu sesión terminó»: la sesión puede estar perfecta y el servidor
 * reiniciándose. Por eso no se borra nada; se dice qué pasó y se ofrece volver
 * a intentar. Usa la misma caja que la pantalla de entrada.
 */
function SinServidor({ mensaje }: { mensaje: string }) {
  return (
    <div className="entrar">
      <div className="entrar__caja" role="alert">
        <h1>No pudimos conectar con el servidor</h1>
        <p>
          {mensaje}. Tu sesión sigue abierta: vuelve a intentarlo en un momento. Si no se arregla,
          avisa al equipo técnico.
        </p>
        <a className="boton-mini" data-tono="principal" href="/portal">
          Volver a intentar
        </a>
      </div>
    </div>
  )
}
