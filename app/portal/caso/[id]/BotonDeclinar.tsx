'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Send, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { decidirPropuestaAction } from './actions'

/**
 * La puerta de salida del profesional.
 *
 * El caso se le asigna sin preguntarle: le llega un mensaje diciendo que lo
 * tiene y que la persona elegirá hora de su agenda. Eso ahorra los días que se
 * perdían esperando un «sí» que en siete de cada ocho casos no llegaba — pero
 * solo es justo si decir «ahora no puedo» sigue costando un toque.
 *
 * Durante un tiempo no lo fue. Al quitar el paso de aceptar, la única salida se
 * quedó colgando de PROPUESTA, un estado por el que ya no pasa ninguna
 * asignación nueva. El mensaje le prometía «dilo ahí mismo» y no había ahí
 * mismo: podía leer el caso y nada más.
 *
 * Se le pide el motivo por lo mismo que se le pide a quien coordina: saber si
 * no pudo por la ciudad, por la carga o por el perfil es lo único que distingue
 * un problema de este caso de un problema de cómo se está asignando.
 *
 * Deja de aparecer en cuanto la persona elige hora. A partir de ahí hay alguien
 * esperando el día y la hora acordados, y soltarlo de un clic sería dejarla
 * plantada: eso se habla con coordinación.
 */
export function BotonDeclinar({ patientId }: { patientId: string }) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [listo, setListo] = useState<'declino' | 'confirmo' | null>(null)

  /**
   * Confirmar también dice algo, así que también se registra.
   *
   * El «sí puedo» estaba escondido dentro del formulario de declinar, como
   * botón de arrepentimiento: para verlo había que abrir primero «ahora no
   * puedo». La confirmación es la respuesta más frecuente y no se veía.
   *
   * Y no solo cierra el panel: llama al backend, que lo deja en la auditoría.
   * Donde antes coordinación solo tenía silencio, ahora hay un «lo vi y sigo».
   */
  async function confirmar() {
    setEnviando(true)
    setError(null)

    const salida = await decidirPropuestaAction(patientId, {
      acepta: true,
      nota: '',
      motivo: '',
    })

    if (!salida.success) {
      setError(salida.message)
      setEnviando(false)
      return
    }

    setListo('confirmo')
    router.refresh()
  }

  if (listo === 'confirmo') {
    return (
      <div className="tamizaje__gracias" role="status">
        <span className="tamizaje__gracias-icono" aria-hidden>
          <Check size={26} />
        </span>
        <h2>Quedamos así</h2>
        <p>
          El caso sigue contigo. Cuando la persona elija su hora te llega la
          confirmación con el día, la hora y el enlace de la videollamada.
        </p>
      </div>
    )
  }

  if (listo) {
    return (
      <div className="tamizaje__gracias" role="status">
        <span
          className="tamizaje__gracias-icono"
          aria-hidden
          style={{ background: '#ebeced', color: '#5f5e57' }}
        >
          <X size={26} />
        </span>
        <h2>Gracias por avisarnos</h2>
        <p>
          El caso vuelve a la cola y se lo asignamos hoy a otra persona de la red. No pasa
          nada: es voluntario, y avisar a tiempo es justo lo que hace que esto funcione.
        </p>
      </div>
    )
  }

  async function declinar(evento: React.FormEvent) {
    evento.preventDefault()

    /**
     * Sin peaje para decir que no.
     *
     * Aquí se exigía el motivo. Contradecía al mensaje que le trae hasta esta
     * pantalla —«no pasa nada, es voluntario, decirlo pronto ayuda más que un sí
     * que no llega»— y ponía la barrera justo delante de la conducta que le
     * pedimos. Quien no quiere explicarse no escribe «no puedo y ya»: cierra la
     * pestaña, y nos quedamos sin el motivo Y sin la respuesta.
     */
    setEnviando(true)
    setError(null)

    const salida = await decidirPropuestaAction(patientId, {
      acepta: false,
      nota: '',
      motivo: motivo.trim(),
    })

    if (!salida.success) {
      setError(salida.message)
      setEnviando(false)
      return
    }

    setListo('declino')
    router.refresh()
  }

  /**
   * Con el mismo botón que el resto de la pantalla.
   *
   * Llevaba unas clases —`boton`, `boton--suave`— que no existen en ninguna
   * hoja de estilos, así que salía como un enlace plano mientras todo lo demás
   * a su alrededor tenía forma de botón. Un control que no parece un control se
   * lee como texto y no se pulsa.
   *
   * Importa más aquí que en otro sitio: esta es la única salida del profesional
   * desde que el caso se le asigna sin preguntarle. Si no parece pulsable, dar
   * marcha atrás cuesta más que callarse — que es justo el silencio que este
   * flujo vino a quitar.
   *
   * En variante neutra y no destacada a propósito: se le ofrece la puerta sin
   * empujarle hacia ella.
   */
  /**
   * Las dos respuestas a la vista, con el énfasis en quedarse.
   *
   * El primario es confirmar: es la respuesta más frecuente y la que deja al
   * caso andando. Declinar queda al lado, en neutro — a un toque, como tiene
   * que estar, pero sin que la pantalla empuje hacia ahí.
   */
  if (!abierto) {
    return (
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button
          type="button"
          variant="primary"
          disabled={enviando}
          icon={<Check size={16} />}
          onClick={confirmar}
        >
          {enviando ? 'Enviando…' : 'Sí puedo, sigo con el caso'}
        </Button>
        <Button
          type="button"
          disabled={enviando}
          icon={<X size={16} />}
          onClick={() => setAbierto(true)}
        >
          Ahora no puedo tomarlo
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={declinar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label className="field__label" htmlFor="motivo-declinar">
          ¿Por qué no puedes? <span style={{ fontWeight: 400 }}>(opcional)</span>
        </label>
        <p className="tamizaje__ayuda">
          Si quieres contarnos, con una línea basta: «no tengo cupo este mes», «me queda
          muy lejos», «no es mi población». Nos sirve para no volver a asignarte casos que
          no encajan — pero puedes dejarlo en blanco y mandarlo igual.
        </p>
        <textarea
          id="motivo-declinar"
          className="field__input"
          rows={3}
          value={motivo}
          onChange={(e) => {
            setMotivo(e.target.value)
            setError(null)
          }}
        />
      </div>

      {error ? (
        <p className="field__error" role="alert">
          {error}
        </p>
      ) : null}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {/*
          El primario es quedarse con el caso, no soltarlo.
        
          Estaba al revés: destacado el botón que libera y en neutro el que
          confirma. El énfasis visual de una pantalla es una recomendación, y
          esta estaba recomendando la salida — a alguien que llegó aquí porque
          dudaba, no porque lo tuviera decidido.
        
          Liberar un caso no es urgente ni deseable: significa que una persona
          que pidió ayuda vuelve a la cola. Que se pueda hacer en un toque es lo
          justo; que la pantalla tire de ti hacia ahí, no. Declinar sigue a un
          clic de distancia, solo que sin que nada te empuje.
        
          El de atrás decía «Mejor no, sigo con él». Dos problemas: sonaba a
          recular, cuando lo que hace es afirmar que sí puede; y ese «él» se
          leía como la persona acompañada —que muchas veces es un él— y no como
          el caso. Ahora dice lo que está decidiendo.
        */}
        <Button type="submit" disabled={enviando} icon={<Send size={16} />}>
          {enviando ? 'Enviando…' : 'Enviar y liberar el caso'}
        </Button>
        <Button
          type="button"
          icon={<X size={16} />}
          onClick={() => {
            setAbierto(false)
            setError(null)
          }}
        >
          Volver sin declinar
        </Button>
      </div>
    </form>
  )
}
