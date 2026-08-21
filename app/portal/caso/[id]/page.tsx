import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { BACKEND_URL } from '@/lib/api'
import { AccesoCasoForm } from './AccesoCasoForm'
import { ReporteCasoForm } from './ReporteCasoForm'

// Reutilizamos componentes internos aunque la ruta esté por fuera del layout autenticado.
import { Dato, Etiqueta } from '../../(interno)/componentes'
import { enBogota } from '@/lib/portal'

export const metadata = { title: 'Acceso al caso' }

// La ruta recibe params con el id del paciente.
export default async function SharedCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const cookieStore = await cookies()
  const token = cookieStore.get(`case_token_${id}`)?.value

  if (!token) {
    return (
      <main className="portal portal--centrado">
        <div className="login-box">
          <header className="login-box__header">
            <h1>Acceso al caso</h1>
            <p>Ingresa el correo con el que estás registrado en la red para ver los detalles de este paciente.</p>
          </header>
          <AccesoCasoForm patientId={id} />
        </div>
      </main>
    )
  }

  // Verificar el token con el backend
  const response = await fetch(`${BACKEND_URL}/api/shared-cases/${id}`, {
    headers: {
      'x-shared-case-token': token
    },
    cache: 'no-store'
  })

  const { success, data: paciente, message } = await response.json()

  if (!success) {
    // Si el token es inválido o expiró, lo borramos (esto debería hacerse en un server action o middleware, pero aquí mostramos error)
    return (
      <main className="portal portal--centrado">
        <div className="login-box">
          <h2>Enlace expirado o inválido</h2>
          <p>{message}</p>
        </div>
      </main>
    )
  }

  // Renderizar la vista del paciente. Muy similar a la interna, pero más simplificada.
  return (
    <main className="portal" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header className="portal__cabecera">
        <div>
          <h1>{paciente.fullName}</h1>
          <p>{paciente.city} · Asignado a ti</p>
        </div>
      </header>
      
      <div className="panel" style={{ marginTop: '2rem' }}>
        <h2>Información de Contacto</h2>
        <div className="datos">
          <Dato etiqueta="Teléfono">{paciente.phone}</Dato>
          {paciente.email ? <Dato etiqueta="Correo">{paciente.email}</Dato> : null}
          <Dato etiqueta="Modalidad que prefiere">
            {paciente.preferredModality?.toLowerCase() ?? '—'}
          </Dato>
        </div>
      </div>

      <div className="panel" style={{ marginTop: '2rem' }}>
        <h2>¿Qué pasó con esta asignación?</h2>
        <p className="panel__nota">
          Cuéntanos cómo te fue. Es la forma de que quien coordina sepa en qué va el
          caso sin tener que llamarte a preguntar.
        </p>
        <ReporteCasoForm patientId={id} />
      </div>

      {paciente.reportes?.length > 0 ? (
        <div className="panel" style={{ marginTop: '2rem' }}>
          <h2>Lo que ya nos contaste</h2>
          <p className="panel__nota">
            Se van sumando: si algo cambia, envía una respuesta nueva en vez de
            corregir la anterior.
          </p>
          <ul className="bitacora">
            {paciente.reportes.map((r: any) => (
              <li key={r.id} className="bitacora__entrada">
                <div className="bitacora__cabecera">
                  <strong>{r.resultadoLegible}</strong>
                  <span className="bitacora__fecha">{enBogota(r.createdAt)}</span>
                </div>
                {r.modality || r.meetsAt ? (
                  <p className="bitacora__dato">
                    {r.modality ? r.modality.toLowerCase() : null}
                    {r.modality && r.meetsAt ? ' · ' : null}
                    {r.meetsAt ? enBogota(r.meetsAt) : null}
                  </p>
                ) : null}
                {r.contactDifficulties ? (
                  <p className="bitacora__dato">
                    <em>Dificultades:</em> {r.contactDifficulties}
                  </p>
                ) : null}
                {r.notes ? <p className="bitacora__dato">{r.notes}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="panel" style={{ marginTop: '2rem' }}>
        <h2>Citas programadas</h2>
        {paciente.appointments?.length > 0 ? (
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Modalidad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {paciente.appointments.map((cita: any) => (
                <tr key={cita.id}>
                  <td>{enBogota(cita.startsAt)}</td>
                  <td>{cita.modality}</td>
                  <td><Etiqueta estado={cita.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="vacio">No hay citas programadas aún.</p>
        )}
      </div>
    </main>
  )
}
