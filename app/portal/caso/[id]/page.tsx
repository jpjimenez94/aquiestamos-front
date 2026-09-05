import Image from 'next/image'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { BACKEND_URL } from '@/lib/api'
import { AccesoCasoForm } from './AccesoCasoForm'
import { ReporteCasoForm } from './ReporteCasoForm'
import { DecidirPropuestaForm } from './DecidirPropuestaForm'
import { momentoDelCaso } from '@/lib/momentoDelCaso'
import { BotonDeclinar } from './BotonDeclinar'
import { EditorDeMiAgenda } from './EditorDeMiAgenda'
import { CuidadoDelProfesional, type EstadoDeCuidado } from './CuidadoDelProfesional'
import { porDia, enPalabras } from './franjas'

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
/**
 * La marca, arriba a la derecha.
 *
 * A esta pantalla se entra desde un enlace de WhatsApp y con un correo: no hay
 * menú, ni sesión, ni nada alrededor que diga de quién es. Un profesional que
 * recibe un mensaje con un enlace y aterriza en una página que le pide datos de
 * una persona sin identificarse tiene todo el derecho a desconfiar — y hace
 * bien.
 *
 * Va en las cuatro pantallas del caso —pedir acceso, enlace vencido, decidir y
 * el caso ya asignado—, porque la primera que ve es justo la que le pide el
 * correo, que es donde más falta hace saber a quién se lo está dando.
 */
function MarcaDeLaRed() {
  return (
    <div className="caso__marca">
      <Image src="/images/logo.png" alt="Red Aquí Estamos" width={132} height={48} priority />
    </div>
  )
}

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
            <MarcaDeLaRed />
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

  /**
   * «¿Cómo estás tú?»: cuántas sesiones lleva y si se le abre el espacio. Va
   * con el mismo token, y si falla no tumba la página: el bloque simplemente
   * no se pinta y el caso se sigue viendo.
   */
  let cuidado: EstadoDeCuidado | null = null
  if (success) {
    try {
      const r = await fetch(`${BACKEND_URL}/api/shared-cases/${id}/cuidado`, {
        headers: { 'x-shared-case-token': token },
        cache: 'no-store',
      })
      const c = await r.json()
      if (r.ok && c.success) cuidado = c.data as EstadoDeCuidado
    } catch {
      cuidado = null
    }
  }

  if (!success) {
    // Si el token es inválido o expiró, lo borramos (esto debería hacerse en un server action o middleware, pero aquí mostramos error)
    return (
      <main className="caso">
        <div className="caso__puerta">
          <header className="caso__intro">
            <h1>Enlace expirado o inválido</h1>
            <p>{message}</p>
            <MarcaDeLaRed />
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
            <MarcaDeLaRed />
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

  /**
   * En qué momento está el caso.
   *
   * La pantalla pintaba todos sus paneles siempre, sin mirar dónde estaba el
   * acompañamiento. Con el flujo viejo se disimulaba: el profesional llegaba
   * aquí después de aceptar, y para entonces ya había hablado con la persona.
   *
   * Desde que se le asigna y se le avisa, entra en el minuto cero — y se
   * encontraba «¿Puedes tomarlo?» y «¿Qué pasó con esta asignación?» una
   * debajo de la otra. Son preguntas de dos momentos distintos y juntas no
   * significan nada: cómo va a contar qué pasó si todavía no ha pasado nada.
   *
   * No es un problema de redacción. Un formulario que pregunta fuera de tiempo
   * enseña a ignorarlo, y este es por donde coordinación se entera de que
   * alguien no contesta el teléfono.
   */
  const { proximaCita, tocaReportar } = momentoDelCaso({
    puedeDeclinar: paciente.puedeDeclinar,
    citas: paciente.appointments ?? [],
    reportes: paciente.reportes?.length ?? 0,
  })
  return (
    <main className="caso">
      <div className="caso__contenido">
        <header className="caso__intro">
          <h1>{nombrePropio(paciente.fullName)}</h1>
          <p>{paciente.city} · Asignado a ti</p>
          <MarcaDeLaRed />
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
            {/*
              La pregunta cambia cuando ya la contestó.

              Seguía diciendo «¿Puedes tomarlo?» después de que él confirmara,
              mientras la ficha de coordinación ya lo daba por confirmado: dos
              pantallas del mismo sistema afirmando cosas distintas sobre lo
              mismo. Y volver a preguntar lo ya respondido enseña a ignorar la
              pregunta.

              La puerta de salida se queda abierta igual: puede echarse atrás
              mientras nadie tenga hora reservada.
            */}
            <h2>{paciente.confirmadoEn ? 'Ya confirmaste este caso' : '¿Puedes tomarlo?'}</h2>
            <p className="panel__nota">
              {paciente.confirmadoEn
                ? `Gracias. ${nombrePropio(paciente.fullName).split(' ')[0]} va a elegir la hora directamente de tu agenda, y te avisamos en cuanto lo haga.`
                : `Este caso ya es tuyo y ${nombrePropio(paciente.fullName).split(' ')[0]} va a elegir la hora directamente de tu agenda.`}
            </p>

            {/*
              Su agenda, delante de la pregunta.

              Se le pedía confirmar que sus espacios «siguen vigentes» sin
              enseñárselos: la mantiene coordinación desde la ficha y aquí
              entra con un enlace, no con una cuenta. Confirmar a ciegas no es
              confirmar, y de ahí salen las cancelaciones tardías — las que
              dejan a alguien esperando el día de la sesión.
            */}
            {/*
              Un día por línea, no una lista con comas.

              Iba todo seguido —«lunes de 6 a 10, martes de 6 a 9, miércoles de
              6 a 9…»— y a partir del tercer día deja de leerse: hay que buscar
              con el dedo qué hora corresponde a qué día. Es justo lo que se le
              pide comprobar antes de aceptar el caso.
            */}
            {porDia(paciente.franjas ?? []).length > 0 ? (
              <div className="caso-horarios">
                <strong>Estos son los espacios que vamos a ofrecerle:</strong>
                <ul
                  style={{
                    listStyle: 'none',
                    margin: '8px 0 0',
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  {porDia(paciente.franjas ?? []).map((d) => (
                    <li
                      key={d.weekday}
                      style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}
                    >
                      <span style={{ fontWeight: 600, minWidth: 88 }}>{d.dia}</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {d.tramos
                          .map((t) => `${enPalabras(t.startMinute)} a ${enPalabras(t.endMinute)}`)
                          .join(' · ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/*
              Y puede corregirlos aquí mismo.

              El texto le pedía «si cambiaron, dínoslo» sin darle dónde: la
              pantalla del portal que edita disponibilidad exige una cuenta que
              él no tiene a propósito. La petición se quedaba en un «escríbenos»
              sin destinatario, y la agenda sobre la que ella elige envejecía.
            */}
            <EditorDeMiAgenda patientId={id} franjas={paciente.franjas ?? []} />

            <p className="panel__nota">
              {paciente.confirmadoEn
                ? 'Si algo cambia y ya no puedes, dilo aquí mientras no haya hora reservada y se lo pasamos a otra persona de la red.'
                : paciente.agenda
                  ? 'Si siguen vigentes, confírmanoslo. Si cambiaron o ahora mismo no puedes, dilo aquí y se lo pasamos hoy a otra persona de la red.'
                  : 'Si en este momento no puedes, dilo aquí y se lo pasamos hoy a otra persona de la red.'}{' '}
              Es voluntario: no poder es normal, y avisar pronto ayuda mucho más que un
              silencio.
            </p>
            <BotonDeclinar patientId={id} yaConfirmo={Boolean(paciente.confirmadoEn)} />
          </div>
        ) : null}

        {/*
          Hay cita y todavía no ha llegado: no hay nada que contar.
        
          Lo que necesita ver ahora es cuándo es y que no tiene que hacer nada
          hasta entonces. El formulario sigue disponible plegado, porque entre
          la asignación y la sesión sí puede pasar algo —que no conteste, que
          avise de que no va— y quitarle el canal por ordenar la pantalla sería
          cambiar un problema por otro.
        */}
        {proximaCita && !tocaReportar ? (
          <div className="panel">
            <h2>Tu próxima sesión</h2>
            <p className="panel__nota">
              {enBogota(proximaCita.startsAt)} · {proximaCita.modality?.toLowerCase()}
            </p>
            <p className="panel__nota">
              No tienes que hacer nada hasta entonces. Cuando termine, vuelve aquí y
              cuéntanos cómo fue.
            </p>

            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                ¿Pasó algo antes de la sesión?
              </summary>
              <div style={{ marginTop: 12 }}>
                <ReporteCasoForm patientId={id} />
              </div>
            </details>
          </div>
        ) : null}

        {tocaReportar ? (
          <div className="panel">
            <h2>¿Qué pasó con esta asignación?</h2>
            <p className="panel__nota">
              Cuéntanos cómo te fue. Es la forma de que quien coordina sepa en qué va el
              caso sin tener que llamarte a preguntar.
            </p>
            <ReporteCasoForm patientId={id} />
          </div>
        ) : null}

        {/*
          Al final, después de reportar: es el momento en que tiene sentido
          preguntarle cómo está él.
        */}
        {cuidado ? <CuidadoDelProfesional patientId={id} estado={cuidado} /> : null}

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

        {/*
          El historial. La próxima ya se enseña arriba con lo que hay que hacer;
          esto es para ver lo que hubo antes y lo que viene después.
        */}
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
