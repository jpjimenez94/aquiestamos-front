'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserCheck } from 'lucide-react'

export function BotonAdmitirSolicitud({
  solicitudId,
  yaAdmitida,
}: {
  solicitudId: string
  nombrePersona?: string
  yaAdmitida: boolean
}) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function admitir() {
    setCargando(true)
    setError(null)
    try {
      const respuesta = await fetch(`/api/portal/patients/admitir/${solicitudId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: 'MEDIA' }),
      })
      const datos = await respuesta.json()

      if (!respuesta.ok || !datos.success) {
        setError(datos.message ?? 'No se pudo admitir la solicitud')
        return
      }

      setGuardado(true)
      setTimeout(() => router.refresh(), 900)
    } catch {
      setError('No pudimos conectarnos')
    } finally {
      setCargando(false)
    }
  }

  if (guardado) {
    return (
      <span className="guardado" role="status">
        ✓ Admitida
      </span>
    )
  }

  if (yaAdmitida) {
    return null
  }

  return (
    <>
      {error ? (
        <span className="tabla__secundario" style={{ marginTop: 0, color: 'var(--color-red)' }}>
          {error}
        </span>
      ) : null}
      <button
        type="button"
        className="boton-mini"
        data-tono="principal"
        onClick={admitir}
        disabled={cargando}
        title="Admitir solicitud directamente con prioridad MEDIA"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
      >
        <UserCheck size={13} />
        {cargando ? 'Admitiendo…' : 'Admitir'}
      </button>
    </>
  )
}
