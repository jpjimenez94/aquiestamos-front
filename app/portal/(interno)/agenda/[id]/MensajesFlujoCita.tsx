'use client'

import { useState } from 'react'
import { Copy, Check, MessageSquare } from 'lucide-react'
import {
  mensajeDeCitaConfirmada,
  mensajeDeConsentimiento,
  enlaceWhatsapp,
} from '@/lib/mensajes'

/**
 * Los dos mensajes que salen desde el detalle de la cita: la confirmación a
 * la persona (paso 8) y la solicitud de firma del consentimiento (paso 9).
 *
 * Los textos viven en `lib/mensajes.ts` con todos los demás, no aquí: este
 * archivo tenía sus propias plantillas —con emoji, sin línea de crisis y con
 * un enlace de consentimiento que llevaba a una página que no existía— y era
 * la única pantalla de la red hablando con otra voz.
 */
export function MensajesFlujoCita({
  pacienteNombre,
  pacienteTelefono,
  profesionalNombre,
  fechaHoraBogota,
  modalidad,
  enlaceConsentimiento,
  consentimientoFirmado,
}: {
  pacienteNombre: string
  pacienteTelefono: string
  profesionalNombre: string
  fechaHoraBogota: string
  modalidad: string
  enlaceConsentimiento: string | null
  consentimientoFirmado: boolean
}) {
  const mensajeConfirmacion = mensajeDeCitaConfirmada({
    persona: pacienteNombre,
    profesional: profesionalNombre,
    cuando: fechaHoraBogota,
    modalidad,
  })

  const mensajeFirma = enlaceConsentimiento
    ? mensajeDeConsentimiento({
        persona: pacienteNombre,
        profesional: profesionalNombre,
        enlace: enlaceConsentimiento,
      })
    : null

  return (
    <div className="panel">
      <h2>Mensajes para la persona</h2>
      <p className="panel__nota">
        Confirmarle la cita y pedirle la firma del consentimiento. Van por WhatsApp, como todo.
      </p>

      <Mensaje titulo="Paso 8 · Confirmarle la cita" telefono={pacienteTelefono} texto={mensajeConfirmacion} />

      {consentimientoFirmado ? (
        <p className="panel__nota" style={{ marginTop: 14 }}>
          Paso 9 · El consentimiento ya está firmado: no hay nada que pedir.
        </p>
      ) : mensajeFirma ? (
        <Mensaje
          titulo="Paso 9 · Pedirle la firma del consentimiento"
          telefono={pacienteTelefono}
          texto={mensajeFirma}
        />
      ) : null}
    </div>
  )
}

/** Un mensaje listo para mandar, con el mismo trío de siempre. */
function Mensaje({ titulo, telefono, texto }: { titulo: string; telefono: string; texto: string }) {
  const [copiado, setCopiado] = useState(false)
  const [verTexto, setVerTexto] = useState(false)
  const whatsapp = enlaceWhatsapp(telefono, texto)

  function copiar() {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="mensaje" style={{ marginTop: 18 }}>
      <h3 className="caso-paso">{titulo}</h3>

      <div className="mensaje__acciones">
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

      {verTexto ? <pre className="mensaje__texto">{texto}</pre> : null}
    </div>
  )
}
