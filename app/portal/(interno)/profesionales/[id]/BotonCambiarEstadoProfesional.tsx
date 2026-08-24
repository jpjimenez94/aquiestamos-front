'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Pause, Play, Loader2, ShieldAlert } from 'lucide-react'
import { Etiqueta } from '../../componentes'

type Props = {
  profesionalId: string
  profesionalNombre: string
  estadoActual: string
  estadoLegible: string
}

const OPCIONES_ESTADO: { estado: string; etiqueta: string; desc: string; tono: string }[] = [
  {
    estado: 'ACTIVO',
    etiqueta: 'Activo',
    desc: 'Habilitado para recibir propuestas de casos y citas en la agenda.',
    tono: 'verde',
  },
  {
    estado: 'PAUSADO',
    etiqueta: 'Pausado temporalmente',
    desc: 'No recibe nuevos casos por el momento. Mantiene sus casos actuales.',
    tono: 'ambar',
  },
  {
    estado: 'INACTIVO',
    etiqueta: 'Inactivo / Desactivado',
    desc: 'Desactivado de la red. No aparece en asignaciones de agenda ni búsqueda de candidatos.',
    tono: 'rojo',
  },
  {
    estado: 'PENDIENTE_VALIDACION',
    etiqueta: 'Pendiente de validación',
    desc: 'En espera de validación de requisitos y documentación.',
    tono: 'ambar',
  },
]

export function BotonCambiarEstadoProfesional({
  profesionalId,
  profesionalNombre,
  estadoActual,
  estadoLegible,
}: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function cambiarEstado(nuevoEstado: string) {
    if (nuevoEstado === estadoActual) {
      setAbierto(false)
      return
    }

    setGuardando(true)
    setError(null)

    try {
      const res = await fetch(`/api/portal/professionals/${profesionalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nuevoEstado }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message ?? 'No pudimos cambiar el estado del profesional')
        return
      }

      setAbierto(false)
      router.refresh()
    } catch {
      setError('Error de conexión con el servidor')
    } finally {
      setGuardando(false)
    }
  }

  const esActivo = estadoActual === 'ACTIVO'

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Etiqueta estado={estadoActual} texto={estadoLegible} />
        <button
          type="button"
          className="boton-mini"
          onClick={() => setAbierto(!abierto)}
          disabled={guardando}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          title="Cambiar estado del profesional"
        >
          {guardando ? (
            <Loader2 size={13} className="girando" />
          ) : esActivo ? (
            <Pause size={13} />
          ) : (
            <Play size={13} />
          )}
          {esActivo ? 'Desactivar / Pausar' : 'Activar profesional'}
        </button>
      </div>

      {abierto ? (
        <div
          style={{
            marginTop: 8,
            padding: 12,
            background: 'var(--color-bg-subtle, #f8fafc)',
            border: '1px solid var(--color-border-default, #e2e8f0)',
            borderRadius: 8,
            maxWidth: 440,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          }}
        >
          <strong style={{ fontSize: '0.84rem', display: 'block', marginBottom: 4 }}>
            Estado de {profesionalNombre}:
          </strong>
          <p className="panel__nota" style={{ fontSize: '0.74rem', margin: '0 0 8px' }}>
            Los profesionales inactivos o pausados no aparecen en la búsqueda de candidatos para acompañamiento ni pueden recibir citas en la agenda.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {OPCIONES_ESTADO.map((op) => (
              <button
                key={op.estado}
                type="button"
                className="boton-mini"
                disabled={guardando || op.estado === estadoActual}
                onClick={() => cambiarEstado(op.estado)}
                style={{
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '6px 10px',
                  background: op.estado === estadoActual ? '#e2e8f0' : '#fff',
                  borderColor: op.estado === estadoActual ? '#94a3b8' : '#cbd5e1',
                  cursor: op.estado === estadoActual ? 'default' : 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{op.etiqueta}</span>
                  {op.estado === estadoActual ? <Check size={13} style={{ color: '#059669' }} /> : null}
                </div>
                <span className="tabla__secundario" style={{ fontSize: '0.74rem', marginTop: 2 }}>
                  {op.desc}
                </span>
              </button>
            ))}
          </div>

          {error ? (
            <span className="tabla__secundario" style={{ color: 'var(--color-red)', marginTop: 6, display: 'block' }}>
              {error}
            </span>
          ) : null}

          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="boton-mini"
              onClick={() => setAbierto(false)}
              disabled={guardando}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
