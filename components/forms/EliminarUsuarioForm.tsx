'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormStatus, type Status } from './FormStatus'

export function EliminarUsuarioForm({ id, nombre, role }: { id: string, nombre: string, role: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    setStatus(null)
    setSubmitting(true)

    try {
      const response = await fetch(`/api/portal/users/${id}`, {
        method: 'DELETE',
      })
      
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        setStatus({ type: 'error', message: payload.message ?? 'No pudimos eliminar la cuenta.' })
        setSubmitting(false)
        setConfirming(false)
        return
      }

      setStatus({ type: 'success', message: 'Cuenta eliminada exitosamente. Redirigiendo...' })
      
      // Redirigir a la lista después de un momento
      setTimeout(() => {
        router.push('/portal/usuarios')
        router.refresh()
      }, 1500)
    } catch {
      setStatus({
        type: 'error',
        message: 'Error de conexión. Intenta de nuevo.',
      })
      setSubmitting(false)
      setConfirming(false)
    }
  }

  if (!confirming) {
    return (
      <div>
        <Button 
          type="button" 
          variant="default" 
          style={{ backgroundColor: 'var(--color-rojo)', color: 'white', borderColor: 'var(--color-rojo)' }} 
          icon={<Trash2 size={16} />}
          onClick={() => setConfirming(true)}
        >
          Eliminar cuenta permanentemente
        </Button>
      </div>
    )
  }

  return (
    <div className="panel" style={{ border: '1px solid var(--color-rojo)', backgroundColor: '#fff5f5' }}>
      <h3 style={{ color: 'var(--color-rojo)' }}>¿Estás absolutamente seguro?</h3>
      <p style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
        Estás a punto de eliminar la cuenta de <strong>{nombre}</strong> ({role}). 
        Esta acción revocará inmediatamente su acceso y no se puede deshacer.
      </p>
      
      <div className="form__footer" style={{ marginTop: '1rem' }}>
        <FormStatus status={status} />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button 
            type="button" 
            variant="default" 
            disabled={submitting} 
            onClick={() => setConfirming(false)}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="default" 
            style={{ backgroundColor: 'var(--color-rojo)', color: 'white', borderColor: 'var(--color-rojo)' }}
            disabled={submitting} 
            icon={<Trash2 size={16} />}
            onClick={handleDelete}
          >
            {submitting ? 'Eliminando...' : 'Sí, eliminar cuenta'}
          </Button>
        </div>
      </div>
    </div>
  )
}
