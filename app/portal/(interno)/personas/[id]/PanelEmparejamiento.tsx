'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { soloHora, diaLargo } from '@/lib/fechas'
import {
  Briefcase,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Users,
  MapPin,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react'

type Candidato = {
  id: string
  fullName: string
  city: string
  profession: string
  yearsExperience?: string | null
  populations?: string[]
  professionalCardVerified?: boolean
  professionalCardNumber?: string | null
  modality: string
  phone?: string
  email?: string
  carga: number
  cupo: number
  sinCupo: boolean
  huecosLibres: number
  huecosQueLeSirven: number
  primerHueco: { inicio: string; fin: string; modalidad?: string } | null
  puntos: number
  razones: string[]
}

const EXPERIENCIA_LABEL: Record<string, string> = {
  MAS_DE_5: '+5 años de experiencia',
  ENTRE_3_Y_5: '3 a 5 años de experiencia',
  ENTRE_1_Y_3: '1 a 3 años de experiencia',
  MENOS_DE_1: '< 1 año de experiencia',
}

const LIMITE_TOP = 10

/**
 * Panel de Emparejamiento: Muestra los 10 mejores profesionales ordenados
 * por encaje clínico (años de experiencia, modalidad, disponibilidad y cercanía).
 */
export function PanelEmparejamiento({ personaId }: { personaId: string }) {
  const router = useRouter()
  const [candidatos, setCandidatos] = useState<Candidato[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [asignando, setAsignando] = useState<string | null>(null)
  const [mostrarMas, setMostrarMas] = useState(false)

  useEffect(() => {
    let vigente = true
    fetch(`/api/portal/patients/${personaId}/candidatos`)
      .then((r) => r.json())
      .then((datos) => {
        if (!vigente) return
        if (!datos.success) {
          setError(datos.message ?? 'No pudimos buscar candidatos')
          setCandidatos([])
          return
        }
        setCandidatos(datos.data.candidatos)
      })
      .catch(() => {
        if (vigente) setError('No pudimos conectarnos con el servidor')
      })
    return () => {
      vigente = false
    }
  }, [personaId])

  async function asignar(profesionalId: string) {
    setAsignando(profesionalId)
    setError(null)
    try {
      const respuesta = await fetch('/api/portal/appointments/asignar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professionalId: profesionalId, patientId: personaId }),
      })
      const datos = await respuesta.json()

      if (!respuesta.ok || !datos.success) {
        setError(datos.message ?? 'No se pudo asignar')
        return
      }
      router.refresh()
    } catch {
      setError('No pudimos conectarnos con el servidor')
    } finally {
      setAsignando(null)
    }
  }

  const listaAMostrar = candidatos
    ? mostrarMas
      ? candidatos
      : candidatos.slice(0, LIMITE_TOP)
    : []

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h2 style={{ margin: 0 }}>¿Quién puede acompañarla?</h2>
        {candidatos && candidatos.length > 0 && (
          <span className="tabla__secundario" style={{ fontSize: '0.82rem' }}>
            Mostrando <strong>{Math.min(listaAMostrar.length, LIMITE_TOP)}</strong> de {candidatos.length} disponibles
          </span>
        )}
      </div>
      <p className="panel__nota" style={{ marginTop: 0, marginBottom: 16 }}>
        Top 10 ordenado por trayectoria clínica (+5 años primero), modalidad solicitada y disponibilidad. Proponer no asigna: le manda la propuesta y él decide desde su enlace.
      </p>

      {error ? (
        <div className="aviso-portal" data-tono="rojo">
          {error}
        </div>
      ) : null}

      {candidatos === null ? (
        <p className="vacio">Evaluando profesionales y disponibilidad…</p>
      ) : candidatos.length === 0 ? (
        <p className="vacio">
          Ningún profesional activo coincide con los criterios de modalidad. Revisa que haya profesionales activos con
          franjas de disponibilidad cargadas.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {listaAMostrar.map((c, index) => (
            <div
              className="candidato"
              key={c.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '14px 16px',
                borderRadius: 10,
                border: index === 0 ? '2px solid #059669' : '1px solid var(--color-border-default, #e2e8f0)',
                background: index === 0 ? '#f0fdf4' : 'var(--color-bg-subtle, #f8fafc)',
                gap: 16,
              }}
            >
              <div style={{ flex: 1 }}>
                {/* Cabecera del Candidato con Número de Ranking */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: index === 0 ? '#059669' : '#e2e8f0',
                      color: index === 0 ? '#fff' : '#475569',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                    }}
                  >
                    #{index + 1}
                  </span>

                  <span style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-text-default, #0f172a)' }}>
                    {c.fullName}
                  </span>

                  {index === 0 && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: '#059669',
                        color: '#fff',
                        padding: '1px 6px',
                        borderRadius: 4,
                      }}
                    >
                      <Sparkles size={11} /> Mejor coincidencia
                    </span>
                  )}

                  {/* Estado de TP */}
                  {c.professionalCardVerified ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        color: '#059669',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: '#dcfce7',
                        padding: '1px 6px',
                        borderRadius: 4,
                        border: '1px solid #86efac',
                      }}
                      title="Tarjeta Profesional / Documentación verificada"
                    >
                      <ShieldCheck size={12} /> TP Verificada
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        color: '#dc2626',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: '#fee2e2',
                        padding: '1px 6px',
                        borderRadius: 4,
                        border: '1px solid #fca5a5',
                      }}
                      title="Tarjeta Profesional pendiente de verificación"
                    >
                      <ShieldAlert size={12} /> Pendiente TP
                    </span>
                  )}
                </div>

                {/* Profesión, Ciudad y Experiencia */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'wrap',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-secondary, #475569)',
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#334155' }}>{c.profession}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <MapPin size={12} /> {c.city}
                  </span>
                  <span style={{ textTransform: 'capitalize' }}>
                    Modalidad: <strong>{c.modality.toLowerCase()}</strong>
                  </span>
                  {c.yearsExperience && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        color: '#0369a1',
                        background: '#e0f2fe',
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontWeight: 600,
                        fontSize: '0.76rem',
                      }}
                    >
                      <Briefcase size={11} />
                      {EXPERIENCIA_LABEL[c.yearsExperience] ?? c.yearsExperience}
                    </span>
                  )}
                </div>

                {/* Poblaciones que atiende */}
                {c.populations && c.populations.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span className="tabla__secundario" style={{ fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Users size={11} /> Poblaciones:
                    </span>
                    {c.populations.map((pob) => (
                      <span
                        key={pob}
                        style={{
                          fontSize: '0.72rem',
                          background: '#f1f5f9',
                          color: '#334155',
                          padding: '1px 5px',
                          borderRadius: 3,
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {pob}
                      </span>
                    ))}
                  </div>
                )}

                {/* Razones de coincidencia */}
                <div className="candidato__razones" style={{ marginBottom: 4 }}>
                  {c.razones.map((razon) => (
                    <span className="candidato__razon" key={razon}>
                      ✓ {razon}
                    </span>
                  ))}
                </div>

                {/* Primer hueco disponible */}
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 4 }}>
                  {c.primerHueco ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#047857', fontWeight: 600 }}>
                      <Calendar size={12} /> Primer hueco: {diaLargo(c.primerHueco.inicio)} a las {soloHora(c.primerHueco.inicio)}
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#64748b' }}>
                      <Clock size={12} /> Sin huecos libres en las próximas 2 semanas
                    </span>
                  )}
                </div>

                {/* Barra de Encaje */}
                <div className="candidato__barra" style={{ marginTop: 6 }}>
                  <span style={{ width: `${Math.min(100, c.puntos)}%` }} />
                </div>
              </div>

              {/* Botón de Asignación y Carga */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                <span className="tabla__secundario" style={{ fontSize: '0.76rem', textAlign: 'right' }}>
                  Carga: <strong>{c.carga}</strong> / {c.cupo} casos
                </span>
                <button
                  className="boton-mini"
                  data-tono="principal"
                  disabled={c.sinCupo || asignando !== null}
                  onClick={() => asignar(c.id)}
                  style={{ minWidth: 85, padding: '5px 10px', fontSize: '0.82rem' }}
                >
                  {asignando === c.id ? 'Proponiendo…' : c.sinCupo ? 'Sin cupo' : 'Proponer'}
                </button>
              </div>
            </div>
          ))}

          {/* Botón para ver más allá del Top 10 */}
          {candidatos.length > LIMITE_TOP && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              <button
                type="button"
                className="boton-mini"
                onClick={() => setMostrarMas(!mostrarMas)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px' }}
              >
                <ChevronDown size={14} style={{ transform: mostrarMas ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                {mostrarMas
                  ? 'Mostrar solo el Top 10'
                  : `Ver otros ${candidatos.length - LIMITE_TOP} profesionales disponibles`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
