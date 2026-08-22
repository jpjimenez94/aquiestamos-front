'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck,
  Upload,
  FileText,
  Check,
  Copy,
  MessageSquare,
  X,
  ExternalLink,
  Eye,
  GraduationCap,
  Award,
} from 'lucide-react'

type ModalTarjetaProps = {
  profesionalId: string
  profesionalNombre: string
  profesionalTelefono?: string | null
  numeroActual?: string | null
  documentoUrlActual?: string | null
  verificadaActual?: boolean
  abierto: boolean
  onCerrar: () => void
}

function esImagen(url: string) {
  return /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url)
}

function esPdf(url: string) {
  return /\.pdf(\?.*)?$/i.test(url)
}

export function ModalTarjetaProfesional({
  profesionalId,
  profesionalNombre,
  profesionalTelefono,
  numeroActual = '',
  documentoUrlActual = '',
  verificadaActual = false,
  abierto,
  onCerrar,
}: ModalTarjetaProps) {
  const router = useRouter()
  const [numero, setNumero] = useState(numeroActual || '')
  const [documentoUrl, setDocumentoUrl] = useState(documentoUrlActual || '')
  const [verificada, setVerificada] = useState(verificadaActual || false)
  const [tipoPerfil, setTipoPerfil] = useState<'general' | 'graduado' | 'estudiante'>('general')
  const [subiendoArchivo, setSubiendoArchivo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null)
  const [copiadoMsg, setCopiadoMsg] = useState(false)

  if (!abierto) return null

  const mensajes = {
    general: `¡Hola ${profesionalNombre}! Te saludamos de la coordinación de la Red Aquí Estamos 💚. Para poder asignarte casos de acompañamiento y cumplir con los requisitos legales del voluntariado, necesitamos que por favor nos compartas foto o PDF de tu Tarjeta Profesional (si ya eres graduado/a) o tu Certificado de estudios / constancia de matrícula de últimos semestres (si estás en formación). Puedes enviárnoslo respondiendo a este mensaje. ¡Muchas gracias por tu valioso apoyo voluntario!`,
    graduado: `¡Hola ${profesionalNombre}! Te saludamos de la coordinación de la Red Aquí Estamos 💚. Para poder agendarte casos de acompañamiento y cumplir con los requisitos legales de atención psicológica, necesitamos que por favor nos compartas tu número de Tarjeta Profesional y una foto o archivo PDF del soporte. Puedes enviárnosla respondiendo a este mensaje. ¡Muchas gracias por tu valioso apoyo voluntario!`,
    estudiante: `¡Hola ${profesionalNombre}! Te saludamos de la coordinación de la Red Aquí Estamos 💚. Para poder asignarte casos de acompañamiento y validar tu perfil en formación, necesitamos que por favor nos compartas tu certificado de estudios, constancia de matrícula de últimos semestres o carné estudiantil vigente. Puedes enviárnoslo respondiendo a este mensaje. ¡Muchas gracias por tu valioso apoyo voluntario!`,
  }

  const mensajeWhatsApp = mensajes[tipoPerfil]

  const telLimpio = profesionalTelefono ? profesionalTelefono.replace(/\D/g, '') : ''
  const linkWhatsApp = telLimpio
    ? `https://wa.me/${telLimpio.startsWith('57') ? telLimpio : `57${telLimpio}`}?text=${encodeURIComponent(mensajeWhatsApp)}`
    : null

  function copiarMensaje() {
    navigator.clipboard.writeText(mensajeWhatsApp)
    setCopiadoMsg(true)
    setTimeout(() => setCopiadoMsg(false), 2000)
  }

  async function manejarSubidaArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setSubiendoArchivo(true)
    setMensaje(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('tipo', 'tarjetas')

    try {
      const res = await fetch('/api/portal/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setDocumentoUrl(data.url)
        setVerificada(true)
        setMensaje({ tipo: 'exito', texto: `Archivo cargado correctamente: ${data.nombreOriginal}` })
      } else {
        setMensaje({ tipo: 'error', texto: data.message || 'Error al subir el archivo' })
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo subir el archivo. Intenta de nuevo.' })
    } finally {
      setSubiendoArchivo(false)
    }
  }

  async function guardar() {
    setGuardando(true)
    setMensaje(null)

    try {
      const res = await fetch(`/api/portal/professionals/${profesionalId}/tarjeta-profesional`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalCardNumber: numero.trim(),
          professionalCardDocumentUrl: documentoUrl.trim(),
          professionalCardVerified: verificada,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setMensaje({ tipo: 'exito', texto: 'Soporte y verificación guardados exitosamente.' })
        setTimeout(() => {
          onCerrar()
          router.refresh()
        }, 800)
      } else {
        setMensaje({ tipo: 'error', texto: data.message || 'Error al guardar los datos' })
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de conexión con el servidor.' })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal-telon">
      <div className="modal-caja" style={{ maxWidth: 620, maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="modal-cabecera">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={22} style={{ color: 'var(--color-principal, #0e7490)' }} />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>
              Soporte de Tarjeta Profesional / Certificado de Estudios
            </h3>
          </div>
          <button className="boton-icono" onClick={onCerrar} type="button" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <p className="panel__nota" style={{ marginTop: 4, marginBottom: 12 }}>
          Profesional / Voluntario: <strong>{profesionalNombre}</strong>. Válido tanto para profesionales graduados (Tarjeta Profesional) como para estudiantes de últimos semestres (Certificado de matrícula o estudios).
        </p>

        {mensaje && (
          <div className="aviso-portal" data-tono={mensaje.tipo === 'exito' ? 'verde' : 'rojo'} style={{ marginBottom: 14 }}>
            {mensaje.texto}
          </div>
        )}

        {/* Sección de Solicitud por WhatsApp con Selector de Perfil */}
        <div style={{ padding: 12, borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
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
                Completo / Ambos
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
                Graduado
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
                Estudiante
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#14532d', fontStyle: 'italic', flex: 1 }}>
              &ldquo;{mensajeWhatsApp}&rdquo;
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
              <button
                type="button"
                className="boton-mini"
                onClick={copiarMensaje}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.76rem', padding: '3px 8px' }}
              >
                {copiadoMsg ? <Check size={12} style={{ color: '#059669' }} /> : <Copy size={12} />}
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
                    fontSize: '0.76rem',
                    padding: '3px 8px',
                    background: '#059669',
                    color: '#fff',
                    borderColor: '#047857',
                    textDecoration: 'none',
                  }}
                >
                  <MessageSquare size={12} /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="field__label" htmlFor="tp-numero">
              Número de Tarjeta Profesional / Registro o Semestre y Universidad
            </label>
            <input
              id="tp-numero"
              className="input"
              type="text"
              placeholder="Ej. TP 123456 (Graduado) o 9º Semestre - Universidad Javeriana (Estudiante)"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />
          </div>

          <div>
            <label className="field__label">
              Soporte Digital (Tarjeta Profesional o Certificado de Matrícula/Estudios)
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <label className="boton-mini" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Upload size={14} />
                {subiendoArchivo ? 'Subiendo archivo…' : 'Subir archivo'}
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  style={{ display: 'none' }}
                  onChange={manejarSubidaArchivo}
                  disabled={subiendoArchivo}
                />
              </label>
              {documentoUrl && (
                <a
                  href={documentoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="boton-mini"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}
                >
                  <ExternalLink size={13} />
                  Abrir en pestaña nueva
                </a>
              )}
            </div>
          </div>

          {/* Vista Previa Miniatura del Documento */}
          {documentoUrl && (
            <div style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border-default, #e2e8f0)', background: 'var(--color-bg-subtle, #f8fafc)' }}>
              <span className="tabla__secundario" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, fontWeight: 600 }}>
                <Eye size={13} /> Vista previa del soporte cargado:
              </span>

              {esImagen(documentoUrl) ? (
                <div style={{ textAlign: 'center', background: '#fff', padding: 6, borderRadius: 6, border: '1px solid #cbd5e1' }}>
                  <img
                    src={documentoUrl}
                    alt="Vista previa del soporte"
                    style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain', borderRadius: 4 }}
                  />
                </div>
              ) : esPdf(documentoUrl) ? (
                <div style={{ width: '100%', height: 190, background: '#fff', borderRadius: 6, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                  <iframe
                    src={documentoUrl}
                    title="Vista previa PDF"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem' }}>
                  <FileText size={16} />
                  <a href={documentoUrl} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>
                    {documentoUrl}
                  </a>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="field__label" htmlFor="tp-url">
              O Enlace de soporte en la nube / Nota de verificación
            </label>
            <input
              id="tp-url"
              className="input"
              type="text"
              placeholder="https://drive.google.com/... o nota de validación interna"
              value={documentoUrl}
              onChange={(e) => setDocumentoUrl(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
            <input
              id="tp-verificada"
              type="checkbox"
              style={{ width: 18, height: 18, cursor: 'pointer' }}
              checked={verificada}
              onChange={(e) => setVerificada(e.target.checked)}
            />
            <label htmlFor="tp-verificada" style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: 500 }}>
              Marcar como <strong>Requisitos / Documentación Verificada</strong> (habilitado para acompañamiento)
            </label>
          </div>
        </div>

        <div className="button-row" style={{ marginTop: 20, justifyContent: 'flex-end' }}>
          <button className="boton-mini" onClick={onCerrar} type="button">
            Cancelar
          </button>
          <button
            className="boton-mini"
            data-tono="principal"
            onClick={guardar}
            disabled={guardando || subiendoArchivo}
            type="button"
          >
            {guardando ? 'Guardando…' : 'Guardar y Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
