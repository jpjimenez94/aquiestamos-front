import { portalFetch, enBogota, soloHora } from '@/lib/portal'
import { Cabecera, Etiqueta, Vacio } from '../componentes'

export const metadata = { title: 'Mi agenda' }

type Cita = {
  id: string
  inicio: string
  fin: string
  modalidad: string
  meetingUrl?: string | null
  /** Llave de sala firmada para el profesional. Es por donde se entra. */
  salaTokenProfesional?: string | null
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
                    {/* Se entra por `/sala/<token>`, no por la URL de Jitsi.
                        Antes este enlace usaba `c.meetingUrl`, que la vista se
                        inventaba a partir del id de la cita y que NO era la
                        sala real: el profesional llegaba a una sala vacía
                        mientras la persona esperaba en otra. La sala la decide
                        el servidor en un solo sitio, y de paso queda la
                        telemetría de quién entró y cuándo. */}
                    {c.salaTokenProfesional || c.meetingUrl ? (
                      <a
                        href={
                          c.salaTokenProfesional
                            ? `/sala/${c.salaTokenProfesional}`
                            : (c.meetingUrl as string)
                        }
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
