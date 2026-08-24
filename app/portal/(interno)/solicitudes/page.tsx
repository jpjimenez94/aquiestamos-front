import { portalFetch, usuarioActual } from '@/lib/portal'
import { Cabecera, Vacio, Paginacion, leerPagina } from '../componentes'
import { TablaSolicitudes, type Solicitud } from './TablaSolicitudes'

export const metadata = { title: 'Solicitudes' }

const POR_PAGINA = 25

export default async function SolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>
}) {
  const [pagina, usuario] = await Promise.all([
    searchParams.then((p) => leerPagina(p.pagina)),
    usuarioActual(),
  ])

  const esAdmin = usuario?.role === 'ADMIN'

  const respuesta = await portalFetch<Solicitud[]>(
    `/support-requests?page=${pagina}&perPage=${POR_PAGINA}`,
  )
  const solicitudes = respuesta.data ?? []
  const total = Number(respuesta.meta?.total ?? solicitudes.length)

  return (
    <>
      <Cabecera
        titulo="Solicitudes de acompañamiento"
        descripcion="Lo que llega por el formulario público, con lo pendiente arriba. Mándale el enlace con «Preguntar»: cuando responda, el sistema calcula su prioridad y la admite sola. Si no responde, la admite igual a los pocos días para que nadie se quede fuera de la cola."
      />

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar las solicitudes.'}</Vacio>
      ) : solicitudes.length === 0 ? (
        <Vacio>
          {pagina > 1
            ? 'Esta página ya no tiene solicitudes.'
            : 'Todavía no ha llegado ninguna solicitud.'}
        </Vacio>
      ) : (
        <TablaSolicitudes
          solicitudes={solicitudes}
          esAdmin={esAdmin}
        />
      )}

      {respuesta.success ? (
        <Paginacion
          pagina={pagina}
          porPagina={POR_PAGINA}
          total={total}
          ruta="/portal/solicitudes"
        />
      ) : null}
    </>
  )
}
