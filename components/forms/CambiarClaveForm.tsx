'use client'

import { useState } from 'react'
import { Key } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormStatus, type Status } from './FormStatus'
import { TextField } from './fields'

export function CambiarClaveForm({ id }: { id: string }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus(null)
    setError('')

    if (!password) {
      setError('La contraseña es obligatoria')
      return
    }
    if (password.length < 8) {
      setError('Debe tener al menos 8 caracteres')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/portal/users/${id}/restablecer-clave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        if (payload.details?.password) setError(payload.details.password)
        setStatus({ type: 'error', message: payload.message ?? 'No pudimos cambiar la clave.' })
        return
      }

      setStatus({ type: 'success', message: 'Contraseña restablecida exitosamente. Las sesiones activas se han cerrado.' })
      setPassword('')
    } catch {
      setStatus({
        type: 'error',
        message: 'Error de conexión. Intenta de nuevo.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" style={{ maxWidth: 600 }} onSubmit={handleSubmit} noValidate>
      <div className="bloque__campos">
        <TextField
          label="Nueva contraseña temporal"
          name="password"
          type="text"
          hint="Mínimo 8 caracteres, al menos una letra y un número."
          required
          value={password}
          error={error}
          onChange={(v) => {
            setPassword(v)
            setError('')
          }}
        />
      </div>

      <div className="form__footer">
        <FormStatus status={status} />
        <Button type="submit" variant="primary" disabled={submitting} icon={<Key size={16} />}>
          {submitting ? 'Restableciendo…' : 'Restablecer contraseña'}
        </Button>
      </div>
    </form>
  )
}
