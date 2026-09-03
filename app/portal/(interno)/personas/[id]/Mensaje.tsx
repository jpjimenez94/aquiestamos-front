'use client'

import { useState } from 'react'
import { Check, Copy, MessageCircle } from 'lucide-react'
import { BurbujaWhatsApp } from '@/components/portal/BurbujaWhatsApp'
import { enlaceWhatsapp } from '@/lib/mensajes'

/**
 * Un mensaje de WhatsApp: título, botón de enviar, de copiar, y ver cómo se
 * ve. Vivía dentro de PanelDelCaso.tsx; se saca aparte porque QueTocaAhora
 * también lo necesita, y ya sabemos cómo termina el mismo componente copiado
 * en dos archivos.
 */
export function Mensaje({
  titulo,
  nota,
  telefono,
  texto,
  copiado,
  alCopiar,
}: {
  titulo: string
  nota: string
  telefono?: string | null
  texto: string
  copiado: boolean
  alCopiar: (texto: string) => void
}) {
  const [mostrando, setMostrando] = useState(false)
  const enlace = telefono ? enlaceWhatsapp(telefono, texto) : null

  return (
    <div className="mensaje">
      <div className="mensaje__cabecera">
        <div>
          <strong className="mensaje__titulo">{titulo}</strong>
          <span className="mensaje__nota">{nota}</span>
        </div>
        <div className="mensaje__acciones">
          {enlace ? (
            <a
              href={enlace}
              target="_blank"
              rel="noopener noreferrer"
              className="boton-mini"
              data-tono="verde"
            >
              <MessageCircle size={14} />
              Abrir WhatsApp
            </a>
          ) : null}
          <button
            className="boton-mini"
            type="button"
            onClick={() => alCopiar(texto)}
            title="Copiar texto del mensaje"
          >
            {copiado ? <Check size={14} /> : <Copy size={14} />}
            {copiado ? 'Copiado' : 'Copiar mensaje'}
          </button>
          <button
            className="boton-mini"
            type="button"
            onClick={() => setMostrando((v) => !v)}
            title={mostrando ? 'Ocultar texto' : 'Ver texto'}
          >
            {mostrando ? 'Ocultar' : 'Ver texto'}
          </button>
        </div>
      </div>

      {/*
        Como lo va a ver quien lo recibe, no como texto de configuración.

        Era un bloque gris con los asteriscos a la vista. Quien pulsa «Ver
        texto» está a punto de escribirle a alguien que pidió ayuda: lo que
        necesita comprobar es cómo llega el mensaje al otro lado.
      */}
      {mostrando ? (
        <div style={{ marginTop: 12 }}>
          <BurbujaWhatsApp texto={texto} />
        </div>
      ) : null}
    </div>
  )
}
