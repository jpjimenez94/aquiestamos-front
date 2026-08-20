'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Bloque, CheckboxGroup, ConsentField, RadioField, TextField } from './fields'
import { FormStatus, type Status } from './FormStatus'
import {
  AVISO_DERECHOS,
  AVISO_TRATAMIENTO,
  CASILLAS,
  RESPONSABLE,
  VERSION_CONSENTIMIENTO,
} from '@/lib/consentimiento'

/**
 * Formulario "Quiero ser parte" — reemplaza al Google Form original.
 *
 * Está en cuatro bloques y no en una sola columna de trece campos. Los campos
 * condicionales solo aparecen cuando tienen sentido: a quien acompaña solo de
 * forma virtual no se le pregunta por desplazamientos ni por vacunas, y por eso
 * tampoco se le pide autorización de datos de salud.
 */

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

const ANOS_EXPERIENCIA = [
  { value: 'MENOS_DE_1', label: 'Menos de 1 año' },
  { value: 'ENTRE_1_Y_3', label: 'Entre 1 y 3 años' },
  { value: 'ENTRE_3_Y_5', label: 'Entre 3 y 5 años' },
  { value: 'MAS_DE_5', label: 'Más de 5 años' },
] as const

const HORAS_SEMANA = [
  { value: 'ENTRE_1_Y_3', label: 'Entre 1 y 3 horas · una o dos sesiones' },
  { value: 'ENTRE_4_Y_6', label: 'Entre 4 y 6 horas · tres o cuatro sesiones' },
  { value: 'MAS_DE_6', label: 'Más de 6 horas · cinco o más sesiones' },
  { value: 'VARIABLE', label: 'Depende de la semana' },
] as const

const EXPERIENCIA_CRISIS = [
  { value: 'SI', label: 'Sí, tengo formación y experiencia' },
  { value: 'FORMACION_POCA_PRACTICA', label: 'Tengo formación, pero poca experiencia práctica' },
  { value: 'SIN_FORMACION_DISPONIBLE_APRENDER', label: 'No tengo formación, pero quiero aprender' },
  { value: 'NO', label: 'No' },
] as const

const MODALIDAD = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'VIRTUAL', label: 'Virtual' },
  { value: 'AMBAS', label: 'Ambas' },
] as const

const FIEBRE_AMARILLA = [
  { value: 'SI', label: 'Sí, ya estoy vacunado o vacunada' },
  { value: 'CITA_AGENDADA', label: 'Todavía no, pero ya tengo cita' },
  { value: 'NO', label: 'No' },
] as const

const TARJETA = [
  { value: 'SI', label: 'Sí, la tengo' },
  { value: 'EN_TRAMITE', label: 'Está en trámite' },
  { value: 'ESTUDIANTE', label: 'Soy estudiante' },
] as const

const VACIO = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  profession: '',
  additionalTraining: '',
  yearsExperience: '',
  professionalCard: '',
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

export function VolunteerForm() {
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)

  // Quien solo puede de forma virtual no viaja ni necesita el carné de vacunas.
  const vaPresencial = form.modality === 'PRESENCIAL' || form.modality === 'AMBAS'
  const marcoOtra = form.populations.includes('Otra')

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

  /** Calcula siempre sobre el estado más reciente, para que dos clics seguidos no se pisen. */
  function toggleOption(
    key: 'populations' | 'availableDays' | 'availableSlots',
    option: string,
    checked: boolean,
  ) {
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
    if (!form.fullName.trim()) found.fullName = 'Cuéntanos tu nombre completo'
    if (!form.phone.trim()) found.phone = 'Necesitamos un celular de contacto'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) found.email = 'Escribe un correo válido'
    if (!form.city.trim()) found.city = 'Dinos en qué ciudad o municipio vives'
    if (!form.profession.trim()) found.profession = 'Cuéntanos cuál es tu profesión'
    if (!form.yearsExperience) found.yearsExperience = 'Selecciona una opción'
    if (!form.professionalCard) found.professionalCard = 'Selecciona una opción'
    if (form.populations.length === 0) found.populations = 'Selecciona al menos una población'
    if (marcoOtra && !form.populationOther.trim())
      found.populationOther = 'Cuéntanos con qué otra población trabajas'
    if (!form.crisisExperience) found.crisisExperience = 'Selecciona una opción'
    if (!form.modality) found.modality = 'Selecciona una modalidad'
    if (form.availableDays.length === 0) found.availableDays = 'Selecciona al menos un día'
    if (form.availableSlots.length === 0) found.availableSlots = 'Selecciona al menos una franja'
    if (!form.weeklyHours) found.weeklyHours = 'Selecciona una opción'
    if (vaPresencial && !form.yellowFeverVaccine) found.yellowFeverVaccine = 'Selecciona una opción'
    if (!form.dataConsent) found.dataConsent = 'Necesitamos tu autorización para poder contactarte'
    if (vaPresencial && !form.sensitiveDataConsent)
      found.sensitiveDataConsent = 'Necesitamos tu autorización expresa para guardar el dato de vacunación'
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
      const response = await fetch('/api/volunteers', {
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
      <Bloque numero={1} titulo="Tus datos">
        <TextField
          label="Nombre completo"
          name="fullName"
          required
          autoComplete="name"
          value={form.fullName}
          error={errors.fullName}
          onChange={(v) => update('fullName', v)}
        />
        <TextField
          label="Celular"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          hint="Con WhatsApp, si lo tienes. Es por donde te contactaremos."
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
          value={form.email}
          error={errors.email}
          onChange={(v) => update('email', v)}
        />
        <TextField
          label="¿En qué ciudad o municipio vives?"
          name="city"
          required
          hint="Nos sirve para asignarte acompañamientos cerca de ti."
          value={form.city}
          error={errors.city}
          onChange={(v) => update('city', v)}
        />
      </Bloque>

      <Bloque numero={2} titulo="Tu perfil profesional">
        <TextField
          label="¿Cuál es tu profesión?"
          name="profession"
          required
          placeholder="Ej. Psicóloga, Psiquiatra, Trabajador social"
          value={form.profession}
          error={errors.profession}
          onChange={(v) => update('profession', v)}
        />
        <TextField
          label="Formación adicional"
          name="additionalTraining"
          hint="Opcional. Especializaciones, maestrías, diplomados o cursos que quieras contarnos."
          value={form.additionalTraining}
          error={errors.additionalTraining}
          onChange={(v) => update('additionalTraining', v)}
        />
        <RadioField
          label="¿Cuántos años de experiencia tienes?"
          required
          options={ANOS_EXPERIENCIA}
          value={form.yearsExperience}
          error={errors.yearsExperience}
          onChange={(v) => update('yearsExperience', v)}
        />
        <RadioField
          label="¿Cuentas con tarjeta profesional?"
          required
          options={TARJETA}
          value={form.professionalCard}
          error={errors.professionalCard}
          onChange={(v) => update('professionalCard', v)}
        />
        <CheckboxGroup
          label="¿Con qué poblaciones tienes experiencia?"
          required
          hint="Marca todas las que apliquen."
          options={POBLACIONES}
          values={form.populations}
          error={errors.populations}
          onToggle={(o, c) => toggleOption('populations', o, c)}
        />
        {marcoOtra ? (
          <TextField
            label="¿Con qué otra población?"
            name="populationOther"
            required
            value={form.populationOther}
            error={errors.populationOther}
            onChange={(v) => update('populationOther', v)}
          />
        ) : null}
        <RadioField
          label="¿Tienes experiencia en atención en crisis o primeros auxilios psicológicos?"
          required
          options={EXPERIENCIA_CRISIS}
          value={form.crisisExperience}
          error={errors.crisisExperience}
          onChange={(v) => update('crisisExperience', v)}
        />
      </Bloque>

      <Bloque
        numero={3}
        titulo="Tu disponibilidad"
        descripcion="Cada acompañamiento dura 45 minutos y dejamos 30 de descanso entre uno y otro."
      >
        <RadioField
          label="¿En qué modalidad puedes acompañar?"
          required
          options={MODALIDAD}
          value={form.modality}
          error={errors.modality}
          onChange={(v) => update('modality', v)}
        />
        {vaPresencial ? (
          <TextField
            label="¿A qué municipios o zonas podrías desplazarte?"
            name="availableToTravel"
            hint="Opcional."
            value={form.availableToTravel}
            error={errors.availableToTravel}
            onChange={(v) => update('availableToTravel', v)}
          />
        ) : null}
        <CheckboxGroup
          label="¿Qué días de la semana puedes?"
          required
          hint="Marca todos los que te sirvan."
          options={DIAS}
          values={form.availableDays}
          error={errors.availableDays}
          onToggle={(v, c) => toggleOption('availableDays', v, c)}
        />
        <CheckboxGroup
          label="¿En qué franjas del día?"
          required
          options={FRANJAS}
          values={form.availableSlots}
          error={errors.availableSlots}
          onToggle={(v, c) => toggleOption('availableSlots', v, c)}
        />
        <RadioField
          label="¿Cuántas horas a la semana podrías dedicar?"
          required
          options={HORAS_SEMANA}
          value={form.weeklyHours}
          error={errors.weeklyHours}
          onChange={(v) => update('weeklyHours', v)}
        />
        {vaPresencial ? (
          <RadioField
            label="¿Estás vacunado o vacunada contra la fiebre amarilla?"
            required
            hint="Algunas de las zonas afectadas exigen este carné para entrar. Si no la tienes, igual puedes acompañar de forma virtual."
            options={FIEBRE_AMARILLA}
            value={form.yellowFeverVaccine}
            error={errors.yellowFeverVaccine}
            onChange={(v) => update('yellowFeverVaccine', v)}
          />
        ) : null}
      </Bloque>

      <Bloque numero={4} titulo="Autorizaciones">
        <div className="autorizaciones">
          <p className="autorizaciones__aviso">{AVISO_TRATAMIENTO.profesionales}</p>
          <p className="autorizaciones__aviso">
            Los conservamos durante {RESPONSABLE.retencionMeses / 12} años desde que
            terminas tu participación. {AVISO_DERECHOS} Escríbenos a{' '}
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
      </Bloque>

      <div className="form__footer">
        <FormStatus status={status} />
        <Button type="submit" variant="primary" disabled={submitting} icon={<Send size={16} />}>
          {submitting ? 'Enviando…' : 'Enviar mi registro'}
        </Button>
      </div>
    </form>
  )
}
