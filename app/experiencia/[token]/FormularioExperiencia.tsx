'use client'

import { useState } from 'react'
import { responderExperienciaAction } from './actions'

const OPCIONES_SENTIR = [
  { valor: 'MUY_BIEN', etiqueta: 'Muy bien / Me sentí escuchada(o)' },
  { valor: 'BIEN', etiqueta: 'Bien' },
  { valor: 'REGULAR', etiqueta: 'Regular / Con dudas' },
  { valor: 'INCOMODO', etiqueta: 'Incómoda(o) o insatisfecha(o)' },
] as const

const OPCIONES_TRATO = [
  { valor: 'EXCELENTE', etiqueta: 'Sí, muy puntual y muy empático(a)' },
  { valor: 'ADECUADO', etiqueta: 'Sí, todo adecuado y respetuoso' },
  { valor: 'A_MEJORAR', etiqueta: 'Llegó tarde o sentí poco interés' },
] as const

const OPCIONES_HERRAMIENTAS = [
  { valor: 'MUCHA_CLARIDAD', etiqueta: 'Sí, me dio herramientas y mayor claridad' },
  { valor: 'ALGO', etiqueta: 'Me ayudó un poco a desahogarme' },
  { valor: 'POCO_O_NADA', etiqueta: 'No sentí avance ni herramientas claras' },
] as const

const OPCIONES_CALIDAD = [
  { valor: 'SIN_PROBLEMAS', etiqueta: 'Excelente, sin interrupciones ni fallas' },
  { valor: 'CON_DIFICULTADES', etiqueta: 'Hubo problemas de señal, ruido o conexión' },
  { valor: 'PREFIERO_OTRA_MODALIDAD', etiqueta: 'Prefiero cambiar de modalidad para la próxima' },
] as const

type Props = {
  token: string
  profesional?: string | null
}

export function FormularioExperiencia({ token, profesional }: Props) {
  const [lista, setLista] = useState(false)
  const [howFelt, setHowFelt] = useState<string>('')
  const [respectfulTreatment, setRespectfulTreatment] = useState<string>('')
  const [gotTools, setGotTools] = useState<string>('')
  const [sessionQuality, setSessionQuality] = useState<string>('')
  const [wantsToContinue, setWantsToContinue] = useState<string>('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const opcionesContinuar = [
    {
      valor: 'SI_MISMO',
      etiqueta: profesional
        ? `Sí, quiero continuar con ${profesional}`
        : 'Sí, quiero continuar con este profesional',
    },
    {
      valor: 'CAMBIAR',
      etiqueta: 'Me gustaría continuar pero con otra persona de la red',
    },
    {
      valor: 'SUFICIENTE',
      etiqueta: 'Siento que con esta sesión fue suficiente',
    },
  ] as const

  if (lista) {
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
        <h2>Gracias por contarnos</h2>
        <p>Tu respuesta nos ayuda a cuidarte y a acompañar mejor a quienes lo necesitan. Si vuelves a necesitarnos, aquí estamos.</p>
      </div>
    )
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!howFelt) {
      setError('Por favor cuéntanos cómo te sentiste en la sesión.')
      return
    }
    if (!wantsToContinue) {
      setError('Por favor indícanos si deseas continuar con el acompañamiento.')
      return
    }

    setEnviando(true)
    try {
      const r = await responderExperienciaAction(token, {
        howFelt: howFelt as 'MUY_BIEN' | 'BIEN' | 'REGULAR' | 'INCOMODO',
        respectfulTreatment: (respectfulTreatment as 'EXCELENTE' | 'ADECUADO' | 'A_MEJORAR') || null,
        gotTools: (gotTools as 'MUCHA_CLARIDAD' | 'ALGO' | 'POCO_O_NADA') || null,
        sessionQuality: (sessionQuality as 'SIN_PROBLEMAS' | 'CON_DIFICULTADES' | 'PREFIERO_OTRA_MODALIDAD') || null,
        wantsToContinue: wantsToContinue as 'SI_MISMO' | 'CAMBIAR' | 'SUFICIENTE',
        comment: comment.trim(),
      })
      if (!r.success) {
        setError(r.message)
        return
      }
      setLista(true)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="tamizaje__form" onSubmit={enviar} noValidate>
      <fieldset className="tamizaje__pregunta">
        <legend>1. ¿Cómo te sentiste en la sesión{profesional ? ` con ${profesional}` : ''}?</legend>
        <div className="tamizaje__opciones" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {OPCIONES_SENTIR.map((o) => (
            <button
              key={o.valor}
              className="tamizaje__opcion"
              type="button"
              data-elegida={howFelt === o.valor}
              aria-pressed={howFelt === o.valor}
              style={{ textAlign: 'left', padding: '10px 14px' }}
              onClick={() => {
                setHowFelt(o.valor)
                setError(null)
              }}
            >
              {o.etiqueta}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="tamizaje__pregunta">
        <legend>2. ¿El profesional fue puntual y te brindó un trato respetuoso y empático?</legend>
        <div className="tamizaje__opciones" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {OPCIONES_TRATO.map((o) => (
            <button
              key={o.valor}
              className="tamizaje__opcion"
              type="button"
              data-elegida={respectfulTreatment === o.valor}
              aria-pressed={respectfulTreatment === o.valor}
              style={{ textAlign: 'left', padding: '10px 14px' }}
              onClick={() => {
                setRespectfulTreatment(o.valor)
                setError(null)
              }}
            >
              {o.etiqueta}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="tamizaje__pregunta">
        <legend>3. ¿Sientes que la sesión te dio claridad, alivio o herramientas para tu situación?</legend>
        <div className="tamizaje__opciones" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {OPCIONES_HERRAMIENTAS.map((o) => (
            <button
              key={o.valor}
              className="tamizaje__opcion"
              type="button"
              data-elegida={gotTools === o.valor}
              aria-pressed={gotTools === o.valor}
              style={{ textAlign: 'left', padding: '10px 14px' }}
              onClick={() => {
                setGotTools(o.valor)
                setError(null)
              }}
            >
              {o.etiqueta}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="tamizaje__pregunta">
        <legend>4. ¿La comunicación (llamada / videollamada / presencial) funcionó sin problemas?</legend>
        <div className="tamizaje__opciones" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {OPCIONES_CALIDAD.map((o) => (
            <button
              key={o.valor}
              className="tamizaje__opcion"
              type="button"
              data-elegida={sessionQuality === o.valor}
              aria-pressed={sessionQuality === o.valor}
              style={{ textAlign: 'left', padding: '10px 14px' }}
              onClick={() => {
                setSessionQuality(o.valor)
                setError(null)
              }}
            >
              {o.etiqueta}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="tamizaje__pregunta">
        <legend>5. ¿Deseas continuar tu acompañamiento con {profesional ? ` ${profesional}` : 'este profesional'}?</legend>
        <div className="tamizaje__opciones" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {opcionesContinuar.map((o) => (
            <button
              key={o.valor}
              className="tamizaje__opcion"
              type="button"
              data-elegida={wantsToContinue === o.valor}
              aria-pressed={wantsToContinue === o.valor}
              style={{ textAlign: 'left', padding: '10px 14px' }}
              onClick={() => {
                setWantsToContinue(o.valor)
                setError(null)
              }}
            >
              {o.etiqueta}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="field__label" htmlFor="comentario">
          6. Cuéntanos brevemente tu experiencia o si algo no te gustó (opcional)
        </label>
        <p className="tamizaje__ayuda">
          Lo lee solo el equipo de coordinación de la red, no el profesional.
        </p>
        <textarea
          id="comentario"
          className="input"
          rows={3}
          maxLength={1000}
          placeholder="Escribe aquí cualquier comentario, dificultad o sugerencia..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      {error ? (
        <div className="tamizaje__error" role="alert">
          {error}
        </div>
      ) : null}

      <button
        className="tamizaje__enviar"
        type="submit"
        disabled={enviando}
        style={{
          marginTop: 14,
          minHeight: 52,
          padding: '14px 28px',
          borderRadius: 12,
          border: 'none',
          backgroundColor: '#059669',
          color: '#ffffff',
          fontFamily: 'inherit',
          fontSize: '1.05rem',
          fontWeight: 700,
          cursor: enviando ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
        }}
      >
        {enviando ? 'Enviando tu respuesta…' : 'Enviar respuesta'}
      </button>
    </form>
  )
}
