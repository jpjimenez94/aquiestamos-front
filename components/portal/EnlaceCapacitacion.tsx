import Link from 'next/link'
import { PlayCircle } from 'lucide-react'
import { VIDEOS_CAPACITACION, enlaceCapacitacion } from '@/lib/capacitacion'

/**
 * «Ver cómo se hace», en la pantalla donde aparece la duda.
 *
 * La capacitación tiene su página y el manual tiene su capítulo, pero la
 * pregunta —«¿esta tarjeta sirve?», «¿esto se agenda o se reasigna?»— aparece
 * con el caso delante, y nadie interrumpe lo que está haciendo para ir a
 * buscar un documento. Aquí es un botón más de la cabecera.
 *
 * Lleva a la página del portal, no a Drive: así el vídeo se ve dentro de una
 * pantalla con sesión y con el resumen y el capítulo al lado.
 */
export function EnlaceCapacitacion({ video }: { video: string }) {
  const ficha = VIDEOS_CAPACITACION.find((v) => v.id === video)
  if (!ficha) return null

  return (
    <Link className="boton-mini" href={enlaceCapacitacion(ficha.id)} title={ficha.resumen}>
      <PlayCircle size={14} />
      Ver cómo se hace
    </Link>
  )
}
