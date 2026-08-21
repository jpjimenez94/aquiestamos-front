import Link from 'next/link'
import { notFound } from 'next/navigation'
import { portalFetch, enBogota } from '@/lib/portal'
import { Cabecera, Dato, Etiqueta, Vacio } from '../../componentes'
import { PanelEmparejamiento } from './PanelEmparejamiento'
import { MensajeAlProfesional } from './MensajeAlProfesional'

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
  asignacion: {
    id: string
    desde: string
    profesional: { id: string; nombre: string; telefono: string }
  } | null
  reportes: Reporte[]
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

  return (
    <>
      <Cabecera
        titulo={persona.fullName}
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

      {persona.asignacion ? (
        <div className="panel">
          <h2>Acompañamiento en curso</h2>
          <p className="panel__nota">
            Desde el {enBogota(persona.asignacion.desde, false)}.
          </p>
          <div className="datos">
            <Dato etiqueta="Profesional">
              <Link href={`/portal/profesionales/${persona.asignacion.profesional.id}`}>
                {persona.asignacion.profesional.nombre}
              </Link>
            </Dato>
          </div>

          <p className="panel__nota" style={{ marginTop: 18, marginBottom: 8 }}>
            Mensaje listo para mandarle. Lleva las instrucciones y el enlace por
            donde tiene que respondernos; los datos de contacto de la persona solo
            se ven al abrir ese enlace.
          </p>
          <MensajeAlProfesional
            ruta={`/portal/caso/${persona.id}`}
            telefono={persona.asignacion.profesional.telefono}
            profesional={persona.asignacion.profesional.nombre}
            ciudad={persona.city}
            prioridad={persona.priority}
            modalidad={persona.preferredModality}
            dias={persona.availableDays}
            franjas={persona.availableSlots}
          />
        </div>
      ) : (
        <PanelEmparejamiento personaId={persona.id} />
      )}

      {persona.asignacion ? (
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
