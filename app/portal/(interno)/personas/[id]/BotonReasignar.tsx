'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw } from 'lucide-react'

const MOTIVOS_REASIGNACION = [
  'El profesional no respondió',
  'El profesional tuvo un imprevisto / no puede continuar',
  'Incompatibilidad de horarios / fechas',
  'La persona solicitó cambio de profesional',
  'Otro motivo',
] as const

export function BotonReasignar({
  asignacionId,
  profesionalNombre,
  textoBoton = 'Reasignar profesional',
  onError,
}: {
  asignacionId: string
  profesionalNombre: string
  textoBoton?: string
  onError?: (m: string) => void
}) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState(false)
  const [motivo, setMotivo] = useState<string>('')
  const [detalle, setDetalle] = useState('')
  const [errorLocal, setErrorLocal] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function reasignar() {
    if (!motivo) {
      const msg = 'Elige el motivo de la reasignación.'
      setErrorLocal(msg)
      onError?.(msg)
      return
    }
    if (motivo === 'Otro motivo' && detalle.trim().length < 3) {
      const msg = 'Cuéntanos el motivo por el cual se reasigna.'
      setErrorLocal(msg)
      onError?.(msg)
      return
    }

    const texto =
      motivo === 'Otro motivo'
        ? detalle.trim().slice(0, 280)
        : detalle.trim()
          ? `${motivo}: ${detalle.trim()}`.slice(0, 300)
          : motivo

    setEnviando(true)
    setErrorLocal(null)
    try {
      const r = await fetch(`/api/portal/appointments/asignaciones/${asignacionId}/cancelar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: texto }),
      })
      const d = await r.json()
      if (!r.ok || !d.success) {
        const msg = d.message ?? 'No se pudo reasignar'
        setErrorLocal(msg)
        onError?.(msg)
        return
      }
      router.refresh()
    } catch {
      const msg = 'No pudimos conectarnos con el servidor'
      setErrorLocal(msg)
      onError?.(msg)
    } finally {
      setEnviando(false)
    }
  }

  if (!confirmando) {
    return (
      <button className="boton-mini" type="button" onClick={() => setConfirmando(true)}>
        <RotateCcw size={14} />
        {textoBoton}
      </button>
    )
  }

  return (
    <div
      style={{
        marginTop: 12,
        padding: '14px 16px',
        backgroundColor: 'var(--color-bg-default)',
        borderRadius: 'var(--border-radii-layout)',
        border: '1px solid var(--color-border-default)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%',
      }}
    >
      <strong style={{ fontSize: '0.92rem', color: 'var(--color-text-default)' }}>
        Reasignar profesional (actual: {profesionalNombre})
      </strong>
      <p className="panel__nota" style={{ margin: 0 }}>
        ¿Por qué motivo se reasigna este caso?
      </p>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {MOTIVOS_REASIGNACION.map((m) => (
          <button
            key={m}
            className="boton-mini"
            data-tono={motivo === m ? 'principal' : undefined}
            type="button"
            aria-pressed={motivo === m}
            onClick={() => {
              setMotivo(m)
              setErrorLocal(null)
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <input
        className="input"
        style={{ maxWidth: 420 }}
        placeholder={motivo === 'Otro motivo' ? '¿Cuál es el motivo?' : 'Detalle o nota adicional (opcional)'}
        maxLength={280}
        value={detalle}
        onChange={(e) => {
          setDetalle(e.target.value)
          setErrorLocal(null)
        }}
      />

      <p className="panel__nota" style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
        Al confirmar, la asignación actual se cancelará y el caso volverá al estado <strong>En admisión</strong> para que puedas proponer de inmediato a otro profesional disponible.
      </p>

      {errorLocal ? (
        <div className="aviso-portal" data-tono="rojo">
          {errorLocal}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
        <button
          className="boton-mini"
          data-tono="peligro"
          type="button"
          onClick={reasignar}
          disabled={enviando}
        >
          {enviando ? 'Reasignando…' : 'Sí, reasignar caso'}
        </button>
        <button className="boton-mini" type="button" onClick={() => setConfirmando(false)}>
          Volver
        </button>
      </div>
    </div>
  )
}
