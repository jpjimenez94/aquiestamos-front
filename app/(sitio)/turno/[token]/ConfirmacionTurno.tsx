
'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Clock, HeartHandshake } from 'lucide-react'

type DetallesTarea = {
  yaRespondio: boolean
  status: string
  colaboradorNombre: string
  tarea: {
    id: string
    title: string
    description: string | null
    area: string
    areaLegible: string
    dueDate: string | null
    notes: string | null
    priority: string
  }
  note: string | null
}

const PRIORITY_COLOR: Record<string, { bg: string; color: string }> = {
  ALTA: { bg: '#fef2f2', color: '#dc2626' },
  MEDIA: { bg: '#fffbeb', color: '#d97706' },
  BAJA: { bg: '#f0fdf4', color: '#16a34a' },
}

const PRIORITY_TEXTO: Record<string, string> = {
  ALTA: 'Prioridad alta',
  MEDIA: 'Prioridad media',
  BAJA: 'Prioridad baja',
}

export function ConfirmacionTurno({ token }: { token: string }) {
  const [datos, setDatos] = useState<DetallesTarea | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [respondido, setRespondido] = useState<'ACEPTADO' | 'RECHAZADO' | null>(null)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mostrarRechazo, setMostrarRechazo] = useState(false)

  useEffect(() => {
    fetch('/api/turno-confirmacion/' + token)
      .then((r) => r.json())
      .then((payload) => {
        if (payload.success) {
          setDatos(payload.data)
          if (payload.data.yaRespondio) setRespondido(payload.data.status as any)
        } else {
          setError(payload.message ?? 'El enlace no es valido.')
        }
      })
      .catch(() => setError('No pudimos conectarnos. Intenta de nuevo en unos minutos.'))
      .finally(() => setCargando(false))
  }, [token])

  async function responder(accion: 'ACEPTAR' | 'RECHAZAR') {
    setEnviando(true)
    setError(null)
    try {
      const res = await fetch('/api/turno-confirmacion/' + token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion, declineReason: accion === 'RECHAZAR' ? motivoRechazo.trim() || null : null }),
      })
      const payload = await res.json()
      if (!res.ok || !payload.success) { setError(payload.message ?? 'No pudimos registrar tu respuesta.'); return }
      setRespondido(accion === 'ACEPTAR' ? 'ACEPTADO' : 'RECHAZADO')
    } catch { setError('Error de conexion. Intenta de nuevo.') }
    finally { setEnviando(false) }
  }

  if (cargando) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Cargando los detalles...</p>
      </div>
    )
  }

  if (error && !datos) {
    return (
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', background: '#fff', borderRadius: 16, padding: '36px 28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <XCircle size={40} color="#dc2626" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>Enlace no valido</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>{error}</p>
      </div>
    )
  }

  if (!datos) return null

  const { tarea, colaboradorNombre, note, yaRespondio } = datos
  const pColor = PRIORITY_COLOR[tarea.priority] ?? { bg: '#f1f5f9', color: '#475569' }
  const primerNombre = colaboradorNombre.split(' ')[0] ?? colaboradorNombre

  // Ya respondio
  if (respondido === 'ACEPTADO') {
    return (
      <div style={{ maxWidth: 520, width: '100%', background: '#fff', borderRadius: 16, padding: '40px 32px', border: '1px solid #bbf7d0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid #a7f3d0' }}>
          <CheckCircle2 size={36} color="#059669" />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
          Genial, {primerNombre}!
        </h2>
        <p style={{ fontSize: '0.94rem', color: '#475569', lineHeight: 1.6, marginBottom: 8 }}>
          Ya anotamos que aceptas apoyar con <strong>{tarea.title}</strong>.
        </p>
        <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
          El equipo de coordinacion de la Red Aqui Estamos se pondra en contacto contigo en breve con mas detalles.
        </p>
      </div>
    )
  }

  if (respondido === 'RECHAZADO') {
    return (
      <div style={{ maxWidth: 520, width: '100%', background: '#fff', borderRadius: 16, padding: '40px 32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid #e2e8f0' }}>
          <HeartHandshake size={36} color="#64748b" />
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
          Entendido, {primerNombre}
        </h2>
        <p style={{ fontSize: '0.94rem', color: '#475569', lineHeight: 1.6 }}>
          Gracias por responder. Ya le avisamos al equipo que no puedes en este momento.
          Cuando haya otra oportunidad que encaje con lo tuyo, te volvemos a escribir.
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 560, width: '100%', background: '#fff', borderRadius: 16, padding: '36px 28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Red Aqui Estamos te necesita</p>
      <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: 16, lineHeight: 1.3 }}>
        {primerNombre}, {yaRespondio ? 'ya respondiste a esta invitacion' : 'te invitamos a apoyarnos'}
      </h1>

      {/* Tarjeta de la tarea */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <strong style={{ fontSize: '1.05rem', color: '#0f172a', lineHeight: 1.3 }}>{tarea.title}</strong>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: pColor.bg, color: pColor.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {PRIORITY_TEXTO[tarea.priority] ?? tarea.priority}
          </span>
        </div>

        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{tarea.areaLegible}</span>

        {tarea.description && (
          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>{tarea.description}</p>
        )}

        {tarea.dueDate && (
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
            📅 Fecha limite: <strong>{new Date(tarea.dueDate + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
          </p>
        )}

        {note && (
          <div style={{ background: '#fffbeb', borderRadius: 8, padding: '10px 12px', border: '1px solid #fde68a' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', margin: '0 0 4px' }}>Nota del equipo coordinador:</p>
            <p style={{ fontSize: '0.88rem', color: '#78350f', margin: 0, lineHeight: 1.4 }}>{note}</p>
          </div>
        )}
      </div>

      {yaRespondio ? (
        <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
          Ya respondiste a esta invitacion. Si crees que hay un error, escríbenos directamente.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <p style={{ color: '#dc2626', fontSize: '0.86rem', margin: 0, background: '#fef2f2', padding: '10px 12px', borderRadius: 8, border: '1px solid #fecaca' }}>{error}</p>}

          {!mostrarRechazo ? (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => responder('ACEPTAR')} disabled={enviando} style={{ flex: 1, padding: '13px 20px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', background: '#059669', color: '#fff', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <CheckCircle2 size={18} />
                {enviando ? 'Enviando...' : 'Acepto apoyar'}
              </button>
              <button onClick={() => setMostrarRechazo(true)} style={{ padding: '13px 20px', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem', background: '#f8fafc', color: '#64748b', border: '1.5px solid #e2e8f0', cursor: 'pointer' }}>
                No puedo en este momento
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0 }}>Si quieres, cuentanos por que no puedes ahora. Nos ayuda a mejorar:</p>
              <textarea
                rows={3}
                placeholder="Opcional: no tengo tiempo esta semana, no es mi area, etc."
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: 8, fontSize: '0.88rem', border: '1.5px solid #e2e8f0', outline: 'none', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => responder('RECHAZAR')} disabled={enviando} style={{ padding: '10px 18px', borderRadius: 9, fontWeight: 700, fontSize: '0.88rem', background: '#f8fafc', color: '#64748b', border: '1.5px solid #e2e8f0', cursor: 'pointer' }}>
                  {enviando ? 'Enviando...' : 'Confirmar que no puedo'}
                </button>
                <button onClick={() => setMostrarRechazo(false)} style={{ padding: '10px 18px', borderRadius: 9, fontWeight: 600, fontSize: '0.88rem', background: '#ecfdf5', color: '#059669', border: '1.5px solid #a7f3d0', cursor: 'pointer' }}>
                  Volver y aceptar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
