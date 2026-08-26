
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const AREAS = [
  { value: 'SALUD', label: 'Salud y primeros auxilios', icono: '🩺' },
  { value: 'SOCIAL_LEGAL_EDUCATIVO', label: 'Social, legal y educativo', icono: '⚖️' },
  { value: 'OPERACION_LOGISTICA', label: 'Operacion y logistica', icono: '📦' },
  { value: 'COMUNICACION_TECNOLOGIA', label: 'Comunicacion y tecnologia', icono: '💻' },
  { value: 'GESTION_PROYECTOS', label: 'Gestion y proyectos', icono: '📊' },
  { value: 'OTRA', label: 'Otra area', icono: '✨' },
]

const PRIORIDADES = [
  { value: 'ALTA', label: 'Alta — urgente' },
  { value: 'MEDIA', label: 'Media — normal' },
  { value: 'BAJA', label: 'Baja — sin prisa' },
]

export function FormularioTarea() {
  const router = useRouter()
  const [form, setForm] = useState({ area: '', title: '', description: '', dueDate: '', priority: 'MEDIA', notes: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => { const n = { ...e }; delete n[k]; return n })
  }

  function validar() {
    const e: Record<string, string> = {}
    if (!form.area) e.area = 'Selecciona el area de la tarea'
    if (!form.title.trim() || form.title.trim().length < 3) e.title = 'El titulo debe tener al menos 3 caracteres'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validar()) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/portal/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area: form.area,
          title: form.title.trim(),
          description: form.description.trim() || null,
          dueDate: form.dueDate || null,
          priority: form.priority,
          notes: form.notes.trim() || null,
        }),
      })
      const payload = await res.json()
      if (!res.ok || !payload.success) { setError(payload.message ?? 'No pudimos guardar la tarea.'); return }
      router.push('/portal/tareas/' + payload.data.id)
    } catch {
      setError('No pudimos conectarnos. Intenta de nuevo.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>En que area es la tarea? *</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 8 }}>
          {AREAS.map((a) => {
            const sel = form.area === a.value
            return (
              <button key={a.value} type="button" onClick={() => update('area', a.value)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, textAlign: 'left', cursor: 'pointer', border: '2px solid ' + (sel ? '#059669' : '#e2e8f0'), background: sel ? '#ecfdf5' : '#fff', color: sel ? '#065f46' : '#1e293b', fontWeight: 600, fontSize: '0.84rem' }}>
                <span>{a.icono}</span><span>{a.label}</span>
              </button>
            )
          })}
        </div>
        {errors.area && <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>{errors.area}</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="title" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Titulo de la tarea *</label>
        <input id="title" type="text" placeholder="Ej: Verificar 10 tarjetas profesionales pendientes" value={form.title} onChange={(e) => update('title', e.target.value)} style={{ padding: '9px 12px', borderRadius: 8, fontSize: '0.9rem', border: '1.5px solid ' + (errors.title ? '#dc2626' : '#e2e8f0'), outline: 'none', color: '#1e293b' }} />
        {errors.title && <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>{errors.title}</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="description" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Descripcion <span style={{ fontWeight: 400, color: '#64748b' }}>(opcional)</span></label>
        <textarea id="description" rows={4} placeholder="Que hay que hacer exactamente?" value={form.description} onChange={(e) => update('description', e.target.value)} style={{ padding: '9px 12px', borderRadius: 8, fontSize: '0.9rem', resize: 'vertical', border: '1.5px solid #e2e8f0', outline: 'none', color: '#1e293b', lineHeight: 1.5 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="dueDate" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Fecha limite <span style={{ fontWeight: 400, color: '#64748b' }}>(opcional)</span></label>
          <input id="dueDate" type="date" value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ padding: '9px 12px', borderRadius: 8, fontSize: '0.9rem', border: '1.5px solid #e2e8f0', outline: 'none', color: '#1e293b' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="priority" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Prioridad</label>
          <select id="priority" value={form.priority} onChange={(e) => update('priority', e.target.value)} style={{ padding: '9px 12px', borderRadius: 8, fontSize: '0.9rem', border: '1.5px solid #e2e8f0', outline: 'none', color: '#1e293b', background: '#fff' }}>
            {PRIORIDADES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="notes" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Instrucciones internas <span style={{ fontWeight: 400, color: '#64748b' }}>(solo visibles para el equipo)</span></label>
        <textarea id="notes" rows={3} placeholder="Links, credenciales, materiales de apoyo..." value={form.notes} onChange={(e) => update('notes', e.target.value)} style={{ padding: '9px 12px', borderRadius: 8, fontSize: '0.9rem', resize: 'vertical', border: '1.5px solid #e2e8f0', outline: 'none', color: '#1e293b', lineHeight: 1.5 }} />
      </div>

      {error && <p style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: '0.86rem' }}>{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 12, flexWrap: 'wrap' }}>
        <Link href="/portal/tareas" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.86rem', color: '#64748b', textDecoration: 'none' }}>
          <ArrowLeft size={15} />
          Volver a tareas
        </Link>
        <button type="submit" disabled={sending} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 9, fontWeight: 700, fontSize: '0.9rem', background: sending ? '#94a3b8' : '#059669', color: '#fff', border: 'none', cursor: sending ? 'default' : 'pointer' }}>
          <Send size={15} />
          {sending ? 'Guardando...' : 'Crear tarea'}
        </button>
      </div>
    </form>
  )
}
