'use client'

import { useState } from 'react'
import {
  Send,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextoRico } from '@/components/sitio/TextoRico'
import { ConHueco } from '@/components/sitio/ConHueco'
import { ConsentField, RadioField, TextField } from './fields'
import { MunicipioSelector } from './MunicipioSelector'
import { FormStatus, type Status } from './FormStatus'
import { pasoConError, rechazoDelServidor } from './rechazo'
import { HUECO_PARA_LA_BARRA, usePasoALaVista } from './pasoALaVista'
import { VERSION_CONSENTIMIENTO } from '@/lib/consentimiento'
import { nombreDePila } from '@/lib/nombre'
import type { Diccionario } from '@/lib/i18n/diccionarios/es'
import { rellenar, type Idioma } from '@/lib/i18n/idiomas'

type Textos = Diccionario['formularios']['atencion']
type Comun = Diccionario['formularios']['comun']

/**
 * Los valores de cada pregunta, en el orden en que se ofrecen. Son los que
 * valida el backend y no se traducen. La etiqueta de cada uno sale del
 * diccionario, que tiene una clave por valor: uno que se añada aquí sin su
 * etiqueta no compila.
 */
const PARA_QUIEN = ['PARA_MI', 'PARA_OTRA_PERSONA'] as const
const ES_MENOR = ['NO', 'SI'] as const
const CANAL = ['WHATSAPP', 'LLAMADA', 'CORREO'] as const
const MODALIDAD_PREFERIDA = ['VIRTUAL', 'PRESENCIAL', 'INDIFERENTE'] as const
const URGENCIA = ['HOY', 'ESTA_SEMANA', 'PUEDO_ESPERAR'] as const

/**
 * Los cinco niveles de malestar y sus colores. La etiqueta y el detalle salen
 * de `malestar.niveles`, que los trae en este mismo orden.
 */
const NIVELES_MALESTAR = [
  { valor: 1, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  { valor: 2, color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
  { valor: 3, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { valor: 4, color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  { valor: 5, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
]

/**
 * En qué paso se pregunta cada cosa de los dos primeros. El formulario se
 * envía desde el tercero: si el servidor rechaza algo de antes, hay que volver
 * allí para que la persona vea qué campo es (ver `pasoConError`).
 */
const PASO_DE_CADA_CAMPO: Record<string, 1 | 2> = {
  forWhom: 1,
  isMinor: 1,
  relationship: 1,
  contactName: 1,
  name: 1,
  phone: 1,
  email: 1,
  preferredContact: 1,
  city: 1,
  distress: 2,
  selfHarmThoughts: 2,
  howSoon: 2,
  safePlace: 2,
}

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
  howSoon: '' as '' | 'HOY' | 'ESTA_SEMANA' | 'PUEDO_ESPERAR' | 'PROXIMOS_DIAS',
  safePlace: null as boolean | null,

  // Paso 3: Modalidad y Consentimiento
  preferredModality: '',
  message: '',
  dataConsent: false,
  sensitiveDataConsent: false,
  guardianConsent: false,
  communicationsConsent: false,
}

/**
 * «Necesito ayuda»: la solicitud de acompañamiento, en tres pasos.
 *
 * Aquí no hay ni una frase escrita: todas llegan por props, en el idioma de la
 * página (`t` es lo de este formulario; `comun`, lo que comparte con los otros
 * dos). El diccionario no se importa —solo su tipo— porque este componente es
 * de cliente y arrastraría los tres idiomas al navegador.
 *
 * Las frases con formato que van dentro del formulario llevan `nuevaPestana`,
 * tengan hoy enlace o no: uno que se siguiera en la misma pestaña borraría lo
 * que la persona lleva escrito.
 */
export function SupportRequestForm({ idioma, t, comun }: { idioma: Idioma; t: Textos; comun: Comun }) {
  const [paso, setPaso] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completado, setCompletado] = useState(false)
  const { ancla, alInicio, alError } = usePasoALaVista()

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
    if (!form.forWhom) found.forWhom = t.errores.forWhom
    if (paraOtra && !form.isMinor) found.isMinor = t.errores.isMinor
    if (paraOtra && !form.contactName.trim()) found.contactName = t.errores.contactName
    if (!form.name.trim()) found.name = t.errores.name
    if (!form.phone.trim()) found.phone = t.errores.phone
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) found.email = t.errores.emailInvalido
    if (porCorreo && !form.email.trim()) found.email = t.errores.emailFalta
    if (!form.preferredContact) found.preferredContact = t.errores.preferredContact
    if (!form.city.trim()) found.city = t.errores.city

    setErrors(found)
    return Object.keys(found).length === 0
  }

  function validarPaso2(): boolean {
    const found: Record<string, string> = {}
    if (form.distress === null) found.distress = t.errores.distress
    if (form.selfHarmThoughts === null) found.selfHarmThoughts = t.errores.selfHarmThoughts
    if (!form.howSoon) found.howSoon = t.errores.howSoon
    if (form.safePlace === null) found.safePlace = t.errores.safePlace

    setErrors(found)
    return Object.keys(found).length === 0
  }

  function validarPaso3(): boolean {
    const found: Record<string, string> = {}
    if (!form.preferredModality) found.preferredModality = t.errores.preferredModality
    if (!form.dataConsent) found.dataConsent = t.errores.dataConsent
    // `sensitiveDataConsent` va pegado a `dataConsent` desde que son una sola
    // casilla: no puede faltar por su cuenta.
    if (esMenor && !form.guardianConsent) {
      found.guardianConsent = t.errores.guardianConsent
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
      const response = await fetch('/api/support-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          isMinor: paraOtra ? form.isMinor === 'SI' : null,
          consentVersion: VERSION_CONSENTIMIENTO,
          locale: idioma,
        }),
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
    const nombrePersona = nombreDePila(form.name) || form.name.trim() || t.exito.sinNombre
    const esPrioridadAlta = form.selfHarmThoughts === true || form.distress === 5 || form.howSoon === 'HOY'

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
                  {t.exito.prioridadTitulo}
                </strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#78350f', lineHeight: 1.5 }}>
                  <TextoRico texto={t.exito.prioridadTexto} idioma={idioma} />
                </p>
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
            {t.exito.volver}
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
            <RadioField
              label={t.paraQuien.etiqueta}
              required
              options={PARA_QUIEN.map((value) => ({ value, label: t.paraQuien.opciones[value] }))}
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
                  label={t.esMenor.etiqueta}
                  required
                  options={ES_MENOR.map((value) => ({ value, label: t.esMenor.opciones[value] }))}
                  value={form.isMinor}
                  error={errors.isMinor}
                  onChange={(v) => update('isMinor', v)}
                />
                <TextField
                  label={t.tuNombre.etiqueta}
                  name="contactName"
                  required
                  hint={t.tuNombre.pista}
                  value={form.contactName}
                  error={errors.contactName}
                  onChange={(v) => update('contactName', v)}
                />
                <TextField
                  label={t.relacion.etiqueta}
                  name="relationship"
                  hint={t.relacion.pista}
                  value={form.relationship}
                  error={errors.relationship}
                  onChange={(v) => update('relationship', v)}
                />
              </div>
            )}

            <TextField
              label={paraOtra ? t.nombreOtra : t.nombre}
              name="name"
              required
              autoComplete={paraOtra ? 'off' : 'name'}
              value={form.name}
              error={errors.name}
              onChange={(v) => update('name', v)}
            />

            <TextField
              label={t.celular.etiqueta}
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              hint={t.celular.pista}
              value={form.phone}
              error={errors.phone}
              onChange={(v) => update('phone', v)}
            />

            <TextField
              label={t.correo.etiqueta}
              name="email"
              type="email"
              autoComplete="email"
              hint={t.correo.pista}
              value={form.email}
              error={errors.email}
              onChange={(v) => update('email', v)}
            />

            <RadioField
              label={t.canal.etiqueta}
              required
              options={CANAL.map((value) => ({ value, label: t.canal.opciones[value] }))}
              value={form.preferredContact}
              error={errors.preferredContact}
              onChange={(v) => update('preferredContact', v)}
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
                <TextoRico texto={t.intro2} idioma={idioma} nuevaPestana />
              </p>
            </div>

            {/* Pregunta 1: Malestar 1 al 5 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
                {t.malestar.etiqueta}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
                {NIVELES_MALESTAR.map((item, i) => {
                  const seleccionado = form.distress === item.valor
                  const nivel = t.malestar.niveles[i]
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
                        {nivel.etiqueta}
                      </strong>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                        {nivel.detalle}
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
                {t.dano.etiqueta}
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
                  {t.dano.no}
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
                  {t.dano.si}
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
                      <strong>{t.dano.contencionTitulo}</strong>
                      <p style={{ margin: '4px 0 0' }}>
                        <TextoRico texto={t.dano.contencionTexto} idioma={idioma} nuevaPestana />
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pregunta 3: Urgencia / Qué tan pronto */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
                {t.urgencia.etiqueta}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                {URGENCIA.map((id) => {
                  const seleccionado = form.howSoon === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => update('howSoon', id)}
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
                      {t.urgencia.opciones[id]}
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
                {t.seguro.etiqueta}
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
                  {t.seguro.si}
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
                  {t.seguro.no}
                </button>
              </div>
              {errors.safePlace && (
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>{errors.safePlace}</span>
              )}
            </div>

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
        {/* PASO 3: MODALIDAD, DETALLES Y AUTORIZACIONES                               */}
        {/* ========================================================================= */}
        {paso === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <RadioField
              label={t.modalidad.etiqueta}
              required
              options={MODALIDAD_PREFERIDA.map((value) => ({ value, label: t.modalidad.opciones[value] }))}
              value={form.preferredModality}
              error={errors.preferredModality}
              onChange={(v) => update('preferredModality', v)}
            />

            <TextField
              label={t.mensaje.etiqueta}
              name="message"
              hint={t.mensaje.pista}
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
                  {t.datosTitulo}
                </strong>
              </div>

              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45 }}>
                <TextoRico
                  texto={t.datosTexto}
                  idioma={idioma}
                  claseEnlace="form__enlace"
                  nuevaPestana
                />
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {/*
                  Una sola casilla, no dos.
                
                  Eran una para los datos y otra para el dato de salud, y las dos pedían la
                  misma decisión. Se las estábamos pidiendo a alguien que escribe porque
                  está mal. Se guardan los dos campos —el registro no pierde nada— pero se
                  decide una vez.
                */}
                <ConsentField
                  label={comun.casillas.atencion}
                  checked={form.dataConsent}
                  error={errors.dataConsent}
                  onChange={(c) => {
                    update('dataConsent', c)
                    update('sensitiveDataConsent', c)
                  }}
                />
                {esMenor && (
                  <ConsentField
                    label={comun.casillas.representante}
                    checked={form.guardianConsent}
                    error={errors.guardianConsent}
                    onChange={(c) => update('guardianConsent', c)}
                  />
                )}
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
