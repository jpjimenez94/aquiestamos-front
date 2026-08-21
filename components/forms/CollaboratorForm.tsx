'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Bloque, CheckboxGroup, ConsentField, RadioField, TextArea, TextField } from './fields'
import { FormStatus, type Status } from './FormStatus'
import { ERROR_TELEFONO, PISTA_TELEFONO, telefonoValido } from '@/lib/telefono'
import {
  AVISO_DERECHOS,
  AVISO_TRATAMIENTO,
  CASILLAS,
  RESPONSABLE,
  VERSION_CONSENTIMIENTO,
} from '@/lib/consentimiento'

/**
 * Formulario "Quiero apoyar" — voluntariado de otras disciplinas.
 *
 * Es hermano de "Quiero ser parte", no una variante suya. Quien se registra
 * aquí queda en un directorio que la coordinación consulta cuando aparece una
 * necesidad concreta; no entra al emparejamiento con personas en crisis ni a
 * la agenda de acompañamientos.
 *
 * La disciplina se pregunta en dos pasos, área y luego oficio, porque una
 * lista plana de treinta opciones se vuelve ilegible en un teléfono.
 */

const AREAS = [
  { value: 'SALUD', label: 'Salud y primeros auxilios' },
  { value: 'SOCIAL_LEGAL_EDUCATIVO', label: 'Social, legal y educativo' },
  { value: 'OPERACION_LOGISTICA', label: 'Operación y logística' },
  { value: 'COMUNICACION_TECNOLOGIA', label: 'Comunicación y tecnología' },
  { value: 'GESTION_PROYECTOS', label: 'Gestión y proyectos' },
  { value: 'OTRA', label: 'Otra área' },
] as const

/**
 * Tiene que coincidir con `DISCIPLINAS` en
 * `backend/src/validators/collaborator.schema.js`: el backend rechaza una
 * disciplina que no pertenezca al área elegida.
 */
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
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' },
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
  fullName: '',
  phone: '',
  email: '',
  city: '',
  area: '',
  discipline: '',
  disciplineOther: '',
  yearsExperience: '',
  professionalCard: '',
  skills: '',
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
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)

  const vaPresencial = form.modality === 'PRESENCIAL' || form.modality === 'AMBAS'
  const marcoOtraDisciplina = form.discipline === 'Otra'
  const disciplinas = form.area && form.area !== 'OTRA' ? DISCIPLINAS[form.area] : undefined

  function update<K extends keyof typeof VACIO>(key: K, value: (typeof VACIO)[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    clearError(key as string)
  }

  /**
   * Cambiar de área invalida la disciplina que se hubiera elegido antes.
   *
   * "Otra área" es especial: su única disciplina es "Otra", así que mostrarle
   * ese radio era obligar a un clic sin decisión. Se fija sola y se pasa
   * directo a preguntar cuál.
   */
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

  function clearError(key: string) {
    setErrors((current) => {
      if (!current[key]) return current
      const { [key]: _, ...resto } = current
      return resto
    })
  }

  function toggleOption(
    key: 'availableDays' | 'availableSlots',
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
    if (!form.fullName.trim() || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.fullName)) {
      found.fullName = 'Cuéntanos tu nombre completo (solo letras)'
    }
    if (!telefonoValido(form.phone)) found.phone = ERROR_TELEFONO
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) found.email = 'Escribe un correo válido'
    if (!form.city.trim()) found.city = 'Dinos en qué ciudad o municipio vives'
    if (!form.area) found.area = 'Selecciona un área'
    if (!form.discipline) found.discipline = 'Selecciona tu disciplina'
    if (marcoOtraDisciplina && !form.disciplineOther.trim())
      found.disciplineOther = 'Cuéntanos cuál es tu disciplina'
    if (!form.modality) found.modality = 'Selecciona una opción'
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
          hint={PISTA_TELEFONO}
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
          label="Ciudad o municipio donde vives"
          name="city"
          required
          value={form.city}
          error={errors.city}
          onChange={(v) => update('city', v)}
        />
      </Bloque>

      <Bloque
        numero={2}
        titulo="En qué puedes ayudar"
        descripcion="No hace falta que tengas experiencia en emergencias. Lo que necesitamos saber es qué sabes hacer."
      >
        <RadioField
          label="¿En qué área está lo tuyo?"
          required
          options={AREAS}
          value={form.area}
          error={errors.area}
          onChange={cambiarArea}
        />

        {disciplinas ? (
          <RadioField
            label="¿Cuál es tu disciplina?"
            required
            options={disciplinas.map((d) => ({ value: d, label: d }))}
            value={form.discipline}
            error={errors.discipline}
            onChange={(v) => update('discipline', v)}
          />
        ) : null}

        {marcoOtraDisciplina ? (
          <TextField
            label={form.area === 'OTRA' ? '¿Cuál es tu oficio o profesión?' : '¿Cuál?'}
            name="disciplineOther"
            required
            value={form.disciplineOther}
            error={errors.disciplineOther}
            onChange={(v) => update('disciplineOther', v)}
          />
        ) : null}

        <RadioField
          label="¿Cuántos años llevas en eso?"
          options={ANOS_EXPERIENCIA}
          value={form.yearsExperience}
          error={errors.yearsExperience}
          onChange={(v) => update('yearsExperience', v)}
        />

        <RadioField
          label="¿Tienes tarjeta profesional?"
          hint="Solo si tu profesión la exige. Si no aplica, sáltate esta pregunta."
          options={TARJETA}
          value={form.professionalCard}
          error={errors.professionalCard}
          onChange={(v) => update('professionalCard', v)}
        />

        <TextArea
          label="¿Qué sabes hacer que nos pueda servir?"
          name="skills"
          hint="Opcional, pero es lo que más ayuda. Con tus palabras: herramientas que manejas, idiomas, si conduces, si has trabajado en terreno."
          value={form.skills}
          error={errors.skills}
          onChange={(v) => update('skills', v)}
        />
      </Bloque>

      <Bloque
        numero={3}
        titulo="Tu disponibilidad"
        descripcion="Es lo que miramos para saber a quién llamar cuando aparece algo. No te compromete a nada."
      >
        <RadioField
          label="¿Cómo puedes apoyar?"
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
            hint="Algunas de las zonas afectadas exigen este carné para entrar. Si no la tienes, igual puedes apoyar de forma virtual."
            options={FIEBRE_AMARILLA}
            value={form.yellowFeverVaccine}
            error={errors.yellowFeverVaccine}
            onChange={(v) => update('yellowFeverVaccine', v)}
          />
        ) : null}
      </Bloque>

      <Bloque numero={4} titulo="Autorizaciones">
        <div className="autorizaciones">
          <p className="autorizaciones__aviso">{AVISO_TRATAMIENTO.apoyo}</p>
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
          {submitting ? 'Enviando…' : 'Quiero apoyar'}
        </Button>
      </div>
    </form>
  )
}
