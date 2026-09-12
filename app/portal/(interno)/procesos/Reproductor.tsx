'use client'

import { useState } from 'react'
import { Play, ExternalLink } from 'lucide-react'

/**
 * El vídeo, pero solo cuando alguien quiere verlo.
 *
 * Con el `<iframe>` puesto de entrada, abrir la página carga los reproductores
 * de todos los vídeos y le cuenta a Google que esta persona los abrió, sin que
 * haya tocado nada. Aquí no hay nada hasta que se pulsa: entonces se monta el
 * reproductor de ese vídeo y solo de ese.
 *
 * El enlace de «abrir en Drive» se queda siempre a mano, que es lo que sirve
 * cuando el portal se ve desde un teléfono con poca pantalla.
 */
export function Reproductor({ drive, titulo }: { drive: string; titulo: string }) {
  const [viendo, setViendo] = useState(false)

  return (
    <div className="video">
      {viendo ? (
        <iframe
          className="video__marco"
          src={`https://drive.google.com/file/d/${drive}/preview`}
          title={titulo}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      ) : (
        <button className="video__portada" type="button" onClick={() => setViendo(true)}>
          <span className="video__play" aria-hidden>
            <Play size={26} fill="currentColor" />
          </span>
          <span className="video__etiqueta">Ver el vídeo</span>
        </button>
      )}

      <a
        className="video__externo"
        href={`https://drive.google.com/file/d/${drive}/view`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink size={13} />
        Abrirlo en Drive
      </a>
    </div>
  )
}
