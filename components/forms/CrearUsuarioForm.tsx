
'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Save, UserCheck, X, Sparkles, Search } from 'lucide-react'
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

type VoluntarioSimple = {
  id: string
  name: string
  email: string
  areaLegible: string
  discipline: string
}

export function CrearUsuarioForm({
  voluntariosRegistrados = [],
}: {
  voluntariosRegistrados?: VoluntarioSimple[]
}) {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', role: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)
  const [busquedaVoluntario, setBusquedaVoluntario] = useState('')
  const [voluntarioSeleccionadoId, setVoluntarioSeleccionadoId] = useState<string | null>(null)

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  // Filtrado de voluntarios registrados para autocompletar
  const voluntariosFiltrados = useMemo(() => {
    if (!busquedaVoluntario.trim()) return voluntariosRegistrados.slice(0, 10)
    const q = busquedaVoluntario.toLowerCase()
    return voluntariosRegistrados.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.discipline.toLowerCase().includes(q)
    )
  }, [voluntariosRegistrados, busquedaVoluntario])

  function seleccionarVoluntario(v: VoluntarioSimple) {
    setForm((current) => ({
      ...current,
      name: v.name,
      email: v.email,
    }))
    setVoluntarioSeleccionadoId(v.id)
    setErrors((e) => {
      const next = { ...e }
      delete next.name
      delete next.email
      return next
    })
  }

  function limpiarSeleccionVoluntario() {
    setVoluntarioSeleccionadoId(null)
    setForm((current) => ({
      ...current,
      name: '',
      email: '',
    }))
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
    <form className="form" style={{ maxWidth: 640 }} onSubmit={handleSubmit} noValidate>
      {/* Selector / Sincronización con el Módulo de Voluntarios */}
      {voluntariosRegistrados.length > 0 && (
        <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserCheck size={16} color="#059669" />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                Sincronizar con voluntario registrado
              </span>
            </div>
            {voluntarioSeleccionadoId && (
              <button
                type="button"
                onClick={limpiarSeleccionVoluntario}
                style={{ fontSize: '0.76rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Limpiar selección
              </button>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
            Selecciona un voluntario para autocompletar su nombre y correo automáticamente:
          </p>

          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o disciplina..."
              value={busquedaVoluntario}
              onChange={(e) => setBusquedaVoluntario(e.target.value)}
              style={{ width: '100%', padding: '7px 10px 7px 30px', borderRadius: 7, fontSize: '0.84rem', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
            {voluntariosFiltrados.map((v) => {
              const sel = voluntarioSeleccionadoId === v.id || form.email === v.email
              return (
                <div
                  key={v.id}
                  onClick={() => seleccionarVoluntario(v)}
                  style={{
                    padding: '8px 10px', borderRadius: 7, cursor: 'pointer',
                    border: '1.5px solid ' + (sel ? '#059669' : '#e2e8f0'),
                    background: sel ? '#ecfdf5' : '#fff',
                    display: 'flex', flexDirection: 'column', gap: 2,
                  }}
                >
                  <strong style={{ fontSize: '0.84rem', color: sel ? '#065f46' : '#1e293b' }}>{v.name}</strong>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>{v.email} · {v.discipline}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
