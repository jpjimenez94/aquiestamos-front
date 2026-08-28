'use client'

import { usePlantillas } from '@/components/portal/Plantillas'
import { useState } from 'react'
import { Check, Copy, MessageCircle } from 'lucide-react'
import { mensajeDePedirDocumentos, enlaceWhatsapp } from '@/lib/mensajes'

/** El mensaje de pedir documentos con su enlace, en el trío de siempre. */
export function BotonPedirDocumentos({
  profesional,
  telefono,
  enlace,
}: {
  profesional: string
  telefono: string
  enlace: string
}) {
  const plantillasDelPortal = usePlantillas()
  const [copiado, setCopiado] = useState(false)

  const texto = mensajeDePedirDocumentos({
              plantilla: plantillasDelPortal?.WHATSAPP_PEDIR_DOCUMENTOS, profesional, enlace })
  const whatsapp = enlaceWhatsapp(telefono, texto)

  function copiar() {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
      {whatsapp ? (
        <a
          className="boton-mini"
          data-tono="principal"
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={13} />
          Pedir por WhatsApp
        </a>
      ) : null}
      <button className="boton-mini" type="button" onClick={copiar}>
        {copiado ? <Check size={13} /> : <Copy size={13} />}
        {copiado ? 'Copiado' : 'Copiar'}
      </button>
    </span>
  )
}
