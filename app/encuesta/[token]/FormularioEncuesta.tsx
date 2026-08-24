'use client'

import { useState } from 'react'
import { responderEncuestaAction } from './actions'

/**
 * Dos preguntas con opciones grandes —el patrón del tamizaje: un pulgar en un
 * teléfono— y un campo libre corto. Nada es obligatorio salvo las dos
 * preguntas, y no responder nunca tiene consecuencia.
 */

const AYUDA = [
  { valor: 'SI', etiqueta: 'Sí, me sirvió' },
  { valor: 'ALGO', etiqueta: 'Algo me sirvió' },
  { valor: 'NO', etiqueta: 'No me sirvió' },
] as const

export function FormularioEncuesta({
  token,
  yaRespondida,
}: {
  token: string
  yaRespondida: boolean
}) {
  const [lista, setLista] = useState(yaRespondida)
  const [ayudo, setAyudo] = useState<string>('')
  const [recomendaria, setRecomendaria] = useState<boolean | null>(null)
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

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
        <p>Nos ayuda a acompañar mejor. Si vuelves a necesitarnos, aquí estamos.</p>
      </div>
    )
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!ayudo) {
      setError('Cuéntanos si te sirvió.')
      return
    }
    if (recomendaria === null) {
      setError('Cuéntanos si lo recomendarías.')
      return
    }

    setEnviando(true)
    try {
      const r = await responderEncuestaAction(token, {
        helped: ayudo as 'SI' | 'ALGO' | 'NO',
        wouldRecommend: recomendaria,
        comment: comentario.trim(),
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
        <legend>¿Te sirvió el acompañamiento?</legend>
        <div className="tamizaje__opciones">
          {AYUDA.map((o) => (
            <button
              key={o.valor}
              className="tamizaje__opcion"
              type="button"
              data-elegida={ayudo === o.valor}
              aria-pressed={ayudo === o.valor}
              onClick={() => {
                setAyudo(o.valor)
                setError(null)
              }}
            >
              {o.etiqueta}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="tamizaje__pregunta">
        <legend>¿Se lo recomendarías a alguien que lo necesite?</legend>
        <div className="tamizaje__opciones">
          <button
            className="tamizaje__opcion"
            type="button"
            data-elegida={recomendaria === true}
            aria-pressed={recomendaria === true}
            onClick={() => {
              setRecomendaria(true)
              setError(null)
            }}
          >
            Sí
          </button>
          <button
            className="tamizaje__opcion"
            type="button"
            data-elegida={recomendaria === false}
            aria-pressed={recomendaria === false}
            onClick={() => {
              setRecomendaria(false)
              setError(null)
            }}
          >
            No
          </button>
        </div>
      </fieldset>

      <div>
        <label className="field__label" htmlFor="comentario">
          ¿Algo más que quieras decirnos? (opcional)
        </label>
        <p className="tamizaje__ayuda">
          Lo lee solo el equipo de la red, no quien te acompañó.
        </p>
        <textarea
          id="comentario"
          className="input"
          rows={3}
          maxLength={500}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
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
    </form>
  )
}
