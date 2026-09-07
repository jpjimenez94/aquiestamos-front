'use client'

import { useState } from 'react'
import { Copy, Check, MessageSquare } from 'lucide-react'
import { usePlantillas } from '@/components/portal/Plantillas'
import { mensajeDeSesionGrupal, enlaceWhatsapp } from '@/lib/mensajes'
import { nombrePropio } from '@/lib/nombre'
import { BurbujaWhatsApp } from '@/components/portal/BurbujaWhatsApp'

/**
 * Mandar la convocatoria por WhatsApp: la hora, quién facilita y el enlace.
 *
 * Al convocar sale un correo automático a cada invitado y al facilitador, y
 * hasta aquí eso era TODO. La convocatoria era lo único de la red que viajaba
 * solo por correo —con el enlace de la reunión dentro—, y quien acompaña vive
 * en WhatsApp: podía no enterarse de una sesión que él mismo pidió.
 *
 * Va a los invitados y también al facilitador, que necesita el mismo enlace.
 * El texto se edita en Parametrización (WHATSAPP_SESION_GRUPAL).
 */

type Destinatario = { id: string; nombre: string; telefono: string | null; papel: string }

export function AvisarDeLaSesion({
  destinatarios,
  cuando,
  facilitador,
  enlace,
}: {
  destinatarios: Destinatario[]
  cuando: string
  facilitador: string
  enlace: string
}) {
  const plantillas = usePlantillas()

  return (
    <div style={{ marginTop: 10 }}>
      <p className="tabla__secundario" style={{ margin: '0 0 6px' }}>
        Avisar por WhatsApp · el correo ya salió solo al convocar
      </p>
      <div style={{ display: 'grid', gap: 8 }}>
        {destinatarios.map((d) => (
          <Fila
            key={d.id}
            destinatario={d}
            cuando={cuando}
            facilitador={facilitador}
            enlace={enlace}
            plantilla={plantillas?.WHATSAPP_SESION_GRUPAL}
          />
        ))}
      </div>
    </div>
  )
}

function Fila({
  destinatario,
  cuando,
  facilitador,
  enlace,
  plantilla,
}: {
  destinatario: Destinatario
  cuando: string
  facilitador: string
  enlace: string
  plantilla?: string
}) {
  const [copiado, setCopiado] = useState(false)
  const [verTexto, setVerTexto] = useState(false)

  const texto = mensajeDeSesionGrupal({
    plantilla,
    profesional: destinatario.nombre,
    cuando,
    facilitador,
    enlace,
  })
  const whatsapp = enlaceWhatsapp(destinatario.telefono ?? '', texto)

  function copiar() {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.86rem', minWidth: 160 }}>
          {nombrePropio(destinatario.nombre)}{' '}
          <span className="tabla__secundario">· {destinatario.papel}</span>
        </span>
        {whatsapp ? (
          <a
            className="boton-mini"
            data-tono="principal"
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageSquare size={14} />
            Abrir WhatsApp
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
        <div style={{ marginTop: 8, maxWidth: 520 }}>
          <BurbujaWhatsApp texto={texto} />
        </div>
      ) : null}
    </div>
  )
}
