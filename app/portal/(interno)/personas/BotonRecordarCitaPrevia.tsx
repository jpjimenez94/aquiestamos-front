'use client'

import { usePlantillas } from '@/components/portal/Plantillas'
import { useState, useEffect } from 'react'
import { BellRing, Copy, Check, MessageSquare, X, Clock, User, Stethoscope } from 'lucide-react'
import { paraWhatsapp } from '@/lib/telefono'
import {
  mensajeRecordatorioPrevioCitaProfesional,
  mensajeRecordatorioPrevioCitaPersona,
} from '@/lib/mensajes'
import { enBogota } from '@/lib/fechas'
import { BurbujaWhatsApp } from '@/components/portal/BurbujaWhatsApp'

type BotonRecordarCitaProps = {
  cita: {
    id: string
    inicio: string
    inicioLocal?: string
    modalidad?: string | null
    meetingUrl?: string | null
    salaTokenProfesional?: string | null
    salaTokenPaciente?: string | null
    estado: string
  }
  profesional: {
    nombre: string
    telefono?: string | null
  }
  pacienteNombre: string
  pacienteTelefono?: string | null
  enlaceCaso?: string | null
  compact?: boolean
}

export function calcularMinutosRestantes(inicioIso: string): number {
  const fechaInicio = new Date(inicioIso).getTime()
  if (isNaN(fechaInicio)) return Infinity
  const ahora = Date.now()
  return Math.round((fechaInicio - ahora) / (1000 * 60))
}

export function BotonRecordarCitaPrevia({
  cita,
  profesional,
  pacienteNombre,
  pacienteTelefono,
  enlaceCaso,
  compact = false,
}: BotonRecordarCitaProps) {
  const plantillasDelPortal = usePlantillas()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [destinatario, setDestinatario] = useState<'PROFESIONAL' | 'PACIENTE'>('PACIENTE')
  const [copiado, setCopiado] = useState(false)
  const [minutos, setMinutos] = useState(() => calcularMinutosRestantes(cita.inicio))

  // Actualizar minutos restantes periódicamente (cada 30s)
  useEffect(() => {
    function actualizar() {
      setMinutos(calcularMinutosRestantes(cita.inicio))
    }
    actualizar()
    const interval = setInterval(actualizar, 30000)
    return () => clearInterval(interval)
  }, [cita.inicio])

  // Solo habilitar si la cita está activa (PROGRAMADA o CONFIRMADA) y faltan 60 min o menos
  const estadoActivo = ['PROGRAMADA', 'CONFIRMADA'].includes(cita.estado)
  const dentroDeVentana = minutos <= 60 && minutos >= -45

  if (!estadoActivo || !dentroDeVentana) {
    return null
  }

  /**
   * En palabras, no en formato de máquina.
   *
   * `inicioLocal` viene del back como «2026-08-31 19:00»: la zona horaria es
   * correcta —esa parte estaba bien— pero es un formato para ordenar
   * columnas, no para escribirle a alguien. Iba primero en el `??`, así que
   * ganaba siempre, y el recordatorio salía con esa fecha mientras
   * `enBogota` —que dice «lunes, 31 de agosto, 7:00 p. m.»— esperaba de
   * respaldo sin llegar a usarse nunca.
   */
  const horaFormateada = enBogota(cita.inicio) || cita.inicioLocal || ''
  const telProf = paraWhatsapp(profesional.telefono)
  const telPac = paraWhatsapp(pacienteTelefono)

  const sitioUrl = (typeof window !== 'undefined' && window.location.origin)
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.redaquiestamos.org').replace(/\/$/, '')
  const esVirtual = !cita.modalidad || cita.modalidad.toUpperCase() === 'VIRTUAL'

  // Cada rol lleva su propia llave firmada: la del profesional no sirve para
  // entrar como paciente ni al revés. El UUID crudo queda como respaldo para
  // las citas agendadas antes de que el backend empezara a firmar.
  const enlaceReunionProf = (esVirtual || cita.meetingUrl)
    ? `${sitioUrl}/sala/${cita.salaTokenProfesional || cita.id}`
    : null

  const enlaceReunionPac = (esVirtual || cita.meetingUrl)
    ? `${sitioUrl}/sala/${cita.salaTokenPaciente || cita.id}`
    : null

  const mensajeProf = mensajeRecordatorioPrevioCitaProfesional({
              plantilla: plantillasDelPortal?.WHATSAPP_RECORDATORIO_PREVIO,
    profesional: profesional.nombre,
    cuando: horaFormateada,
    modalidad: cita.modalidad,
    enlaceCaso,
    enlaceReunion: enlaceReunionProf,
  })

  const mensajePac = mensajeRecordatorioPrevioCitaPersona({
              plantilla: plantillasDelPortal?.WHATSAPP_RECORDATORIO_PREVIO_PERSONA,
    persona: pacienteNombre,
    profesional: profesional.nombre,
    cuando: horaFormateada,
    modalidad: cita.modalidad,
    enlaceReunion: enlaceReunionPac,
  })

  const mensajeActivo = destinatario === 'PROFESIONAL' ? mensajeProf : mensajePac
  const telActivo = destinatario === 'PROFESIONAL' ? telProf : telPac

  const urlWhatsapp = telActivo
    ? `https://wa.me/${telActivo}?text=${encodeURIComponent(mensajeActivo)}`
    : null

  function copiarTexto() {
    navigator.clipboard.writeText(mensajeActivo)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const textoTiempo = minutos > 0 ? `en ${minutos} min` : 'iniciando ahora'

  return (
    <>
      <button
        type="button"
        onClick={() => setModalAbierto(true)}
        className="boton-mini"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          backgroundColor: '#fef3c7',
          color: '#92400e',
          borderColor: '#f59e0b',
          fontWeight: 700,
          fontSize: compact ? '0.72rem' : '0.76rem',
          padding: compact ? '2px 6px' : '3px 8px',
          boxShadow: '0 1px 2px rgba(217, 119, 6, 0.15)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          marginTop: 3,
        }}
        title={`La cita es ${textoTiempo}. Haz clic para enviar un recordatorio previo por WhatsApp a la persona o al profesional.`}
      >
        <BellRing size={compact ? 12 : 13} style={{ color: '#d97706' }} />
        <span>Recordar ({minutos > 0 ? `${minutos}m` : 'ya'})</span>
      </button>

      {modalAbierto && (
        <div
          className="modal-eliminar-overlay"
          onClick={() => setModalAbierto(false)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="modal-eliminar"
            /*
              modal-eliminar viene con align-items: center porque es la caja de
              «¿seguro que borras?». Reutilizada para contenido, ese centrado hace
              que un hijo ancho —la burbuja con un enlace de sala de 60 letras—
              no se envuelva: se sale por la derecha. De borde a borde, y se
              envuelve.
            */
            style={{ maxWidth: 560, textAlign: 'left', padding: '24px 26px', alignItems: 'stretch' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                borderBottom: '1px solid var(--color-border-default, #e2e8f0)',
                paddingBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BellRing size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
                    Recordatorio previo de cita
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#b45309', fontWeight: 600 }}>
                    ⚡ Faltan {minutos > 0 ? `${minutos} minutos` : 'pocos minutos'} para la sesión
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Selector de Destinatario */}
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button
                type="button"
                onClick={() => {
                  setDestinatario('PACIENTE')
                  setCopiado(false)
                }}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: destinatario === 'PACIENTE' ? '2px solid #059669' : '1px solid #cbd5e1',
                  background: destinatario === 'PACIENTE' ? '#ecfdf5' : '#f8fafc',
                  color: destinatario === 'PACIENTE' ? '#065f46' : '#64748b',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                <User size={15} />
                Para la Persona Acompañada
              </button>

              <button
                type="button"
                onClick={() => {
                  setDestinatario('PROFESIONAL')
                  setCopiado(false)
                }}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: destinatario === 'PROFESIONAL' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  background: destinatario === 'PROFESIONAL' ? '#f0f9ff' : '#f8fafc',
                  color: destinatario === 'PROFESIONAL' ? '#0369a1' : '#64748b',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                <Stethoscope size={15} />
                Para el Profesional
              </button>
            </div>

            {/* Resumen de la Cita */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '10px 14px',
                marginTop: 12,
                fontSize: '0.84rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div>
                <strong>Destinatario:</strong>{' '}
                {destinatario === 'PACIENTE' ? (
                  <span>
                    {pacienteNombre} {pacienteTelefono ? `(${pacienteTelefono})` : ''}
                  </span>
                ) : (
                  <span>
                    {profesional.nombre} {profesional.telefono ? `(${profesional.telefono})` : ''}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={14} style={{ color: '#059669' }} />
                <span>
                  <strong>Horario:</strong> {horaFormateada} ({cita.modalidad?.toLowerCase() ?? 'virtual'})
                </span>
              </div>
            </div>

            {/* Vista previa del mensaje */}
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Mensaje de WhatsApp ({destinatario === 'PACIENTE' ? 'Persona Acompañada' : 'Profesional'}):
              </span>
              {/*
                La misma burbuja que la ficha y Parametrización. Este modal tenía
                su propio <pre> verde: el tercer dibujo del mismo mensaje, y el
                único que se salía de la caja.
              */}
              <div style={{ marginTop: 6, maxHeight: 220, overflowY: 'auto', borderRadius: 8 }}>
                <BurbujaWhatsApp texto={mensajeActivo} />
              </div>
            </div>

            {/* Acciones */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 16,
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={copiarTexto}
                className="boton-mini"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '7px 12px',
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  cursor: 'pointer',
                  fontWeight: 600,
                  borderRadius: 6,
                }}
              >
                {copiado ? <Check size={14} style={{ color: '#059669' }} /> : <Copy size={14} />}
                {copiado ? '¡Copiado!' : 'Copiar mensaje'}
              </button>

              {urlWhatsapp ? (
                <a
                  href={urlWhatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="boton-mini"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 14px',
                    background: '#059669',
                    color: '#fff',
                    border: '1px solid #047857',
                    fontWeight: 700,
                    textDecoration: 'none',
                    borderRadius: 6,
                  }}
                  onClick={() => setModalAbierto(false)}
                >
                  <MessageSquare size={14} />
                  Enviar por WhatsApp
                </a>
              ) : (
                <span style={{ fontSize: '0.78rem', color: '#dc2626', alignSelf: 'center' }}>
                  Sin teléfono registrado
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
