'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { RadioField, TextArea, TextField } from '@/components/forms/fields'
import { FormStatus, type Status } from '@/components/forms/FormStatus'
import { reportarCasoAction } from './actions'

/**
 * "¿Qué pasó con esta asignación?"
 *
 * Quien acompaña no tiene cuenta en el portal, así que este formulario es su
 * única forma de responder. Sin él, la coordinación se entera del estado de un
 * caso solo si llama y pregunta.
 *
 * Los campos de modalidad y fecha aparecen únicamente cuando hubo o habrá
 * encuentro: preguntar "¿presencial o virtual?" a quien acaba de decir que no
 * contesta el teléfono no tiene sentido.
 */

const RESULTADOS = [
  { value: 'YA_ATENDIDA', label: 'Ya la acompañé' },
  { value: 'CITA_ACORDADA', label: 'Hablamos y quedamos en una cita' },
  { value: 'NO_ASISTIO', label: 'Teníamos sesión y no se presentó' },
  { value: 'SIGO_INTENTANDO', label: 'Sigo intentando contactarla' },
  { value: 'NO_CONTESTA', label: 'La busqué y no contesta' },
  { value: 'DATOS_ERRADOS', label: 'El número o el correo no corresponden' },
  { value: 'NO_QUIERE', label: 'No quiere el acompañamiento o ya no lo necesita' },
  { value: 'OTRO', label: 'Otra cosa' },
] as const

/**
 * LA pregunta del cierre. «Ya la acompañé» a secas no dice si el
 * acompañamiento terminó o apenas empezó; esto es lo que le permite a
 * coordinación agendar la siguiente sesión o cerrar el caso sin llamar.
 */
const QUE_SIGUE = [
  { value: 'NECESITA_MAS', label: 'Necesita más sesiones' },
  { value: 'SUFICIENTE', label: 'Con esta fue suficiente' },
  { value: 'NO_SABE', label: 'Todavía no lo sé' },
] as const

const MODALIDAD = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'VIRTUAL', label: 'Virtual' },
] as const

/** Los resultados en los que sí tiene sentido preguntar cómo y cuándo. */
const CON_ENCUENTRO = ['CITA_ACORDADA', 'YA_ATENDIDA']

const VACIO = {
  outcome: '',
  modality: '',
  meetsAt: '',
  followUp: '',
  contactDifficulties: '',
  notes: '',
}

export function ReporteCasoForm({ patientId }: { patientId: string }) {
  const router = useRouter()
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)

  const huboEncuentro = CON_ENCUENTRO.includes(form.outcome)
  const esCitaFutura = form.outcome === 'CITA_ACORDADA'

  function update<K extends keyof typeof VACIO>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const { [key]: _, ...resto } = current
      return resto
    })
  }

  function validate() {
    const found: Record<string, string> = {}
    if (!form.outcome) found.outcome = 'Cuéntanos qué pasó'
    if (huboEncuentro && !form.modality) found.modality = 'Dinos si fue presencial o virtual'
    if (esCitaFutura && !form.meetsAt) found.meetsAt = 'Dinos para cuándo quedaron'
    if (form.outcome === 'OTRO' && !form.notes.trim())
      found.notes = 'Cuéntanos brevemente qué pasó'
    if (form.outcome === 'YA_ATENDIDA' && !form.followUp)
      found.followUp = 'Dinos si necesita más sesiones o con esta fue suficiente'
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
      const res = await reportarCasoAction(patientId, {
        ...form,
        // El campo datetime-local da hora local sin zona; se manda como tal y
        // el backend la interpreta con la zona del servidor.
        meetsAt: form.meetsAt ? new Date(form.meetsAt).toISOString() : '',
      })

      if (!res.success) {
        if (res.details) setErrors(res.details)
        setStatus({ type: 'error', message: res.message ?? 'No pudimos registrar tu respuesta.' })
        setSubmitting(false)
        return
      }

      setForm(VACIO)
      setStatus({ type: 'success', message: res.message ?? 'Gracias. Quedó registrado.' })
      router.refresh()
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
      <RadioField
        label="¿Qué pasó con esta asignación?"
        required
        options={RESULTADOS}
        value={form.outcome}
        error={errors.outcome}
        onChange={(v) => update('outcome', v)}
      />

      {huboEncuentro ? (
        <RadioField
          label={esCitaFutura ? '¿La cita será presencial o virtual?' : '¿Fue presencial o virtual?'}
          required
          options={MODALIDAD}
          value={form.modality}
          error={errors.modality}
          onChange={(v) => update('modality', v)}
        />
      ) : null}

      {huboEncuentro ? (
        <TextField
          label={esCitaFutura ? '¿Para cuándo quedaron?' : '¿Cuándo fue?'}
          name="meetsAt"
          type="datetime-local"
          required={esCitaFutura}
          value={form.meetsAt}
          error={errors.meetsAt}
          onChange={(v) => update('meetsAt', v)}
        />
      ) : null}

      {form.outcome === 'YA_ATENDIDA' ? (
        <RadioField
          label="¿Qué sigue?"
          required
          options={QUE_SIGUE}
          value={form.followUp}
          error={errors.followUp}
          onChange={(v) => update('followUp', v)}
        />
      ) : null}

      <TextArea
        label="¿Tuviste dificultades para contactarla?"
        name="contactDifficulties"
        hint="Opcional. Un número que no existe, una zona sin señal, un horario imposible: si nos lo cuentas, podemos intervenir."
        value={form.contactDifficulties}
        error={errors.contactDifficulties}
        onChange={(v) => update('contactDifficulties', v)}
      />

      <TextArea
        label="¿En qué quedó?"
        name="notes"
        hint="Una línea basta. No escribas aquí nada de lo que se habló en la sesión: la red no guarda historia clínica."
        value={form.notes}
        error={errors.notes}
        onChange={(v) => update('notes', v)}
      />

      <div className="form__footer">
        <FormStatus status={status} />
        <Button type="submit" variant="primary" disabled={submitting} icon={<Send size={16} />}>
          {submitting ? 'Enviando…' : 'Enviar respuesta'}
        </Button>
      </div>
    </form>
  )
}
