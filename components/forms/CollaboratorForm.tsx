'use client'

import { useState } from 'react'
import {
  Send,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConsentField, RadioField, TextArea, TextField } from './fields'
import { MunicipioSelector } from './MunicipioSelector'
import { FormStatus, type Status } from './FormStatus'
import { ERROR_TELEFONO, PISTA_TELEFONO, telefonoValido } from '@/lib/telefono'
import { nombreDePila } from '@/lib/nombre'
import {
  AVISO_DERECHOS,
  AVISO_TRATAMIENTO,
  CASILLAS,
  RESPONSABLE,
  VERSION_CONSENTIMIENTO,
} from '@/lib/consentimiento'

const AREAS = [
  { value: 'SALUD', label: 'Salud y primeros auxilios', icono: '🩺' },
  { value: 'SOCIAL_LEGAL_EDUCATIVO', label: 'Social, legal y educativo', icono: '⚖️' },
  { value: 'OPERACION_LOGISTICA', label: 'Operación y logística', icono: '📦' },
  { value: 'COMUNICACION_TECNOLOGIA', label: 'Comunicación y tecnología', icono: '💻' },
  { value: 'GESTION_PROYECTOS', label: 'Gestión y proyectos', icono: '📊' },
  { value: 'OTRA', label: 'Otra área u oficio', icono: '✨' },
] as const

const DISCIPLINAS: Record<string, readonly string[]> = {
  SALUD: [
    'Medicina',
    'Enfermería',
    'Fisioterapia',
    'Terapia ocupacional',
    'Fonoaudiología',
    'Nutrición y dietética',
    'Odontología',
    'Primeros auxilios',
    'Otra',
  ],
  SOCIAL_LEGAL_EDUCATIVO: [
    'Trabajo social',
    'Derecho',
    'Docencia',
    'Pedagogía',
    'Primera infancia',
    'Gestión comunitaria',
    'Otra',
  ],
  OPERACION_LOGISTICA: [
    'Logística',
    'Transporte y conducción',
    'Bodega e inventario',
    'Cocina y alimentación',
    'Construcción y obra',
    'Gestión del riesgo de desastres',
    'Otra',
  ],
  COMUNICACION_TECNOLOGIA: [
    'Comunicación social',
    'Diseño',
    'Sistemas y tecnología',
    'Análisis de datos',
    'Traducción e interpretación',
    'Otra',
  ],
  GESTION_PROYECTOS: [
    'Gerencia de proyectos',
    'Administración',
    'Finanzas y contabilidad',
    'Talento humano',
    'Otra',
  ],
  OTRA: ['Otra'],
}

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
  { value: 'MANANA', label: 'Mañana (8 a. m. – 12 m.)' },
  { value: 'TARDE', label: 'Tarde (12 m. – 6 p. m.)' },
  { value: 'NOCHE', label: 'Noche (6 – 9 p. m.)' },
] as const

const ANOS_EXPERIENCIA = [
  { value: 'MENOS_DE_1', label: 'Menos de 1 año' },
  { value: 'ENTRE_1_Y_3', label: 'Entre 1 y 3 años' },
  { value: 'ENTRE_3_Y_5', label: 'Entre 3 y 5 años' },
  { value: 'MAS_DE_5', label: 'Más de 5 años' },
] as const

const HORAS_SEMANA = [
  { value: 'ENTRE_1_Y_3', label: 'Entre 1 y 3 horas' },
  { value: 'ENTRE_4_Y_6', label: 'Entre 4 y 6 horas' },
  { value: 'MAS_DE_6', label: 'Más de 6 horas' },
  { value: 'VARIABLE', label: 'Depende de la semana' },
] as const

const MODALIDAD = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'VIRTUAL', label: 'Virtual, desde donde estoy' },
  { value: 'AMBAS', label: 'Las dos' },
] as const

const TARJETA = [
  { value: 'SI', label: 'Sí, la tengo' },
  { value: 'EN_TRAMITE', label: 'Está en trámite' },
  { value: 'ESTUDIANTE', label: 'Todavía soy estudiante' },
] as const

const FIEBRE_AMARILLA = [
  { value: 'SI', label: 'Sí' },
  { value: 'NO', label: 'No' },
  { value: 'CITA_AGENDADA', label: 'Tengo la cita agendada' },
] as const

const VACIO = {
  // Paso 1: Datos de Contacto
  fullName: '',
  phone: '',
  email: '',
  city: '',

  // Paso 2: Área y Oficio
  area: '',
  discipline: '',
  disciplineOther: '',
  yearsExperience: '',
  professionalCard: '',
  skills: '',

  // Paso 3: Disponibilidad y Autorizaciones
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

export function CollaboratorForm() {
  const [paso, setPaso] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completado, setCompletado] = useState(false)

  const vaPresencial = form.modality === 'PRESENCIAL' || form.modality === 'AMBAS'
  const marcoOtraDisciplina = form.discipline === 'Otra'
  const disciplinas = form.area && form.area !== 'OTRA' ? DISCIPLINAS[form.area] : undefined

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

  function cambiarArea(value: string) {
    setForm((current) => ({
      ...current,
      area: value,
      discipline: value === 'OTRA' ? 'Otra' : '',
      disciplineOther: '',
    }))
    clearError('area')
    clearError('discipline')
  }

  function toggleOption(
    key: 'availableDays' | 'availableSlots',
    option: string,
  ) {
    setForm((current) => {
      const exists = current[key].includes(option)
      const updatedList = exists
        ? current[key].filter((v) => v !== option)
        : [...current[key], option]
      return { ...current, [key]: updatedList }
    })
    clearError(key)
  }

  function validarPaso1(): boolean {
    const found: Record<string, string> = {}
    if (!form.fullName.trim() || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.fullName)) {
      found.fullName = 'Cuéntanos tu nombre completo (solo letras)'
    }
    if (!telefonoValido(form.phone)) found.phone = ERROR_TELEFONO
    if (!/^[^s@]+@[^s@]+.[^s@]+$/.test(form.email.trim())) found.email = 'Escribe un correo electrónico válido'
    if (!form.city.trim()) found.city = 'Selecciona o escribe en qué ciudad o municipio vives'

    setErrors(found)
    return Object.keys(found).length === 0
  }

  function validarPaso2(): boolean {
    const found: Record<string, string> = {}
    if (!form.area) found.area = 'Selecciona el área en la que deseas apoyar'
    if (!form.discipline) found.discipline = 'Selecciona tu disciplina u oficio'
    if (marcoOtraDisciplina && !form.disciplineOther.trim()) {
      found.disciplineOther = 'Cuéntanos cuál es tu oficio o profesión'
    }

    setErrors(found)
    return Object.keys(found).length === 0
  }

  function validarPaso3(): boolean {
    const found: Record<string, string> = {}
    if (!form.modality) found.modality = 'Selecciona cómo puedes apoyar'
    if (form.availableDays.length === 0) found.availableDays = 'Selecciona al menos un día'
    if (form.availableSlots.length === 0) found.availableSlots = 'Selecciona al menos una franja'
    if (!form.weeklyHours) found.weeklyHours = 'Selecciona cuántas horas puedes dedicar'
    if (vaPresencial && !form.yellowFeverVaccine) found.yellowFeverVaccine = 'Selecciona una opción de vacunación'
    if (!form.dataConsent) found.dataConsent = 'Necesitamos tu autorización para poder contactarte'
    if (vaPresencial && !form.sensitiveDataConsent) {
      found.sensitiveDataConsent = 'Necesitamos tu autorización para guardar el dato de vacunación'
    }

    setErrors(found)
    return Object.keys(found).length === 0
  }

  function irAlPaso2() {
    if (validarPaso1()) {
      setPaso(2)
      window.scrollTo({ top: 180, behavior: 'smooth' })
    }
  }

  function irAlPaso3() {
    if (validarPaso2()) {
      setPaso(3)
      window.scrollTo({ top: 180, behavior: 'smooth' })
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus(null)

    if (!validarPaso3()) {
      setStatus({ type: 'error', message: 'Revisa los campos marcados antes de enviar.' })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/collaborators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, consentVersion: VERSION_CONSENTIMIENTO }),
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

      setCompletado(true)
      window.scrollTo({ top: 150, behavior: 'smooth' })
    } catch {
      setStatus({
        type: 'error',
        message: 'No pudimos conectarnos con el servidor. Revisa tu conexión e intenta de nuevo.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (completado) {
    const nombrePersona = nombreDePila(form.fullName) || form.fullName.trim() || 'Voluntario/a'

    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          padding: '36px 28px',
          textAlign: 'center',
          maxWidth: 640,
          margin: '0 auto',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: '2px solid #a7f3d0',
          }}
        >
          <CheckCircle2 size={36} />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
          ¡Gracias por sumarte a la red, {nombrePersona}!
        </h2>

        <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.6, marginBottom: 24 }}>
          Tus datos ya están guardados en el directorio del voluntariado de la red.
          Cuando aparezca una brigada o necesidad que encaje con tu disciplina y disponibilidad,
          nuestro equipo de coordinación te escribirá a tu WhatsApp <strong>{form.phone}</strong>.
        </p>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
          <Button
            type="button"
            variant="default"
            onClick={() => {
              setForm(VACIO)
              setPaso(1)
              setCompletado(false)
            }}
          >
            Registrar otro voluntario o volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Indicador de Pasos / Wizard */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28,
          background: '#f8fafc',
          padding: '12px 18px',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
            }}
          >
            {paso}
          </span>
          <div>
            <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
              Paso {paso} de 3
            </span>
            <strong style={{ display: 'block', fontSize: '0.92rem', color: '#1e293b' }}>
              {paso === 1 && 'Tus Datos de Contacto'}
              {paso === 2 && '¿En qué área y oficio puedes apoyar?'}
              {paso === 3 && 'Disponibilidad y Autorizaciones'}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              style={{
                width: 28,
                height: 6,
                borderRadius: 3,
                background: paso >= num ? '#059669' : '#cbd5e1',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      <form className="form" onSubmit={handleSubmit} noValidate>
        {/* ========================================================================= */}
        {/* PASO 1: DATOS DE CONTACTO Y TERRITORIO                                     */}
        {/* ========================================================================= */}
        {paso === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <TextField
              label="Nombre completo"
              name="fullName"
              required
              autoComplete="name"
              placeholder="Tu nombre y apellido"
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
              placeholder="Ej: 300 123 4567"
              value={form.phone}
              error={errors.phone}
              onChange={(v) => update('phone', v)}
            />

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
              label="¿Desde qué ciudad o municipio te sumas?"
              name="city"
              required
              placeholder="Busca o escribe tu ciudad o municipio..."
              hint="Selecciona de la lista de Colombia o escríbelo si no aparece."
              value={form.city}
              error={errors.city}
              onChange={(v) => update('city', v)}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <Button type="button" variant="primary" onClick={irAlPaso2} icon={<ArrowRight size={16} />}>
                Siguiente: ¿En qué puedes ayudar?
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 2: ÁREA Y OFICIO                                                     */}
        {/* ========================================================================= */}
        {paso === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Selección de Área */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
                ¿En qué área está lo tuyo? *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                {AREAS.map((area) => {
                  const seleccionado = form.area === area.value
                  return (
                    <button
                      key={area.value}
                      type="button"
                      onClick={() => cambiarArea(area.value)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '2px solid ' + (seleccionado ? '#059669' : '#e2e8f0'),
                        background: seleccionado ? '#ecfdf5' : '#ffffff',
                        color: seleccionado ? '#065f46' : '#1e293b',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{area.icono}</span>
                      <span>{area.label}</span>
                    </button>
                  )
                })}
              </div>
              {errors.area && <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>{errors.area}</span>}
            </div>

            {/* Selección de Disciplina u Oficio */}
            {disciplinas && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
                  ¿Cuál es tu disciplina u oficio? *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8 }}>
                  {disciplinas.map((d) => {
                    const seleccionado = form.discipline === d
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => update('discipline', d)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '2px solid ' + (seleccionado ? '#0284c7' : '#e2e8f0'),
                          background: seleccionado ? '#f0f9ff' : '#ffffff',
                          color: seleccionado ? '#0369a1' : '#334155',
                          fontWeight: seleccionado ? 700 : 500,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
                {errors.discipline && (
                  <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>{errors.discipline}</span>
                )}
              </div>
            )}

            {marcoOtraDisciplina && (
              <TextField
                label={form.area === 'OTRA' ? '¿Cuál es tu oficio o profesión?' : '¿Cuál otra disciplina?'}
                name="disciplineOther"
                required
                placeholder="Escribe tu profesión u oficio..."
                value={form.disciplineOther}
                error={errors.disciplineOther}
                onChange={(v) => update('disciplineOther', v)}
              />
            )}

            <RadioField
              label="¿Cuántos años llevas de experiencia en eso?"
              options={ANOS_EXPERIENCIA}
              value={form.yearsExperience}
              error={errors.yearsExperience}
              onChange={(v) => update('yearsExperience', v)}
            />

            <RadioField
              label="¿Tienes tarjeta o registro profesional?"
              hint="Solo si tu profesión la exige. Si no aplica a tu oficio, puedes dejarla vacía."
              options={TARJETA}
              value={form.professionalCard}
              error={errors.professionalCard}
              onChange={(v) => update('professionalCard', v)}
            />

            <TextArea
              label="¿Qué sabes hacer o qué habilidades nos pueden servir?"
              name="skills"
              hint="Opcional: herramientas que manejas, idiomas, si conduces vehículo, si has apoyado en terreno o emergencias."
              value={form.skills}
              error={errors.skills}
              onChange={(v) => update('skills', v)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <Button type="button" variant="default" onClick={() => setPaso(1)} icon={<ArrowLeft size={16} />}>
                Atrás
              </Button>
              <Button type="button" variant="primary" onClick={irAlPaso3} icon={<ArrowRight size={16} />}>
                Siguiente: Disponibilidad
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 3: DISPONIBILIDAD Y AUTORIZACIONES                                   */}
        {/* ========================================================================= */}
        {paso === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <RadioField
              label="¿Cómo puedes apoyar?"
              required
              options={MODALIDAD}
              value={form.modality}
              error={errors.modality}
              onChange={(v) => update('modality', v)}
            />

            {vaPresencial && (
              <TextField
                label="¿A qué municipios o zonas podrías desplazarte en caso necesario?"
                name="availableToTravel"
                hint="Opcional. Por ejemplo: Todo el departamento, veredas cercanas, etc."
                value={form.availableToTravel}
                error={errors.availableToTravel}
                onChange={(v) => update('availableToTravel', v)}
              />
            )}

            {/* Selector de Días con Chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
                ¿Qué días de la semana tienes disponibilidad? *
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DIAS.map((dia) => {
                  const marcado = form.availableDays.includes(dia.value)
                  return (
                    <button
                      key={dia.value}
                      type="button"
                      onClick={() => toggleOption('availableDays', dia.value)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '2px solid ' + (marcado ? '#059669' : '#e2e8f0'),
                        background: marcado ? '#ecfdf5' : '#ffffff',
                        color: marcado ? '#065f46' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      {dia.nombre}
                    </button>
                  )
                })}
              </div>
              {errors.availableDays && (
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>{errors.availableDays}</span>
              )}
            </div>

            {/* Selector de Franjas con Chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
                ¿En qué franjas del día? *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                {FRANJAS.map((franja) => {
                  const marcado = form.availableSlots.includes(franja.value)
                  return (
                    <button
                      key={franja.value}
                      type="button"
                      onClick={() => toggleOption('availableSlots', franja.value)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '2px solid ' + (marcado ? '#0284c7' : '#e2e8f0'),
                        background: marcado ? '#f0f9ff' : '#ffffff',
                        color: marcado ? '#0369a1' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {franja.label}
                    </button>
                  )
                })}
              </div>
              {errors.availableSlots && (
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>{errors.availableSlots}</span>
              )}
            </div>

            <RadioField
              label="¿Cuántas horas a la semana podrías dedicar?"
              required
              options={HORAS_SEMANA}
              value={form.weeklyHours}
              error={errors.weeklyHours}
              onChange={(v) => update('weeklyHours', v)}
            />

            {vaPresencial && (
              <RadioField
                label="¿Estás vacunado/a contra la fiebre amarilla?"
                required
                hint="Algunas zonas de terreno exigen carné de vacunación para el ingreso. Si no la tienes, igual puedes apoyar virtualmente."
                options={FIEBRE_AMARILLA}
                value={form.yellowFeverVaccine}
                error={errors.yellowFeverVaccine}
                onChange={(v) => update('yellowFeverVaccine', v)}
              />
            )}

            {/* Autorizaciones */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} color="#059669" />
                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                  Autorizaciones y tratamiento de datos
                </strong>
              </div>

              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                {AVISO_TRATAMIENTO.apoyo} Conservamos tus datos durante {RESPONSABLE.retencionMeses / 12} años
                desde que culminas tu participación. {AVISO_DERECHOS}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                <ConsentField
                  label={CASILLAS.datos}
                  checked={form.dataConsent}
                  error={errors.dataConsent}
                  onChange={(c) => update('dataConsent', c)}
                />
                {vaPresencial && (
                  <ConsentField
                    label={CASILLAS.sensiblesProfesional}
                    checked={form.sensitiveDataConsent}
                    error={errors.sensitiveDataConsent}
                    onChange={(c) => update('sensitiveDataConsent', c)}
                  />
                )}
                <ConsentField
                  label={CASILLAS.comunicaciones}
                  checked={form.communicationsConsent}
                  onChange={(c) => update('communicationsConsent', c)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 12 }}>
              <Button type="button" variant="default" onClick={() => setPaso(2)} icon={<ArrowLeft size={16} />}>
                Atrás
              </Button>

              <Button type="submit" variant="primary" disabled={submitting} icon={<Send size={16} />}>
                {submitting ? 'Enviando registro…' : 'Quiero apoyar como voluntario'}
              </Button>
            </div>

            {status && <FormStatus status={status} />}
          </div>
        )}
      </form>
    </div>
  )
}
