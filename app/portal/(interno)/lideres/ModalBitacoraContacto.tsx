'use client'

import { useState } from 'react'
import { X, PhoneCall, AlertCircle, Calendar } from 'lucide-react'
import { agregarContactoAction, type ContactoInput } from './actions'

type LeaderSummary = {
  id: string
  name: string
  territory: string
  status: 'ACTIVO' | 'EN_SEGUIMIENTO' | 'ATENDIDO' | 'INACTIVO'
  nextAction?: string | null
  nextActionDate?: string | null
}

type Props = {
  abierto: boolean
  alCerrar: () => void
  lider: LeaderSummary | null
  alGuardarExitoso?: () => void
}

export function ModalBitacoraContacto({
  abierto,
  alCerrar,
  lider,
  alGuardarExitoso,
}: Props) {
  const [notes, setNotes] = useState('')
  const [nextActionDefined, setNextActionDefined] = useState(lider?.nextAction || '')
  const [nextActionDate, setNextActionDate] = useState(
    lider?.nextActionDate ? lider.nextActionDate.slice(0, 10) : '',
  )
  const [status, setStatus] = useState<LeaderSummary['status']>(lider?.status || 'ACTIVO')

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!abierto || !lider) return null

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!lider) return

    if (!notes.trim()) {
      setError('Por favor describe el resultado o las novedades del contacto.')
      return
    }

    setGuardando(true)
    try {
      const payload: ContactoInput = {
        notes: notes.trim(),
        nextActionDefined: nextActionDefined.trim() || null,
        nextActionDate: nextActionDate ? new Date(nextActionDate).toISOString() : null,
        status,
      }

      const res = await agregarContactoAction(lider.id, payload)
      if (!res.success) {
        setError(res.message || 'Error al registrar el contacto')
        return
      }

      alGuardarExitoso?.()
      alCerrar()
    } catch {
      setError('Error inesperado al conectar con el servidor.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 9999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) alCerrar()
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          maxWidth: 560,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Cabecera */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PhoneCall size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Registrar Contacto · {lider.name}
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Territorio: {lider.territory}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="field__label" htmlFor="contacto-notes">
                Resumen del contacto / Novedades de la comunidad <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                id="contacto-notes"
                className="input"
                rows={4}
                placeholder="¿Qué se conversó con el líder? ¿Qué situación presenta la comunidad?..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="field__label" htmlFor="contacto-next-action">
                Definir Próxima Acción Pendiente
              </label>
              <input
                id="contacto-next-action"
                className="input"
                type="text"
                placeholder="Ej: Enviar víveres el viernes / Coordinar brigada de salud"
                value={nextActionDefined}
                onChange={(e) => setNextActionDefined(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <label className="field__label" htmlFor="contacto-next-date">
                  Fecha Programada para la Acción
                </label>
                <input
                  id="contacto-next-date"
                  className="input"
                  type="date"
                  value={nextActionDate}
                  onChange={(e) => setNextActionDate(e.target.value)}
                />
              </div>

              <div>
                <label className="field__label" htmlFor="contacto-status">
                  Actualizar Estado
                </label>
                <select
                  id="contacto-status"
                  className="input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeaderSummary['status'])}
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="EN_SEGUIMIENTO">En seguimiento</option>
                  <option value="ATENDIDO">Atendido</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pie */}
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              background: '#f8fafc',
              borderBottomLeftRadius: 14,
              borderBottomRightRadius: 14,
            }}
          >
            <button className="boton-mini" type="button" onClick={alCerrar} disabled={guardando}>
              Cancelar
            </button>
            <button
              className="boton-mini"
              data-tono="principal"
              type="submit"
              disabled={guardando}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              {guardando ? 'Guardando…' : 'Registrar en Bitácora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
