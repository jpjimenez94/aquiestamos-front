'use client'

import { useState } from 'react'
import {
  Send,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConsentField, RadioField, TextField } from './fields'
import { MunicipioSelector } from './MunicipioSelector'
import { FormStatus, type Status } from './FormStatus'
import {
  AVISO_DERECHOS,
  AVISO_TRATAMIENTO,
  CASILLAS,
  RESPONSABLE,
  VERSION_CONSENTIMIENTO,
} from '@/lib/consentimiento'
import { site, whatsappHref } from '@/lib/site'
import { nombreDePila } from '@/lib/nombre'

const PARA_QUIEN = [
  { value: 'PARA_MI', label: 'Para mí' },
  { value: 'PARA_OTRA_PERSONA', label: 'Para otra persona' },
] as const

const ES_MENOR = [
  { value: 'NO', label: 'No, es mayor de edad' },
  { value: 'SI', label: 'Sí, es menor de 18 años' },
] as const

const CANAL = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'LLAMADA', label: 'Llamada telefónica' },
  { value: 'CORREO', label: 'Correo electrónico' },
] as const

const MODALIDAD_PREFERIDA = [
  { value: 'VIRTUAL', label: 'Virtual (por videollamada o llamada telefónica)' },
  { value: 'PRESENCIAL', label: 'Presencial (en consultorio o espacio acordado en tu municipio)' },
  { value: 'INDIFERENTE', label: 'Me es indiferente (puedo virtual o presencial)' },
] as const

const NIVELES_MALESTAR = [
  { valor: 1, etiqueta: '1 · Leve', desc: 'Lo estoy sobrellevando', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  { valor: 2, etiqueta: '2 · Manejable', desc: 'Con algo de dificultad', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
  { valor: 3, etiqueta: '3 · Difícil', desc: 'Me cuesta bastante', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { valor: 4, etiqueta: '4 · Muy difícil', desc: 'Casi no puedo con el día', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  { valor: 5, etiqueta: '5 · Extremo', desc: 'Desbordado / En crisis', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
]

const VACIO = {
  // Paso 1: Contacto
  forWhom: '',
  isMinor: '',
  relationship: '',
  contactName: '',
  name: '',
  phone: '',
  email: '',
  preferredContact: '',
  city: '',

  // Paso 2: Triaje / Prioridad ágil
  distress: null as number | null,
  selfHarmThoughts: null as boolean | null,
  howSoon: '' as '' | 'HOY' | 'PROXIMOS_DIAS' | 'ESTA_SEMANA',
  safePlace: null as boolean | null,

  // Paso 3: Modalidad y Consentimiento
  preferredModality: '',
  message: '',
  dataConsent: false,
  sensitiveDataConsent: false,
  guardianConsent: false,
  communicationsConsent: false,
}

export function SupportRequestForm() {
  const [paso, setPaso] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completado, setCompletado] = useState(false)

  const paraOtra = form.forWhom === 'PARA_OTRA_PERSONA'
  const esMenor = paraOtra && form.isMinor === 'SI'
  const porCorreo = form.preferredContact === 'CORREO'

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

  function validarPaso1(): boolean {
    const found: Record<string, string> = {}
    if (!form.forWhom) found.forWhom = 'Selecciona para quién es el acompañamiento'
    if (paraOtra && !form.isMinor) found.isMinor = 'Cuéntanos si esa persona es menor de 18 años'
    if (paraOtra && !form.contactName.trim()) found.contactName = 'Dinos tu nombre para saber con quién hablamos'
    if (!form.name.trim()) found.name = 'Necesitamos un nombre de contacto'
    if (!form.phone.trim()) found.phone = 'Necesitamos un número de teléfono/WhatsApp'
    if (form.email.trim() && !/^[^s@]+@[^s@]+.[^s@]+$/.test(form.email.trim())) found.email = 'Ese correo no parece válido'
    if (porCorreo && !form.email.trim()) found.email = 'Si prefieres correo, necesitamos tu dirección'
    if (!form.preferredContact) found.preferredContact = 'Selecciona por dónde prefieres que te contactemos'
    if (!form.city.trim()) found.city = 'Selecciona o escribe desde qué ciudad o municipio nos escribes'

    setErrors(found)
    return Object.keys(found).length === 0
  }

  function validarPaso2(): boolean {
    const found: Record<string, string> = {}
    if (form.distress === null) found.distress = 'Selecciona del 1 al 5 cómo te sientes hoy'
    if (form.selfHarmThoughts === null) found.selfHarmThoughts = 'Por favor responde esta pregunta'
    if (!form.howSoon) found.howSoon = 'Indícanos qué tan pronto necesitas hablar con alguien'
    if (form.safePlace === null) found.safePlace = 'Por favor indícanos si estás en un lugar seguro'

    setErrors(found)
    return Object.keys(found).length === 0
  }

  function validarPaso3(): boolean {
    const found: Record<string, string> = {}
    if (!form.preferredModality) found.preferredModality = 'Selecciona la modalidad de acompañamiento'
    if (!form.dataConsent) found.dataConsent = 'Necesitamos tu autorización para poder contactarte'
    if (!form.sensitiveDataConsent) found.sensitiveDataConsent = 'Necesitamos tu autorización expresa para acompañarte'
    if (esMenor && !form.guardianConsent) {
      found.guardianConsent = 'Como es para un menor de edad, necesitamos la autorización del representante legal'
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
      setStatus({ type: 'error', message: 'Por favor completa los campos requeridos antes de enviar.' })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/support-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          isMinor: paraOtra ? form.isMinor === 'SI' : null,
          consentVersion: VERSION_CONSENTIMIENTO,
        }),
      })
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        if (payload.details) setErrors(payload.details)
        setStatus({
          type: 'error',
          message: payload.message ?? 'No pudimos enviar tus datos. Intenta de nuevo.',
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
    const nombrePersona = nombreDePila(form.name) || form.name.trim() || 'Amigo/a'
    const esPrioridadAlta = form.selfHarmThoughts === true || form.distress === 5 || form.howSoon === 'HOY'

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
          ¡Recibimos tu solicitud, {nombrePersona}!
        </h2>

        <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.6, marginBottom: 24 }}>
          Estamos aquí contigo. Tu información ya fue recibida por nuestro equipo de coordinación
          y un profesional voluntario de la red se comunicará contigo vía WhatsApp o llamada
          a tu número <strong>{form.phone}</strong> para acompañarte.
        </p>

        {esPrioridadAlta && (
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 12,
              padding: '18px 20px',
              textAlign: 'left',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ display: 'block', color: '#92400e', fontSize: '0.92rem', marginBottom: 4 }}>
                  Atención prioritaria y líneas de emergencia 24/7
                </strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#78350f', lineHeight: 1.5 }}>
                  Si sientes que estás en peligro o necesitas hablar de inmediato con un especialista,
                  puedes llamar gratis en Colombia a la <strong>Línea 106</strong> o <strong>Línea 192</strong>,
                  o escribirnos directamente a nuestro WhatsApp oficial:
                </p>
                <div style={{ marginTop: 12 }}>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#16a34a',
                      color: '#ffffff',
                      padding: '8px 14px',
                      borderRadius: 8,
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <MessageCircle size={15} />
                    Escribir al WhatsApp {site.whatsappDisplay}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

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
            Volver al inicio
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
              {paso === 1 && '¿A quién acompañamos y contacto?'}
              {paso === 2 && '¿Cómo te sientes hoy? (Evaluación breve)'}
              {paso === 3 && 'Modalidad y Confirmación'}
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
            <RadioField
              label="El acompañamiento es…"
              required
              options={PARA_QUIEN}
              value={form.forWhom}
              error={errors.forWhom}
              onChange={(v) => update('forWhom', v)}
            />

            {paraOtra && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <RadioField
                  label="¿Esa persona es menor de edad?"
                  required
                  options={ES_MENOR}
                  value={form.isMinor}
                  error={errors.isMinor}
                  onChange={(v) => update('isMinor', v)}
                />
                <TextField
                  label="¿Cómo te llamas tú?"
                  name="contactName"
                  required
                  hint="Para saber con quién hablamos cuando llamemos."
                  value={form.contactName}
                  error={errors.contactName}
                  onChange={(v) => update('contactName', v)}
                />
                <TextField
                  label="¿Cuál es tu relación con esa persona?"
                  name="relationship"
                  hint="Opcional. Por ejemplo: madre, hijo, pareja, amiga."
                  value={form.relationship}
                  error={errors.relationship}
                  onChange={(v) => update('relationship', v)}
                />
              </div>
            )}

            <TextField
              label={paraOtra ? '¿Cómo se llama esa persona?' : '¿Cómo te llamas?'}
              name="name"
              required
              autoComplete={paraOtra ? 'off' : 'name'}
              value={form.name}
              error={errors.name}
              onChange={(v) => update('name', v)}
            />

            <TextField
              label="Celular / WhatsApp"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              hint="Un número al que podamos escribirte o llamarte."
              value={form.phone}
              error={errors.phone}
              onChange={(v) => update('phone', v)}
            />

            <TextField
              label="Correo electrónico"
              name="email"
              type="email"
              autoComplete="email"
              hint="Opcional. El celular o WhatsApp es suficiente."
              value={form.email}
              error={errors.email}
              onChange={(v) => update('email', v)}
            />

            <RadioField
              label="¿Por dónde prefieres que te contactemos?"
              required
              options={CANAL}
              value={form.preferredContact}
              error={errors.preferredContact}
              onChange={(v) => update('preferredContact', v)}
            />

            <MunicipioSelector
              label="¿Desde qué ciudad o municipio nos escribes?"
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
                Siguiente: ¿Cómo te sientes hoy?
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 2: EVALUACIÓN DE PRIORIDAD (4 PREGUNTAS DE UN TOQUE)                  */}
        {/* ========================================================================= */}
        {paso === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <HeartHandshake size={22} color="#059669" style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#065f46', lineHeight: 1.4 }}>
                <strong>4 preguntas breves de 1 solo toque.</strong> Nos ayudan a entender tu situación
                actual y conectarte con el profesional más adecuado con la prioridad que necesitas.
              </p>
            </div>

            {/* Pregunta 1: Malestar 1 al 5 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
                1. Del 1 al 5, ¿qué tan difícil o abrumador sientes el día de hoy? *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
                {NIVELES_MALESTAR.map((item) => {
                  const seleccionado = form.distress === item.valor
                  return (
                    <button
                      key={item.valor}
                      type="button"
                      onClick={() => update('distress', item.valor)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: 10,
                        border: '2px solid ' + (seleccionado ? item.color : '#e2e8f0'),
                        background: seleccionado ? item.bg : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <strong style={{ display: 'block', fontSize: '0.92rem', color: seleccionado ? item.color : '#1e293b' }}>
                        {item.etiqueta}
                      </strong>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                        {item.desc}
                      </span>
                    </button>
                  )
                })}
              </div>
              {errors.distress && (
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>{errors.distress}</span>
              )}
            </div>

            {/* Pregunta 2: Riesgo / Pensamientos de hacerse daño */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
                2. En estos días, ¿has tenido pensamientos de hacerte daño o no querer seguir? *
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => update('selfHarmThoughts', false)}
                  style={{
                    flex: 1,
                    minWidth: 140,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '2px solid ' + (form.selfHarmThoughts === false ? '#059669' : '#e2e8f0'),
                    background: form.selfHarmThoughts === false ? '#ecfdf5' : '#ffffff',
                    color: form.selfHarmThoughts === false ? '#065f46' : '#1e293b',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => update('selfHarmThoughts', true)}
                  style={{
                    flex: 1,
                    minWidth: 140,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '2px solid ' + (form.selfHarmThoughts === true ? '#dc2626' : '#e2e8f0'),
                    background: form.selfHarmThoughts === true ? '#fef2f2' : '#ffffff',
                    color: form.selfHarmThoughts === true ? '#991b1b' : '#1e293b',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Sí, he tenido esos pensamientos
                </button>
              </div>
              {errors.selfHarmThoughts && (
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>{errors.selfHarmThoughts}</span>
              )}

              {/* Alerta de Contención Inmediata */}
              {form.selfHarmThoughts === true && (
                <div
                  style={{
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: 10,
                    padding: '14px 16px',
                    marginTop: 6,
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <AlertTriangle size={18} color="#e11d48" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: '0.84rem', color: '#9f1239', lineHeight: 1.5 }}>
                      <strong>Tu vida es muy valiosa. No estás solo/a.</strong>
                      <p style={{ margin: '4px 0 8px' }}>
                        Si sientes que estás en peligro inmediato o no puedes contener la angustia,
                        puedes marcar gratis al <strong>106</strong> o <strong>192</strong> en Colombia (24 horas),
                        o escribirnos al WhatsApp de la Red:
                      </p>
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#e11d48',
                          color: '#ffffff',
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        <MessageCircle size={13} />
                        WhatsApp {site.whatsappDisplay}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pregunta 3: Urgencia / Qué tan pronto */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
                3. ¿Qué tan pronto sientes que necesitas hablar con un profesional? *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                {[
                  { id: 'HOY', label: 'Hoy mismo / Muy urgente' },
                  { id: 'PROXIMOS_DIAS', label: 'En los próximos 2 a 3 días' },
                  { id: 'ESTA_SEMANA', label: 'Esta semana' },
                ].map((item) => {
                  const seleccionado = form.howSoon === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => update('howSoon', item.id as any)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '2px solid ' + (seleccionado ? '#0284c7' : '#e2e8f0'),
                        background: seleccionado ? '#f0f9ff' : '#ffffff',
                        color: seleccionado ? '#0369a1' : '#1e293b',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
              {errors.howSoon && (
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>{errors.howSoon}</span>
              )}
            </div>

            {/* Pregunta 4: Lugar seguro */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
                4. ¿Estás en un lugar seguro y cuentas con lo básico (dormir, alimentación)? *
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => update('safePlace', true)}
                  style={{
                    flex: 1,
                    minWidth: 160,
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '2px solid ' + (form.safePlace === true ? '#059669' : '#e2e8f0'),
                    background: form.safePlace === true ? '#ecfdf5' : '#ffffff',
                    color: form.safePlace === true ? '#065f46' : '#1e293b',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                  }}
                >
                  Sí, estoy seguro/a
                </button>
                <button
                  type="button"
                  onClick={() => update('safePlace', false)}
                  style={{
                    flex: 1,
                    minWidth: 160,
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '2px solid ' + (form.safePlace === false ? '#ea580c' : '#e2e8f0'),
                    background: form.safePlace === false ? '#fff7ed' : '#ffffff',
                    color: form.safePlace === false ? '#9a3412' : '#1e293b',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                  }}
                >
                  No me siento seguro/a o me falta lo básico
                </button>
              </div>
              {errors.safePlace && (
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>{errors.safePlace}</span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <Button type="button" variant="default" onClick={() => setPaso(1)} icon={<ArrowLeft size={16} />}>
                Atrás
              </Button>
              <Button type="button" variant="primary" onClick={irAlPaso3} icon={<ArrowRight size={16} />}>
                Siguiente: Modalidad y Confirmación
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 3: MODALIDAD, DETALLES Y AUTORIZACIONES                               */}
        {/* ========================================================================= */}
        {paso === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <RadioField
              label="¿Cómo prefieres recibir el acompañamiento?"
              required
              options={MODALIDAD_PREFERIDA}
              value={form.preferredModality}
              error={errors.preferredModality}
              onChange={(v) => update('preferredModality', v)}
            />

            <TextField
              label="¿Quieres dejarnos algún mensaje o detalle adicional?"
              name="message"
              hint="Opcional. Puedes contarnos brevemente lo que consideres importante."
              value={form.message}
              error={errors.message}
              onChange={(v) => update('message', v)}
            />

            {/* Bloque de Consentimientos */}
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
                  Autorizaciones y confidencialidad
                </strong>
              </div>

              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                {AVISO_TRATAMIENTO.atencion} Conservamos tus datos durante {RESPONSABLE.retencionMeses / 12} años
                bajo estricta confidencialidad. {AVISO_DERECHOS}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                <ConsentField
                  label={CASILLAS.datos}
                  checked={form.dataConsent}
                  error={errors.dataConsent}
                  onChange={(c) => update('dataConsent', c)}
                />
                <ConsentField
                  label={CASILLAS.sensiblesAtencion}
                  checked={form.sensitiveDataConsent}
                  error={errors.sensitiveDataConsent}
                  onChange={(c) => update('sensitiveDataConsent', c)}
                />
                {esMenor && (
                  <ConsentField
                    label={CASILLAS.representante}
                    checked={form.guardianConsent}
                    error={errors.guardianConsent}
                    onChange={(c) => update('guardianConsent', c)}
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
                {submitting ? 'Enviando solicitud…' : 'Solicitar Acompañamiento Psicológico'}
              </Button>
            </div>

            {status && <FormStatus status={status} />}
          </div>
        )}
      </form>
    </div>
  )
}
