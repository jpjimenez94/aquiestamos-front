
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ListTodo } from 'lucide-react'
import { portalFetch, usuarioActual, puede, esAdministrador } from '@/lib/portal'
import { Cabecera, Vacio } from '../componentes'
import { TablaColaboradores, type Colaborador } from './TablaColaboradores'

export const metadata = { title: 'Voluntariado de apoyo' }

type ResumenArea = { area: string; areaLegible: string; total: number }

export default async function ColaboradoresPage() {
  const usuario = await usuarioActual()
  if (!usuario || !puede(usuario, 'colaborador:leer')) {
    notFound()
  }

  const esAdmin = esAdministrador(usuario)
  const puedeEditar = puede(usuario, 'colaborador:editar')
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 22px',
                borderRadius: 10,
                fontSize: '0.94rem',
                fontWeight: 800,
                background: '#059669',
                color: '#ffffff',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                border: '1.5px solid #047857',
                transition: 'all 0.15s ease',
              }}
            >
              <ListTodo size={18} strokeWidth={2.5} />
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
        <TablaColaboradores
          colaboradores={colaboradores}
          esAdmin={esAdmin}
          puedeEditar={puedeEditar || esAdmin}
        />
      )}
    </>
  )
}
