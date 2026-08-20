'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function BotonAprobar({
  volunteerId,
  yaAprobada,
}: {
  volunteerId: string
  yaAprobada: boolean
}) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function aprobar(activar: boolean) {
    setCargando(true)
    setError(null)
    try {
      const respuesta = await fetch(`/api/portal/professionals/aprobar/${volunteerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activar ? { status: 'ACTIVO' } : {}),
      })
      const datos = await respuesta.json()

      if (!respuesta.ok || !datos.success) {
        setError(datos.message ?? 'No se pudo aprobar')
        return
      }
      router.refresh()
    } catch {
      setError('No pudimos conectarnos')
    } finally {
      setCargando(false)
    }
  }

  if (yaAprobada) {
    return <span className="tabla__secundario" style={{ marginTop: 0 }}>Ya aprobada</span>
  }

  return (
    <>
      {error ? (
        <span className="tabla__secundario" style={{ marginTop: 0, color: 'var(--color-red)' }}>
          {error}
        </span>
      ) : null}
      <button className="boton-mini" onClick={() => aprobar(false)} disabled={cargando}>
        Aprobar
      </button>
      <button
        className="boton-mini"
        data-tono="principal"
        onClick={() => aprobar(true)}
        disabled={cargando}
      >
        {cargando ? 'Aprobando…' : 'Aprobar y activar'}
      </button>
    </>
  )
}
