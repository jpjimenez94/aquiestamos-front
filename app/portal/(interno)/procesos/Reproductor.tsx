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
 * Mientras tanto se ve el primer fotograma, que Drive sirve como miniatura. Un
 * rectángulo negro no dice si el vídeo es el que buscas; el fotograma sí.
 *
 * La miniatura va en un `<img>` normal y no en `next/image` a propósito: la
 * sirve Google, cambiaría con cada despliegue y no gana nada pasando por el
 * optimizador. Si Drive no la devuelve —permisos, red—, el bloque se queda
 * oscuro y el botón sigue funcionando igual.
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
        <button
          className="video__portada"
          type="button"
          onClick={() => setViendo(true)}
          aria-label={`Ver el vídeo: ${titulo}`}
        >
          <img
            className="video__miniatura"
            src={`https://drive.google.com/thumbnail?id=${drive}&sz=w640`}
            alt=""
            loading="lazy"
          />
          <span className="video__play" aria-hidden>
            <Play size={20} fill="currentColor" />
          </span>
        </button>
      )}

      <a
        className="video__externo"
        href={`https://drive.google.com/file/d/${drive}/view`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink size={12} />
        Abrirlo en Drive
      </a>
    </div>
  )
}
