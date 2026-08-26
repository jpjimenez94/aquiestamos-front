'use client'

import { useState, useEffect } from 'react'
import { BellRing, Copy, Check, MessageSquare, X, Clock } from 'lucide-react'
import { paraWhatsapp } from '@/lib/telefono'
import { mensajeRecordatorioPrevioCitaProfesional } from '@/lib/mensajes'
import { enBogota } from '@/lib/fechas'

type BotonRecordarCitaProps = {
  cita: {
    id: string
    inicio: string
    inicioLocal?: string
    modalidad?: string | null
    estado: string
  }
  profesional: {
    nombre: string
    telefono?: string | null
  }
  pacienteNombre: string
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
  enlaceCaso,
  compact = false,
}: BotonRecordarCitaProps) {
  const [modalAbierto, setModalAbierto] = useState(false)
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

  const horaFormateada = cita.inicioLocal ?? enBogota(cita.inicio)
  const telProf = paraWhatsapp(profesional.telefono)

  const mensaje = mensajeRecordatorioPrevioCitaProfesional({
    profesional: profesional.nombre,
    cuando: horaFormateada,
    modalidad: cita.modalidad,
    enlaceCaso,
  })

  const urlWhatsapp = telProf
    ? `https://wa.me/${telProf}?text=${encodeURIComponent(mensaje)}`
    : null

  function copiarTexto() {
    navigator.clipboard.writeText(mensaje)
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
        title={`La cita es ${textoTiempo}. Haz clic para enviar un recordatorio previo por WhatsApp al profesional.`}
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
            style={{ maxWidth: 540, textAlign: 'left', padding: '24px 26px' }}
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
                    Recordar cita previa al profesional
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

            {/* Resumen de la Cita */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '10px 14px',
                marginTop: 14,
                fontSize: '0.84rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div>
                <strong>Profesional:</strong> {profesional.nombre} {profesional.telefono ? `(${profesional.telefono})` : ''}
              </div>
              <div>
                <strong>Persona acompañada:</strong> {pacienteNombre}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={14} style={{ color: '#059669' }} />
                <span><strong>Horario:</strong> {horaFormateada} ({cita.modalidad?.toLowerCase() ?? 'virtual'})</span>
              </div>
            </div>

            {/* Vista previa del mensaje */}
            <div style={{ marginTop: 14 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Mensaje de WhatsApp preparado:
              </span>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: '0.84rem',
                  color: '#1e293b',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                  padding: '12px 14px',
                  margin: '6px 0 0',
                  lineHeight: 1.5,
                  maxHeight: 180,
                  overflowY: 'auto',
                }}
              >
                {mensaje}
              </pre>
            </div>

            {/* Acciones */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 18,
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
