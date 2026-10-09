'use client'

import { useState } from 'react'
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
import { TextoRico } from '@/components/sitio/TextoRico'
import { ConsentField, RadioField, TextField } from './fields'
import { MunicipioSelector } from './MunicipioSelector'
import { FormStatus, type Status } from './FormStatus'
import { pasoConError, rechazoDelServidor } from './rechazo'
import { HUECO_PARA_LA_BARRA, usePasoALaVista } from './pasoALaVista'
import { telefonoValido } from '@/lib/telefono'
import { nombreValido } from '@/lib/nombre'
import { whatsappHref } from '@/lib/site'
import { VERSION_CONSENTIMIENTO } from '@/lib/consentimiento'
import { rellenar, ruta, type Idioma } from '@/lib/i18n/idiomas'
import type { Diccionario } from '@/lib/i18n/diccionarios/es'

/**
 * Los textos llegan por props, del diccionario del idioma de la página. Solo
 * se importa su tipo: este es un componente de cliente, y con el diccionario
 * los tres idiomas enteros viajarían al navegador.
 */
type Textos = Diccionario['formularios']['profesional']
type Comun = Diccionario['formularios']['comun']

/**
 * Las opciones de cada pregunta. Aquí queda solo lo que NO cambia con el
 * idioma: el valor —que es lo que valida y guarda el backend, también cuando
 * es una frase en español como «Niños y niñas»— y, donde los hay, el icono y
 * los colores. La etiqueta sale del diccionario, indexado por ese valor: una
 * opción a la que le falte su texto no compila.
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

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'] as const

const FRANJAS = [
  {
    value: 'MANANA',
    bg: '#fffdf0',
    bgActive: '#fef3c7',
    border: '#fde68a',
    borderActive: '#d97706',
    text: '#92400e',
  },
  {
    value: 'TARDE',
    bg: '#fff7ed',
    bgActive: '#ffedd5',
    border: '#fed7aa',
    borderActive: '#ea580c',
    text: '#9a3412',
  },
  {
    value: 'NOCHE',
    bg: '#f8faff',
    bgActive: '#e0e7ff',
    border: '#c7d2fe',
    borderActive: '#4f46e5',
    text: '#3730a3',
  },
] as const

const ANOS_EXPERIENCIA = ['MENOS_DE_1', 'ENTRE_1_Y_3', 'ENTRE_3_Y_5', 'MAS_DE_5'] as const

const HORAS_SEMANA = ['ENTRE_1_Y_3', 'ENTRE_4_Y_6', 'MAS_DE_6', 'VARIABLE'] as const

const EXPERIENCIA_CRISIS = [
  'SI',
  'FORMACION_POCA_PRACTICA',
  'SIN_FORMACION_DISPONIBLE_APRENDER',
  'NO',
] as const

const MODALIDAD = [
  { value: 'VIRTUAL', icon: '🌐' },
  { value: 'PRESENCIAL', icon: '📍' },
  { value: 'AMBAS', icon: '🔄' },
] as const

const FIEBRE_AMARILLA = ['SI', 'CITA_AGENDADA', 'NO'] as const

const TARJETA = ['SI', 'EN_TRAMITE', 'ESTUDIANTE'] as const

const PROFESIONES = ['Psicología', 'Psiquiatría', 'Trabajo Social', 'Otra'] as const

/**
 * En qué paso se pregunta cada cosa de los dos primeros. El formulario se
 * envía desde el tercero: si el servidor rechaza algo de antes, hay que volver
 * allí para que la persona vea qué campo es (ver `pasoConError`).
 */
const PASO_DE_CADA_CAMPO: Record<string, 1 | 2> = {
  fullName: 1,
  phone: 1,
  email: 1,
  city: 1,
  profession: 2,
  professionOther: 2,
  additionalTraining: 2,
  additionalTrainingOther: 2,
  yearsExperience: 2,
  professionalCard: 2,
  populations: 2,
  populationOther: 2,
  crisisExperience: 2,
}

/** Los tres documentos que se pueden adjuntar: el campo del formulario donde va la clave de cada uno. */
type CampoDeDocumento =
  | 'professionalCardDocumentUrl'
  | 'identityDocumentUrl'
  | 'identityDocumentBackUrl'

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
  nombre,
  onArchivo,
  onError,
  opcional = false,
  t,
  comun,
}: {
  etiqueta: string
  ayuda: string
  clave: string | null
  /**
   * El nombre del archivo subido. Lo guarda quien usa el campo, junto a la
   * clave, y no el campo: este se desmonta al cerrar el acordeón o al cambiar
   * de paso, y al volver decía «✓ Listo: null».
   */
  nombre: string | null
  /** La clave y el nombre van juntos: o hay archivo, con los dos, o no hay ninguno. */
  onArchivo: (clave: string | null, nombre: string | null) => void
  onError: (m: string | null) => void
  opcional?: boolean
  t: Textos['paso3']['documentos']['archivo']
  comun: Comun
}) {
  const [subiendo, setSubiendo] = useState(false)

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
        onArchivo(null, null)
        // El motivo del servidor llega en español. En las traducciones no se
        // enseña, con el mismo criterio que `rechazoDelServidor`: `errorCampo`
        // solo trae texto cuando el diccionario es una traducción.
        const esTraduccion = Boolean(comun.errorCampo)
        onError(esTraduccion ? t.errorSubida : r.message || t.errorSubida)
        return
      }
      onArchivo(r.data.clave, archivo.name)
    } catch {
      onArchivo(null, null)
      onError(t.errorRed)
    } finally {
      setSubiendo(false)
      e.target.value = ''
    }
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <label className="field__label" style={{ fontWeight: 600 }}>
        {etiqueta} {opcional ? <span style={{ color: '#64748b', fontWeight: 400 }}>{comun.opcional}</span> : null}
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
          {subiendo ? t.subiendo : clave ? rellenar(t.listo, { nombre: nombre ?? '' }) : t.elegir}
        </label>
        {clave && (
          <button
            type="button"
            onClick={() => onArchivo(null, null)}
            style={{
              border: 'none',
              background: 'none',
              color: '#dc2626',
              fontSize: '0.78rem',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {t.quitar}
          </button>
        )}
      </div>
    </div>
  )
}

export function VolunteerForm({
  idioma,
  t,
  comun,
  whatsapp,
  anosDeRetencion,
}: {
  idioma: Idioma
  t: Textos
  comun: Comun
  /** El número de la red tal como se enseña, no el del enlace. */
  whatsapp: string
  anosDeRetencion: number
}) {
  const [paso, setPaso] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [docError, setDocError] = useState<string | null>(null)
  // El nombre de cada archivo subido, para poder decir «✓ Listo: cedula.pdf».
  // La clave va en `form`, que es lo que se envía; el nombre solo se enseña.
  const [nombresDeArchivo, setNombresDeArchivo] = useState<
    Partial<Record<CampoDeDocumento, string | null>>
  >({})
  const [acordeonDocsAbierto, setAcordeonDocsAbierto] = useState(false)
  const [uploadDisponible, setUploadDisponible] = useState<'pendiente' | 'disponible' | 'no_disponible'>('pendiente')
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [nombreEnviado, setNombreEnviado] = useState('')

  // A dónde llevar la vista al cambiar de paso, al enviar o al marcar un
  // campo. Antes se iba al principio de la PÁGINA (`scrollTo({ top: 0 })`),
  // que queda muy por encima del formulario; ver `usePasoALaVista`.
  const { ancla, alInicio, alError } = usePasoALaVista()

  const vaPresencial = form.modality === 'PRESENCIAL' || form.modality === 'AMBAS'
  const marcoOtra = form.populations.includes('Otra')
  const marcoOtraProfesion = form.profession === 'Otra'

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

  /** Lo que hace un campo de documento al subir o quitar su archivo. */
  function alAdjuntar(campo: CampoDeDocumento) {
    return (clave: string | null, nombre: string | null) => {
      update(campo, clave || '')
      setNombresDeArchivo((actual) => ({ ...actual, [campo]: nombre }))
    }
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
    const todos = [...DIAS]
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
    if (!nombreValido(form.fullName)) found.fullName = comun.nombreSoloLetras
    if (!telefonoValido(form.phone)) found.phone = comun.telefono.error
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) found.email = t.errores.email
    if (!form.city.trim()) found.city = t.errores.city

    setErrors(found)
    return Object.keys(found).length === 0
  }

  function validarPaso2(): boolean {
    const found: Record<string, string> = {}
    if (!form.profession) found.profession = t.errores.profession
    if (marcoOtraProfesion && !form.professionOther.trim()) found.professionOther = t.errores.professionOther
    if (!form.yearsExperience) found.yearsExperience = t.errores.yearsExperience
    if (!form.professionalCard) found.professionalCard = t.errores.professionalCard
    if (form.populations.length === 0) found.populations = t.errores.populations
    if (marcoOtra && !form.populationOther.trim()) found.populationOther = t.errores.populationOther
    if (!form.crisisExperience) found.crisisExperience = t.errores.crisisExperience

    setErrors(found)
    return Object.keys(found).length === 0
  }

  function validarPaso3(): boolean {
    const found: Record<string, string> = {}
    if (!form.modality) found.modality = t.errores.modality
    if (form.availableDays.length === 0) found.availableDays = t.errores.availableDays
    if (form.availableSlots.length === 0) found.availableSlots = t.errores.availableSlots
    if (!form.weeklyHours) found.weeklyHours = t.errores.weeklyHours
    if (vaPresencial && !form.yellowFeverVaccine) found.yellowFeverVaccine = t.errores.yellowFeverVaccine
    if (!form.dataConsent) found.dataConsent = t.errores.dataConsent
    if (vaPresencial && !form.sensitiveDataConsent) {
      found.sensitiveDataConsent = t.errores.sensitiveDataConsent
    }

    setErrors(found)
    return Object.keys(found).length === 0
  }

  function irAlPaso(siguiente: 1 | 2 | 3) {
    if (siguiente === 2 && !validarPaso1()) return
    if (siguiente === 3 && (!validarPaso1() || !validarPaso2())) return

    setPaso(siguiente)
    alInicio()
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus(null)

    // Si algo no pasa la validación, al paso donde está y a su primer campo marcado.
    if (!validarPaso1()) { setPaso(1); alError(); return }
    if (!validarPaso2()) { setPaso(2); alError(); return }
    if (!validarPaso3()) { setPaso(3); alError(); return }

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
        locale: idioma,
      }

      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadForm),
      })
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        const { campos, mensaje } = rechazoDelServidor(comun, payload, t.errores.envio)
        if (payload.details) setErrors(campos)
        setStatus({ type: 'error', message: mensaje })

        // Lo rechazado puede estar en un paso que ya no se ve: se vuelve a él.
        const anterior = pasoConError(campos, PASO_DE_CADA_CAMPO)
        if (anterior !== null) {
          setPaso(anterior)
          alError()
        }
        return
      }

      // Guardamos el primer nombre antes de limpiar el form
      const primerNombre = form.fullName.trim().split(' ')[0]
      setNombreEnviado(primerNombre)
      setForm(VACIO)
      setNombresDeArchivo({})
      setPaso(1)
      setEnviado(true)
      alInicio()
    } catch {
      setStatus({ type: 'error', message: comun.errorConexion })
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Pantalla de confirmación post-envío ────────────────────────────────────
  if (enviado) {
    return (
      <div
        ref={ancla}
        style={{
          scrollMarginTop: HUECO_PARA_LA_BARRA,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '40px 24px',
          borderRadius: 16,
          border: '1px solid #bbf7d0',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          gap: 20,
        }}
      >
        {/* Ícono animado */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.4rem',
            boxShadow: '0 8px 24px rgba(5,150,105,0.25)',
          }}
        >
          💚
        </div>

        {/* Mensaje principal */}
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#065f46', margin: '0 0 10px' }}>
            {rellenar(t.exito.titulo, { nombre: nombreEnviado })}
          </h2>
          <p style={{ fontSize: '1rem', color: '#047857', margin: '0 0 6px', lineHeight: 1.6 }}>
            {t.exito.recibido}
          </p>
          <p style={{ fontSize: '0.88rem', color: '#065f46', margin: 0, lineHeight: 1.5 }}>
            {t.exito.contacto}
          </p>
        </div>

        {/* Qué sigue */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #d1fae5',
            borderRadius: 12,
            padding: '16px 20px',
            textAlign: 'left',
            width: '100%',
            maxWidth: 420,
          }}
        >
          <strong style={{ fontSize: '0.88rem', color: '#065f46', display: 'block', marginBottom: 10 }}>
            {t.exito.queSigue}
          </strong>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: '0.84rem', color: '#374151', lineHeight: 1.7 }}>
            {t.exito.pasos.map((texto) => (
              <li key={texto}>{texto}</li>
            ))}
          </ol>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 20px',
              borderRadius: 10,
              background: '#059669',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.88rem',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
            }}
          >
            {t.exito.whatsapp}
          </a>
          <button
            type="button"
            onClick={() => {
              setEnviado(false)
              setNombreEnviado('')
              setStatus(null)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 20px',
              borderRadius: 10,
              border: '1.5px solid #059669',
              background: '#ffffff',
              color: '#059669',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            {t.exito.otra}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      ref={ancla}
      className="form"
      onSubmit={handleSubmit}
      noValidate
      style={{ scrollMarginTop: HUECO_PARA_LA_BARRA }}
    >
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
          <span className="hide-mobile">{t.pestanas[0]}</span>
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
          <span className="hide-mobile">{t.pestanas[1]}</span>
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
          <span className="hide-mobile">{t.pestanas[2]}</span>
        </button>
      </div>

      {paso === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ marginBottom: 4 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
              {t.paso1.titulo}
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
              {t.paso1.bajada}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <TextField
              label={t.paso1.nombre.etiqueta}
              name="fullName"
              required
              autoComplete="name"
              placeholder={t.paso1.nombre.ejemplo}
              value={form.fullName}
              error={errors.fullName}
              onChange={(v) => update('fullName', v)}
            />

            <TextField
              label={t.paso1.celular.etiqueta}
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              hint={comun.telefono.pista}
              placeholder={t.paso1.celular.ejemplo}
              value={form.phone}
              error={errors.phone}
              onChange={(v) => update('phone', v)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <TextField
              label={t.paso1.correo.etiqueta}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={t.paso1.correo.ejemplo}
              value={form.email}
              error={errors.email}
              onChange={(v) => update('email', v)}
            />

            <MunicipioSelector
              label={t.paso1.ciudad.etiqueta}
              name="city"
              required
              placeholder={t.paso1.ciudad.ejemplo}
              textos={comun.municipio}
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
              {t.paso1.continuar}
            </Button>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
              {t.paso2.titulo}
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
              {t.paso2.bajada}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div>
              <label className="field__label">
                {t.paso2.profesion.etiqueta} <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {PROFESIONES.map((p) => {
                  const activa = form.profession === p
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => update('profession', p)}
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
                      {activa ? '✓ ' : ''}{t.paso2.profesion.opciones[p]}
                    </button>
                  )
                })}
              </div>
              {errors.profession && <p className="field__error">{errors.profession}</p>}
            </div>

            <div>
              <label className="field__label">
                {t.paso2.anos.etiqueta} <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {ANOS_EXPERIENCIA.map((exp) => {
                  const activa = form.yearsExperience === exp
                  return (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => update('yearsExperience', exp)}
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
                      {activa ? '✓ ' : ''}{t.paso2.anos.opciones[exp]}
                    </button>
                  )
                })}
              </div>
              {errors.yearsExperience && <p className="field__error">{errors.yearsExperience}</p>}
            </div>
          </div>

          {marcoOtraProfesion && (
            <TextField
              label={t.paso2.otraProfesion.etiqueta}
              name="professionOther"
              required
              placeholder={t.paso2.otraProfesion.ejemplo}
              value={form.professionOther}
              error={errors.professionOther}
              onChange={(v) => update('professionOther', v)}
            />
          )}

          <div>
            <label className="field__label">
              {t.paso2.tarjeta.etiqueta} <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
              {TARJETA.map((tarjeta) => {
                const activa = form.professionalCard === tarjeta
                return (
                  <button
                    key={tarjeta}
                    type="button"
                    onClick={() => update('professionalCard', tarjeta)}
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
                    {activa ? '✓ ' : ''}{t.paso2.tarjeta.opciones[tarjeta]}
                  </button>
                )
              })}
            </div>
            {errors.professionalCard && <p className="field__error">{errors.professionalCard}</p>}
          </div>

          <div>
            <label className="field__label">
              {t.paso2.poblaciones.etiqueta} <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 8px' }}>
              {t.paso2.poblaciones.pista}
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
                    {t.paso2.poblaciones.opciones[pob]}
                  </button>
                )
              })}
            </div>
            {errors.populations && <p className="field__error" style={{ marginTop: 6 }}>{errors.populations}</p>}
          </div>

          {marcoOtra && (
            <TextField
              label={t.paso2.otraPoblacion}
              name="populationOther"
              required
              value={form.populationOther}
              error={errors.populationOther}
              onChange={(v) => update('populationOther', v)}
            />
          )}

          <div>
            <RadioField
              label={t.paso2.crisis.etiqueta}
              required
              options={EXPERIENCIA_CRISIS.map((value) => ({
                value,
                label: t.paso2.crisis.opciones[value],
              }))}
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
              {t.paso2.volver}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => irAlPaso(3)}
              icon={<ChevronRight size={16} />}
            >
              {t.paso2.continuar}
            </Button>
          </div>
        </div>
      )}

      {paso === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
              {t.paso3.titulo}
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
              {t.paso3.bajada}
            </p>
          </div>

          <div>
            <label className="field__label">
              {t.paso3.modalidad.etiqueta} <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              {MODALIDAD.map((m) => {
                const activa = form.modality === m.value
                const textos = t.paso3.modalidad.opciones[m.value]
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
                      <span style={{ fontSize: '1rem', fontWeight: 700 }}>{m.icon} {textos.nombre}</span>
                      {activa && <span style={{ color: '#059669', fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{textos.detalle}</span>
                  </button>
                )
              })}
            </div>
            {errors.modality && <p className="field__error">{errors.modality}</p>}
          </div>

          {vaPresencial && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <TextField
                label={t.paso3.desplazamiento.etiqueta}
                name="availableToTravel"
                hint={t.paso3.desplazamiento.pista}
                placeholder={t.paso3.desplazamiento.ejemplo}
                value={form.availableToTravel}
                error={errors.availableToTravel}
                onChange={(v) => update('availableToTravel', v)}
              />

              <RadioField
                label={t.paso3.fiebre.etiqueta}
                required
                hint={t.paso3.fiebre.pista}
                options={FIEBRE_AMARILLA.map((value) => ({
                  value,
                  label: t.paso3.fiebre.opciones[value],
                }))}
                value={form.yellowFeverVaccine}
                error={errors.yellowFeverVaccine}
                onChange={(v) => update('yellowFeverVaccine', v)}
              />
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="field__label" style={{ margin: 0 }}>
                {t.paso3.dias.etiqueta} <span style={{ color: '#dc2626' }}>*</span>
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
                {form.availableDays.length === DIAS.length ? t.paso3.dias.ninguno : t.paso3.dias.todos}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {DIAS.map((d) => {
                const activo = form.availableDays.includes(d)
                const textos = t.paso3.dias.opciones[d]
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => alternarDia(d)}
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
                    title={textos.nombre}
                  >
                    {textos.corto}
                  </button>
                )
              })}
            </div>
            {errors.availableDays && <p className="field__error" style={{ marginTop: 6 }}>{errors.availableDays}</p>}
          </div>

          <div>
            <label className="field__label">
              {t.paso3.franjas.etiqueta} <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
              {FRANJAS.map((f) => {
                const activa = form.availableSlots.includes(f.value)
                const textos = t.paso3.franjas.opciones[f.value]
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
                      <span>{textos.nombre}</span>
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
                      {textos.horario}
                    </div>
                  </button>
                )
              })}
            </div>
            {errors.availableSlots && <p className="field__error" style={{ marginTop: 6 }}>{errors.availableSlots}</p>}
          </div>

          <div>
            <label className="field__label">
              {t.paso3.horas.etiqueta} <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
              {HORAS_SEMANA.map((hs) => {
                const activa = form.weeklyHours === hs
                const textos = t.paso3.horas.opciones[hs]
                return (
                  <button
                    key={hs}
                    type="button"
                    onClick={() => update('weeklyHours', hs)}
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
                    <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{textos.nombre}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{textos.detalle}</div>
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
                    {t.paso3.documentos.titulo}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {form.professionalCardDocumentUrl || form.identityDocumentUrl
                      ? t.paso3.documentos.elegidos
                      : t.paso3.documentos.despues}
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
                  {/*
                    Las frases con formato llevan `nuevaPestana` por ir dentro
                    del formulario: si una traducción les pone un enlace del
                    sitio, seguirlo no debe borrar lo que la persona ya escribió.
                  */}
                  <TextoRico texto={t.paso3.documentos.confidencialidad} idioma={idioma} nuevaPestana />
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
                        {t.paso3.documentos.porWhatsappTitulo}
                      </strong>
                      <TextoRico
                        texto={rellenar(t.paso3.documentos.porWhatsappTexto, {
                          numero: whatsapp,
                          enlace: whatsappHref,
                        })}
                        idioma={idioma}
                        claseEnlace="form__enlace form__enlace--fuerte"
                        nuevaPestana
                      />
                    </div>
                  </div>
                ) : uploadDisponible === 'pendiente' ? (
                  <p style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center', padding: '10px 0' }}>
                    {t.paso3.documentos.verificando}
                  </p>
                ) : (
                  <>
                    {docError && (
                      <p style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: 10 }}>{docError}</p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                      <CampoArchivoVoluntario
                        etiqueta={t.paso3.documentos.tarjeta.etiqueta}
                        ayuda={t.paso3.documentos.tarjeta.pista}
                        clave={form.professionalCardDocumentUrl || null}
                        nombre={nombresDeArchivo.professionalCardDocumentUrl ?? null}
                        onArchivo={alAdjuntar('professionalCardDocumentUrl')}
                        onError={setDocError}
                        opcional
                        t={t.paso3.documentos.archivo}
                        comun={comun}
                      />

                      <TextField
                        label={t.paso3.documentos.numeroTarjeta.etiqueta}
                        name="professionalCardNumber"
                        hint={t.paso3.documentos.numeroTarjeta.pista}
                        placeholder={t.paso3.documentos.numeroTarjeta.ejemplo}
                        value={form.professionalCardNumber}
                        onChange={(v) => update('professionalCardNumber', v)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 10 }}>
                      <CampoArchivoVoluntario
                        etiqueta={t.paso3.documentos.cedulaFrente.etiqueta}
                        ayuda={t.paso3.documentos.cedulaFrente.pista}
                        clave={form.identityDocumentUrl || null}
                        nombre={nombresDeArchivo.identityDocumentUrl ?? null}
                        onArchivo={alAdjuntar('identityDocumentUrl')}
                        onError={setDocError}
                        opcional
                        t={t.paso3.documentos.archivo}
                        comun={comun}
                      />

                      <CampoArchivoVoluntario
                        etiqueta={t.paso3.documentos.cedulaRespaldo.etiqueta}
                        ayuda={t.paso3.documentos.cedulaRespaldo.pista}
                        clave={form.identityDocumentBackUrl || null}
                        nombre={nombresDeArchivo.identityDocumentBackUrl ?? null}
                        onArchivo={alAdjuntar('identityDocumentBackUrl')}
                        onError={setDocError}
                        opcional
                        t={t.paso3.documentos.archivo}
                        comun={comun}
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
              <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{t.paso3.autorizaciones.titulo}</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, margin: '0 0 12px' }}>
              {comun.avisoTratamiento.profesionales}{' '}
              {rellenar(t.paso3.autorizaciones.retencion, { anos: anosDeRetencion })}{' '}
              <a
                className="form__enlace"
                href={ruta(idioma, '/politica-de-datos')}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.paso3.autorizaciones.politica}
              </a>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ConsentField
                label={comun.casillas.datos}
                checked={form.dataConsent}
                error={errors.dataConsent}
                onChange={(c) => update('dataConsent', c)}
              />
              {vaPresencial ? (
                <ConsentField
                  label={comun.casillas.sensiblesProfesional}
                  checked={form.sensitiveDataConsent}
                  error={errors.sensitiveDataConsent}
                  onChange={(c) => update('sensitiveDataConsent', c)}
                />
              ) : null}
              <ConsentField
                label={comun.casillas.comunicaciones}
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
                {t.paso3.volver}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                icon={<Send size={16} />}
                style={{ backgroundColor: '#059669', color: '#ffffff' }}
              >
                {submitting ? t.paso3.enviando : t.paso3.enviar}
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
