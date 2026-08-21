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
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Un solo botón, que aprueba Y activa. Había dos ("Aprobar" y "Aprobar y
   * activar") y en la práctica confundían: aprobar sin activar dejaba al
   * profesional en pendiente y no aparecía como candidato, así que parecía
   * que el botón no había hecho nada.
   */
  async function aprobar() {
    setCargando(true)
    setError(null)
    try {
      const respuesta = await fetch(`/api/portal/professionals/aprobar/${volunteerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVO' }),
      })
      const datos = await respuesta.json()

      if (!respuesta.ok || !datos.success) {
        setError(datos.message ?? 'No se pudo aprobar')
        return
      }

      // Primero la confirmación, luego el refresco: sin esto la página se
      // recargaba en silencio y parecía que no había pasado nada.
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
        ✓ Guardado
      </span>
    )
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
      <button
        className="boton-mini"
        data-tono="principal"
        onClick={aprobar}
        disabled={cargando}
      >
        {cargando ? 'Aprobando…' : 'Aprobar'}
      </button>
    </>
  )
}
