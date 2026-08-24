'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { paraWhatsapp } from '@/lib/telefono'
import { mensajeDePedirDocumentos } from '@/lib/mensajes'
import { DocumentoPrivado } from './DocumentoPrivado'
import { BotonPedirDocumentosEmail } from './BotonPedirDocumentosEmail'
import {
  ShieldCheck,
  FileText,
  Check,
  Copy,
  MessageSquare,
  Mail,
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
  profesionalEmail?: string | null
  numeroActual?: string | null
  documentoUrlActual?: string | null
  identityDocumentUrlActual?: string | null
  identityDocumentBackUrlActual?: string | null
  verificadaActual?: boolean
  /** El enlace por el que el profesional sube sus documentos él mismo. */
  enlaceDocumentos?: string | null
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
  profesionalEmail,
  numeroActual = '',
  documentoUrlActual = '',
  identityDocumentUrlActual = null,
  identityDocumentBackUrlActual = null,
  verificadaActual = false,
  enlaceDocumentos = null,
  abierto,
  onCerrar,
}: ModalTarjetaProps) {
  const router = useRouter()
  const [documentoUrl, setDocumentoUrl] = useState(documentoUrlActual || '')
  const [verificada, setVerificada] = useState(verificadaActual || false)
  const [tipoPerfil, setTipoPerfil] = useState<'general' | 'graduado' | 'estudiante'>('general')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null)
  const [copiadoMsg, setCopiadoMsg] = useState(false)

  if (!abierto) return null

  // El texto vive en lib/mensajes.ts con todos los demás: con saltos de
  // línea, negrita donde el ojo debe caer y sin emojis (llegaban rotos).
  const mensajeWhatsApp = mensajeDePedirDocumentos({
    profesional: profesionalNombre,
    tipo: tipoPerfil,
    enlace: enlaceDocumentos,
  })

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

  async function guardar() {
    setGuardando(true)
    setMensaje(null)

    try {
      const res = await fetch(`/api/portal/professionals/${profesionalId}/tarjeta-profesional`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // Solo la verificación: el número y el soporte los pone el
        // profesional por su enlace, y desde aquí no se pisan.
        body: JSON.stringify({ professionalCardVerified: verificada }),
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
            <p
              style={{
                margin: 0,
                fontSize: '0.78rem',
                color: '#14532d',
                fontStyle: 'italic',
                flex: 1,
                minWidth: 0,
                overflowWrap: 'anywhere',
                whiteSpace: 'pre-wrap',
              }}
            >
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

        {/* Sección de Solicitud por Correo Electrónico */}
        <div style={{ padding: 12, borderRadius: 8, background: '#f0f9ff', border: '1px solid #bae6fd', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
            <strong style={{ fontSize: '0.84rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Mail size={14} /> Solicitar Soporte por Correo Electrónico
            </strong>
            {profesionalEmail && (
              <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 600 }}>
                {profesionalEmail}
              </span>
            )}
          </div>
          <p style={{ margin: '0 0 10px', fontSize: '0.78rem', color: '#0369a1' }}>
            Envía una notificación formal por correo al profesional con su enlace seguro para que suba su tarjeta profesional (o certificado) y documento de identidad.
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <BotonPedirDocumentosEmail
              profesionalId={profesionalId}
              profesionalEmail={profesionalEmail}
              profesionalNombre={profesionalNombre}
              enlaceDocumentos={enlaceDocumentos}
              texto="Enviar correo de solicitud"
            />
            {profesionalEmail && (
              <a
                href={`mailto:${profesionalEmail}?subject=${encodeURIComponent('Carga de documentos para tu perfil · Red Aquí Estamos')}&body=${encodeURIComponent(mensajeWhatsApp.replace(/\*/g, ''))}`}
                className="boton-mini"
                style={{ fontSize: '0.74rem', padding: '3px 8px', textDecoration: 'none' }}
                title="Abrir en tu programa de correo predeterminado"
              >
                Abrir en mi cliente de correo
              </a>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Soportes cargados */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 12, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div>
              <strong style={{ fontSize: '0.82rem', display: 'block', marginBottom: 4, color: '#334155' }}>
                Soporte TP / Estudios:
              </strong>
              {documentoUrlActual ? (
                <DocumentoPrivado clave={documentoUrlActual} etiqueta="Abrir soporte TP" />
              ) : (
                <span className="tabla__secundario" style={{ fontSize: '0.78rem' }}>
                  Sin soporte cargado
                </span>
              )}
            </div>

            <div>
              <strong style={{ fontSize: '0.82rem', display: 'block', marginBottom: 4, color: '#334155' }}>
                Documento de Identidad:
              </strong>
              {identityDocumentUrlActual || identityDocumentBackUrlActual ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {identityDocumentUrlActual ? (
                    <DocumentoPrivado clave={identityDocumentUrlActual} etiqueta="Abrir documento (anverso)" />
                  ) : null}
                  {identityDocumentBackUrlActual ? (
                    <DocumentoPrivado clave={identityDocumentBackUrlActual} etiqueta="Abrir documento (reverso)" />
                  ) : null}
                </div>
              ) : (
                <span className="tabla__secundario" style={{ fontSize: '0.78rem' }}>
                  Sin documento cargado
                </span>
              )}
            </div>
          </div>

          {!documentoUrlActual && !identityDocumentUrlActual ? (
            <p className="panel__nota" style={{ margin: 0 }}>
              Aún no ha subido sus documentos. Mándale el mensaje de arriba: el enlace le permite
              subirlos desde el teléfono, directo al almacenamiento privado.
            </p>
          ) : null}

          {documentoUrlActual || identityDocumentUrlActual ? (
            <div style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border-default, #e2e8f0)', background: 'var(--color-bg-subtle, #f8fafc)' }}>
              <span className="tabla__secundario" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                <Eye size={13} /> Documentos en almacenamiento privado cifrado.
              </span>
              <span className="tabla__secundario" style={{ fontSize: '0.76rem' }}>
                Cada vez que alguien abre un documento queda registrado quién y cuándo en la auditoría.
              </span>
            </div>
          ) : null}

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
            disabled={guardando}
            type="button"
          >
            {guardando ? 'Guardando…' : 'Guardar y Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
