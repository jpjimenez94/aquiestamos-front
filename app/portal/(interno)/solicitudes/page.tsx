import { portalFetch, usuarioActual } from '@/lib/portal'
import { Cabecera, Vacio } from '../componentes'
import { TablaSolicitudes, type Solicitud } from './TablaSolicitudes'

export const metadata = { title: 'Solicitudes' }

export default async function SolicitudesPage() {
  const [usuario, respuesta] = await Promise.all([
    usuarioActual(),
    portalFetch<Solicitud[]>('/support-requests?all=true'),
  ])

  const esAdmin = usuario?.role === 'ADMIN'
  const solicitudes = respuesta.data ?? []

  return (
    <>
      <Cabecera
        titulo="Solicitudes de acompañamiento"
        descripcion="Lo que llega por el formulario público, con lo pendiente arriba. Mándale el enlace con «Preguntar»: cuando responda, el sistema calcula su prioridad y la admite sola. Si no responde, la admite igual a los pocos días para que nadie se quede fuera de la cola."
      />

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar las solicitudes.'}</Vacio>
      ) : solicitudes.length === 0 ? (
        <Vacio>Todavía no ha llegado ninguna solicitud.</Vacio>
      ) : (
        <TablaSolicitudes
          solicitudes={solicitudes}
          esAdmin={esAdmin}
        />
      )}
    </>
  )
}
