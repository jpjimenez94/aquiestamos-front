import { portalFetch, enBogota } from '@/lib/portal'
import { Cabecera, Etiqueta, Vacio, Paginacion, leerPagina } from '../componentes'
import { BotonAprobar } from './BotonAprobar'

export const metadata = { title: 'Postulaciones' }

type Postulacion = {
  id: string
  fullName: string
  email: string
  phone: string
  city: string | null
  profession: string | null
  yearsExperience: string | null
  populations: string[]
  modality: string
  availableDays: string[]
  status: string
  createdAt: string
}

const EXPERIENCIA: Record<string, string> = {
  MENOS_DE_1: '< 1 año',
  ENTRE_1_Y_3: '1–3 años',
  ENTRE_3_Y_5: '3–5 años',
  MAS_DE_5: '+5 años',
}

const POR_PAGINA = 25

export default async function PostulacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>
}) {
  const pagina = leerPagina((await searchParams).pagina)

  const respuesta = await portalFetch<Postulacion[]>(
    `/volunteers?page=${pagina}&perPage=${POR_PAGINA}`,
  )
  const postulaciones = respuesta.data ?? []
  const total = Number(respuesta.meta?.total ?? postulaciones.length)

  return (
    <>
      <Cabecera
        titulo="Postulaciones de profesionales"
        descripcion="Aprobar una crea su ficha y convierte los días y franjas que marcó en su disponibilidad inicial."
      />

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar las postulaciones.'}</Vacio>
      ) : postulaciones.length === 0 ? (
        <Vacio>
          {pagina > 1
            ? 'Esta página ya no tiene postulaciones.'
            : 'Todavía no se ha postulado nadie.'}
        </Vacio>
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Profesional</th>
                <th>Profesión</th>
                <th>Experiencia</th>
                <th>Modalidad</th>
                <th>Recibida</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {postulaciones.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="tabla__principal">{p.fullName}</span>
                    <span className="tabla__secundario">
                      {p.city ?? 'Sin ciudad'} · {p.phone}
                    </span>
                  </td>
                  <td>
                    {p.profession ?? '—'}
                    <span className="tabla__secundario">
                      {p.populations?.slice(0, 3).join(', ')}
                      {p.populations?.length > 3 ? '…' : ''}
                    </span>
                  </td>
                  <td>{EXPERIENCIA[p.yearsExperience ?? ''] ?? '—'}</td>
                  <td>{p.modality}</td>
                  <td className="tabla__numero">{enBogota(p.createdAt, false)}</td>
                  <td>
                    <Etiqueta estado={p.status} />
                  </td>
                  <td className="tabla__acciones">
                    <BotonAprobar volunteerId={p.id} yaAprobada={p.status === 'ACTIVO'} />
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
          ruta="/portal/postulaciones"
        />
      ) : null}
    </>
  )
}
