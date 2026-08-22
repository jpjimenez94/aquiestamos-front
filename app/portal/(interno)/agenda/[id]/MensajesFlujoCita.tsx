'use client'

import { useState } from 'react'
import { Copy, Check, MessageSquare } from 'lucide-react'
import { paraWhatsapp } from '@/lib/telefono'

type MensajesFlujoProps = {
  pacienteNombre: string
  pacienteTelefono: string
  profesionalNombre: string
  fechaHoraBogota: string
  modalidad: string
}

export function MensajesFlujoCita({
  pacienteNombre,
  pacienteTelefono,
  profesionalNombre,
  fechaHoraBogota,
  modalidad,
}: MensajesFlujoProps) {
  const [copiadoPaso8, setCopiadoPaso8] = useState(false)
  const [copiadoPaso9, setCopiadoPaso9] = useState(false)

  const mensajeConfirmacion = `¡Hola ${pacienteNombre}! Te saludamos de la Red Aquí Estamos 💚. Te confirmamos que tu cita de acompañamiento psicológico con el/la profesional ${profesionalNombre} ha sido agendada para el ${fechaHoraBogota} (${modalidad.toLowerCase()}). Quedamos atentos para apoyarte.`

  const mensajeConsentimiento = `Hola ${pacienteNombre}, para dar inicio a tu sesión de acompañamiento con ${profesionalNombre}, por favor diligencia y firma nuestro formulario de Consentimiento Informado aquí: https://redaquiestamos.org/consentimiento. Este documento es requisito previo para tu cita. ¡Muchas gracias!`

  function copiar(texto: string, setCopiado: (v: boolean) => void) {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  // El indicativo lo decide `paraWhatsapp`: pegarle 57 a lo que no empiece por
  // 57 rompe cualquier número extranjero.
  const telLimpio = paraWhatsapp(pacienteTelefono)
  const linkWhatsApp8 = telLimpio
    ? `https://wa.me/${telLimpio}?text=${encodeURIComponent(mensajeConfirmacion)}`
    : null

  const linkWhatsApp9 = telLimpio
    ? `https://wa.me/${telLimpio}?text=${encodeURIComponent(mensajeConsentimiento)}`
    : null

  return (
    <div className="panel">
      <h2>Mensajes Oficiales para el Paciente</h2>
      <p className="panel__nota">
        Plantillas oficiales para enviar por WhatsApp al paciente según los pasos 8 y 9 del flujo.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
        {/* Paso 8 */}
        <div style={{ padding: 14, background: 'var(--color-bg-subtle, #f8fafc)', borderRadius: 8, border: '1px solid var(--color-border-default, #e2e8f0)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <strong style={{ fontSize: '0.88rem' }}>Paso 8: Confirmación de Cita al Paciente</strong>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="boton-mini"
                onClick={() => copiar(mensajeConfirmacion, setCopiadoPaso8)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                {copiadoPaso8 ? <Check size={13} style={{ color: '#059669' }} /> : <Copy size={13} />}
                {copiadoPaso8 ? 'Copiado' : 'Copiar texto'}
              </button>
              {linkWhatsApp8 && (
                <a
                  href={linkWhatsApp8}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="boton-mini"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                >
                  <MessageSquare size={13} /> Abrir WhatsApp
                </a>
              )}
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary, #475569)', margin: 0, fontStyle: 'italic' }}>
            &ldquo;{mensajeConfirmacion}&rdquo;
          </p>
        </div>

        {/* Paso 9 */}
        <div style={{ padding: 14, background: 'var(--color-bg-subtle, #f8fafc)', borderRadius: 8, border: '1px solid var(--color-border-default, #e2e8f0)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <strong style={{ fontSize: '0.88rem' }}>Paso 9: Solicitud de Consentimiento Informado Firmado</strong>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="boton-mini"
                onClick={() => copiar(mensajeConsentimiento, setCopiadoPaso9)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                {copiadoPaso9 ? <Check size={13} style={{ color: '#059669' }} /> : <Copy size={13} />}
                {copiadoPaso9 ? 'Copiado' : 'Copiar texto'}
              </button>
              {linkWhatsApp9 && (
                <a
                  href={linkWhatsApp9}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="boton-mini"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                >
                  <MessageSquare size={13} /> Abrir WhatsApp
                </a>
              )}
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary, #475569)', margin: 0, fontStyle: 'italic' }}>
            &ldquo;{mensajeConsentimiento}&rdquo;
          </p>
        </div>
      </div>
    </div>
  )
}
