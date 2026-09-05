'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarPlus, X } from 'lucide-react'

/**
 * Convocar una sesión grupal: facilitador, hora, enlace, invitados.
 *
 * Los invitados llegan preseleccionados —son quienes pidieron el espacio— y
 * la agenda llega escrita con sus preguntas, para que quien convoca no
 * empiece de cero y el supervisor no llegue a ciegas. Las dos cosas se
 * pueden editar antes de enviar.
 *
 * La sala es un enlace externo a propósito: el módulo de salas es por cita y
 * de dos personas, y no se toca.
 */

type Supervisor = { id: string; fullName: string; city: string; modality: string }
type Candidato = { id: string; nombre: string; necesidad: string; pregunta: string | null }

function agendaDe(candidatos: Candidato[], elegidos: Set<string>): string {
  return candidatos
    .filter((c) => elegidos.has(c.id))
    .map((c) => (c.pregunta ? `— ${c.nombre} (${c.necesidad}): ${c.pregunta}` : `— ${c.nombre}: ${c.necesidad}.`))
    .join('\n')
}

/** «2026-09-18T19:00» del input → ISO con la zona del navegador, que es la de quien convoca. */
function aIso(local: string): string | null {
  if (!local) return null
  const d = new Date(local)
  if (Number.isNaN(d.getTime())) return null
  const tz = -d.getTimezoneOffset()
  const signo = tz >= 0 ? '+' : '-'
  const hh = String(Math.floor(Math.abs(tz) / 60)).padStart(2, '0')
  const mm = String(Math.abs(tz) % 60).padStart(2, '0')
  return `${local.length === 16 ? local + ':00' : local}${signo}${hh}:${mm}`
}

export function ConvocarSesion({
  supervisores,
  candidatos,
}: {
  supervisores: Supervisor[]
  candidatos: Candidato[]
}) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [facilitatorId, setFacilitatorId] = useState(supervisores[0]?.id ?? '')
  const [cuando, setCuando] = useState('')
  const [duracion, setDuracion] = useState(60)
  const [enlace, setEnlace] = useState('')
  const [elegidos, setElegidos] = useState<Set<string>>(() => new Set(candidatos.map((c) => c.id)))
  const [agenda, setAgenda] = useState(() => agendaDe(candidatos, new Set(candidatos.map((c) => c.id))))
  const [agendaTocada, setAgendaTocada] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mientras no la hayan editado a mano, la agenda sigue a los invitados.
  const agendaSugerida = useMemo(() => agendaDe(candidatos, elegidos), [candidatos, elegidos])
  const agendaMostrada = agendaTocada ? agenda : agendaSugerida

  function alternar(id: string) {
    setElegidos((prev) => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })
  }

  async function convocar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const startsAt = aIso(cuando)
    if (!facilitatorId) return setError('Elige quién facilita.')
    if (!startsAt) return setError('Pon la fecha y la hora.')
    if (!enlace.trim()) return setError('Pega el enlace de la reunión (Meet, Zoom, el que usen).')
    if (elegidos.size === 0) return setError('Invita al menos a una persona.')

    setEnviando(true)
    try {
      const r = await fetch('/api/portal/cuidado/sesiones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilitatorId,
          startsAt,
          duracionMinutos: duracion,
          meetingUrl: enlace.trim(),
          invitados: [...elegidos],
          agenda: agendaMostrada.trim() || null,
        }),
      })
      const d = await r.json()
      if (!r.ok || !d.success) {
        setError(d.message ?? 'No se pudo convocar.')
        return
      }
      setAbierto(false)
      router.refresh()
    } catch {
      setError('No pudimos conectarnos con el servidor.')
    } finally {
      setEnviando(false)
    }
  }

  const sinSupervisores = supervisores.length === 0

  return (
    <>
      <button
        type="button"
        className="boton-mini"
        data-tono="principal"
        onClick={() => setAbierto(true)}
        disabled={sinSupervisores}
        title={sinSupervisores ? 'Nadie se ha ofrecido a facilitar todavía' : 'Convocar una sesión grupal'}
      >
        <CalendarPlus size={14} />
        Convocar sesión grupal
      </button>

      {abierto ? (
        <div className="modal-eliminar-overlay" onClick={() => setAbierto(false)} style={{ zIndex: 9999 }}>
          <form
            className="modal-eliminar"
            style={{ maxWidth: 640, textAlign: 'left', padding: '22px 26px' }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={convocar}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <h3 style={{ margin: 0 }}>Convocar sesión grupal</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Un facilitador, una hora, un enlace, y a quiénes invitar.
                </span>
              </div>
              <button type="button" className="boton-mini" onClick={() => setAbierto(false)} aria-label="Cerrar">
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>Facilita</span>
                <select className="input" value={facilitatorId} onChange={(e) => setFacilitatorId(e.target.value)}>
                  {supervisores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} · {s.city} · {s.modality.toLowerCase()}
                    </option>
                  ))}
                </select>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 10 }}>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>Cuándo</span>
                  <input className="input" type="datetime-local" value={cuando} onChange={(e) => setCuando(e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>Dura (min)</span>
                  <input
                    className="input"
                    type="number"
                    min={30}
                    max={180}
                    step={15}
                    value={duracion}
                    onChange={(e) => setDuracion(Number(e.target.value) || 60)}
                  />
                </label>
              </div>

              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>Enlace de la reunión</span>
                <input
                  className="input"
                  type="url"
                  placeholder="https://meet.google.com/…"
                  value={enlace}
                  onChange={(e) => setEnlace(e.target.value)}
                />
              </label>

              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend style={{ fontWeight: 700, fontSize: '0.84rem', marginBottom: 6 }}>
                  Invitados{' '}
                  <span style={{ fontWeight: 400, color: '#64748b' }}>
                    · vienen marcados quienes pidieron el espacio
                  </span>
                </legend>
                {candidatos.length === 0 ? (
                  <p className="tabla__secundario" style={{ margin: 0 }}>
                    Nadie ha pedido el espacio todavía. Se puede convocar igual, pero sin invitados no.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gap: 6 }}>
                    {candidatos.map((c) => (
                      <label key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.88rem' }}>
                        <input type="checkbox" checked={elegidos.has(c.id)} onChange={() => alternar(c.id)} style={{ marginTop: 3 }} />
                        <span>
                          <strong>{c.nombre}</strong> <span style={{ color: '#64748b' }}>· {c.necesidad}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>

              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                  Agenda{' '}
                  <span style={{ fontWeight: 400, color: '#64748b' }}>
                    · se arma con las preguntas de los invitados; edítala si quieres
                  </span>
                </span>
                <textarea
                  className="input"
                  rows={5}
                  maxLength={4000}
                  value={agendaMostrada}
                  onChange={(e) => {
                    setAgendaTocada(true)
                    setAgenda(e.target.value)
                  }}
                />
              </label>

              {error ? (
                <p className="tamizaje__error" role="alert" style={{ margin: 0 }}>
                  {error}
                </p>
              ) : null}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="boton-mini" onClick={() => setAbierto(false)} disabled={enviando}>
                  Cancelar
                </button>
                <button type="submit" className="boton-mini" data-tono="principal" disabled={enviando}>
                  {enviando ? 'Convocando…' : 'Convocar y avisar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </>
  )
}
