import { IndicadorDePasos } from '@/components/portal/IndicadorDePasos'
import { pasoDeLaCita, armarHechos, sesionTerminada } from '@/lib/pasosDelCaso'
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
  Timer,
  CheckCircle2,
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
  pacienteEnVivo?: boolean
  profesionalEnVivo?: boolean
  llamadaEnVivo?: boolean
  ambosEnVivo?: boolean
  pacienteSegundosDesdePing?: number | null
  profesionalSegundosDesdePing?: number | null
  pacienteUltimoPing?: string | null
  profesionalUltimoPing?: string | null
  accessLogs?: {
    id: string
    role: string
    participantName?: string | null
    joinedAt: string
    lastPingAt?: string
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
    /** Si el sistema pudo avisarle solo. Dar correo es opcional al pedir ayuda. */
    tieneCorreo?: boolean
  }
}

export default async function CitaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const respuesta = await portalFetch<Cita>(`/appointments/${id}`)

  if (!respuesta.success || !respuesta.data) notFound()
  const cita = respuesta.data

  const sitioUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.redaquiestamos.org').replace(/\/$/, '')
  const enlaceCasoProf = `${sitioUrl}/portal/caso/${cita.paciente.id}`

  // «Terminó» lo dicen el estado de la cita y su hora de fin, no la falta de
  // latidos: un latido que no llega puede ser la pestaña de fondo o la red.
  const terminada = sesionTerminada({ estado: cita.estado, fin: cita.fin })
  // Estos enlaces se copian y se mandan por WhatsApp, así que llevan la llave
  // firmada que emite el backend: trae el rol sellado dentro y no se puede
  // fabricar desde fuera. Se cae al UUID solo si el backend no mandó token
  // —una cita vieja—, que es lo que `SALA_ACEPTA_UUID` mantiene vivo mientras
  // pasan las citas agendadas antes del cambio.
  const salaDe = (token?: string | null) =>
    cita.modalidad === 'VIRTUAL' || cita.meetingUrl
      ? `${sitioUrl}/sala/${token || cita.id}`
      : null

  const enlaceSalaPaciente = salaDe(cita.salaTokenPaciente)
  const enlaceSalaProfesional = salaDe(cita.salaTokenProfesional)

  return (
    <>
      <Cabecera
        titulo="Cita de Acompañamiento"
        descripcion={`Una sesión del acompañamiento de ${cita.paciente.nombre ?? 'la persona'} · ${enBogota(cita.inicio)}`}
        acciones={
          <Link className="boton-mini" href="/portal/agenda">
            Volver a la agenda
          </Link>
        }
      />

      {/* La misma tira que en la ficha de la persona: mismo proceso, otra ventana.
          Esta vista sabe de su sesión; los pasos del caso los enlaza a la ficha
          en vez de callarlos. */}
      <IndicadorDePasos
        actual={pasoDeLaCita({ inicio: cita.inicio, estado: cita.estado })}
        hechos={armarHechos({
          asignacion: cita.profesional.nombre ? { profesional: cita.profesional.nombre } : null,
          eleccion: { cuando: enBogota(cita.inicio) },
          preparacion: {
            confirmada: cita.estado === 'CONFIRMADA',
            consentimiento: cita.consentSigned === true,
          },
          sesion: { cuando: enBogota(cita.inicio), estadoLegible: cita.estadoLegible },
        })}
        enlaces={{
          1: { href: `/portal/personas/${cita.paciente.id}`, texto: 'Ver en la ficha →' },
          2: { href: `/portal/personas/${cita.paciente.id}`, texto: 'Ver en la ficha →' },
          3: { href: `/portal/personas/${cita.paciente.id}`, texto: 'Ver en la ficha →' },
          7: { href: `/portal/personas/${cita.paciente.id}`, texto: 'Ver en la ficha →' },
        }}
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
          {/* La condición era `cita.meetingUrl`, que la vista rellenaba con una
              URL inventada. Ahora esa vista dice la verdad (null si no hay
              ninguna guardada), así que el criterio pasa a ser el mismo que en
              el resto de la página: si es virtual, hay sala. */}
          {cita.modalidad === 'VIRTUAL' || cita.meetingUrl ? (
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
              {/* Se muestra el enlace de la sala, que es el que hay que
                  copiar y mandar. Antes se mostraba la URL cruda de Jitsi, que
                  llevaba a una sala distinta de la real. */}
              <span className="tabla__secundario" style={{ wordBreak: 'break-all', fontSize: '0.78rem', marginTop: 4 }}>
                {enlaceSalaProfesional ?? cita.meetingUrl}
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

      {/* Verificaciones que condicionan la sesión: la tarjeta es del profesional (viene de su ficha), el consentimiento es de esta persona. Sin números de manual: el paso global lo dice la tira de arriba. */}
      <div className="panel">
        <h2>Requisitos Legales y Documentación</h2>
        <p className="panel__nota">
          Lo que tiene que estar en regla antes de la sesión. La tarjeta se verifica una vez por profesional; el consentimiento, una vez por persona.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
          {/* Tarjeta Profesional */}
          <div style={{ padding: 14, borderRadius: 8, border: '1px solid var(--color-border-default, #e2e8f0)', background: 'var(--color-bg-subtle, #f8fafc)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <strong style={{ fontSize: '0.9rem' }}>Tarjeta profesional</strong>
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
              <strong style={{ fontSize: '0.9rem' }}>Consentimiento informado</strong>
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
            {cita.modalidad === 'VIRTUAL' || cita.meetingUrl ? (
              <a
                // El rol ya va sellado dentro del token; el `?rol=` solo hace
                // falta para los enlaces viejos que aún son un UUID crudo.
                href={
                  cita.salaTokenProfesional
                    ? `/sala/${cita.salaTokenProfesional}`
                    : `/sala/${cita.id}?rol=profesional`
                }
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

          {/* Banner de Supervisión en Vivo */}
          {cita.llamadaEnVivo ? (
            <div
              style={{
                background: cita.ambosEnVivo ? '#ecfdf5' : '#fffbeb',
                border: cita.ambosEnVivo ? '1.5px solid #a7f3d0' : '1.5px solid #fde68a',
                borderRadius: 12,
                padding: '14px 18px',
                marginTop: 14,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: cita.ambosEnVivo ? '#10b981' : '#f59e0b',
                    boxShadow: cita.ambosEnVivo ? '0 0 0 4px rgba(16,185,129,0.2)' : '0 0 0 4px rgba(245,158,11,0.2)',
                  }}
                />
                <div>
                  <strong style={{ color: cita.ambosEnVivo ? '#065f46' : '#92400e', fontSize: '0.95rem', display: 'block' }}>
                    {cita.ambosEnVivo
                      ? '🟢 Sesión en curso activa — Ambos participantes están conectados en vivo'
                      : cita.pacienteEnVivo
                      ? `🟡 Persona acompañada (${cita.paciente.nombre ?? 'Paciente'}) está en la sala esperando al profesional`
                      : `🟡 Psicólogo(a) (${cita.profesional.nombre ?? 'Profesional'}) está en la sala esperando a la persona`}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: cita.ambosEnVivo ? '#047857' : '#b45309' }}>
                    Supervisor en tiempo real: latidos activos hace {Math.min(cita.pacienteSegundosDesdePing ?? 999, cita.profesionalSegundosDesdePing ?? 999)} segundos.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    background: cita.ambosEnVivo ? '#d1fae5' : '#fef3c7',
                    color: cita.ambosEnVivo ? '#065f46' : '#92400e',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: '0.82rem',
                    fontWeight: 800,
                  }}
                >
                  ⏱️ {cita.totalCallDurationMinutes ?? 0} min en sesión
                </span>
              </div>
            </div>
          ) : (cita.totalCallDurationSeconds ?? 0) > 0 && terminada ? (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '10px 16px',
                marginTop: 14,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#475569',
                fontSize: '0.86rem',
              }}
            >
              <CheckCircle2 size={16} style={{ color: '#059669' }} />
              <span>
                <strong>Sesión virtual finalizada.</strong> Tiempo total efectivo registrado:{' '}
                <strong>{cita.totalCallDurationMinutes} min ({cita.totalCallDurationSeconds}s)</strong>.
              </span>
            </div>
          ) : (cita.totalCallDurationSeconds ?? 0) > 0 ? (
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 10,
                padding: '10px 16px',
                marginTop: 14,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#92400e',
                fontSize: '0.86rem',
              }}
            >
              <Timer size={16} style={{ color: '#d97706' }} />
              <span>
                <strong>Nadie está latiendo en este momento.</strong> Se llevan{' '}
                <strong>{cita.totalCallDurationMinutes} min ({cita.totalCallDurationSeconds}s)</strong>{' '}
                registrados. Puede que hayan salido un momento o que la pestaña de la sala se
                cerrara: la sesión no se da por terminada hasta que pase su hora de fin.
              </span>
            </div>
          ) : null}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 14 }}>
            {/* Estado Paciente */}
            <div style={{ padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', background: cita.pacienteEnVivo ? '#f0fdf4' : '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="tabla__secundario" style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Persona Acompañada
                </span>
                {cita.pacienteEnVivo ? (
                  <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                    En vivo ahora
                  </span>
                ) : null}
              </div>
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
            <div style={{ padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', background: cita.profesionalEnVivo ? '#f0fdf4' : '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="tabla__secundario" style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Psicólogo(a)
                </span>
                {cita.profesionalEnVivo ? (
                  <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                    En vivo ahora
                  </span>
                ) : null}
              </div>
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

      {/* Los mensajes para preparar la sesión: paso 5 del acompañamiento. */}
      <MensajesFlujoCita
        pacienteNombre={cita.paciente.nombre ?? 'Persona'}
        pacienteTelefono={cita.paciente.telefono ?? ''}
        profesionalNombre={cita.profesional.nombre ?? 'Psicólogo'}
        profesionalTelefono={cita.profesional.telefono ?? ''}
        fechaHoraBogota={enBogota(cita.inicio)}
        inicioIso={cita.inicio}
        estado={cita.estado}
        modalidad={cita.modalidad}
        enlaceConsentimiento={cita.consentimiento?.enlace ?? null}
        consentimientoFirmado={cita.consentSigned === true}
        canalContacto={cita.paciente.canalPreferido ?? null}
        personaTieneCorreo={cita.paciente.tieneCorreo === true}
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
