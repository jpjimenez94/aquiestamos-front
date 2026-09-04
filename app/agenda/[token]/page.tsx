'use client'

import Image from 'next/image'
import { momentoDelDia } from '@/lib/momentoDelDia'
import { useEffect, useState, use } from 'react'
import { CalendarCheck, Clock, User, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { CONSENTIMIENTO_SESION } from '@/lib/consentimiento'

/**
 * Parte «lunes, 25 de agosto, 7:30 p. m.» en el día y la hora.
 *
 * El texto lo arma el backend en un solo trozo, que es lo correcto: la zona
 * horaria es de allá y no queremos dos formateadores diciendo cosas distintas.
 * Aquí solo se corta por la última coma para poder agrupar, y si el formato
 * cambia se devuelve entero en vez de romperse.
 */
function soloHora(cuando: string): string {
  const i = cuando.lastIndexOf(',')
  return i < 0 ? cuando : cuando.slice(i + 1).trim()
}

function soloDia(cuando: string): string {
  const i = cuando.lastIndexOf(',')
  return i < 0 ? cuando : cuando.slice(0, i).trim()
}

/** Cuántos días se enseñan de entrada. El resto se pliega tras «ver más». */
const DIAS_VISIBLES = 3

/** Agrupa conservando el orden en que vinieron: ya llegan de más pronto a más tarde. */
function porDia(huecos: Hueco[]): [string, Hueco[]][] {
  const mapa = new Map<string, Hueco[]>()
  for (const h of huecos) {
    const dia = soloDia(h.cuando)
    const ya = mapa.get(dia)
    if (ya) ya.push(h)
    else mapa.set(dia, [h])
  }
  return [...mapa.entries()]
}

/**
 * Los colores de la red, no los de una plantilla.
 *
 * Esta pantalla se hizo con un verde neón sobre gris azulado —los tonos por
 * defecto de cualquier librería— y no se parecía en nada al resto del sitio.
 * A quien llega por un enlace de WhatsApp eso le resta lo único que puede
 * usar para confiar: reconocer de dónde viene.
 *
 * Salen de `globals.css`, escritos aquí porque esta página se pinta con
 * estilos en línea —es de cara a la persona acompañada y no comparte la hoja
 * del portal—. Si allá cambian, aquí también.
 */
const MARCA = {
  fondo: '#efe5d9',
  tarjeta: '#ffffff',
  tinta: '#37352f',
  tintaSuave: '#63625b',
  borde: '#e9e9e7',
  verde: '#448361',
  verdeSuave: '#f1f5f2',
  crema: '#e7e2d2',
  noche: '#15162e',
  rojo: '#b03730',
}

type Hueco = { inicio: string; fin: string; cuando: string }

type Estado = {
  persona: string | null
  profesional: string | null
  modalidad: string | null
  estado: string
  proxima: { inicio: string; cuando: string } | null
  huecos: Hueco[]
  /** Si ya firmó en una sesión anterior. Quien ya firmó no lo vuelve a ver. */
  consentimiento?: { firmado: boolean }
  /** Quien firma por un menor es su madre, su padre o su acudiente. */
  esMenor?: boolean
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
  /**
   * La hora que tocó, todavía sin agendar.
   *
   * Antes tocar una hora la agendaba: se creaba la cita APARTADA y la pantalla
   * le pedía la firma después. Quien cerraba ahí dejaba ocupada una hora que
   * no servía para nada —sin consentimiento no se empieza la sesión— y
   * coordinación tenía que perseguir la firma o soltar el espacio a mano.
   *
   * Ahora tocar una hora es elegirla, no reservarla. Lo que la agenda es
   * confirmar, con el consentimiento aceptado en el mismo acto.
   */
  const [elegida, setElegida] = useState<Hueco | null>(null)
  const [acepta, setAcepta] = useState(false)
  const [nombre, setNombre] = useState('')
  const [enviando, setEnviando] = useState(false)
  // Las fechas más allá de las tres primeras, plegadas hasta que se pidan.
  const [verTodo, setVerTodo] = useState(false)
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

  /** Tocar una hora la pone sobre la mesa. No agenda nada todavía. */
  function elegir(h: Hueco) {
    setElegida(h)
    setError(null)
    // La lista se sustituye por la confirmación: en el móvil, sin esto la
    // persona se queda mirando el sitio donde estaba el botón que tocó.
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /**
   * Agendar: la hora y el consentimiento, en una sola petición.
   *
   * Las dos cosas o ninguna. Si falta la firma, el servidor no crea la cita —y
   * por eso aquí no hay ningún estado intermedio que deshacer.
   */
  async function confirmar() {
    if (!elegida) return
    setError(null)

    if (debeFirmar) {
      if (!acepta) {
        setError('Marca la casilla para aceptar el consentimiento.')
        return
      }
      if (nombre.trim().length < 5) {
        setError('Escribe tu nombre completo: esa es tu firma.')
        return
      }
    }

    setEnviando(true)
    try {
      const res = await fetch(`/api/mi-agenda/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inicio: elegida.inicio,
          ...(debeFirmar
            ? {
                consentimiento: {
                  acepta: true,
                  nombreFirma: nombre.trim(),
                  version: CONSENTIMIENTO_SESION.version,
                },
              }
            : {}),
        }),
      })
      const datos = await res.json()
      if (res.ok && datos?.success) {
        setListo({ cuando: datos.data.cuando, profesional: datos.data.profesional })
      } else {
        // Lo más probable: alguien tomó esa hora mientras ella leía. Se vuelve
        // a la lista de verdad para que no choque otra vez contra lo mismo.
        setError(datos?.message ?? 'No pudimos agendar esa hora.')
        setElegida(null)
        await cargar()
      }
    } catch {
      setError('No pudimos conectarnos. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  /** A quien ya firmó no se le pide firmar otra vez. */
  const debeFirmar = estado?.consentimiento?.firmado !== true

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
        <p style={{ color: '#475569', fontWeight: 600 }}>Buscando horarios disponibles…</p>
      </div>
    )
  }

  /**
   * Agendada, sin peros.
   *
   * Aquí solo se llega con la hora tomada y el consentimiento aceptado: ya no
   * hay una variante «te guardamos la hora, ahora firma». Ese estado
   * intermedio era una promesa a medias —el espacio ocupado, la sesión
   * imposible— y se quitó de raíz moviendo la firma al momento de agendar.
   */
  if (listo) {
    return (
      <div style={{ ...marco, alignItems: 'center' }}>
        <div style={{ ...tarjeta, textAlign: 'center' }}>
          <CheckCircle2 size={44} style={{ color: MARCA.verde, margin: '0 auto 12px' }} />
          <h1 style={{ fontSize: '1.3rem', color: MARCA.tinta, margin: '0 0 8px' }}>
            Tu sesión quedó agendada
          </h1>
          <p style={{ color: MARCA.tintaSuave, margin: 0, lineHeight: 1.6 }}>
            <strong>{listo.cuando}</strong>
            <br />
            con {listo.profesional}
          </p>
          <p
            style={{
              color: MARCA.tintaSuave,
              fontSize: '0.88rem',
              marginTop: 18,
              lineHeight: 1.6,
            }}
          >
            Te llegan los detalles y tu enlace para entrar. Si te surge algo y no puedes,
            avísanos con tiempo y lo movemos: no pasa nada.
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

  /**
   * Sin profesional hay dos pantallas, no una.
   *
   * Esta decía siempre «todavía estamos buscando… te avisamos por WhatsApp».
   * Con el acompañamiento ya cerrado eso no es cierto —nadie está buscando— y
   * quien vuelva a abrir su enlace meses después se queda esperando un aviso
   * que no va a llegar. El enlace le sirve para todas sus sesiones, así que
   * volver a abrirlo es lo normal, no la excepción.
   */
  if (estado.estado === 'ACOMPANAMIENTO_CERRADO') {
    return (
      <div style={{ ...marco, alignItems: 'center' }}>
        <div style={{ ...tarjeta, textAlign: 'center' }}>
          <Clock size={40} style={{ color: '#0284c7', margin: '0 auto 12px' }} />
          <h1 style={{ fontSize: '1.2rem', color: '#0f172a', margin: '0 0 8px' }}>
            Tu acompañamiento está cerrado
          </h1>
          <p style={{ color: '#475569', fontSize: '0.94rem', margin: 0, lineHeight: 1.6 }}>
            Por eso no hay horas para elegir. Si quieres retomarlo o necesitas hablar con
            alguien, escríbenos por WhatsApp y lo abrimos de nuevo: aquí seguimos.
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
        {/*
          La marca antes que el saludo.
        
          A esta pantalla se llega desde un enlace de WhatsApp: sin menú, sin
          sesión, sin nada que diga de quién es. Y lo primero que hace es
          enseñarle a alguien el nombre de la profesional que la va a acompañar.
          Saber de dónde viene el enlace no es decoración aquí.
        */}
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
          {estado.persona ? `Hola, ${estado.persona}` : 'Hola'}
        </h1>
        <p
          style={{
            color: MARCA.tintaSuave,
            margin: '0 0 4px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <User size={16} style={{ color: MARCA.verde }} />
          Tu acompañamiento es con <strong style={{ color: MARCA.tinta }}>{estado.profesional}</strong>
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

        {error ? (
          <p
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: '0.88rem',
              margin: '18px 0 0',
            }}
          >
            {error}
          </p>
        ) : null}

        {/*
          Elegida la hora, la misma tarjeta pasa a confirmarla.

          No es otra pantalla ni otro momento: la hora y el consentimiento son
          una sola decisión, y hasta que no estén las dos no se agenda nada. La
          lista se sustituye en vez de crecer hacia abajo porque en el móvil,
          creciendo, la persona se queda mirando el sitio donde estaba el botón
          que acaba de tocar.
        */}
        {elegida ? (
          <>
            <button
              type="button"
              onClick={() => setElegida(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                padding: 0,
                margin: '20px 0 12px',
                color: MARCA.tintaSuave,
                fontSize: '0.86rem',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={15} />
              Elegir otra hora
            </button>

            <div
              style={{
                background: MARCA.verdeSuave,
                border: `1px solid ${MARCA.borde}`,
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 22,
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontSize: '0.74rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: MARCA.tintaSuave,
                  marginBottom: 5,
                }}
              >
                Tu sesión
              </span>
              <strong
                style={{ display: 'block', fontSize: '1.02rem', color: MARCA.tinta, lineHeight: 1.4 }}
              >
                {elegida.cuando}
              </strong>
              <span style={{ fontSize: '0.88rem', color: MARCA.tintaSuave }}>
                con {estado.profesional} · 45 minutos
              </span>
            </div>

            {debeFirmar ? (
              <>
                <h2 style={{ fontSize: '1rem', color: MARCA.tinta, margin: '0 0 4px' }}>
                  Léelo y acéptalo para agendar
                </h2>
                <p
                  style={{
                    color: MARCA.tintaSuave,
                    fontSize: '0.86rem',
                    margin: '0 0 16px',
                    lineHeight: 1.6,
                  }}
                >
                  Es lo único que falta, y solo se hace la primera vez.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
                  {CONSENTIMIENTO_SESION.puntos.map((punto) => (
                    <div key={punto.titulo}>
                      <strong
                        style={{
                          display: 'block',
                          fontSize: '0.9rem',
                          color: MARCA.tinta,
                          marginBottom: 3,
                        }}
                      >
                        {punto.titulo}
                      </strong>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.86rem',
                          color: MARCA.tintaSuave,
                          lineHeight: 1.6,
                        }}
                      >
                        {punto.texto}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Con URL propia: para leerlo con calma, guardarlo o enseñárselo a alguien. */}
                <a
                  href={CONSENTIMIENTO_SESION.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    fontSize: '0.84rem',
                    color: MARCA.verde,
                    marginBottom: 18,
                  }}
                >
                  Ver el texto completo en una página aparte
                </a>

                {estado.esMenor ? (
                  <p
                    style={{
                      background: MARCA.crema,
                      borderRadius: 10,
                      padding: '11px 13px',
                      fontSize: '0.85rem',
                      color: MARCA.tinta,
                      lineHeight: 1.6,
                      margin: '0 0 16px',
                    }}
                  >
                    Como la persona acompañada es menor de edad, quien acepta y firma aquí debe
                    ser su madre, su padre o su acudiente.
                  </p>
                ) : null}

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    marginBottom: 18,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={acepta}
                    onChange={(e) => {
                      setAcepta(e.target.checked)
                      setError(null)
                    }}
                    style={{ marginTop: 3, width: 18, height: 18, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '0.88rem', color: MARCA.tinta, lineHeight: 1.6 }}>
                    Leí y acepto este consentimiento para recibir el acompañamiento.
                    {estado.esMenor
                      ? ' Soy la madre, el padre o acudiente y autorizo la sesión.'
                      : ''}
                  </span>
                </label>

                <label
                  htmlFor="firma"
                  style={{
                    display: 'block',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: MARCA.tinta,
                    marginBottom: 3,
                  }}
                >
                  Tu nombre completo
                </label>
                <p style={{ fontSize: '0.82rem', color: MARCA.tintaSuave, margin: '0 0 7px' }}>
                  Escribirlo aquí es tu firma.
                </p>
                <input
                  id="firma"
                  value={nombre}
                  maxLength={120}
                  autoComplete="name"
                  onChange={(e) => {
                    setNombre(e.target.value)
                    setError(null)
                  }}
                  style={{
                    width: '100%',
                    padding: '11px 13px',
                    borderRadius: 10,
                    border: `1px solid ${MARCA.borde}`,
                    background: MARCA.tarjeta,
                    color: MARCA.tinta,
                    fontSize: '0.95rem',
                    marginBottom: 20,
                    boxSizing: 'border-box',
                  }}
                />
              </>
            ) : (
              <p
                style={{
                  color: MARCA.tintaSuave,
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  margin: '0 0 20px',
                }}
              >
                Ya aceptaste el consentimiento en una sesión anterior, así que no hay que
                repetirlo.{' '}
                <a
                  href={CONSENTIMIENTO_SESION.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: MARCA.verde }}
                >
                  Puedes releerlo aquí
                </a>
                .
              </p>
            )}

            <button
              type="button"
              onClick={confirmar}
              disabled={enviando}
              style={{
                width: '100%',
                padding: '15px 18px',
                borderRadius: 12,
                border: 'none',
                background: MARCA.noche,
                color: '#fff6eb',
                fontSize: '0.98rem',
                fontWeight: 700,
                cursor: enviando ? 'wait' : 'pointer',
                opacity: enviando ? 0.7 : 1,
              }}
            >
              {enviando ? 'Agendando…' : 'Confirmar mi sesión'}
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '1rem', color: MARCA.tinta, margin: '20px 0 4px' }}>
              Elige la hora que te sirva
            </h2>
            <p style={{ color: MARCA.tintaSuave, fontSize: '0.86rem', margin: '0 0 14px' }}>
              Son las horas en las que {estado.profesional.split(' ')[0]} puede atenderte. Cada
              sesión dura 45 minutos.
              {debeFirmar
                ? ' Al elegirla te pediremos aceptar el consentimiento: se agenda con las dos cosas.'
                : ''}
            </p>

            {estado.huecos.length === 0 ? (
          <p style={{ color: MARCA.tintaSuave, fontSize: '0.94rem', lineHeight: 1.6 }}>
            Ahora mismo no hay horas libres en su agenda. Escríbenos por WhatsApp y lo cuadramos
            contigo.
          </p>
        ) : (
          <>
            {/*
              El atajo: la primera hora libre, a un toque.
            
              Es lo que quiere la mayoría —lo antes posible— y hasta ahora había
              que buscarlo entre decenas de botones. Quien está mal no viene a
              comparar horarios, viene a que la atiendan pronto; el que quiera
              elegir tiene la lista justo debajo.
            */}
            {(() => {
              const primero = estado.huecos[0]
              return (
                <button
                  type="button"
                  onClick={() => elegir(primero)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '15px 18px',
                    borderRadius: 12,
                    border: 'none',
                    background: MARCA.noche,
                    color: '#fff6eb',
                    cursor: 'pointer',
                    marginBottom: 20,
                  }}
                >
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '0.98rem' }}>
                    La más pronto posible
                  </span>
                  <span style={{ display: 'block', fontSize: '0.85rem', opacity: 0.82, marginTop: 3 }}>
                    {primero.cuando}
                  </span>
                </button>
              )
            })()}

            <p
              style={{
                color: MARCA.tintaSuave,
                fontSize: '0.86rem',
                margin: '0 0 14px',
              }}
            >
              …o elige otra:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {porDia(estado.huecos)
                .slice(0, verTodo ? undefined : DIAS_VISIBLES)
                .map(([dia, delDia]) => (
                  <div key={dia}>
                    <h3
                      style={{
                        margin: '0 0 10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: MARCA.tintaSuave,
                      }}
                    >
                      {dia}
                    </h3>

                    {/*
                      Por momento del día, no en rejilla plana.
                    
                      «Mañana / Tarde / Noche» es como la gente piensa su día:
                      tres decisiones en vez de una lista de horas sueltas. La
                      etiqueta solo aparece si ese momento tiene algo.
                    */}
                    {(['Mañana', 'Tarde', 'Noche'] as const).map((momento) => {
                      const delMomento = delDia.filter((h) => momentoDelDia(h.cuando) === momento)
                      if (delMomento.length === 0) return null

                      return (
                        <div
                          key={momento}
                          style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}
                        >
                          <span
                            style={{
                              minWidth: 54,
                              fontSize: '0.78rem',
                              color: MARCA.tintaSuave,
                              flexShrink: 0,
                            }}
                          >
                            {momento}
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {delMomento.map((h) => (
                              <button
                                key={h.inicio}
                                type="button"
                                onClick={() => elegir(h)}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: 10,
                                  border: `1px solid ${MARCA.borde}`,
                                  background: MARCA.tarjeta,
                                  color: MARCA.tinta,
                                  fontSize: '0.92rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {soloHora(h.cuando)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
            </div>

            {/*
              El resto de fechas, plegado. Quien está mal quiere pronto, no
              dentro de tres semanas — pero si ninguna de estas le sirve, las
              demás siguen ahí a un toque.
            */}
            {!verTodo && porDia(estado.huecos).length > DIAS_VISIBLES ? (
              <button
                type="button"
                onClick={() => setVerTodo(true)}
                style={{
                  marginTop: 18,
                  width: '100%',
                  padding: '11px',
                  borderRadius: 10,
                  border: `1px solid ${MARCA.borde}`,
                  background: MARCA.crema,
                  color: MARCA.tinta,
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Ver más fechas
              </button>
            ) : null}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
