'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarCheck, X, Check, Copy, MessageCircle, AlertTriangle } from 'lucide-react'
import { mensajeDeCitaConfirmada, enlaceWhatsapp } from '@/lib/mensajes'
import { enBogota } from '@/lib/fechas'

/**
 * Cuadrar el horario que la persona eligió: aquí nace la cita.
 *
 * Esta es la primera pantalla del portal que llega a crear una cita.
 * `POST /api/appointments` existía desde el principio, estaba probado, y no lo
 * llamaba nadie — no había forma de agendar. Encaja aquí de forma natural
 * porque cuadrar el horario y agendar son el mismo gesto.
 *
 * Una sesión dura 45 minutos y la base lo exige, así que el fin se calcula y
 * no se pregunta: preguntarlo solo daría ocasión de equivocarse.
 */

const DURACION_MINUTOS = 45

export function ModalAgendar({
  asignacionId,
  persona,
  profesional,
  onCerrar,
}: {
  asignacionId: string
  persona: { fullName: string; phone: string; preferredModality: string | null }
  profesional: { nombre: string }
  onCerrar: () => void
}) {
  const router = useRouter()
  const [cuando, setCuando] = useState('')
  const [modalidad, setModalidad] = useState(
    persona.preferredModality === 'PRESENCIAL' ? 'PRESENCIAL' : 'VIRTUAL',
  )
  const [fueraDeFranja, setFueraDeFranja] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agendada, setAgendada] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function agendar() {
    if (!cuando) {
      setError('Dinos para cuándo quedaron.')
      return
    }

    const inicio = new Date(cuando)
    if (Number.isNaN(inicio.getTime())) {
      setError('Esa fecha no es válida.')
      return
    }

    setGuardando(true)
    setError(null)

    try {
      const respuesta = await fetch(
        `/api/portal/appointments/asignaciones/${asignacionId}/confirmar`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inicio: inicio.toISOString(),
            fin: new Date(inicio.getTime() + DURACION_MINUTOS * 60000).toISOString(),
            modalidad,
            fueraDeFranja,
          }),
        },
      )
      const datos = await respuesta.json()

      if (!respuesta.ok || !datos.success) {
        // Si lo que estorba es la franja declarada, se ofrece el desvío en vez
        // de dejar a quien coordina adivinando qué marcar.
        if (datos.details?.codigo === 'FUERA_DE_FRANJA') {
          setFueraDeFranja(true)
          setError(
            `${datos.message} El profesional aceptó este horario desde su enlace, así que puedes agendarlo igual: marca la casilla y vuelve a intentarlo.`,
          )
          return
        }
        setError(datos.message ?? 'No se pudo agendar')
        return
      }

      // No se cierra: queda el mensaje de confirmación para la persona, que
      // es lo siguiente que hay que hacer y lo más fácil de olvidar.
      setAgendada(inicio.toISOString())
    } catch {
      setError('No pudimos conectarnos con el servidor')
    } finally {
      setGuardando(false)
    }
  }

  const mensaje = agendada
    ? mensajeDeCitaConfirmada({
        persona: persona.fullName,
        profesional: profesional.nombre,
        cuando: enBogota(agendada),
        modalidad,
      })
    : ''
  const whatsapp = agendada ? enlaceWhatsapp(persona.phone, mensaje) : null

  return (
    <div className="modal-telon" onClick={onCerrar}>
      <div
        className="modal-caja"
        style={{ maxWidth: 560 }}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-cabecera">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarCheck size={20} style={{ color: 'var(--color-green)' }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
              {agendada ? 'Cita agendada' : 'Cuadrar el horario'}
            </h3>
          </div>
          <button className="boton-icono" type="button" aria-label="Cerrar" onClick={onCerrar}>
            <X size={18} />
          </button>
        </div>

        {agendada ? (
          <>
            <p className="panel__nota" style={{ marginTop: 4 }}>
              Quedó para el <strong>{enBogota(agendada)}</strong> con{' '}
              <strong>{profesional.nombre}</strong>. El caso ya está activo.
            </p>

            <h4 className="caso-paso" style={{ marginTop: 18 }}>
              Confírmaselo a la persona
            </h4>
            <p className="panel__nota" style={{ marginTop: 0 }}>
              Lleva la fecha, la hora, el nombre de quien la va a acompañar y —lo que más importa—
              que el profesional la va a contactar. Sin esa frase se queda esperando sin saber
              quién da el primer paso.
            </p>

            <div className="mensaje__acciones">
              {whatsapp ? (
                <a
                  className="boton-mini"
                  data-tono="principal"
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={14} />
                  Abrir WhatsApp
                </a>
              ) : null}
              <button
                className="boton-mini"
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(mensaje)
                  setCopiado(true)
                  setTimeout(() => setCopiado(false), 2000)
                }}
              >
                {copiado ? <Check size={14} /> : <Copy size={14} />}
                {copiado ? 'Copiado' : 'Copiar mensaje'}
              </button>
            </div>

            <pre className="mensaje__texto">{mensaje}</pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button
                className="boton-mini"
                data-tono="principal"
                type="button"
                onClick={() => {
                  onCerrar()
                  router.refresh()
                }}
              >
                Listo
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="panel__nota" style={{ marginTop: 4 }}>
              Con <strong>{profesional.nombre}</strong>. La sesión dura {DURACION_MINUTOS} minutos
              y deja 30 de descanso después: eso lo pone el sistema, no hace falta calcularlo.
            </p>

            {error ? (
              <div className="aviso-portal" data-tono="rojo" style={{ marginTop: 12 }}>
                {error}
              </div>
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
              <div>
                <label className="field__label" htmlFor="cuando">
                  ¿Para cuándo quedaron?
                </label>
                <input
                  id="cuando"
                  className="input"
                  type="datetime-local"
                  value={cuando}
                  onChange={(e) => setCuando(e.target.value)}
                />
              </div>

              <div>
                <label className="field__label" htmlFor="modalidad">
                  Modalidad
                </label>
                <select
                  id="modalidad"
                  className="input"
                  value={modalidad}
                  onChange={(e) => setModalidad(e.target.value)}
                >
                  <option value="VIRTUAL">Virtual</option>
                  <option value="PRESENCIAL">Presencial</option>
                </select>
              </div>

              {fueraDeFranja ? (
                <label className="tamizaje__autorizacion">
                  <input
                    type="checkbox"
                    checked={fueraDeFranja}
                    onChange={(e) => setFueraDeFranja(e.target.checked)}
                  />
                  <span>
                    <AlertTriangle
                      size={14}
                      style={{ verticalAlign: '-2px', marginRight: 4, color: 'var(--color-red)' }}
                    />
                    Este horario está fuera de las franjas que el profesional tiene cargadas, pero
                    él aceptó este momento desde su enlace. Agendar igual queda registrado en la
                    auditoría con tu nombre.
                  </span>
                </label>
              ) : null}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button className="boton-mini" type="button" onClick={onCerrar}>
                Cancelar
              </button>
              <button
                className="boton-mini"
                data-tono="principal"
                type="button"
                onClick={agendar}
                disabled={guardando}
              >
                {guardando ? 'Agendando…' : 'Agendar la cita'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
