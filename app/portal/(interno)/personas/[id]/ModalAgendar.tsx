'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarCheck, X, Check, Copy, MessageCircle, AlertTriangle, User, Stethoscope, Video } from 'lucide-react'
import {
  mensajeDeCitaConfirmada,
  mensajeDeSiguienteCitaConfirmadaAlProfesional,
  mensajeDeCitaConfirmadaAlProfesional,
  enlaceWhatsapp,
} from '@/lib/mensajes'
import { enBogota } from '@/lib/fechas'

const DURACION_MINUTOS = 45

function formatoDatetimeLocal(isoString?: string | null): string {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    if (Number.isNaN(d.getTime())) return ''
    const partes = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(d)

    const map = Object.fromEntries(partes.map((p) => [p.type, p.value]))
    const hour = map.hour === '24' ? '00' : map.hour
    return `${map.year}-${map.month}-${map.day}T${hour}:${map.minute}`
  } catch {
    return ''
  }
}

export function ModalAgendar({
  asignacionId,
  personaId,
  profesionalId,
  persona,
  profesional,
  enlaceCaso,
  fechaInicial,
  modalidadInicial,
  esNuevaSesion = false,
  onCerrar,
}: {
  asignacionId?: string
  personaId?: string
  profesionalId?: string
  persona: { id?: string; fullName: string; phone: string; preferredModality?: string | null }
  profesional: { id?: string; nombre: string; telefono?: string }
  enlaceCaso?: string
  fechaInicial?: string | null
  modalidadInicial?: string | null
  esNuevaSesion?: boolean
  onCerrar: () => void
}) {
  const router = useRouter()
  const [cuando, setCuando] = useState(() => formatoDatetimeLocal(fechaInicial))
  const [modalidad, setModalidad] = useState(
    modalidadInicial === 'PRESENCIAL' || persona.preferredModality === 'PRESENCIAL'
      ? 'PRESENCIAL'
      : 'VIRTUAL',
  )
  const [meetingUrl, setMeetingUrl] = useState('')
  const [enlaceGenerado, setEnlaceGenerado] = useState<string | null>(null)
  const [enlaceGeneradoProf, setEnlaceGeneradoProf] = useState<string | null>(null)
  const [fueraDeFranja, setFueraDeFranja] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agendada, setAgendada] = useState<string | null>(null)
  const [copiadoPersona, setCopiadoPersona] = useState(false)
  const [copiadoProf, setCopiadoProf] = useState(false)
  const [pestanaMensaje, setPestanaMensaje] = useState<'persona' | 'profesional'>('persona')

  async function agendar() {
    if (!cuando) {
      setError('Selecciona la fecha y hora de la sesión.')
      return
    }

    const inicio = new Date(cuando)
    if (Number.isNaN(inicio.getTime())) {
      setError('Esa fecha no es válida.')
      return
    }

    setGuardando(true)
    setError(null)

    const fin = new Date(inicio.getTime() + DURACION_MINUTOS * 60000)

    try {
      let respuesta: Response
      if (asignacionId && !esNuevaSesion) {
        respuesta = await fetch(
          `/api/portal/appointments/asignaciones/${asignacionId}/confirmar`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              inicio: inicio.toISOString(),
              fin: fin.toISOString(),
              modalidad,
              meetingUrl: meetingUrl.trim() || undefined,
              fueraDeFranja,
            }),
          },
        )
      } else {
        const pId = personaId || persona.id
        const profId = profesionalId || profesional.id
        respuesta = await fetch('/api/portal/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: pId,
            professionalId: profId,
            inicio: inicio.toISOString(),
            fin: fin.toISOString(),
            modalidad,
            estado: 'CONFIRMADA',
            meetingUrl: meetingUrl.trim() || undefined,
            fueraDeFranja,
          }),
        })
      }

      const datos = await respuesta.json()

      if (!respuesta.ok || !datos.success) {
        if (datos.details?.codigo === 'FUERA_DE_FRANJA') {
          setFueraDeFranja(true)
          setError(
            `${datos.message} Si el profesional te confirmó este horario concreto, marca la casilla de confirmación y vuelve a intentarlo.`,
          )
          return
        }
        setError(datos.message ?? 'No se pudo agendar la sesión.')
        return
      }

      const idCita = datos.data?.id
      const sitio = typeof window !== 'undefined' ? window.location.origin : ''
      const urlFinal = idCita ? `${sitio}/sala/${idCita}` : (datos.data?.meetingUrl || meetingUrl.trim() || null)
      const urlFinalProf = idCita ? `${sitio}/sala/${idCita}` : (datos.data?.meetingUrl || meetingUrl.trim() || null)
      setEnlaceGenerado(urlFinal)
      setEnlaceGeneradoProf(urlFinalProf)
      setAgendada(inicio.toISOString())
    } catch {
      setError('No pudimos conectarnos con el servidor.')
    } finally {
      setGuardando(false)
    }
  }

  const urlCaso = enlaceCaso || (typeof window !== 'undefined' ? `${window.location.origin}/portal/caso/${persona.id || personaId}` : '')

  const mensajePersona = agendada
    ? mensajeDeCitaConfirmada({
        persona: persona.fullName,
        profesional: profesional.nombre,
        cuando: enBogota(agendada),
        modalidad,
        enlaceReunion: enlaceGenerado,
      })
    : ''

  const mensajeProf = agendada
    ? mensajeDeSiguienteCitaConfirmadaAlProfesional({
        profesional: profesional.nombre,
        persona: persona.fullName,
        cuando: enBogota(agendada),
        modalidad,
        enlace: urlCaso,
        enlaceReunion: enlaceGeneradoProf || enlaceGenerado,
      })
    : ''

  const whatsappPersona = agendada ? enlaceWhatsapp(persona.phone, mensajePersona) : null
  const whatsappProf = agendada && profesional.telefono ? enlaceWhatsapp(profesional.telefono, mensajeProf) : null

  return (
    <div className="modal-telon" onClick={onCerrar}>
      <div
        className="modal-caja"
        style={{ maxWidth: 580 }}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-cabecera">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarCheck size={20} style={{ color: 'var(--color-green)' }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
              {agendada ? 'Cita agendada' : esNuevaSesion ? 'Agendar nueva sesión de acompañamiento' : 'Cuadrar el horario'}
            </h3>
          </div>
          <button className="boton-icono" onClick={onCerrar} type="button" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {agendada ? (
          <>
            <div className="aviso-portal" data-tono="verde" style={{ marginTop: 12 }}>
              ✓ Sesión agendada para el <strong>{enBogota(agendada)}</strong> ({modalidad.toLowerCase()}).
            </div>

            {enlaceGenerado ? (
              <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: '#1e40af', fontWeight: 700, fontSize: '0.86rem' }}>
                  <Video size={16} />
                  <span>Enlace de Videollamada Generado:</span>
                </div>
                <div style={{ wordBreak: 'break-all', fontSize: '0.82rem', color: '#1e3a8a', fontFamily: 'monospace' }}>
                  {enlaceGenerado}
                </div>
              </div>
            ) : null}

            {/* Pestañas para elegir a quién enviar el mensaje */}
            <div style={{ display: 'flex', gap: 6, margin: '14px 0 10px', borderBottom: '1px solid var(--color-border-default)' }}>
              <button
                type="button"
                className="boton-mini"
                onClick={() => setPestanaMensaje('persona')}
                style={{
                  fontWeight: pestanaMensaje === 'persona' ? 700 : 500,
                  borderBottom: pestanaMensaje === 'persona' ? '2px solid var(--color-primary)' : 'none',
                  background: 'none',
                  borderRadius: 0,
                }}
              >
                <User size={13} style={{ marginRight: 4 }} />
                Para la persona acompañada
              </button>
              <button
                type="button"
                className="boton-mini"
                onClick={() => setPestanaMensaje('profesional')}
                style={{
                  fontWeight: pestanaMensaje === 'profesional' ? 700 : 500,
                  borderBottom: pestanaMensaje === 'profesional' ? '2px solid var(--color-primary)' : 'none',
                  background: 'none',
                  borderRadius: 0,
                }}
              >
                <Stethoscope size={13} style={{ marginRight: 4 }} />
                Para el profesional
              </button>
            </div>

            {pestanaMensaje === 'persona' ? (
              <div>
                <div className="mensaje__acciones">
                  {whatsappPersona ? (
                    <a
                      className="boton-mini"
                      data-tono="principal"
                      href={whatsappPersona}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={14} />
                      WhatsApp a la persona
                    </a>
                  ) : null}
                  <button
                    className="boton-mini"
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(mensajePersona)
                      setCopiadoPersona(true)
                      setTimeout(() => setCopiadoPersona(false), 2000)
                    }}
                  >
                    {copiadoPersona ? <Check size={14} /> : <Copy size={14} />}
                    {copiadoPersona ? 'Copiado' : 'Copiar mensaje'}
                  </button>
                </div>
                <pre className="mensaje__texto" style={{ maxHeight: 200, overflowY: 'auto' }}>{mensajePersona}</pre>
              </div>
            ) : (
              <div>
                <div className="mensaje__acciones">
                  {whatsappProf ? (
                    <a
                      className="boton-mini"
                      data-tono="principal"
                      href={whatsappProf}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={14} />
                      WhatsApp al profesional
                    </a>
                  ) : null}
                  <button
                    className="boton-mini"
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(mensajeProf)
                      setCopiadoProf(true)
                      setTimeout(() => setCopiadoProf(false), 2000)
                    }}
                  >
                    {copiadoProf ? <Check size={14} /> : <Copy size={14} />}
                    {copiadoProf ? 'Copiado' : 'Copiar mensaje'}
                  </button>
                </div>
                <pre className="mensaje__texto" style={{ maxHeight: 200, overflowY: 'auto' }}>{mensajeProf}</pre>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button
                className="boton-mini"
                data-tono="principal"
                type="button"
                onClick={() => {
                  onCerrar()
                  router.refresh()
                }}
              >
                Listo y continuar
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="panel__nota" style={{ marginTop: 4 }}>
              Sesión con <strong>{profesional.nombre}</strong> para <strong>{persona.fullName}</strong>. Duración: {DURACION_MINUTOS} minutos. El consentimiento firmado se conserva automáticamente.
            </p>

            {error ? (
              <div className="aviso-portal" data-tono="rojo" style={{ marginTop: 12 }}>
                {error}
              </div>
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
              <div>
                <label className="field__label" htmlFor="cuando">
                  Fecha y hora de la sesión
                </label>
                <input
                  id="cuando"
                  className="input"
                  type="datetime-local"
                  value={cuando}
                  onChange={(e) => setCuando(e.target.value)}
                />
              </div>

              <div>
                <label className="field__label" htmlFor="modalidad">
                  Modalidad
                </label>
                <select
                  id="modalidad"
                  className="input"
                  value={modalidad}
                  onChange={(e) => setModalidad(e.target.value)}
                >
                  <option value="VIRTUAL">Virtual</option>
                  <option value="PRESENCIAL">Presencial</option>
                </select>
              </div>

              {modalidad === 'VIRTUAL' ? (
                <div>
                  <label className="field__label" htmlFor="meetingUrl">
                    Enlace de videollamada (opcional)
                  </label>
                  <input
                    id="meetingUrl"
                    className="input"
                    type="url"
                    placeholder="Dejar en blanco para generar automáticamente sala segura de la red"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                  />
                  <span className="tabla__secundario" style={{ fontSize: '0.74rem', display: 'block', marginTop: 4 }}>
                    💡 Si lo dejas vacío, el sistema creará una sala cifrada y privada de 1 clic sin registros.
                  </span>
                </div>
              ) : null}

              {fueraDeFranja ? (
                <label className="tamizaje__autorizacion">
                  <input
                    type="checkbox"
                    checked={fueraDeFranja}
                    onChange={(e) => setFueraDeFranja(e.target.checked)}
                  />
                  <span>
                    <AlertTriangle
                      size={14}
                      style={{ verticalAlign: '-2px', marginRight: 4, color: 'var(--color-red)' }}
                    />
                    Este horario no está en la disponibilidad habitual declarada del profesional. Márcalo si el profesional o la persona confirmaron este momento.
                  </span>
                </label>
              ) : null}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button className="boton-mini" type="button" onClick={onCerrar}>
                Cancelar
              </button>
              <button
                className="boton-mini"
                data-tono="principal"
                type="button"
                onClick={agendar}
                disabled={guardando}
              >
                {guardando ? 'Agendando…' : 'Agendar la sesión'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
