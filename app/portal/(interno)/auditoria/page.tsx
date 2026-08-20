import { portalFetch, enBogota } from '@/lib/portal'
import { Cabecera, Vacio } from '../componentes'

export const metadata = { title: 'Auditoría' }

type Entrada = {
  id: string
  actor: string | null
  accion: string
  entidad: string
  entidadId: string | null
  fecha: string
  ip: string | null
}

const ACCION: Record<string, string> = {
  acceder: 'Entró al portal',
  acceso_fallido: 'Intento fallido',
  salir: 'Cerró sesión',
  consultar: 'Consultó',
  crear: 'Creó',
  editar: 'Editó',
  borrar: 'Dio de baja',
  cambiar_clave: 'Cambió la clave',
}

export default async function AuditoriaPage() {
  const respuesta = await portalFetch<Entrada[]>('/audit?perPage=150')
  const entradas = respuesta.data ?? []

  return (
    <>
      <Cabecera
        titulo="Auditoría"
        descripcion="Quién hizo qué y cuándo. Con datos de salud también se registra quién consulta, no solo quién edita."
      />

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar la auditoría.'}</Vacio>
      ) : entradas.length === 0 ? (
        <Vacio>Todavía no hay registros.</Vacio>
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Cuándo</th>
                <th>Quién</th>
                <th>Qué hizo</th>
                <th>Sobre</th>
              </tr>
            </thead>
            <tbody>
              {entradas.map((e) => (
                <tr key={e.id}>
                  <td className="tabla__numero">{enBogota(e.fecha)}</td>
                  <td>{e.actor ?? <span className="tabla__secundario">anónimo</span>}</td>
                  <td>{ACCION[e.accion] ?? e.accion}</td>
                  <td>
                    {e.entidad}
                    {e.entidadId ? (
                      <span className="tabla__secundario">{e.entidadId.slice(0, 8)}…</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
