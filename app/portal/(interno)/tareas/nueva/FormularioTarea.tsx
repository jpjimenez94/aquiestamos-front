
'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Send, ArrowLeft, Clock, Calendar, Check, Search, Link2, AlertCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { DIA_LEGIBLE, FRANJA_LEGIBLE, DIA_SEMANA_MAP } from '../tipos'

const TIPOS_LABOR = [
  {
    id: 'VERIFICACION_TP',
    icono: '🪪',
    label: 'Verificar tarjetas profesionales (TP)',
    descripcion: 'Validar cédulas y TP en Colpsic, ReTHUS o SUNEDU',
    areaDefecto: 'SALUD',
    tituloSugerido: 'Validación de tarjetas profesionales en Colpsic y ReTHUS',
    descripcionSugerida: 'Revisar tarjetas y cédulas de nuevos profesionales en las plataformas públicas oficiales de verificación.',
  },
  {
    id: 'ASIGNACION_CITAS',
    icono: '📅',
    label: 'Asignar y gestionar citas',
    descripcion: 'Cuadrar agendas y coordinar turnos con personas',
    areaDefecto: 'OPERACION_LOGISTICA',
    tituloSugerido: 'Gestión y asignación de citas semanales',
    descripcionSugerida: 'Contactar a personas acompañadas y profesionales de la red para cuadrar y confirmar horarios de atención.',
  },
  {
    id: 'CREACION_PIEZAS',
    icono: '🎨',
    label: 'Crear piezas / Mercadeo',
    descripcion: 'Diseño para redes sociales, piezas gráficas y comunicados',
    areaDefecto: 'COMUNICACION_TECNOLOGIA',
    tituloSugerido: 'Creación de piezas gráficas para redes y difusión',
    descripcionSugerida: 'Diseñar piezas gráficas e infografías según la línea visual de la Fundación Aquí Estamos.',
  },
  {
    id: 'CONTACTO_TELEFONICO',
    icono: '📞',
    label: 'Llamadas y seguimiento telefónico',
    descripcion: 'Primer contacto, bienvenida o encuestas de satisfacción',
    areaDefecto: 'SOCIAL_LEGAL_EDUCATIVO',
    tituloSugerido: 'Llamadas de seguimiento y contacto inicial',
    descripcionSugerida: 'Realizar llamadas de seguimiento a personas de la lista prioritaria para verificar su estado y disponibilidad.',
  },
  {
    id: 'APOYO_OPERATIVO',
    icono: '📦',
    label: 'Apoyo logístico y operativo',
    descripcion: 'Manejo de inventarios, bases de datos o compras',
    areaDefecto: 'GESTION_PROYECTOS',
    tituloSugerido: 'Apoyo en organización y logística interna',
    descripcionSugerida: 'Apoyar tareas administrativas, consolidación de datos y coordinación operativa de la fundación.',
  },
  {
    id: 'PERSONALIZADA',
    icono: '✍️',
    label: 'Otra labor personalizada',
    descripcion: 'Define libremente el título, instrucciones y detalles',
    areaDefecto: 'OTRA',
    tituloSugerido: '',
    descripcionSugerida: '',
  },
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
  status?: string
}

function calcularFranjasRequeridas(startTime?: string, endTime?: string): string[] {
  if (!startTime && !endTime) return []

  const parseHour = (t?: string) => {
    if (!t) return null
    const [h, m] = t.split(':').map(Number)
    return h + (m || 0) / 60
  }

  const inicio = parseHour(startTime)
  const fin = parseHour(endTime)
  const franjas: string[] = []

  if (inicio !== null && fin === null) {
    if (inicio < 12) franjas.push('MANANA')
    else if (inicio < 18) franjas.push('TARDE')
    else franjas.push('NOCHE')
    return franjas
  }

  if (inicio !== null && fin !== null) {
    if (inicio < 12 && fin > 0) franjas.push('MANANA')
    if ((inicio < 18 && fin > 12) || (inicio >= 12 && inicio < 18)) franjas.push('TARDE')
    if (fin > 18 || inicio >= 18) franjas.push('NOCHE')
    return Array.from(new Set(franjas))
  }

  if (fin !== null) {
    if (fin <= 12) franjas.push('MANANA')
    else if (fin <= 18) franjas.push('TARDE')
    else franjas.push('NOCHE')
  }

  return franjas
}

export function FormularioTarea({ colaboradoresDisponibles }: { colaboradoresDisponibles: Colab[] }) {
  const router = useRouter()
  const [tipoLaborSel, setTipoLaborSel] = useState<string>('VERIFICACION_TP')
  const [form, setForm] = useState({
    area: 'SALUD',
    title: 'Validación de tarjetas profesionales en Colpsic y ReTHUS',
    description: 'Revisar tarjetas y cédulas de nuevos profesionales en las plataformas públicas oficiales de verificación.',
    dueDate: '',
    startTime: '',
    endTime: '',
    materialsUrl: '',
    priority: 'MEDIA',
    notes: '',
    collaboratorId: '',
    assignmentNote: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busquedaVoluntario, setBusquedaVoluntario] = useState('')
  const [mostrarTodosPorExcepcion, setMostrarTodosPorExcepcion] = useState(false)

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => { const n = { ...e }; delete n[k]; return n })
    if (k === 'dueDate' || k === 'startTime' || k === 'endTime') {
      setMostrarTodosPorExcepcion(false)
    }
  }

  function seleccionarTipoLabor(tipo: typeof TIPOS_LABOR[0]) {
    setTipoLaborSel(tipo.id)
    setForm((f) => ({
      ...f,
      area: tipo.areaDefecto,
      title: tipo.tituloSugerido || f.title,
      description: tipo.descripcionSugerida || f.description,
    }))
  }

  const diaSeleccionado = useMemo(() => {
    if (!form.dueDate) return null
    const [y, m, d] = form.dueDate.split('-').map(Number)
    const fecha = new Date(y, m - 1, d)
    return DIA_SEMANA_MAP[fecha.getDay()] ?? null
  }, [form.dueDate])

  const franjasRequeridas = useMemo(() => {
    return calcularFranjasRequeridas(form.startTime, form.endTime)
  }, [form.startTime, form.endTime])

  // Filtrado de voluntarios:
  // CUALQUIER voluntario activo de cualquier profesión o área puede apoyar en cualquier labor.
  // Se evalúa ÚNICAMENTE que cumpla con el DÍA y el HORARIO programado.
  const voluntariosFiltrados = useMemo(() => {
    return colaboradoresDisponibles.filter((c) => {
      // 1. Debe estar activo
      const matchActivo = !c.status || c.status === 'ACTIVO'
      if (!matchActivo) return false

      // 2. Búsqueda por texto (nombre o disciplina)
      const matchBusqueda =
        !busquedaVoluntario ||
        c.fullName.toLowerCase().includes(busquedaVoluntario.toLowerCase()) ||
        c.discipline.toLowerCase().includes(busquedaVoluntario.toLowerCase())
      if (!matchBusqueda) return false

      // 3. Filtro estricto por día y horario
      if (!mostrarTodosPorExcepcion) {
        if (diaSeleccionado && (!c.availableDays || !c.availableDays.includes(diaSeleccionado))) {
          return false
        }
        if (franjasRequeridas.length > 0) {
          const tieneFranja = franjasRequeridas.some((f) => c.availableSlots?.includes(f))
          if (!tieneFranja) return false
        }
      }

      return true
    })
  }, [colaboradoresDisponibles, diaSeleccionado, franjasRequeridas, busquedaVoluntario, mostrarTodosPorExcepcion])

  function validar() {
    const e: Record<string, string> = {}
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
          area: form.area || 'OTRA',
          title: form.title.trim(),
          description: form.description.trim() || null,
          dueDate: form.dueDate || null,
          startTime: form.startTime || null,
          endTime: form.endTime || null,
          materialsUrl: form.materialsUrl.trim() || null,
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

  const hayRestriccionHorarioODia = Boolean(diaSeleccionado || franjasRequeridas.length > 0)

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Tipo de Labor Frecuente */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
          1. ¿Qué actividad se necesita realizar?
        </label>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
          Selecciona una labor para autocompletar el título y descripción sugeridos, o personalízala libremente:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
          {TIPOS_LABOR.map((t) => {
            const sel = tipoLaborSel === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => seleccionarTipoLabor(t)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 4,
                  padding: '11px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                  border: '2px solid ' + (sel ? '#059669' : '#e2e8f0'),
                  background: sel ? '#ecfdf5' : '#fff',
                  color: sel ? '#065f46' : '#1e293b',
                  transition: 'all 0.12s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: '0.88rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{t.icono}</span>
                  <span>{t.label}</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: sel ? '#047857' : '#64748b', lineHeight: 1.3 }}>
                  {t.descripcion}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Título, Descripción y Link de Materiales */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="title" style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>2. Título de la labor *</label>
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
            placeholder="Detalles sobre qué se debe hacer, instrucciones y contexto general..."
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: 9, fontSize: '0.9rem', resize: 'vertical',
              border: '1.5px solid #e2e8f0', outline: 'none', color: '#1e293b', lineHeight: 1.5,
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="materialsUrl" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link2 size={15} color="#059669" />
            Enlace de materiales / Google Drive / Plantilla
            <span style={{ fontWeight: 400, color: '#64748b' }}>(solo visible tras aceptar)</span>
          </label>
          <input
            id="materialsUrl"
            type="url"
            placeholder="https://drive.google.com/drive/folders/... o similar"
            value={form.materialsUrl}
            onChange={(e) => update('materialsUrl', e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: 9, fontSize: '0.9rem',
              border: '1.5px solid #e2e8f0', outline: 'none', color: '#1e293b',
            }}
          />
        </div>
      </div>

      {/* 3. Fecha, Horarios (Inicio y Fin) y Prioridad */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>3. Fecha, Horario y Prioridad</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
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
              <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>
                📅 {DIA_LEGIBLE[diaSeleccionado]}
              </span>
            )}
          </div>

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

        {franjasRequeridas.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#0369a1', background: '#e0f2fe', padding: '6px 12px', borderRadius: 6 }}>
            <Clock size={13} />
            <span>
              Franja detectada: <strong>{franjasRequeridas.map((f) => FRANJA_LEGIBLE[f] ?? f).join(' y ')}</strong>
            </span>
          </div>
        )}
      </div>

      {/* 4. Asignar voluntario de una vez (Cualquier voluntario disponible según día y horario) */}
      <div style={{ background: '#fff', border: '2px solid #e2e8f0', borderRadius: 12, padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
              4. Asignar voluntario de una vez
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#475569' }}>
              {hayRestriccionHorarioODia && !mostrarTodosPorExcepcion
                ? `Mostrando únicamente voluntarios disponibles para ${diaSeleccionado ? DIA_LEGIBLE[diaSeleccionado] : ''} ${franjasRequeridas.length > 0 ? '(' + franjasRequeridas.map(f => FRANJA_LEGIBLE[f] ?? f).join(', ') + ')' : ''}:`
                : mostrarTodosPorExcepcion
                ? '⚠️ Mostrando todos los voluntarios disponibles (asignación por excepción):'
                : 'Voluntarios registrados disponibles:'}
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

        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Buscar voluntario disponible por nombre o disciplina..."
            value={busquedaVoluntario}
            onChange={(e) => setBusquedaVoluntario(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 8, fontSize: '0.86rem', border: '1.5px solid #e2e8f0', outline: 'none' }}
          />
        </div>

        {voluntariosFiltrados.length === 0 ? (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <AlertCircle size={22} color="#d97706" />
            <p style={{ fontSize: '0.86rem', color: '#92400e', margin: 0, fontWeight: 600 }}>
              No hay voluntarios disponibles para {diaSeleccionado ? DIA_LEGIBLE[diaSeleccionado] : 'este día'}{franjasRequeridas.length > 0 ? ' en la franja seleccionada (' + franjasRequeridas.map(f => FRANJA_LEGIBLE[f] ?? f).join(', ') + ')' : ''}.
            </p>
            <button
              type="button"
              onClick={() => setMostrarTodosPorExcepcion(true)}
              style={{ fontSize: '0.8rem', fontWeight: 700, padding: '6px 14px', borderRadius: 6, background: '#059669', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Mostrar voluntarios de todas formas (por excepción)
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, maxHeight: 280, overflowY: 'auto' }}>
            {voluntariosFiltrados.map((c) => {
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
                    {c.availableDays?.map((d) => (
                      <span key={d} style={{ fontSize: '0.68rem', fontWeight: d === diaSeleccionado ? 800 : 400, padding: '2px 6px', borderRadius: 4, background: d === diaSeleccionado ? '#dcfce7' : '#e2e8f0', color: d === diaSeleccionado ? '#15803d' : '#334155' }}>
                        {DIA_LEGIBLE[d] ?? d}
                      </span>
                    ))}
                    {c.availableSlots?.map((s) => (
                      <span key={s} style={{ fontSize: '0.68rem', fontWeight: franjasRequeridas.includes(s) ? 800 : 400, padding: '2px 6px', borderRadius: 4, background: franjasRequeridas.includes(s) ? '#dbeafe' : '#f1f5f9', color: franjasRequeridas.includes(s) ? '#1e40af' : '#475569' }}>
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

        {form.collaboratorId && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4, background: '#ecfdf5', padding: '12px 14px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
            <label htmlFor="assignmentNote" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#065f46' }}>
              Mensaje o nota para el voluntario en el correo de invitación:
            </label>
            <input
              id="assignmentNote"
              type="text"
              placeholder="Ej: Hola! Te asignamos este turno según tu disponibilidad en la tarde."
              value={form.assignmentNote}
              onChange={(e) => update('assignmentNote', e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 7, fontSize: '0.86rem', border: '1.5px solid #a7f3d0', outline: 'none', background: '#fff' }}
            />
          </div>
        )}
      </div>

      {/* 5. Notas internas */}
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
