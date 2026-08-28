'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, MessageCircle, CalendarCheck, RotateCcw, Clock } from 'lucide-react'
import {
  mensajeDePropuesta,
  mensajeParaCuadrarHorario,
  mensajeDePedirNuevaDisponibilidadAlProfesional,
  mensajeDeExcusasYReagendamiento,
  mensajeDeCitaConfirmadaAlProfesional,
  mensajeDeSiguienteCitaConfirmadaAlProfesional,
  enlaceWhatsapp,
} from '@/lib/mensajes'
import { enBogota } from '@/lib/fechas'
import { ModalAgendar } from './ModalAgendar'
import { BotonReasignar } from './BotonReasignar'

/**
 * El caso, según en qué punto va la negociación.
 *
 * Asignar dejó de ser un clic. Ahora es una conversación de tres —quien
 * coordina, el profesional y la persona acompañada— y cada tramo tiene
 * exactamente un mensaje y una acción. Este panel decide cuál toca, para que
 * quien coordina no tenga que acordarse.
 */

export type Asignacion = {
  id: string
  estado: 'PROPUESTA' | 'ACEPTADA' | 'ACTIVA' | 'RECHAZADA' | 'CANCELADA' | 'CERRADA'
  estadoLegible: string
  siguientePaso: string | null
  desde: string
  respondioEn: string | null
  nota: string | null
  motivoRechazo: string | null
  profesional: { id: string; nombre: string; telefono: string }
}

type Persona = {
  id: string
  fullName: string
  phone: string
  city: string
  priority: string
  preferredContact: string | null
  preferredModality: string | null
  availableDays: string[]
  availableSlots: string[]
}

const TONO: Record<string, string> = {
  PROPUESTA: 'ambar',
  ACEPTADA: 'azul',
  ACTIVA: 'verde',
  RECHAZADA: 'rojo',
  CANCELADA: 'rojo',
  CERRADA: 'gris',
}

const DIA: Record<string, string> = {
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles', JUEVES: 'Jueves',
  VIERNES: 'Viernes', SABADO: 'Sábado', DOMINGO: 'Domingo',
}
const FRANJA: Record<string, string> = { MANANA: 'mañana', TARDE: 'tarde', NOCHE: 'noche' }

export function PanelDelCaso({
  persona,
  asignacion,
  enlaceCaso,
  enlaceAgenda,
  plantillas,
  proximaCita,
  esPrimeraCita = true,
}: {
  persona: Persona
  asignacion: Asignacion
  enlaceCaso: string
  /** Enlace con el que la persona agenda sus propias sesiones. */
  enlaceAgenda?: string | null
  /** Textos editables desde Parametrización. Mandan sobre los del código. */
  plantillas?: Record<string, string>
  /** La cita abierta más próxima, para que el mensaje diga la fecha real. */
  proximaCita?: {
    id?: string
    cuando: string
    modalidad: string
    /** Llave de sala firmada para la persona acompañada. */
    salaTokenPaciente?: string | null
    /** Si la persona ya firmó el consentimiento informado de esta cita. */
    consentSigned?: boolean
  } | null
  esPrimeraCita?: boolean
}) {
  const [copiado, setCopiado] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [agendando, setAgendando] = useState(false)

  function copiar(clave: string, texto: string) {
    navigator.clipboard.writeText(texto)
    setCopiado(clave)
    setTimeout(() => setCopiado(null), 2000)
  }

  const terminada = asignacion.estado === 'RECHAZADA' || asignacion.estado === 'CANCELADA'

  const sitioUrl = typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.redaquiestamos.org').replace(/\/$/, '')

  // Este enlace va en el mensaje a la persona acompañada, así que lleva SU
  // llave firmada. El UUID crudo queda como respaldo para las citas
  // agendadas antes de que el backend empezara a firmar.
  const enlaceReunion = (proximaCita?.id && (proximaCita.modalidad === 'VIRTUAL' || !proximaCita.modalidad))
    ? `${sitioUrl}/sala/${proximaCita.salaTokenPaciente || proximaCita.id}`
    : null

  return (
    <div className="panel">
      <div className="caso-cabecera">
        <h2 style={{ margin: 0 }}>El acompañamiento</h2>
        <span className="etiqueta" data-tono={TONO[asignacion.estado]}>
          {asignacion.estadoLegible}
        </span>
      </div>

      <p className="panel__nota">
        Con <strong>{asignacion.profesional.nombre}</strong>, desde el{' '}
        {enBogota(asignacion.desde, false)}.
      </p>

      {asignacion.siguientePaso ? (
        <p className="caso-siguiente">
          <strong>Siguiente paso:</strong> {asignacion.siguientePaso}
        </p>
      ) : null}

      {error ? (
        <div className="aviso-portal" data-tono="rojo" style={{ marginBottom: 16 }}>
          {error}
        </div>
      ) : null}

      {/* Si el profesional rechazó o se canceló, se explica por qué */}
      {terminada && asignacion.motivoRechazo ? (
        <div className="caso-motivo">
          <strong>Motivo:</strong> {asignacion.motivoRechazo}
        </div>
      ) : null}

      {/* PASO 1 — Se le propuso el caso al profesional. Esperando que diga si puede. */}
      {asignacion.estado === 'PROPUESTA' ? (
        <>
          <Mensaje
            titulo="1 · Proponle el caso al profesional"
            nota="Los datos de contacto de la persona no van aquí: se los mostramos solo si acepta."
            telefono={asignacion.profesional.telefono}
            texto={mensajeDePropuesta({
              plantilla: plantillas?.WHATSAPP_PROPUESTA_PROFESIONAL,
              profesional: asignacion.profesional.nombre,
              ciudad: persona.city,
              modalidad: persona.preferredModality,
              dias: persona.availableDays,
              franjas: persona.availableSlots,
              enlace: enlaceCaso,
              prioridad: persona.priority,
            })}
            copiado={copiado === 'propuesta'}
            alCopiar={(t) => copiar('propuesta', t)}
          />

          <div className="mensaje__acciones" style={{ marginTop: 16 }}>
            <BotonReasignar
              asignacionId={asignacion.id}
              profesionalNombre={asignacion.profesional.nombre}
              textoBoton="No contestó / Proponer a otra persona"
              onError={setError}
            />
          </div>
        </>
      ) : null}

      {/* PASO 2 — El profesional aceptó y dejó sus días/horas. Toca cuadrar con la persona. */}
      {asignacion.estado === 'ACEPTADA' ? (
        <>
          {/*
            Aquí se listaban los días y franjas que el profesional escribía al
            aceptar. Ya no se le piden: su agenda está cargada desde que se
            registró y es de ahí de donde la persona elige. Queda la nota, que
            es el matiz que una agenda no sabe decir.
          */}
          {asignacion.nota ? (
            <div className="caso-horarios">
              <strong>Lo que dijo el profesional:</strong>
              <em>«{asignacion.nota}»</em>
            </div>
          ) : null}

          <Mensaje
            titulo="2 · Mándale su enlace para que elija hora"
            nota="Ve la agenda real del profesional y agenda sola. El enlace le sirve para todas sus sesiones."
            telefono={persona.phone}
            texto={mensajeParaCuadrarHorario({
              persona: persona.fullName,
              profesional: asignacion.profesional.nombre,
              dias: [],
              franjas: [],
              nota: asignacion.nota,
              enlaceAgenda,
              plantilla: plantillas?.WHATSAPP_CUADRAR_HORARIO_PERSONA,
            })}
            copiado={copiado === 'cuadrar'}
            alCopiar={(t) => copiar('cuadrar', t)}
          />

          <div className="mensaje__acciones" style={{ marginTop: 16 }}>
            <button
              className="boton-mini"
              data-tono="principal"
              type="button"
              onClick={() => setAgendando(true)}
            >
              <CalendarCheck size={14} />
              Ya me confirmó: agendar
            </button>
            <BotonReasignar
              asignacionId={asignacion.id}
              profesionalNombre={asignacion.profesional.nombre}
              textoBoton="No se pudo cuadrar / Reasignar"
              onError={setError}
            />
          </div>

          {/* Opciones cuando los horarios no le sirven a la persona */}
          <details className="caso-alternativas">
            <summary>¿No le sirvieron los horarios?</summary>
            <div className="caso-alternativas__cuerpo">
              <p className="panel__nota">
                Si la persona no puede en ninguna de esas franjas, tienes dos opciones según lo que
                ella te haya dicho:
              </p>

              <Mensaje
                titulo="Opción A · Pedirle otras franjas al mismo profesional"
                nota="Úsalo si la persona te dio opciones y quieres ver si el profesional puede alguna de ellas."
                telefono={asignacion.profesional.telefono}
                texto={mensajeDePedirNuevaDisponibilidadAlProfesional({
              plantilla: plantillas?.WHATSAPP_REAGENDAMIENTO_PEDIR_DISP,
                  profesional: asignacion.profesional.nombre,
                  persona: persona.fullName,
                  enlace: enlaceCaso,
                })}
                copiado={copiado === 'pedir-otra'}
                alCopiar={(t) => copiar('pedir-otra', t)}
              />

              <Mensaje
                titulo="Opción B · Que vuelva a elegir hora en su enlace"
                nota="Se disculpa y la manda a su agenda, donde ve las horas libres del profesional."
                telefono={persona.phone}
                texto={mensajeDeExcusasYReagendamiento({
              plantilla: plantillas?.WHATSAPP_REAGENDAMIENTO_EXCUSAS,
                  persona: persona.fullName,
                  profesional: asignacion.profesional.nombre,
                  motivo: 'un compromiso médico/personal de última hora',
                  // Los días y franjas ya no se le piden al profesional: su
                  // agenda es la fuente, y la persona elige de ella.
                  dias: [],
                  franjas: [],
                  nota: asignacion.nota,
                })}
                copiado={copiado === 'excusas'}
                alCopiar={(t) => copiar('excusas', t)}
              />
            </div>
          </details>
        </>
      ) : null}

      {/* PASO 3 — Hay cita. Se le confirma al profesional con sus responsabilidades. */}
      {asignacion.estado === 'ACTIVA' ? (
        <>
          <Mensaje
            titulo={esPrimeraCita ? '3 · Confírmale la cita al profesional' : '3 · Confírmale la siguiente sesión al profesional'}
            nota={esPrimeraCita
              ? 'Entrega de la cita confirmada al profesional con el canal preferido de la persona, sus responsabilidades de contacto/asistencia y el enlace seguro al caso.'
              : 'Confirmación de la siguiente sesión acordada con enlace de videollamada y reporte de seguimiento.'}
            telefono={asignacion.profesional.telefono}
            texto={esPrimeraCita ? mensajeDeCitaConfirmadaAlProfesional({
              plantilla: plantillas?.WHATSAPP_DESPACHO_PROFESIONAL,
              profesional: asignacion.profesional.nombre,
              persona: persona.fullName,
              cuando: proximaCita?.cuando ?? 'la fecha acordada',
              modalidad: proximaCita?.modalidad ?? persona.preferredModality,
              canalContacto: persona.preferredContact,
              enlace: enlaceCaso,
              enlaceReunion,
              consentimientoFirmado: proximaCita?.consentSigned === true,
            }) : mensajeDeSiguienteCitaConfirmadaAlProfesional({
              plantilla: plantillas?.WHATSAPP_SIGUIENTE_CITA_PROFESIONAL,
              profesional: asignacion.profesional.nombre,
              persona: persona.fullName,
              cuando: proximaCita?.cuando ?? 'la fecha acordada',
              modalidad: proximaCita?.modalidad ?? persona.preferredModality,
              enlace: enlaceCaso,
              enlaceReunion,
            })}
            copiado={copiado === 'cita-prof'}
            alCopiar={(t) => copiar('cita-prof', t)}
          />

          <div className="mensaje__acciones" style={{ marginTop: 14 }}>
            <button
              className="boton-mini"
              data-tono="principal"
              type="button"
              onClick={() => setAgendando(true)}
            >
              <CalendarCheck size={14} />
              Agendar nueva sesión
            </button>
            <BotonReasignar
              asignacionId={asignacion.id}
              profesionalNombre={asignacion.profesional.nombre}
              textoBoton="Reasignar a otro profesional"
              onError={setError}
            />
          </div>
        </>
      ) : null}

      {agendando ? (
        <ModalAgendar
          personaId={persona.id}
          persona={persona}
          asignacionId={asignacion.id}
          profesional={asignacion.profesional}
          enlaceCaso={enlaceCaso}
          esNuevaSesion={asignacion.estado === 'ACTIVA'}
          onCerrar={() => setAgendando(false)}
        />
      ) : null}
    </div>
  )
}

function Mensaje({
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

      {mostrando ? (
        <pre className="mensaje__cuerpo" style={{ whiteSpace: 'pre-wrap' }}>
          {texto}
        </pre>
      ) : null}
    </div>
  )
}
