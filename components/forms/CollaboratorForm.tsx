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
import { ConHueco } from '@/components/sitio/ConHueco'
import { ConsentField, RadioField, TextArea, TextField } from './fields'
import { MunicipioSelector } from './MunicipioSelector'
import { FormStatus, type Status } from './FormStatus'
import { pasoConError, rechazoDelServidor } from './rechazo'
import { HUECO_PARA_LA_BARRA, usePasoALaVista } from './pasoALaVista'
import { telefonoValido } from '@/lib/telefono'
import { nombreDePila, nombreValido } from '@/lib/nombre'
import { VERSION_CONSENTIMIENTO } from '@/lib/consentimiento'
import { rellenar, type Idioma } from '@/lib/i18n/idiomas'
import type { Diccionario } from '@/lib/i18n/diccionarios/es'

type Textos = Diccionario['formularios']['apoyo']
type Comun = Diccionario['formularios']['comun']

/**
 * Las listas de opciones. Aquí queda solo lo que NO cambia con el idioma: el
 * valor que se envía, que es el que valida el backend, y el icono de cada
 * área. La etiqueta se lee del diccionario con ese valor como clave, de modo
 * que un valor al que le falte la etiqueta no compila.
 */
const AREAS = [
  { value: 'SALUD', icono: '🩺' },
  { value: 'SOCIAL_LEGAL_EDUCATIVO', icono: '⚖️' },
  { value: 'OPERACION_LOGISTICA', icono: '📦' },
  { value: 'COMUNICACION_TECNOLOGIA', icono: '💻' },
  { value: 'GESTION_PROYECTOS', icono: '📊' },
  { value: 'OTRA', icono: '✨' },
] as const

/**
 * Las disciplinas no tienen código: lo que se guarda es su nombre en español,
 * también cuando el formulario se llena en inglés o en portugués, y ese mismo
 * nombre es la clave de su etiqueta en el diccionario. Lo que se envía y lo
 * que se compara (`=== 'Otra'`) es siempre este valor, nunca la traducción.
 */
type Disciplina = keyof Textos['disciplina']['opciones']

const DISCIPLINAS: Record<string, readonly Disciplina[]> = {
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

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'] as const

const FRANJAS = ['MANANA', 'TARDE', 'NOCHE'] as const

const ANOS_EXPERIENCIA = ['MENOS_DE_1', 'ENTRE_1_Y_3', 'ENTRE_3_Y_5', 'MAS_DE_5'] as const

const HORAS_SEMANA = ['ENTRE_1_Y_3', 'ENTRE_4_Y_6', 'MAS_DE_6', 'VARIABLE'] as const

const MODALIDAD = ['PRESENCIAL', 'VIRTUAL', 'AMBAS'] as const

const TARJETA = ['SI', 'EN_TRAMITE', 'ESTUDIANTE'] as const

const FIEBRE_AMARILLA = ['SI', 'NO', 'CITA_AGENDADA'] as const

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
  area: 2,
  discipline: 2,
  disciplineOther: 2,
  yearsExperience: 2,
  professionalCard: 2,
  skills: 2,
}

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

/**
 * «Quiero ser voluntario general».
 *
 * Los textos llegan por props, ya en el idioma de la página: `t` es lo propio
 * de este formulario y `comun`, lo que comparte con los otros dos. No se
 * importa el diccionario desde aquí porque este es un componente de cliente:
 * los tres idiomas enteros viajarían al navegador.
 */
export function CollaboratorForm({
  idioma,
  t,
  comun,
  anosDeRetencion,
}: {
  idioma: Idioma
  t: Textos
  comun: Comun
  anosDeRetencion: number
}) {
  const [paso, setPaso] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completado, setCompletado] = useState(false)
  const { ancla, alInicio, alError } = usePasoALaVista()

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
    if (!nombreValido(form.fullName)) found.fullName = comun.nombreSoloLetras
    if (!telefonoValido(form.phone)) found.phone = comun.telefono.error
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) found.email = t.errores.email
    if (!form.city.trim()) found.city = t.errores.city

    setErrors(found)
    return Object.keys(found).length === 0
  }

  function validarPaso2(): boolean {
    const found: Record<string, string> = {}
    if (!form.area) found.area = t.errores.area
    if (!form.discipline) found.discipline = t.errores.discipline
    if (marcoOtraDisciplina && !form.disciplineOther.trim()) {
      found.disciplineOther = t.errores.disciplineOther
    }

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

  function irAlPaso2() {
    if (validarPaso1()) {
      setPaso(2)
      alInicio()
    }
  }

  function irAlPaso3() {
    if (validarPaso2()) {
      setPaso(3)
      alInicio()
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus(null)

    if (!validarPaso3()) {
      setStatus({ type: 'error', message: t.errores.incompleto })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/collaborators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, consentVersion: VERSION_CONSENTIMIENTO, locale: idioma }),
      })
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        const rechazo = rechazoDelServidor(comun, payload, t.errores.envio)
        if (payload.details) setErrors(rechazo.campos)
        setStatus({ type: 'error', message: rechazo.mensaje })

        // Lo rechazado puede estar en un paso que ya no se ve: se vuelve a él.
        const paso = pasoConError(rechazo.campos, PASO_DE_CADA_CAMPO)
        if (paso !== null) {
          setPaso(paso)
          alError()
        }
        return
      }

      setCompletado(true)
      alInicio()
    } catch {
      setStatus({ type: 'error', message: comun.errorConexion })
    } finally {
      setSubmitting(false)
    }
  }

  if (completado) {
    const nombrePersona = nombreDePila(form.fullName) || form.fullName.trim() || t.exito.sinNombre

    return (
      <div
        ref={ancla}
        style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          padding: '36px 28px',
          textAlign: 'center',
          maxWidth: 640,
          margin: '0 auto',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          scrollMarginTop: HUECO_PARA_LA_BARRA,
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
          {rellenar(t.exito.titulo, { nombre: nombrePersona })}
        </h2>

        <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.6, marginBottom: 24 }}>
          <ConHueco frase={t.exito.texto} hueco="telefono">
            <strong>{form.phone}</strong>
          </ConHueco>
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
            {t.exito.otro}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div ref={ancla} style={{ maxWidth: 680, margin: '0 auto', scrollMarginTop: HUECO_PARA_LA_BARRA }}>
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
              {rellenar(comun.pasoDe, { paso })}
            </span>
            <strong style={{ display: 'block', fontSize: '0.92rem', color: '#1e293b' }}>
              {t.pasos[paso - 1]}
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
              label={t.nombre.etiqueta}
              name="fullName"
              required
              autoComplete="name"
              placeholder={t.nombre.ejemplo}
              value={form.fullName}
              error={errors.fullName}
              onChange={(v) => update('fullName', v)}
            />

            <TextField
              label={t.celular.etiqueta}
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              hint={comun.telefono.pista}
              placeholder={t.celular.ejemplo}
              value={form.phone}
              error={errors.phone}
              onChange={(v) => update('phone', v)}
            />

            <TextField
              label={t.correo.etiqueta}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={t.correo.ejemplo}
              value={form.email}
              error={errors.email}
              onChange={(v) => update('email', v)}
            />

            <MunicipioSelector
              label={t.ciudad.etiqueta}
              name="city"
              required
              placeholder={t.ciudad.ejemplo}
              hint={t.ciudad.pista}
              textos={comun.municipio}
              value={form.city}
              error={errors.city}
              onChange={(v) => update('city', v)}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <Button type="button" variant="primary" onClick={irAlPaso2} icon={<ArrowRight size={16} />}>
                {t.siguiente1}
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
                {t.area.etiqueta}
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
                      <span>{t.area.opciones[area.value]}</span>
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
                  {t.disciplina.etiqueta}
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
                        {t.disciplina.opciones[d]}
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
                label={form.area === 'OTRA' ? t.otraDisciplina.siOtraArea : t.otraDisciplina.siOtraDisciplina}
                name="disciplineOther"
                required
                placeholder={t.otraDisciplina.ejemplo}
                value={form.disciplineOther}
                error={errors.disciplineOther}
                onChange={(v) => update('disciplineOther', v)}
              />
            )}

            <RadioField
              label={t.anos.etiqueta}
              options={ANOS_EXPERIENCIA.map((value) => ({ value, label: t.anos.opciones[value] }))}
              value={form.yearsExperience}
              error={errors.yearsExperience}
              onChange={(v) => update('yearsExperience', v)}
            />

            <RadioField
              label={t.tarjeta.etiqueta}
              hint={t.tarjeta.pista}
              options={TARJETA.map((value) => ({ value, label: t.tarjeta.opciones[value] }))}
              value={form.professionalCard}
              error={errors.professionalCard}
              onChange={(v) => update('professionalCard', v)}
            />

            <TextArea
              label={t.habilidades.etiqueta}
              name="skills"
              hint={t.habilidades.pista}
              value={form.skills}
              error={errors.skills}
              onChange={(v) => update('skills', v)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <Button type="button" variant="default" onClick={() => setPaso(1)} icon={<ArrowLeft size={16} />}>
                {comun.atras}
              </Button>
              <Button type="button" variant="primary" onClick={irAlPaso3} icon={<ArrowRight size={16} />}>
                {t.siguiente2}
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
              label={t.modalidad.etiqueta}
              required
              options={MODALIDAD.map((value) => ({ value, label: t.modalidad.opciones[value] }))}
              value={form.modality}
              error={errors.modality}
              onChange={(v) => update('modality', v)}
            />

            {vaPresencial && (
              <TextField
                label={t.desplazamiento.etiqueta}
                name="availableToTravel"
                hint={t.desplazamiento.pista}
                value={form.availableToTravel}
                error={errors.availableToTravel}
                onChange={(v) => update('availableToTravel', v)}
              />
            )}

            {/* Selector de Días con Chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
                {t.dias.etiqueta}
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DIAS.map((dia) => {
                  const marcado = form.availableDays.includes(dia)
                  return (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => toggleOption('availableDays', dia)}
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
                      {t.dias.opciones[dia]}
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
                {t.franjas.etiqueta}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                {FRANJAS.map((franja) => {
                  const marcado = form.availableSlots.includes(franja)
                  return (
                    <button
                      key={franja}
                      type="button"
                      onClick={() => toggleOption('availableSlots', franja)}
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
                      {t.franjas.opciones[franja]}
                    </button>
                  )
                })}
              </div>
              {errors.availableSlots && (
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>{errors.availableSlots}</span>
              )}
            </div>

            <RadioField
              label={t.horas.etiqueta}
              required
              options={HORAS_SEMANA.map((value) => ({ value, label: t.horas.opciones[value] }))}
              value={form.weeklyHours}
              error={errors.weeklyHours}
              onChange={(v) => update('weeklyHours', v)}
            />

            {vaPresencial && (
              <RadioField
                label={t.fiebre.etiqueta}
                required
                hint={t.fiebre.pista}
                options={FIEBRE_AMARILLA.map((value) => ({ value, label: t.fiebre.opciones[value] }))}
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
                  {t.autorizaciones.titulo}
                </strong>
              </div>

              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                {comun.avisoTratamiento.apoyo}{' '}
                {rellenar(t.autorizaciones.retencion, { anos: anosDeRetencion })}{' '}
                {comun.avisoDerechos}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                <ConsentField
                  label={comun.casillas.datos}
                  checked={form.dataConsent}
                  error={errors.dataConsent}
                  onChange={(c) => update('dataConsent', c)}
                />
                {vaPresencial && (
                  <ConsentField
                    label={comun.casillas.sensiblesProfesional}
                    checked={form.sensitiveDataConsent}
                    error={errors.sensitiveDataConsent}
                    onChange={(c) => update('sensitiveDataConsent', c)}
                  />
                )}
                <ConsentField
                  label={comun.casillas.comunicaciones}
                  checked={form.communicationsConsent}
                  onChange={(c) => update('communicationsConsent', c)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 12 }}>
              <Button type="button" variant="default" onClick={() => setPaso(2)} icon={<ArrowLeft size={16} />}>
                {comun.atras}
              </Button>

              <Button type="submit" variant="primary" disabled={submitting} icon={<Send size={16} />}>
                {submitting ? t.enviando : t.enviar}
              </Button>
            </div>

            {status && <FormStatus status={status} />}
          </div>
        )}
      </form>
    </div>
  )
}
