'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormStatus, type Status } from './FormStatus'
import { TextField, RadioField, CheckboxGroup } from './fields'

const ROLES = [
  { value: 'ADMIN', label: 'Administración (acceso total y gestión de cuentas)' },
  { value: 'ADMISION', label: 'Admisión (Postulaciones, Solicitudes y Verificaciones)' },
  { value: 'COORDINADOR_CASOS', label: 'Gestión de Casos (Agenda, Citas y Personas)' },
  { value: 'AGENDADOR', label: 'Voluntario digital general (Entrada y Agenda)' },
  { value: 'LIDERES_COMUNITARIOS', label: 'Líderes Comunitarios (Territorio y Procesos)' },
  { value: 'PROFESIONAL', label: 'Profesional (Agenda personal)' },
  { value: 'LECTURA', label: 'Solo lectura (Supervisión e Impacto)' },
] as const

export function EditarUsuarioForm({ usuario }: { usuario: any }) {
  const router = useRouter()
  const [form, setForm] = useState(() => {
    const rolesIniciales: string[] = Array.isArray(usuario.roles) && usuario.roles.length > 0
      ? usuario.roles
      : (usuario.role ? [usuario.role] : ['AGENDADOR'])
    return {
      name: usuario.name,
      email: usuario.email,
      roles: rolesIniciales,
      active: usuario.active ? 'ACTIVO' : 'INACTIVO',
    }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)

  function update(key: 'name' | 'email' | 'active', value: string) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function toggleRole(roleVal: string, checked: boolean) {
    setForm((current) => {
      const nextRoles = checked
        ? [...current.roles, roleVal]
        : current.roles.filter((r) => r !== roleVal)
      return { ...current, roles: nextRoles }
    })
    setErrors((e) => {
      if (!e.roles) return e
      const next = { ...e }
      delete next.roles
      return next
    })
  }

  function validate() {
    const found: Record<string, string> = {}
    if (!form.name.trim()) found.name = 'El nombre es obligatorio'
    if (!form.email.trim()) found.email = 'El correo es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) found.email = 'Correo no válido'
    if (!form.roles.length) found.roles = 'Debes seleccionar al menos un rol para este usuario'
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
        role: form.roles[0],
        roles: form.roles,
        active: form.active === 'ACTIVO',
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
    <form className="form" style={{ maxWidth: 620 }} onSubmit={handleSubmit} noValidate>
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

        <div style={{ marginTop: 4 }}>
          <CheckboxGroup
            label="Roles asignados"
            hint="Puedes seleccionar uno o varios roles. La cuenta tendrá todos los permisos combinados."
            required
            options={ROLES}
            values={form.roles}
            error={errors.roles}
            onToggle={toggleRole}
          />
        </div>

        <RadioField
          label="Estado de la cuenta"
          required
          options={[
            { value: 'ACTIVO', label: 'Activo' },
            { value: 'INACTIVO', label: 'Desactivado (sin acceso)' },
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
