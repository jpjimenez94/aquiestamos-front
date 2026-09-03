'use client'

import { CalendarCheck } from 'lucide-react'
import type { Seguimiento } from '@/lib/seguimiento'
import { BotonNuevaSesion } from './BotonNuevaSesion'
import { BotonCerrarCaso } from './BotonCerrarCaso'
import { BotonReasignar } from './BotonReasignar'
import { BotonSeguimientoWhatsApp } from '../BotonSeguimientoWhatsApp'

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
  onAgendar,
  onError,
}: {
  queToca: Seguimiento | null
  proximaCita: { id?: string; cuando: string; modalidad: string } | null
  persona: { id: string; fullName: string; phone: string; preferredModality?: string | null }
  asignacion: { id: string; profesional: { id: string; nombre: string; telefono?: string } }
  enlaceCaso: string
  onAgendar: () => void
  onError: (m: string) => void
}) {
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
          <>
            <BotonNuevaSesion
              persona={persona}
              profesional={asignacion.profesional}
              asignacionId={asignacion.id}
              enlaceCaso={enlaceCaso}
              texto="Agendar la siguiente sesión"
              variante="destacado"
            />
            <BotonCerrarCaso asignacionId={asignacion.id} />
          </>
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
