'use client'

import { useState } from 'react'
import { AlertTriangle, Check, Phone } from 'lucide-react'
import {
  PREGUNTAS_TAMIZAJE,
  respuestasParaLaApi,
  respuestaDeRiesgo,
  type ClaveTamizaje,
  type RespuestasTamizaje,
} from '@/lib/mensajes'
import { LINEAS_EMERGENCIA, CASILLAS } from '@/lib/consentimiento'
import { responderTamizajeAction } from './actions'

/**
 * Las siete preguntas, con las opciones como botones grandes.
 *
 * Todo en una sola pantalla y no paso a paso: quien está mal no quiere
 * descubrir cuántas preguntas faltan, quiere ver que son pocas y acabar.
 *
 * Lo más importante que hace este componente no es recoger respuestas: es que
 * en cuanto alguien marca que ha pensado en hacerse daño, o que no está en un
 * lugar seguro, las líneas de emergencia aparecen EN ESE MOMENTO. Esperar a
 * que termine el formulario y a que alguien de la red lea el aviso puede ser
 * demasiado tarde.
 */
export function FormularioTamizaje({
  token,
  yaRespondido,
}: {
  token: string
  yaRespondido: boolean
}) {
  const [respuestas, setRespuestas] = useState<RespuestasTamizaje>({})
  const [autoriza, setAutoriza] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [faltantes, setFaltantes] = useState<ClaveTamizaje[]>([])

  const hayRiesgo = respuestaDeRiesgo(respuestas)

  /**
   * Marcar una respuesta.
   *
   * En las preguntas de varias respuestas —qué días, a qué horas— tocar
   * alterna en vez de sustituir: la persona marca todos los que le sirvan y
   * puede quitar uno sin empezar de cero.
   */
  function responder(clave: ClaveTamizaje, valor: string, multiple: boolean) {
    setRespuestas((previas) => {
      const actuales = previas[clave] ?? []
      if (!multiple) return { ...previas, [clave]: [valor] }
      return {
        ...previas,
        [clave]: actuales.includes(valor)
          ? actuales.filter((v) => v !== valor)
          : [...actuales, valor],
      }
    })
    setFaltantes((previas) => previas.filter((c) => c !== clave))
    setError(null)
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault()

    const sinResponder = PREGUNTAS_TAMIZAJE.filter(
      (p) => (respuestas[p.clave] ?? []).length === 0,
    ).map((p) => p.clave)
    if (sinResponder.length > 0) {
      setFaltantes(sinResponder)
      setError(
        sinResponder.length === 1
          ? 'Falta una pregunta por responder.'
          : `Faltan ${sinResponder.length} preguntas por responder.`,
      )
      document.querySelector(`[data-falta="true"]`)?.scrollIntoView({ block: 'center' })
      return
    }

    if (!autoriza) {
      setError('Necesitamos tu autorización para poder usar estas respuestas.')
      return
    }

    setEnviando(true)
    setError(null)

    const salida = await responderTamizajeAction(token, respuestasParaLaApi(respuestas))

    if (!salida.success) {
      setError(salida.message)
      setEnviando(false)
      return
    }

    setListo(true)
  }

  if (listo) {
    return (
      <div className="tamizaje__gracias" role="status">
        <span className="tamizaje__gracias-icono" aria-hidden>
          <Check size={26} />
        </span>
        <h2>Gracias por responder</h2>
        <p>
          Ya sabemos cómo acompañarte. Te vamos a escribir por WhatsApp para contarte quién va a
          acompañarte y cuándo.
        </p>
        {hayRiesgo ? <SalidaDeEmergencia /> : null}
      </div>
    )
  }

  return (
    <form className="tamizaje__form" onSubmit={enviar} noValidate>
      {yaRespondido ? (
        <p className="tamizaje__nota" role="status">
          Ya nos habías respondido antes. Si algo cambió, puedes contestar otra vez: nos quedamos
          con lo último que nos cuentes.
        </p>
      ) : null}

      {PREGUNTAS_TAMIZAJE.map((p, indice) => {
        const falta = faltantes.includes(p.clave)
        return (
          <fieldset className="tamizaje__pregunta" key={p.clave} data-falta={falta}>
            <legend>
              <span className="tamizaje__numero">{indice + 1}</span>
              {p.pregunta}
            </legend>
            {'ayuda' in p && p.ayuda ? <p className="tamizaje__ayuda">{p.ayuda}</p> : null}

            <div className="tamizaje__opciones">
              {p.respuestas.map((r) => (
                <button
                  className="tamizaje__opcion"
                  type="button"
                  key={r.valor}
                  aria-pressed={(respuestas[p.clave] ?? []).includes(r.valor)}
                  data-elegida={(respuestas[p.clave] ?? []).includes(r.valor)}
                  onClick={() => responder(p.clave, r.valor, 'multiple' in p && p.multiple === true)}
                >
                  {r.etiqueta}
                </button>
              ))}
            </div>

            {/* La salida de emergencia sale pegada a la pregunta que la
                disparó, en cuanto se toca. No al final de la página. */}
            {p.clave === 'riesgo' && respuestas.riesgo?.[0] === 'SI' ? <SalidaDeEmergencia /> : null}
            {p.clave === 'seguridad' && respuestas.seguridad?.[0] === 'NO' ? (
              <SalidaDeEmergencia
                titulo="Si te falta un lugar donde estar o comida"
                texto="Llama a estas líneas: te pueden orientar sobre albergues y ayuda inmediata en tu zona. Nosotros seguimos con tu acompañamiento psicológico."
              />
            ) : null}
          </fieldset>
        )
      })}

      <label className="tamizaje__autorizacion">
        <input
          type="checkbox"
          checked={autoriza}
          onChange={(evento) => setAutoriza(evento.target.checked)}
        />
        <span>{CASILLAS.sensiblesAtencion}</span>
      </label>

      {error ? (
        <p className="tamizaje__error" role="alert">
          {error}
        </p>
      ) : null}

      <button className="tamizaje__enviar" type="submit" disabled={enviando}>
        {enviando ? 'Enviando…' : 'Enviar mis respuestas'}
      </button>
    </form>
  )
}

function SalidaDeEmergencia({
  titulo = 'Por favor, no esperes nuestra respuesta',
  texto = 'Lo que nos acabas de contar es urgente y nosotros podemos tardar en escribirte. Llama ahora a una de estas líneas: son gratuitas y atienden a toda hora.',
}: {
  titulo?: string
  texto?: string
}) {
  return (
    <aside className="tamizaje__emergencia" role="alert">
      <span className="tamizaje__emergencia-icono" aria-hidden>
        <AlertTriangle size={20} />
      </span>
      <div>
        <strong>{titulo}</strong>
        <p>{texto}</p>
        <div className="tamizaje__lineas">
          {LINEAS_EMERGENCIA.map((linea) => (
            <a className="tamizaje__linea" href={linea.href} key={linea.numero}>
              <Phone size={14} />
              {linea.nombre} <span>{linea.numero}</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}
