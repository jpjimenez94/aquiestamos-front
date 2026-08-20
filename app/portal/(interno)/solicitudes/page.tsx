import { portalFetch, enBogota } from '@/lib/portal'
import { Cabecera, Etiqueta, Vacio, Paginacion, leerPagina } from '../componentes'
import { BotonAdmitir } from './BotonAdmitir'

export const metadata = { title: 'Solicitudes' }

type Solicitud = {
  id: string
  name: string
  phone: string
  city: string
  isMinor: boolean | null
  preferredContact: string | null
  preferredModality: string | null
  availableDays: string[]
  availableSlots: string[]
  status: string
  createdAt: string
}

const DIA_CORTO: Record<string, string> = {
  LUNES: 'Lu', MARTES: 'Ma', MIERCOLES: 'Mi', JUEVES: 'Ju',
  VIERNES: 'Vi', SABADO: 'Sa', DOMINGO: 'Do',
}

const FRANJA_CORTA: Record<string, string> = {
  MANANA: 'mañana', TARDE: 'tarde', NOCHE: 'noche',
}

const POR_PAGINA = 25

export default async function SolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>
}) {
  const pagina = leerPagina((await searchParams).pagina)

  const respuesta = await portalFetch<Solicitud[]>(
    `/support-requests?page=${pagina}&perPage=${POR_PAGINA}`,
  )
  const solicitudes = respuesta.data ?? []
  const total = Number(respuesta.meta?.total ?? solicitudes.length)

  return (
    <>
      <Cabecera
        titulo="Solicitudes de acompañamiento"
        descripcion="Lo que llega por el formulario público. Admitir una crea su ficha para poder asignarle profesional."
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
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Persona</th>
                <th>Ciudad</th>
                <th>Disponibilidad</th>
                <th>Recibida</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="tabla__principal">{s.name}</span>
                    <span className="tabla__secundario">
                      {s.phone}
                      {s.isMinor ? ' · menor de edad' : ''}
                    </span>
                  </td>
                  <td>{s.city ?? '—'}</td>
                  <td>
                    <span className="tabla__secundario" style={{ marginTop: 0 }}>
                      {s.availableDays?.length
                        ? s.availableDays.map((d) => DIA_CORTO[d] ?? d).join(' ')
                        : '—'}
                      {s.availableSlots?.length
                        ? ` · ${s.availableSlots.map((f) => FRANJA_CORTA[f] ?? f).join(', ')}`
                        : ''}
                    </span>
                  </td>
                  <td className="tabla__numero">{enBogota(s.createdAt, false)}</td>
                  <td>
                    <Etiqueta estado={s.status} />
                  </td>
                  <td className="tabla__acciones">
                    <BotonAdmitir solicitudId={s.id} yaAdmitida={s.status !== 'NUEVO'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
