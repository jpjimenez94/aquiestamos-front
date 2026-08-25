'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormStatus, type Status } from './FormStatus'
import { TextField, RadioField, Bloque } from './fields'

const ROLES = [
  { value: 'ADMIN', label: 'Administración (acceso total)' },
  { value: 'LIDERES_COMUNITARIOS', label: 'Líderes Comunitarios (Centro de mando y Guía)' },
  { value: 'ADMISION', label: 'Admisión (Postulaciones, Solicitudes y Verificaciones)' },
  { value: 'COORDINADOR_CASOS', label: 'Gestión de Casos (Agenda y Personas)' },
  { value: 'AGENDADOR', label: 'Voluntario digital general (Entrada y Agenda)' },
  { value: 'PROFESIONAL', label: 'Profesional (Agenda personal)' },
  { value: 'LECTURA', label: 'Solo lectura (Supervisión)' },
]

export function CrearUsuarioForm() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', role: '', password: '' })
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
    if (!form.role) found.role = 'Selecciona un rol'
    if (!form.password) found.password = 'La contraseña es obligatoria'
    else if (form.password.length < 8) found.password = 'Debe tener al menos 8 caracteres'
    return found
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus(null)

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setStatus({ type: 'error', message: 'Revisa los campos marcados antes de enviar.' })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/portal/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        if (payload.details) setErrors(payload.details)
        setStatus({ type: 'error', message: payload.message ?? 'No pudimos crear la cuenta.' })
        return
      }

      setStatus({ type: 'success', message: 'Cuenta creada exitosamente.' })
      
      // Redirigir a la lista después de 1.5s
      setTimeout(() => {
        router.push('/portal/usuarios')
        router.refresh()
      }, 1500)
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
      <Bloque numero={1} titulo="Datos de la cuenta">
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
        <TextField
          label="Contraseña temporal"
          name="password"
          type="text"
          hint="Mínimo 8 caracteres, al menos una letra y un número. La persona deberá cambiarla al iniciar sesión."
          required
          value={form.password}
          error={errors.password}
          onChange={(v) => update('password', v)}
        />
      </Bloque>

      <div className="form__footer">
        <FormStatus status={status} />
        <Button type="submit" variant="primary" disabled={submitting} icon={<Save size={16} />}>
          {submitting ? 'Guardando…' : 'Crear cuenta'}
        </Button>
      </div>
    </form>
  )
}
