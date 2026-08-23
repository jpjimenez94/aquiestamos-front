'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Archive } from 'lucide-react'

/**
 * PASO 4 — El acompañamiento terminó, o ya no va a pasar.
 *
 * Vive debajo de «Qué ha reportado quien acompaña», no en el panel del caso:
 * cerrar es la decisión que se toma DESPUÉS de leer el reporte, y el botón
 * está donde está la lectura. Aparece solo cuando existe al menos un reporte
 * — cerrar sin haber leído al profesional es cerrar a ciegas.
 *
 * CERRADA es final: reabrir no existe, lo que existe es proponer una
 * asignación nueva. Por eso pide motivo y confirma antes.
 */
const MOTIVOS_CIERRE = [
  'Acompañamiento completado',
  'La persona desistió o ya no lo necesita',
  'No fue posible volver a contactarla',
  'Se remitió a otro servicio',
  'Otro',
] as const

export function BotonCerrarCaso({ asignacionId }: { asignacionId: string }) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState(false)
  const [motivo, setMotivo] = useState<string>('')
  const [detalle, setDetalle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function cerrar() {
    if (!motivo) {
      setError('Elige por qué se cierra.')
      return
    }
    if (motivo === 'Otro' && detalle.trim().length < 3) {
      setError('Cuéntanos por qué se cierra.')
      return
    }

    // El motivo guardado es la opción y, si hay, el matiz. Máximo 300 en el
    // backend; el recorte del detalle deja sitio de sobra.
    const texto =
      motivo === 'Otro'
        ? detalle.trim().slice(0, 280)
        : detalle.trim()
          ? `${motivo}: ${detalle.trim()}`.slice(0, 300)
          : motivo

    setEnviando(true)
    setError(null)
    try {
      const r = await fetch(`/api/portal/appointments/asignaciones/${asignacionId}/cerrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: texto }),
      })
      const d = await r.json()
      if (!r.ok || !d.success) {
        setError(d.message ?? 'No se pudo cerrar el caso')
        return
      }
      router.refresh()
    } catch {
      setError('No pudimos conectarnos con el servidor')
    } finally {
      setEnviando(false)
    }
  }

  if (!confirmando) {
    return (
      <div style={{ marginTop: 16, borderTop: '1px solid var(--color-border-default)', paddingTop: 16 }}>
        <button className="boton-mini" type="button" onClick={() => setConfirmando(true)}>
          <Archive size={14} />
          Cerrar caso
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        marginTop: 16,
        borderTop: '1px solid var(--color-border-default)',
        paddingTop: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <strong style={{ fontSize: '0.9rem' }}>¿Por qué se cierra?</strong>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {MOTIVOS_CIERRE.map((m) => (
          <button
            key={m}
            className="boton-mini"
            data-tono={motivo === m ? 'principal' : undefined}
            type="button"
            aria-pressed={motivo === m}
            onClick={() => {
              setMotivo(m)
              setError(null)
            }}
          >
            {m}
          </button>
        ))}
      </div>
      <input
        className="input"
        style={{ maxWidth: 380 }}
        placeholder={motivo === 'Otro' ? '¿Qué pasó?' : 'Algún detalle (opcional)'}
        maxLength={280}
        value={detalle}
        onChange={(e) => {
          setDetalle(e.target.value)
          setError(null)
        }}
      />
      <p className="panel__nota" style={{ margin: 0 }}>
        Cerrar es definitivo: el profesional libera el cupo y el caso sale del tablero. Si algún
        día hace falta retomar, se propone una asignación nueva.
      </p>
      {error ? (
        <div className="aviso-portal" data-tono="rojo">
          {error}
        </div>
      ) : null}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button
          className="boton-mini"
          data-tono="peligro"
          type="button"
          onClick={cerrar}
          disabled={enviando}
        >
          {enviando ? 'Cerrando…' : 'Sí, cerrar el caso'}
        </button>
        <button className="boton-mini" type="button" onClick={() => setConfirmando(false)}>
          Volver
        </button>
      </div>
    </div>
  )
}
