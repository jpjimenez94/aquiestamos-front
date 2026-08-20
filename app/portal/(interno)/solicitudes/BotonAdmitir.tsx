'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function BotonAdmitir({
  solicitudId,
  yaAdmitida,
}: {
  solicitudId: string
  yaAdmitida: boolean
}) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function admitir() {
    setCargando(true)
    setError(null)
    try {
      const respuesta = await fetch(`/api/portal/patients/admitir/${solicitudId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      const datos = await respuesta.json()

      if (!respuesta.ok || !datos.success) {
        setError(datos.message ?? 'No se pudo admitir')
        return
      }
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

  return (
    <>
      {error ? (
        <span className="tabla__secundario" style={{ marginTop: 0, color: 'var(--color-red)' }}>
          {error}
        </span>
      ) : null}
      <button className="boton-mini" data-tono="principal" onClick={admitir} disabled={cargando}>
        {cargando ? 'Admitiendo…' : 'Admitir'}
      </button>
    </>
  )
}
