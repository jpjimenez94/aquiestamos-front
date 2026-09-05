'use client'

import { useState } from 'react'
import { Check, Copy, MessageCircle } from 'lucide-react'
import { mensajeDeEncuesta, enlaceWhatsapp } from '@/lib/mensajes'
import { BurbujaWhatsApp } from '@/components/portal/BurbujaWhatsApp'

/**
 * El mensaje de la encuesta del cierre, listo para mandar. El mismo trío de
 * siempre: WhatsApp, copiar, ver — con el texto viviendo en lib/mensajes.ts.
 */
export function BotonEncuesta({
  persona,
  telefono,
  enlace,
}: {
  persona: string
  telefono: string
  enlace: string
}) {
  const [copiado, setCopiado] = useState(false)
  const [verTexto, setVerTexto] = useState(false)

  const texto = mensajeDeEncuesta({ persona, enlace })
  const whatsapp = enlaceWhatsapp(telefono, texto)

  function copiar() {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="mensaje" style={{ marginTop: 14 }}>
      <h3 className="caso-paso">Mándale la encuesta del cierre</h3>
      <p className="panel__nota" style={{ marginTop: 0 }}>
        Dos preguntas, opcional de verdad. Es el único dato de resultado que la red tiene.
      </p>
      <div className="mensaje__acciones">
        {whatsapp ? (
          <a
            className="boton-mini"
            data-tono="principal"
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={14} />
            Abrir WhatsApp
          </a>
        ) : (
          <span className="tabla__secundario" style={{ marginTop: 0 }}>
            No sabemos a qué país corresponde ese número. Copia el mensaje y mándalo aparte.
          </span>
        )}
        <button className="boton-mini" type="button" onClick={copiar}>
          {copiado ? <Check size={14} /> : <Copy size={14} />}
          {copiado ? 'Copiado' : 'Copiar mensaje'}
        </button>
        <button
          className="mensaje__ver"
          type="button"
          onClick={() => setVerTexto((v) => !v)}
          aria-expanded={verTexto}
        >
          {verTexto ? 'Ocultar' : 'Ver el mensaje'}
        </button>
      </div>
      {verTexto ? (
        <div style={{ marginTop: 10 }}>
          <BurbujaWhatsApp texto={texto} />
        </div>
      ) : null}
    </div>
  )
}
