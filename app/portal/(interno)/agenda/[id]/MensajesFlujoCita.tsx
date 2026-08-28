'use client'

import { usePlantillas } from '@/components/portal/Plantillas'
import { useState } from 'react'
import { Copy, Check, MessageSquare } from 'lucide-react'
import {
  mensajeDeCitaConfirmada,
  mensajeDeConsentimiento,
  mensajeDeConsentimientoFirmadoALaPersona,
  mensajeDeCitaConfirmadaAlProfesional,
  mensajeDePedirNuevaDisponibilidadAlProfesional,
  mensajeDeExcusasYReagendamiento,
  mensajeRecordatorioPrevioCitaPersona,
  mensajeRecordatorioPrevioCitaProfesional,
  enlaceWhatsapp,
} from '@/lib/mensajes'

/**
 * Los mensajes que salen desde el detalle de la cita:
 *   - Confirmación a la persona (Paso 8)
 *   - Solicitud de firma del consentimiento (Paso 9)
 *   - Instrucciones y despacho al profesional con consentimiento y canal preferido (Paso 10)
 */
export function MensajesFlujoCita({
  pacienteNombre,
  pacienteTelefono,
  profesionalNombre,
  profesionalTelefono,
  fechaHoraBogota,
  modalidad,
  enlaceConsentimiento,
  consentimientoFirmado,
  canalContacto,
  enlaceCaso,
  enlaceReunion,
  enlaceReunionProfesional,
}: {
  pacienteNombre: string
  pacienteTelefono: string
  profesionalNombre: string
  profesionalTelefono: string
  fechaHoraBogota: string
  modalidad: string
  enlaceConsentimiento: string | null
  consentimientoFirmado: boolean
  canalContacto?: string | null
  enlaceCaso: string
  enlaceReunion?: string | null
  enlaceReunionProfesional?: string | null
}) {
  const plantillasDelPortal = usePlantillas()
  const mensajeConfirmacion = mensajeDeCitaConfirmada({
              plantilla: plantillasDelPortal?.WHATSAPP_CONFIRMAR_CITA_PERSONA,
    persona: pacienteNombre,
    profesional: profesionalNombre,
    cuando: fechaHoraBogota,
    modalidad,
    enlaceReunion,
  })

  const mensajeFirma = enlaceConsentimiento
    ? mensajeDeConsentimiento({
              plantilla: plantillasDelPortal?.WHATSAPP_CONSENTIMIENTO,
        persona: pacienteNombre,
        profesional: profesionalNombre,
        enlace: enlaceConsentimiento,
      })
    : null

  const mensajeConsentimientoRecibido = mensajeDeConsentimientoFirmadoALaPersona({
              plantilla: plantillasDelPortal?.WHATSAPP_CONSENTIMIENTO_FIRMADO,
    persona: pacienteNombre,
    profesional: profesionalNombre,
    cuando: fechaHoraBogota,
    modalidad,
  })

  const mensajeProfesional = mensajeDeCitaConfirmadaAlProfesional({
              plantilla: plantillasDelPortal?.WHATSAPP_DESPACHO_PROFESIONAL,
    consentimientoFirmado,
    profesional: profesionalNombre,
    persona: pacienteNombre,
    cuando: fechaHoraBogota,
    modalidad,
    canalContacto,
    enlace: enlaceCaso,
    enlaceReunion: enlaceReunionProfesional || enlaceReunion,
  })

  const mensajePedirNuevaDispProf = mensajeDePedirNuevaDisponibilidadAlProfesional({
              plantilla: plantillasDelPortal?.WHATSAPP_REAGENDAMIENTO_PEDIR_DISP,
    profesional: profesionalNombre,
    persona: pacienteNombre,
    cuandoAnterior: fechaHoraBogota,
    enlace: enlaceCaso,
  })

  const mensajeExcusasReagendar = mensajeDeExcusasYReagendamiento({
              plantilla: plantillasDelPortal?.WHATSAPP_REAGENDAMIENTO_EXCUSAS,
    persona: pacienteNombre,
    profesional: profesionalNombre,
    cuandoAnterior: fechaHoraBogota,
    motivo: 'un compromiso médico/personal de última hora',
  })

  const mensajeRecordatorioPersona = mensajeRecordatorioPrevioCitaPersona({
              plantilla: plantillasDelPortal?.WHATSAPP_RECORDATORIO_PREVIO_PERSONA,
    persona: pacienteNombre,
    profesional: profesionalNombre,
    cuando: fechaHoraBogota,
    modalidad,
    enlaceReunion,
  })

  const mensajeRecordatorioProf = mensajeRecordatorioPrevioCitaProfesional({
              plantilla: plantillasDelPortal?.WHATSAPP_RECORDATORIO_PREVIO,
    profesional: profesionalNombre,
    cuando: fechaHoraBogota,
    modalidad,
    enlaceCaso,
    enlaceReunion: enlaceReunionProfesional || enlaceReunion,
  })

  return (
    <>
      <div className="panel">
        <h2>Recordatorios previos de la sesión</h2>
        <p className="panel__nota">
          Recordatorios rápidos para enviar el día de la cita o en los minutos previos al inicio de la sesión.
        </p>

        <Mensaje
          titulo="Recordatorio previo a la persona acompañada"
          telefono={pacienteTelefono}
          texto={mensajeRecordatorioPersona}
        />

        <Mensaje
          titulo="Recordatorio previo al profesional"
          telefono={profesionalTelefono}
          texto={mensajeRecordatorioProf}
        />
      </div>

      <div className="panel">
        <h2>Mensajes para la persona</h2>
        <p className="panel__nota">
          Confirmarle la cita y gestionar la firma del consentimiento. Van por WhatsApp, como todo.
        </p>

        <Mensaje titulo="Paso 8 · Confirmarle la cita" telefono={pacienteTelefono} texto={mensajeConfirmacion} />

        {consentimientoFirmado ? (
          <div style={{ marginTop: 14 }}>
            <p className="panel__nota" style={{ color: 'var(--color-green, #059669)', fontWeight: 600, margin: '0 0 8px' }}>
              ✓ Paso 9 · El consentimiento informado ya está firmado (no es necesario volver a solicitarlo en reagendamientos o citas posteriores).
            </p>
            <Mensaje
              titulo="Paso 9b · Confirmación de consentimiento recibido a la persona"
              telefono={pacienteTelefono}
              texto={mensajeConsentimientoRecibido}
            />
          </div>
        ) : mensajeFirma ? (
          <Mensaje
            titulo="Paso 9 · Pedirle la firma del consentimiento"
            telefono={pacienteTelefono}
            texto={mensajeFirma}
          />
        ) : null}
      </div>

      <div className="panel">
        <h2>Mensajes para el profesional</h2>
        <p className="panel__nota">
          Entrega de la cita confirmada al profesional con el canal preferido de la persona, sus responsabilidades de contacto/asistencia y el enlace seguro al caso.
        </p>

        {!consentimientoFirmado ? (
          <p className="panel__nota" style={{ marginTop: 8, color: '#d97706', fontWeight: 500 }}>
            ⚠ Ojo: el consentimiento de la persona aún está pendiente. Se recomienda despachar este mensaje cuando esté firmado.
          </p>
        ) : null}

        <Mensaje
          titulo="Paso 10 · Instrucciones y despacho de la cita al profesional"
          telefono={profesionalTelefono}
          texto={mensajeProfesional}
        />
      </div>

      <div className="panel">
        <h2>¿El profesional tuvo un imprevisto en su agenda?</h2>
        <p className="panel__nota">
          Si el profesional te avisa de un compromiso personal/médico inesperado a esa hora, sigue estos dos pasos para coordinar la nueva fecha:
        </p>

        <Mensaje
          titulo="Reagendamiento (1) · Pedir nueva disponibilidad al profesional"
          telefono={profesionalTelefono}
          texto={mensajePedirNuevaDispProf}
        />

        <Mensaje
          titulo="Reagendamiento (2) · Excusas y propuesta de nuevo espacio a la persona"
          telefono={pacienteTelefono}
          texto={mensajeExcusasReagendar}
        />
      </div>
    </>
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
