import { redirect } from 'next/navigation'
import { HeartHandshake, Users, CalendarClock } from 'lucide-react'
import { portalFetch, usuarioActual, puede, enBogota } from '@/lib/portal'
import { Cabecera, Vacio, Etiqueta } from '../componentes'
import { nombrePropio } from '@/lib/nombre'
import { ConvocarSesion } from './ConvocarSesion'
import { OfrecerElEspacio } from './OfrecerElEspacio'
import { AccionesSesion } from './AccionesSesion'

export const metadata = { title: 'Cuidado del equipo' }

/**
 * CUIDADO DEL EQUIPO
 *
 * Quien acompaña también se carga, y la red no tenía dónde verlo. Aquí están
 * las tres cosas: quién pidió el espacio «¿Cómo estás tú?» y qué necesita,
 * quién está marcado para facilitar sesiones grupales, y las sesiones
 * convocadas.
 *
 * Convocar es una sola acción: facilitador, hora, enlace, invitados. La
 * agenda se arma sola con las preguntas que dejaron los invitados al pedir el
 * espacio, para que el supervisor no llegue a empezar de cero. Nada de esto
 * toca citas, asignaciones ni reportes.
 */

type CheckIn = {
  id: string
  profesional: { id: string; fullName: string; city: string; phone: string }
  necesidad: string
  necesidadLegible: string
  notas: string | null
  pregunta: string | null
  sesionesAlPedirlo: number
  fecha: string
}

type Supervisor = {
  id: string
  fullName: string
  city: string
  modality: string
  supervisorVolunteerAt: string | null
}

type Sesion = {
  id: string
  facilitador: { id: string; fullName: string }
  inicio: string
  fin: string
  enlace: string
  agenda: string | null
  estado: 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA'
  invitados: { id: string; nombre: string; asistio: boolean | null }[]
  creadaPor: string | null
  creadaEl: string
}

type ParaOfrecer = {
  id: string
  nombre: string
  telefono: string
  sesiones: number
  pacienteId: string
  ultimaVez: string | null
}

type Resumen = {
  umbral: number
  checkInsPendientes: CheckIn[]
  paraOfrecer: ParaOfrecer[]
  supervisores: Supervisor[]
  sesiones: Sesion[]
}

const TONO_NECESIDAD: Record<string, string> = {
  APOYO_PARA_MI: 'ALTA',
  AYUDA_CON_UN_CASO: 'MEDIA',
  DESCARGARME: 'BAJA',
}

const ESTADO_SESION: Record<string, string> = {
  PROGRAMADA: 'Programada',
  REALIZADA: 'Realizada',
  CANCELADA: 'Cancelada',
}

export default async function CuidadoPage() {
  const usuario = await usuarioActual()
  if (!usuario || !puede(usuario, 'cuidado:leer')) {
    redirect('/portal')
  }
  const gestiona = puede(usuario, 'cuidado:gestionar')

  const respuesta = await portalFetch<Resumen>('/cuidado')
  if (!respuesta.success || !respuesta.data) {
    return (
      <>
        <Cabecera titulo="Cuidado del equipo" descripcion="Quien acompaña también se carga." />
        <Vacio>{respuesta.message ?? 'No pudimos cargar el módulo.'}</Vacio>
      </>
    )
  }
  const { umbral, checkInsPendientes, paraOfrecer, supervisores, sesiones } = respuesta.data
  const programadas = sesiones.filter((s) => s.estado === 'PROGRAMADA')
  const pasadas = sesiones.filter((s) => s.estado !== 'PROGRAMADA')

  return (
    <>
      <Cabecera
        titulo="Cuidado del equipo"
        descripcion={`Quién pidió el espacio «¿Cómo estás tú?», quién está marcado para facilitar, y las sesiones grupales de seguimiento. El espacio se abre al profesional a partir de ${umbral} ${umbral === 1 ? 'sesión' : 'sesiones'} en la red (se cambia en Parametrización).`}
        acciones={
          gestiona ? (
            <ConvocarSesion
              supervisores={supervisores}
              candidatos={checkInsPendientes.map((c) => ({
                id: c.profesional.id,
                nombre: c.profesional.fullName,
                necesidad: c.necesidadLegible,
                pregunta: c.pregunta,
              }))}
            />
          ) : null
        }
      />

      {/* ── Quién pidió el espacio ─────────────────────────────────────── */}
      <div className="panel">
        <h2>
          <HeartHandshake size={18} style={{ verticalAlign: -3, marginRight: 6, color: '#2e7d5b' }} />
          Pidieron el espacio{' '}
          <span className="tabla__secundario" style={{ fontWeight: 400 }}>
            · {checkInsPendientes.length}
          </span>
        </h2>
        <p className="panel__nota">
          Lo que respondieron desde su enlace del caso. Salen de aquí cuando se les convoca a una
          sesión; la pregunta que dejaron es lo que arma la agenda.
        </p>
        {checkInsPendientes.length === 0 ? (
          <Vacio>Nadie ha pedido el espacio. Cuando alguien lo haga, llega un correo a coordinación y aparece aquí.</Vacio>
        ) : (
          <div className="tabla-envoltorio" style={{ marginTop: 12 }}>
            <table className="tabla">
              <thead>
                <tr>
                  <th>Quién</th>
                  <th>Qué necesita</th>
                  <th>Lo que contó</th>
                  <th>Para la sesión grupal</th>
                  <th>Cuándo</th>
                </tr>
              </thead>
              <tbody>
                {checkInsPendientes.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <a href={`/portal/profesionales/${c.profesional.id}`} className="tabla__principal">
                        {nombrePropio(c.profesional.fullName)}
                      </a>
                      <span className="tabla__secundario">
                        {c.profesional.city} · {c.sesionesAlPedirlo} sesiones al pedirlo
                      </span>
                    </td>
                    <td>
                      <Etiqueta estado={TONO_NECESIDAD[c.necesidad] ?? 'MEDIA'} texto={c.necesidadLegible} />
                    </td>
                    <td style={{ maxWidth: 320, whiteSpace: 'pre-wrap' }}>{c.notas ?? '—'}</td>
                    <td style={{ maxWidth: 320, whiteSpace: 'pre-wrap' }}>{c.pregunta ?? '—'}</td>
                    <td className="tabla__secundario">{enBogota(c.fecha)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── A quién ofrecérselo ────────────────────────────────────────── */}
      {gestiona ? (
        <OfrecerElEspacio profesionales={paraOfrecer ?? []} umbral={umbral} />
      ) : null}

      {/* ── Quién puede facilitar ──────────────────────────────────────── */}
      <div className="panel">
        <h2>
          <Users size={18} style={{ verticalAlign: -3, marginRight: 6, color: '#2b5f97' }} />
          Pueden facilitar{' '}
          <span className="tabla__secundario" style={{ fontWeight: 400 }}>
            · {supervisores.length}
          </span>
        </h2>
        <p className="panel__nota">
          Quién puede facilitar ya se sabe por el formulario de voluntarios: se le pregunta por
          WhatsApp y se marca desde su ficha en Profesionales («Supervisor de sesiones grupales»).
          Al profesional no se le pregunta desde su enlace. Estar marcado no lo compromete: cada
          sesión se le propone.
        </p>
        {supervisores.length === 0 ? (
          <Vacio>
            Nadie está marcado todavía. Se marca desde la ficha del profesional, y solo salen los
            que están activos y con la tarjeta verificada — si marcaste a alguien y no está,
            revisa su tarjeta en Verificaciones.
          </Vacio>
        ) : (
          <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
            {supervisores.map((s) => (
              <li key={s.id} style={{ marginBottom: 4 }}>
                <a href={`/portal/profesionales/${s.id}`}>{nombrePropio(s.fullName)}</a>{' '}
                <span className="tabla__secundario">
                  {s.city} · {s.modality.toLowerCase()}
                  {s.supervisorVolunteerAt ? ` · desde el ${enBogota(s.supervisorVolunteerAt, false)}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Sesiones ───────────────────────────────────────────────────── */}
      <div className="panel">
        <h2>
          <CalendarClock size={18} style={{ verticalAlign: -3, marginRight: 6, color: '#a8731e' }} />
          Sesiones grupales
        </h2>
        <p className="panel__nota">
          Las convoca coordinación con un facilitador, una hora y el enlace de la reunión. Llegan
          con la agenda que dejaron los invitados.
        </p>

        {programadas.length === 0 && pasadas.length === 0 ? (
          <Vacio>Todavía no se ha convocado ninguna.</Vacio>
        ) : null}

        {programadas.map((s) => (
          <TarjetaSesion key={s.id} sesion={s} gestiona={gestiona} />
        ))}

        {pasadas.length > 0 ? (
          <details style={{ marginTop: 14 }}>
            <summary className="tabla__secundario" style={{ cursor: 'pointer' }}>
              Anteriores · {pasadas.length}
            </summary>
            <div style={{ marginTop: 10 }}>
              {pasadas.map((s) => (
                <TarjetaSesion key={s.id} sesion={s} gestiona={false} />
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </>
  )
}

function TarjetaSesion({ sesion, gestiona }: { sesion: Sesion; gestiona: boolean }) {
  return (
    <div
      className="panel"
      style={{
        marginTop: 12,
        borderLeft: `4px solid ${sesion.estado === 'PROGRAMADA' ? '#2b5f97' : sesion.estado === 'REALIZADA' ? '#2e7d5b' : '#94a3b8'}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div>
          <strong style={{ fontSize: '1rem' }}>{enBogota(sesion.inicio)}</strong>
          <span className="tabla__secundario" style={{ display: 'block' }}>
            Facilita {nombrePropio(sesion.facilitador.fullName)} ·{' '}
            <a href={sesion.enlace} target="_blank" rel="noopener noreferrer">
              enlace de la reunión
            </a>
          </span>
        </div>
        <Etiqueta estado={sesion.estado} texto={ESTADO_SESION[sesion.estado] ?? sesion.estado} />
      </div>

      <p className="tabla__secundario" style={{ marginTop: 8 }}>
        Invitados:{' '}
        {sesion.invitados.map((i, n) => (
          <span key={i.id}>
            {n > 0 ? ', ' : ''}
            {nombrePropio(i.nombre)}
            {i.asistio === true ? ' ✓' : i.asistio === false ? ' ✗' : ''}
          </span>
        ))}
      </p>

      {sesion.agenda ? (
        <details style={{ marginTop: 8 }}>
          <summary style={{ cursor: 'pointer', fontSize: '0.88rem' }}>Agenda de la sesión</summary>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: '0.88rem',
              margin: '8px 0 0',
              color: '#475569',
            }}
          >
            {sesion.agenda}
          </pre>
        </details>
      ) : null}

      {gestiona && sesion.estado === 'PROGRAMADA' ? (
        <AccionesSesion sesionId={sesion.id} invitados={sesion.invitados} />
      ) : null}
    </div>
  )
}
