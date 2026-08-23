'use client'

import { useState } from 'react'
import { firmarConsentimientoAction } from './actions'

/**
 * La versión del texto que se firma. Nunca edites el texto de una versión ya
 * publicada: crea una nueva y súbela aquí. Es lo único que permite probar
 * después qué aceptó exactamente quien firmó en agosto si el texto cambia en
 * noviembre — misma regla que la autorización de datos.
 */
const VERSION = 'sesion-2026-08'

/**
 * El texto del consentimiento, punto por punto y en el idioma de la red: sin
 * párrafos de contrato que nadie lee. Cada punto es una frase que la persona
 * puede entender desde el teléfono y con poca cabeza.
 */
const PUNTOS = [
  {
    titulo: 'Qué es esto',
    texto:
      'Un acompañamiento psicológico voluntario y gratuito, con un profesional de la Red Aquí Estamos. No reemplaza un tratamiento médico ni psiquiátrico, y no somos un servicio de emergencias.',
  },
  {
    titulo: 'Confidencialidad',
    texto:
      'Lo que hables en la sesión es confidencial. Tiene un solo límite, y es por tu protección: si hay riesgo serio para tu vida o la de otra persona, el profesional puede activar ayuda.',
  },
  {
    titulo: 'Es voluntario',
    texto:
      'Puedes pausar o dejar el acompañamiento cuando quieras, sin dar explicaciones y sin que eso cambie cómo te tratamos.',
  },
  {
    titulo: 'Tus datos',
    texto:
      'Usamos tus datos solo para coordinar el acompañamiento, como dice nuestra política de datos. La red no guarda historia clínica de tus sesiones.',
  },
]

export function FormularioConsentimiento({
  token,
  esMenor,
  yaFirmado,
}: {
  token: string
  esMenor: boolean
  yaFirmado: boolean
}) {
  const [firmado, setFirmado] = useState(yaFirmado)
  const [acepta, setAcepta] = useState(false)
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (firmado) {
    return (
      <div className="tamizaje__gracias" role="status">
        <svg
          className="tamizaje__gracias-icono"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2>Quedó firmado</h2>
        <p>Todo listo para tu sesión. No tienes que hacer nada más.</p>
      </div>
    )
  }

  async function firmar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!acepta) {
      setError('Marca la casilla para aceptar.')
      return
    }
    if (nombre.trim().length < 5) {
      setError('Escribe tu nombre completo: esa es tu firma.')
      return
    }

    setEnviando(true)
    try {
      const d = await firmarConsentimientoAction(token, {
        acepta: true,
        nombreFirma: nombre.trim(),
        version: VERSION,
      })
      if (!d.success) {
        setError(d.message)
        return
      }
      setFirmado(true)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="tamizaje__form" onSubmit={firmar} noValidate>
      {PUNTOS.map((p) => (
        <div key={p.titulo}>
          <strong style={{ display: 'block', marginBottom: 4 }}>{p.titulo}</strong>
          <p className="tamizaje__aclaracion" style={{ margin: 0 }}>
            {p.texto}
          </p>
        </div>
      ))}

      {esMenor ? (
        <p className="tamizaje__nota">
          Como eres menor de edad, quien acepta y firma aquí debe ser tu madre, padre o
          acudiente.
        </p>
      ) : null}

      <label className="tamizaje__autorizacion">
        <input
          type="checkbox"
          checked={acepta}
          onChange={(e) => {
            setAcepta(e.target.checked)
            setError(null)
          }}
        />
        <span>
          Leí y acepto este consentimiento para recibir el acompañamiento.
          {esMenor ? ' Soy la madre, el padre o acudiente y autorizo la sesión.' : ''}
        </span>
      </label>

      <div>
        <label className="field__label" htmlFor="firma">
          Tu nombre completo *
        </label>
        <p className="tamizaje__ayuda" style={{ marginLeft: 0 }}>
          Escribirlo aquí es tu firma.
        </p>
        <input
          id="firma"
          className="input"
          value={nombre}
          maxLength={120}
          onChange={(e) => {
            setNombre(e.target.value)
            setError(null)
          }}
        />
      </div>

      {error ? (
        <p className="tamizaje__error" role="alert">
          {error}
        </p>
      ) : null}

      <button className="tamizaje__enviar" type="submit" disabled={enviando}>
        {enviando ? 'Firmando…' : 'Aceptar y firmar'}
      </button>
    </form>
  )
}
