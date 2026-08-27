'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRightLeft, Check, Copy, MessageSquare, X, Users } from 'lucide-react'
import { paraWhatsapp } from '@/lib/telefono'
import { nombreDePila } from '@/lib/nombre'

const AREAS = [
  { valor: 'SOCIAL_LEGAL_EDUCATIVO', etiqueta: '📘 Social, legal y educativo (Trabajo Social, Derecho, Pedagogía)' },
  { valor: 'SALUD', etiqueta: '🩺 Salud y primeros auxilios (Enfermería, Medicina, Salud Ocupacional)' },
  { valor: 'OPERACION_LOGISTICA', etiqueta: '📦 Operación y logística' },
  { valor: 'COMUNICACION_TECNOLOGIA', etiqueta: '💻 Comunicación y tecnología (Diseño, Redes, Sistemas)' },
  { valor: 'GESTION_PROYECTOS', etiqueta: '📊 Gestión y proyectos' },
  { valor: 'OTRA', etiqueta: '✨ Otra área' },
]

export function ModalMoverColaborador({
  profesional,
}: {
  profesional: {
    id: string
    nombre: string
    telefono: string
    profesion: string
  }
}) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [area, setArea] = useState('SOCIAL_LEGAL_EDUCATIVO')
  const [disciplina, setDisciplina] = useState(profesional.profesion || 'Trabajo Social')
  const [habilidades, setHabilidades] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const primerNombre = nombreDePila(profesional.nombre) || profesional.nombre
  const telWhatsapp = paraWhatsapp(profesional.telefono)

  const mensajeWhatsapp = [
    `Hola ${primerNombre}, te saludamos de la Red Aquí Estamos.`,
    '',
    `Recibimos tu postulación y nos alegra contar con tu apoyo. Como tu perfil y formación es en *${disciplina}*, te hemos integrado a nuestro equipo de *Voluntariado de Apoyo* de la red.`,
    '',
    'Desde allí nos apoyas en iniciativas comunitarias, tareas internas y articulación según tu disponibilidad y área de experiencia.',
    '',
    '¡Muchísimas gracias por tu vocación de servicio y por sumarte a la red!',
  ].join('\n')

  const urlWhatsapp = telWhatsapp
    ? `https://wa.me/${telWhatsapp}?text=${encodeURIComponent(mensajeWhatsapp)}`
    : null

  async function confirmarMovimiento() {
    setGuardando(true)
    setError(null)
    try {
      const r = await fetch(`/api/portal/professionals/${profesional.id}/convertir-colaborador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area,
          discipline: disciplina.trim() || 'Voluntariado de Apoyo',
          skills: habilidades.trim() || null,
        }),
      })

      const d = await r.json()
      if (!r.ok || !d.success) {
        setError(d.message || 'No se pudo mover a colaboradores')
        return
      }

      setExito(true)
    } catch {
      setError('Error al conectar con el servidor')
    } finally {
      setGuardando(false)
    }
  }

  function copiar() {
    navigator.clipboard.writeText(mensajeWhatsapp)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function cerrar() {
    setAbierto(false)
    if (exito) {
      router.refresh()
    }
  }

  return (
    <>
      <button
        type="button"
        className="boton-mini"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          background: '#eff6ff',
          color: '#1d4ed8',
          border: '1px solid #bfdbfe',
          fontWeight: 600,
        }}
        onClick={() => {
          setExito(false)
          setError(null)
          setAbierto(true)
        }}
        title="Mover al voluntariado de apoyo (Trabajo Social, Legal, Diseño, etc.)"
      >
        <ArrowRightLeft size={13} />
        Mover a Voluntariado
      </button>

      {abierto && (
        <div className="modal-eliminar-overlay" onClick={cerrar} style={{ zIndex: 9999 }}>
          <div
            className="modal-eliminar"
            style={{ maxWidth: 520, textAlign: 'left', padding: '22px 26px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: '#dbeafe',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                    Mover a Voluntariado de Apoyo
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    {profesional.nombre} ({profesional.profesion})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={cerrar}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            {!exito ? (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0 }}>
                  Usa esta acción cuando la persona tenga formación en <strong>Trabajo Social, Derecho, Logística, Diseño u otra disciplina</strong> no clínica. Se registrará en el directorio de <strong>Colaboradores</strong> y se retirará de las verificaciones clínicas.
                </p>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Área del Voluntariado:
                  </label>
                  <select
                    className="input"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    {AREAS.map((a) => (
                      <option key={a.valor} value={a.valor}>
                        {a.etiqueta}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Disciplina o Profesión Concreta:
                  </label>
                  <input
                    className="input"
                    value={disciplina}
                    onChange={(e) => setDisciplina(e.target.value)}
                    placeholder="Ej. Trabajo Social, Derecho, Diseñador(a)"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Habilidades o Notas Opcionales:
                  </label>
                  <textarea
                    className="input"
                    rows={2}
                    value={habilidades}
                    onChange={(e) => setHabilidades(e.target.value)}
                    placeholder="Ej. Experiencia en intervención comunitaria y trabajo con familias."
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                {error && (
                  <div className="aviso-portal" data-tono="rojo" style={{ margin: '4px 0 0' }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" className="boton-mini" onClick={cerrar} disabled={guardando}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="boton-mini"
                    data-tono="principal"
                    onClick={confirmarMovimiento}
                    disabled={guardando}
                  >
                    {guardando ? 'Moviendo…' : 'Confirmar y Mover a Colaboradores'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#065f46', fontWeight: 700 }}>
                    <Check size={16} />
                    <span>¡Movido exitosamente a Colaboradores!</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#047857' }}>
                    {profesional.nombre} ya está disponible en el directorio de <strong>Colaboradores</strong> para asignación de tareas internas.
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    Mensaje de WhatsApp para notificarle:
                  </span>
                  <pre
                    style={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'inherit',
                      fontSize: '0.82rem',
                      color: '#1e293b',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      padding: '10px 12px',
                      margin: '6px 0 0',
                      lineHeight: 1.45,
                    }}
                  >
                    {mensajeWhatsapp}
                  </pre>
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: 4 }}>
                  <button type="button" onClick={copiar} className="boton-mini">
                    {copiado ? <Check size={13} style={{ color: '#059669' }} /> : <Copy size={13} />}
                    {copiado ? '¡Copiado!' : 'Copiar mensaje'}
                  </button>

                  {urlWhatsapp ? (
                    <a
                      href={urlWhatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="boton-mini"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        background: '#059669',
                        color: '#fff',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                      onClick={cerrar}
                    >
                      <MessageSquare size={13} />
                      Enviar por WhatsApp
                    </a>
                  ) : null}

                  <button type="button" className="boton-mini" data-tono="principal" onClick={cerrar}>
                    Listo y Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
