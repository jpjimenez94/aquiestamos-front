'use client'

import { useState } from 'react'
import { ExternalLink, FileText, Loader2, ImageIcon } from 'lucide-react'

/**
 * Un documento del portal: tarjeta profesional, certificado o consentimiento.
 *
 * No es un `<a href>` ni un `<img src>` con la URL del archivo, y esa es toda
 * la diferencia. Lo que se guarda en la base es una CLAVE; para verlo hay que
 * pedirle al backend una URL firmada que dura un minuto, y esa petición pasa
 * por los permisos y queda en la auditoría.
 *
 * Consecuencia práctica: la URL se pide cuando alguien hace clic, no al
 * pintar la página. Una lista de veinte profesionales no puede disparar veinte
 * consultas a documentos de identidad que nadie llegó a mirar — quedarían
 * veinte entradas falsas en el rastro de auditoría.
 *
 * Los registros anteriores a Supabase guardan una ruta tipo
 * `/uploads/tarjetas/x.jpeg`. Se detectan y se abren tal cual: puede que el
 * archivo ya no exista (en Vercel el disco es efímero), pero es mejor mostrar
 * el enlace roto que fingir que nunca hubo documento.
 */

/** Una clave de Supabase es `carpeta/uuid.ext`; lo viejo empieza por `/` o `http`. */
function esClave(valor: string) {
  return !valor.startsWith('/') && !valor.startsWith('http') && valor.includes('/')
}

export function DocumentoPrivado({
  clave,
  etiqueta = 'Ver documento',
  className = 'boton-mini',
}: {
  clave?: string | null
  etiqueta?: string
  className?: string
}) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!clave) return null

  const esImagen = /\.(jpe?g|png|webp)$/i.test(clave)

  // Ruta antigua: se abre directamente, no hay nada que firmar.
  if (!esClave(clave)) {
    return (
      <a
        className={className}
        href={clave}
        target="_blank"
        rel="noopener noreferrer"
        title="Documento anterior a la migración: puede que ya no esté disponible"
      >
        {esImagen ? <ImageIcon size={13} /> : <FileText size={13} />}
        {etiqueta}
      </a>
    )
  }

  async function abrir() {
    setCargando(true)
    setError(null)
    try {
      const respuesta = await fetch(`/api/portal/documentos/${clave}`)
      const datos = await respuesta.json()

      if (!respuesta.ok || !datos.success) {
        setError(datos.message ?? 'No pudimos abrir el documento')
        return
      }

      // Se abre en otra pestaña y el enlace caduca en un minuto: si alguien lo
      // copia de la barra de direcciones, lo que copió ya no sirve.
      window.open(datos.data.url, '_blank', 'noopener,noreferrer')
    } catch {
      setError('No pudimos conectarnos con el servidor')
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <button className={className} type="button" onClick={abrir} disabled={cargando}>
        {cargando ? (
          <Loader2 size={13} className="girando" />
        ) : esImagen ? (
          <ImageIcon size={13} />
        ) : (
          <FileText size={13} />
        )}
        {cargando ? 'Abriendo…' : etiqueta}
        {!cargando && <ExternalLink size={11} style={{ opacity: 0.6 }} />}
      </button>
      {error ? (
        <span className="tabla__secundario" style={{ marginTop: 0, color: 'var(--color-red)' }}>
          {error}
        </span>
      ) : null}
    </>
  )
}
