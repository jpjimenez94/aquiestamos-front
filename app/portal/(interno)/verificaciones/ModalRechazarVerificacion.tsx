'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { XOctagon, Check, Copy, MessageSquare, X } from 'lucide-react'
import { paraWhatsapp } from '@/lib/telefono'
import { nombreDePila } from '@/lib/nombre'

const MOTIVOS_RECHAZO = [
  'Tarjeta profesional no verificable o inválida en Colpsic / ReTHUS',
  'Documentos ilegibles o incompletos tras solicitud previa',
  'No cumple con los requisitos del perfil de atención psicológica',
  'No se logró contacto tras múltiples intentos',
  'Otro motivo',
]

export function ModalRechazarVerificacion({
  profesional,
}: {
  profesional: {
    id: string
    nombre: string
    telefono: string
  }
}) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [motivo, setMotivo] = useState(MOTIVOS_RECHAZO[0])
  const [detalles, setDetalles] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const primerNombre = nombreDePila(profesional.nombre) || profesional.nombre
  const telWhatsapp = paraWhatsapp(profesional.telefono)

  const mensajeWhatsapp = [
    `Hola ${primerNombre}, te escribimos de la Red Aquí Estamos.`,
    '',
    'Agradecemos sinceramente tu interés y tiempo en postularte para acompañar en la red.',
    '',
    `Tras la revisión de los documentos y requisitos del perfil, te informamos que en este momento no es posible dar continuidad a tu proceso de admisión clínica (${motivo.toLowerCase()}).`,
    '',
    'Apreciamos profundamente tu vocación solidaria y te deseamos muchos éxitos en tus labores profesionales.',
  ].join('\n')

  const urlWhatsapp = telWhatsapp
    ? `https://wa.me/${telWhatsapp}?text=${encodeURIComponent(mensajeWhatsapp)}`
    : null

  async function confirmarRechazo() {
    setGuardando(true)
    setError(null)
    try {
      const r = await fetch(`/api/portal/professionals/${profesional.id}/rechazar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motivo,
          detalles: detalles.trim() || null,
        }),
      })

      const d = await r.json()
      if (!r.ok || !d.success) {
        setError(d.message || 'No se pudo rechazar la postulación')
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
          background: '#fff',
          color: '#dc2626',
          border: '1px solid #fca5a5',
          fontWeight: 600,
        }}
        onClick={() => {
          setExito(false)
          setError(null)
          setAbierto(true)
        }}
        title="Rechazar y archivar postulación"
      >
        <XOctagon size={13} />
        Rechazar
      </button>

      {abierto && (
        <div className="modal-eliminar-overlay" onClick={cerrar} style={{ zIndex: 9999 }}>
          <div
            className="modal-eliminar"
            style={{ maxWidth: 500, textAlign: 'left', padding: '22px 26px' }}
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
                    background: '#fee2e2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <XOctagon size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                    Rechazar Postulación
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    {profesional.nombre}
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
                  Al rechazar esta postulación, el registro quedará archivado como inactivo y se retirará de las verificaciones pendientes.
                </p>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Motivo Principal:
                  </label>
                  <select
                    className="input"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    {MOTIVOS_RECHAZO.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Detalles Adicionales (Interno):
                  </label>
                  <textarea
                    className="input"
                    rows={2}
                    value={detalles}
                    onChange={(e) => setDetalles(e.target.value)}
                    placeholder="Ej. No registra en Colpsic con cédula suministrada."
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
                    style={{ background: '#dc2626', color: '#fff', border: '1px solid #b91c1c', fontWeight: 700 }}
                    onClick={confirmarRechazo}
                    disabled={guardando}
                  >
                    {guardando ? 'Rechazando…' : 'Confirmar Rechazo'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#991b1b', fontWeight: 700 }}>
                    <Check size={16} />
                    <span>Postulación rechazada y archivada</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#b91c1c' }}>
                    El perfil de {profesional.nombre} ya no aparece en el listado activo.
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    Mensaje de WhatsApp opcional para responderle:
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
