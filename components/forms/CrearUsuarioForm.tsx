
'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Save, UserCheck, X, Sparkles, Search, Copy, Check, RefreshCw, MessageSquare, ArrowRight } from 'lucide-react'
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
  phone?: string
  areaLegible: string
  discipline: string
}

function generarPasswordSegura(): string {
  const minusculas = 'abcdefghjkmnpqrstuvwxyz'
  const mayusculas = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const numeros = '23456789'
  const especiales = '#$%&*-!@'

  let pass = ''
  pass += mayusculas[Math.floor(Math.random() * mayusculas.length)]
  pass += minusculas[Math.floor(Math.random() * minusculas.length)]
  pass += numeros[Math.floor(Math.random() * numeros.length)]
  pass += especiales[Math.floor(Math.random() * especiales.length)]

  const todos = minusculas + mayusculas + numeros + especiales
  for (let i = 0; i < 7; i++) {
    pass += todos[Math.floor(Math.random() * todos.length)]
  }

  return pass.split('').sort(() => 0.5 - Math.random()).join('')
}

export function CrearUsuarioForm({
  voluntariosRegistrados = [],
}: {
  voluntariosRegistrados?: VoluntarioSimple[]
}) {
  const router = useRouter()
  const [form, setForm] = useState(() => ({
    name: '',
    email: '',
    role: '',
    password: generarPasswordSegura(),
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)
  const [busquedaVoluntario, setBusquedaVoluntario] = useState('')
  const [voluntarioSeleccionado, setVoluntarioSeleccionado] = useState<VoluntarioSimple | null>(null)
  const [copiadoPassword, setCopiadoPassword] = useState(false)
  const [copiadoMensajeCompleto, setCopiadoMensajeCompleto] = useState(false)
  const [cuentaCreadaExitosamente, setCuentaCreadaExitosamente] = useState<{
    name: string
    email: string
    role: string
    password: string
    phone?: string
  } | null>(null)

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function regenerarPassword() {
    const nueva = generarPasswordSegura()
    update('password', nueva)
  }

  async function copiarPasswordAlPortapapeles() {
    if (!form.password) return
    try {
      await navigator.clipboard.writeText(form.password)
      setCopiadoPassword(true)
      setTimeout(() => setCopiadoPassword(false), 2500)
    } catch {
      alert('Contraseña: ' + form.password)
    }
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
    setVoluntarioSeleccionado(v)
    setErrors((e) => {
      const next = { ...e }
      delete next.name
      delete next.email
      return next
    })
  }

  function limpiarSeleccionVoluntario() {
    setVoluntarioSeleccionado(null)
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

      setCuentaCreadaExitosamente({
        name: form.name,
        email: form.email,
        role: form.role,
        password: form.password,
        phone: voluntarioSeleccionado?.phone,
      })
    } catch {
      setStatus({
        type: 'error',
        message: 'Error de conexión. Intenta de nuevo.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  function armarMensajeCredenciales(creds: NonNullable<typeof cuentaCreadaExitosamente>) {
    return [
      `¡Hola ${creds.name}! Te hemos creado tu cuenta de acceso al Portal Aquí Estamos.`,
      '',
      `🌐 Acceso: https://www.redaquiestamos.org/portal/entrar`,
      `👤 Usuario / Correo: ${creds.email}`,
      `🔑 Contraseña temporal: ${creds.password}`,
      '',
      '* Por seguridad, te recomendamos cambiar la contraseña al iniciar sesión por primera vez.',
    ].join('\n')
  }

  async function copiarMensajeBienvenida() {
    if (!cuentaCreadaExitosamente) return
    const msg = armarMensajeCredenciales(cuentaCreadaExitosamente)
    try {
      await navigator.clipboard.writeText(msg)
      setCopiadoMensajeCompleto(true)
      setTimeout(() => setCopiadoMensajeCompleto(false), 2500)
    } catch {
      alert(msg)
    }
  }

  function enviarPorWhatsApp() {
    if (!cuentaCreadaExitosamente) return
    const msg = armarMensajeCredenciales(cuentaCreadaExitosamente)
    const tel = (cuentaCreadaExitosamente.phone ?? '').replace(/\D/g, '')
    const url = tel ? `https://wa.me/${tel.startsWith('57') ? tel : '57' + tel}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  // Si la cuenta fue creada exitosamente, mostramos la tarjeta de entrega de credenciales
  if (cuentaCreadaExitosamente) {
    const rolLabel = ROLES.find((r) => r.value === cuentaCreadaExitosamente.role)?.label ?? cuentaCreadaExitosamente.role

    return (
      <div style={{ maxWidth: 640, background: '#fff', border: '2px solid #059669', borderRadius: 14, padding: 24, boxShadow: '0 4px 20px rgba(5,150,105,0.15)', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#065f46' }}>¡Cuenta creada exitosamente!</h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              Copia las credenciales generadas para enviarlas de inmediato al miembro del equipo:
            </p>
          </div>
        </div>

        <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Nombre:</span>
            <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{cuentaCreadaExitosamente.name}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Usuario / Correo:</span>
            <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{cuentaCreadaExitosamente.email}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Rol asignado:</span>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#059669' }}>{rolLabel}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Contraseña temporal:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <code style={{ fontSize: '1rem', fontWeight: 800, background: '#fff', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: 6, color: '#0f172a', letterSpacing: 1 }}>
                {cuentaCreadaExitosamente.password}
              </code>
              <button
                type="button"
                onClick={copiarPasswordAlPortapapeles}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 8px', borderRadius: 6, background: '#fff', border: '1.5px solid #cbd5e1', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                title="Copiar contraseña"
              >
                {copiadoPassword ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                {copiadoPassword ? 'Copiada' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>

        {/* Acciones de entrega de credenciales */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={copiarMensajeBienvenida}
            style={{
              flex: '1 1 auto',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 18px', borderRadius: 9, fontWeight: 700, fontSize: '0.9rem',
              background: copiadoMensajeCompleto ? '#ecfdf5' : '#0f172a',
              color: copiadoMensajeCompleto ? '#065f46' : '#fff',
              border: copiadoMensajeCompleto ? '1.5px solid #059669' : 'none',
              cursor: 'pointer',
            }}
          >
            {copiadoMensajeCompleto ? <Check size={16} /> : <Copy size={16} />}
            {copiadoMensajeCompleto ? '¡Mensaje copiado al portapapeles!' : 'Copiar datos de acceso'}
          </button>

          <button
            type="button"
            onClick={enviarPorWhatsApp}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '11px 18px', borderRadius: 9, fontWeight: 700, fontSize: '0.9rem',
              background: '#25D366', color: '#fff', border: 'none', cursor: 'pointer',
            }}
          >
            <MessageSquare size={16} />
            Enviar por WhatsApp
          </button>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setCuentaCreadaExitosamente(null)
              setForm({ name: '', email: '', role: '', password: generarPasswordSegura() })
              setVoluntarioSeleccionado(null)
            }}
            style={{ fontSize: '0.84rem', color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            + Crear otra cuenta
          </button>

          <button
            type="button"
            onClick={() => {
              router.push('/portal/usuarios')
              router.refresh()
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}
          >
            Ver lista de usuarios <ArrowRight size={14} />
          </button>
        </div>
      </div>
    )
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
            {voluntarioSeleccionado && (
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
              const sel = voluntarioSeleccionado?.id === v.id || form.email === v.email
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

        {/* Campo de Contraseña Segura con Generador y Botón de Copiar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label htmlFor="password" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
              Contraseña temporal *
            </label>
            <button
              type="button"
              onClick={regenerarPassword}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            >
              <RefreshCw size={13} />
              Generar otra contraseña
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              id="password"
              name="password"
              type="text"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: '0.94rem',
                fontWeight: 600,
                letterSpacing: 0.5,
                border: '1.5px solid ' + (errors.password ? '#dc2626' : '#cbd5e1'),
                outline: 'none',
                background: '#f8fafc',
                color: '#0f172a',
              }}
            />
            <button
              type="button"
              onClick={copiarPasswordAlPortapapeles}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 14px', borderRadius: 8, fontSize: '0.84rem', fontWeight: 700,
                border: '1.5px solid ' + (copiadoPassword ? '#059669' : '#cbd5e1'),
                background: copiadoPassword ? '#ecfdf5' : '#fff',
                color: copiadoPassword ? '#065f46' : '#334155',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
              title="Copiar contraseña al portapapeles"
            >
              {copiadoPassword ? <Check size={15} color="#059669" /> : <Copy size={15} />}
              {copiadoPassword ? '¡Copiada!' : 'Copiar'}
            </button>
          </div>

          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
            Generada automáticamente de forma segura. La persona deberá cambiarla al iniciar sesión por primera vez.
          </p>
          {errors.password && <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>{errors.password}</span>}
        </div>
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
