'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle } from 'lucide-react'

export function BotonEliminarPostulacion({
  postulacionId,
  nombreProfesional,
  onEliminada,
}: {
  postulacionId: string
  nombreProfesional: string
  onEliminada?: (id: string) => void
}) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function eliminar() {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch(`/api/portal/volunteers/${postulacionId}`, {
        method: 'DELETE',
      })
      const datos = await res.json()
      if (!res.ok || !datos.success) {
        setError(datos.message ?? 'No se pudo eliminar la postulación')
        setCargando(false)
        return
      }
      setConfirmando(false)
      if (onEliminada) {
        onEliminada(postulacionId)
      }
      router.refresh()
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
      setCargando(false)
    }
  }

  if (!confirmando) {
    return (
      <button
        type="button"
        className="boton-mini"
        data-tono="peligro"
        title="Eliminar postulación (solo administradores)"
        onClick={() => setConfirmando(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
      >
        <Trash2 size={13} />
        Eliminar
      </button>
    )
  }

  return (
    <div className="modal-eliminar-overlay" onClick={() => !cargando && setConfirmando(false)}>
      <div
        className="modal-eliminar"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-eliminar-postulacion-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-eliminar__icono">
          <AlertTriangle size={28} />
        </div>
        <h3 id="modal-eliminar-postulacion-titulo" className="modal-eliminar__titulo">
          ¿Eliminar esta postulación?
        </h3>
        <p className="modal-eliminar__cuerpo">
          Estás a punto de eliminar la postulación de{' '}
          <strong>{nombreProfesional}</strong>. Esta acción aplica un borrado lógico
          —el registro queda en la base de datos para fines de auditoría— pero
          dejará de aparecer en la lista del portal.
        </p>
        {error && (
          <p className="modal-eliminar__error">
            {error}
          </p>
        )}
        <div className="modal-eliminar__acciones">
          <button
            type="button"
            className="boton-mini"
            data-tono="peligro"
            disabled={cargando}
            onClick={eliminar}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <Trash2 size={13} />
            {cargando ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
          <button
            type="button"
            className="boton-mini"
            disabled={cargando}
            onClick={() => { setConfirmando(false); setError(null) }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
