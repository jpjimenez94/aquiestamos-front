import { portalFetch, enBogota, soloHora } from '@/lib/portal'
import { Cabecera, Etiqueta, Vacio } from '../componentes'

export const metadata = { title: 'Mi agenda' }

type Cita = {
  id: string
  inicio: string
  fin: string
  modalidad: string
  estado: string
  estadoLegible: string
  paciente: { id: string; nombre?: string; telefono?: string }
}

export default async function MiAgendaPage() {
  const respuesta = await portalFetch<Cita[]>('/appointments/mias')
  const citas = respuesta.data ?? []

  return (
    <>
      <Cabecera
        titulo="Mi agenda"
        descripcion="Tus próximos acompañamientos. Si algo no cuadra, escríbele al equipo de coordinación."
      />

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar tu agenda.'}</Vacio>
      ) : citas.length === 0 ? (
        <Vacio>No tienes citas próximas.</Vacio>
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Cuándo</th>
                <th>Persona</th>
                <th>Modalidad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="tabla__principal">{enBogota(c.inicio, false)}</span>
                    <span className="tabla__secundario">
                      {soloHora(c.inicio)} – {soloHora(c.fin)}
                    </span>
                  </td>
                  <td>
                    {c.paciente.nombre ?? '—'}
                    {c.paciente.telefono ? (
                      <span className="tabla__secundario">{c.paciente.telefono}</span>
                    ) : null}
                  </td>
                  <td>{c.modalidad.toLowerCase()}</td>
                  <td>
                    <Etiqueta estado={c.estado} texto={c.estadoLegible} />
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
