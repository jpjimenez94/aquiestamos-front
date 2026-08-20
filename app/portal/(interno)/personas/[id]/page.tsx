import Link from 'next/link'
import { notFound } from 'next/navigation'
import { portalFetch, enBogota } from '@/lib/portal'
import { Cabecera, Dato, Etiqueta, Vacio } from '../../componentes'
import { PanelEmparejamiento } from './PanelEmparejamiento'

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
  createdAt: string
  diasEsperando: number
  asignacion: {
    id: string
    desde: string
    profesional: { id: string; nombre: string }
  } | null
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
        </div>
      ) : (
        <PanelEmparejamiento personaId={persona.id} />
      )}
    </>
  )
}
