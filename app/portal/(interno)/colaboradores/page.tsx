import { portalFetch } from '@/lib/portal'
import { Cabecera, Vacio, Paginacion, leerPagina } from '../componentes'
import { TablaColaboradores, type Colaborador } from './TablaColaboradores'

export const metadata = { title: 'Voluntariado de apoyo' }

type ResumenArea = { area: string; areaLegible: string; total: number }

const POR_PAGINA = 25

export default async function ColaboradoresPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>
}) {
  const params = await searchParams
  const pagina = leerPagina(params.pagina)

  const respuesta = await portalFetch<Colaborador[]>(
    `/collaborators?page=${pagina}&perPage=${POR_PAGINA}`,
  )
  const colaboradores = respuesta.data ?? []
  const total = Number(respuesta.meta?.total ?? colaboradores.length)
  const porArea = (respuesta.meta?.porArea as ResumenArea[] | undefined) ?? []

  return (
    <>
      <Cabecera
        titulo="Voluntariado de apoyo"
        descripcion="Quienes se sumaron desde otras disciplinas. Es un directorio para buscar y llamar: no entra en el emparejamiento con personas ni en la agenda."
      />

      {porArea.length > 0 ? (
        <div className="indicadores" style={{ marginBottom: 16 }}>
          {porArea.map((a) => (
            <div key={a.area} className="indicador">
              <span className="indicador__cifra">{a.total}</span>
              <span className="indicador__etiqueta">{a.areaLegible}</span>
            </div>
          ))}
        </div>
      ) : null}

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar el directorio.'}</Vacio>
      ) : colaboradores.length === 0 ? (
        <Vacio>
          {pagina > 1
            ? 'Esta página ya no tiene registros.'
            : 'Todavía no se ha registrado nadie desde otras disciplinas.'}
        </Vacio>
      ) : (
        <TablaColaboradores colaboradores={colaboradores} />
      )}

      {respuesta.success ? (
        <Paginacion
          pagina={pagina}
          porPagina={POR_PAGINA}
          total={total}
          ruta="/portal/colaboradores"
        />
      ) : null}
    </>
  )
}
