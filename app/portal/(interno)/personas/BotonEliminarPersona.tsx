'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'

type Props = {
  personaId: string
  personaNombre: string
  redireccionarA?: string
  variante?: 'icono' | 'boton'
}

export function BotonEliminarPersona({
  personaId,
  personaNombre,
  redireccionarA,
  variante = 'icono',
}: Props) {
  const router = useRouter()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEliminar() {
    setEliminando(true)
    setError(null)

    try {
      const res = await fetch(`/api/portal/patients/${personaId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message ?? 'No pudimos eliminar este registro')
        setEliminando(false)
        return
      }

      setModalAbierto(false)
      if (redireccionarA) {
        router.push(redireccionarA)
      } else {
        router.refresh()
      }
    } catch {
      setError('Error de conexión con el servidor')
      setEliminando(false)
    }
  }

  return (
    <>
      {variante === 'boton' ? (
        <button
          type="button"
          className="boton-mini"
          style={{
            color: 'var(--color-red, #dc2626)',
            borderColor: 'rgba(220, 38, 38, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
          onClick={() => setModalAbierto(true)}
          title="Eliminar registro"
        >
          <Trash2 size={13} />
          Eliminar registro
        </button>
      ) : (
        <button
          type="button"
          className="boton-mini"
          style={{
            color: 'var(--color-red, #dc2626)',
            padding: '4px 6px',
          }}
          onClick={() => setModalAbierto(true)}
          title={`Eliminar a ${personaNombre}`}
        >
          <Trash2 size={13} />
        </button>
      )}

      {modalAbierto ? (
        <div
          className="modal-envoltorio"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !eliminando) setModalAbierto(false)
          }}
        >
          <div
            className="modal"
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              maxWidth: 440,
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-red, #dc2626)' }}>
              <AlertTriangle size={22} />
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>¿Eliminar este registro?</h3>
            </div>

            <p style={{ margin: '14px 0', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
              Vas a dar de baja a <strong>{personaNombre}</strong>. Esta acción se utiliza para limpiar registros de prueba o solicitudes que no aplican.
            </p>

            {error ? (
              <p
                style={{
                  color: 'var(--color-red, #dc2626)',
                  fontSize: '0.82rem',
                  margin: '0 0 14px',
                  background: '#fef2f2',
                  padding: '8px 12px',
                  borderRadius: 6,
                }}
              >
                {error}
              </p>
            ) : null}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button
                type="button"
                className="boton-mini"
                onClick={() => setModalAbierto(false)}
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="boton-mini"
                style={{
                  background: 'var(--color-red, #dc2626)',
                  color: '#fff',
                  borderColor: 'var(--color-red, #dc2626)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onClick={handleEliminar}
                disabled={eliminando}
              >
                {eliminando ? <Loader2 size={13} className="girando" /> : <Trash2 size={13} />}
                {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
