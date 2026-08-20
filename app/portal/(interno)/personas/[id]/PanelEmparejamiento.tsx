'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { soloHora, diaLargo } from '@/lib/fechas'

type Candidato = {
  id: string
  fullName: string
  city: string
  profession: string
  modality: string
  carga: number
  cupo: number
  sinCupo: boolean
  huecosLibres: number
  huecosQueLeSirven: number
  primerHueco: { inicio: string; fin: string } | null
  puntos: number
  razones: string[]
}

/**
 * La pantalla que decide si el portal se usa: responde «¿quién puede atender a
 * esta persona?» con la carga de cada profesional y su primer hueco concreto.
 */
export function PanelEmparejamiento({ personaId }: { personaId: string }) {
  const router = useRouter()
  const [candidatos, setCandidatos] = useState<Candidato[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [asignando, setAsignando] = useState<string | null>(null)

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

  return (
    <div className="panel">
      <h2>¿Quién puede acompañarla?</h2>
      <p className="panel__nota">
        Ordenados por encaje: coincidencia de horario, cercanía y carga actual.
      </p>

      {error ? (
        <div className="aviso-portal" data-tono="rojo">
          {error}
        </div>
      ) : null}

      {candidatos === null ? (
        <p className="vacio">Buscando profesionales…</p>
      ) : candidatos.length === 0 ? (
        <p className="vacio">
          Ningún profesional activo coincide todavía. Revisa que haya profesionales activos con
          franjas de disponibilidad cargadas.
        </p>
      ) : (
        candidatos.map((c) => (
          <div className="candidato" key={c.id}>
            <div>
              <p className="candidato__nombre">{c.fullName}</p>
              <span className="tabla__secundario" style={{ marginTop: 0 }}>
                {c.profession} · {c.city} · {c.modality.toLowerCase()}
              </span>

              <div className="candidato__razones">
                {c.razones.map((razon) => (
                  <span className="candidato__razon" key={razon}>
                    {razon}
                  </span>
                ))}
              </div>

              {c.primerHueco ? (
                <span className="tabla__secundario">
                  Primer hueco: {diaLargo(c.primerHueco.inicio)}{' '}
                  a las {soloHora(c.primerHueco.inicio)}
                </span>
              ) : (
                <span className="tabla__secundario">Sin huecos en las próximas dos semanas</span>
              )}

              <div className="candidato__barra">
                <span style={{ width: `${Math.min(100, c.puntos)}%` }} />
              </div>
            </div>

            <div>
              <button
                className="boton-mini"
                data-tono="principal"
                disabled={c.sinCupo || asignando !== null}
                onClick={() => asignar(c.id)}
              >
                {asignando === c.id ? 'Asignando…' : c.sinCupo ? 'Sin cupo' : 'Asignar'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
