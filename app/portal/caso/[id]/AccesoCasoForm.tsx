'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/forms/fields'
import { FormStatus, type Status } from '@/components/forms/FormStatus'
import { authorizeCaseAction } from './actions'

export function AccesoCasoForm({ patientId }: { patientId: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!email.trim()) {
      setStatus({ type: 'error', message: 'El correo es obligatorio.' })
      return
    }

    setStatus(null)
    setSubmitting(true)

    try {
      const res = await authorizeCaseAction(patientId, email.trim())
      if (!res.success) {
        setStatus({ type: 'error', message: res.message ?? 'No pudimos validar tu correo.' })
        setSubmitting(false)
        return
      }
      
      setStatus({ type: 'success', message: 'Acceso concedido.' })
      
      // Refresca la ruta actual (volverá a hacer fetch con la nueva cookie)
      setTimeout(() => {
        router.refresh()
      }, 800)

    } catch (e) {
      setStatus({ type: 'error', message: 'Error de conexión.' })
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <TextField
        label="Correo electrónico de la red"
        name="email"
        type="email"
        required
        value={email}
        onChange={setEmail}
      />
      
      <div className="form__footer">
        <FormStatus status={status} />
        <Button type="submit" variant="primary" disabled={submitting} icon={<ArrowRight size={16} />}>
          {submitting ? 'Verificando...' : 'Acceder al caso'}
        </Button>
      </div>
    </form>
  )
}
