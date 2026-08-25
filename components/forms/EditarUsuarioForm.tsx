'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormStatus, type Status } from './FormStatus'
import { TextField, RadioField, CheckboxGroup } from './fields'

const ROLES = [
  { value: 'ADMIN', label: 'Administración (acceso total)' },
  { value: 'ADMISION', label: 'Admisión (Postulaciones, Solicitudes y Verificaciones)' },
  { value: 'COORDINADOR_CASOS', label: 'Gestión de Casos (Agenda y Personas)' },
  { value: 'AGENDADOR', label: 'Voluntario digital general (Entrada y Agenda)' },
  { value: 'PROFESIONAL', label: 'Profesional (Agenda personal)' },
  { value: 'LECTURA', label: 'Solo lectura (Supervisión)' },
]

export function EditarUsuarioForm({ usuario }: { usuario: any }) {
  const router = useRouter()
  const [form, setForm] = useState({ 
    name: usuario.name, 
    email: usuario.email, 
    role: usuario.role,
    active: usuario.active ? 'ACTIVO' : 'INACTIVO'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function validate() {
    const found: Record<string, string> = {}
    if (!form.name.trim()) found.name = 'El nombre es obligatorio'
    if (!form.email.trim()) found.email = 'El correo es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) found.email = 'Correo no válido'
    return found
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus(null)

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setStatus({ type: 'error', message: 'Revisa los campos marcados.' })
      return
    }

    setSubmitting(true)
    try {
      const payloadBody = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        active: form.active === 'ACTIVO'
      }

      const response = await fetch(`/api/portal/users/${usuario.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadBody),
      })
      
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        if (payload.details) setErrors(payload.details)
        setStatus({ type: 'error', message: payload.message ?? 'No pudimos guardar los cambios.' })
        return
      }

      setStatus({ type: 'success', message: 'Cambios guardados correctamente.' })
      router.refresh()
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
          label="Nombre completo"
          name="name"
          required
          value={form.name}
          error={errors.name}
          onChange={(v) => update('name', v)}
        />
        <TextField
          label="Correo electrónico"
          name="email"
          type="email"
          required
          value={form.email}
          error={errors.email}
          onChange={(v) => update('email', v)}
        />
        <RadioField
          label="Rol"
          required
          options={ROLES}
          value={form.role}
          error={errors.role}
          onChange={(v) => update('role', v)}
        />
        <RadioField
          label="Estado de la cuenta"
          required
          options={[
            { value: 'ACTIVO', label: 'Activo' },
            { value: 'INACTIVO', label: 'Desactivado (sin acceso)' }
          ]}
          value={form.active}
          error={errors.active}
          onChange={(v) => update('active', v)}
        />
      </div>

      <div className="form__footer">
        <FormStatus status={status} />
        <Button type="submit" variant="primary" disabled={submitting} icon={<Save size={16} />}>
          {submitting ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}
