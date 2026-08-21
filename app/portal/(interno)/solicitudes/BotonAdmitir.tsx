'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Admitir una solicitud obliga a elegir prioridad.
 *
 * No es un valor por defecto que se ajusta después: es la pregunta que hace
 * que alguien mire el caso un segundo antes de meterlo a la cola. La cola de
 * pendientes por asignar se ordena justamente por esto.
 */

const PRIORIDADES = [
  { value: 'ALTA', label: 'Alta', ayuda: 'Hay que buscarle profesional hoy' },
  { value: 'MEDIA', label: 'Media', ayuda: 'En los próximos días' },
  { value: 'BAJA', label: 'Baja', ayuda: 'Puede esperar' },
] as const

export function BotonAdmitir({
  solicitudId,
  yaAdmitida,
}: {
  solicitudId: string
  yaAdmitida: boolean
}) {
  const router = useRouter()
  const [eligiendo, setEligiendo] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function admitir(priority: string) {
    setCargando(true)
    setError(null)
    try {
      const respuesta = await fetch(`/api/portal/patients/admitir/${solicitudId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      })
      const datos = await respuesta.json()

      if (!respuesta.ok || !datos.success) {
        setError(datos.message ?? 'No se pudo admitir')
        return
      }
      setEligiendo(false)
      router.refresh()
    } catch {
      setError('No pudimos conectarnos')
    } finally {
      setCargando(false)
    }
  }

  if (yaAdmitida) {
    return <span className="tabla__secundario" style={{ marginTop: 0 }}>Ya admitida</span>
  }

  if (!eligiendo) {
    return (
      <>
        {error ? (
          <span className="tabla__secundario" style={{ marginTop: 0, color: 'var(--color-red)' }}>
            {error}
          </span>
        ) : null}
        <button className="boton-mini" data-tono="principal" onClick={() => setEligiendo(true)}>
          Admitir
        </button>
      </>
    )
  }

  return (
    <div className="admitir">
      <span className="admitir__pregunta">¿Con qué prioridad?</span>
      <div className="admitir__opciones">
        {PRIORIDADES.map((p) => (
          <button
            key={p.value}
            className="boton-mini"
            data-prioridad={p.value}
            title={p.ayuda}
            disabled={cargando}
            onClick={() => admitir(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <button
        className="admitir__cancelar"
        type="button"
        disabled={cargando}
        onClick={() => setEligiendo(false)}
      >
        Cancelar
      </button>
    </div>
  )
}
