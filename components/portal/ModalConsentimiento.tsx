'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileCheck2, Upload, FileText, X } from 'lucide-react'

type ModalConsentimientoProps = {
  citaId: string
  pacienteNombre: string
  consentSignedActual?: boolean
  consentSignedDocumentUrlActual?: string | null
  abierto: boolean
  onCerrar: () => void
}

export function ModalConsentimiento({
  citaId,
  pacienteNombre,
  consentSignedActual = false,
  consentSignedDocumentUrlActual = '',
  abierto,
  onCerrar,
}: ModalConsentimientoProps) {
  const router = useRouter()
  const [consentSigned, setConsentSigned] = useState(consentSignedActual || false)
  const [documentUrl, setDocumentUrl] = useState(consentSignedDocumentUrlActual || '')
  const [subiendoArchivo, setSubiendoArchivo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null)

  if (!abierto) return null

  async function manejarSubidaArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setSubiendoArchivo(true)
    setMensaje(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('tipo', 'consentimientos')

    try {
      const res = await fetch('/api/portal/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setDocumentUrl(data.url)
        setConsentSigned(true)
        setMensaje({ tipo: 'exito', texto: `Consentimiento cargado: ${data.nombreOriginal}` })
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
      const res = await fetch(`/api/portal/appointments/${citaId}/consentimiento`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentSigned,
          consentSignedDocumentUrl: documentUrl.trim(),
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setMensaje({ tipo: 'exito', texto: 'Consentimiento informado actualizado exitosamente.' })
        setTimeout(() => {
          onCerrar()
          router.refresh()
        }, 1000)
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
      <div className="modal-caja">
        <div className="modal-cabecera">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileCheck2 size={22} style={{ color: 'var(--color-principal, #0e7490)' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Consentimiento Informado</h3>
          </div>
          <button className="boton-icono" onClick={onCerrar} type="button" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <p className="panel__nota" style={{ marginTop: 4, marginBottom: 16 }}>
          Paso 9 del flujo: El <strong>consentimiento informado firmado</strong> por {pacienteNombre} es requisito obligatorio antes de iniciar la sesión de atención psicológica.
        </p>

        {mensaje && (
          <div className="aviso-portal" data-tono={mensaje.tipo === 'exito' ? 'verde' : 'rojo'} style={{ marginBottom: 14 }}>
            {mensaje.texto}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: 'var(--color-fondo-suave, #f8fafc)', borderRadius: 8, border: '1px solid var(--color-borde, #e2e8f0)' }}>
            <input
              id="ci-firmado"
              type="checkbox"
              style={{ width: 18, height: 18, cursor: 'pointer' }}
              checked={consentSigned}
              onChange={(e) => setConsentSigned(e.target.checked)}
            />
            <label htmlFor="ci-firmado" style={{ fontSize: '0.95rem', cursor: 'pointer', fontWeight: 600 }}>
              Consentimiento Informado Firmado Recibido
            </label>
          </div>

          <div>
            <label className="field__label">
              Adjuntar archivo firmado (PDF o foto de firma)
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <label className="boton-mini" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Upload size={14} />
                {subiendoArchivo ? 'Subiendo…' : 'Subir documento'}
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  style={{ display: 'none' }}
                  onChange={manejarSubidaArchivo}
                  disabled={subiendoArchivo}
                />
              </label>
              {documentUrl ? (
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="boton-mini"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                >
                  <FileText size={14} />
                  Ver documento adjunto
                </a>
              ) : (
                <span className="tabla__secundario">Sin archivo adjunto</span>
              )}
            </div>
          </div>

          <div>
            <label className="field__label" htmlFor="ci-url">
              O Enlace al documento firmado en la nube
            </label>
            <input
              id="ci-url"
              className="input"
              type="text"
              placeholder="https://drive.google.com/... o nota"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="button-row" style={{ marginTop: 24, justifyContent: 'flex-end' }}>
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
            {guardando ? 'Guardando…' : 'Guardar Estado'}
          </button>
        </div>
      </div>
    </div>
  )
}
