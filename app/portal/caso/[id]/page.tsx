import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { BACKEND_URL } from '@/lib/api'
import { AccesoCasoForm } from './AccesoCasoForm'
import { ReporteCasoForm } from './ReporteCasoForm'
import { DecidirPropuestaForm } from './DecidirPropuestaForm'
import { BotonDeclinar } from './BotonDeclinar'

// Reutilizamos componentes internos aunque la ruta esté por fuera del layout autenticado.
import { Dato, Etiqueta } from '../../(interno)/componentes'
import { enBogota } from '@/lib/portal'
import { nombrePropio } from '@/lib/nombre'

/**
 * Esta pantalla usa las tarjetas del portal (`panel`, `datos`, `tabla`) y no
 * las importaba: vive fuera del grupo `(interno)`, que es quien trae
 * `portal.css`, así que el profesional la ha estado viendo a medio vestir.
 *
 * Y las del tamizaje porque el formulario de decisión reutiliza sus opciones
 * grandes: son la misma cosa —alguien contestando algo importante desde el
 * teléfono— y no tiene sentido dibujarlas dos veces.
 *
 * Lo que NO puede usar es la clase `.portal`: esa es la rejilla de dos
 * columnas del portal interno (236px de barra lateral + contenido). Aquí no
 * hay barra, así que el contenido se metía entero en los 236px y las tarjetas
 * caían una a cada lado. El armazón de esta pantalla vive en `caso.css`.
 */
import '../../portal.css'
import '../../../tamizaje/[token]/tamizaje.css'
import './caso.css'

export const metadata = { title: 'Acceso al caso' }

const DIA: Record<string, string> = {
  LUNES: 'lunes', MARTES: 'martes', MIERCOLES: 'miércoles', JUEVES: 'jueves',
  VIERNES: 'viernes', SABADO: 'sábado', DOMINGO: 'domingo',
}
const FRANJA: Record<string, string> = { MANANA: 'mañana', TARDE: 'tarde', NOCHE: 'noche' }

// La ruta recibe params con el id del paciente.
export default async function SharedCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const cookieStore = await cookies()
  const token = cookieStore.get(`case_token_${id}`)?.value

  if (!token) {
    return (
      <main className="caso">
        <div className="caso__puerta">
          <header className="caso__intro">
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
      <main className="caso">
        <div className="caso__puerta">
          <header className="caso__intro">
            <h1>Enlace expirado o inválido</h1>
            <p>{message}</p>
          </header>
        </div>
      </main>
    )
  }

  /**
   * Todavía no ha aceptado: se le enseña lo justo para decidir.
   *
   * El backend ni siquiera manda el nombre ni el teléfono de la persona en
   * este estado. Para decidir si puede acompañarla hace falta saber dónde
   * está, cómo prefiere que sea y cuándo puede — no quién es. Si dice que no,
   * no se lleva los datos de alguien que nunca fue su caso.
   */
  if (paciente.decidir) {
    const caso = paciente.caso
    return (
      <main className="caso">
        <div className="caso__contenido">
          <header className="caso__intro">
            <h1>Te proponemos un acompañamiento</h1>
            <p>Mira si puedes tomarlo y dinos. No estás comprometido a nada.</p>
          </header>

          <div className="panel">
            <h2>De qué se trata</h2>
            <p className="panel__nota">
              Los datos de contacto de la persona aparecen cuando aceptas, no antes.
            </p>
            <div className="datos">
              <Dato etiqueta="Dónde está">{caso.city}</Dato>
              <Dato etiqueta="Prioridad">
                <Etiqueta estado={caso.priority} texto={caso.prioridadLegible} />
              </Dato>
              <Dato etiqueta="Modalidad que prefiere">
                {caso.preferredModality?.toLowerCase() ?? 'le da igual'}
              </Dato>
              <Dato etiqueta="Días que puede">
                {caso.availableDays?.length
                  ? caso.availableDays.map((d: string) => DIA[d] ?? d).join(', ')
                  : 'sin especificar'}
              </Dato>
              <Dato etiqueta="Franjas">
                {caso.availableSlots?.length
                  ? caso.availableSlots.map((f: string) => FRANJA[f] ?? f).join(', ')
                  : 'sin especificar'}
              </Dato>
              {caso.isMinor ? <Dato etiqueta="Es menor de edad">Sí</Dato> : null}
            </div>
          </div>

          <div className="panel">
            <DecidirPropuestaForm patientId={id} />
          </div>
        </div>
      </main>
    )
  }

  // Renderizar la vista del paciente. Muy similar a la interna, pero más simplificada.
  return (
    <main className="caso">
      <div className="caso__contenido">
        <header className="caso__intro">
          <h1>{nombrePropio(paciente.fullName)}</h1>
          <p>{paciente.city} · Asignado a ti</p>
        </header>

        <div className="panel">
          <h2>Información de Contacto</h2>
          <div className="datos">
            <Dato etiqueta="Teléfono">{paciente.phone}</Dato>
            {paciente.email ? <Dato etiqueta="Correo">{paciente.email}</Dato> : null}
            <Dato etiqueta="Modalidad que prefiere">
              {paciente.preferredModality?.toLowerCase() ?? '—'}
            </Dato>
          </div>
        </div>

        {paciente.puedeDeclinar ? (
          <div className="panel">
            <h2>¿Puedes tomarlo?</h2>
            <p className="panel__nota">
              Este caso ya es tuyo y {nombrePropio(paciente.fullName).split(' ')[0]} va a
              elegir la hora directamente de tu agenda. No tienes que confirmar nada.
            </p>
            <p className="panel__nota">
              Si en este momento no puedes, dilo aquí y se lo pasamos hoy a otra persona
              de la red. Es voluntario: no poder es normal, y avisar pronto ayuda mucho
              más que un silencio.
            </p>
            <BotonDeclinar patientId={id} />
          </div>
        ) : null}

        <div className="panel">
          <h2>¿Qué pasó con esta asignación?</h2>
          <p className="panel__nota">
            Cuéntanos cómo te fue. Es la forma de que quien coordina sepa en qué va el
            caso sin tener que llamarte a preguntar.
          </p>
          <ReporteCasoForm patientId={id} />
        </div>

        {paciente.reportes?.length > 0 ? (
          <div className="panel">
            <h2>Lo que ya nos contaste</h2>
            <p className="panel__nota">
              Se van sumando: si algo cambia, envía una respuesta nueva en vez de
              corregir la anterior.
            </p>
            <ul className="bitacora">
              {paciente.reportes.map((r: any) => (
                <li key={r.id} className="bitacora__entrada">
                  <div className="bitacora__cabecera">
                    <strong>
                    {r.resultadoLegible}
                    {r.queSigueLegible ? ` · ${r.queSigueLegible}` : ''}
                  </strong>
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

        <div className="panel">
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
      </div>
    </main>
  )
}
