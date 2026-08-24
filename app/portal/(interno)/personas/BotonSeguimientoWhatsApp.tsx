'use client'

import { useState } from 'react'
import { MessageSquare, Copy, Check, X, Phone, UserCheck } from 'lucide-react'
import { paraWhatsapp } from '@/lib/telefono'
import {
  mensajeDeSeguimientoAlProfesional,
  mensajeDeSeguimientoALaPersona,
} from '@/lib/mensajes'

type BotonSeguimientoProps = {
  pacienteNombre: string
  pacienteTelefono: string
  profesionalNombre: string
  profesionalTelefono?: string | null
  /** El enlace del caso, para que el mensaje al profesional lo lleve. */
  enlaceCaso?: string | null
}

export function BotonSeguimientoWhatsApp({
  pacienteNombre,
  pacienteTelefono,
  profesionalNombre,
  profesionalTelefono,
  enlaceCaso,
}: BotonSeguimientoProps) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [copiadoProf, setCopiadoProf] = useState(false)
  const [copiadoPac, setCopiadoPac] = useState(false)

  // El indicativo lo resuelve `paraWhatsapp`. Antes esto hacía
  // `startsWith('57') ? tel : '57' + tel`, que a un número de España —34600…—
  // le pegaba el 57 delante y salía 5734600…, un enlace a ninguna parte.
  const telProf = paraWhatsapp(profesionalTelefono)
  const telPac = paraWhatsapp(pacienteTelefono)

  /**
   * Los textos viven en lib/mensajes.ts con todos los demás. La versión
   * anterior de este componente tenía los suyos propios — con emoji que llega
   * roto según el dispositivo y, peor, con el nombre y el TELÉFONO de la
   * persona dentro del chat del profesional: la única pantalla de la red
   * saltándose la regla de que esos datos van detrás del enlace.
   */
  const mensajeProfesional = mensajeDeSeguimientoAlProfesional({
    profesional: profesionalNombre,
    enlace: enlaceCaso,
  })

  const mensajePaciente = mensajeDeSeguimientoALaPersona({
    persona: pacienteNombre,
    profesional: profesionalNombre,
  })

  const linkWaProf = telProf
    ? `https://wa.me/${telProf}?text=${encodeURIComponent(mensajeProfesional)}`
    : null

  const linkWaPac = telPac
    ? `https://wa.me/${telPac}?text=${encodeURIComponent(mensajePaciente)}`
    : null

  function copiar(texto: string, setCopiado: (v: boolean) => void) {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <>
      <button
        type="button"
        className="boton-mini"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          background: '#059669',
          color: '#fff',
          borderColor: '#047857',
        }}
        onClick={() => setModalAbierto(true)}
        title="Hacer seguimiento por WhatsApp"
      >
        <MessageSquare size={13} />
        Seguimiento
      </button>

      {modalAbierto && (
        <div className="modal-eliminar-overlay" onClick={() => setModalAbierto(false)}>
          <div
            className="modal-eliminar"
            style={{ maxWidth: 540, textAlign: 'left', padding: '24px 26px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottom: '1px solid var(--color-border-default, #e2e8f0)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Seguimiento por WhatsApp</h3>
                  <span className="tabla__secundario" style={{ fontSize: '0.78rem' }}>
                    Caso de <strong>{pacienteNombre}</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="boton-mini"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}
                onClick={() => setModalAbierto(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14, width: '100%' }}>
              {/* Opción 1: Mensaje al Profesional */}
              <div style={{ padding: 14, borderRadius: 8, border: '1px solid var(--color-border-default, #e2e8f0)', background: 'var(--color-bg-subtle, #f8fafc)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <strong style={{ fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <UserCheck size={14} style={{ color: '#059669' }} />
                      Seguimiento al Psicólogo: {profesionalNombre}
                    </strong>
                    {profesionalTelefono && (
                      <span className="tabla__secundario" style={{ fontSize: '0.76rem' }}>
                        Tel: {profesionalTelefono}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="boton-mini"
                      onClick={() => copiar(mensajeProfesional, setCopiadoProf)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      {copiadoProf ? <Check size={13} style={{ color: '#059669' }} /> : <Copy size={13} />}
                      {copiadoProf ? 'Copiado' : 'Copiar'}
                    </button>
                    {linkWaProf ? (
                      <a
                        href={linkWaProf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="boton-mini"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: '#059669',
                          color: '#fff',
                          borderColor: '#047857',
                          textDecoration: 'none',
                        }}
                      >
                        <MessageSquare size={13} /> Abrir WhatsApp
                      </a>
                    ) : (
                      <span className="tabla__secundario" style={{ fontSize: '0.74rem' }}>Sin teléfono</span>
                    )}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary, #475569)', fontStyle: 'italic' }}>
                  &ldquo;{mensajeProfesional}&rdquo;
                </p>
              </div>

              {/* Opción 2: Mensaje al Paciente */}
              <div style={{ padding: 14, borderRadius: 8, border: '1px solid var(--color-border-default, #e2e8f0)', background: 'var(--color-bg-subtle, #f8fafc)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <strong style={{ fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Phone size={14} style={{ color: '#0284c7' }} />
                      Seguimiento a la Persona: {pacienteNombre}
                    </strong>
                    {pacienteTelefono && (
                      <span className="tabla__secundario" style={{ fontSize: '0.76rem' }}>
                        Tel: {pacienteTelefono}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="boton-mini"
                      onClick={() => copiar(mensajePaciente, setCopiadoPac)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      {copiadoPac ? <Check size={13} style={{ color: '#059669' }} /> : <Copy size={13} />}
                      {copiadoPac ? 'Copiado' : 'Copiar'}
                    </button>
                    {linkWaPac ? (
                      <a
                        href={linkWaPac}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="boton-mini"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: '#0284c7',
                          color: '#fff',
                          borderColor: '#0369a1',
                          textDecoration: 'none',
                        }}
                      >
                        <MessageSquare size={13} /> Abrir WhatsApp
                      </a>
                    ) : (
                      <span className="tabla__secundario" style={{ fontSize: '0.74rem' }}>Sin teléfono</span>
                    )}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary, #475569)', fontStyle: 'italic' }}>
                  &ldquo;{mensajePaciente}&rdquo;
                </p>
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                className="boton-mini"
                onClick={() => setModalAbierto(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
