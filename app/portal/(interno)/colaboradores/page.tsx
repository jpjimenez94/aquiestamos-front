import { portalFetch, enBogota } from '@/lib/portal'
import { Cabecera, Etiqueta, Vacio, Paginacion, leerPagina } from '../componentes'
import { FiltrosDirectorio } from './FiltrosDirectorio'

export const metadata = { title: 'Voluntariado de apoyo' }

type Colaborador = {
  id: string
  fullName: string
  email: string
  phone: string
  city: string
  area: string
  areaLegible: string
  discipline: string
  yearsExperience: string | null
  skills: string | null
  modality: string
  availableToTravel: string | null
  availableDays: string[]
  availableSlots: string[]
  weeklyHours: string | null
  status: string
  createdAt: string
}

type ResumenArea = { area: string; areaLegible: string; total: number }

const EXPERIENCIA: Record<string, string> = {
  MENOS_DE_1: '< 1 año',
  ENTRE_1_Y_3: '1–3 años',
  ENTRE_3_Y_5: '3–5 años',
  MAS_DE_5: '+5 años',
}

const DIA_CORTO: Record<string, string> = {
  LUNES: 'Lu', MARTES: 'Ma', MIERCOLES: 'Mi', JUEVES: 'Ju',
  VIERNES: 'Vi', SABADO: 'Sa', DOMINGO: 'Do',
}

const FRANJA_CORTA: Record<string, string> = {
  MANANA: 'mañana', TARDE: 'tarde', NOCHE: 'noche',
}

const POR_PAGINA = 25

export default async function ColaboradoresPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string; area?: string; ciudad?: string; modalidad?: string }>
}) {
  const params = await searchParams
  const pagina = leerPagina(params.pagina)

  // Solo se mandan los filtros que traen valor: así la URL sin filtros queda
  // limpia y compartible.
  const consulta = new URLSearchParams({ page: String(pagina), perPage: String(POR_PAGINA) })
  if (params.area) consulta.set('area', params.area)
  if (params.ciudad) consulta.set('city', params.ciudad)
  if (params.modalidad) consulta.set('modality', params.modalidad)

  const respuesta = await portalFetch<Colaborador[]>(`/collaborators?${consulta}`)
  const colaboradores = respuesta.data ?? []
  const total = Number(respuesta.meta?.total ?? colaboradores.length)
  const porArea = (respuesta.meta?.porArea as ResumenArea[] | undefined) ?? []

  const hayFiltro = Boolean(params.area || params.ciudad || params.modalidad)

  return (
    <>
      <Cabecera
        titulo="Voluntariado de apoyo"
        descripcion="Quienes se sumaron desde otras disciplinas. Es un directorio para buscar y llamar: no entra en el emparejamiento con personas ni en la agenda."
      />

      {porArea.length > 0 ? (
        <div className="indicadores">
          {porArea.map((a) => (
            <div key={a.area} className="indicador">
              <span className="indicador__cifra">{a.total}</span>
              <span className="indicador__etiqueta">{a.areaLegible}</span>
            </div>
          ))}
        </div>
      ) : null}

      <FiltrosDirectorio
        area={params.area ?? ''}
        ciudad={params.ciudad ?? ''}
        modalidad={params.modalidad ?? ''}
      />

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar el directorio.'}</Vacio>
      ) : colaboradores.length === 0 ? (
        <Vacio>
          {hayFiltro
            ? 'Nadie coincide con esos filtros.'
            : pagina > 1
              ? 'Esta página ya no tiene registros.'
              : 'Todavía no se ha registrado nadie desde otras disciplinas.'}
        </Vacio>
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Persona</th>
                <th>Disciplina</th>
                <th>Experiencia</th>
                <th>Dónde y cómo</th>
                <th>Disponibilidad</th>
                <th>Registro</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {colaboradores.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="tabla__principal">{c.fullName}</span>
                    <span className="tabla__secundario">
                      {c.phone} · {c.email}
                    </span>
                  </td>
                  <td>
                    {c.discipline}
                    <span className="tabla__secundario">{c.areaLegible}</span>
                  </td>
                  <td>{EXPERIENCIA[c.yearsExperience ?? ''] ?? '—'}</td>
                  <td>
                    {c.city}
                    <span className="tabla__secundario">
                      {c.modality.toLowerCase()}
                      {c.availableToTravel ? ` · viaja a ${c.availableToTravel}` : ''}
                    </span>
                  </td>
                  <td>
                    <span className="tabla__secundario" style={{ marginTop: 0 }}>
                      {c.availableDays?.length
                        ? c.availableDays.map((d) => DIA_CORTO[d] ?? d).join(' ')
                        : '—'}
                      {c.availableSlots?.length
                        ? ` · ${c.availableSlots.map((f) => FRANJA_CORTA[f] ?? f).join(', ')}`
                        : ''}
                    </span>
                    {c.skills ? (
                      <span className="tabla__secundario" title={c.skills}>
                        {c.skills.length > 70 ? `${c.skills.slice(0, 70)}…` : c.skills}
                      </span>
                    ) : null}
                  </td>
                  <td className="tabla__numero">{enBogota(c.createdAt, false)}</td>
                  <td>
                    <Etiqueta estado={c.status} />
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
          ruta="/portal/colaboradores"
          filtros={{ area: params.area, ciudad: params.ciudad, modalidad: params.modalidad }}
        />
      ) : null}
    </>
  )
}
