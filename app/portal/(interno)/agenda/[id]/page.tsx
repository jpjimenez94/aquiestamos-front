import Link from 'next/link'
import { notFound } from 'next/navigation'
import { portalFetch, enBogota } from '@/lib/portal'
import { DocumentoPrivado } from '@/components/portal/DocumentoPrivado'
import { Cabecera, Dato, Etiqueta } from '../../componentes'
import { AccionesCita } from './AccionesCita'
import { MensajesFlujoCita } from './MensajesFlujoCita'
import {
  ShieldCheck,
  ShieldAlert,
  FileCheck2,
  FileClock,
  FileText,
  Video,
  Radio,
  UserCheck2,
  UserX2,
  Timer
} from 'lucide-react'

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
  meetingUrl?: string | null
  meetingProvider?: string | null
  salaTokenPaciente?: string | null
  salaTokenProfesional?: string | null
  patientFirstJoinedAt?: string | null
  professionalFirstJoinedAt?: string | null
  totalCallDurationSeconds?: number
  totalCallDurationMinutes?: number
  accessLogs?: {
    id: string
    role: string
    participantName?: string | null
    joinedAt: string
    durationSeconds: number
  }[]
  estado: string
  estadoLegible: string
  siguientesEstados: string[]
  consentSigned?: boolean
  consentSignedDocumentUrl?: string | null
  consentSignedAt?: string | null
  motivoCancelacion: string | null
  reprogramadaA: string | null
  consentimiento?: { enlace: string }
  enlaceDocumentos?: string | null
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
    canalPreferido?: string | null
  }
}

export default async function CitaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const respuesta = await portalFetch<Cita>(`/appointments/${id}`)

  if (!respuesta.success || !respuesta.data) notFound()
  const cita = respuesta.data

  const sitioUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.redaquiestamos.org').replace(/\/$/, '')
  const enlaceCasoProf = `${sitioUrl}/portal/caso/${cita.paciente.id}`
  const enlaceSalaPaciente = (cita.modalidad === 'VIRTUAL' || cita.meetingUrl) ? `${sitioUrl}/sala/${cita.salaTokenPaciente || cita.id}` : null
  const enlaceSalaProfesional = (cita.modalidad === 'VIRTUAL' || cita.meetingUrl) ? `${sitioUrl}/sala/${cita.salaTokenProfesional || cita.id}` : null

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
          {cita.meetingUrl ? (
            <Dato etiqueta="Videollamada">
              <a
                href={`/sala/${cita.salaTokenProfesional || cita.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="boton-mini"
                data-tono="principal"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontWeight: 700, padding: '5px 12px' }}
              >
                <Video size={15} />
                Unirse a la sesión virtual
              </a>
              <span className="tabla__secundario" style={{ wordBreak: 'break-all', fontSize: '0.78rem', marginTop: 4 }}>
                {cita.meetingUrl}
              </span>
            </Dato>
          ) : null}
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

      {/* Panel de Telemetría de la Sesión Virtual */}
      {cita.modalidad === 'VIRTUAL' || cita.meetingUrl ? (
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <Radio size={18} style={{ color: '#059669' }} />
              Telemetría y Asistencia a la Sala Virtual
            </h2>
            {cita.meetingUrl ? (
              <a
                href={`/sala/${cita.id}?rol=profesional`}
                target="_blank"
                rel="noopener noreferrer"
                className="boton-mini"
                data-tono="principal"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontWeight: 700 }}
              >
                <Video size={14} />
                Entrar a la sala
              </a>
            ) : null}
          </div>
          <p className="panel__nota">
            Rastreo en tiempo real de conexión a la videollamada, ingresos a la sala y tiempo efectivo en sesión.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 14 }}>
            {/* Estado Paciente */}
            <div style={{ padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <span className="tabla__secundario" style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Persona Acompañada
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                {cita.patientFirstJoinedAt ? (
                  <>
                    <UserCheck2 size={20} style={{ color: '#059669' }} />
                    <div>
                      <strong style={{ color: '#059669', fontSize: '0.92rem', display: 'block' }}>Conectó a la sala</strong>
                      <span className="tabla__secundario" style={{ fontSize: '0.78rem' }}>{enBogota(cita.patientFirstJoinedAt)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <UserX2 size={20} style={{ color: '#94a3b8' }} />
                    <div>
                      <strong style={{ color: '#64748b', fontSize: '0.92rem', display: 'block' }}>Sin conexión aún</strong>
                      <span className="tabla__secundario" style={{ fontSize: '0.78rem' }}>Aún no abre el enlace</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Estado Psicólogo */}
            <div style={{ padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <span className="tabla__secundario" style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Psicólogo(a)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                {cita.professionalFirstJoinedAt ? (
                  <>
                    <UserCheck2 size={20} style={{ color: '#059669' }} />
                    <div>
                      <strong style={{ color: '#059669', fontSize: '0.92rem', display: 'block' }}>Conectó a la sala</strong>
                      <span className="tabla__secundario" style={{ fontSize: '0.78rem' }}>{enBogota(cita.professionalFirstJoinedAt)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <UserX2 size={20} style={{ color: '#94a3b8' }} />
                    <div>
                      <strong style={{ color: '#64748b', fontSize: '0.92rem', display: 'block' }}>Sin conexión aún</strong>
                      <span className="tabla__secundario" style={{ fontSize: '0.78rem' }}>Aún no abre el enlace</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Duración de la llamada */}
            <div style={{ padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <span className="tabla__secundario" style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tiempo en Videollamada
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <Timer size={20} style={{ color: '#0284c7' }} />
                <div>
                  <strong style={{ fontSize: '1.2rem', color: '#0f172a' }}>
                    {cita.totalCallDurationMinutes ?? 0} min
                  </strong>
                  <span className="tabla__secundario" style={{ fontSize: '0.78rem', display: 'block' }}>
                    {(cita.totalCallDurationSeconds ?? 0) > 0 ? `${cita.totalCallDurationSeconds}s medidos por telemetría` : 'Esperando inicio'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Accesos si hay registros */}
          {cita.accessLogs && cita.accessLogs.length > 0 ? (
            <div style={{ marginTop: 18 }}>
              <h3 style={{ fontSize: '0.86rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 8, fontWeight: 700 }}>
                Historial de Ingresos a la Sala
              </h3>
              <div className="tabla-envoltorio">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Participante</th>
                      <th>Rol</th>
                      <th>Hora de ingreso</th>
                      <th style={{ textAlign: 'right' }}>Tiempo conectado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cita.accessLogs.map((log: any) => (
                      <tr key={log.id}>
                        <td><strong>{log.participantName || 'Participante'}</strong></td>
                        <td><span style={{ fontSize: '0.8rem', fontWeight: 600, color: log.role === 'PACIENTE' ? '#059669' : '#0284c7' }}>{log.role}</span></td>
                        <td>{enBogota(log.joinedAt)}</td>
                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          {log.durationSeconds >= 60 ? `${Math.round(log.durationSeconds / 60)} min` : `${log.durationSeconds} seg`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Plantillas de Mensajes de WhatsApp (Pasos 8, 9 y 10) */}
      <MensajesFlujoCita
        pacienteNombre={cita.paciente.nombre ?? 'Persona'}
        pacienteTelefono={cita.paciente.telefono ?? ''}
        profesionalNombre={cita.profesional.nombre ?? 'Psicólogo'}
        profesionalTelefono={cita.profesional.telefono ?? ''}
        fechaHoraBogota={enBogota(cita.inicio)}
        modalidad={cita.modalidad}
        enlaceConsentimiento={cita.consentimiento?.enlace ?? null}
        consentimientoFirmado={cita.consentSigned === true}
        canalContacto={cita.paciente.canalPreferido ?? null}
        enlaceCaso={enlaceCasoProf}
        enlaceReunion={enlaceSalaPaciente}
        enlaceReunionProfesional={enlaceSalaProfesional}
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
        consentSignedAt={cita.consentSignedAt ?? null}
        enlaceDocumentos={cita.enlaceDocumentos ?? null}
      />
    </>
  )
}
