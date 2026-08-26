'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  ChevronDown,
  Brain,
  Heart,
  Users,
  Building,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { whatsappHref, site } from '@/lib/site'

type CategoriaFAQ = 'psicologia' | 'pacientes' | 'voluntarios' | 'fundacion'

interface PreguntaItem {
  id: string
  categoria: CategoriaFAQ
  badge?: string
  pregunta: string
  respuesta: React.ReactNode
}

const CATEGORIAS: {
  id: CategoriaFAQ
  label: string
  icon: typeof Brain
  sublabel: string
}[] = [
  {
    id: 'psicologia',
    label: 'Profesionales de Psicología',
    icon: Brain,
    sublabel: 'ReTHUS, acompañamiento y marco ético',
  },
  {
    id: 'pacientes',
    label: 'Personas y Familias',
    icon: Heart,
    sublabel: 'Solicitud de apoyo, gratuidad y sesiones',
  },
  {
    id: 'voluntarios',
    label: 'Voluntariado General',
    icon: Users,
    sublabel: 'Otras disciplinas y labores de apoyo',
  },
  {
    id: 'fundacion',
    label: 'Sobre la Fundación',
    icon: Building,
    sublabel: 'Misión, datos y marco legal',
  },
]

const PREGUNTAS: PreguntaItem[] = [
  // ─── 1. PROFESIONALES DE PSICOLOGÍA ─────────────────────────────────────────
  {
    id: 'psi-reps-rethus',
    categoria: 'psicologia',
    badge: 'Marco Legal ReTHUS',
    pregunta: '¿Necesito tener REPS como profesional independiente para hacer parte de la red?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          <strong>No necesitas tener REPS como profesional independiente</strong> para hacer parte del modelo de acompañamiento de Aquí Estamos.
        </p>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          Tu <strong>ReTHUS</strong> (Registro Único Nacional del Talento Humano en Salud) y tu <strong>tarjeta profesional vigente</strong> son los requisitos profesionales oficiales que verificamos para tu vinculación.
        </p>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          El REPS corresponde al prestador institucional y, en nuestro modelo, estamos estructurando la <strong>Fundación Aquí Estamos</strong> como la persona jurídica que organiza, gestiona y respalda el acompañamiento. Mientras consolidamos el modelo de habilitación institucional correspondiente, tu participación se encuentra enmarcada en el alcance propio del <strong>acompañamiento psicológico, primeros auxilios emocionales y contención en crisis</strong> de Aquí Estamos, y no en la prestación independiente de consultas o tratamientos clínicos aislados.
        </p>
      </div>
    ),
  },
  {
    id: 'psi-registro-confidencialidad',
    categoria: 'psicologia',
    pregunta: '¿Cómo se maneja el registro de las sesiones y la confidencialidad de la información?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          Todo el proceso se rige bajo estrictos principios de <strong>secreto profesional</strong> y la <strong>Ley 1581 de 2012 (Habeas Data)</strong>.
        </p>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          Como profesional, accedes al caso asignado a través de un <strong>enlace seguro con autenticación</strong> donde únicamente se visualizan los datos necesarios para brindar la atención. Al finalizar cada sesión, registras una bitácora breve sobre el estado del proceso en la plataforma interna. Nunca compartimos números de teléfono ni datos sensibles en canales abiertos.
        </p>
      </div>
    ),
  },
  {
    id: 'psi-disponibilidad-horarios',
    categoria: 'psicologia',
    pregunta: '¿Cuánto tiempo debo dedicar y cómo se coordina mi disponibilidad?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          El voluntariado es flexible y se adapta a tu agenda. Al postularte en{' '}
          <Link href="/quiero-ser-parte" style={{ color: '#15162e', fontWeight: 700, textDecoration: 'underline' }}>
            Quiero dar apoyo psicológico
          </Link>
          , tú decides cuántas horas semanales puedes aportar y en qué días y franjas horarias (mañanas, tardes o noches).
        </p>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          Nuestro sistema solo te propone personas que coincidan exactamente con tus horarios declarados. Las sesiones duran <strong>45 minutos</strong> y la plataforma programa intervalos automáticos de descanso entre citas para cuidar tu bienestar.
        </p>
      </div>
    ),
  },
  {
    id: 'psi-alcance-casos',
    categoria: 'psicologia',
    pregunta: '¿Qué tipo de casos atiende la Red Aquí Estamos?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          Nos enfocamos en <strong>primeros auxilios psicológicos, contención emocional y acompañamiento psicosocial breve</strong> (ciclos de 3 a 4 sesiones).
        </p>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          No atendemos urgencias psiquiátricas con riesgo vital inminente ni psicopatologías severas que requieran hospitalización. En caso de detectarse un riesgo alto durante el tamizaje o la sesión, se activa de inmediato la <strong>ruta de remisión institucional</strong> hacia centros de salud y líneas nacionales de emergencia.
        </p>
      </div>
    ),
  },

  // ─── 2. PERSONAS Y FAMILIAS ────────────────────────────────────────────────
  {
    id: 'pac-gratuidad',
    categoria: 'pacientes',
    badge: '100% Gratuito',
    pregunta: '¿El servicio de atención y acompañamiento psicológico tiene algún costo?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          <strong>No, es completamente gratuito.</strong> La Red Aquí Estamos es una iniciativa solidaria sin ánimo de lucro creada para garantizar que cualquier persona que necesite apoyo emocional pueda recibirlo sin barreras económicas.
        </p>
      </div>
    ),
  },
  {
    id: 'pac-como-solicitar',
    categoria: 'pacientes',
    pregunta: '¿Cómo solicito una sesión de acompañamiento psicológico?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          Solo debes ingresar a{' '}
          <Link href="/atencion-psicologica" style={{ color: '#15162e', fontWeight: 700, textDecoration: 'underline' }}>
            Necesito ayuda
          </Link>{' '}
          y diligenciar un formulario breve con tus datos de contacto y tus horarios disponibles.
        </p>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          Un coordinador de nuestro equipo revisará tu solicitud y te contactará por <strong>WhatsApp o correo electrónico</strong> para confirmar la fecha y hora de tu primera sesión con un psicólogo/a voluntario/a.
        </p>
      </div>
    ),
  },
  {
    id: 'pac-cuantas-sesiones',
    categoria: 'pacientes',
    pregunta: '¿Cuántas sesiones de apoyo voy a recibir?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          El programa contempla un ciclo de <strong>3 a 4 sesiones de acompañamiento focalizado</strong> con el mismo profesional.
        </p>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          Al concluir este proceso, si tú y el profesional consideran que requieres un tratamiento continuo o especializado a largo plazo, te brindamos orientación sobre redes de salud y servicios complementarios.
        </p>
      </div>
    ),
  },
  {
    id: 'pac-modalidad',
    categoria: 'pacientes',
    pregunta: '¿La atención es virtual o presencial?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          La gran mayoría de las atenciones se realizan de manera <strong>virtual (por videollamada o llamada telefónica)</strong>, permitiendo brindar apoyo a personas en cualquier municipio de Colombia o en el exterior.
        </p>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          En caso de realizarse jornadas o brigadas comunitarias presenciales en puntos específicos, se informará oportunamente en nuestros canales oficiales.
        </p>
      </div>
    ),
  },
  {
    id: 'pac-emergencias-graves',
    categoria: 'pacientes',
    badge: 'Atención de Emergencias',
    pregunta: '¿Qué debo hacer en caso de una emergencia vital o crisis inmediata?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          Si tú o una persona cercana se encuentra en riesgo inminente, con ideación suicida activa o peligro para su integridad física, <strong>debes acudir de inmediato al centro de salud o urgencias más cercano</strong> o comunicarte con las líneas gratuitas de emergencia nacional:
        </p>
        <ul style={{ margin: 0, paddingLeft: 22, lineHeight: 1.7 }}>
          <li>
            <strong>Línea Nacional de Emergencias:</strong> 123
          </li>
          <li>
            <strong>Línea de Orientación en Salud Mental (Minsalud):</strong> 106 / 192
          </li>
          <li>
            <strong>Línea Púrpura (Mujeres en Bogotá):</strong> 018000 112 137
          </li>
        </ul>
      </div>
    ),
  },

  // ─── 3. VOLUNTARIOS GENERALES (OTRAS DISCIPLINAS) ──────────────────────────
  {
    id: 'vol-quienes-pueden',
    categoria: 'voluntarios',
    pregunta: 'No soy psicólogo/a, ¿cómo puedo sumarme como voluntario/a?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          ¡Tu talento es fundamental para la red! En nuestro programa{' '}
          <Link href="/quiero-apoyar" style={{ color: '#15162e', fontWeight: 700, textDecoration: 'underline' }}>
            Quiero apoyar (Voluntariado General)
          </Link>{' '}
          recibimos a profesionales y estudiantes de <strong>derecho, medicina, enfermería, trabajo social, diseño gráfico, comunicaciones, ingeniería de sistemas, administración, logística y gestión comunitaria</strong>.
        </p>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          Apoyamos en labores internas de verificación de perfiles, gestión de agendas, creación de piezas pedagógicas, llamadas de seguimiento y soporte organizativo.
        </p>
      </div>
    ),
  },
  {
    id: 'vol-como-asignan-tareas',
    categoria: 'voluntarios',
    pregunta: '¿Cómo me asignan las labores o turnos de apoyo?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          Cuando el equipo de coordinación genera una tarea que coincide con tu disponibilidad horaria y disciplina, te llegará una invitación personalizada a tu correo o WhatsApp con un enlace único (<code style={{ background: '#f5f0eb', padding: '2px 6px', borderRadius: 4, fontSize: '0.86rem', color: '#15162e' }}>/turno/...</code>).
        </p>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          Al abrir el enlace podrás ver los detalles de la labor, fecha, horario y notas del equipo, y confirmar con un solo clic si aceptas participar.
        </p>
      </div>
    ),
  },
  {
    id: 'vol-certificado',
    categoria: 'voluntarios',
    pregunta: '¿Entregan certificado de horas de voluntariado?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          <strong>No.</strong> La Red Aquí Estamos es una iniciativa de apoyo solidario y comunitario que <strong>no emite certificados de voluntariado ni constancias de horas</strong> para fines académicos o laborales. La vinculación de todos los profesionales y colaboradores es 100% voluntaria, motivada por el compromiso social y el cuidado colectivo.
        </p>
      </div>
    ),
  },

  // ─── 4. SOBRE LA FUNDACIÓN Y SEGURIDAD ─────────────────────────────────────
  {
    id: 'fun-que-es',
    categoria: 'fundacion',
    pregunta: '¿Qué es la Red Aquí Estamos y cuál es su misión?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          Somos una red colaborativa sin ánimo de lucro que busca facilitar el acceso universal a la atención psicológica y promover el bienestar emocional a través de la comunidad, la información y el acompañamiento humano, aportando a la reconstrucción del tejido social.
        </p>
      </div>
    ),
  },
  {
    id: 'fun-seguridad-datos',
    categoria: 'fundacion',
    pregunta: '¿Cómo protegen mis datos personales y mi privacidad?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          Toda la información registrada se trata bajo estrictos estándares de seguridad informática y en total apego a la <strong>Ley Estatutaria 1581 de 2012</strong> de Protección de Datos Personales (Habeas Data).
        </p>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          Puedes consultar nuestra política completa en{' '}
          <Link href="/politica-de-datos" style={{ color: '#15162e', fontWeight: 700, textDecoration: 'underline' }}>
            Política de datos
          </Link>
          . Tus datos nunca son comercializados ni compartidos con terceros.
        </p>
      </div>
    ),
  },
]

export function SeccionPreguntasFrecuentes() {
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaFAQ>('psicologia')
  const [busqueda, setBusqueda] = useState('')
  const [itemAbierto, setItemAbierto] = useState<string | null>('psi-reps-rethus')

  const preguntasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) {
      return PREGUNTAS.filter((p) => p.categoria === categoriaActiva)
    }
    return PREGUNTAS.filter((p) => p.pregunta.toLowerCase().includes(q))
  }, [categoriaActiva, busqueda])

  function alternarItem(id: string) {
    setItemAbierto((prev) => (prev === id ? null : id))
  }

  const categoriaActualData = CATEGORIAS.find((c) => c.id === categoriaActiva)

  return (
    <section
      className="content content--wide section"
      id="preguntas-frecuentes"
      style={{ scrollMarginTop: 90 }}
    >
      {/* Encabezado de la sección al estilo del sitio */}
      <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 36px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 999,
            backgroundColor: '#ffffff',
            border: '1px solid var(--color-border-default)',
            color: 'var(--color-text-default)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: 16,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <Sparkles size={14} style={{ color: 'var(--color-orange)' }} />
          <span>Centro de orientación y respuestas</span>
        </div>

        <h2 style={{ fontSize: 'clamp(1.85rem, 4.5vw, 2.5rem)', color: 'var(--color-text-default)', marginBottom: 12 }}>
          Preguntas frecuentes
        </h2>
        <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
          Resolvemos tus dudas sobre cómo recibir atención, vincularte como profesional voluntario/a o apoyar en labores de la fundación.
        </p>
      </div>

      {/* Buscador armonizado con el fondo crema */}
      <div style={{ maxWidth: 580, margin: '0 auto 32px', position: 'relative' }}>
        <Search
          size={18}
          color="var(--color-text-light)"
          style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <input
          type="text"
          placeholder="Buscar una duda (ej. REPS, ReTHUS, costo, sesiones, certificado...)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: '100%',
            padding: '13px 18px 13px 44px',
            borderRadius: 'var(--border-radii-layout)',
            border: '1px solid var(--color-border-default)',
            fontSize: '0.94rem',
            outline: 'none',
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text-default)',
            boxShadow: 'var(--shadow-card)',
            transition: 'border-color 0.15s ease',
          }}
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => setBusqueda('')}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              border: '1px solid var(--color-border-default)',
              backgroundColor: 'var(--color-bg-default)',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--color-text-default)',
              cursor: 'pointer',
            }}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Selector de categorías tipo Cards / Pills del diseño */}
      {!busqueda && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 12,
            marginBottom: 32,
          }}
        >
          {CATEGORIAS.map((cat) => {
            const Icono = cat.icon
            const activa = categoriaActiva === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategoriaActiva(cat.id)
                  const primero = PREGUNTAS.find((p) => p.categoria === cat.id)
                  if (primero) setItemAbierto(primero.id)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '14px 16px',
                  borderRadius: 'var(--border-radii-layout)',
                  border: activa ? '2px solid #15162e' : '1px solid var(--color-border-default)',
                  backgroundColor: activa ? '#15162e' : '#ffffff',
                  color: activa ? '#fff6eb' : 'var(--color-text-default)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: activa ? '0 6px 16px rgba(21, 22, 46, 0.15)' : 'var(--shadow-card)',
                  transform: activa ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: activa ? 'rgba(255, 246, 235, 0.15)' : 'var(--color-bg-default)',
                    color: activa ? '#fff6eb' : 'var(--color-text-default)',
                    lineHeight: 0,
                    flexShrink: 0,
                  }}
                >
                  <Icono size={18} />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.92rem', lineHeight: 1.3, marginBottom: 2 }}>
                    {cat.label}
                  </strong>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.76rem',
                      color: activa ? 'rgba(255, 246, 235, 0.75)' : 'var(--color-text-light)',
                      lineHeight: 1.3,
                    }}
                  >
                    {cat.sublabel}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Indicador de contexto de búsqueda */}
      {busqueda && (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', margin: 0 }}>
            Resultados de búsqueda para &ldquo;<strong>{busqueda}</strong>&rdquo; ({preguntasFiltradas.length}{' '}
            {preguntasFiltradas.length === 1 ? 'coincidencia' : 'coincidencias'})
          </p>
        </div>
      )}

      {/* Lista de Acordeones con estilo Notion / Aquí Estamos */}
      <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {preguntasFiltradas.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 24px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--border-radii-layout)',
              border: '1px dashed var(--color-border-default)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <p style={{ color: 'var(--color-text-light)', fontSize: '0.96rem', margin: '0 0 14px' }}>
              No encontramos preguntas relacionadas con &ldquo;{busqueda}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="button button--primary"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              Ver todas las preguntas
            </button>
          </div>
        ) : (
          preguntasFiltradas.map((item) => {
            const abierta = itemAbierto === item.id
            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: abierta ? '1.5px solid #15162e' : '1px solid var(--color-border-default)',
                  borderRadius: 'var(--border-radii-layout)',
                  overflow: 'hidden',
                  boxShadow: abierta ? '0 6px 18px rgba(0,0,0,0.08)' : 'var(--shadow-card)',
                  transition: 'all 0.16s ease',
                }}
              >
                <button
                  type="button"
                  onClick={() => alternarItem(item.id)}
                  aria-expanded={abierta}
                  style={{
                    width: '100%',
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    backgroundColor: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {item.badge && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: '#15162e',
                          backgroundColor: 'var(--color-bg-default)',
                          padding: '2px 8px',
                          borderRadius: 4,
                          width: 'fit-content',
                        }}
                      >
                        <ShieldCheck size={12} color="var(--color-blue)" />
                        {item.badge}
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: 'var(--font-cormorant), Georgia, serif',
                        fontSize: '1.22rem',
                        fontWeight: 600,
                        color: abierta ? '#15162e' : 'var(--color-text-default)',
                        lineHeight: 1.35,
                      }}
                    >
                      {item.pregunta}
                    </span>
                  </div>

                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: abierta ? '#15162e' : 'var(--color-bg-default)',
                      color: abierta ? '#fff6eb' : 'var(--color-text-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ChevronDown
                      size={16}
                      style={{
                        transform: abierta ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>
                </button>

                {abierta && (
                  <div
                    style={{
                      padding: '0 22px 22px',
                      color: 'var(--color-text-default)',
                      fontSize: '0.94rem',
                      borderTop: '1px solid rgba(55, 53, 47, 0.08)',
                      paddingTop: 16,
                    }}
                  >
                    {item.respuesta}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Tarjeta de soporte / dudas adicionales con estilo Notion Callout */}
      <div
        className="callout"
        style={{
          maxWidth: 840,
          margin: '36px auto 0',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: 'var(--shadow-card)',
          borderRadius: 'var(--border-radii-layout)',
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: '#15162e',
              color: '#fff6eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MessageCircle size={22} />
          </div>
          <div>
            <strong style={{ fontSize: '1rem', color: 'var(--color-text-default)', display: 'block', marginBottom: 2 }}>
              ¿Tienes alguna duda adicional sobre el modelo o la red?
            </strong>
            <span className="text-muted" style={{ fontSize: '0.88rem' }}>
              Nuestro equipo de coordinación está disponible para orientarte directamente.
            </span>
          </div>
        </div>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="button button--primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            fontSize: '0.9rem',
          }}
        >
          <MessageCircle size={17} />
          <span>Escribir por WhatsApp</span>
        </a>
      </div>
    </section>
  )
}
