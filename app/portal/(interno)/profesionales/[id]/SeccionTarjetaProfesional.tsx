'use client'

import { useState } from 'react'
import { paraWhatsapp } from '@/lib/telefono'
import { ModalTarjetaProfesional } from '@/components/portal/ModalTarjetaProfesional'
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  Edit3,
  ExternalLink,
  Eye,
  MessageSquare,
  Copy,
  Check,
  GraduationCap,
  Award,
} from 'lucide-react'

type SeccionTarjetaProps = {
  profesionalId: string
  profesionalNombre: string
  profesionalTelefono?: string | null
  verificada?: boolean
  numero?: string | null
  documentoUrl?: string | null
}

function esImagen(url: string) {
  return /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url)
}

function esPdf(url: string) {
  return /\.pdf(\?.*)?$/i.test(url)
}

export function SeccionTarjetaProfesional({
  profesionalId,
  profesionalNombre,
  profesionalTelefono,
  verificada = false,
  numero = '',
  documentoUrl = '',
}: SeccionTarjetaProps) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [copiadoMsg, setCopiadoMsg] = useState(false)
  const [tipoPerfil, setTipoPerfil] = useState<'general' | 'graduado' | 'estudiante'>('general')

  const mensajes = {
    general: `¡Hola ${profesionalNombre}! Te saludamos de la coordinación de la Red Aquí Estamos 💚. Para poder asignarte casos de acompañamiento y cumplir con los requisitos legales del voluntariado, necesitamos que por favor nos compartas foto o PDF de tu Tarjeta Profesional (si ya eres graduado/a) o tu Certificado de estudios / constancia de matrícula de últimos semestres (si estás en formación). Puedes enviárnoslo respondiendo a este mensaje. ¡Muchas gracias por tu valioso apoyo voluntario!`,
    graduado: `¡Hola ${profesionalNombre}! Te saludamos de la coordinación de la Red Aquí Estamos 💚. Para poder agendarte casos de acompañamiento y cumplir con los requisitos legales de atención psicológica, necesitamos que por favor nos compartas tu número de Tarjeta Profesional y una foto o archivo PDF del soporte. Puedes enviárnosla respondiendo a este mensaje. ¡Muchas gracias por tu valioso apoyo voluntario!`,
    estudiante: `¡Hola ${profesionalNombre}! Te saludamos de la coordinación de la Red Aquí Estamos 💚. Para poder asignarte casos de acompañamiento y validar tu perfil en formación, necesitamos que por favor nos compartas tu certificado de estudios, constancia de matrícula de últimos semestres o carné estudiantil vigente. Puedes enviárnoslo respondiendo a este mensaje. ¡Muchas gracias por tu valioso apoyo voluntario!`,
  }

  const mensajeWhatsApp = mensajes[tipoPerfil]

  // El indicativo lo decide `paraWhatsapp`: pegarle 57 a lo que no empiece por
  // 57 rompe cualquier número extranjero.
  const telLimpio = paraWhatsapp(profesionalTelefono)
  const linkWhatsApp = telLimpio
    ? `https://wa.me/${telLimpio}?text=${encodeURIComponent(mensajeWhatsApp)}`
    : null

  function copiarMensaje() {
    navigator.clipboard.writeText(mensajeWhatsApp)
    setCopiadoMsg(true)
    setTimeout(() => setCopiadoMsg(false), 2000)
  }

  return (
    <>
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h2 style={{ margin: 0 }}>Soporte de Tarjeta Profesional / Certificado de Estudios</h2>
          <button
            type="button"
            className="boton-mini"
            data-tono={verificada ? undefined : 'principal'}
            onClick={() => setModalAbierto(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Edit3 size={14} />
            {verificada ? 'Editar Soporte' : 'Registrar / Verificar Soporte'}
          </button>
        </div>

        <p className="panel__nota" style={{ marginTop: 0, marginBottom: 14 }}>
          Requisito de verificación legal para profesionales graduados (Tarjeta Profesional) o estudiantes de últimos semestres (Certificado de estudios / constancia de matrícula).
        </p>

        {/* Alerta / Botón de Solicitud por WhatsApp si no está verificada */}
        {!verificada && (
          <div style={{ padding: 12, borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
              <strong style={{ fontSize: '0.84rem', color: '#166534', display: 'flex', alignItems: 'center', gap: 5 }}>
                <MessageSquare size={14} /> Solicitar Soporte por WhatsApp
              </strong>

              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  className="boton-mini"
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 6px',
                    background: tipoPerfil === 'general' ? '#15803d' : '#e2e8f0',
                    color: tipoPerfil === 'general' ? '#fff' : '#334155',
                    borderColor: tipoPerfil === 'general' ? '#166534' : '#cbd5e1',
                  }}
                  onClick={() => setTipoPerfil('general')}
                >
                  General
                </button>
                <button
                  type="button"
                  className="boton-mini"
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 6px',
                    background: tipoPerfil === 'graduado' ? '#15803d' : '#e2e8f0',
                    color: tipoPerfil === 'graduado' ? '#fff' : '#334155',
                    borderColor: tipoPerfil === 'graduado' ? '#166534' : '#cbd5e1',
                  }}
                  onClick={() => setTipoPerfil('graduado')}
                >
                  <Award size={11} style={{ display: 'inline', marginRight: 3 }} />
                  Graduado (TP)
                </button>
                <button
                  type="button"
                  className="boton-mini"
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 6px',
                    background: tipoPerfil === 'estudiante' ? '#15803d' : '#e2e8f0',
                    color: tipoPerfil === 'estudiante' ? '#fff' : '#334155',
                    borderColor: tipoPerfil === 'estudiante' ? '#166534' : '#cbd5e1',
                  }}
                  onClick={() => setTipoPerfil('estudiante')}
                >
                  <GraduationCap size={11} style={{ display: 'inline', marginRight: 3 }} />
                  Estudiante (Semestres)
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#14532d', fontStyle: 'italic', flex: 1 }}>
                &ldquo;{mensajeWhatsApp}&rdquo;
              </p>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  type="button"
                  className="boton-mini"
                  onClick={copiarMensaje}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}
                >
                  {copiadoMsg ? <Check size={13} style={{ color: '#059669' }} /> : <Copy size={13} />}
                  {copiadoMsg ? 'Copiado' : 'Copiar'}
                </button>
                {linkWhatsApp && (
                  <a
                    href={linkWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="boton-mini"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.78rem',
                      background: '#059669',
                      color: '#fff',
                      borderColor: '#047857',
                      textDecoration: 'none',
                    }}
                  >
                    <MessageSquare size={13} /> Abrir WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, background: 'var(--color-bg-subtle, #f8fafc)', padding: 14, borderRadius: 8, border: '1px solid var(--color-border-default, #e2e8f0)' }}>
          <div>
            <span className="tabla__secundario" style={{ fontSize: '0.78rem', display: 'block' }}>Estado de Verificación</span>
            {verificada ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: '0.9rem', fontWeight: 600, marginTop: 4 }}>
                <ShieldCheck size={17} /> Documentación Verificada
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#dc2626', fontSize: '0.9rem', fontWeight: 600, marginTop: 4 }}>
                <ShieldAlert size={17} /> Pendiente de Verificación
              </span>
            )}
          </div>

          <div>
            <span className="tabla__secundario" style={{ fontSize: '0.78rem', display: 'block' }}>Registro / Semestre</span>
            <strong style={{ fontSize: '0.9rem', display: 'block', marginTop: 4 }}>
              {numero || '— No registrado —'}
            </strong>
          </div>

          <div>
            <span className="tabla__secundario" style={{ fontSize: '0.78rem', display: 'block' }}>Soporte Adjunto</span>
            {documentoUrl ? (
              <a
                href={documentoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="boton-mini"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}
              >
                <ExternalLink size={13} /> Ver soporte completo
              </a>
            ) : (
              <span className="tabla__secundario" style={{ fontSize: '0.85rem', display: 'block', marginTop: 4 }}>
                Sin archivo
              </span>
            )}
          </div>
        </div>

        {/* Vista Previa Miniatura del Documento Adjunto */}
        {documentoUrl && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 8, border: '1px solid var(--color-border-default, #e2e8f0)', background: 'var(--color-bg-subtle, #f8fafc)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="tabla__secundario" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Eye size={14} /> Vista previa del soporte cargado:
              </span>
              <a
                href={documentoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="boton-mini"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.76rem' }}
              >
                <ExternalLink size={12} /> Abrir en tamaño completo
              </a>
            </div>

            {esImagen(documentoUrl) ? (
              <div style={{ textAlign: 'center', background: '#fff', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}>
                <a href={documentoUrl} target="_blank" rel="noopener noreferrer" title="Clic para ampliar">
                  <img
                    src={documentoUrl}
                    alt="Vista previa del soporte"
                    style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain', borderRadius: 4, cursor: 'zoom-in' }}
                  />
                </a>
              </div>
            ) : esPdf(documentoUrl) ? (
              <div style={{ width: '100%', height: 240, background: '#fff', borderRadius: 6, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <iframe
                  src={documentoUrl}
                  title="Vista previa PDF"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.86rem', padding: 8, background: '#fff', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                <FileText size={16} />
                <a href={documentoUrl} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>
                  {documentoUrl}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <ModalTarjetaProfesional
        profesionalId={profesionalId}
        profesionalNombre={profesionalNombre}
        profesionalTelefono={profesionalTelefono}
        numeroActual={numero}
        documentoUrlActual={documentoUrl}
        verificadaActual={verificada}
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
      />
    </>
  )
}
