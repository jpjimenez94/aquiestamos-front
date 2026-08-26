'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  HelpCircle,
  Search,
  ChevronDown,
  Brain,
  HeartHandshake,
  Users,
  Building2,
  MessageCircle,
} from 'lucide-react'
import { whatsappHref } from '@/lib/site'

type CategoriaFAQ = 'psicologia' | 'pacientes' | 'voluntarios' | 'fundacion'

interface PreguntaItem {
  id: string
  categoria: CategoriaFAQ
  pregunta: string
  respuesta: React.ReactNode
}

const CATEGORIAS: { id: CategoriaFAQ; label: string; icon: typeof Brain }[] = [
  { id: 'psicologia', label: 'Profesionales de Psicología', icon: Brain },
  { id: 'pacientes', label: 'Personas y Familias', icon: HeartHandshake },
  { id: 'voluntarios', label: 'Voluntarios Generales', icon: Users },
  { id: 'fundacion', label: 'Sobre la Fundación', icon: Building2 },
]

const PREGUNTAS: PreguntaItem[] = [
  // ─── 1. PROFESIONALES DE PSICOLOGÍA ─────────────────────────────────────────
  {
    id: 'psi-reps-rethus',
    categoria: 'psicologia',
    pregunta: '¿Necesito tener REPS como profesional independiente para hacer parte de la red?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          <strong>No necesitas tener REPS como profesional independiente</strong> para hacer parte del modelo de acompañamiento de Aquí Estamos.
        </p>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Tu <strong>ReTHUS</strong> (Registro Único Nacional del Talento Humano en Salud) y tu <strong>tarjeta profesional vigente</strong> son los requisitos oficiales que debemos verificar.
        </p>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          El REPS corresponde al prestador institucional y, en nuestro modelo, estamos estructurando la <strong>Fundación Aquí Estamos</strong> como la persona jurídica que organiza, gestiona y presta el acompañamiento. Mientras consolidamos el modelo de habilitación correspondiente, tu participación está orientada al alcance propio del <strong>acompañamiento psicológico, contención emocional y primeros auxilios psicológicos</strong> de Aquí Estamos y no a la prestación independiente de consultas o tratamientos clínicos aislados.
        </p>
      </div>
    ),
  },
  {
    id: 'psi-registro-confidencialidad',
    categoria: 'psicologia',
    pregunta: '¿Cómo se maneja el registro de las sesiones y la confidencialidad de los datos?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Todo el flujo opera bajo estrictos protocolos de confidencialidad y secreto profesional. El profesional accede al caso mediante un <strong>enlace seguro temporal</strong> con verificación por correo, donde solo visualiza los datos necesarios para brindar la atención.
        </p>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Al concluir cada encuentro, el profesional diligencia una bitácora breve sobre el estado del acompañamiento dentro de la plataforma interna. Nunca compartimos números de teléfono ni datos sensibles en correos abiertos ni canales no protegidos, en estricto cumplimiento de la <strong>Ley 1581 de 2012 (Habeas Data)</strong>.
        </p>
      </div>
    ),
  },
  {
    id: 'psi-disponibilidad-horarios',
    categoria: 'psicologia',
    pregunta: '¿Cuánto tiempo debo dedicar y cómo se organiza mi disponibilidad?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          El voluntariado es totalmente flexible. Al postularte en <Link href="/quiero-ser-parte" style={{ color: '#059669', fontWeight: 700, textDecoration: 'underline' }}>Quiero dar apoyo psicológico</Link>, tú declaras cuántas horas a la semana puedes donar y en qué días y franjas (mañana, tarde o noche).
        </p>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Nuestro sistema solo te propone personas que coincidan exactamente con tus días y horas libres. Las sesiones tienen una duración estándar de <strong>45 minutos</strong> y el sistema respeta automáticamente intervalos de descanso entre citas para cuidar tu propio bienestar.
        </p>
      </div>
    ),
  },
  {
    id: 'psi-alcance-casos',
    categoria: 'psicologia',
    pregunta: '¿Qué tipo de casos atiende la Red Aquí Estamos?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Brindamos primeros auxilios emocionales, contención en crisis y acompañamiento psicosocial breve (ciclos de 3 a 4 sesiones).
        </p>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          No atendemos urgencias psiquiátricas con riesgo vital inminente ni psicopatologías severas que requieran hospitalización. En caso de detectarse un riesgo alto durante el tamizaje o la sesión, se activa la <strong>ruta de remisión institucional</strong> hacia centros de salud y líneas nacionales de emergencia.
        </p>
      </div>
    ),
  },

  // ─── 2. PERSONAS Y FAMILIAS ────────────────────────────────────────────────
  {
    id: 'pac-gratuidad',
    categoria: 'pacientes',
    pregunta: '¿El servicio de atención y acompañamiento psicológico tiene algún costo?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          <strong>No, es 100% gratuito.</strong> La Red Aquí Estamos es una iniciativa solidaria y sin ánimo de lucro nacida para facilitar el acceso universal al bienestar emocional y la salud mental sin barreras económicas.
        </p>
      </div>
    ),
  },
  {
    id: 'pac-como-solicitar',
    categoria: 'pacientes',
    pregunta: '¿Cómo solicito una sesión de acompañamiento psicológico?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Solo debes ingresar a <Link href="/atencion-psicologica" style={{ color: '#059669', fontWeight: 700, textDecoration: 'underline' }}>Necesito ayuda</Link> y llenar un formulario muy sencillo con tus datos de contacto y tus horarios de disponibilidad.
        </p>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Un coordinador de nuestro equipo revisará tu solicitud y te contactará directamente por <strong>WhatsApp o correo</strong> para coordinar el horario de tu primera sesión con un psicólogo/a voluntario/a.
        </p>
      </div>
    ),
  },
  {
    id: 'pac-cuantas-sesiones',
    categoria: 'pacientes',
    pregunta: '¿Cuántas sesiones de apoyo voy a recibir?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          El programa está diseñado como un proceso de <strong>3 a 4 sesiones de acompañamiento focalizado</strong> con el mismo profesional. Al finalizar el ciclo, si tú y el profesional consideran que necesitas atención especializada a largo plazo, te brindamos orientación sobre redes de salud y opciones complementarias.
        </p>
      </div>
    ),
  },
  {
    id: 'pac-modalidad',
    categoria: 'pacientes',
    pregunta: '¿La atención es virtual o presencial?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          La gran mayoría de las atenciones se realizan de forma <strong>virtual (por videollamada o llamada telefónica)</strong>, permitiendo atender a personas en cualquier departamento de Colombia o en el exterior.
        </p>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          En caso de organizarse jornadas o brigadas comunitarias presenciales en puntos específicos, se informará con anticipación en nuestras redes oficiales.
        </p>
      </div>
    ),
  },
  {
    id: 'pac-emergencias-graves',
    categoria: 'pacientes',
    pregunta: '¿Qué debo hacer en caso de una emergencia vital o crisis inmediata?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Si tú o una persona cercana se encuentra en riesgo inminente, con ideación suicida activa o peligro para su integridad física, <strong>debes acudir de inmediato al centro de urgencias de salud más cercano</strong> o comunicarte con las líneas gratuitas de emergencia nacional:
        </p>
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
          <li><strong>Línea Nacional de Emergencias:</strong> 123</li>
          <li><strong>Línea de Orientación en Salud Mental (Minsalud):</strong> 106 / 192</li>
          <li><strong>Línea Púrpura (Mujeres):</strong> 018000 112 137</li>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          ¡Tu apoyo es indispensable! En nuestro programa <Link href="/quiero-apoyar" style={{ color: '#059669', fontWeight: 700, textDecoration: 'underline' }}>Quiero apoyar (Voluntariado General)</Link> recibimos a profesionales y estudiantes de <strong>derecho, medicina, enfermería, trabajo social, diseño gráfico, comunicación social, ingeniería de sistemas, administración, logística y gestión comunitaria</strong>.
        </p>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Ayudamos a la fundación en tareas internas de validación documental, coordinación de agendas, creación de piezas pedagógicas, llamadas de seguimiento y soporte operativo.
        </p>
      </div>
    ),
  },
  {
    id: 'vol-como-asignan-tareas',
    categoria: 'voluntarios',
    pregunta: '¿Cómo me asignan las labores o turnos de apoyo?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Cuando el equipo de coordinación genera una tarea que coincide con tu disponibilidad horaria y disciplina, te llegará una invitación personalizada a tu correo o WhatsApp con un enlace único (<code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: '0.86rem' }}>/turno/...</code>).
        </p>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Al abrir el enlace puedes ver los detalles de la labor, fecha, horario y notas del equipo, y confirmar con un solo clic si aceptas participar.
        </p>
      </div>
    ),
  },
  {
    id: 'vol-certificado',
    categoria: 'voluntarios',
    pregunta: '¿Entregan certificado de horas de voluntariado?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          <strong>Sí.</strong> La Fundación Aquí Estamos certifica formalmente la participación y las horas de voluntariado dedicadas a las actividades y programas sociales de la red para tu hoja de vida o requisitos académicos.
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Somos una red colaborativa sin ánimo de lucro que busca facilitar el acceso a la atención psicológica y promover el bienestar emocional a través de la comunidad, la información y el acompañamiento humano, aportando a la reconstrucción del tejido social.
        </p>
      </div>
    ),
  },
  {
    id: 'fun-seguridad-datos',
    categoria: 'fundacion',
    pregunta: '¿Cómo protegen mis datos personales y mi privacidad?',
    respuesta: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Toda la información registrada se trata bajo estrictos estándares de seguridad informática y en total apego a la <strong>Ley Estatutaria 1581 de 2012</strong> de Protección de Datos Personales (Habeas Data).
        </p>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Puedes consultar nuestra política completa en <Link href="/politica-de-datos" style={{ color: '#059669', fontWeight: 700, textDecoration: 'underline' }}>Política de datos</Link>. Tus datos nunca son vendidos ni compartidos con terceros comerciales.
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
    return PREGUNTAS.filter(
      (p) =>
        p.pregunta.toLowerCase().includes(q)
    )
  }, [categoriaActiva, busqueda])

  function alternarItem(id: string) {
    setItemAbierto((prev) => (prev === id ? null : id))
  }

  return (
    <section className="content content--wide section" id="preguntas-frecuentes" style={{ scrollMarginTop: 80 }}>
      {/* Encabezado de la sección */}
      <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 32px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 14px',
            borderRadius: 20,
            background: '#ecfdf5',
            color: '#059669',
            fontSize: '0.84rem',
            fontWeight: 700,
            marginBottom: 12,
            border: '1px solid #a7f3d0',
          }}
        >
          <HelpCircle size={15} />
          <span>Centro de respuestas</span>
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px', lineHeight: 1.25 }}>
          Preguntas frecuentes
        </h2>
        <p style={{ fontSize: '1rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
          Resolvemos tus dudas sobre cómo recibir atención, sumarte como psicólogo/a voluntario/a o apoyar en labores de la fundación.
        </p>
      </div>

      {/* Barra de búsqueda */}
      <div style={{ maxWidth: 540, margin: '0 auto 28px', position: 'relative' }}>
        <Search
          size={18}
          color="#94a3b8"
          style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <input
          type="text"
          placeholder="Buscar una pregunta (ej. REPS, ReTHUS, costo, sesiones...)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px 12px 44px',
            borderRadius: 12,
            border: '1.5px solid #e2e8f0',
            fontSize: '0.94rem',
            outline: 'none',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            transition: 'border-color 0.2s',
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
              border: 'none',
              background: '#f1f5f9',
              borderRadius: 6,
              padding: '2px 8px',
              fontSize: '0.76rem',
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Pestañas de categorías (solo si no hay búsqueda activa) */}
      {!busqueda && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 28,
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 10,
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  border: activa ? '1.5px solid #059669' : '1.5px solid #e2e8f0',
                  background: activa ? '#059669' : '#fff',
                  color: activa ? '#fff' : '#475569',
                  cursor: 'pointer',
                  boxShadow: activa ? '0 2px 8px rgba(5,150,105,0.25)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <Icono size={16} />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Lista de Acordeones */}
      <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {preguntasFiltradas.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '36px 20px',
              background: '#f8fafc',
              borderRadius: 12,
              border: '1px dashed #cbd5e1',
            }}
          >
            <p style={{ color: '#64748b', fontSize: '0.94rem', margin: '0 0 10px' }}>
              No encontramos preguntas que coincidan con &ldquo;{busqueda}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => setBusqueda('')}
              style={{
                background: '#059669',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
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
                  background: '#fff',
                  border: abierta ? '1.5px solid #059669' : '1px solid #e2e8f0',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: abierta ? '0 4px 14px rgba(5,150,105,0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s',
                }}
              >
                <button
                  type="button"
                  onClick={() => alternarItem(item.id)}
                  aria-expanded={abierta}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.98rem',
                      fontWeight: 700,
                      color: abierta ? '#065f46' : '#1e293b',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.pregunta}
                  </span>
                  <ChevronDown
                    size={18}
                    color={abierta ? '#059669' : '#94a3b8'}
                    style={{
                      transform: abierta ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                    }}
                  />
                </button>

                {abierta && (
                  <div
                    style={{
                      padding: '0 20px 18px',
                      color: '#334155',
                      fontSize: '0.92rem',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: 14,
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

      {/* Tarjeta de soporte / dudas adicionales */}
      <div
        style={{
          maxWidth: 760,
          margin: '32px auto 0',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div>
          <strong style={{ fontSize: '0.96rem', color: '#1e293b', display: 'block', marginBottom: 2 }}>
            ¿Tienes alguna otra duda o consulta específica?
          </strong>
          <span style={{ fontSize: '0.84rem', color: '#64748b' }}>
            Nuestro equipo de coordinación está disponible para orientarte.
          </span>
        </div>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 18px',
            borderRadius: 8,
            background: '#22c55e',
            color: '#fff',
            fontSize: '0.86rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 6px rgba(34,197,94,0.3)',
          }}
        >
          <MessageCircle size={16} />
          <span>Escríbenos por WhatsApp</span>
        </a>
      </div>
    </section>
  )
}
