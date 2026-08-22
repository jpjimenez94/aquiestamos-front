'use client'

import { useState } from 'react'
import { MessageSquare, Copy, Check, X, Send } from 'lucide-react'

type CasoAsignado = {
  pacienteNombre: string
  pacienteTelefono: string
  profesionalNombre: string
  profesionalTelefono?: string | null
}

export function ModalSeguimientoGeneral({ casos }: { casos: CasoAsignado[] }) {
  const [abierto, setAbierto] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const mensajeBase = `¡Hola profesional de Aquí Estamos 💚! Te saludamos desde la coordinación. Te recordamos hacer seguimiento a los casos de acompañamiento que tienes asignados, contactar a la persona para agendar su sesión y actualizar el reporte de avance a través de tu enlace de caso. Si necesitas apoyo o tienes alguna novedad, por favor avísanos. ¡Muchas gracias por tu compromiso!`

  function copiar() {
    navigator.clipboard.writeText(mensajeBase)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <>
      <button
        type="button"
        className="boton-mini"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        onClick={() => setAbierto(true)}
      >
        <Send size={14} />
        Mensaje de Seguimiento ({casos.length})
      </button>

      {abierto && (
        <div className="modal-eliminar-overlay" onClick={() => setAbierto(false)}>
          <div
            className="modal-eliminar"
            style={{ maxWidth: 580, textAlign: 'left', padding: '24px 26px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottom: '1px solid var(--color-border-default, #e2e8f0)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Seguimiento General a Profesionales</h3>
                  <span className="tabla__secundario" style={{ fontSize: '0.78rem' }}>
                    {casos.length} casos con profesional asignado actualmente
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="boton-mini"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}
                onClick={() => setAbierto(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginTop: 14, width: '100%' }}>
              <label className="field__label" style={{ marginBottom: 6, display: 'block' }}>
                Plantilla Oficial de Seguimiento para enviar a los Psicólogos:
              </label>
              <div style={{ padding: 12, borderRadius: 8, background: 'var(--color-bg-subtle, #f8fafc)', border: '1px solid var(--color-border-default, #e2e8f0)', fontSize: '0.86rem', color: 'var(--color-text-secondary, #475569)', fontStyle: 'italic', marginBottom: 12 }}>
                &ldquo;{mensajeBase}&rdquo;
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <button
                  type="button"
                  className="boton-mini"
                  data-tono="principal"
                  onClick={copiar}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {copiado ? <Check size={14} /> : <Copy size={14} />}
                  {copiado ? '¡Copiado al portapapeles!' : 'Copiar mensaje para enviar'}
                </button>
              </div>

              <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: 8 }}>
                Casos asignados activos para contactar:
              </strong>
              <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {casos.map((c, i) => {
                  const telLimpio = c.profesionalTelefono ? c.profesionalTelefono.replace(/\D/g, '') : ''
                  const link = telLimpio
                    ? `https://wa.me/${telLimpio.startsWith('57') ? telLimpio : `57${telLimpio}`}?text=${encodeURIComponent(mensajeBase)}`
                    : null
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: 'var(--color-bg-subtle, #f8fafc)',
                        borderRadius: 6,
                        fontSize: '0.8rem',
                      }}
                    >
                      <div>
                        <strong>{c.profesionalNombre}</strong> {c.profesionalTelefono ? `(${c.profesionalTelefono})` : ''}
                        <span className="tabla__secundario" style={{ display: 'block', fontSize: '0.74rem' }}>
                          Paciente: {c.pacienteNombre} · Tel: {c.pacienteTelefono}
                        </span>
                      </div>
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="boton-mini"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                        >
                          <MessageSquare size={12} /> WhatsApp
                        </a>
                      ) : (
                        <span className="tabla__secundario" style={{ fontSize: '0.72rem' }}>Sin teléfono</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <button type="button" className="boton-mini" onClick={() => setAbierto(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
