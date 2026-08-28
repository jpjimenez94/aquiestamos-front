'use client'

import { useState, useEffect, useRef, use } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Video,
  ShieldCheck,
  Headphones,
  Sparkles,
  ExternalLink,
  PhoneCall,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { enBogota } from '@/lib/fechas'

type InfoCita = {
  id: string
  token?: string
  rol?: string
  startsAt: string
  endsAt: string
  modality: string
  status: string
  patientFirstName?: string
  professionalName: string
  targetMeetingUrl: string
  meetingProvider: string
  patientFirstJoinedAt?: string | null
  professionalFirstJoinedAt?: string | null
  totalCallDurationSeconds?: number
}

function sanitizarUrlVideollamada(url?: string | null): string | null {
  if (!url) return null
  return url.replace(/meet\.ffrn\.de/g, 'meet.jit.si')
}

/**
 * El botón verde de esta pantalla, en un sitio.
 *
 * Dos de los botones de aquí llevaban `className="boton"`, que no existe en
 * ninguna hoja de estilos: salían como texto suelto. Uno de ellos es «Abrir la
 * sala», el rescate para cuando el navegador bloquea la ventana emergente — o
 * sea, el único camino que le queda a quien no consiguió entrar a su sesión,
 * y encima sobre fondo oscuro.
 *
 * Esta pantalla se pinta con estilos en línea a propósito: es de cara a la
 * persona acompañada y no comparte el lenguaje del portal. Por eso no usa el
 * `<Button>` de dentro, pero sí necesita que su verde esté escrito una vez.
 */
const BOTON_SALA: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '13px 24px',
  borderRadius: 12,
  border: 'none',
  background: '#059669',
  color: '#ffffff',
  fontSize: '0.95rem',
  fontWeight: 700,
  fontFamily: 'inherit',
  cursor: 'pointer',
  textDecoration: 'none',
  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
  transition: 'all 0.2s ease',
}

export default function SalaEsperaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const rolQuery = searchParams.get('rol')

  const [cita, setCita] = useState<InfoCita | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estado de la llamada
  const [enLlamada, setEnLlamada] = useState(false)
  const [logId, setLogId] = useState<string | null>(null)
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null)
  const [conectando, setConectando] = useState(false)
  const [segundosTranscurridos, setSegundosTranscurridos] = useState(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cargar datos de la cita con token HMAC
  useEffect(() => {
    async function cargar() {
      try {
        const urlParams = rolQuery ? `?rol=${rolQuery}` : ''
        const res = await fetch(`/api/meetings/${id}/info${urlParams}`)
        const data = await res.json()
        if (res.ok && data.success && data.data) {
          setCita(data.data)
          setMeetingUrl(sanitizarUrlVideollamada(data.data.targetMeetingUrl))
        } else {
          setError(data.message || 'No encontramos la sesión o el enlace no es válido.')
        }
      } catch {
        setError('No pudimos conectar con el servidor de la red.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id, rolQuery])

  const esProfesional = cita?.rol === 'PROFESIONAL' || rolQuery === 'profesional' || rolQuery === 'psicologo'

  // Manejo de pings periódicos para telemetría de duración
  useEffect(() => {
    if (!enLlamada || !logId) return

    timerRef.current = setInterval(() => {
      setSegundosTranscurridos((s) => s + 1)
    }, 1000)

    pingIntervalRef.current = setInterval(async () => {
      try {
        await fetch(`/api/meetings/logs/${logId}/ping`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
      } catch (e) {
        console.warn('Error enviando ping de telemetría:', e)
      }
    }, 25000)

    const enviarSalidaBeacon = () => {
      const payload = JSON.stringify({
        logId,
        durationSeconds: segundosTranscurridos,
        role: cita?.rol,
      })
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' })
        navigator.sendBeacon(`/api/meetings/${id}/leave`, blob)
      } else {
        fetch(`/api/meetings/${id}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {})
      }
    }

    const handleWindowMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (data?.event === 'videoConferenceLeft' || data?.name === 'videoConferenceLeft' || data?.type === 'hangup') {
          salirDeLaSala()
        }
      } catch {}
    }

    window.addEventListener('beforeunload', enviarSalidaBeacon)
    window.addEventListener('pagehide', enviarSalidaBeacon)
    window.addEventListener('message', handleWindowMessage)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
      window.removeEventListener('beforeunload', enviarSalidaBeacon)
      window.removeEventListener('pagehide', enviarSalidaBeacon)
      window.removeEventListener('message', handleWindowMessage)
    }
  }, [enLlamada, logId, segundosTranscurridos, id, cita?.rol])

  /**
   * Lleva la sala a su propia pestaña.
   *
   * La videollamada iba dentro de un `<iframe>` y Jitsi CORTA a los cinco
   * minutos cualquier llamada embebida: «Embedding meet.jit.si is only meant
   * for demo purposes». Las sesiones de acompañamiento son de 45. La misma
   * sala abierta en una pestaña normal no tiene ese límite.
   *
   * La ventana se abre vacía y se rellena después. Tiene que ser así: el
   * navegador solo deja abrir pestañas dentro del gesto de la persona, y
   * después de esperar al `fetch` ese permiso ya se perdió y el bloqueador de
   * ventanas emergentes la mataría.
   */
  function llevarASala(ventana: Window | null, url: string | null) {
    if (!url) return
    if (ventana && !ventana.closed) ventana.location.href = url
    else window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function unirseALaSala() {
    const ventana = window.open('', '_blank')
    setConectando(true)
    try {
      const res = await fetch(`/api/meetings/${id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: cita?.rol || (esProfesional ? 'PROFESIONAL' : 'PACIENTE') }),
      })
      const data = await res.json()
      let url: string | null
      if (res.ok && data.success && data.data) {
        setLogId(data.data.logId)
        url = sanitizarUrlVideollamada(data.data.targetMeetingUrl || cita?.targetMeetingUrl)
      } else {
        url = sanitizarUrlVideollamada(cita?.targetMeetingUrl || null)
      }
      setMeetingUrl(url)
      setEnLlamada(true)
      llevarASala(ventana, url)
    } catch {
      const url = sanitizarUrlVideollamada(cita?.targetMeetingUrl || null)
      setMeetingUrl(url)
      setEnLlamada(true)
      llevarASala(ventana, url)
    } finally {
      setConectando(false)
    }
  }

  async function salirDeLaSala() {
    if (!confirm('¿Deseas salir de la videollamada?')) return
    try {
      await fetch(`/api/meetings/${id}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId,
          durationSeconds: segundosTranscurridos,
          role: cita?.rol,
        }),
      })
    } catch {}
    setEnLlamada(false)
  }

  async function cambiarAServidorDeRespaldo() {
    const nuevoServidor = meetingUrl?.includes('8x8.vc') ? 'meet.jit.si' : '8x8.vc'
    const nuevaUrl = meetingUrl?.includes('8x8.vc')
      ? meetingUrl.replace(/8x8\.vc/g, 'meet.jit.si')
      : meetingUrl?.replace(/meet\.jit\.si/g, '8x8.vc') || `https://8x8.vc/AquiEstamos-${id}-backup`

    setMeetingUrl(nuevaUrl)
    try {
      await fetch(`/api/meetings/${id}/report-error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motivo: `Cambio voluntario o rescate a servidor ${nuevoServidor}`,
          urlFallida: meetingUrl,
          role: cita?.rol,
        }),
      })
    } catch {}
  }

  function formatoMinutos(seg: number) {
    const m = Math.floor(seg / 60)
    const s = seg % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  if (cargando) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #059669', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#475569', fontWeight: 600 }}>Verificando enlace seguro de acompañamiento…</p>
        </div>
      </div>
    )
  }

  if (error || !cita) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 20 }}>
        <div style={{ maxWidth: 460, background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center', border: '1px solid #fee2e2' }}>
          <AlertCircle size={48} style={{ color: '#dc2626', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: 8 }}>Sesión no disponible</h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: 20 }}>
            {error || 'No pudimos encontrar la información de esta cita virtual.'}
          </p>
          <a href="https://wa.me/573009121234" style={BOTON_SALA}>
            <PhoneCall size={16} /> Contactar a Coordinación
          </a>
        </div>
      </div>
    )
  }

  // Vista en Videollamada Activa
  if (enLlamada && meetingUrl) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
        {/* Barra superior de control y telemetría */}
        <div style={{ height: 52, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.88rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }} />
              Sesión en curso
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>|</span>
            <span style={{ color: '#f8fafc', fontSize: '0.86rem', fontWeight: 600 }}>
              {esProfesional ? `Atendiendo a: ${cita.patientFirstName || 'Persona'}` : `Con: ${cita.professionalName}`}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: 20, color: '#f1f5f9', fontSize: '0.84rem', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} style={{ color: '#38bdf8' }} />
              <span>{formatoMinutos(segundosTranscurridos)}</span>
            </div>

            <button
              type="button"
              onClick={cambiarAServidorDeRespaldo}
              className="boton-mini"
              style={{ background: '#334155', color: '#fbbf24', border: '1px solid #d97706', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              title="Si la llamada no conecta o hay problemas de audio/video, haz clic aquí para cambiar al servidor de respaldo"
            >
              <RefreshCw size={13} />
              Servidor de respaldo
            </button>

            <button
              type="button"
              onClick={salirDeLaSala}
              className="boton-mini"
              style={{ background: '#dc2626', color: '#fff', border: 'none', fontSize: '0.78rem', fontWeight: 700 }}
            >
              Terminar y cerrar
            </button>
          </div>
        </div>

        {/*
          Aquí iba un <iframe> con la sala dentro, y Jitsi corta a los cinco
          minutos toda llamada embebida. La sala vive ahora en su propia
          pestaña; esta página se queda como panel de la sesión, que es lo que
          mantiene viva la telemetría: el cronómetro y los pings salen de aquí.
          Por eso pide no cerrarla.
        */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 20px',
            textAlign: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Video size={30} style={{ color: '#10b981' }} />
          </div>

          <div style={{ maxWidth: 460 }}>
            <h2 style={{ color: '#f8fafc', fontSize: '1.2rem', margin: '0 0 8px' }}>
              Tu sesión se abrió en otra pestaña
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.94rem', lineHeight: 1.6, margin: 0 }}>
              Búscala entre tus pestañas: ahí están la cámara y el micrófono. Si no
              se abrió, tu navegador pudo haberla bloqueado; ábrela con el botón de
              abajo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => llevarASala(null, meetingUrl)}
            style={BOTON_SALA}
          >
            <ExternalLink size={17} />
            Abrir la sala
          </button>

          <p
            style={{
              color: '#64748b',
              fontSize: '0.82rem',
              maxWidth: 420,
              lineHeight: 1.6,
              margin: 0,
              borderTop: '1px solid #1e293b',
              paddingTop: 16,
            }}
          >
            No cierres esta pestaña mientras dure la sesión: desde aquí se lleva el
            tiempo de la llamada. Al terminar, vuelve y pulsa «Terminar y cerrar».
          </p>
        </div>
      </div>
    )
  }

  // Vista de Sala de Espera
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ maxWidth: 540, width: '100%', background: '#ffffff', borderRadius: 20, boxShadow: '0 10px 30px -5px rgba(5, 150, 105, 0.1), 0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #d1fae5', overflow: 'hidden' }}>
        
        {/* Cabecera decorativa */}
        <div style={{ background: '#059669', padding: '24px 28px', color: '#ffffff', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 12 }}>
            <Sparkles size={14} /> Red Aquí Estamos
          </div>
          <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Sala Virtual de Acompañamiento
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '0.88rem', opacity: 0.9 }}>
            Espacio seguro, confidencial y sin descargas
          </p>
        </div>

        {/* Contenido principal */}
        <div style={{ padding: '28px' }}>
          {/* Tarjeta de Saludo */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', marginBottom: 22 }}>
            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              {esProfesional ? (
                <>Hola, tienes sesión programada con <strong>{cita.patientFirstName || 'la persona acompañada'}</strong>.</>
              ) : (
                <>Hola {cita.patientFirstName ? <strong>{cita.patientFirstName}</strong> : ''}, tu acompañamiento psicológico está listo.</>
              )}
            </p>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.86rem', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={15} style={{ color: '#059669' }} />
                <span>Horario: <strong>{enBogota(cita.startsAt)}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={15} style={{ color: '#059669' }} />
                <span>{esProfesional ? 'Atención en rol de voluntario(a)' : `Psicólogo(a): ${cita.professionalName}`}</span>
              </div>
            </div>
          </div>

          {/* Recomendaciones de Conexión */}
          <div style={{ marginBottom: 26 }}>
            <h3 style={{ fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 12, fontWeight: 700 }}>
              Para una buena experiencia:
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.86rem', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0 }} />
                <span>Busca un lugar privado y con la menor cantidad de interrupciones posible.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Headphones size={16} style={{ color: '#059669', flexShrink: 0 }} />
                <span>Usa audífonos para escuchar con claridad y mayor intimidad.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={16} style={{ color: '#059669', flexShrink: 0 }} />
                <span>Tu llamada está protegida con cifrado de extremo a extremo y no se graba.</span>
              </div>
            </div>
          </div>

          {/* Botón de Entrada Principal */}
          <button
            type="button"
            onClick={unirseALaSala}
            disabled={conectando}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: 12,
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <Video size={20} />
            {conectando ? 'Abriendo sala segura…' : 'Entrar a la videollamada'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.76rem', color: '#94a3b8', margin: '14px 0 0' }}>
            Al entrar, tu navegador te pedirá permiso para usar tu cámara y micrófono.
          </p>
        </div>
      </div>
    </div>
  )
}
