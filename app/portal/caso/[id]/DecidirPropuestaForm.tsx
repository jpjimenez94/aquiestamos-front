'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import { decidirPropuestaAction } from './actions'

/**
 * Donde el profesional dice si puede tomar el caso.
 *
 * Que lo diga aquí y no por WhatsApp es lo que hace que el dato sirva: antes
 * respondía por chat y alguien lo transcribía, y lo que el sistema sabía
 * dependía de que esa persona se acordara.
 *
 * Ya no le pide días ni franjas. Su agenda está en su perfil y es de ahí de
 * donde la persona elige la hora; volver a pedírselos caso por caso era pedirle
 * dos veces lo mismo, y encima bloqueaba el «sí» hasta que rellenara una rejilla
 * cuyo resultado ya no guarda nadie.
 *
 * Decir que no es una opción de primera clase, no un camino escondido: es
 * voluntario, no poder es normal, y un «no» claro hoy vale mucho más que un
 * silencio de dos semanas. Desde que el caso se le asigna sin preguntarle, esta
 * es su única puerta de salida — y por eso no puede costar más de un toque.
 */

export function DecidirPropuestaForm({ patientId }: { patientId: string }) {
  const router = useRouter()
  const [decision, setDecision] = useState<'si' | 'no' | null>(null)
  const [nota, setNota] = useState('')
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [listo, setListo] = useState<'si' | 'no' | null>(null)

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault()
    if (!decision) {
      setError('Dinos si puedes acompañar este caso.')
      return
    }
    if (decision === 'no' && motivo.trim().length < 3) {
      setError('Cuéntanos brevemente por qué no puedes.')
      return
    }

    setEnviando(true)
    setError(null)

    const salida = await decidirPropuestaAction(patientId, {
      acepta: decision === 'si',
      nota: decision === 'si' ? nota.trim() : '',
      motivo: decision === 'no' ? motivo.trim() : '',
    })

    if (!salida.success) {
      setError(salida.message)
      setEnviando(false)
      return
    }

    setListo(decision)
  }

  if (listo) {
    return (
      <div className="tamizaje__gracias" role="status">
        <span
          className="tamizaje__gracias-icono"
          aria-hidden
          style={listo === 'no' ? { background: '#ebeced', color: '#5f5e57' } : undefined}
        >
          {listo === 'si' ? <Check size={26} /> : <X size={26} />}
        </span>
        <h2>{listo === 'si' ? 'Gracias, quedamos en eso' : 'Gracias por avisarnos'}</h2>
        <p>
          {listo === 'si' ? (
            <>
              Vamos a cuadrar el horario con la persona y te escribimos por WhatsApp con la fecha.
              Cuando esté confirmada, sus datos de contacto aparecen en esta misma pantalla.
            </>
          ) : (
            <>
              No pasa nada: es voluntario. Le vamos a proponer el acompañamiento a otra persona de
              la red. Seguimos contando contigo para el siguiente.
            </>
          )}
        </p>
        {listo === 'si' ? (
          <button
            className="boton-mini"
            type="button"
            style={{ marginTop: 16 }}
            onClick={() => router.refresh()}
          >
            Actualizar
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <form className="tamizaje__form" onSubmit={enviar} noValidate>
      <fieldset className="tamizaje__pregunta">
        <legend>¿Puedes acompañar este caso?</legend>
        <div className="tamizaje__opciones">
          <button
            className="tamizaje__opcion"
            type="button"
            data-elegida={decision === 'si'}
            aria-pressed={decision === 'si'}
            onClick={() => {
              setDecision('si')
              setError(null)
            }}
          >
            Sí, puedo
          </button>
          <button
            className="tamizaje__opcion"
            type="button"
            data-elegida={decision === 'no'}
            aria-pressed={decision === 'no'}
            onClick={() => {
              setDecision('no')
              setError(null)
            }}
          >
            Ahora no puedo
          </button>
        </div>
      </fieldset>

      {decision === 'si' ? (
        <>
          <div>
            <label className="field__label" htmlFor="nota">
              ¿Algo más que debamos tener en cuenta? (opcional)
            </label>
            <p className="tamizaje__ayuda">
              Por ejemplo: «después de las 4 mejor», o «los jueves solo si es virtual».
            </p>
            <input
              id="nota"
              className="input"
              maxLength={600}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
            />
          </div>
        </>
      ) : null}

      {decision === 'no' ? (
        <div>
          <label className="field__label" htmlFor="motivo">
            ¿Por qué no puedes?
          </label>
          <p className="tamizaje__ayuda">
            No es para justificarte. Nos sirve para saber si el problema es de este caso —queda
            lejos, el horario no da— o de cómo estamos repartiendo el trabajo.
          </p>
          <input
            id="motivo"
            className="input"
            maxLength={300}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>
      ) : null}

      {error ? (
        <p className="tamizaje__error" role="alert">
          {error}
        </p>
      ) : null}

      <button className="tamizaje__enviar" type="submit" disabled={enviando}>
        {enviando ? 'Enviando…' : 'Enviar mi respuesta'}
      </button>
    </form>
  )
}
