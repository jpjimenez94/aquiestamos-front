import { portalFetch, usuarioActual, puede } from '@/lib/portal'
import { Cabecera, Vacio, Paginacion, leerPagina } from '../componentes'
import { TablaPostulaciones, type Postulacion } from './TablaPostulaciones'

export const metadata = { title: 'Postulaciones' }

const POR_PAGINA = 25

export default async function PostulacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>
}) {
  const [pagina, usuario] = await Promise.all([
    searchParams.then((p) => leerPagina(p.pagina)),
    usuarioActual(),
  ])

  const veProfesionales = puede(usuario, 'profesional:leer')
  const editaProfesionales = puede(usuario, 'profesional:verificar-tarjeta')

  const respuesta = await portalFetch<Postulacion[]>(
    `/volunteers?page=${pagina}&perPage=${POR_PAGINA}`,
  )
  const postulaciones = respuesta.data ?? []
  const total = Number(respuesta.meta?.total ?? postulaciones.length)

  return (
    <>
      <Cabecera
        titulo="Postulaciones de profesionales"
        descripcion="Registro histórico de postulaciones recibidas. Los psicólogos se aprueban automáticamente al enviar el formulario y su tarjeta profesional puede ser validada aquí."
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
        <TablaPostulaciones
          postulaciones={postulaciones}
          veProfesionales={veProfesionales}
          editaProfesionales={editaProfesionales}
        />
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
