'use client'

import Image from 'next/image'
import { momentoDelDia } from '@/lib/momentoDelDia'
import { useEffect, useState, use } from 'react'
import { CalendarCheck, Clock, User, AlertCircle, CheckCircle2 } from 'lucide-react'
import { FormularioConsentimiento } from '../../consentimiento/[token]/FormularioConsentimiento'
import '../../tamizaje/[token]/tamizaje.css'

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
  // Las fechas más allá de las tres primeras, plegadas hasta que se pidan.
  const [verTodo, setVerTodo] = useState(false)
  const [listo, setListo] = useState<{
    cuando: string
    profesional: string
    consentimiento?: { firmado: boolean; token: string | null }
    esMenor?: boolean
  } | null>(null)

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
        setListo({
          cuando: datos.data.cuando,
          profesional: datos.data.profesional,
          consentimiento: datos.data.consentimiento,
          esMenor: datos.data.esMenor,
        })
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

  if (listo) {
    return (
      /*
        En columna, a propósito. El marco es un flex en fila: con una sola
        tarjeta no se notaba, pero al añadir la del consentimiento las dos
        quedaron una al lado de la otra —en el móvil, dos columnas de 150px
        con el texto a trompicones—. Apiladas y centradas, cada una a su
        ancho completo.
      */
      <div style={{ ...marco, flexDirection: 'column', alignItems: 'center', gap: 14 }}>
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

        {/*
          El consentimiento, aquí y ahora.

          Era otro enlace y otro mensaje: la persona elegía su hora, y después
          alguien tenía que acordarse de mandarle por WhatsApp el enlace para
          firmar. Dos toques humanos —y a veces días— para una firma que puede
          darse en este mismo momento, con la sesión recién acordada y la
          persona delante de la pantalla. Si ya lo firmó en una sesión
          anterior, la cita hereda la firma y esto no aparece.
        */}
        {listo.consentimiento && !listo.consentimiento.firmado && listo.consentimiento.token ? (
          <div style={tarjeta}>
            <h2 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0 0 6px' }}>
              Solo falta una cosa: tu consentimiento
            </h2>
            <p style={{ color: '#475569', margin: '0 0 14px', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Antes de la sesión necesitamos que leas y aceptes esto. Toma un minuto y se hace
              aquí mismo.
            </p>
            <FormularioConsentimiento
              token={listo.consentimiento.token}
              esMenor={listo.esMenor === true}
              yaFirmado={false}
            />
          </div>
        ) : null}
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
                  disabled={eligiendo !== null}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '15px 18px',
                    borderRadius: 12,
                    border: 'none',
                    background: MARCA.noche,
                    color: '#fff6eb',
                    cursor: eligiendo ? 'wait' : 'pointer',
                    marginBottom: 20,
                    opacity: eligiendo && eligiendo !== primero.inicio ? 0.55 : 1,
                  }}
                >
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '0.98rem' }}>
                    {eligiendo === primero.inicio ? 'Agendando…' : 'La más pronto posible'}
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
                                disabled={eligiendo !== null}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: 10,
                                  border: `1px solid ${MARCA.borde}`,
                                  background:
                                    eligiendo === h.inicio ? MARCA.verdeSuave : MARCA.tarjeta,
                                  color: MARCA.tinta,
                                  fontSize: '0.92rem',
                                  fontWeight: 600,
                                  cursor: eligiendo ? 'wait' : 'pointer',
                                  opacity: eligiendo && eligiendo !== h.inicio ? 0.5 : 1,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {eligiendo === h.inicio ? '…' : soloHora(h.cuando)}
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
      </div>
    </div>
  )
}
