import { portalFetch, enBogota, soloHora } from '@/lib/portal'
import { Cabecera, Etiqueta, Vacio } from '../componentes'

export const metadata = { title: 'Mi agenda' }

type Cita = {
  id: string
  inicio: string
  fin: string
  modalidad: string
  meetingUrl?: string | null
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
                <th>Sesión Virtual</th>
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
                  <td style={{ textTransform: 'capitalize' }}>{c.modalidad.toLowerCase()}</td>
                  <td>
                    <Etiqueta estado={c.estado} texto={c.estadoLegible} />
                  </td>
                  <td>
                    {c.meetingUrl ? (
                      <a
                        href={c.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="boton-mini"
                        data-tono="principal"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontWeight: 700 }}
                      >
                        📹 Entrar a la sala
                      </a>
                    ) : (
                      <span className="tabla__secundario">—</span>
                    )}
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
