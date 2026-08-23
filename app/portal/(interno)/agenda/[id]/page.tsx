import Link from 'next/link'
import { notFound } from 'next/navigation'
import { portalFetch, enBogota } from '@/lib/portal'
import { DocumentoPrivado } from '@/components/portal/DocumentoPrivado'
import { Cabecera, Dato, Etiqueta } from '../../componentes'
import { AccionesCita } from './AccionesCita'
import { MensajesFlujoCita } from './MensajesFlujoCita'
import { ShieldCheck, ShieldAlert, FileCheck2, FileClock, FileText } from 'lucide-react'

export const metadata = { title: 'Detalle de Cita' }

type Cita = {
  id: string
  inicio: string
  fin: string
  inicioLocal: string
  finLocal: string
  duracionMinutos: number
  descansoMinutos: number
  modalidad: string
  estado: string
  estadoLegible: string
  siguientesEstados: string[]
  consentSigned?: boolean
  consentSignedDocumentUrl?: string | null
  consentSignedAt?: string | null
  motivoCancelacion: string | null
  reprogramadaA: string | null
  consentimiento?: { enlace: string }
  profesional: {
    id: string
    nombre?: string
    telefono?: string
    professionalCardVerified?: boolean
    professionalCardNumber?: string
    professionalCardDocumentUrl?: string
  }
  paciente: {
    id: string
    nombre?: string
    telefono?: string
    city?: string
    isMinor?: boolean
  }
}

export default async function CitaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const respuesta = await portalFetch<Cita>(`/appointments/${id}`)

  if (!respuesta.success || !respuesta.data) notFound()
  const cita = respuesta.data

  return (
    <>
      <Cabecera
        titulo="Cita de Acompañamiento"
        descripcion={enBogota(cita.inicio)}
        acciones={
          <Link className="boton-mini" href="/portal/agenda">
            Volver a la agenda
          </Link>
        }
      />

      <div className="panel">
        <div className="datos">
          <Dato etiqueta="Estado de la Cita">
            <Etiqueta estado={cita.estado} texto={cita.estadoLegible} />
          </Dato>
          <Dato etiqueta="Cuándo">
            {enBogota(cita.inicio)}
            <span className="tabla__secundario">
              {cita.duracionMinutos} minutos · {cita.descansoMinutos} min de descanso posterior
            </span>
          </Dato>
          <Dato etiqueta="Modalidad">
            <span style={{ textTransform: 'capitalize' }}>{cita.modalidad.toLowerCase()}</span>
          </Dato>
          <Dato etiqueta="Persona acompañada">
            <Link href={`/portal/personas/${cita.paciente.id}`} style={{ fontWeight: 600 }}>
              {cita.paciente.nombre ?? 'Ver ficha'}
            </Link>
            {cita.paciente.telefono ? (
              <span className="tabla__secundario">{cita.paciente.telefono}</span>
            ) : null}
          </Dato>
          <Dato etiqueta="Psicólogo(a) Asignado">
            <Link href={`/portal/profesionales/${cita.profesional.id}`} style={{ fontWeight: 600 }}>
              {cita.profesional.nombre ?? 'Ver ficha'}
            </Link>
            {cita.profesional.telefono ? (
              <span className="tabla__secundario">{cita.profesional.telefono}</span>
            ) : null}
          </Dato>
          {cita.motivoCancelacion ? (
            <Dato etiqueta="Motivo de cancelación">{cita.motivoCancelacion}</Dato>
          ) : null}
          {cita.reprogramadaA ? (
            <Dato etiqueta="Se reprogramó a">
              <Link href={`/portal/agenda/${cita.reprogramadaA}`}>Ver la nueva cita reprogramada →</Link>
            </Dato>
          ) : null}
        </div>
      </div>

      {/* Panel de Validación Legal y Consentimiento (Pasos 7 y 9) */}
      <div className="panel">
        <h2>Requisitos Legales y Documentación</h2>
        <p className="panel__nota">
          Verificación obligatoria según el flujo de recepción y atención de la red.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
          {/* Tarjeta Profesional */}
          <div style={{ padding: 14, borderRadius: 8, border: '1px solid var(--color-border-default, #e2e8f0)', background: 'var(--color-bg-subtle, #f8fafc)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <strong style={{ fontSize: '0.9rem' }}>Paso 7: Tarjeta Profesional</strong>
              {cita.profesional.professionalCardVerified ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: '0.8rem', fontWeight: 600 }}>
                  <ShieldCheck size={16} /> Verificada
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#dc2626', fontSize: '0.8rem', fontWeight: 600 }}>
                  <ShieldAlert size={16} /> Sin verificar
                </span>
              )}
            </div>
            <p className="tabla__secundario" style={{ fontSize: '0.82rem', margin: '4px 0' }}>
              Psicólogo: <strong>{cita.profesional.nombre}</strong>
            </p>
            {cita.profesional.professionalCardNumber && (
              <p className="tabla__secundario" style={{ fontSize: '0.82rem', margin: '2px 0' }}>
                Nº: {cita.profesional.professionalCardNumber}
              </p>
            )}
            <div style={{ marginTop: 8 }}>
              <DocumentoPrivado
                clave={cita.profesional.professionalCardDocumentUrl}
                etiqueta="Ver soporte de tarjeta"
              />
            </div>
          </div>

          {/* Consentimiento Informado */}
          <div style={{ padding: 14, borderRadius: 8, border: '1px solid var(--color-border-default, #e2e8f0)', background: 'var(--color-bg-subtle, #f8fafc)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <strong style={{ fontSize: '0.9rem' }}>Paso 9: Consentimiento Informado</strong>
              {cita.consentSigned ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: '0.8rem', fontWeight: 600 }}>
                  <FileCheck2 size={16} /> Firmado Recibido
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#d97706', fontSize: '0.8rem', fontWeight: 600 }}>
                  <FileClock size={16} /> Pendiente
                </span>
              )}
            </div>
            <p className="tabla__secundario" style={{ fontSize: '0.82rem', margin: '4px 0' }}>
              Requisito previo para dar inicio a la sesión con {cita.paciente.nombre}.
            </p>
            <div style={{ marginTop: 8 }}>
              <DocumentoPrivado
                clave={cita.consentSignedDocumentUrl}
                etiqueta="Ver documento firmado"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plantillas de Mensajes de WhatsApp (Pasos 8 y 9) */}
      <MensajesFlujoCita
        pacienteNombre={cita.paciente.nombre ?? 'Persona'}
        pacienteTelefono={cita.paciente.telefono ?? ''}
        profesionalNombre={cita.profesional.nombre ?? 'Psicólogo'}
        fechaHoraBogota={enBogota(cita.inicio)}
        modalidad={cita.modalidad}
        enlaceConsentimiento={cita.consentimiento?.enlace ?? null}
        consentimientoFirmado={cita.consentSigned === true}
      />

      {/* Acciones de la Cita */}
      <AccionesCita
        citaId={cita.id}
        estado={cita.estado}
        siguientesEstados={cita.siguientesEstados}
        profesionalId={cita.profesional.id}
        profesionalNombre={cita.profesional.nombre ?? ''}
        profesionalVerificado={cita.profesional.professionalCardVerified ?? false}
        profesionalTarjetaNumero={cita.profesional.professionalCardNumber ?? ''}
        profesionalDocumentoUrl={cita.profesional.professionalCardDocumentUrl ?? ''}
        pacienteNombre={cita.paciente.nombre ?? ''}
        modalidad={cita.modalidad}
        consentSigned={cita.consentSigned ?? false}
        consentSignedDocumentUrl={cita.consentSignedDocumentUrl ?? ''}
      />
    </>
  )
}
