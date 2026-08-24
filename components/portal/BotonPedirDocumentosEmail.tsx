'use client'

import { useState } from 'react'
import { Mail, Check, Loader2, AlertCircle } from 'lucide-react'

type BotonPedirDocumentosEmailProps = {
  profesionalId: string
  profesionalEmail?: string | null
  profesionalNombre?: string
  enlaceDocumentos?: string | null
  texto?: string
  variante?: 'boton' | 'icono' | 'fila'
}

export function BotonPedirDocumentosEmail({
  profesionalId,
  profesionalEmail,
  profesionalNombre,
  enlaceDocumentos,
  texto = 'Pedir docs por correo',
  variante = 'boton',
}: BotonPedirDocumentosEmailProps) {
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'exito' | 'error'>('idle')
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  async function enviarCorreo(e?: React.MouseEvent) {
    if (e) {
      e.stopPropagation()
    }
    if (estado === 'enviando') return

    setEstado('enviando')
    setMensajeError(null)

    try {
      const res = await fetch(`/api/portal/professionals/${profesionalId}/solicitar-documentos-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json().catch(() => null)

      if (res.ok && data?.success) {
        setEstado('exito')
        setTimeout(() => setEstado('idle'), 4000)
      } else {
        setEstado('error')
        setMensajeError(data?.message || 'No se pudo enviar el correo')
        setTimeout(() => setEstado('idle'), 4500)
      }
    } catch {
      setEstado('error')
      setMensajeError('Error de conexión con el servidor')
      setTimeout(() => setEstado('idle'), 4500)
    }
  }

  if (variante === 'icono') {
    return (
      <button
        type="button"
        className="boton-mini"
        onClick={enviarCorreo}
        disabled={estado === 'enviando'}
        title={
          estado === 'exito'
            ? '¡Correo enviado con éxito!'
            : estado === 'error'
              ? (mensajeError ?? 'Error al enviar')
              : `Enviar correo a ${profesionalEmail ?? 'el profesional'} para que cargue sus documentos`
        }
        style={{
          padding: '3px 6px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: '0.74rem',
          color: estado === 'exito' ? '#059669' : estado === 'error' ? '#dc2626' : undefined,
          borderColor: estado === 'exito' ? '#a7f3d0' : estado === 'error' ? '#fecaca' : undefined,
          background: estado === 'exito' ? '#ecfdf5' : estado === 'error' ? '#fef2f2' : undefined,
        }}
      >
        {estado === 'enviando' ? (
          <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
        ) : estado === 'exito' ? (
          <Check size={12} style={{ color: '#059669' }} />
        ) : estado === 'error' ? (
          <AlertCircle size={12} style={{ color: '#dc2626' }} />
        ) : (
          <Mail size={12} />
        )}
      </button>
    )
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 2 }}>
      <button
        type="button"
        className="boton-mini"
        onClick={enviarCorreo}
        disabled={estado === 'enviando'}
        title={
          profesionalEmail
            ? `Enviar correo a ${profesionalEmail} con el enlace de carga de documentos`
            : 'Enviar correo al profesional'
        }
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: '0.74rem',
          padding: '3px 8px',
          color: estado === 'exito' ? '#059669' : estado === 'error' ? '#dc2626' : undefined,
          borderColor: estado === 'exito' ? '#a7f3d0' : estado === 'error' ? '#fecaca' : undefined,
          background: estado === 'exito' ? '#ecfdf5' : estado === 'error' ? '#fef2f2' : undefined,
        }}
      >
        {estado === 'enviando' ? (
          <>
            <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Enviando...</span>
          </>
        ) : estado === 'exito' ? (
          <>
            <Check size={12} style={{ color: '#059669' }} />
            <span>¡Correo enviado!</span>
          </>
        ) : estado === 'error' ? (
          <>
            <AlertCircle size={12} style={{ color: '#dc2626' }} />
            <span>Reintentar correo</span>
          </>
        ) : (
          <>
            <Mail size={12} />
            <span>{texto}</span>
          </>
        )}
      </button>
      {mensajeError && (
        <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 500 }}>
          {mensajeError}
        </span>
      )}
    </div>
  )
}
