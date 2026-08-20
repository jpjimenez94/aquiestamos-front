import Link from 'next/link'
import { notFound } from 'next/navigation'
import { portalFetch, enBogota } from '@/lib/portal'
import { Cabecera, Dato, Etiqueta } from '../../componentes'
import { AccionesCita } from './AccionesCita'

type Cita = {
  id: string
  inicio: string
  fin: string
  inicioLocal: string
  duracionMinutos: number
  descansoMinutos: number
  modalidad: string
  estado: string
  estadoLegible: string
  siguientesEstados: string[]
  motivoCancelacion: string | null
  reprogramadaA: string | null
  profesional: { id: string; nombre?: string; telefono?: string }
  paciente: { id: string; nombre?: string; telefono?: string; esMenor?: boolean }
}

export default async function CitaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const respuesta = await portalFetch<Cita>(`/appointments/${id}`)

  if (!respuesta.success || !respuesta.data) notFound()
  const cita = respuesta.data

  return (
    <>
      <Cabecera
        titulo="Cita"
        descripcion={enBogota(cita.inicio)}
        acciones={
          <Link className="boton-mini" href="/portal/agenda">
            Volver a la agenda
          </Link>
        }
      />

      <div className="panel">
        <div className="datos">
          <Dato etiqueta="Estado">
            <Etiqueta estado={cita.estado} texto={cita.estadoLegible} />
          </Dato>
          <Dato etiqueta="Cuándo">
            {enBogota(cita.inicio)}
            <span className="tabla__secundario">
              {cita.duracionMinutos} minutos · {cita.descansoMinutos} de descanso después
            </span>
          </Dato>
          <Dato etiqueta="Modalidad">{cita.modalidad.toLowerCase()}</Dato>
          <Dato etiqueta="Persona acompañada">
            <Link href={`/portal/personas/${cita.paciente.id}`}>
              {cita.paciente.nombre ?? 'Ver ficha'}
            </Link>
            {cita.paciente.telefono ? (
              <span className="tabla__secundario">{cita.paciente.telefono}</span>
            ) : null}
          </Dato>
          <Dato etiqueta="Profesional">
            <Link href={`/portal/profesionales/${cita.profesional.id}`}>
              {cita.profesional.nombre ?? 'Ver ficha'}
            </Link>
          </Dato>
          {cita.motivoCancelacion ? (
            <Dato etiqueta="Motivo de cancelación">{cita.motivoCancelacion}</Dato>
          ) : null}
          {cita.reprogramadaA ? (
            <Dato etiqueta="Se movió a">
              <Link href={`/portal/agenda/${cita.reprogramadaA}`}>Ver la cita nueva</Link>
            </Dato>
          ) : null}
        </div>
      </div>

      <AccionesCita
        citaId={cita.id}
        estado={cita.estado}
        siguientesEstados={cita.siguientesEstados}
      />
    </>
  )
}
