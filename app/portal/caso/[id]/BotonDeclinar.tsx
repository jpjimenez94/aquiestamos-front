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
  const [listo, setListo] = useState(false)

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

    if (motivo.trim().length < 3) {
      setError('Cuéntanos brevemente por qué no puedes.')
      return
    }

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

    setListo(true)
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
  if (!abierto) {
    return (
      <Button type="button" icon={<X size={16} />} onClick={() => setAbierto(true)}>
        Ahora no puedo tomar este caso
      </Button>
    )
  }

  return (
    <form onSubmit={declinar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label className="field__label" htmlFor="motivo-declinar">
          ¿Por qué no puedes? *
        </label>
        <p className="tamizaje__ayuda">
          Con una línea basta: «no tengo cupo este mes», «me queda muy lejos», «no es mi
          población». Nos sirve para no volver a asignarte casos que no encajan.
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
          Confirmar va en primario y volverse atrás en neutro, como en el resto
          del portal: quien ya escribió el motivo viene a enviarlo.

          El de atrás decía «Mejor no, sigo con él». Dos problemas: sonaba a
          recular, cuando lo que hace es afirmar que sí puede; y ese «él» se
          leía como la persona acompañada —que muchas veces es un él— y no como
          el caso. Ahora dice lo que la persona está decidiendo.
        */}
        <Button type="submit" variant="primary" disabled={enviando} icon={<Send size={16} />}>
          {enviando ? 'Enviando…' : 'Enviar y liberar el caso'}
        </Button>
        <Button
          type="button"
          icon={<Check size={16} />}
          onClick={() => {
            setAbierto(false)
            setError(null)
          }}
        >
          Sí puedo, sigo con el caso
        </Button>
      </div>
    </form>
  )
}
