'use client'

import { useState } from 'react'
import { enviarCheckInAction } from './actions'

/**
 * «¿Cómo estás tú?»: el espacio para quien acompaña.
 *
 * Va al final del enlace del caso porque es la única puerta que el
 * profesional tiene —no hay cuenta de portal, a propósito— y porque el
 * momento de preguntarle cómo está es cuando acaba de reportar una sesión, no
 * en un correo suelto tres semanas después.
 *
 * Solo aparece a partir de cierto número de sesiones hechas en la red, con
 * cualquier persona (Parametrización: SESIONES_PARA_CHECKIN). Antes del
 * umbral no se le pregunta nada: el bloque no existe. La única excepción es
 * quien ya pidió el espacio alguna vez —se le deja ver en qué va su sesión,
 * sin volver a preguntarle—.
 *
 * Aquí no se pregunta si quiere facilitar sesiones grupales. Quién puede
 * facilitar ya se sabe por el formulario de voluntarios: coordinación lo
 * cuadra por WhatsApp y lo marca desde su ficha.
 *
 * El diseño es el de los demás formularios de esta pantalla —las clases
 * `tamizaje__*` y `field__*`—: la opción es un botón que se marca, el envío es
 * el botón grande, y lo secundario va en `boton-mini`.
 */

export type EstadoDeCuidado = {
  sesiones: number
  umbral: number
  habilitado: boolean
  checkIns: {
    id: string
    necesidad: string
    necesidadLegible: string
    fecha: string
    sesionGrupal: { id: string; cuando: string; estado: string } | null
  }[]
}

type Necesidad = 'APOYO_PARA_MI' | 'AYUDA_CON_UN_CASO' | 'DESCARGARME'

const NECESIDADES: { valor: Necesidad; titulo: string; detalle: string }[] = [
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

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', day: 'numeric', month: 'long' })

export function CuidadoDelProfesional({
  patientId,
  estado,
}: {
  patientId: string
  estado: EstadoDeCuidado
}) {
  const [abierto, setAbierto] = useState(false)
  const [necesidad, setNecesidad] = useState<Necesidad | null>(null)
  const [notas, setNotas] = useState('')
  const [pregunta, setPregunta] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviado, setEnviado] = useState<string | null>(null)

  // Antes del umbral no se pregunta nada. Si nunca pidió el espacio, no hay
  // bloque; si ya lo pidió, solo se le deja ver en qué va.
  if (!estado.habilitado && estado.checkIns.length === 0) return null

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!necesidad) {
      setError('Dinos qué necesitas: apoyo para ti, ayuda con un caso, o descargarte.')
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
        setError(r.message)
        return
      }
      setEnviado(r.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="panel" id="cuidado">
      <h2>¿Cómo estás tú?</h2>
      <p className="panel__nota">
        Quien acompaña también se carga. Este espacio es para ti: para pedir apoyo, pensar un caso
        con otros psicólogos, o simplemente descargarte. Lo lee coordinación y lo cuadra con una
        sesión grupal de seguimiento.
      </p>
      <p className="panel__nota">
        Llevas <strong>{estado.sesiones}</strong> {estado.sesiones === 1 ? 'sesión' : 'sesiones'} en
        la red.
      </p>

      {estado.checkIns.length > 0 ? (
        <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
          {estado.checkIns.map((c) => (
            <li key={c.id} className="panel__nota" style={{ margin: 0 }}>
              Pediste el espacio el {fecha(c.fecha)} ({c.necesidadLegible})
              {c.sesionGrupal
                ? ` · sesión grupal ${c.sesionGrupal.estado.toLowerCase()} para el ${fecha(c.sesionGrupal.cuando)}`
                : ' · todavía sin sesión convocada'}
            </li>
          ))}
        </ul>
      ) : null}

      {enviado ? (
        <div className="tamizaje__gracias" role="status" style={{ marginTop: 14 }}>
          <svg className="tamizaje__gracias-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2>Gracias por decirlo</h2>
          <p>{enviado}</p>
        </div>
      ) : estado.habilitado && !abierto ? (
        <button className="tamizaje__enviar" type="button" onClick={() => setAbierto(true)} style={{ marginTop: 14 }}>
          Pedir el espacio
        </button>
      ) : estado.habilitado ? (
        <form className="tamizaje__form" onSubmit={enviar} noValidate style={{ marginTop: 14 }}>
          <fieldset className="tamizaje__pregunta" data-falta={error !== null && necesidad === null}>
            <legend>¿Qué necesitas?</legend>
            <div className="tamizaje__opciones" style={{ gridTemplateColumns: '1fr' }}>
              {NECESIDADES.map((n) => (
                <button
                  key={n.valor}
                  className="tamizaje__opcion"
                  type="button"
                  data-elegida={necesidad === n.valor}
                  aria-pressed={necesidad === n.valor}
                  onClick={() => {
                    setNecesidad(n.valor)
                    setError(null)
                  }}
                  style={{ textAlign: 'left' }}
                >
                  <strong style={{ display: 'block' }}>{n.titulo}</strong>
                  <span style={{ fontSize: '0.86rem', fontWeight: 400, opacity: 0.85 }}>{n.detalle}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label className="field__label" htmlFor="cuidado-notas">
              En qué andas <span style={{ fontWeight: 400 }}>(opcional)</span>
            </label>
            <p className="tamizaje__ayuda" style={{ marginLeft: 0 }}>
              Lo que quieras contar. No es contenido clínico de nadie: es sobre ti.
            </p>
            <textarea
              id="cuidado-notas"
              className="input"
              rows={3}
              maxLength={1000}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>

          <div>
            <label className="field__label" htmlFor="cuidado-pregunta">
              ¿Qué te gustaría que se hablara en la sesión grupal?{' '}
              <span style={{ fontWeight: 400 }}>(opcional)</span>
            </label>
            <p className="tamizaje__ayuda" style={{ marginLeft: 0 }}>
              Una pregunta o un tema. Con esto se arma la agenda de la sesión.
            </p>
            <textarea
              id="cuidado-pregunta"
              className="input"
              rows={2}
              maxLength={600}
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
            />
          </div>

          {error ? (
            <p className="tamizaje__error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="tamizaje__enviar" type="submit" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar'}
          </button>
          <button className="boton-mini" type="button" onClick={() => setAbierto(false)} disabled={enviando}>
            Ahora no
          </button>
        </form>
      ) : null}
    </div>
  )
}
