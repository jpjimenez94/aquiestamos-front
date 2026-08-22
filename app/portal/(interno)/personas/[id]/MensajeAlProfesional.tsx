'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, MessageCircle } from 'lucide-react'
import { mensajeDeAsignacion, enlaceWhatsapp, type DatosDelMensaje } from '@/lib/mensajes'

/**
 * El mensaje listo para mandarle al profesional.
 *
 * Antes aquí solo se copiaba el enlace, y quien coordinaba tenía que escribir
 * el resto a mano cada vez. Eso significaba que las instrucciones —cómo entrar,
 * qué se espera, que hay que responder por el enlace— salían distintas en cada
 * mensaje, o no salían.
 */
export function MensajeAlProfesional({
  telefono,
  ...datos
}: Omit<DatosDelMensaje, 'enlace'> & { telefono: string; ruta: string }) {
  const [copiado, setCopiado] = useState(false)
  const [verTexto, setVerTexto] = useState(false)

  // El origen solo existe en el navegador, así que el mensaje se arma después
  // de montar. Hasta entonces no se dibuja nada, para no mostrar un enlace a
  // medias durante un instante.
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])

  if (!montado) return null

  const mensaje = mensajeDeAsignacion({
    ...datos,
    enlace: `${window.location.origin}${datos.ruta}`,
  })

  function copiar() {
    navigator.clipboard.writeText(mensaje)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const whatsapp = enlaceWhatsapp(telefono, mensaje)

  return (
    <div className="mensaje">
      <div className="mensaje__acciones">
        {whatsapp ? (
          <a
            className="boton-mini"
            data-tono="principal"
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={14} />
            Abrir WhatsApp
          </a>
        ) : (
          <span className="tabla__secundario" style={{ marginTop: 0 }}>
            No sabemos a qué país llamar con ese número. Copia el mensaje y revisa el teléfono en
            su ficha.
          </span>
        )}
        <button className="boton-mini" type="button" onClick={copiar}>
          {copiado ? <Check size={14} /> : <Copy size={14} />}
          {copiado ? '¡Copiado!' : 'Copiar mensaje'}
        </button>
        <button
          className="mensaje__ver"
          type="button"
          onClick={() => setVerTexto((v) => !v)}
          aria-expanded={verTexto}
        >
          {verTexto ? 'Ocultar' : 'Ver el mensaje'}
        </button>
      </div>

      {verTexto ? <pre className="mensaje__texto">{mensaje}</pre> : null}
    </div>
  )
}
