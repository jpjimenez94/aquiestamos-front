'use client'

import { useState } from 'react'
import { enviarCheckInAction, ofrecerseComoSupervisorAction } from './actions'

/**
 * «¿Cómo estás tú?»: el espacio para quien acompaña.
 *
 * Va al final del enlace del caso porque es la única puerta que el
 * profesional tiene —no hay cuenta de portal, a propósito— y porque el
 * momento de preguntarle cómo está es cuando acaba de reportar una sesión, no
 * en un correo suelto tres semanas después.
 *
 * Se abre a partir de cierto número de sesiones hechas en la red, con
 * cualquier persona (Parametrización: SESIONES_PARA_CHECKIN). Antes del
 * umbral no se esconde el bloque: se le dice cuánto lleva y desde cuándo se
 * abre, para que sepa que existe.
 *
 * Y abajo, aparte, ofrecerse a facilitar las sesiones grupales. Ofrecerse no
 * lo compromete a nada: coordinación le propone cada sesión, y él dice.
 */

export type EstadoDeCuidado = {
  sesiones: number
  umbral: number
  habilitado: boolean
  esSupervisor: boolean
  checkIns: {
    id: string
    necesidad: string
    necesidadLegible: string
    fecha: string
    sesionGrupal: { id: string; cuando: string; estado: string } | null
  }[]
}

const NECESIDADES: { valor: 'APOYO_PARA_MI' | 'AYUDA_CON_UN_CASO' | 'DESCARGARME'; titulo: string; detalle: string }[] = [
  {
    valor: 'APOYO_PARA_MI',
    titulo: 'Quiero apoyo para mí',
    detalle: 'Esto me está pesando y quisiera hablarlo con alguien de la red.',
  },
  {
    valor: 'AYUDA_CON_UN_CASO',
    titulo: 'Necesito ayuda con un caso',
    detalle: 'Quiero pensar con otros psicólogos cómo manejar algo concreto.',
  },
  {
    valor: 'DESCARGARME',
    titulo: 'Solo quiero descargarme',
    detalle: 'No necesito que me resuelvan nada. Quiero contarlo y que alguien escuche.',
  },
]

export function CuidadoDelProfesional({
  patientId,
  estado,
}: {
  patientId: string
  estado: EstadoDeCuidado
}) {
  const [abierto, setAbierto] = useState(false)
  const [necesidad, setNecesidad] = useState<(typeof NECESIDADES)[number]['valor'] | null>(null)
  const [notas, setNotas] = useState('')
  const [pregunta, setPregunta] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tono: 'ok' | 'error'; texto: string } | null>(null)
  const [enviado, setEnviado] = useState(false)

  const [esSupervisor, setEsSupervisor] = useState(estado.esSupervisor)
  const [cambiandoSupervisor, setCambiandoSupervisor] = useState(false)
  const [mensajeSupervisor, setMensajeSupervisor] = useState<string | null>(null)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setMensaje(null)
    if (!necesidad) {
      setMensaje({ tono: 'error', texto: 'Dinos qué necesitas: apoyo para ti, ayuda con un caso, o descargarte.' })
      return
    }
    setEnviando(true)
    try {
      const r = await enviarCheckInAction(patientId, {
        need: necesidad,
        notes: notas.trim() || null,
        questionForGroup: pregunta.trim() || null,
      })
      if (!r.success) {
        setMensaje({ tono: 'error', texto: r.message })
        return
      }
      setEnviado(true)
      setMensaje({ tono: 'ok', texto: r.message })
    } finally {
      setEnviando(false)
    }
  }

  async function alternarSupervisor() {
    setMensajeSupervisor(null)
    setCambiandoSupervisor(true)
    try {
      const r = await ofrecerseComoSupervisorAction(patientId, !esSupervisor)
      if (!r.success) {
        setMensajeSupervisor(r.message)
        return
      }
      setEsSupervisor(r.esSupervisor === true)
      setMensajeSupervisor(r.message)
    } finally {
      setCambiandoSupervisor(false)
    }
  }

  const faltan = Math.max(0, estado.umbral - estado.sesiones)

  return (
    <div className="panel" id="cuidado">
      <h2>¿Cómo estás tú?</h2>
      <p className="panel__nota">
        Quien acompaña también se carga. Este espacio es para ti: para pedir apoyo, pensar un caso
        con otros psicólogos, o simplemente descargarte. Lo lee coordinación y lo cuadra con una
        sesión grupal de seguimiento.
      </p>

      <p className="panel__nota" style={{ marginTop: 6 }}>
        Llevas <strong>{estado.sesiones}</strong> {estado.sesiones === 1 ? 'sesión' : 'sesiones'} en
        la red.
        {estado.habilitado
          ? ' El espacio está abierto para ti.'
          : ` Se abre a partir de ${estado.umbral}: ${faltan === 1 ? 'falta una' : `faltan ${faltan}`}.`}
      </p>

      {estado.checkIns.length > 0 ? (
        <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: '0.88rem', color: '#475569' }}>
          {estado.checkIns.map((c) => (
            <li key={c.id}>
              Pediste el espacio el {new Date(c.fecha).toLocaleDateString('es-CO')} ({c.necesidadLegible})
              {c.sesionGrupal
                ? ` · sesión grupal ${c.sesionGrupal.estado.toLowerCase()} para el ${new Date(c.sesionGrupal.cuando).toLocaleDateString('es-CO')}`
                : ' · todavía sin sesión convocada'}
            </li>
          ))}
        </ul>
      ) : null}

      {estado.habilitado && !enviado ? (
        !abierto ? (
          <button
            type="button"
            className="boton"
            style={{ marginTop: 14 }}
            onClick={() => setAbierto(true)}
          >
            Pedir el espacio
          </button>
        ) : (
          <form onSubmit={enviar} style={{ marginTop: 14, display: 'grid', gap: 12 }}>
            <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
              <legend style={{ fontWeight: 700, marginBottom: 4 }}>¿Qué necesitas?</legend>
              {NECESIDADES.map((n) => (
                <label
                  key={n.valor}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    padding: '10px 12px',
                    border: `1px solid ${necesidad === n.valor ? '#2e7d5b' : '#e4dfd3'}`,
                    borderRadius: 10,
                    background: necesidad === n.valor ? '#e4efe8' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="necesidad"
                    value={n.valor}
                    checked={necesidad === n.valor}
                    onChange={() => setNecesidad(n.valor)}
                    style={{ marginTop: 3 }}
                  />
                  <span>
                    <strong style={{ display: 'block' }}>{n.titulo}</strong>
                    <span style={{ fontSize: '0.86rem', color: '#475569' }}>{n.detalle}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontWeight: 700 }}>
                En qué andas <span style={{ fontWeight: 400, color: '#64748b' }}>(opcional)</span>
              </span>
              <textarea
                className="input"
                rows={3}
                maxLength={1000}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Lo que quieras contar. No es contenido clínico de nadie: es sobre ti."
              />
            </label>

            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontWeight: 700 }}>
                ¿Qué te gustaría que se hablara en la sesión grupal?{' '}
                <span style={{ fontWeight: 400, color: '#64748b' }}>(opcional)</span>
              </span>
              <textarea
                className="input"
                rows={2}
                maxLength={600}
                value={pregunta}
                onChange={(e) => setPregunta(e.target.value)}
                placeholder="Una pregunta o un tema. Con esto se arma la agenda de la sesión."
              />
            </label>

            {mensaje ? (
              <p className={mensaje.tono === 'error' ? 'tamizaje__error' : 'panel__nota'} role="alert">
                {mensaje.texto}
              </p>
            ) : null}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="submit" className="boton" disabled={enviando}>
                {enviando ? 'Enviando…' : 'Enviar'}
              </button>
              <button type="button" className="boton-mini" onClick={() => setAbierto(false)} disabled={enviando}>
                Ahora no
              </button>
            </div>
          </form>
        )
      ) : null}

      {enviado && mensaje ? (
        <p className="panel__nota" role="status" style={{ marginTop: 12, color: '#2e7d5b', fontWeight: 600 }}>
          {mensaje.texto}
        </p>
      ) : null}

      {/*
        Ofrecerse a facilitar. Aparte del check-in a propósito: una cosa es
        pedir apoyo y otra darlo, y las dos caben en la misma persona en
        momentos distintos.
      */}
      <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid #e4dfd3' }}>
        <h3 style={{ fontSize: '1rem', margin: '0 0 4px' }}>Acompañar a otros profesionales</h3>
        <p className="panel__nota">
          Las sesiones grupales de seguimiento las facilita un psicólogo de la red. Si te ofreces,
          coordinación te puede proponer facilitar una; cada vez decides tú.
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
          <button
            type="button"
            className={esSupervisor ? 'boton-mini' : 'boton'}
            onClick={alternarSupervisor}
            disabled={cambiandoSupervisor}
          >
            {cambiandoSupervisor
              ? 'Guardando…'
              : esSupervisor
                ? 'Ya no quiero facilitar sesiones'
                : 'Me ofrezco a facilitar sesiones grupales'}
          </button>
          {esSupervisor ? (
            <span style={{ fontSize: '0.86rem', color: '#2e7d5b', fontWeight: 600 }}>
              ✓ Estás ofrecido como supervisor
            </span>
          ) : null}
        </div>
        {mensajeSupervisor ? (
          <p className="panel__nota" role="status" style={{ marginTop: 8 }}>
            {mensajeSupervisor}
          </p>
        ) : null}
      </div>
    </div>
  )
}
