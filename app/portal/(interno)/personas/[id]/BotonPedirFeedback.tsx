'use client'

import { useState } from 'react'
import { Check, Copy, MessageCircle, Eye, EyeOff } from 'lucide-react'
import { mensajeDePedirFeedbackALaPersona, enlaceWhatsapp } from '@/lib/mensajes'

export function BotonPedirFeedback({
  persona,
  telefono,
  profesional,
  enlace,
}: {
  persona: string
  telefono: string
  profesional?: string | null
  enlace: string
}) {
  const [copiado, setCopiado] = useState(false)
  const [verTexto, setVerTexto] = useState(false)

  const texto = mensajeDePedirFeedbackALaPersona({ persona, profesional, enlace })
  const whatsapp = enlaceWhatsapp(telefono, texto)

  function copiar() {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <strong style={{ fontSize: '0.85rem', color: '#166534', display: 'block' }}>
            Pedir retroalimentación de la sesión a la persona
          </strong>
          <span style={{ fontSize: '0.76rem', color: '#15803d' }}>
            Envía el enlace seguro para que nos cuente brevemente cómo se sintió.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {whatsapp ? (
            <a
              className="boton-mini"
              data-tono="principal"
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
            >
              <MessageCircle size={13} />
              Enviar por WhatsApp
            </a>
          ) : null}
          <button
            className="boton-mini"
            type="button"
            onClick={copiar}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            {copiado ? <Check size={13} /> : <Copy size={13} />}
            {copiado ? 'Copiado' : 'Copiar mensaje'}
          </button>
          <button
            className="boton-mini"
            type="button"
            onClick={() => setVerTexto((v) => !v)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            {verTexto ? <EyeOff size={13} /> : <Eye size={13} />}
            {verTexto ? 'Ocultar texto' : 'Ver texto'}
          </button>
        </div>
      </div>

      {verTexto && (
        <pre
          className="mensaje__cuerpo"
          style={{
            marginTop: 10,
            marginBottom: 0,
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            fontSize: '0.78rem',
            background: '#ffffff',
            padding: 10,
            borderRadius: 6,
            border: '1px solid #86efac',
          }}
        >
          {texto}
        </pre>
      )}
    </div>
  )
}
