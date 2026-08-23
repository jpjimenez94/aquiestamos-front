import Link from 'next/link'
import { notFound } from 'next/navigation'
import { portalFetch, enBogota } from '@/lib/portal'
import { Cabecera, Dato, Etiqueta, Vacio } from '../../componentes'
import { PanelEmparejamiento } from './PanelEmparejamiento'
import { PanelDelCaso, type Asignacion } from './PanelDelCaso'
import { nombrePropio } from '@/lib/nombre'

/**
 * Los estados en los que la negociación sigue abierta. Es el reflejo de
 * `VIVOS` en `back/src/services/assignmentState.service.js`, que es la fuente
 * de verdad: si allá cambia, aquí también.
 */
const VIVOS = ['PROPUESTA', 'ACEPTADA', 'ACTIVA']

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
  citas: CitaDeLaPersona[]
}

type CitaDeLaPersona = {
  id: string
  inicio: string
  inicioLocal: string
  modalidad: string
  estado: string
  estadoLegible: string
  consentSigned?: boolean
  profesional: { id: string; nombre?: string }
}

type Reporte = {
  id: string
  outcome: string
  resultadoLegible: string
  modality: string | null
  meetsAt: string | null
  contactDifficulties: string | null
  notes: string | null
  reportedByEmail: string
  profesional: string | null
  createdAt: string
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
  const respuesta = await portalFetch<Persona>(`/patients/${id}`)

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
        descripcion={`${persona.city} · lleva ${persona.diasEsperando} ${persona.diasEsperando === 1 ? 'día' : 'días'} en la red`}
        acciones={
          <Link className="boton-mini" href="/portal/personas">
            Volver
          </Link>
        }
      />

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
        </div>
      </div>

      {persona.asignacion && VIVOS.includes(persona.asignacion.estado) ? (
        <PanelDelCaso
          persona={persona}
          asignacion={persona.asignacion}
          enlaceCaso={`${enlaceDelSitio}/portal/caso/${persona.id}`}
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
        </div>
      ) : (
        <PanelEmparejamiento personaId={persona.id} />
      )}

      {persona.citas?.length ? (
        <div className="panel">
          <h2>Citas</h2>
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
                </tr>
              </thead>
              <tbody>
                {persona.citas.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/portal/agenda/${c.id}`} className="tabla__principal">
                        {c.inicioLocal || enBogota(c.inicio)}
                      </Link>
                    </td>
                    <td>{c.modalidad === 'PRESENCIAL' ? 'Presencial' : 'Virtual'}</td>
                    <td>{nombrePropio(c.profesional?.nombre) || '—'}</td>
                    <td>
                      <Etiqueta estado={c.estado} texto={c.estadoLegible} />
                    </td>
                    <td>{c.consentSigned ? 'Firmado' : 'Pendiente'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {persona.asignacion?.estado === 'ACTIVA' ? (
        <div className="panel">
          <h2>Qué ha reportado quien acompaña</h2>
          <p className="panel__nota">
            Lo que respondió desde su enlace de acceso. Se va sumando: la entrada de
            arriba es la más reciente.
          </p>
          {persona.reportes?.length ? (
            <ul className="bitacora">
              {persona.reportes.map((r) => (
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
                  <p className="bitacora__dato">
                    <em>Lo reportó:</em> {r.profesional ?? r.reportedByEmail}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <Vacio>
              Todavía no ha respondido. Si el caso lleva días así, vale la pena
              escribirle.
            </Vacio>
          )}
        </div>
      ) : null}
    </>
  )
}
