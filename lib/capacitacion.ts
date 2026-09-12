/**
 * Los vídeos de capacitación de la red.
 *
 * Viven en Drive, no en el repositorio ni en YouTube, y por una razón concreta:
 * son grabaciones de sesiones de Meet donde se ven las caras y los nombres de
 * quienes estaban en la llamada, y en alguna aparece una notificación de
 * WhatsApp con nombres del grupo de operaciones. Eso no puede acabar en una
 * plataforma pública —aunque sea «no listado»—, así que se quedan en la cuenta
 * de la fundación y se ven DENTRO del portal, que ya pide sesión.
 *
 * El reproductor de Drive es por debajo el de YouTube, así que la calidad se
 * adapta a la conexión igual de bien. No se pierde nada por no publicarlos.
 *
 * Para añadir uno: se sube a la misma carpeta de Drive, se copia el id del
 * enlace (`/file/d/<ESTO>/view`) y se añade aquí abajo.
 */

export type VideoCapacitacion = {
  /** Para el ancla de la página: /portal/capacitacion#<id> */
  id: string
  titulo: string
  /** El id del archivo en Drive, el trozo entre `/file/d/` y `/view`. */
  drive: string
  /** De qué va, en una frase. Lo lee quien decide si le toca verlo. */
  resumen: string
  /** A quién le sirve, en palabras del portal. */
  para: string
  /**
   * El capítulo del manual operativo que cuenta lo mismo por escrito, para
   * quien prefiere leer o necesita consultarlo con el caso delante.
   */
  capitulo?: { ancla: string; texto: string }
  /**
   * Momentos del vídeo. Un vídeo de veinte minutos sin índice se ve una vez y
   * no se vuelve a abrir; con índice se consulta.
   *
   * Están vacíos a propósito: los minutos los pone quien lo grabó, no yo — me
   * los inventaría.
   */
  momentos?: { minuto: string; que: string }[]
}

export const VIDEOS_CAPACITACION: VideoCapacitacion[] = [
  {
    id: 'introduccion',
    titulo: 'Introducción a Aquí Estamos',
    drive: '1Zxkq6b6sgbzr3MzVPxBhgkIb4Arc3GAP',
    resumen:
      'Qué es la red, de dónde viene y cómo se organiza el acompañamiento: el punto de partida para cualquiera que entre a la operación.',
    para: 'Todo el equipo, el primer día',
    capitulo: { ancla: 'leeme', texto: 'Léeme primero' },
  },
  {
    id: 'operaciones-y-atencion',
    titulo: 'Capacitación: operaciones y atención',
    drive: '13Dhhaz3V9WN8Ib9Yth7MfHQSeIZwZEdO',
    resumen:
      'La sesión de capacitación del equipo: cómo se verifica a un profesional, cómo se recibe una solicitud y cómo se agenda el acompañamiento.',
    para: 'Voluntariado digital, verificaciones y agenda',
    capitulo: { ancla: 'agendamiento', texto: 'Agendamiento' },
  },
]

/** Los que le sirven a una pantalla concreta, por su id. */
export function videosPara(...ids: string[]): VideoCapacitacion[] {
  return VIDEOS_CAPACITACION.filter((v) => ids.includes(v.id))
}

/**
 * Dónde se ve el vídeo dentro del portal, no el enlace de Drive.
 *
 * Vive en «Cómo funciona la red», encima del mapa de procesos: el ancla lleva
 * directo a la ficha del vídeo que toca.
 */
export function enlaceCapacitacion(id: string): string {
  return `/portal/procesos#${id}`
}
