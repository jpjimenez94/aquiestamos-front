'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  ChevronDown,
  Brain,
  Heart,
  Users,
  Building,
  MessageCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { whatsappHref } from '@/lib/site'
import type { Idioma } from '@/lib/i18n/idiomas'
import type {
  Diccionario,
  IdCategoriaPregunta,
  IdPregunta,
  PreguntaFrecuente,
} from '@/lib/i18n/diccionarios/es'
import { TextoRico } from './TextoRico'

/**
 * Las preguntas frecuentes.
 *
 * Aquí vive lo que NO cambia con el idioma: qué preguntas hay, en qué orden y
 * de qué categoría es cada una, y el icono de cada categoría. Los textos
 * —preguntas, respuestas, rótulos— llegan por `t`, del diccionario del idioma
 * de la página.
 *
 * Las respuestas eran JSX escrito a mano dentro de este archivo. Ahora son
 * cadenas con un formato mínimo (ver `lib/i18n/textoRico.ts`), que es lo que
 * permite tenerlas en tres idiomas sin tres copias del componente, y lo que
 * deja que una prueba compruebe que a ninguna traducción le falta un enlace.
 */

const CATEGORIAS: { id: IdCategoriaPregunta; icono: typeof Brain }[] = [
  { id: 'psicologia', icono: Brain },
  { id: 'pacientes', icono: Heart },
  { id: 'voluntarios', icono: Users },
  { id: 'fundacion', icono: Building },
]

/** El orden en que se enseñan, y a qué categoría pertenece cada una. */
export const PREGUNTAS: { id: IdPregunta; categoria: IdCategoriaPregunta }[] = [
  // 1 · Profesionales de psicología
  { id: 'psi-reps-rethus', categoria: 'psicologia' },
  { id: 'psi-registro-confidencialidad', categoria: 'psicologia' },
  { id: 'psi-disponibilidad-horarios', categoria: 'psicologia' },
  { id: 'psi-alcance-casos', categoria: 'psicologia' },
  // 2 · Personas y familias
  { id: 'pac-gratuidad', categoria: 'pacientes' },
  { id: 'pac-como-solicitar', categoria: 'pacientes' },
  { id: 'pac-cuantas-sesiones', categoria: 'pacientes' },
  { id: 'pac-modalidad', categoria: 'pacientes' },
  { id: 'pac-emergencias-graves', categoria: 'pacientes' },
  // 3 · Voluntariado general
  { id: 'vol-quienes-pueden', categoria: 'voluntarios' },
  { id: 'vol-como-asignan-tareas', categoria: 'voluntarios' },
  { id: 'vol-certificado', categoria: 'voluntarios' },
  // 4 · Sobre la fundación
  { id: 'fun-que-es', categoria: 'fundacion' },
  { id: 'fun-seguridad-datos', categoria: 'fundacion' },
]

function Respuesta({ bloques, idioma }: { bloques: PreguntaFrecuente['respuesta']; idioma: Idioma }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {bloques.map((bloque, i) =>
        typeof bloque === 'string' ? (
          <p key={i} style={{ margin: 0, lineHeight: 1.65 }}>
            <TextoRico texto={bloque} idioma={idioma} claseEnlace="faq__enlace" />
          </p>
        ) : (
          <ul key={i} style={{ margin: 0, paddingLeft: 22, lineHeight: 1.7 }}>
            {bloque.lista.map((linea) => (
              <li key={linea}>
                <TextoRico texto={linea} idioma={idioma} claseEnlace="faq__enlace" />
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  )
}

export function SeccionPreguntasFrecuentes({
  idioma,
  t,
}: {
  idioma: Idioma
  t: Diccionario['preguntas']
}) {
  const [categoriaActiva, setCategoriaActiva] = useState<IdCategoriaPregunta>('psicologia')
  const [busqueda, setBusqueda] = useState('')
  const [itemAbierto, setItemAbierto] = useState<string | null>('psi-reps-rethus')

  // El tipo exacto de cada pregunta varía (unas llevan lista, otras no); para
  // pintarlas se leen todas con la forma común.
  const textos = t.items as Record<IdPregunta, PreguntaFrecuente>

  const preguntasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) {
      return PREGUNTAS.filter((p) => p.categoria === categoriaActiva)
    }
    return PREGUNTAS.filter((p) => textos[p.id].pregunta.toLowerCase().includes(q))
  }, [categoriaActiva, busqueda, textos])

  function alternarItem(id: string) {
    setItemAbierto((prev) => (prev === id ? null : id))
  }

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
          <span>{t.ceja}</span>
        </div>

        <h2 style={{ fontSize: 'clamp(1.85rem, 4.5vw, 2.5rem)', color: 'var(--color-text-default)', marginBottom: 12 }}>
          {t.titulo}
        </h2>
        <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
          {t.intro}
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
          placeholder={t.buscar}
          aria-label={t.buscar}
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
            {t.limpiar}
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
            const Icono = cat.icono
            const activa = categoriaActiva === cat.id
            const rotulo = t.categorias[cat.id]
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={activa}
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
                    {rotulo.etiqueta}
                  </strong>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.76rem',
                      color: activa ? 'rgba(255, 246, 235, 0.75)' : 'var(--color-text-light)',
                      lineHeight: 1.3,
                    }}
                  >
                    {rotulo.aclaracion}
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
          {/*
            Lo que la persona tecleó se pinta aparte, nunca metido en una frase
            con formato: así no hay forma de que unos asteriscos o unos
            corchetes escritos en el buscador se interpreten como negrita o
            como enlace.
          */}
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', margin: 0 }} role="status">
            {t.resultadosPara} &ldquo;<strong>{busqueda}</strong>&rdquo; ({preguntasFiltradas.length}{' '}
            {preguntasFiltradas.length === 1 ? t.coincidencia : t.coincidencias})
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
              {t.sinResultados} &ldquo;{busqueda}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="button button--primary"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              {t.verTodas}
            </button>
          </div>
        ) : (
          preguntasFiltradas.map(({ id }) => {
            const item = textos[id]
            const abierta = itemAbierto === id
            return (
              <div
                key={id}
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
                  onClick={() => alternarItem(id)}
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
                    {item.distintivo && (
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
                        {item.distintivo}
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
                    <Respuesta bloques={item.respuesta} idioma={idioma} />
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
              {t.dudaTitulo}
            </strong>
            <span className="text-muted" style={{ fontSize: '0.88rem' }}>
              {t.dudaTexto}
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
          <span>{t.dudaBoton}</span>
        </a>
      </div>
    </section>
  )
}
