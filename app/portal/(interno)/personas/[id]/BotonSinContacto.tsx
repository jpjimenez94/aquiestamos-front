'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PhoneOff, PhoneCall, X } from 'lucide-react'

/**
 * «No se pudo contactar»: se apunta el intento, no se cambia el caso.
 *
 * Se llama, se escribe, y nada — o no contesta, o el número quedó mal escrito
 * en la solicitud. Esa persona se quedaba en «Por asignar» del tablero sin
 * decir por qué, mezclada con quienes sí esperan a que alguien las asigne, y
 * la columna solo decía «hay catorce» sin decir de qué.
 *
 * Vive en la cabecera de la ficha, junto a «Volver» y «Eliminar registro»: es
 * una acción sobre la persona, como esas dos, y quien llama la busca arriba y
 * no a media pantalla. Cuando ya está marcada, el propio botón lo dice —«No
 * contesta · 3»— para que se vea sin abrir nada.
 *
 * Marcar NO cierra el caso ni cambia su estado: con ella no ha pasado nada, lo
 * que no hemos conseguido es hablarle.
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

const TITULO: Record<string, string> = {
  NO_CONTESTA: 'No contesta',
  NUMERO_ERRADO: 'El número está mal',
  OTRO: 'Sin contacto',
}

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    day: 'numeric',
    month: 'long',
  })

export function BotonSinContacto({
  personaId,
  sinContacto,
}: {
  personaId: string
  sinContacto: SinContacto
}) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [motivo, setMotivo] = useState<string>(sinContacto?.motivo ?? 'NO_CONTESTA')
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
      setAbierto(false)
      router.refresh()
    } catch {
      setError('No pudimos conectarnos con el servidor.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <button
        className="boton-mini"
        type="button"
        onClick={() => setAbierto(true)}
        title={
          sinContacto
            ? `Sin contacto desde el ${fecha(sinContacto.desde)}`
            : 'Apuntar que no se ha logrado hablar con esta persona'
        }
        style={
          sinContacto
            ? { borderColor: 'var(--color-orange)', color: 'var(--color-orange)', fontWeight: 700 }
            : undefined
        }
      >
        <PhoneOff size={14} />
        {sinContacto
          ? `${TITULO[sinContacto.motivo ?? 'NO_CONTESTA']} · ${sinContacto.intentos}`
          : 'No se pudo contactar'}
      </button>

      {abierto ? (
        <div
          className="modal-telon"
          role="dialog"
          aria-modal="true"
          aria-label="No se pudo contactar"
          onClick={(e) => {
            if (e.target === e.currentTarget && !guardando) setAbierto(false)
          }}
        >
          <div className="modal-caja">
            <div className="modal-cabecera">
              <h2
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '1.1rem',
                  margin: 0,
                }}
              >
                <PhoneOff size={17} />
                No se pudo contactar
              </h2>
              <button
                className="boton-icono"
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
                disabled={guardando}
              >
                <X size={18} />
              </button>
            </div>

            <div>
              {sinContacto ? (
                <div className="sin-contacto">
                  <p className="sin-contacto__titulo">
                    <PhoneOff size={15} aria-hidden />
                    {TITULO[sinContacto.motivo ?? 'NO_CONTESTA']}
                  </p>
                  <p className="sin-contacto__detalle">
                    Desde el {fecha(sinContacto.desde)} · {sinContacto.intentos}{' '}
                    {sinContacto.intentos === 1 ? 'intento' : 'intentos'}
                    {sinContacto.quien ? ` · el último lo hizo ${sinContacto.quien}` : ''}. El caso
                    sigue abierto: solo está esperando a que se pueda hablar con ella.
                  </p>
                  <button className="boton-mini" type="button" onClick={quitar} disabled={guardando}>
                    <PhoneCall size={14} />
                    {guardando ? 'Guardando…' : 'Ya contestó'}
                  </button>
                </div>
              ) : null}

              <p className="tabla__secundario" style={{ margin: '14px 0 8px' }}>
                {sinContacto ? 'Apuntar otro intento:' : '¿Qué pasó?'}
              </p>

              <div style={{ display: 'grid', gap: 6 }}>
                {MOTIVOS.map((m) => (
                  <label
                    key={m.valor}
                    className="sin-contacto__opcion"
                    data-elegida={motivo === m.valor}
                  >
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
                style={{ marginTop: 10, width: '100%', boxSizing: 'border-box' }}
              />

              {error ? (
                <p className="tamizaje__error" role="alert" style={{ fontSize: '0.82rem' }}>
                  {error}
                </p>
              ) : null}
            </div>

            <div
              className="mensaje__acciones"
              style={{ justifyContent: 'flex-end', marginTop: 16 }}
            >
              <button
                className="boton-mini"
                type="button"
                onClick={() => setAbierto(false)}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                className="boton-mini"
                data-tono="principal"
                type="button"
                onClick={marcar}
                disabled={guardando}
              >
                {guardando ? 'Guardando…' : 'Apuntar el intento'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
