import Link from 'next/link'
import { notFound } from 'next/navigation'
import { portalFetch, enBogota, usuarioActual, puede, traerPlantillas } from '@/lib/portal'

import { Cabecera, Dato, Etiqueta, Vacio } from '../../componentes'
import { IndicadorDePasos } from '@/components/portal/IndicadorDePasos'
import { pasoDelCaso, armarHechos, proximaYUltima } from '@/lib/pasosDelCaso'
import { seguimientoPendiente } from '@/lib/seguimiento'
import { PanelEmparejamiento } from './PanelEmparejamiento'
import { PanelDelCaso, type Asignacion } from './PanelDelCaso'
import { BotonCerrarCaso } from './BotonCerrarCaso'
import { BotonEncuesta } from './BotonEncuesta'
import { BotonNuevaSesion } from './BotonNuevaSesion'
import { BotonPedirFeedback } from './BotonPedirFeedback'
import { BotonEliminarPersona } from '../BotonEliminarPersona'
import { ModalNotasSeguimiento, type NotaSeguimiento } from '../ModalNotasSeguimiento'
import { nombrePropio } from '@/lib/nombre'

/**
 * Los estados en los que la negociación sigue abierta. Es el reflejo de
 * `VIVOS` en `back/src/services/assignmentState.service.js`, que es la fuente
 * de verdad: si allá cambia, aquí también.
 */
const VIVOS = ['PROPUESTA', 'ACEPTADA', 'ACTIVA']

type FeedbackDeLaPersona = {
  id: string
  howFelt: 'MUY_BIEN' | 'BIEN' | 'REGULAR' | 'INCOMODO'
  howFeltLegible: string
  respectfulTreatment?: string | null
  respectfulTreatmentLegible?: string | null
  gotTools?: string | null
  gotToolsLegible?: string | null
  sessionQuality?: string | null
  sessionQualityLegible?: string | null
  wantsToContinue: 'SI_MISMO' | 'CAMBIAR' | 'SUFICIENTE'
  wantsToContinueLegible: string
  comment?: string | null
  profesional?: string | null
  createdAt: string
}

type Persona = {
  id: string
  fullName: string
  phone: string
  email?: string | null
  city: string
  isMinor: boolean
  forWhom?: string | null
  contactName?: string | null
  relationship?: string | null
  preferredContact: string | null
  preferredModality: string | null
  availableDays: string[]
  availableSlots: string[]
  status: string
  estadoLegible: string
  priority: string
  prioridadLegible: string
  createdAt: string
  diasEsperando: number
  asignacion: Asignacion | null
  reportes: Reporte[]
  feedbacks?: FeedbackDeLaPersona[]
  enlaceFeedback?: string | null
  /** Enlace con el que la persona agenda sus propias sesiones. */
  enlaceAgenda?: string | null
  citas: CitaDeLaPersona[]
  notasSeguimiento?: NotaSeguimiento[]
  totalNotas?: number
  ultimaNota?: {
    nota: string
    autor: string
    fecha: string
  } | null
  encuesta: {
    enlace: string
    respondida: boolean
    ayudo: 'SI' | 'ALGO' | 'NO' | null
    recomendaria: boolean | null
    comentario: string | null
  } | null
}

type CitaDeLaPersona = {
  id: string
  inicio: string
  inicioLocal: string
  modalidad: string
  estado: string
  estadoLegible: string
  consentSigned?: boolean
  // Llaves de sala firmadas, una por rol. Las emite el backend; son lo que va
  // al mensaje de WhatsApp, en vez del UUID de la cita.
  salaTokenPaciente?: string | null
  salaTokenProfesional?: string | null
  profesional: { id: string; nombre?: string }
  /** La nota del profesional que cerró ESTA sesión, si ya la escribió. */
  reporteId?: string | null
}

type Reporte = {
  id: string
  outcome: string
  resultadoLegible: string
  queSigueLegible?: string | null
  modality: string | null
  meetsAt: string | null
  contactDifficulties: string | null
  notes: string | null
  reportedByEmail: string
  profesional: string | null
  createdAt: string
  /** La sesión que esta nota cierra. Nulo si fue un contacto sin sesión. */
  citaInicio?: string | null
  citaId?: string | null
}

const DIA: Record<string, string> = {
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles', JUEVES: 'Jueves',
  VIERNES: 'Viernes', SABADO: 'Sábado', DOMINGO: 'Domingo',
}
const FRANJA: Record<string, string> = {
  MANANA: 'Mañana', TARDE: 'Tarde', NOCHE: 'Noche',
}

export default async function PersonaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Las plantillas viajan con la ficha: los mensajes que se copian desde esta
  // pantalla salen del texto que la coordinación editó en Parametrización, no
  // de una copia escrita en el código. Se piden aquí una sola vez, para que no
  // haya una petición por cada botón.
  const [respuesta, usuario, plantillas] = await Promise.all([
    portalFetch<Persona>(`/patients/${id}`),
    usuarioActual(),
    traerPlantillas(),
  ])

  if (!respuesta.success || !respuesta.data) notFound()
  const persona = respuesta.data

  // El enlace del caso sale de la configuración del sitio, no del navegador de
  // quien coordina: si sale de ahí, quien trabaja en local le manda a un
  // profesional un enlace a localhost. Ya pasó con el del tamizaje.
  const enlaceDelSitio = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')

  return (
    <>
      <Cabecera
        titulo={nombrePropio(persona.fullName)}
        descripcion={`${persona.city} · lleva ${persona.diasEsperando} ${persona.diasEsperando === 1 ? 'día' : 'días'} en la red · todo su acompañamiento, aquí`}
        acciones={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {puede(usuario, 'paciente:borrar') ? (
              <BotonEliminarPersona
                personaId={persona.id}
                personaNombre={persona.fullName}
                redireccionarA="/portal/personas"
                variante="boton"
              />
            ) : null}
            <Link className="boton-mini" href="/portal/personas">
              Volver
            </Link>
          </div>
        }
      />

      {/*
        El camino completo, con el paso actual encendido. La misma tira está en
        el detalle de la cita: la ficha y la cita son dos ventanas al mismo
        proceso, y esto es lo que lo hace visible.
      */}
      {(() => {
        const citas = persona.citas ?? []
        // La misma regla que el panel del caso de abajo. Eran dos cálculos de
        // «próxima» en este archivo, y no coincidían.
        const { proxima, ultima } = proximaYUltima(citas)

        return (
          <IndicadorDePasos
            actual={pasoDelCaso({
              estadoPersona: persona.status,
              estadoAsignacion: persona.asignacion?.estado,
              citas: citas.map((c) => ({ startsAt: c.inicio, status: c.estado })),
            })}
            hechos={armarHechos({
              recibida: enBogota(persona.createdAt),
              prioridad: persona.prioridadLegible,
              admision: persona.estadoLegible,
              asignacion: persona.asignacion
                ? {
                    profesional: persona.asignacion.profesional.nombre,
                    desde: enBogota(persona.asignacion.desde, false),
                    estadoLegible: persona.asignacion.estadoLegible,
                    motivo: persona.asignacion.motivoRechazo,
                  }
                : null,
              eleccion: proxima ? { cuando: enBogota(proxima.inicio) } : null,
              preparacion: proxima
                ? { confirmada: proxima.estado === 'CONFIRMADA', consentimiento: proxima.consentSigned === true }
                : null,
              sesion: ultima ? { cuando: enBogota(ultima.inicio), estadoLegible: ultima.estadoLegible } : null,
              seguimiento: {
                reportes: persona.reportes?.length ?? 0,
                notas: persona.totalNotas ?? 0,
                encuestaRespondida: persona.encuesta?.respondida === true,
                cerrado: persona.status === 'CERRADO',
              },
            })}
            enlaces={
              proxima
                ? {
                    5: { href: `/portal/agenda/${proxima.id}`, texto: 'Gestionar esta cita →' },
                    6: { href: `/portal/agenda/${(ultima ?? proxima).id}`, texto: 'Ver la cita →' },
                  }
                : ultima
                  ? { 6: { href: `/portal/agenda/${ultima.id}`, texto: 'Ver la cita →' } }
                  : undefined
            }
          />
        )
      })()}

      <div className="panel">
        <div className="datos">
          <Dato etiqueta="Estado">
            <Etiqueta estado={persona.status} texto={persona.estadoLegible} />
          </Dato>
          <Dato etiqueta="Teléfono">{persona.phone}</Dato>
          <Dato etiqueta="Prefiere que la contacten por">
            {persona.preferredContact?.toLowerCase() ?? '—'}
          </Dato>
          <Dato etiqueta="Modalidad que prefiere">
            {persona.preferredModality?.toLowerCase() ?? '—'}
          </Dato>
          <Dato etiqueta="Días que puede">
            {persona.availableDays?.length
              ? persona.availableDays.map((d) => DIA[d] ?? d).join(', ')
              : '—'}
          </Dato>
          <Dato etiqueta="Franjas">
            {persona.availableSlots?.length
              ? persona.availableSlots.map((f) => FRANJA[f] ?? f).join(', ')
              : '—'}
          </Dato>
          {persona.isMinor ? (
            <Dato etiqueta="Menor de edad">
              Sí{persona.contactName ? ` · contacto: ${persona.contactName}` : ''}
              {persona.relationship ? ` (${persona.relationship})` : ''}
            </Dato>
          ) : null}
          <Dato etiqueta="Prioridad">
            <Etiqueta estado={persona.priority} texto={persona.prioridadLegible} />
          </Dato>
          <Dato etiqueta="Recibida">{enBogota(persona.createdAt)}</Dato>
          <Dato etiqueta="Notas de seguimiento">
            <ModalNotasSeguimiento
              personaId={persona.id}
              personaNombre={persona.fullName}
              notasIniciales={persona.notasSeguimiento}
              totalNotas={persona.totalNotas}
              ultimaNota={persona.ultimaNota}
            />
          </Dato>
        </div>
      </div>

      {persona.asignacion && VIVOS.includes(persona.asignacion.estado) ? (
        <PanelDelCaso
          persona={persona}
          asignacion={persona.asignacion}
          enlaceCaso={`${enlaceDelSitio}/portal/caso/${persona.id}`}
          enlaceAgenda={persona.enlaceAgenda}
          plantillas={plantillas}
          queToca={(() => {
            // La misma regla que enciende la lista de personas. La cita que
            // manda es la próxima si la hay; si no, la última.
            const { proxima, ultima } = proximaYUltima(persona.citas ?? [])
            const cita = proxima ?? ultima
            return seguimientoPendiente({
              estadoPersona: persona.status,
              estadoAsignacion: persona.asignacion?.estado,
              diasEsperando: persona.diasEsperando,
              cita: cita ? { inicio: cita.inicio, estado: cita.estado } : null,
              hayReporte: Boolean(ultima?.reporteId),
              asignadaDesde: persona.asignacion?.desde,
            })
          })()}
          ultimaCita={(() => {
            const { ultima } = proximaYUltima(persona.citas ?? [])
            return ultima ? { id: ultima.id, inicio: ultima.inicio, estado: ultima.estado } : null
          })()}
          proximaCita={(() => {
            /*
              Decía «Vienen de la más próxima a la más lejana» y hacía find().
              Venían al revés —de la más antigua— y una sesión ya pasada que
              nadie marcó como realizada sigue CONFIRMADA: salía «Próxima
              sesión: 27/08» el 2 de septiembre. Próxima es por delante y viva;
              lo decide la misma regla que el paso a paso.
            */
            const abierta = proximaYUltima(persona.citas ?? []).proxima
            return abierta
              ? {
                  id: abierta.id,
                  cuando: enBogota(abierta.inicio),
                  modalidad: abierta.modalidad,
                  salaTokenPaciente: abierta.salaTokenPaciente,
                  consentSigned: abierta.consentSigned,
                }
              : null
          })()}
        />
      ) : persona.status === 'CERRADO' ? (
        /* Cerrado no es «sin asignar»: ofrecer candidatos aquí invitaría a
           reabrir por accidente. Si de verdad hay que retomar, primero se
           reabre a conciencia proponiendo una asignación nueva desde cero. */
        <div className="panel">
          <h2>Caso cerrado</h2>
          <p className="panel__nota">
            El acompañamiento terminó; el motivo quedó en la auditoría. Si esta persona vuelve a
            necesitar la red, lo indicado es una solicitud nueva.
          </p>
          {persona.encuesta?.respondida ? (
            <div className="caso-horarios" style={{ marginTop: 12 }}>
              <strong>Lo que respondió en la encuesta:</strong>
              <span>
                {persona.encuesta.ayudo === 'SI'
                  ? 'Le sirvió'
                  : persona.encuesta.ayudo === 'ALGO'
                    ? 'Algo le sirvió'
                    : 'No le sirvió'}
                {' · '}
                {persona.encuesta.recomendaria ? 'lo recomendaría' : 'no lo recomendaría'}
              </span>
              {persona.encuesta.comentario ? <em>{persona.encuesta.comentario}</em> : null}
            </div>
          ) : persona.encuesta ? (
            <BotonEncuesta
              persona={persona.fullName}
              telefono={persona.phone}
              enlace={persona.encuesta.enlace}
            />
          ) : null}
        </div>
      ) : (
        <PanelEmparejamiento personaId={persona.id} />
      )}

      {persona.citas?.length ? (
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ margin: 0 }}>Citas</h2>
            {persona.asignacion?.estado === 'ACTIVA' && persona.asignacion.profesional ? (
              <BotonNuevaSesion
                persona={persona}
                profesional={persona.asignacion.profesional}
                asignacionId={persona.asignacion.id}
                enlaceCaso={`${enlaceDelSitio}/portal/caso/${persona.id}`}
                texto="+ Agendar nueva sesión"
              />
            ) : null}
          </div>
          <p className="panel__nota">
            Lo acordado entre la persona y quien la acompaña. El detalle de cada una vive en la
            agenda.
          </p>
          <div className="tabla-envoltorio">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Cuándo</th>
                  <th>Modalidad</th>
                  <th>Profesional</th>
                  <th>Estado</th>
                  <th>Consentimiento</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {persona.citas.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/portal/agenda/${c.id}`} className="tabla__principal">
                        {enBogota(c.inicio)}
                      </Link>
                    </td>
                    <td>{c.modalidad === 'PRESENCIAL' ? 'Presencial' : 'Virtual'}</td>
                    <td>{nombrePropio(c.profesional?.nombre) || '—'}</td>
                    <td>
                      <Etiqueta estado={c.estado} texto={c.estadoLegible} />
                    </td>
                    <td>{c.consentSigned ? 'Firmado' : 'Pendiente'}</td>
                    <td>
                      {/*
                        Tres citas en la tabla y una sola nota abajo, sin
                        decir de cuál era: quien coordina tenía que adivinar
                        por la fecha. Ahora cada fila dice si tiene nota y
                        salta a ella; y si no la tiene, dice por qué.
                      */}
                      {c.reporteId ? (
                        <a href={`#reporte-${c.reporteId}`} className="tabla__principal">
                          Ver nota
                        </a>
                      ) : c.estado === 'CANCELADA' || c.estado === 'REPROGRAMADA' ? (
                        <span className="tabla__secundario">—</span>
                      ) : new Date(c.inicio).getTime() > Date.now() ? (
                        <span className="tabla__secundario">Aún no ocurre</span>
                      ) : (
                        <span className="tabla__secundario" style={{ color: '#b45309' }}>
                          Sin reportar
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {persona.asignacion?.estado === 'ACTIVA' ? (
        <div className="panel">
          {/*
            El botón de agendar directo que vivía aquí se quita: es el mismo
            que ya arregla «Qué toca ahora», más arriba en esta misma ficha —
            ese ahora manda el enlace para que ELLA elija, en vez de que
            coordinación escoja la hora por su cuenta. Tenerlo dos veces, uno
            arreglado y otro no, es peor que tenerlo una sola vez.
          */}
          <h2 style={{ margin: 0 }}>Qué ha reportado quien acompaña</h2>
          <p className="panel__nota">
            Lo que respondió desde su enlace de acceso. Se va sumando: la entrada de
            arriba es la más reciente.
          </p>
          {persona.reportes?.length ? (
            <ul className="bitacora">
              {persona.reportes.map((r) => (
                <li key={r.id} id={`reporte-${r.id}`} className="bitacora__entrada">
                  <div className="bitacora__cabecera">
                    <strong>
                      {r.resultadoLegible}
                      {r.queSigueLegible ? ` · ${r.queSigueLegible}` : ''}
                    </strong>
                    <span className="bitacora__fecha">{enBogota(r.createdAt)}</span>
                  </div>
                  {r.citaInicio ? (
                    <p className="bitacora__dato">
                      <em>Sobre la sesión del</em>{' '}
                      {r.citaId ? (
                        <Link href={`/portal/agenda/${r.citaId}`}>{enBogota(r.citaInicio)}</Link>
                      ) : (
                        enBogota(r.citaInicio)
                      )}
                    </p>
                  ) : null}
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
                  <p className="bitacora__dato">
                    <em>Lo reportó:</em> {r.profesional ?? r.reportedByEmail}
                  </p>

                  {persona.asignacion?.profesional && (r.outcome === 'CITA_ACORDADA' || r.meetsAt) ? (
                    <div style={{ marginTop: 6 }}>
                      <BotonNuevaSesion
                        persona={persona}
                        profesional={persona.asignacion.profesional}
                        asignacionId={persona.asignacion.id}
                        fechaInicial={r.meetsAt}
                        modalidadInicial={r.modality}
                        enlaceCaso={`${enlaceDelSitio}/portal/caso/${persona.id}`}
                        texto={`Agendar cita acordada del reporte ${r.meetsAt ? `(${enBogota(r.meetsAt)})` : ''}`}
                        variante="destacado"
                      />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <Vacio>
              Todavía no ha respondido. Si el caso lleva días así, vale la pena
              escribirle.
            </Vacio>
          )}

          {/* Cerrar es la decisión que se toma DESPUÉS de leer el reporte, y
              el botón vive donde está la lectura. Sin reporte, no hay botón:
              cerrar sin haber leído al profesional es cerrar a ciegas. */}
          {persona.reportes?.length && persona.asignacion ? (
            <BotonCerrarCaso asignacionId={persona.asignacion.id} />
          ) : null}
        </div>
      ) : null}

      {persona.asignacion || (persona.feedbacks && persona.feedbacks.length > 0) ? (
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ margin: 0 }}>Qué ha compartido la persona acompañada</h2>
          </div>
          <p className="panel__nota">
            Retroalimentación confidencial sobre sus sesiones. Solo la lee el equipo de coordinación de la red.
          </p>

          {persona.feedbacks && persona.feedbacks.length > 0 ? (
            <ul className="bitacora">
              {persona.feedbacks.map((f) => (
                <li key={f.id} className="bitacora__entrada">
                  <div className="bitacora__cabecera">
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background:
                            f.howFelt === 'MUY_BIEN' || f.howFelt === 'BIEN'
                              ? '#ecfdf5'
                              : f.howFelt === 'REGULAR'
                              ? '#fefce8'
                              : '#fef2f2',
                          color:
                            f.howFelt === 'MUY_BIEN' || f.howFelt === 'BIEN'
                              ? '#065f46'
                              : f.howFelt === 'REGULAR'
                              ? '#854d0e'
                              : '#991b1b',
                          border: `1px solid ${
                            f.howFelt === 'MUY_BIEN' || f.howFelt === 'BIEN'
                              ? '#a7f3d0'
                              : f.howFelt === 'REGULAR'
                              ? '#fde047'
                              : '#fca5a5'
                          }`,
                        }}
                      >
                        {f.howFeltLegible}
                      </span>

                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: f.wantsToContinue === 'CAMBIAR' ? '#fef2f2' : '#f8fafc',
                          color: f.wantsToContinue === 'CAMBIAR' ? '#b91c1c' : '#334155',
                          border: `1px solid ${f.wantsToContinue === 'CAMBIAR' ? '#fecaca' : '#cbd5e1'}`,
                        }}
                      >
                        {f.wantsToContinueLegible}
                      </span>
                    </div>
                    <span className="bitacora__fecha">{enBogota(f.createdAt)}</span>
                  </div>

                  {f.profesional ? (
                    <p className="bitacora__dato" style={{ marginTop: 6 }}>
                      <em>Profesional:</em> {f.profesional}
                    </p>
                  ) : null}

                  {f.respectfulTreatmentLegible ? (
                    <p className="bitacora__dato" style={{ marginTop: 2 }}>
                      <em>Trato y puntualidad:</em> {f.respectfulTreatmentLegible}
                    </p>
                  ) : null}

                  {f.gotToolsLegible ? (
                    <p className="bitacora__dato" style={{ marginTop: 2 }}>
                      <em>Utilidad y herramientas:</em> {f.gotToolsLegible}
                    </p>
                  ) : null}

                  {f.sessionQualityLegible ? (
                    <p className="bitacora__dato" style={{ marginTop: 2 }}>
                      <em>Calidad de conexión / espacio:</em> {f.sessionQualityLegible}
                    </p>
                  ) : null}

                  {f.comment ? (
                    <p className="bitacora__dato" style={{ marginTop: 4 }}>
                      <em>Comentario:</em> &ldquo;{f.comment}&rdquo;
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <Vacio>
              La persona aún no ha enviado retroalimentación sobre sus sesiones.
            </Vacio>
          )}

          {persona.enlaceFeedback ? (
            <BotonPedirFeedback
              persona={persona.fullName}
              telefono={persona.phone}
              profesional={persona.asignacion?.profesional?.nombre}
              enlace={persona.enlaceFeedback}
            />
          ) : null}
        </div>
      ) : null}
    </>
  )
}
