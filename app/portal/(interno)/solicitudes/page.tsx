import { portalFetch, enBogota, usuarioActual } from '@/lib/portal'
import { Cabecera, Etiqueta, Vacio, Paginacion, leerPagina } from '../componentes'
import { BotonEliminarSolicitud } from './BotonEliminarSolicitud'
import { BotonTamizaje } from './BotonTamizaje'
import { ResultadoTamizaje } from './ResultadoTamizaje'

export const metadata = { title: 'Solicitudes' }

type Tamizaje = {
  enlace: string
  respuesta: {
    id: string
    prioridadSugerida: 'ALTA' | 'MEDIA' | 'BAJA'
    prioridadLegible: string
    razones: string[]
    respondidoEn: string
  } | null
  diasParaAdmisionAutomatica: number
}

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
  tamizaje: Tamizaje | null
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
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Persona</th>
                <th>Ciudad</th>
                <th>Cómo está</th>
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
                    <ResultadoTamizaje
                      respuesta={s.tamizaje?.respuesta ?? null}
                      diasParaAdmision={s.tamizaje?.diasParaAdmisionAutomatica ?? null}
                      yaAdmitida={s.status !== 'NUEVO'}
                    />
                  </td>
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
                    <BotonTamizaje
                      nombre={s.name}
                      telefono={s.phone}
                      enlace={s.tamizaje?.enlace ?? null}
                      yaRespondio={Boolean(s.tamizaje?.respuesta)}
                    />
                    {esAdmin && (
                      <BotonEliminarSolicitud
                        solicitudId={s.id}
                        nombrePersona={s.name}
                      />
                    )}
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
