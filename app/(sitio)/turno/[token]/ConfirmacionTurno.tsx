
'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Clock, HeartHandshake, Calendar, Link2, ExternalLink, Send, CheckCheck, Sparkles } from 'lucide-react'

type DetallesTarea = {
  yaRespondio: boolean
  status: string
  colaboradorNombre: string
  completionUrl?: string | null
  completionNote?: string | null
  tarea: {
    id: string
    title: string
    description: string | null
    area: string
    areaLegible: string
    dueDate: string | null
    startTime: string | null
    endTime: string | null
    materialsUrl: string | null
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
  const [respondido, setRespondido] = useState<string | null>(null)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mostrarRechazo, setMostrarRechazo] = useState(false)

  // Entrega de labor
  const [mostrarFormEntrega, setMostrarFormEntrega] = useState(false)
  const [formEntrega, setFormEntrega] = useState({ completionUrl: '', completionNote: '' })
  const [enviandoEntrega, setEnviandoEntrega] = useState(false)

  useEffect(() => {
    fetch('/api/turno-confirmacion/' + token)
      .then((r) => r.json())
      .then((payload) => {
        if (payload.success) {
          setDatos(payload.data)
          if (payload.data.yaRespondio) setRespondido(payload.data.status)
        } else {
          setError(payload.message ?? 'El enlace no es válido.')
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
      // Refrescar para ver los materiales si aceptó
      if (accion === 'ACEPTAR') {
        const r = await fetch('/api/turno-confirmacion/' + token)
        const d = await r.json()
        if (d.success && d.data) setDatos(d.data)
      }
    } catch { setError('Error de conexión. Intenta de nuevo.') }
    finally { setEnviando(false) }
  }

  async function entregarLabor(ev: React.FormEvent) {
    ev.preventDefault()
    setEnviandoEntrega(true)
    setError(null)
    try {
      const res = await fetch('/api/turno-confirmacion/' + token + '/completar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completionUrl: formEntrega.completionUrl.trim() || null,
          completionNote: formEntrega.completionNote.trim() || null,
        }),
      })
      const payload = await res.json()
      if (!res.ok || !payload.success) { setError(payload.message ?? 'Error al entregar labor.'); return }
      setRespondido('COMPLETADO')
      setMostrarFormEntrega(false)
    } catch { setError('Error de conexión.') }
    finally { setEnviandoEntrega(false) }
  }

  if (cargando) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Cargando los detalles de tu turno...</p>
      </div>
    )
  }

  if (error && !datos) {
    return (
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', background: '#fff', borderRadius: 16, padding: '36px 28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <XCircle size={40} color="#dc2626" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>Enlace no válido</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>{error}</p>
      </div>
    )
  }

  if (!datos) return null

  const { tarea, colaboradorNombre, note, yaRespondio } = datos
  const pColor = PRIORITY_COLOR[tarea.priority] ?? { bg: '#f1f5f9', color: '#475569' }
  const primerNombre = colaboradorNombre.split(' ')[0] ?? colaboradorNombre

  // Estado: Ya completado
  if (respondido === 'COMPLETADO') {
    return (
      <div style={{ maxWidth: 540, width: '100%', background: '#fff', borderRadius: 16, padding: '40px 32px', border: '1px solid #bbf7d0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center' }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid #a7f3d0' }}>
          <Sparkles size={36} color="#059669" />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
          ¡Muchas gracias, {primerNombre}!
        </h2>
        <p style={{ fontSize: '0.96rem', color: '#334155', lineHeight: 1.6, marginBottom: 10 }}>
          Registramos con éxito que completaste la labor <strong>{tarea.title}</strong>.
        </p>
        <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
          Tu valiosa ayuda hace posible que la Red Aquí Estamos siga brindando apoyo a cientos de personas.
          Te escribiremos cuando tengamos nuevas labores en tu disciplina.
        </p>
      </div>
    )
  }

  // Estado: Rechazado
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
          Gracias por avisarnos. Ya le informamos al equipo de coordinación para reasignar la labor.
          Seguimos en contacto para futuras oportunidades.
        </p>
      </div>
    )
  }

  // Estado: Aceptado o En Progreso (muestra herramientas y botón de terminar)
  const esAceptadoOEnProgreso = ['ACEPTADO', 'EN_PROGRESO'].includes(respondido ?? '')

  return (
    <div style={{ maxWidth: 620, width: '100%', background: '#fff', borderRadius: 16, padding: '36px 28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Red Aquí Estamos</p>
      <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: 16, lineHeight: 1.3 }}>
        {esAceptadoOEnProgreso ? `¡Hola ${primerNombre}! Tienes este turno asignado` : `${primerNombre}, te invitamos a apoyarnos`}
      </h1>

      {/* Tarjeta de la labor */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <strong style={{ fontSize: '1.05rem', color: '#0f172a', lineHeight: 1.3 }}>{tarea.title}</strong>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: pColor.bg, color: pColor.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {PRIORITY_TEXTO[tarea.priority] ?? tarea.priority}
          </span>
        </div>

        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{tarea.areaLegible}</span>

        {tarea.description && (
          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>{tarea.description}</p>
        )}

        {(tarea.dueDate || tarea.startTime || tarea.endTime) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, padding: '8px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            {tarea.dueDate && (
              <span style={{ fontSize: '0.84rem', color: '#1e293b' }}>
                📅 <strong>Fecha:</strong> {new Date(tarea.dueDate + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            )}
            {(tarea.startTime || tarea.endTime) && (
              <span style={{ fontSize: '0.84rem', color: '#1e293b' }}>
                ⏰ <strong>Horario:</strong> {tarea.startTime ?? 'Inicio'} {tarea.endTime ? 'a ' + tarea.endTime : ''}
              </span>
            )}
          </div>
        )}

        {/* Recursos y materiales (visibles tras aceptar) */}
        {esAceptadoOEnProgreso && tarea.materialsUrl && (
          <div style={{ background: '#ecfdf5', borderRadius: 8, padding: '12px 14px', border: '1.5px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link2 size={16} color="#059669" />
              <span style={{ fontSize: '0.86rem', color: '#065f46', fontWeight: 700 }}>
                Carpeta de trabajo y materiales:
              </span>
            </div>
            <a
              href={tarea.materialsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 6, background: '#059669', color: '#fff', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}
            >
              Abrir en Drive / Enlace <ExternalLink size={12} />
            </a>
          </div>
        )}

        {note && (
          <div style={{ background: '#fffbeb', borderRadius: 8, padding: '10px 12px', border: '1px solid #fde68a' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', margin: '0 0 4px' }}>Nota del equipo coordinador:</p>
            <p style={{ fontSize: '0.88rem', color: '#78350f', margin: 0, lineHeight: 1.4 }}>{note}</p>
          </div>
        )}
      </div>

      {/* Acciones según estado */}
      {esAceptadoOEnProgreso ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!mostrarFormEntrega ? (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <strong style={{ fontSize: '0.94rem', color: '#166534', display: 'block' }}>✅ Turno confirmado</strong>
                <span style={{ fontSize: '0.82rem', color: '#15803d' }}>Cuando finalices tus actividades, marca la labor como terminada:</span>
              </div>
              <button
                type="button"
                onClick={() => setMostrarFormEntrega(true)}
                style={{
                  padding: '10px 18px', borderRadius: 8, fontWeight: 700, fontSize: '0.88rem',
                  background: '#059669', color: '#fff', border: 'none', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 6px rgba(5,150,105,0.25)',
                }}
              >
                <CheckCheck size={16} />
                Ya terminé esta labor
              </button>
            </div>
          ) : (
            <form onSubmit={entregarLabor} style={{ background: '#f8fafc', border: '1.5px solid #059669', borderRadius: 12, padding: '18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#065f46', fontWeight: 700, fontSize: '0.94rem' }}>
                <CheckCheck size={18} color="#059669" />
                <span>Finalizar y entregar labor</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                  Enlace de entrega / Carpeta de Drive / Reporte <span style={{ fontWeight: 400, color: '#64748b' }}>(opcional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={formEntrega.completionUrl}
                  onChange={(e) => setFormEntrega({ ...formEntrega, completionUrl: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: 8, fontSize: '0.86rem', border: '1.5px solid #e2e8f0', outline: 'none', background: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                  Comentario o novedades de la entrega <span style={{ fontWeight: 400, color: '#64748b' }}>(opcional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Se validaron las 10 tarjetas con éxito..."
                  value={formEntrega.completionNote}
                  onChange={(e) => setFormEntrega({ ...formEntrega, completionNote: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: 8, fontSize: '0.86rem', border: '1.5px solid #e2e8f0', outline: 'none', background: '#fff' }}
                />
              </div>

              {error && <p style={{ color: '#dc2626', fontSize: '0.84rem', margin: 0 }}>{error}</p>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setMostrarFormEntrega(false)}
                  style={{ padding: '8px 14px', borderRadius: 8, fontSize: '0.84rem', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviandoEntrega}
                  style={{
                    padding: '8px 18px', borderRadius: 8, fontSize: '0.84rem', fontWeight: 700,
                    background: '#059669', color: '#fff', border: 'none', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Send size={14} />
                  {enviandoEntrega ? 'Enviando...' : 'Confirmar entrega'}
                </button>
              </div>
            </form>
          )}
        </div>
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
              <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0 }}>Si deseas, cuéntanos brevemente por qué no puedes:</p>
              <textarea
                rows={3}
                placeholder="Opcional: cruce de horario, viaje, etc."
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
