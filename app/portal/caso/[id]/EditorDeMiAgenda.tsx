'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock, Plus, Trash2 } from 'lucide-react'
import { actualizarDisponibilidadAction } from './actions'

/**
 * El profesional corrige su propia agenda desde su enlace.
 *
 * Le pedimos confirmar que sus espacios «siguen vigentes» y, si cambiaron, que
 * nos lo diga — y no tenía dónde decirlo ni cómo cambiarlo. La pantalla del
 * portal que edita disponibilidad exige una cuenta que él no tiene a propósito:
 * el correo de aprobación le dice que no necesita contraseña. Así que la
 * petición se quedaba en un «escríbenos» sin destinatario, y la agenda sobre la
 * que la persona va a elegir hora envejecía sin que nadie la tocara.
 *
 * Guardar aquí cuenta como confirmar el caso: dejar la agenda al día lo dice
 * más fuerte que pulsar un botón, y pedirle además el clic sería pedirle dos
 * veces lo mismo.
 */

const DIAS = [
  ['LUNES', 'Lunes'],
  ['MARTES', 'Martes'],
  ['MIERCOLES', 'Miércoles'],
  ['JUEVES', 'Jueves'],
  ['VIERNES', 'Viernes'],
  ['SABADO', 'Sábado'],
  ['DOMINGO', 'Domingo'],
] as const

type Franja = { weekday: string; startMinute: number; endMinute: number; modality?: string }

/** 480 → "08:00", que es lo que entiende un <input type="time">. */
function aHora(minutos: number) {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function aMinutos(hora: string) {
  const [h, m] = hora.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function EditorDeMiAgenda({
  patientId,
  franjas,
}: {
  patientId: string
  franjas: Franja[]
}) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [filas, setFilas] = useState<Franja[]>(franjas)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [listo, setListo] = useState(false)

  function cambiar(i: number, campo: keyof Franja, valor: string | number) {
    setFilas((f) => f.map((fila, j) => (i === j ? { ...fila, [campo]: valor } : fila)))
    setError(null)
  }

  async function guardar() {
    /**
     * La misma regla que el servidor, dicha antes de llegar.
     *
     * Una franja de media hora no cabe una sesión —duran 45 minutos— y el
     * backend la rechaza. Comprobarlo aquí ahorra el viaje, pero la que manda
     * sigue siendo la de allá: esta es una cortesía, no la puerta.
     */
    const corta = filas.find((f) => f.endMinute - f.startMinute < 45)
    if (corta) {
      setError('Cada espacio debe durar al menos 45 minutos, que es lo que dura una sesión.')
      return
    }

    setGuardando(true)
    setError(null)

    /**
     * Por server action, no por fetch.
     *
     * El token del caso vive en una cookie httpOnly: el navegador no puede
     * leerlo, y así sigue sin poder. Es la misma vía que usan el reporte y la
     * decisión de esta pantalla.
     */
    const salida = await actualizarDisponibilidadAction(patientId, filas)

    if (!salida.success) {
      setError(salida.message)
      setGuardando(false)
      return
    }

    setListo(true)
    setGuardando(false)
    router.refresh()
  }

  if (listo) {
    return (
      <p className="panel__nota" style={{ margin: '10px 0 0' }}>
        <strong>Listo, actualizamos tus horarios.</strong> A partir de ahora la persona solo
        podrá elegir dentro de esos espacios.
      </p>
    )
  }

  if (!abierto) {
    return (
      <button
        className="boton-mini"
        type="button"
        style={{ marginTop: 8 }}
        onClick={() => setAbierto(true)}
      >
        <CalendarClock size={14} />
        Cambiar mis horarios
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
      <p className="panel__nota" style={{ margin: 0 }}>
        Estos son los espacios en los que puedes atender. La persona solo va a poder elegir
        dentro de ellos, así que déjalos como de verdad los tengas.
      </p>

      {filas.map((f, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="field__input"
            style={{ maxWidth: 150 }}
            value={f.weekday}
            onChange={(e) => cambiar(i, 'weekday', e.target.value)}
            aria-label="Día"
          >
            {DIAS.map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </select>

          <input
            className="field__input"
            style={{ maxWidth: 120 }}
            type="time"
            value={aHora(f.startMinute)}
            onChange={(e) => cambiar(i, 'startMinute', aMinutos(e.target.value))}
            aria-label="Desde"
          />
          <span className="tabla__secundario">a</span>
          <input
            className="field__input"
            style={{ maxWidth: 120 }}
            type="time"
            value={aHora(f.endMinute)}
            onChange={(e) => cambiar(i, 'endMinute', aMinutos(e.target.value))}
            aria-label="Hasta"
          />

          <button
            className="boton-mini"
            type="button"
            onClick={() => setFilas((x) => x.filter((_, j) => j !== i))}
            aria-label={`Quitar el espacio ${i + 1}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {filas.length === 0 ? (
        <p className="panel__nota" style={{ margin: 0 }}>
          No te queda ningún espacio. Si guardas así, no podremos asignarte acompañamientos
          hasta que vuelvas a cargar tu disponibilidad.
        </p>
      ) : null}

      <div>
        <button
          className="boton-mini"
          type="button"
          onClick={() =>
            setFilas((f) => [
              ...f,
              { weekday: 'LUNES', startMinute: 8 * 60, endMinute: 12 * 60, modality: 'AMBAS' },
            ])
          }
        >
          <Plus size={14} />
          Añadir un espacio
        </button>
      </div>

      {error ? (
        <div className="aviso-portal" data-tono="rojo">
          {error}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className="boton-mini"
          data-tono="principal"
          type="button"
          onClick={guardar}
          disabled={guardando}
        >
          {guardando ? 'Guardando…' : 'Guardar mis horarios'}
        </button>
        <button
          className="boton-mini"
          type="button"
          onClick={() => {
            setFilas(franjas)
            setAbierto(false)
            setError(null)
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
