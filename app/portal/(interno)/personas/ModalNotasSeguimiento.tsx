'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquarePlus, X, Send, Loader2, Clock, User, MessageCircle } from 'lucide-react'
import { enBogota } from '@/lib/fechas'
import { nombrePropio } from '@/lib/nombre'

export type NotaSeguimiento = {
  id: string
  nota: string
  autor: string
  email?: string
  fecha: string
  fechaLocal?: string
}

type Props = {
  personaId: string
  personaNombre: string
  notasIniciales?: NotaSeguimiento[]
  totalNotas?: number
  ultimaNota?: {
    nota: string
    autor: string
    fecha: string
  } | null
  onNotaAgregada?: (nuevaNota: NotaSeguimiento) => void
}

export function ModalNotasSeguimiento({
  personaId,
  personaNombre,
  notasIniciales = [],
  totalNotas = 0,
  ultimaNota,
  onNotaAgregada,
}: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [notas, setNotas] = useState<NotaSeguimiento[]>(notasIniciales)
  const [cargandoNotas, setCargandoNotas] = useState(false)
  const [textoNota, setTextoNota] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function abrirModal() {
    setAbierto(true)
    setError(null)
    setCargandoNotas(true)

    try {
      const res = await fetch(`/api/portal/patients/${personaId}/notes`)
      const data = await res.json()
      if (res.ok && data.success && Array.isArray(data.data)) {
        setNotas(data.data)
      }
    } catch {
      // Usar las notas iniciales si falla la red
    } finally {
      setCargandoNotas(false)
    }
  }

  async function handleGuardarNota(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!textoNota.trim() || guardando) return

    setGuardando(true)
    setError(null)

    try {
      const res = await fetch(`/api/portal/patients/${personaId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: textoNota.trim() }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message ?? 'No pudimos guardar la nota.')
        setGuardando(false)
        return
      }

      const creada: NotaSeguimiento = data.data.nota
      const listaActualizada: NotaSeguimiento[] = data.data.notas || [creada, ...notas]

      setNotas(listaActualizada)
      setTextoNota('')
      setGuardando(false)

      if (onNotaAgregada) {
        onNotaAgregada(creada)
      }
      router.refresh()
    } catch {
      setError('Error de conexión al guardar la nota.')
      setGuardando(false)
    }
  }

  const cantidad = notas.length || totalNotas

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 4,
          cursor: 'pointer',
        }}
        onClick={abrirModal}
        title="Ver y agregar notas de seguimiento"
      >
        {ultimaNota || (notas.length > 0 && notas[0]) ? (
          <div>
            <span
              style={{
                fontSize: '0.78rem',
                color: '#1e293b',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.3,
                fontWeight: 500,
              }}
            >
              {ultimaNota?.nota || notas[0]?.nota}
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  color: '#64748b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Clock size={11} />
                {enBogota(ultimaNota?.fecha || notas[0]?.fecha)}
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontWeight: 600,
                }}
              >
                {cantidad} {cantidad === 1 ? 'nota' : 'notas'}
              </span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="boton-mini"
            style={{
              fontSize: '0.74rem',
              padding: '3px 8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--color-primary, #059669)',
              borderColor: 'rgba(5, 150, 105, 0.3)',
              background: '#f0fdf4',
            }}
            onClick={(e) => {
              e.stopPropagation()
              abrirModal()
            }}
          >
            <MessageSquarePlus size={12} />
            + Agregar nota
          </button>
        )}
      </div>

      {abierto ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !guardando) setAbierto(false)
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              maxWidth: 580,
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Cabecera del modal */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>
                  Notas de seguimiento
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  {nombrePropio(personaNombre)} · {notas.length} {notas.length === 1 ? 'registro' : 'registros'}
                </p>
              </div>
              <button
                type="button"
                className="boton-mini"
                style={{ padding: '4px 6px' }}
                onClick={() => setAbierto(false)}
                disabled={guardando}
              >
                <X size={16} />
              </button>
            </div>

            {/* Formulario para agregar nueva nota */}
            <form onSubmit={handleGuardarNota} style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Nueva nota de coordinación / seguimiento:
              </label>
              <textarea
                value={textoNota}
                onChange={(e) => setTextoNota(e.target.value)}
                placeholder="Escribe el avance (ej. Se llamó a la persona, confirmó que prefiere citas virtuales por la tarde; pendiente agendar con profesional)..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.84rem',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
                disabled={guardando}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleGuardarNota()
                  }
                }}
              />

              {error ? (
                <p style={{ color: 'var(--color-red, #dc2626)', fontSize: '0.78rem', margin: '6px 0 0' }}>
                  {error}
                </p>
              ) : null}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Tip: puedes presionar <kbd style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1' }}>Ctrl + Enter</kbd> para guardar
                </span>
                <button
                  type="submit"
                  className="boton-mini"
                  style={{
                    background: 'var(--color-primary, #059669)',
                    color: '#ffffff',
                    borderColor: 'var(--color-primary, #059669)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    fontWeight: 600,
                  }}
                  disabled={guardando || !textoNota.trim()}
                >
                  {guardando ? <Loader2 size={13} className="girando" /> : <Send size={13} />}
                  {guardando ? 'Guardando...' : 'Guardar nota'}
                </button>
              </div>
            </form>

            {/* Lista histórica de notas */}
            <div
              style={{
                padding: '16px 20px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                background: '#f8fafc',
              }}
            >
              <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Historial de notas
              </h4>

              {cargandoNotas ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                  <Loader2 size={20} className="girando" style={{ color: '#059669' }} />
                </div>
              ) : notas.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: '0.84rem', background: '#fff', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                  <MessageCircle size={24} style={{ opacity: 0.4, margin: '0 auto 8px', display: 'block' }} />
                  Aún no hay notas de seguimiento registradas. Agrega la primera arriba.
                </div>
              ) : (
                notas.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: 8,
                      padding: '12px 14px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: '#0f172a',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <User size={12} style={{ color: '#059669' }} />
                        {n.autor}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#64748b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <Clock size={11} />
                        {n.fechaLocal ?? enBogota(n.fecha)}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                      {n.nota}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Pie del modal */}
            <div
              style={{
                padding: '10px 20px',
                borderTop: '1px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                className="boton-mini"
                onClick={() => setAbierto(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
