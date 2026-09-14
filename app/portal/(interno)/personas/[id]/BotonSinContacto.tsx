'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PhoneOff, PhoneCall } from 'lucide-react'

/**
 * «No se pudo contactar»: se apunta el intento, no se cambia el caso.
 *
 * Se llama, se escribe, y nada — o no contesta, o el número quedó mal escrito
 * en la solicitud. Esa persona se quedaba en «Por asignar» del tablero sin
 * decir por qué, mezclada con quienes sí esperan a que alguien las asigne, y
 * la columna solo decía «hay catorce» sin decir de qué.
 *
 * Marcar NO cierra el caso ni cambia su estado: con ella no ha pasado nada, lo
 * que no hemos conseguido es hablarle. Cada intento suma, y cuando por fin
 * conteste se quita de un toque.
 */

const MOTIVOS = [
  { valor: 'NO_CONTESTA', texto: 'No contesta', detalle: 'Llamadas o mensajes sin respuesta.' },
  {
    valor: 'NUMERO_ERRADO',
    texto: 'El número está mal',
    detalle: 'No existe, le faltan dígitos o es de otra persona.',
  },
  { valor: 'OTRO', texto: 'Otro motivo', detalle: 'Cuéntalo abajo.' },
] as const

export type SinContacto = {
  desde: string
  ultimoIntento: string | null
  intentos: number
  motivo: string | null
  quien: string | null
} | null

export function BotonSinContacto({
  personaId,
  sinContacto,
}: {
  personaId: string
  sinContacto: SinContacto
}) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [motivo, setMotivo] = useState<string>('NO_CONTESTA')
  const [nota, setNota] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function marcar() {
    setGuardando(true)
    setError(null)
    try {
      const r = await fetch(`/api/portal/patients/${personaId}/sin-contacto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo, nota: nota.trim() || null }),
      })
      const d = await r.json()
      if (!r.ok || !d.success) {
        setError(d.message ?? 'No se pudo guardar.')
        return
      }
      setAbierto(false)
      setNota('')
      router.refresh()
    } catch {
      setError('No pudimos conectarnos con el servidor.')
    } finally {
      setGuardando(false)
    }
  }

  async function quitar() {
    setGuardando(true)
    setError(null)
    try {
      const r = await fetch(`/api/portal/patients/${personaId}/sin-contacto`, { method: 'DELETE' })
      const d = await r.json()
      if (!r.ok || !d.success) {
        setError(d.message ?? 'No se pudo guardar.')
        return
      }
      router.refresh()
    } catch {
      setError('No pudimos conectarnos con el servidor.')
    } finally {
      setGuardando(false)
    }
  }

  if (sinContacto) {
    return (
      <div className="sin-contacto">
        <p className="sin-contacto__titulo">
          <PhoneOff size={15} aria-hidden />
          {sinContacto.motivo === 'NUMERO_ERRADO' ? 'El número está mal' : 'No contesta'}
        </p>
        <p className="sin-contacto__detalle">
          {sinContacto.intentos} {sinContacto.intentos === 1 ? 'intento' : 'intentos'}
          {sinContacto.quien ? ` · el último lo hizo ${sinContacto.quien}` : ''}. Sigue esperando
          desde entonces: el caso no se ha cerrado.
        </p>
        <div className="mensaje__acciones">
          <button className="boton-mini" type="button" onClick={quitar} disabled={guardando}>
            <PhoneCall size={14} />
            {guardando ? 'Guardando…' : 'Ya contestó'}
          </button>
          <button className="boton-mini" type="button" onClick={() => setAbierto(true)} disabled={guardando}>
            Apuntar otro intento
          </button>
        </div>
        {abierto ? (
          <Formulario
            motivo={motivo}
            setMotivo={setMotivo}
            nota={nota}
            setNota={setNota}
            guardando={guardando}
            onGuardar={marcar}
            onCancelar={() => setAbierto(false)}
          />
        ) : null}
        {error ? (
          <p className="tamizaje__error" role="alert" style={{ fontSize: '0.8rem' }}>
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div style={{ marginTop: 10 }}>
      {abierto ? (
        <div className="sin-contacto">
          <Formulario
            motivo={motivo}
            setMotivo={setMotivo}
            nota={nota}
            setNota={setNota}
            guardando={guardando}
            onGuardar={marcar}
            onCancelar={() => setAbierto(false)}
          />
          {error ? (
            <p className="tamizaje__error" role="alert" style={{ fontSize: '0.8rem' }}>
              {error}
            </p>
          ) : null}
        </div>
      ) : (
        <button className="boton-mini" type="button" onClick={() => setAbierto(true)}>
          <PhoneOff size={14} />
          No se pudo contactar
        </button>
      )}
    </div>
  )
}

function Formulario({
  motivo,
  setMotivo,
  nota,
  setNota,
  guardando,
  onGuardar,
  onCancelar,
}: {
  motivo: string
  setMotivo: (v: string) => void
  nota: string
  setNota: (v: string) => void
  guardando: boolean
  onGuardar: () => void
  onCancelar: () => void
}) {
  return (
    <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
      <div style={{ display: 'grid', gap: 6 }}>
        {MOTIVOS.map((m) => (
          <label key={m.valor} className="sin-contacto__opcion" data-elegida={motivo === m.valor}>
            <input
              type="radio"
              name="motivo-sin-contacto"
              value={m.valor}
              checked={motivo === m.valor}
              onChange={() => setMotivo(m.valor)}
            />
            <span>
              <strong>{m.texto}</strong>
              <span className="tabla__secundario" style={{ display: 'block' }}>
                {m.detalle}
              </span>
            </span>
          </label>
        ))}
      </div>

      <textarea
        className="input"
        rows={2}
        maxLength={500}
        placeholder="Qué pasó (opcional). Se guarda como nota de seguimiento."
        value={nota}
        onChange={(e) => setNota(e.target.value)}
      />

      <div className="mensaje__acciones">
        <button className="boton-mini" type="button" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
        <button
          className="boton-mini"
          data-tono="principal"
          type="button"
          onClick={onGuardar}
          disabled={guardando}
        >
          {guardando ? 'Guardando…' : 'Apuntar el intento'}
        </button>
      </div>
    </div>
  )
}
