'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, ShieldCheck } from 'lucide-react'
import { ModalMoverColaborador } from './ModalMoverColaborador'
import { ModalRechazarVerificacion } from './ModalRechazarVerificacion'

/**
 * Una verificación pendiente: el documento a la vista y los datos del perfil
 * al lado, para aprobar sin abrir cinco pestañas.
 *
 * La miniatura pide una URL firmada (caduca en un minuto) y la pinta si es
 * imagen; un PDF no se puede miniaturizar sin librerías, así que va como
 * tarjeta clickeable. Cada consulta del documento queda en auditoría — eso lo
 * hace el backend al firmar la URL.
 */

function Miniatura({ clave, etiqueta }: { clave: string | null; etiqueta: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [fallo, setFallo] = useState(false)

  const esPdf = (clave ?? '').toLowerCase().endsWith('.pdf')

  useEffect(() => {
    if (!clave || esPdf) return
    let vivo = true
    fetch(`/api/portal/documentos/${clave}`)
      .then((r) => r.json())
      .then((d) => {
        if (vivo && d.success) setUrl(d.data.url)
        else if (vivo) setFallo(true)
      })
      .catch(() => vivo && setFallo(true))
    return () => {
      vivo = false
    }
  }, [clave, esPdf])

  async function abrirCompleto() {
    if (!clave) return
    const r = await fetch(`/api/portal/documentos/${clave}`)
    const d = await r.json()
    if (d.success) window.open(d.data.url, '_blank', 'noopener,noreferrer')
  }

  if (!clave) {
    return (
      <div className="miniatura miniatura--vacia">
        <span className="tabla__secundario">Sin {etiqueta.toLowerCase()}</span>
      </div>
    )
  }

  return (
    <button type="button" className="miniatura" onClick={abrirCompleto} title={`Ver ${etiqueta} completo`}>
      {esPdf || fallo || !url ? (
        <span className="miniatura__pdf">
          <FileText size={22} />
          {esPdf ? 'PDF' : '…'}
        </span>
      ) : (
        // Una URL firmada de un minuto: para una miniatura que se carga al
        // entrar, sobra. Si caduca antes del clic, abrirCompleto pide otra.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={etiqueta} />
      )}
      <span className="miniatura__etiqueta">{etiqueta}</span>
    </button>
  )
}

export function TarjetaPendiente({
  profesional,
}: {
  profesional: {
    id: string
    nombre: string
    telefono: string
    ciudad: string
    profesion: string
    experiencia: string
    numero: string | null
    claveTarjeta: string | null
    claveIdentidad: string | null
    claveIdentidadRespaldo: string | null
    subioEl: string
  }
}) {
  const router = useRouter()
  const [numero, setNumero] = useState(profesional.numero ?? '')
  const [aprobando, setAprobando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function aprobar() {
    setAprobando(true)
    setError(null)
    try {
      const r = await fetch(`/api/portal/professionals/${profesional.id}/tarjeta-profesional`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalCardVerified: true,
          ...(numero.trim() ? { professionalCardNumber: numero.trim() } : {}),
        }),
      })
      const d = await r.json()
      if (!r.ok || !d.success) {
        setError(d.message ?? 'No se pudo aprobar')
        return
      }
      router.refresh()
    } catch {
      setError('No pudimos conectarnos con el servidor')
    } finally {
      setAprobando(false)
    }
  }

  return (
    <div className="verificacion">
      <div className="verificacion__docs">
        <Miniatura clave={profesional.claveTarjeta} etiqueta="Tarjeta / certificado" />
        <Miniatura clave={profesional.claveIdentidad} etiqueta="Identidad" />
        {profesional.claveIdentidadRespaldo ? (
          <Miniatura clave={profesional.claveIdentidadRespaldo} etiqueta="Identidad (respaldo)" />
        ) : null}
      </div>

      <div className="verificacion__datos">
        <strong style={{ fontSize: '1rem' }}>{profesional.nombre}</strong>
        <span className="tabla__secundario">
          {profesional.profesion} · {profesional.ciudad} · {profesional.telefono}
        </span>
        <span className="tabla__secundario">
          Experiencia: {profesional.experiencia} · Subió sus documentos el {profesional.subioEl}
        </span>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
          <input
            className="input"
            style={{ maxWidth: 220 }}
            placeholder="Nº de tarjeta profesional"
            maxLength={60}
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
          <button
            className="boton-mini"
            data-tono="principal"
            type="button"
            onClick={aprobar}
            disabled={aprobando}
          >
            <ShieldCheck size={14} />
            {aprobando ? 'Aprobando…' : 'Aprobar verificación'}
          </button>

          <ModalMoverColaborador profesional={profesional} />
          <ModalRechazarVerificacion profesional={profesional} />
        </div>
        {error ? (
          <div className="aviso-portal" data-tono="rojo" style={{ marginTop: 8 }}>
            {error}
          </div>
        ) : null}
      </div>
    </div>
  )
}
