import { notFound } from 'next/navigation'
import { portalFetch, usuarioActual, puede } from '@/lib/portal'
import { Cabecera, Vacio } from '../componentes'
import { TablaColaboradores, type Colaborador } from './TablaColaboradores'

export const metadata = { title: 'Voluntariado de apoyo' }

type ResumenArea = { area: string; areaLegible: string; total: number }

export default async function ColaboradoresPage() {
  const usuario = await usuarioActual()
  if (!usuario || !puede(usuario, 'colaborador:leer')) {
    notFound()
  }

  const respuesta = await portalFetch<Colaborador[]>('/collaborators?all=true')
  const colaboradores = respuesta.data ?? []
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
        <Vacio>Todavía no se ha registrado nadie desde otras disciplinas.</Vacio>
      ) : (
        <TablaColaboradores colaboradores={colaboradores} />
      )}
    </>
  )
}
