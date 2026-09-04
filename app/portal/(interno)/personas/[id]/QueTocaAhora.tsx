'use client'

import { useState } from 'react'
import { CalendarCheck } from 'lucide-react'
import type { Seguimiento } from '@/lib/seguimiento'
import { mensajeParaCuadrarHorario } from '@/lib/mensajes'
import { BotonNuevaSesion } from './BotonNuevaSesion'
import { BotonCerrarCaso } from './BotonCerrarCaso'
import { BotonReasignar } from './BotonReasignar'
import { BotonSeguimientoWhatsApp } from '../BotonSeguimientoWhatsApp'
import { Mensaje } from './Mensaje'

/**
 * Una tarjeta, una frase, un botón.
 *
 * Quien abre la ficha de un caso viene a una pregunta: ¿qué me toca hacer con
 * esta persona hoy? La respuesta la calcula `seguimientoPendiente` —la misma
 * regla que enciende la lista de personas— y aquí solo se le pone el botón que
 * la resuelve. Todo lo demás que se podía hacer con el caso sigue ahí, pero
 * plegado: la tarjeta no es un menú, es una instrucción.
 *
 * Los botones son los mismos que ya existían en otras pantallas. Esta tarjeta
 * no inventa ninguna acción; elige cuál enseñar.
 */
const TONO: Record<Seguimiento['urgencia'], { borde: string; fondo: string }> = {
  ahora: { borde: '#b45309', fondo: '#fffbeb' },
  pronto: { borde: '#059669', fondo: '#f0fdf4' },
  'cuando-puedas': { borde: '#94a3b8', fondo: '#f8fafc' },
}

export function QueTocaAhora({
  queToca,
  proximaCita,
  persona,
  asignacion,
  enlaceCaso,
  enlaceAgenda,
  plantillas,
  onAgendar,
  onError,
}: {
  queToca: Seguimiento | null
  proximaCita: { id?: string; cuando: string; modalidad: string } | null
  persona: { id: string; fullName: string; phone: string; preferredModality?: string | null }
  /**
   * `estado` viaja porque `BotonReasignar` lo necesita: decide si soltar el
   * caso se escribe como RECHAZADA —«el profesional no podía»— o como
   * CANCELADA. Aquí siempre será ACTIVA, que no admite rechazo, pero pasarlo
   * de verdad evita que la respuesta dependa de dónde esté montado el botón.
   */
  asignacion: { id: string; estado?: string; profesional: { id: string; nombre: string; telefono?: string } }
  enlaceCaso: string
  /** Enlace con el que la persona elige su propia hora, sobre la agenda real del profesional. */
  enlaceAgenda?: string | null
  /** Textos editables desde Parametrización. Mandan sobre los del código. */
  plantillas?: Record<string, string>
  onAgendar: () => void
  onError: (m: string) => void
}) {
  const [copiado, setCopiado] = useState(false)
  // Nada pendiente y una cita por delante: la frase dice cuándo, y el botón
  // lleva a la cita, que es donde vive todo lo de prepararla.
  if (!queToca) {
    const t = TONO['cuando-puedas']
    return (
      <div style={{ ...caja, borderColor: t.borde, background: t.fondo }}>
        <div style={{ minWidth: 0 }}>
          <div style={etiqueta}>Qué toca ahora</div>
          <strong style={titulo}>
            {proximaCita ? `Nada pendiente. Ya hay cita el ${proximaCita.cuando}.` : 'Nada pendiente.'}
          </strong>
          <div style={detalle}>
            {proximaCita
              ? 'Confirmación, consentimiento y recordatorios se manejan desde la cita.'
              : 'Cuando haga falta, agenda una sesión o cierra el caso desde «Más acciones».'}
          </div>
        </div>
        {proximaCita?.id ? (
          <a className="boton-mini" data-tono="principal" href={`/portal/agenda/${proximaCita.id}`}>
            Gestionar esta cita →
          </a>
        ) : null}
      </div>
    )
  }

  const t = TONO[queToca.urgencia]
  return (
    <div style={{ ...caja, borderColor: t.borde, background: t.fondo }}>
      <div style={{ minWidth: 0 }}>
        <div style={etiqueta}>Qué toca ahora</div>
        <strong style={titulo}>{queToca.accion}</strong>
        {queToca.detalle ? <div style={detalle}>{queToca.detalle}</div> : null}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0, alignItems: 'center' }}>
        {queToca.clave === 'recordar-cita' ? (
          proximaCita?.id ? (
            <a className="boton-mini" data-tono="principal" href={`/portal/agenda/${proximaCita.id}`}>
              Recordarle la cita →
            </a>
          ) : null
        ) : null}

        {queToca.clave === 'preguntar-como-fue' ? (
          <BotonSeguimientoWhatsApp
            pacienteNombre={persona.fullName}
            pacienteTelefono={persona.phone}
            profesionalNombre={asignacion.profesional.nombre}
            profesionalTelefono={asignacion.profesional.telefono}
            enlaceCaso={enlaceCaso}
          />
        ) : null}

        {queToca.clave === 'agendar-siguiente' ? (
          <BotonCerrarCaso asignacionId={asignacion.id} />
        ) : null}

        {queToca.clave === 'cita-cancelada' ? (
          <>
            <button className="boton-mini" data-tono="principal" type="button" onClick={onAgendar}>
              <CalendarCheck size={14} />
              Agendar otra sesión
            </button>
            <BotonReasignar
              asignacionId={asignacion.id}
              profesionalNombre={asignacion.profesional.nombre}
              personaNombre={persona.fullName}
              personaTelefono={persona.phone}
              cuandoAnterior={proximaCita?.cuando ?? null}
              estadoAsignacion={asignacion.estado}
              textoBoton="Reasignar"
              onError={onError}
            />
          </>
        ) : null}

        {queToca.clave === 'sin-elegir-hora' || queToca.clave === 'sin-asignar' ? (
          <button className="boton-mini" data-tono="principal" type="button" onClick={onAgendar}>
            <CalendarCheck size={14} />
            Cuadrar el horario
          </button>
        ) : null}
      </div>

      {/*
        Cuándo es la siguiente sesión no lo dijo el reporte del profesional a
        propósito: depende de la disponibilidad y el estado de salud de la
        persona, y eso solo lo sabe ella. Coordinación no debería escoger una
        fecha por su cuenta — el mismo enlace con el que agendó la primera vez
        sirve para todas las siguientes, sobre la agenda real del profesional.

        «Ya me confirmó: agendar» sigue existiendo, para cuando ella respondió
        por teléfono o WhatsApp y coordinación solo transcribe la hora que
        dijo — no para que coordinación decida la hora.
      */}
      {queToca?.clave === 'agendar-siguiente' ? (
        <div style={{ marginTop: 10 }}>
          <Mensaje
            titulo="Mándale su enlace para que elija hora"
            // Con sujeto, por lo mismo que en el paso 4 de la ficha: «ve» y
            // «agenda» sin sujeto se leen como órdenes a quien coordina.
            nota="Ella elige su hora sobre la agenda real del profesional, cuando su salud y su tiempo se lo permitan. El enlace le sirve para todas sus sesiones."
            telefono={persona.phone}
            texto={mensajeParaCuadrarHorario({
              persona: persona.fullName,
              profesional: asignacion.profesional.nombre,
              dias: [],
              franjas: [],
              enlaceAgenda,
              esPrimeraVez: false,
              plantilla: plantillas?.WHATSAPP_CUADRAR_HORARIO_PERSONA,
            })}
            copiado={copiado}
            alCopiar={(t) => {
              navigator.clipboard.writeText(t)
              setCopiado(true)
              setTimeout(() => setCopiado(false), 1500)
            }}
          />
          <div style={{ marginTop: 8 }}>
            <BotonNuevaSesion
              persona={persona}
              profesional={asignacion.profesional}
              asignacionId={asignacion.id}
              enlaceCaso={enlaceCaso}
              texto="Ya me confirmó: agendar"
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

const caja: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 14,
  flexWrap: 'wrap',
  border: '1px solid',
  borderLeftWidth: 4,
  borderRadius: 10,
  padding: '14px 16px',
  marginTop: 10,
}
const etiqueta: React.CSSProperties = {
  fontSize: '0.68rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  fontWeight: 700,
  color: 'var(--color-text-light)',
  marginBottom: 2,
}
const titulo: React.CSSProperties = { display: 'block', fontSize: '1rem', lineHeight: 1.3 }
const detalle: React.CSSProperties = {
  fontSize: '0.84rem',
  color: 'var(--color-text-light)',
  marginTop: 3,
}
