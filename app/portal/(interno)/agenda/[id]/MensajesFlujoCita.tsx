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
  mensajeDeCitaCanceladaALaPersona,
  mensajeDeCitaCanceladaAlProfesional,
  enlaceWhatsapp,
} from '@/lib/mensajes'

/**
 * Los mensajes que salen desde el detalle de la cita.
 *
 * Son los del paso 5 del acompañamiento —preparar la sesión—: confirmarle la
 * hora a la persona, pedirle la firma del consentimiento, entregarle el caso
 * al profesional y los dos recordatorios previos.
 *
 * Iban numerados 8, 9 y 10, del manual viejo de diez pasos. La secuencia viva
 * es la de `lib/pasosDelCaso.ts` y tiene siete; los números de allí son los
 * únicos que salen en pantalla.
 */
export function MensajesFlujoCita({
  pacienteNombre,
  pacienteTelefono,
  profesionalNombre,
  profesionalTelefono,
  fechaHoraBogota,
  inicioIso,
  estado,
  modalidad,
  enlaceConsentimiento,
  consentimientoFirmado,
  canalContacto,
  personaTieneCorreo,
  enlaceCaso,
  enlaceReunion,
  enlaceReunionProfesional,
}: {
  pacienteNombre: string
  pacienteTelefono: string
  profesionalNombre: string
  profesionalTelefono: string
  fechaHoraBogota: string
  /** La misma hora, en ISO: para decidir si la sesión es hoy. */
  inicioIso?: string
  /**
   * En qué estado está la cita.
   *
   * Este componente no lo recibía, y «la sesión es hoy» se decidía solo con la
   * hora. Sobre una cita cancelada o movida cuya hora original cayera dentro
   * de las 24 h, la tarjeta anunciaba «La sesión es hoy: recuérdasela a los
   * dos» y ofrecía los recordatorios de una sesión que no iba a ocurrir — o
   * pedía la firma del consentimiento de una cita que ya no existe.
   */
  estado?: string | null
  modalidad: string
  enlaceConsentimiento: string | null
  consentimientoFirmado: boolean
  canalContacto?: string | null
  /**
   * Si a la persona le llegó sola la confirmación de su sesión.
   *
   * Dar correo es opcional al pedir ayuda, y quien no lo dio no recibe nada:
   * ni la confirmación de que quedó agendada, ni el recordatorio del día. Para
   * esas, el WhatsApp no es un extra —es el único aviso que van a tener—, y la
   * tarjeta lo pide en vez de decir «nada pendiente».
   */
  personaTieneCorreo?: boolean
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

  /**
   * Qué toca con ESTA cita, en una tarjeta.
   *
   * Había cuatro paneles con diez mensajes y ningún orden: quien coordina
   * tenía que saber cuál iba primero. La regla es corta —si falta la firma,
   * pedirla; si la sesión es hoy, recordarla; si no, no toca nada— y cabe en
   * una tarjeta. Los diez mensajes siguen ahí, plegados.
   */
  /**
   * Una cita resuelta no tiene nada que preparar.
   *
   * Son los mismos estados finales que la máquina del backend
   * (`appointmentState.service.js`): desde ellos no sale ninguna transición, y
   * la sesión o ya pasó, o se movió, o no va a ocurrir. Sin esta comprobación
   * la tarjeta seguía pidiendo firmas y recordatorios por la hora original.
   */
  const RESUELTAS = ['REALIZADA', 'NO_ASISTIO', 'CANCELADA', 'REPROGRAMADA']
  const resuelta = RESUELTAS.includes(String(estado ?? ''))

  const mensajeCancelacionPersona = mensajeDeCitaCanceladaALaPersona({
    plantilla: plantillasDelPortal?.WHATSAPP_CITA_CANCELADA_PERSONA,
    persona: pacienteNombre,
    profesional: profesionalNombre,
    cuando: fechaHoraBogota,
  })

  const mensajeCancelacionProf = mensajeDeCitaCanceladaAlProfesional({
    plantilla: plantillasDelPortal?.WHATSAPP_CITA_CANCELADA_PROFESIONAL,
    profesional: profesionalNombre,
    persona: pacienteNombre,
    cuando: fechaHoraBogota,
  })

  const faltaFirma = !resuelta && !consentimientoFirmado && Boolean(mensajeFirma)
  const esHoy = (() => {
    if (resuelta) return false
    const t = inicioIso ? new Date(inicioIso).getTime() : NaN
    return Number.isFinite(t) && t > Date.now() && t - Date.now() <= 24 * 3600 * 1000
  })()

  const ETIQUETA_RESUELTA: Record<string, string> = {
    REALIZADA: 'Esta sesión ya se hizo',
    NO_ASISTIO: 'La persona no asistió a esta sesión',
    CANCELADA: 'Esta cita está cancelada',
    REPROGRAMADA: 'Esta cita se movió a otra hora',
  }

  return (
    <>
      <div className="panel" style={{ borderLeft: `4px solid ${resuelta ? '#94a3b8' : faltaFirma ? '#b45309' : esHoy ? '#059669' : '#94a3b8'}` }}>
        <div className="tabla__secundario" style={{ fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
          Qué toca con esta cita
        </div>
        {resuelta ? (
          <>
            <h2 style={{ marginTop: 4 }}>{ETIQUETA_RESUELTA[String(estado)] ?? 'Esta cita ya está resuelta'}</h2>
            {estado === 'CANCELADA' ? (
              <>
                <p className="panel__nota">
                  Cancelar no le avisa a nadie: el estado cambia y ya. Ninguno de los dos se
                  entera por el sistema, y el recordatorio que ya estaba en la cola sale igual.
                </p>
                <Mensaje
                  titulo="Avisarle a la persona"
                  telefono={pacienteTelefono}
                  texto={mensajeCancelacionPersona}
                />
                <Mensaje
                  titulo="Avisarle al profesional"
                  telefono={profesionalTelefono}
                  texto={mensajeCancelacionProf}
                />
              </>
            ) : (
              <p className="panel__nota">
                No hay nada que preparar: no se piden firmas ni se mandan recordatorios de una
                sesión que no va a ocurrir. Si aun así necesitas escribirle a alguien sobre ella,
                los mensajes siguen abajo.
              </p>
            )}
          </>
        ) : faltaFirma ? (
          <>
            <h2 style={{ marginTop: 4 }}>Falta la firma del consentimiento</h2>
            <p className="panel__nota">
              Desde este cambio se firma en la misma pantalla donde elige la hora; si llegó
              hasta aquí sin firmar, pídesela. No hace falta nada más antes de la sesión.
            </p>
            <Mensaje titulo="Pedirle la firma del consentimiento" telefono={pacienteTelefono} texto={mensajeFirma!} />
          </>
        ) : esHoy ? (
          <>
            <h2 style={{ marginTop: 4 }}>La sesión es hoy: recuérdasela a los dos</h2>
            <p className="panel__nota">El correo ya salió solo. El WhatsApp, por ahora, se manda desde aquí.</p>
            <Mensaje titulo="Recordatorio a la persona" telefono={pacienteTelefono} texto={mensajeRecordatorioPersona} />
            <Mensaje titulo="Recordatorio al profesional" telefono={profesionalTelefono} texto={mensajeRecordatorioProf} />
          </>
        ) : personaTieneCorreo === false ? (
          <>
            <h2 style={{ marginTop: 4 }}>Ella no tiene correo: confírmasela tú</h2>
            <p className="panel__nota">
              Al profesional le llegó su correo con la sala, y a ella no le llegó nada: no dejó
              correo al pedir ayuda, y darlo es opcional. Este WhatsApp es el único registro que
              va a tener de su cita hasta el día de la sesión.
            </p>
            <Mensaje
              titulo="Confirmarle la sesión"
              telefono={pacienteTelefono}
              texto={mensajeConfirmacion}
            />
          </>
        ) : (
          <>
            <h2 style={{ marginTop: 4 }}>Nada pendiente con esta cita</h2>
            <p className="panel__nota">
              El consentimiento está firmado y los dos recibieron su correo: él con la sala y el
              caso, ella con la hora y su enlace de entrada. El día de la sesión aparecerán aquí
              los recordatorios.
            </p>
          </>
        )}
      </div>

      <details style={{ marginBottom: 20 }}>
        <summary className="tabla__secundario" style={{ cursor: 'pointer', fontSize: '0.86rem', padding: '6px 0' }}>
          Todos los mensajes de esta cita
        </summary>

      <div className="panel" style={{ marginTop: 12 }}>
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
          La firma del consentimiento y, si hace falta, la confirmación. Van por WhatsApp, como todo.
        </p>

        {consentimientoFirmado ? (
          <div style={{ marginTop: 14 }}>
            <p className="panel__nota" style={{ color: 'var(--color-green, #059669)', fontWeight: 600, margin: '0 0 8px' }}>
              ✓ El consentimiento informado ya está firmado. No hay que volver a pedirlo en reagendamientos ni en citas posteriores.
            </p>
            <Mensaje
              titulo="Avisarle que su consentimiento llegó"
              telefono={pacienteTelefono}
              texto={mensajeConsentimientoRecibido}
            />
          </div>
        ) : mensajeFirma ? (
          <Mensaje
            titulo="Pedirle la firma del consentimiento"
            telefono={pacienteTelefono}
            texto={mensajeFirma}
          />
        ) : null}

        {/*
          Antes iba primero y se llamaba «Confirmarle la cita», como si fuera
          un paso. Desde que la hora que elige la persona nace confirmada y su
          pantalla se lo dice, este mensaje repite lo que ella ya vio. Se
          queda para quien quiera mandarlo igual; deja de ser un paso.
        */}
        <div style={{ marginTop: 14 }}>
          <Mensaje
            titulo="Confirmarle la cita (opcional)"
            nota="Su pantalla ya se la confirmó al elegir la hora. Úsalo solo si la cita la puso coordinación."
            telefono={pacienteTelefono}
            texto={mensajeConfirmacion}
          />
        </div>
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
          titulo="Entregarle el caso al profesional"
          telefono={profesionalTelefono}
          texto={mensajeProfesional}
        />
      </div>

      <div className="panel">
        <h2>Mover esta sesión</h2>
        <p className="panel__nota">
          Para cuando al profesional le surge un imprevisto en esa hora. Primero se le
          pide su nueva disponibilidad; con ella, se le avisa a la persona con excusas y
          se cuadra el nuevo espacio.
        </p>

        <Mensaje
          titulo="1 · Pedirle al profesional su nueva disponibilidad"
          telefono={profesionalTelefono}
          texto={mensajePedirNuevaDispProf}
        />

        <Mensaje
          titulo="2 · Avisarle a la persona y proponerle el nuevo espacio"
          telefono={pacienteTelefono}
          texto={mensajeExcusasReagendar}
        />
      </div>
      </details>
    </>
  )
}

/** Un mensaje listo para mandar, con el mismo trío de siempre. */
function Mensaje({
  titulo,
  nota,
  telefono,
  texto,
}: {
  titulo: string
  /** Una línea en gris bajo el título: cuándo usarlo, o cuándo no. */
  nota?: string
  telefono: string
  texto: string
}) {
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
      {nota ? (
        <p className="tabla__secundario" style={{ margin: '-2px 0 8px', fontSize: '0.8rem' }}>
          {nota}
        </p>
      ) : null}

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
