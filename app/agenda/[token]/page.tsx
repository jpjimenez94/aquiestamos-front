'use client'

import { useEffect, useState, use } from 'react'
import { CalendarCheck, Clock, User, AlertCircle, CheckCircle2 } from 'lucide-react'

type Hueco = { inicio: string; fin: string; cuando: string }

type Estado = {
  persona: string | null
  profesional: string | null
  modalidad: string | null
  estado: string
  proxima: { inicio: string; cuando: string } | null
  huecos: Hueco[]
}

/**
 * La persona elige su propia hora.
 *
 * Antes esto costaba tres toques humanos y dos esperas: coordinación escribía
 * con las opciones, la persona respondía por WhatsApp, coordinación agendaba.
 * Entre medias podían pasar días.
 *
 * El enlace es de la PERSONA, no del par con su profesional: si en la tercera
 * sesión le cambian de profesional, este mismo enlace pasa a mostrar la agenda
 * del nuevo. Por eso la pantalla siempre dice con quién es antes de las horas
 * —quien vuelve después de un cambio necesita enterarse aquí, no en la sesión.
 */
export default function MiAgendaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)

  const [estado, setEstado] = useState<Estado | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eligiendo, setEligiendo] = useState<string | null>(null)
  const [listo, setListo] = useState<{ cuando: string; profesional: string } | null>(null)

  async function cargar() {
    setCargando(true)
    try {
      const res = await fetch(`/api/mi-agenda/${token}`, { cache: 'no-store' })
      const datos = await res.json()
      if (datos?.success && datos.data) {
        setEstado(datos.data)
        setError(null)
      } else {
        setError(datos?.message ?? 'No pudimos cargar tu agenda.')
      }
    } catch {
      setError('No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function elegir(h: Hueco) {
    setEligiendo(h.inicio)
    setError(null)
    try {
      const res = await fetch(`/api/mi-agenda/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inicio: h.inicio }),
      })
      const datos = await res.json()
      if (res.ok && datos?.success) {
        setListo({ cuando: datos.data.cuando, profesional: datos.data.profesional })
      } else {
        // El caso más probable aquí es que alguien tomara esa hora mientras la
        // persona decidía. Se recarga para que vea la lista de verdad y no
        // vuelva a chocar contra lo mismo.
        setError(datos?.message ?? 'No pudimos agendar esa hora.')
        await cargar()
      }
    } catch {
      setError('No pudimos conectarnos. Inténtalo de nuevo.')
    } finally {
      setEligiendo(null)
    }
  }

  const marco: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)',
    display: 'flex',
    justifyContent: 'center',
    padding: '32px 16px 64px',
  }
  const tarjeta: React.CSSProperties = {
    width: '100%',
    maxWidth: 520,
    background: '#fff',
    borderRadius: 16,
    padding: 'clamp(20px, 5vw, 32px)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  }

  if (cargando) {
    return (
      <div style={{ ...marco, alignItems: 'center' }}>
        <p style={{ color: '#475569', fontWeight: 600 }}>Buscando horarios disponibles…</p>
      </div>
    )
  }

  if (listo) {
    return (
      <div style={{ ...marco, alignItems: 'center' }}>
        <div style={{ ...tarjeta, textAlign: 'center' }}>
          <CheckCircle2 size={44} style={{ color: '#059669', margin: '0 auto 12px' }} />
          <h1 style={{ fontSize: '1.3rem', color: '#0f172a', margin: '0 0 8px' }}>
            Tu sesión quedó agendada
          </h1>
          <p style={{ color: '#475569', margin: 0, lineHeight: 1.6 }}>
            <strong>{listo.cuando}</strong>
            <br />
            con {listo.profesional}
          </p>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: 18, lineHeight: 1.6 }}>
            Te escribimos por WhatsApp con el enlace para conectarte. Si te surge algo y no
            puedes, avísanos con tiempo y lo movemos: no pasa nada.
          </p>
        </div>
      </div>
    )
  }

  if (!estado) {
    return (
      <div style={{ ...marco, alignItems: 'center' }}>
        <div style={{ ...tarjeta, textAlign: 'center' }}>
          <AlertCircle size={40} style={{ color: '#dc2626', margin: '0 auto 12px' }} />
          <h1 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 8px' }}>
            No pudimos abrir tu agenda
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
            {error ?? 'Escríbenos por WhatsApp y te mandamos un enlace nuevo.'}
          </p>
        </div>
      </div>
    )
  }

  if (!estado.profesional) {
    return (
      <div style={{ ...marco, alignItems: 'center' }}>
        <div style={{ ...tarjeta, textAlign: 'center' }}>
          <Clock size={40} style={{ color: '#0284c7', margin: '0 auto 12px' }} />
          <h1 style={{ fontSize: '1.2rem', color: '#0f172a', margin: '0 0 8px' }}>
            Todavía estamos buscando quién te acompañe
          </h1>
          <p style={{ color: '#475569', fontSize: '0.94rem', margin: 0, lineHeight: 1.6 }}>
            En cuanto tengamos profesional para ti, te avisamos por WhatsApp y podrás elegir tu
            hora desde este mismo enlace. Guárdalo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={marco}>
      <div style={tarjeta}>
        <h1 style={{ fontSize: '1.35rem', color: '#0f172a', margin: '0 0 6px' }}>
          {estado.persona ? `Hola, ${estado.persona}` : 'Hola'}
        </h1>
        <p
          style={{
            color: '#475569',
            margin: '0 0 4px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <User size={16} style={{ color: '#059669' }} />
          Tu acompañamiento es con <strong>{estado.profesional}</strong>
        </p>

        {estado.proxima ? (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 10,
              padding: '12px 14px',
              margin: '16px 0',
              fontSize: '0.92rem',
              color: '#166534',
            }}
          >
            <CalendarCheck size={16} style={{ verticalAlign: -3, marginRight: 6 }} />
            Ya tienes una sesión el <strong>{estado.proxima.cuando}</strong>. Si eliges otra hora
            aquí abajo, será una sesión adicional.
          </div>
        ) : null}

        <h2 style={{ fontSize: '1rem', color: '#0f172a', margin: '20px 0 4px' }}>
          Elige la hora que te sirva
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.86rem', margin: '0 0 14px' }}>
          Son las horas en las que {estado.profesional.split(' ')[0]} puede atenderte. Cada sesión
          dura 45 minutos.
        </p>

        {error ? (
          <p
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: '0.88rem',
              margin: '0 0 14px',
            }}
          >
            {error}
          </p>
        ) : null}

        {estado.huecos.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Ahora mismo no hay horas libres en su agenda. Escríbenos por WhatsApp y lo cuadramos
            contigo.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {estado.huecos.map((h) => (
              <button
                key={h.inicio}
                type="button"
                onClick={() => elegir(h)}
                disabled={eligiendo !== null}
                style={{
                  textAlign: 'left',
                  padding: '13px 16px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: eligiendo === h.inicio ? '#ecfdf5' : '#fff',
                  color: '#0f172a',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: eligiendo ? 'wait' : 'pointer',
                  opacity: eligiendo && eligiendo !== h.inicio ? 0.5 : 1,
                }}
              >
                {eligiendo === h.inicio ? 'Agendando…' : h.cuando}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
