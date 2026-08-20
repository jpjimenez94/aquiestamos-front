'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Bloque, CheckboxGroup, ConsentField, RadioField, TextArea, TextField } from './fields'
import { FormStatus, type Status } from './FormStatus'
import {
  AVISO_DERECHOS,
  AVISO_TRATAMIENTO,
  CASILLAS,
  RESPONSABLE,
  VERSION_CONSENTIMIENTO,
} from '@/lib/consentimiento'

/**
 * Formulario "Atención Psicológica" — reemplaza al Google Form original.
 *
 * Lo llena alguien que está pidiendo ayuda, así que casi todo se responde
 * marcando en vez de escribiendo, el correo es opcional y ningún campo obliga a
 * contar lo que está pasando.
 */

const DIAS = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' },
] as const

const FRANJAS = [
  { value: 'MANANA', label: 'Mañana · 8 a. m. – 12 m.' },
  { value: 'TARDE', label: 'Tarde · 12 m. – 6 p. m.' },
  { value: 'NOCHE', label: 'Noche · 6 – 9 p. m.' },
] as const

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
  { value: 'LLAMADA', label: 'Llamada' },
  { value: 'CORREO', label: 'Correo electrónico' },
] as const

const MODALIDAD = [
  { value: 'VIRTUAL', label: 'Virtual' },
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'INDIFERENTE', label: 'Me da igual' },
] as const

const VACIO = {
  forWhom: '',
  isMinor: '',
  relationship: '',
  contactName: '',
  name: '',
  phone: '',
  email: '',
  preferredContact: '',
  city: '',
  preferredModality: '',
  availableDays: [] as string[],
  availableSlots: [] as string[],
  message: '',
  dataConsent: false,
  sensitiveDataConsent: false,
  guardianConsent: false,
  communicationsConsent: false,
}

export function SupportRequestForm() {
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)

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

  function toggleOption(key: 'availableDays' | 'availableSlots', option: string, checked: boolean) {
    setForm((current) => ({
      ...current,
      [key]: checked
        ? [...current[key], option]
        : current[key].filter((value) => value !== option),
    }))
    clearError(key)
  }

  function validate() {
    const found: Record<string, string> = {}
    if (!form.forWhom) found.forWhom = 'Selecciona una opción'
    if (paraOtra && !form.isMinor) found.isMinor = 'Cuéntanos si esa persona es menor de 18 años'
    if (paraOtra && !form.contactName.trim())
      found.contactName = 'Dinos tu nombre, para saber con quién hablamos'
    if (!form.name.trim()) found.name = 'Necesitamos un nombre para contactar'
    if (!form.phone.trim()) found.phone = 'Necesitamos un número para contactarte'
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      found.email = 'Ese correo no parece válido'
    if (porCorreo && !form.email.trim())
      found.email = 'Si prefieres que te escribamos por correo, necesitamos tu dirección'
    if (!form.preferredContact) found.preferredContact = 'Selecciona una opción'
    if (!form.city.trim()) found.city = 'Cuéntanos desde dónde nos escribes'
    if (!form.dataConsent) found.dataConsent = 'Necesitamos tu autorización para poder contactarte'
    if (!form.sensitiveDataConsent)
      found.sensitiveDataConsent = 'Necesitamos tu autorización expresa para poder acompañarte'
    if (esMenor && !form.guardianConsent)
      found.guardianConsent =
        'Como es para un menor de edad, necesitamos la autorización de su representante legal'
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
      const response = await fetch('/api/support-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          // El backend espera un booleano; el formulario usa 'SI' / 'NO'.
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

      setForm(VACIO)
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
    <form className="form" onSubmit={handleSubmit} noValidate>
      <Bloque numero={1} titulo="¿Para quién es?">
        <RadioField
          label="El acompañamiento es…"
          required
          options={PARA_QUIEN}
          value={form.forWhom}
          error={errors.forWhom}
          onChange={(v) => update('forWhom', v)}
        />
        {paraOtra ? (
          <>
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
              hint="Opcional. Por ejemplo: madre, hijo, pareja, vecina."
              value={form.relationship}
              error={errors.relationship}
              onChange={(v) => update('relationship', v)}
            />
          </>
        ) : null}
      </Bloque>

      <Bloque numero={2} titulo="Cómo te contactamos">
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
          label="Celular"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          hint="Con WhatsApp, si lo tienes."
          value={form.phone}
          error={errors.phone}
          onChange={(v) => update('phone', v)}
        />
        <TextField
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          hint="Opcional. El celular es suficiente."
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
        <TextField
          label="¿Desde qué ciudad o municipio nos escribes?"
          name="city"
          required
          placeholder="Ej. Manizales"
          value={form.city}
          error={errors.city}
          onChange={(v) => update('city', v)}
        />
      </Bloque>

      <Bloque numero={3} titulo="Autorizaciones">
        <div className="autorizaciones">
          <p className="autorizaciones__aviso">{AVISO_TRATAMIENTO.atencion}</p>
          <p className="autorizaciones__aviso">
            Los conservamos durante {RESPONSABLE.retencionMeses / 12} años desde que se
            cierra el acompañamiento, y después los eliminamos. {AVISO_DERECHOS}{' '}
            Escríbenos a{' '}
            <a href={RESPONSABLE.canalHref} target="_blank" rel="noopener noreferrer">
              {RESPONSABLE.canal}
            </a>{' '}
            o consulta la{' '}
            <a href="/politica-de-datos">Política de Tratamiento de Datos</a>.
          </p>

          <div className="autorizaciones__casillas">
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
            {esMenor ? (
              <ConsentField
                label={CASILLAS.representante}
                checked={form.guardianConsent}
                error={errors.guardianConsent}
                onChange={(c) => update('guardianConsent', c)}
              />
            ) : null}
            <ConsentField
              label={CASILLAS.comunicaciones}
              checked={form.communicationsConsent}
              onChange={(c) => update('communicationsConsent', c)}
            />
          </div>
        </div>
      </Bloque>

      <div className="form__footer">
        <FormStatus status={status} />
        <Button type="submit" variant="primary" disabled={submitting} icon={<Send size={16} />}>
          {submitting ? 'Enviando…' : 'Enviar mis datos'}
        </Button>
      </div>
    </form>
  )
}
