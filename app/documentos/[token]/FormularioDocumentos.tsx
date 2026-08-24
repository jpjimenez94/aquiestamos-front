'use client'

import { useState } from 'react'
import { subirArchivoAction, enviarDocumentosAction } from './actions'

/**
 * Dos archivos y un número opcional. Cada archivo sube apenas se elige — así
 * el error de un archivo pesado sale en el momento, no al final — y el botón
 * de enviar solo confirma el paquete.
 */

function CampoArchivo({
  token,
  etiqueta,
  ayuda,
  clave,
  onClave,
  onError,
}: {
  token: string
  etiqueta: string
  ayuda: string
  clave: string | null
  onClave: (clave: string | null) => void
  onError: (m: string | null) => void
}) {
  const [subiendo, setSubiendo] = useState(false)
  const [nombre, setNombre] = useState<string | null>(null)

  async function alElegir(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    onError(null)
    setSubiendo(true)
    try {
      const fd = new FormData()
      fd.set('archivo', archivo)
      const r = await subirArchivoAction(token, fd)
      if (!r.success) {
        onClave(null)
        setNombre(null)
        onError(r.message)
        return
      }
      onClave(r.clave)
      setNombre(archivo.name)
    } catch {
      /**
       * Si la petición ni siquiera llega (archivo más grande que el límite
       * del servidor, conexión caída), la promesa revienta. Sin este catch,
       * la persona elegía su foto y no pasaba NADA: ni error ni confirmación.
       */
      onClave(null)
      setNombre(null)
      onError('No se pudo subir. Si el archivo es muy pesado, prueba con una foto más liviana; si no, revisa tu señal.')
    } finally {
      setSubiendo(false)
      // El mismo archivo se puede volver a elegir tras un error.
      e.target.value = ''
    }
  }

  return (
    <div>
      <label className="field__label">{etiqueta} *</label>
      <p className="tamizaje__ayuda">{ayuda}</p>
      <label
        className="tamizaje__opcion"
        data-elegida={clave != null}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
      >
        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          style={{ display: 'none' }}
          onChange={alElegir}
          disabled={subiendo}
        />
        {subiendo ? 'Subiendo…' : clave ? `Listo: ${nombre}` : 'Elegir foto o PDF'}
      </label>
    </div>
  )
}

export function FormularioDocumentos({
  token,
  yaEnviado,
  numeroActual,
}: {
  token: string
  yaEnviado: boolean
  numeroActual: string | null
}) {
  const [enviado, setEnviado] = useState(false)
  const [claveTarjeta, setClaveTarjeta] = useState<string | null>(null)
  const [claveIdentidad, setClaveIdentidad] = useState<string | null>(null)
  const [numero, setNumero] = useState(numeroActual ?? '')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (enviado) {
    return (
      <div className="tamizaje__gracias" role="status">
        <svg
          className="tamizaje__gracias-icono"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2>Recibidos</h2>
        <p>El equipo los revisa y te confirmamos por WhatsApp. Gracias por tu tiempo.</p>
      </div>
    )
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!claveTarjeta) {
      setError('Falta tu tarjeta profesional o certificado.')
      return
    }
    if (!claveIdentidad) {
      setError('Falta tu documento de identidad.')
      return
    }
    setEnviando(true)
    try {
      const r = await enviarDocumentosAction(token, {
        claveTarjeta,
        claveIdentidad,
        numeroTarjeta: numero.trim(),
      })
      if (!r.success) {
        setError(r.message)
        return
      }
      setEnviado(true)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="tamizaje__form" onSubmit={enviar} noValidate>
      {yaEnviado ? (
        <p className="tamizaje__nota">
          Ya nos habías enviado documentos y están en revisión. Si algo salió mal o quieres
          reemplazarlos, puedes subirlos de nuevo aquí.
        </p>
      ) : null}

      <CampoArchivo
        token={token}
        etiqueta="Tarjeta profesional o certificado de estudios"
        ayuda="Si ya eres graduado/a, tu tarjeta profesional. Si estás en formación, tu certificado de estudios o constancia de matrícula."
        clave={claveTarjeta}
        onClave={setClaveTarjeta}
        onError={setError}
      />

      <CampoArchivo
        token={token}
        etiqueta="Documento de identidad"
        ayuda="Cédula o documento equivalente, por ambas caras o en PDF."
        clave={claveIdentidad}
        onClave={setClaveIdentidad}
        onError={setError}
      />

      <div>
        <label className="field__label" htmlFor="numero">
          Número de tarjeta profesional (si ya la tienes)
        </label>
        <input
          id="numero"
          className="input"
          maxLength={60}
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />
      </div>

      {error ? (
        <p className="tamizaje__error" role="alert">
          {error}
        </p>
      ) : null}

      <button className="tamizaje__enviar" type="submit" disabled={enviando}>
        {enviando ? 'Enviando…' : 'Enviar mis documentos'}
      </button>
    </form>
  )
}
