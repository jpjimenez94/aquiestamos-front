import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ListTodo } from 'lucide-react'
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

  const puedeVerTareas = puede(usuario, 'tarea:leer')
  const respuesta = await portalFetch<Colaborador[]>('/collaborators?all=true')
  const colaboradores = respuesta.data ?? []
  const porArea = (respuesta.meta?.porArea as ResumenArea[] | undefined) ?? []

  return (
    <>
      <Cabecera
        titulo="Voluntariado de apoyo"
        descripcion="Quienes se sumaron desde otras disciplinas. Es un directorio para buscar y llamar: no entra en el emparejamiento con personas ni en la agenda."
        acciones={
          puedeVerTareas ? (
            <Link
              href="/portal/tareas"
              className="boton boton--secundario"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.86rem' }}
            >
              <ListTodo size={15} />
              Ver tareas de apoyo
            </Link>
          ) : null
        }
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
