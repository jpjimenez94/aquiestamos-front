import { portalFetch, usuarioActual, puede } from '@/lib/portal'
import { Cabecera, Vacio } from '../componentes'
import { TablaPostulaciones, type Postulacion } from './TablaPostulaciones'

export const metadata = { title: 'Postulaciones' }

export default async function PostulacionesPage() {
  const [usuario, respuesta] = await Promise.all([
    usuarioActual(),
    portalFetch<Postulacion[]>('/volunteers?all=true'),
  ])

  const veProfesionales = puede(usuario, 'profesional:leer')
  const editaProfesionales = puede(usuario, 'profesional:verificar-tarjeta')

  const postulaciones = respuesta.data ?? []

  return (
    <>
      <Cabecera
        titulo="Postulaciones de profesionales"
        descripcion="Registro histórico de postulaciones recibidas. Los psicólogos se aprueban automáticamente al enviar el formulario y su tarjeta profesional puede ser validada aquí."
      />

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar las postulaciones.'}</Vacio>
      ) : postulaciones.length === 0 ? (
        <Vacio>Todavía no se ha postulado nadie.</Vacio>
      ) : (
        <TablaPostulaciones
          postulaciones={postulaciones}
          veProfesionales={veProfesionales}
          editaProfesionales={editaProfesionales}
        />
      )}
    </>
  )
}
