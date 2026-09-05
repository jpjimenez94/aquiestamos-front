'use client'

import { useState } from 'react'
import { Copy, Check, MessageSquare } from 'lucide-react'
import { usePlantillas } from '@/components/portal/Plantillas'
import { mensajeDeSupervisorMarcado, enlaceWhatsapp } from '@/lib/mensajes'
import { BurbujaWhatsApp } from '@/components/portal/BurbujaWhatsApp'

/**
 * El WhatsApp para quien acaba de quedar marcado como supervisor.
 *
 * Marcar y avisarle son el mismo momento, y hasta ahora solo existía la mitad:
 * la casilla en su ficha. Lo demás —decirle que quedó apuntado, qué significa
 * y que puede decir que no— quedaba escrito a mano y por fuera, así que cada
 * quien le contaba una cosa distinta, o no le contaba nada.
 *
 * Solo aparece sobre los que YA están marcados. Al profesional no se le
 * pregunta desde ninguna pantalla suya: quién puede facilitar se sabe fuera, y
 * este botón es la conversación que lo confirma.
 *
 * El texto se edita en Parametrización (WHATSAPP_CUIDADO_SUPERVISOR); si no se
 * pudo traer, sale el del código.
 */
export function EscribirAlSupervisor({
  nombre,
  telefono,
}: {
  nombre: string
  telefono: string | null
}) {
  const plantillas = usePlantillas()
  const [copiado, setCopiado] = useState(false)
  const [verTexto, setVerTexto] = useState(false)

  const texto = mensajeDeSupervisorMarcado({
    profesional: nombre,
    plantilla: plantillas?.WHATSAPP_CUIDADO_SUPERVISOR,
  })
  const whatsapp = enlaceWhatsapp(telefono ?? '', texto)

  function copiar() {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {whatsapp ? (
          <a
            className="boton-mini"
            data-tono="principal"
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageSquare size={14} />
            Avisarle por WhatsApp
          </a>
        ) : (
          <span className="tabla__secundario">Sin teléfono</span>
        )}
        <button className="boton-mini" type="button" onClick={copiar}>
          {copiado ? <Check size={14} /> : <Copy size={14} />}
          {copiado ? '¡Copiado!' : 'Copiar mensaje'}
        </button>
        <button
          className="tabla__secundario"
          type="button"
          onClick={() => setVerTexto((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '0.8rem',
          }}
        >
          {verTexto ? 'Ocultar' : 'Ver el mensaje'}
        </button>
      </div>

      {verTexto ? (
        <div style={{ marginTop: 10, maxWidth: 520 }}>
          <BurbujaWhatsApp texto={texto} />
        </div>
      ) : null}
    </div>
  )
}
