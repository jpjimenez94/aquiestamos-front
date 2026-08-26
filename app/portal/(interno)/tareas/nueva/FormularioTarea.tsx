
'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Send, ArrowLeft, Clock, UserCheck, Calendar, Sparkles, Check, Search } from 'lucide-react'
import Link from 'next/link'
import { DIA_LEGIBLE, FRANJA_LEGIBLE, DIA_SEMANA_MAP } from '../tipos'

const AREAS = [
  { value: 'SALUD', label: 'Salud y primeros auxilios', icono: '🩺' },
  { value: 'SOCIAL_LEGAL_EDUCATIVO', label: 'Social, legal y educativo', icono: '⚖️' },
  { value: 'OPERACION_LOGISTICA', label: 'Operación y logística', icono: '📦' },
  { value: 'COMUNICACION_TECNOLOGIA', label: 'Comunicación y tecnología', icono: '💻' },
  { value: 'GESTION_PROYECTOS', label: 'Gestión y proyectos', icono: '📊' },
  { value: 'OTRA', label: 'Otra área', icono: '✨' },
]

const PRIORIDADES = [
  { value: 'ALTA', label: 'Alta — urgente' },
  { value: 'MEDIA', label: 'Media — normal' },
  { value: 'BAJA', label: 'Baja — sin prisa' },
]

type Colab = {
  id: string
  fullName: string
  area: string
  discipline: string
  availableDays: string[]
  availableSlots: string[]
  email: string
  phone: string
}

export function FormularioTarea({ colaboradoresDisponibles }: { colaboradoresDisponibles: Colab[] }) {
  const router = useRouter()
  const [form, setForm] = useState({
    area: '',
    title: '',
    description: '',
    dueDate: '',
    startTime: '',
    endTime: '',
    priority: 'MEDIA',
    notes: '',
    collaboratorId: '',
    assignmentNote: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busquedaVoluntario, setBusquedaVoluntario] = useState('')

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => { const n = { ...e }; delete n[k]; return n })
  }

  // Día de la semana de la fecha seleccionada
  const diaSeleccionado = useMemo(() => {
    if (!form.dueDate) return null
    const [y, m, d] = form.dueDate.split('-').map(Number)
    const fecha = new Date(y, m - 1, d)
    return DIA_SEMANA_MAP[fecha.getDay()] ?? null
  }, [form.dueDate])

  // Filtrado y ordenamiento inteligente de voluntarios por disponibilidad
  const voluntariosOrdenados = useMemo(() => {
    return colaboradoresDisponibles
      .filter((c) => {
        const matchArea = !form.area || c.area === form.area || form.area === 'OTRA'
        const matchBusqueda =
          !busquedaVoluntario ||
          c.fullName.toLowerCase().includes(busquedaVoluntario.toLowerCase()) ||
          c.discipline.toLowerCase().includes(busquedaVoluntario.toLowerCase())
        return matchArea && matchBusqueda
      })
      .map((c) => {
        let score = 0
        const coincideArea = c.area === form.area
        const coincideDia = diaSeleccionado ? c.availableDays?.includes(diaSeleccionado) : false

        if (coincideArea) score += 2
        if (coincideDia) score += 3

        return { ...c, score, coincideDia, coincideArea }
      })
      .sort((a, b) => b.score - a.score)
  }, [colaboradoresDisponibles, form.area, diaSeleccionado, busquedaVoluntario])

  function validar() {
    const e: Record<string, string> = {}
    if (!form.area) e.area = 'Selecciona el área de la tarea'
    if (!form.title.trim() || form.title.trim().length < 3) e.title = 'El título debe tener al menos 3 caracteres'
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      e.endTime = 'La hora de fin debe ser posterior a la hora de inicio'
    }
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
          startTime: form.startTime || null,
          endTime: form.endTime || null,
          priority: form.priority,
          notes: form.notes.trim() || null,
          collaboratorId: form.collaboratorId || null,
          assignmentNote: form.assignmentNote.trim() || null,
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
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Área */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>1. Área de la labor *</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 8 }}>
          {AREAS.map((a) => {
            const sel = form.area === a.value
            return (
              <button
                key={a.value}
                type="button"
                onClick={() => update('area', a.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                  border: '2px solid ' + (sel ? '#059669' : '#e2e8f0'),
                  background: sel ? '#ecfdf5' : '#fff',
                  color: sel ? '#065f46' : '#1e293b',
                  fontWeight: 600, fontSize: '0.86rem',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{a.icono}</span>
                <span>{a.label}</span>
              </button>
            )
          })}
        </div>
        {errors.area && <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>{errors.area}</span>}
      </div>

      {/* 2. Título y Descripción */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="title" style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>2. Título de la tarea *</label>
          <input
            id="title"
            type="text"
            placeholder="Ej: Validación de 10 tarjetas profesionales en Colpsic y ReTHUS"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: 9, fontSize: '0.92rem',
              border: '1.5px solid ' + (errors.title ? '#dc2626' : '#e2e8f0'),
              outline: 'none', color: '#1e293b',
            }}
          />
          {errors.title && <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>{errors.title}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="description" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
            Descripción de la actividad <span style={{ fontWeight: 400, color: '#64748b' }}>(opcional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Detalles sobre qué se debe hacer, objetivos o enlaces de interés..."
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: 9, fontSize: '0.9rem', resize: 'vertical',
              border: '1.5px solid #e2e8f0', outline: 'none', color: '#1e293b', lineHeight: 1.5,
            }}
          />
        </div>
      </div>

      {/* 3. Fecha, Horarios (Inicio y Fin) y Prioridad */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>3. Fecha, Horario y Prioridad</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
          {/* Fecha límite */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="dueDate" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#475569' }}>
              Fecha límite / Día
            </label>
            <input
              id="dueDate"
              type="date"
              value={form.dueDate}
              onChange={(e) => update('dueDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{ padding: '9px 12px', borderRadius: 8, fontSize: '0.88rem', border: '1.5px solid #e2e8f0', outline: 'none', color: '#1e293b', background: '#fff' }}
            />
            {diaSeleccionado && (
              <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>
                📅 {DIA_LEGIBLE[diaSeleccionado]}
              </span>
            )}
          </div>

          {/* Hora inicio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="startTime" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#475569' }}>
              Hora inicio
            </label>
            <input
              id="startTime"
              type="time"
              value={form.startTime}
              onChange={(e) => update('startTime', e.target.value)}
              style={{ padding: '9px 12px', borderRadius: 8, fontSize: '0.88rem', border: '1.5px solid #e2e8f0', outline: 'none', color: '#1e293b', background: '#fff' }}
            />
          </div>

          {/* Hora fin */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="endTime" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#475569' }}>
              Hora fin
            </label>
            <input
              id="endTime"
              type="time"
              value={form.endTime}
              onChange={(e) => update('endTime', e.target.value)}
              style={{
                padding: '9px 12px', borderRadius: 8, fontSize: '0.88rem',
                border: '1.5px solid ' + (errors.endTime ? '#dc2626' : '#e2e8f0'),
                outline: 'none', color: '#1e293b', background: '#fff'
              }}
            />
            {errors.endTime && <span style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 600 }}>{errors.endTime}</span>}
          </div>

          {/* Prioridad */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="priority" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#475569' }}>
              Prioridad
            </label>
            <select
              id="priority"
              value={form.priority}
              onChange={(e) => update('priority', e.target.value)}
              style={{ padding: '9px 12px', borderRadius: 8, fontSize: '0.88rem', border: '1.5px solid #e2e8f0', outline: 'none', color: '#1e293b', background: '#fff' }}
            >
              {PRIORIDADES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Asignación inmediata de Voluntario según Disponibilidad */}
      <div style={{ background: '#fff', border: '2px solid #e2e8f0', borderRadius: 12, padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
              4. Asignar voluntario de una vez
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              {diaSeleccionado
                ? 'Sugerencias optimizadas para ' + DIA_LEGIBLE[diaSeleccionado] + ' y el área elegida:'
                : 'Sugerencias basadas en el área seleccionada y disponibilidad registrada:'}
            </p>
          </div>
          {form.collaboratorId && (
            <button
              type="button"
              onClick={() => update('collaboratorId', '')}
              style={{ fontSize: '0.78rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Descartar selección
            </button>
          )}
        </div>

        {/* Buscador de voluntarios */}
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Buscar voluntario por nombre o disciplina..."
            value={busquedaVoluntario}
            onChange={(e) => setBusquedaVoluntario(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 8, fontSize: '0.86rem', border: '1.5px solid #e2e8f0', outline: 'none' }}
          />
        </div>

        {voluntariosOrdenados.length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center', margin: '8px 0' }}>
            No encontramos voluntarios registrados con estos filtros.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, maxHeight: 280, overflowY: 'auto' }}>
            {voluntariosOrdenados.map((c) => {
              const sel = form.collaboratorId === c.id
              return (
                <div
                  key={c.id}
                  onClick={() => update('collaboratorId', sel ? '' : c.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 6,
                    padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                    border: '2px solid ' + (sel ? '#059669' : '#e2e8f0'),
                    background: sel ? '#ecfdf5' : '#f8fafc',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <strong style={{ fontSize: '0.88rem', color: sel ? '#065f46' : '#0f172a' }}>{c.fullName}</strong>
                    {sel && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem', fontWeight: 800, background: '#059669', color: '#fff', padding: '2px 7px', borderRadius: 5 }}>
                        <Check size={12} /> Asignado
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>{c.discipline}</span>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                    {c.coincideDia && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#dcfce7', color: '#15803d' }}>
                        ✨ Disponible {diaSeleccionado ? DIA_LEGIBLE[diaSeleccionado] : ''}
                      </span>
                    )}
                    {c.availableSlots?.map((s) => (
                      <span key={s} style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: 4, background: '#e2e8f0', color: '#334155' }}>
                        {FRANJA_LEGIBLE[s] ?? s}
                      </span>
                    ))}
                  </div>

                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>{c.email}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Nota personalizada de invitación si seleccionó a alguien */}
        {form.collaboratorId && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4, background: '#ecfdf5', padding: '12px 14px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
            <label htmlFor="assignmentNote" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#065f46' }}>
              Mensaje o nota para el voluntario en el correo de invitación:
            </label>
            <input
              id="assignmentNote"
              type="text"
              placeholder="Ej: Hola! Te asignamos este turno según tu disponibilidad en la mañana."
              value={form.assignmentNote}
              onChange={(e) => update('assignmentNote', e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 7, fontSize: '0.86rem', border: '1.5px solid #a7f3d0', outline: 'none', background: '#fff' }}
            />
          </div>
        )}
      </div>

      {/* 5. Notas internas confidenciales */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="notes" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
          5. Notas internas de coordinación <span style={{ fontWeight: 400, color: '#64748b' }}>(solo visibles en el portal)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Instrucciones del equipo, links de verificación, credenciales de apoyo, materiales..."
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          style={{
            padding: '10px 14px', borderRadius: 9, fontSize: '0.9rem', resize: 'vertical',
            border: '1.5px solid #e2e8f0', outline: 'none', color: '#1e293b', lineHeight: 1.5,
          }}
        />
      </div>

      {error && <p style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: '0.86rem' }}>{error}</p>}

      {/* Botones de acción */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 12, flexWrap: 'wrap' }}>
        <Link href="/portal/tareas" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.86rem', color: '#64748b', textDecoration: 'none' }}>
          <ArrowLeft size={15} />
          Volver a tareas
        </Link>
        <button
          type="submit"
          disabled={sending}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 10, fontWeight: 700, fontSize: '0.92rem',
            background: sending ? '#94a3b8' : '#059669', color: '#fff', border: 'none',
            cursor: sending ? 'default' : 'pointer',
            boxShadow: '0 2px 8px rgba(5,150,105,0.25)',
          }}
        >
          <Send size={16} />
          {sending ? 'Guardando...' : form.collaboratorId ? 'Crear y enviar invitación' : 'Crear tarea'}
        </button>
      </div>
    </form>
  )
}
