'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, MessageCircle, CalendarCheck, RotateCcw, Clock } from 'lucide-react'
import {
  mensajeDePropuesta,
  mensajeParaCuadrarHorario,
  mensajeDePedirNuevaDisponibilidadAlProfesional,
  mensajeDeExcusasYReagendamiento,
  mensajeDeCitaAlProfesional,
  enlaceWhatsapp,
} from '@/lib/mensajes'
import { enBogota } from '@/lib/fechas'
import { ModalAgendar } from './ModalAgendar'

/**
 * El caso, según en qué punto va la negociación.
 *
 * Asignar dejó de ser un clic. Ahora es una conversación de tres —quien
 * coordina, el profesional y la persona acompañada— y cada tramo tiene
 * exactamente un mensaje y una acción. Este panel decide cuál toca, para que
 * quien coordina no tenga que acordarse.
 *
 * Antes ese «en qué punto va» no existía en ninguna parte: vivía en el
 * historial de WhatsApp de una persona. Si esa persona faltaba, el caso se
 * quedaba quieto sin que nadie lo notara.
 */

export type Asignacion = {
  id: string
  estado: 'PROPUESTA' | 'ACEPTADA' | 'ACTIVA' | 'RECHAZADA' | 'CANCELADA' | 'CERRADA'
  estadoLegible: string
  siguientePaso: string | null
  desde: string
  respondioEn: string | null
  diasQuePuede: string[]
  franjasQuePuede: string[]
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
  proximaCita,
}: {
  persona: Persona
  asignacion: Asignacion
  enlaceCaso: string
  /** La cita abierta más próxima, para que el mensaje diga la fecha real. */
  proximaCita?: { cuando: string; modalidad: string } | null
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
          <Clock size={14} />
          {asignacion.siguientePaso}
        </p>
      ) : null}

      {error ? (
        <div className="aviso-portal" data-tono="rojo" style={{ marginTop: 12 }}>
          {error}
        </div>
      ) : null}

      {/* PASO 1 — Se le propuso y estamos esperando que entre a su enlace. */}
      {asignacion.estado === 'PROPUESTA' ? (
        <Mensaje
          titulo="1 · Mándale la propuesta"
          nota="Lleva el enlace por donde tiene que responder. Los datos de contacto de la persona solo se le abren si acepta."
          telefono={asignacion.profesional.telefono}
          texto={mensajeDePropuesta({
            profesional: asignacion.profesional.nombre,
            ciudad: persona.city,
            prioridad: persona.priority,
            modalidad: persona.preferredModality,
            dias: persona.availableDays,
            franjas: persona.availableSlots,
            enlace: enlaceCaso,
          })}
          copiado={copiado === 'propuesta'}
          alCopiar={(t) => copiar('propuesta', t)}
        />
      ) : null}

      {/* PASO 2 — Aceptó y dejó sus horarios. Toca cuadrar con la persona. */}
      {asignacion.estado === 'ACEPTADA' ? (
        <>
          <div className="caso-horarios">
            <strong>Dijo que puede:</strong>
            <span>
              {asignacion.diasQuePuede.map((d) => DIA[d] ?? d).join(', ') || 'sin días'}
              {' · '}
              {asignacion.franjasQuePuede.map((f) => FRANJA[f] ?? f).join(', ') || 'sin franjas'}
            </span>
            {asignacion.nota ? <em>{asignacion.nota}</em> : null}
          </div>

          <Mensaje
            titulo="2 · Escríbele a la persona con esos horarios"
            nota="Lleva el nombre del profesional pero no su teléfono: quien cuadra el horario eres tú."
            telefono={persona.phone}
            texto={mensajeParaCuadrarHorario({
              persona: persona.fullName,
              profesional: asignacion.profesional.nombre,
              dias: asignacion.diasQuePuede,
              franjas: asignacion.franjasQuePuede,
              nota: asignacion.nota,
            })}
            copiado={copiado === 'cuadrar'}
            alCopiar={(t) => copiar('cuadrar', t)}
          />

          <Mensaje
            titulo="2b · Si el profesional tuvo un imprevisto: pedirle nueva disponibilidad"
            nota="Para que te confirme qué otros días u horas tiene libres antes de armar la propuesta a la persona."
            telefono={asignacion.profesional.telefono}
            texto={mensajeDePedirNuevaDisponibilidadAlProfesional({
              profesional: asignacion.profesional.nombre,
              persona: persona.fullName,
              enlace: enlaceCaso,
            })}
            copiado={copiado === 'disp-prof'}
            alCopiar={(t) => copiar('disp-prof', t)}
          />

          <Mensaje
            titulo="2c · Si el profesional tuvo un imprevisto: excusas y nueva propuesta a la persona"
            nota="Para cuando el profesional ya te dio sus nuevos espacios y vas a coordinar la nueva fecha con la persona."
            telefono={persona.phone}
            texto={mensajeDeExcusasYReagendamiento({
              persona: persona.fullName,
              profesional: asignacion.profesional.nombre,
              motivo: 'un compromiso médico/personal de última hora',
              dias: asignacion.diasQuePuede,
              franjas: asignacion.franjasQuePuede,
              nota: asignacion.nota,
            })}
            copiado={copiado === 'excusas'}
            alCopiar={(t) => copiar('excusas', t)}
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
            <BotonCancelar asignacionId={asignacion.id} onError={setError} />
          </div>
        </>
      ) : null}

      {/* PASO 3 — Hay cita. Se le confirma al profesional. */}
      {asignacion.estado === 'ACTIVA' ? (
        <>
          <Mensaje
            titulo="3 · Confírmale la cita al profesional"
            nota="Los datos de la persona siguen detrás de su enlace, como siempre."
            telefono={asignacion.profesional.telefono}
            texto={mensajeDeCitaAlProfesional({
              profesional: asignacion.profesional.nombre,
              // La fecha real de la cita, no un «la fecha acordada» genérico.
              // Y la modalidad de LA CITA, no la preferencia de la persona:
              // «le da igual» no es un dato para quien debe presentarse.
              cuando: proximaCita?.cuando ?? 'la fecha acordada',
              modalidad: proximaCita?.modalidad ?? persona.preferredModality,
              enlace: enlaceCaso,
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
          </div>
        </>
      ) : null}

      {terminada ? (
        <div className="aviso-portal" data-tono="rojo" style={{ marginTop: 12 }}>
          <strong>
            {asignacion.estado === 'RECHAZADA'
              ? `${asignacion.profesional.nombre} no pudo tomar el caso.`
              : 'No se pudo cuadrar horario.'}
          </strong>
          {asignacion.motivoRechazo ? ` Dijo: ${asignacion.motivoRechazo}.` : ''} Esta persona
          vuelve a la cola: proponle el caso a otro profesional.
        </div>
      ) : null}

      {agendando ? (
        <ModalAgendar
          asignacionId={asignacion.id}
          personaId={persona.id}
          profesionalId={asignacion.profesional.id}
          persona={persona}
          profesional={asignacion.profesional}
          enlaceCaso={enlaceCaso}
          esNuevaSesion={asignacion.estado === 'ACTIVA'}
          onCerrar={() => setAgendando(false)}
        />
      ) : null}
    </div>
  )
}

/** Un mensaje listo para mandar: WhatsApp, copiar, y verlo antes de enviarlo. */
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
  telefono: string | null
  texto: string
  copiado: boolean
  alCopiar: (texto: string) => void
}) {
  const [verTexto, setVerTexto] = useState(false)
  const whatsapp = enlaceWhatsapp(telefono, texto)

  return (
    <div className="mensaje" style={{ marginTop: 18 }}>
      <h3 className="caso-paso">{titulo}</h3>
      <p className="panel__nota" style={{ marginTop: 0 }}>
        {nota}
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
        <button className="boton-mini" type="button" onClick={() => alCopiar(texto)}>
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

/**
 * Aceptó, pero no hubo forma de cuadrar. Pide el motivo a propósito: saber si
 * el problema fue el horario, la ciudad o que la persona no contestó es lo que
 * permite ver si el fallo es del caso o de la red.
 */
function BotonCancelar({
  asignacionId,
  onError,
}: {
  asignacionId: string
  onError: (m: string) => void
}) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function cancelar() {
    if (motivo.trim().length < 3) {
      onError('Cuéntanos por qué no se pudo cuadrar.')
      return
    }
    setEnviando(true)
    try {
      const r = await fetch(`/api/portal/appointments/asignaciones/${asignacionId}/cancelar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: motivo.trim() }),
      })
      const d = await r.json()
      if (!r.ok || !d.success) {
        onError(d.message ?? 'No se pudo cancelar')
        return
      }
      router.refresh()
    } catch {
      onError('No pudimos conectarnos con el servidor')
    } finally {
      setEnviando(false)
    }
  }

  if (!confirmando) {
    return (
      <button className="boton-mini" type="button" onClick={() => setConfirmando(true)}>
        <RotateCcw size={14} />
        No se pudo cuadrar
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      <input
        className="input"
        style={{ maxWidth: 260 }}
        placeholder="¿Por qué no se pudo?"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
      />
      <button
        className="boton-mini"
        data-tono="peligro"
        type="button"
        onClick={cancelar}
        disabled={enviando}
      >
        {enviando ? 'Cancelando…' : 'Confirmar'}
      </button>
      <button className="boton-mini" type="button" onClick={() => setConfirmando(false)}>
        Volver
      </button>
    </div>
  )
}

