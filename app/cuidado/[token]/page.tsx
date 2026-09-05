'use client'

import Image from 'next/image'
import { useEffect, useState, use } from 'react'
import { AlertCircle } from 'lucide-react'
import '../../tamizaje/[token]/tamizaje.css'

/**
 * «¿Cómo estás tú?»: el espacio de quien acompaña, con su propia puerta.
 *
 * Vivía al final del enlace del caso. Eso lo ataba a una persona acompañada
 * —para ofrecérselo había que mandarle el enlace de uno de sus casos, y hacía
 * falta que tuviera uno abierto— y, sobre todo, mezclaba dos conversaciones
 * en la misma pantalla: el seguimiento de alguien a quien acompaña, y cómo
 * está él. Son distintas y ahora son dos enlaces distintos.
 *
 * El enlace apunta a él, no a un caso, y le sirve mientras siga en la red.
 *
 * Se abre a partir de cierto número de sesiones hechas (Parametrización:
 * SESIONES_PARA_CHECKIN). Antes del umbral no se le pregunta nada: la pantalla
 * lo dice y no enseña el formulario.
 */

const MARCA = {
  fondo: '#efe5d9',
  tarjeta: '#ffffff',
  tinta: '#37352f',
  tintaSuave: '#63625b',
  borde: '#e9e9e7',
  verde: '#448361',
}

type Estado = {
  nombre: string | null
  sesiones: number
  umbral: number
  habilitado: boolean
  checkIns: {
    id: string
    necesidadLegible: string
    fecha: string
    sesionGrupal: { id: string; cuando: string; estado: string } | null
  }[]
}

type Necesidad = 'APOYO_PARA_MI' | 'AYUDA_CON_UN_CASO' | 'DESCARGARME'

const NECESIDADES: { valor: Necesidad; titulo: string; detalle: string }[] = [
  {
    valor: 'APOYO_PARA_MI',
    titulo: 'Quiero apoyo para mí',
    detalle: 'Esto me está pesando y quisiera hablarlo con alguien de la red.',
  },
  {
    valor: 'AYUDA_CON_UN_CASO',
    titulo: 'Necesito ayuda con un caso',
    detalle: 'Quiero pensar con otros psicólogos cómo manejar algo concreto.',
  },
  {
    valor: 'DESCARGARME',
    titulo: 'Solo quiero descargarme',
    detalle: 'No necesito que me resuelvan nada. Quiero contarlo y que alguien escuche.',
  },
]

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', day: 'numeric', month: 'long' })

export default function CuidadoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)

  const [estado, setEstado] = useState<Estado | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [necesidad, setNecesidad] = useState<Necesidad | null>(null)
  const [notas, setNotas] = useState('')
  const [pregunta, setPregunta] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [fallo, setFallo] = useState<string | null>(null)
  const [enviado, setEnviado] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    ;(async () => {
      try {
        const res = await fetch(`/api/cuidado-profesional/${token}`, { cache: 'no-store' })
        const datos = await res.json()
        if (!vivo) return
        if (datos?.success && datos.data) setEstado(datos.data)
        else setError(datos?.message ?? 'No pudimos abrir tu espacio.')
      } catch {
        if (vivo) setError('No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.')
      } finally {
        if (vivo) setCargando(false)
      }
    })()
    return () => {
      vivo = false
    }
  }, [token])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setFallo(null)
    if (!necesidad) {
      setFallo('Dinos qué necesitas: apoyo para ti, ayuda con un caso, o descargarte.')
      return
    }
    setEnviando(true)
    try {
      const res = await fetch(`/api/cuidado-profesional/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          need: necesidad,
          notes: notas.trim() || null,
          questionForGroup: pregunta.trim() || null,
        }),
      })
      const datos = await res.json()
      if (!res.ok || !datos?.success) {
        setFallo(datos?.message ?? 'No pudimos guardar tu respuesta.')
        return
      }
      setEnviado(datos.message as string)
    } catch {
      setFallo('No pudimos conectarnos. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  const marco: React.CSSProperties = {
    minHeight: '100vh',
    background: MARCA.fondo,
    display: 'flex',
    justifyContent: 'center',
    padding: '28px 16px 64px',
  }
  const tarjeta: React.CSSProperties = {
    width: '100%',
    maxWidth: 560,
    background: MARCA.tarjeta,
    borderRadius: 16,
    padding: 'clamp(22px, 5vw, 34px)',
    boxShadow: '0 4px 24px rgba(55, 53, 47, 0.07)',
  }

  if (cargando) {
    return (
      <div style={{ ...marco, alignItems: 'center' }}>
        <p style={{ color: MARCA.tintaSuave, fontWeight: 600 }}>Un momento…</p>
      </div>
    )
  }

  if (!estado) {
    return (
      <div style={{ ...marco, alignItems: 'center' }}>
        <div style={{ ...tarjeta, textAlign: 'center' }}>
          <AlertCircle size={40} style={{ color: '#b03730', margin: '0 auto 12px' }} />
          <h1 style={{ fontSize: '1.15rem', color: MARCA.tinta, margin: '0 0 8px' }}>
            No pudimos abrir tu espacio
          </h1>
          <p style={{ color: MARCA.tintaSuave, fontSize: '0.92rem', margin: 0 }}>
            {error ?? 'Escríbenos por WhatsApp y te mandamos un enlace nuevo.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={marco}>
      <div style={tarjeta}>
        <Image
          src="/images/1logo.png"
          alt="Red Aquí Estamos"
          width={150}
          height={54}
          priority
          style={{ width: 132, height: 'auto', marginBottom: 22 }}
        />

        <h1
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: 'clamp(1.5rem, 5vw, 1.8rem)',
            fontWeight: 600,
            color: MARCA.tinta,
            margin: '0 0 8px',
          }}
        >
          {estado.nombre ? `¿Cómo estás tú, ${estado.nombre}?` : '¿Cómo estás tú?'}
        </h1>
        <p style={{ color: MARCA.tintaSuave, margin: '0 0 6px', lineHeight: 1.6 }}>
          Quien acompaña también se carga. Este espacio es para ti: para pedir apoyo, pensar un
          caso con otros psicólogos, o simplemente descargarte.
        </p>
        <p style={{ color: MARCA.tintaSuave, margin: '0 0 16px', lineHeight: 1.6, fontSize: '0.92rem' }}>
          Lo lee coordinación y lo cuadra con una sesión grupal de seguimiento, con un psicólogo
          de la red. <strong>No es una evaluación de tu trabajo</strong>, y nadie más lo ve.
        </p>

        {estado.checkIns.length > 0 ? (
          <ul style={{ margin: '0 0 16px', paddingLeft: 18, color: MARCA.tintaSuave, fontSize: '0.88rem' }}>
            {estado.checkIns.map((c) => (
              <li key={c.id}>
                Lo pediste el {fecha(c.fecha)} ({c.necesidadLegible})
                {c.sesionGrupal
                  ? ` · sesión grupal ${c.sesionGrupal.estado.toLowerCase()} para el ${fecha(c.sesionGrupal.cuando)}`
                  : ' · todavía sin sesión convocada'}
              </li>
            ))}
          </ul>
        ) : null}

        {enviado ? (
          <div className="tamizaje__gracias" role="status">
            <svg className="tamizaje__gracias-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2>Gracias por decirlo</h2>
            <p>{enviado}</p>
          </div>
        ) : !estado.habilitado ? (
          /*
            Antes del umbral no se le pregunta nada. No se esconde la página
            entera —el enlace es suyo y tiene que abrir en algo— pero tampoco
            se le ofrece un formulario que la puerta va a rechazar.
          */
          <p
            style={{
              background: '#f7ecd8',
              border: `1px solid ${MARCA.borde}`,
              borderRadius: 10,
              padding: '12px 14px',
              color: MARCA.tinta,
              fontSize: '0.9rem',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Llevas <strong>{estado.sesiones}</strong>{' '}
            {estado.sesiones === 1 ? 'sesión' : 'sesiones'} acompañando. Este espacio se abre a
            partir de {estado.umbral}: guarda el enlace, que te va a seguir sirviendo.
          </p>
        ) : (
          <form className="tamizaje__form" onSubmit={enviar} noValidate>
            <fieldset className="tamizaje__pregunta" data-falta={fallo !== null && necesidad === null}>
              <legend>¿Qué necesitas?</legend>
              <div className="tamizaje__opciones" style={{ gridTemplateColumns: '1fr' }}>
                {NECESIDADES.map((n) => (
                  <button
                    key={n.valor}
                    className="tamizaje__opcion"
                    type="button"
                    data-elegida={necesidad === n.valor}
                    aria-pressed={necesidad === n.valor}
                    onClick={() => {
                      setNecesidad(n.valor)
                      setFallo(null)
                    }}
                    style={{ textAlign: 'left' }}
                  >
                    <strong style={{ display: 'block' }}>{n.titulo}</strong>
                    <span style={{ fontSize: '0.86rem', fontWeight: 400, opacity: 0.85 }}>
                      {n.detalle}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="field__label" htmlFor="notas">
                En qué andas <span style={{ fontWeight: 400 }}>(opcional)</span>
              </label>
              <p className="tamizaje__ayuda" style={{ marginLeft: 0 }}>
                Lo que quieras contar. No es contenido clínico de nadie: es sobre ti.
              </p>
              <textarea
                id="notas"
                className="input"
                rows={3}
                maxLength={1000}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>

            <div>
              <label className="field__label" htmlFor="pregunta">
                ¿Qué te gustaría que se hablara en la sesión grupal?{' '}
                <span style={{ fontWeight: 400 }}>(opcional)</span>
              </label>
              <p className="tamizaje__ayuda" style={{ marginLeft: 0 }}>
                Una pregunta o un tema. Con esto se arma la agenda de la sesión.
              </p>
              <textarea
                id="pregunta"
                className="input"
                rows={2}
                maxLength={600}
                value={pregunta}
                onChange={(e) => setPregunta(e.target.value)}
              />
            </div>

            {fallo ? (
              <p className="tamizaje__error" role="alert">
                {fallo}
              </p>
            ) : null}

            <button className="tamizaje__enviar" type="submit" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Enviar'}
            </button>
          </form>
        )}

        <p
          style={{
            color: MARCA.tintaSuave,
            fontSize: '0.82rem',
            marginTop: 20,
            marginBottom: 0,
            lineHeight: 1.6,
          }}
        >
          Este enlace es tuyo y te sirve siempre: guárdalo. Puedes volver cuantas veces quieras.
        </p>
      </div>
    </div>
  )
}
