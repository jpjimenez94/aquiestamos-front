'use client'

import { useState, useRef } from 'react'
import {
  Send,
  ChevronRight,
  ChevronLeft,
  Paperclip,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConsentField, RadioField, TextField } from './fields'
import { MunicipioSelector } from './MunicipioSelector'
import { FormStatus, type Status } from './FormStatus'
import { ERROR_TELEFONO, PISTA_TELEFONO, telefonoValido } from '@/lib/telefono'
import {
  AVISO_TRATAMIENTO,
  CASILLAS,
  RESPONSABLE,
  VERSION_CONSENTIMIENTO,
} from '@/lib/consentimiento'

const POBLACIONES = [
  'Niños y niñas',
  'Adolescentes',
  'Jóvenes',
  'Adultos',
  'Personas mayores',
  'Familias',
  'Enfoque de género',
  'Población víctima de violencia',
  'Población desplazada/migrante',
  'Otra',
] as const

const DIAS = [
  { value: 'LUNES', label: 'Lun', nombre: 'Lunes' },
  { value: 'MARTES', label: 'Mar', nombre: 'Martes' },
  { value: 'MIERCOLES', label: 'Mié', nombre: 'Miércoles' },
  { value: 'JUEVES', label: 'Jue', nombre: 'Jueves' },
  { value: 'VIERNES', label: 'Vie', nombre: 'Viernes' },
  { value: 'SABADO', label: 'Sáb', nombre: 'Sábado' },
  { value: 'DOMINGO', label: 'Dom', nombre: 'Domingo' },
] as const

const FRANJAS = [
  {
    value: 'MANANA',
    label: 'Mañana',
    horario: '8 a. m. – 12 m.',
    bg: '#fffdf0',
    bgActive: '#fef3c7',
    border: '#fde68a',
    borderActive: '#d97706',
    text: '#92400e',
  },
  {
    value: 'TARDE',
    label: 'Tarde',
    horario: '12 m. – 6 p. m.',
    bg: '#fff7ed',
    bgActive: '#ffedd5',
    border: '#fed7aa',
    borderActive: '#ea580c',
    text: '#9a3412',
  },
  {
    value: 'NOCHE',
    label: 'Noche',
    horario: '6 – 9 p. m.',
    bg: '#f8faff',
    bgActive: '#e0e7ff',
    border: '#c7d2fe',
    borderActive: '#4f46e5',
    text: '#3730a3',
  },
] as const

const ANOS_EXPERIENCIA = [
  { value: 'MENOS_DE_1', label: 'Menos de 1 año' },
  { value: 'ENTRE_1_Y_3', label: '1 a 3 años' },
  { value: 'ENTRE_3_Y_5', label: '3 a 5 años' },
  { value: 'MAS_DE_5', label: 'Más de 5 años' },
] as const

const HORAS_SEMANA = [
  { value: 'ENTRE_1_Y_3', label: '1 a 3 horas / semana', ayuda: '1 o 2 sesiones' },
  { value: 'ENTRE_4_Y_6', label: '4 a 6 horas / semana', ayuda: '3 o 4 sesiones' },
  { value: 'MAS_DE_6', label: 'Más de 6 horas / semana', ayuda: '5 o más sesiones' },
  { value: 'VARIABLE', label: 'Variable', ayuda: 'Depende de la semana' },
] as const

const EXPERIENCIA_CRISIS = [
  { value: 'SI', label: 'Sí, tengo formación y experiencia práctica' },
  { value: 'FORMACION_POCA_PRACTICA', label: 'Tengo formación teórica, con poca práctica' },
  { value: 'SIN_FORMACION_DISPONIBLE_APRENDER', label: 'No tengo formación previa, pero quiero aprender' },
  { value: 'NO', label: 'No cuento con experiencia en crisis' },
] as const

const MODALIDAD = [
  { value: 'VIRTUAL', label: 'Virtual', icon: '🌐', desc: 'Atención 100% online por videollamada' },
  { value: 'PRESENCIAL', label: 'Presencial', icon: '📍', desc: 'En territorio o centros comunitarios' },
  { value: 'AMBAS', label: 'Ambas', icon: '🔄', desc: 'Disponible presencial y virtual' },
] as const

const FIEBRE_AMARILLA = [
  { value: 'SI', label: 'Sí, ya tengo el carné de vacunación' },
  { value: 'CITA_AGENDADA', label: 'Todavía no, pero tengo cita agendada' },
  { value: 'NO', label: 'No estoy vacunado o vacunada' },
] as const

const TARJETA = [
  { value: 'SI', label: 'Sí, la tengo' },
  { value: 'EN_TRAMITE', label: 'En trámite' },
  { value: 'ESTUDIANTE', label: 'Soy estudiante' },
] as const

const PROFESIONES = [
  { value: 'Psicología', label: 'Psicología' },
  { value: 'Psiquiatría', label: 'Psiquiatría' },
  { value: 'Trabajo Social', label: 'Trabajo Social' },
  { value: 'Otra', label: 'Otra profesión' },
] as const

const VACIO = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  profession: '',
  professionOther: '',
  additionalTraining: '',
  additionalTrainingOther: '',
  yearsExperience: '',
  professionalCard: '',
  professionalCardNumber: '',
  professionalCardDocumentUrl: '',
  identityDocumentUrl: '',
  identityDocumentBackUrl: '',
  populations: [] as string[],
  populationOther: '',
  crisisExperience: '',
  modality: '',
  availableToTravel: '',
  availableDays: [] as string[],
  availableSlots: [] as string[],
  weeklyHours: '',
  yellowFeverVaccine: '',
  dataConsent: false,
  sensitiveDataConsent: false,
  communicationsConsent: false,
}

function CampoArchivoVoluntario({
  etiqueta,
  ayuda,
  clave,
  onClave,
  onError,
  opcional = false,
}: {
  etiqueta: string
  ayuda: string
  clave: string | null
  onClave: (clave: string | null) => void
  onError: (m: string | null) => void
  opcional?: boolean
}) {
  const [subiendo, setSubiendo] = useState(false)
  const [nombre, setNombre] = useState<string | null>(null)

  async function alElegir(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    onError(null)
    setSubiendo(true)
    try {
      const fd = new FormData()
      fd.set('archivo', archivo)
      const res = await fetch('/api/volunteers/upload', {
        method: 'POST',
        body: fd,
      })
      const r = await res.json()
      if (!res.ok || !r.success) {
        onClave(null)
        setNombre(null)
        onError(r.message || 'No se pudo subir el archivo.')
        return
      }
      onClave(r.data.clave)
      setNombre(archivo.name)
    } catch {
      onClave(null)
      setNombre(null)
      onError('No se pudo subir. Si el archivo es muy pesado, prueba con una foto más liviana; si no, revisa tu conexión.')
    } finally {
      setSubiendo(false)
      e.target.value = ''
    }
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <label className="field__label" style={{ fontWeight: 600 }}>
        {etiqueta} {opcional ? <span style={{ color: '#64748b', fontWeight: 400 }}>(Opcional)</span> : null}
      </label>
      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 8px' }}>
        {ayuda}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <label
          className="tamizaje__opcion"
          data-elegida={clave != null}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: '8px 14px',
            borderRadius: 8,
            border: clave ? '1px solid #059669' : '1px dashed #cbd5e1',
            background: clave ? '#ecfdf5' : '#ffffff',
            color: clave ? '#065f46' : '#334155',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}
        >
          <input
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            style={{ display: 'none' }}
            onChange={alElegir}
            disabled={subiendo}
          />
          {subiendo ? 'Subiendo archivo…' : clave ? `✓ Listo: ${nombre}` : '📎 Elegir foto o PDF (máx. 10 MB)'}
        </label>
        {clave && (
          <button
            type="button"
            onClick={() => {
              onClave(null)
              setNombre(null)
            }}
            style={{
              border: 'none',
              background: 'none',
              color: '#dc2626',
              fontSize: '0.78rem',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Quitar archivo
          </button>
        )}
      </div>
    </div>
  )
}

export function VolunteerForm() {
  const [paso, setPaso] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [docError, setDocError] = useState<string | null>(null)
  const [acordeonDocsAbierto, setAcordeonDocsAbierto] = useState(false)
  const [uploadDisponible, setUploadDisponible] = useState<'pendiente' | 'disponible' | 'no_disponible'>('pendiente')
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)

  const vaPresencial = form.modality === 'PRESENCIAL' || form.modality === 'AMBAS'
  const marcoOtra = form.populations.includes('Otra')
  const marcoOtraProfesion = form.profession === 'Otra'

  function scrollToTop() {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  async function abrirAcordeonDocs() {
    const abierto = !acordeonDocsAbierto
    setAcordeonDocsAbierto(abierto)
    // Solo verifica disponibilidad la primera vez que se abre
    if (abierto && uploadDisponible === 'pendiente') {
      try {
        // Intentamos hacer una petición vacía: si el endpoint existe responde
        // 400 (sin archivo), no 404. Si no existe responde 404. Con eso basta.
        const r = await fetch('/api/volunteers/upload', { method: 'POST' })
        setUploadDisponible(r.status !== 404 ? 'disponible' : 'no_disponible')
      } catch {
        // Error de red: asumimos que no está disponible por ahora
        setUploadDisponible('no_disponible')
      }
    }
  }

  function clearError(key: string) {
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function update<K extends keyof typeof VACIO>(key: K, value: (typeof VACIO)[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    clearError(key as string)
  }

  function alternarPoblacion(poblacion: string) {
    setForm((current) => ({
      ...current,
      populations: current.populations.includes(poblacion)
        ? current.populations.filter((p) => p !== poblacion)
        : [...current.populations, poblacion],
    }))
    clearError('populations')
  }

  function alternarDia(dia: string) {
    setForm((current) => ({
      ...current,
      availableDays: current.availableDays.includes(dia)
        ? current.availableDays.filter((d) => d !== dia)
        : [...current.availableDays, dia],
    }))
    clearError('availableDays')
  }

  function seleccionarTodosLosDias() {
    const todos = DIAS.map((d) => d.value)
    setForm((current) => ({
      ...current,
      availableDays: current.availableDays.length === todos.length ? [] : todos,
    }))
    clearError('availableDays')
  }

  function alternarFranja(franja: string) {
    setForm((current) => ({
      ...current,
      availableSlots: current.availableSlots.includes(franja)
        ? current.availableSlots.filter((f) => f !== franja)
        : [...current.availableSlots, franja],
    }))
    clearError('availableSlots')
  }

  function validarPaso1(): boolean {
    const found: Record<string, string> = {}
    if (!form.fullName.trim() || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.fullName)) {
      found.fullName = 'Cuéntanos tu nombre completo (solo letras)'
    }
    if (!telefonoValido(form.phone)) found.phone = ERROR_TELEFONO
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) found.email = 'Escribe un correo válido'
    if (!form.city.trim()) found.city = 'Dinos en qué ciudad o municipio vives'

    setErrors(found)
    return Object.keys(found).length === 0
  }

  function validarPaso2(): boolean {
    const found: Record<string, string> = {}
    if (!form.profession) found.profession = 'Selecciona una profesión'
    if (marcoOtraProfesion && !form.professionOther.trim()) found.professionOther = 'Cuéntanos cuál es tu profesión'
    if (!form.yearsExperience) found.yearsExperience = 'Selecciona tus años de experiencia'
    if (!form.professionalCard) found.professionalCard = 'Selecciona el estado de tu tarjeta'
    if (form.populations.length === 0) found.populations = 'Selecciona al menos una población'
    if (marcoOtra && !form.populationOther.trim()) found.populationOther = 'Cuéntanos con qué otra población trabajas'
    if (!form.crisisExperience) found.crisisExperience = 'Selecciona una opción sobre atención en crisis'

    setErrors(found)
    return Object.keys(found).length === 0
  }

  function validarPaso3(): boolean {
    const found: Record<string, string> = {}
    if (!form.modality) found.modality = 'Selecciona una modalidad'
    if (form.availableDays.length === 0) found.availableDays = 'Selecciona al menos un día'
    if (form.availableSlots.length === 0) found.availableSlots = 'Selecciona al menos una franja'
    if (!form.weeklyHours) found.weeklyHours = 'Selecciona cuántas horas puedes dedicar'
    if (vaPresencial && !form.yellowFeverVaccine) found.yellowFeverVaccine = 'Selecciona el estado de vacunación'
    if (!form.dataConsent) found.dataConsent = 'Necesitamos tu autorización para poder contactarte'
    if (vaPresencial && !form.sensitiveDataConsent) {
      found.sensitiveDataConsent = 'Necesitamos tu autorización expresa para guardar el dato de vacunación'
    }

    setErrors(found)
    return Object.keys(found).length === 0
  }

  function irAlPaso(siguiente: 1 | 2 | 3) {
    if (siguiente === 2 && !validarPaso1()) return
    if (siguiente === 3 && (!validarPaso1() || !validarPaso2())) return

    setPaso(siguiente)
    scrollToTop()
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus(null)

    if (!validarPaso1()) { setPaso(1); scrollToTop(); return }
    if (!validarPaso2()) { setPaso(2); scrollToTop(); return }
    if (!validarPaso3()) { setPaso(3); scrollToTop(); return }

    setSubmitting(true)
    try {
      const payloadForm = {
        ...form,
        profession: marcoOtraProfesion ? form.professionOther : form.profession,
        additionalTraining: form.additionalTraining || undefined,
        professionalCardNumber: form.professionalCardNumber.trim() || undefined,
        professionalCardDocumentUrl: form.professionalCardDocumentUrl.trim() || undefined,
        identityDocumentUrl: form.identityDocumentUrl.trim() || undefined,
        identityDocumentBackUrl: form.identityDocumentBackUrl.trim() || undefined,
        consentVersion: VERSION_CONSENTIMIENTO,
      }

      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadForm),
      })
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        if (payload.details) setErrors(payload.details)
        setStatus({
          type: 'error',
          message: payload.message ?? 'No pudimos guardar tu registro. Intenta de nuevo.',
        })
        return
      }

      setForm(VACIO)
      setPaso(1)
      setStatus({ type: 'success', message: payload.message })
    } catch {
      setStatus({
        type: 'error',
        message: 'No pudimos conectarnos con el servidor. Revisa tu conexión e intenta de nuevo.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form ref={formRef} className="form" onSubmit={handleSubmit} noValidate>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          marginBottom: 28,
          background: '#f8fafc',
          padding: '8px',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
        }}
      >
        <button
          type="button"
          onClick={() => irAlPaso(1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 12px',
            borderRadius: 8,
            border: 'none',
            background: paso === 1 ? '#ffffff' : 'transparent',
            boxShadow: paso === 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            color: paso === 1 ? '#059669' : '#64748b',
            fontWeight: paso === 1 ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: paso === 1 ? '#059669' : paso > 1 ? '#ecfdf5' : '#e2e8f0',
              color: paso === 1 ? '#ffffff' : paso > 1 ? '#059669' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {paso > 1 ? '✓' : '1'}
          </div>
          <span className="hide-mobile">Tus Datos</span>
        </button>

        <button
          type="button"
          onClick={() => irAlPaso(2)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 12px',
            borderRadius: 8,
            border: 'none',
            background: paso === 2 ? '#ffffff' : 'transparent',
            boxShadow: paso === 2 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            color: paso === 2 ? '#059669' : '#64748b',
            fontWeight: paso === 2 ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: paso === 2 ? '#059669' : paso > 2 ? '#ecfdf5' : '#e2e8f0',
              color: paso === 2 ? '#ffffff' : paso > 2 ? '#059669' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {paso > 2 ? '✓' : '2'}
          </div>
          <span className="hide-mobile">Perfil</span>
        </button>

        <button
          type="button"
          onClick={() => irAlPaso(3)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 12px',
            borderRadius: 8,
            border: 'none',
            background: paso === 3 ? '#ffffff' : 'transparent',
            boxShadow: paso === 3 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            color: paso === 3 ? '#059669' : '#64748b',
            fontWeight: paso === 3 ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: paso === 3 ? '#059669' : '#e2e8f0',
              color: paso === 3 ? '#ffffff' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            3
          </div>
          <span className="hide-mobile">Disponibilidad</span>
        </button>
      </div>

      {paso === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ marginBottom: 4 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
              Paso 1: ¿Quién eres y cómo te contactamos?
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
              Información básica para comunicarnos contigo y coordinar tu participación.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <TextField
              label="Nombre completo"
              name="fullName"
              required
              autoComplete="name"
              placeholder="Ej: Laura Sofía Morales"
              value={form.fullName}
              error={errors.fullName}
              onChange={(v) => update('fullName', v)}
            />

            <TextField
              label="Celular / WhatsApp"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              hint={PISTA_TELEFONO}
              placeholder="Ej: 315 789 4561"
              value={form.phone}
              error={errors.phone}
              onChange={(v) => update('phone', v)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <TextField
              label="Correo electrónico"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              error={errors.email}
              onChange={(v) => update('email', v)}
            />

            <MunicipioSelector
              label="¿En qué ciudad o municipio vives?"
              name="city"
              required
              placeholder="Busca tu municipio en Colombia o escribe tu ciudad..."
              value={form.city}
              error={errors.city}
              onChange={(v) => update('city', v)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <Button
              type="button"
              variant="primary"
              onClick={() => irAlPaso(2)}
              icon={<ChevronRight size={16} />}
            >
              Continuar al perfil profesional
            </Button>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
              Paso 2: Tu perfil profesional y experiencia
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
              Nos permite asignarte personas y comunidades afines a tu formación y enfoque.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div>
              <label className="field__label">
                Profesión <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {PROFESIONES.map((p) => {
                  const activa = form.profession === p.value
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => update('profession', p.value)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: activa ? '1.5px solid #059669' : '1px solid #cbd5e1',
                        background: activa ? '#ecfdf5' : '#ffffff',
                        color: activa ? '#065f46' : '#334155',
                        fontWeight: activa ? 600 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {activa ? '✓ ' : ''}{p.label}
                    </button>
                  )
                })}
              </div>
              {errors.profession && <p className="field__error">{errors.profession}</p>}
            </div>

            <div>
              <label className="field__label">
                Años de experiencia <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {ANOS_EXPERIENCIA.map((exp) => {
                  const activa = form.yearsExperience === exp.value
                  return (
                    <button
                      key={exp.value}
                      type="button"
                      onClick={() => update('yearsExperience', exp.value)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: activa ? '1.5px solid #059669' : '1px solid #cbd5e1',
                        background: activa ? '#ecfdf5' : '#ffffff',
                        color: activa ? '#065f46' : '#334155',
                        fontWeight: activa ? 600 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {activa ? '✓ ' : ''}{exp.label}
                    </button>
                  )
                })}
              </div>
              {errors.yearsExperience && <p className="field__error">{errors.yearsExperience}</p>}
            </div>
          </div>

          {marcoOtraProfesion && (
            <TextField
              label="¿Qué otra profesión?"
              name="professionOther"
              required
              placeholder="Ej: Licenciatura en Pedagogía / Psicopedagogía"
              value={form.professionOther}
              error={errors.professionOther}
              onChange={(v) => update('professionOther', v)}
            />
          )}

          <div>
            <label className="field__label">
              ¿Cuentas con tarjeta profesional? <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
              {TARJETA.map((t) => {
                const activa = form.professionalCard === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => update('professionalCard', t.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: activa ? '1.5px solid #059669' : '1px solid #cbd5e1',
                      background: activa ? '#ecfdf5' : '#ffffff',
                      color: activa ? '#065f46' : '#334155',
                      fontWeight: activa ? 600 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {activa ? '✓ ' : ''}{t.label}
                  </button>
                )
              })}
            </div>
            {errors.professionalCard && <p className="field__error">{errors.professionalCard}</p>}
          </div>

          <div>
            <label className="field__label">
              ¿Con qué poblaciones tienes experiencia? <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 8px' }}>
              Toca para seleccionar todas las poblaciones que apliquen.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {POBLACIONES.map((pob) => {
                const seleccionada = form.populations.includes(pob)
                return (
                  <button
                    key={pob}
                    type="button"
                    onClick={() => alternarPoblacion(pob)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 20,
                      fontSize: '0.82rem',
                      fontWeight: seleccionada ? 600 : 500,
                      border: seleccionada ? '1.5px solid #059669' : '1px solid #cbd5e1',
                      background: seleccionada ? '#ecfdf5' : '#ffffff',
                      color: seleccionada ? '#065f46' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {seleccionada ? '✓ ' : '+ '}
                    {pob}
                  </button>
                )
              })}
            </div>
            {errors.populations && <p className="field__error" style={{ marginTop: 6 }}>{errors.populations}</p>}
          </div>

          {marcoOtra && (
            <TextField
              label="¿Con qué otra población trabajas?"
              name="populationOther"
              required
              value={form.populationOther}
              error={errors.populationOther}
              onChange={(v) => update('populationOther', v)}
            />
          )}

          <div>
            <RadioField
              label="¿Tienes experiencia o formación en atención en crisis / primeros auxilios psicológicos?"
              required
              options={EXPERIENCIA_CRISIS}
              value={form.crisisExperience}
              error={errors.crisisExperience}
              onChange={(v) => update('crisisExperience', v)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
            <Button
              type="button"
              variant="default"
              onClick={() => irAlPaso(1)}
              icon={<ChevronLeft size={16} />}
            >
              Volver
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => irAlPaso(3)}
              icon={<ChevronRight size={16} />}
            >
              Continuar a disponibilidad
            </Button>
          </div>
        </div>
      )}

      {paso === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
              Paso 3: Disponibilidad y Documentos
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
              Define cómo te gustaría participar y adjunta tus documentos de forma opcional.
            </p>
          </div>

          <div>
            <label className="field__label">
              ¿En qué modalidad puedes acompañar? <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              {MODALIDAD.map((m) => {
                const activa = form.modality === m.value
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => update('modality', m.value)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: activa ? '2px solid #059669' : '1px solid #cbd5e1',
                      background: activa ? '#ecfdf5' : '#ffffff',
                      color: activa ? '#065f46' : '#334155',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700 }}>{m.icon} {m.label}</span>
                      {activa && <span style={{ color: '#059669', fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.desc}</span>
                  </button>
                )
              })}
            </div>
            {errors.modality && <p className="field__error">{errors.modality}</p>}
          </div>

          {vaPresencial && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <TextField
                label="¿A qué municipios o zonas podrías desplazarte?"
                name="availableToTravel"
                hint="Opcional."
                placeholder="Ej: Municipios aledaños / Zonas rurales cercanas"
                value={form.availableToTravel}
                error={errors.availableToTravel}
                onChange={(v) => update('availableToTravel', v)}
              />

              <RadioField
                label="¿Estás vacunado o vacunada contra la fiebre amarilla?"
                required
                hint="Exigido para acceso a ciertas zonas de emergencia."
                options={FIEBRE_AMARILLA}
                value={form.yellowFeverVaccine}
                error={errors.yellowFeverVaccine}
                onChange={(v) => update('yellowFeverVaccine', v)}
              />
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="field__label" style={{ margin: 0 }}>
                ¿Qué días tienes disponibilidad? <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <button
                type="button"
                onClick={seleccionarTodosLosDias}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#059669',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {form.availableDays.length === DIAS.length ? 'Desmarcar todos' : 'Todos los días'}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {DIAS.map((d) => {
                const activo = form.availableDays.includes(d.value)
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => alternarDia(d.value)}
                    style={{
                      padding: '10px 4px',
                      borderRadius: 8,
                      border: activo ? '1.5px solid #059669' : '1px solid #cbd5e1',
                      background: activo ? '#ecfdf5' : '#ffffff',
                      color: activo ? '#065f46' : '#334155',
                      fontWeight: activo ? 700 : 500,
                      fontSize: '0.82rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                    title={d.nombre}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
            {errors.availableDays && <p className="field__error" style={{ marginTop: 6 }}>{errors.availableDays}</p>}
          </div>

          <div>
            <label className="field__label">
              ¿En qué franjas del día? <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
              {FRANJAS.map((f) => {
                const activa = form.availableSlots.includes(f.value)
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => alternarFranja(f.value)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: activa ? `2px solid ${f.borderActive}` : `1px solid ${f.border}`,
                      background: activa ? f.bgActive : f.bg,
                      color: activa ? f.text : '#334155',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: activa ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: activa ? 700 : 600,
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: activa ? f.text : '#1e293b',
                      }}
                    >
                      <span>{f.label}</span>
                      {activa && <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>✓</span>}
                    </div>
                    <div
                      style={{
                        fontSize: '0.74rem',
                        color: activa ? f.text : '#64748b',
                        opacity: activa ? 0.95 : 0.85,
                        marginTop: 3,
                      }}
                    >
                      {f.horario}
                    </div>
                  </button>
                )
              })}
            </div>
            {errors.availableSlots && <p className="field__error" style={{ marginTop: 6 }}>{errors.availableSlots}</p>}
          </div>

          <div>
            <label className="field__label">
              ¿Cuántas horas a la semana podrías dedicar? <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
              {HORAS_SEMANA.map((hs) => {
                const activa = form.weeklyHours === hs.value
                return (
                  <button
                    key={hs.value}
                    type="button"
                    onClick={() => update('weeklyHours', hs.value)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: activa ? '1.5px solid #059669' : '1px solid #cbd5e1',
                      background: activa ? '#ecfdf5' : '#ffffff',
                      color: activa ? '#065f46' : '#334155',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{hs.label}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{hs.ayuda}</div>
                  </button>
                )
              })}
            </div>
            {errors.weeklyHours && <p className="field__error">{errors.weeklyHours}</p>}
          </div>

          <div
            style={{
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              background: '#ffffff',
            }}
          >
            <button
              type="button"
              onClick={abrirAcordeonDocs}
              style={{
                width: '100%',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: 'none',
                background: acordeonDocsAbierto ? '#f8fafc' : '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Paperclip size={18} color="#059669" />
                <div>
                  <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block' }}>
                    Adjuntar documentos de verificación (Opcional)
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {form.professionalCardDocumentUrl || form.identityDocumentUrl
                      ? '✓ Documentos seleccionados'
                      : 'Puedes adjuntarlos ahora o enviarlos después por WhatsApp'}
                  </span>
                </div>
              </div>
              {acordeonDocsAbierto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {acordeonDocsAbierto && (
              <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    marginBottom: 14,
                    fontSize: '0.78rem',
                    color: '#475569',
                    lineHeight: 1.4,
                  }}
                >
                  🔒 <strong>Confidencialidad:</strong> Uso exclusivo del equipo de coordinación para validar tu identidad y tarjeta profesional conforme a la Ley 1581 de 2012.
                </div>

                {/* Si el endpoint de subida no está disponible, mostramos el fallback de WhatsApp */}
                {uploadDisponible === 'no_disponible' ? (
                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: 10,
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      fontSize: '0.82rem',
                      color: '#166534',
                      lineHeight: 1.5,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>📲</span>
                    <div>
                      <strong style={{ display: 'block', marginBottom: 4 }}>
                        Envía tus documentos por WhatsApp
                      </strong>
                      Cuando completes tu registro, nuestro equipo te contactará para solicitarlos.
                      También puedes enviarlos directamente al{' '}
                      <a
                        href="https://wa.me/573102186299"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#059669', fontWeight: 600, textDecoration: 'underline' }}
                      >
                        +57 310 218 6299
                      </a>
                      {' '}indicando tu nombre y número de tarjeta profesional.
                    </div>
                  </div>
                ) : uploadDisponible === 'pendiente' ? (
                  <p style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center', padding: '10px 0' }}>
                    Verificando disponibilidad…
                  </p>
                ) : (
                  <>
                    {docError && (
                      <p style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: 10 }}>{docError}</p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                      <CampoArchivoVoluntario
                        etiqueta="Tarjeta Profesional o Certificado"
                        ayuda="Foto o PDF de tarjeta, acta de grado o certificado."
                        clave={form.professionalCardDocumentUrl || null}
                        onClave={(c) => update('professionalCardDocumentUrl', c || '')}
                        onError={setDocError}
                        opcional
                      />

                      <TextField
                        label="Número de Tarjeta Profesional"
                        name="professionalCardNumber"
                        hint="Opcional."
                        placeholder="Ej: 123456"
                        value={form.professionalCardNumber}
                        onChange={(v) => update('professionalCardNumber', v)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 10 }}>
                      <CampoArchivoVoluntario
                        etiqueta="Cédula de Ciudadanía (Frente)"
                        ayuda="Foto o PDF de tu documento de identidad."
                        clave={form.identityDocumentUrl || null}
                        onClave={(c) => update('identityDocumentUrl', c || '')}
                        onError={setDocError}
                        opcional
                      />

                      <CampoArchivoVoluntario
                        etiqueta="Cédula de Ciudadanía (Respaldo)"
                        ayuda="Opcional si subiste ambas caras en el anterior."
                        clave={form.identityDocumentBackUrl || null}
                        onClave={(c) => update('identityDocumentBackUrl', c || '')}
                        onError={setDocError}
                        opcional
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 10,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <ShieldCheck size={16} color="#059669" />
              <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Autorizaciones y Tratamiento de Datos</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, margin: '0 0 12px' }}>
              {AVISO_TRATAMIENTO.profesionales} Conservamos tus datos durante {RESPONSABLE.retencionMeses / 12} años.{' '}
              <a href="/politica-de-datos" target="_blank" style={{ color: '#059669', textDecoration: 'underline' }}>
                Ver Política de Tratamiento de Datos
              </a>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ConsentField
                label={CASILLAS.datos}
                checked={form.dataConsent}
                error={errors.dataConsent}
                onChange={(c) => update('dataConsent', c)}
              />
              {vaPresencial ? (
                <ConsentField
                  label={CASILLAS.sensiblesProfesional}
                  checked={form.sensitiveDataConsent}
                  error={errors.sensitiveDataConsent}
                  onChange={(c) => update('sensitiveDataConsent', c)}
                />
              ) : null}
              <ConsentField
                label={CASILLAS.comunicaciones}
                checked={form.communicationsConsent}
                onChange={(c) => update('communicationsConsent', c)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FormStatus status={status} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <Button
                type="button"
                variant="default"
                onClick={() => irAlPaso(2)}
                icon={<ChevronLeft size={16} />}
              >
                Volver al perfil
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                icon={<Send size={16} />}
                style={{ backgroundColor: '#059669', color: '#ffffff' }}
              >
                {submitting ? 'Enviando registro…' : 'Enviar mi registro'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
