import type { VideoDePortada as Video } from '@/lib/site'

/**
 * El video institucional, con su texto escrito debajo (`VIDEO_PORTADA`).
 *
 * No arranca solo ni descarga nada hasta que alguien le da a reproducir:
 * la imagen de portada es lo único que pesa al cargar la página.
 */
export function VideoDePortada({ video }: { video: Video }) {
  return (
    <figure className="video-portada">
      <video
        controls
        preload="none"
        playsInline
        poster={video.poster}
        width={video.ancho}
        height={video.alto}
        aria-label={video.titulo}
        aria-describedby="video-portada-texto"
      >
        <source src={video.src} type="video/mp4" />
      </video>
      <details className="video-portada__texto" id="video-portada-texto">
        <summary>{video.leerTexto}</summary>
        {video.transcripcion.map((parrafo) => (
          <p key={parrafo}>{parrafo}</p>
        ))}
      </details>
    </figure>
  )
}
