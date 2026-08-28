/**
 * En qué momento está un acompañamiento, para saber qué preguntarle al
 * profesional.
 *
 * La pantalla del caso pintaba todos sus paneles siempre. Con el flujo viejo se
 * disimulaba —el profesional llegaba después de aceptar, y para entonces ya
 * había hablado con la persona—, pero desde que se le asigna y se le avisa
 * entra en el minuto cero y se encontraba «¿Puedes tomarlo?» y «¿Qué pasó con
 * esta asignación?» una debajo de la otra.
 *
 * Son preguntas de dos momentos distintos y juntas no significan nada: cómo va
 * a contar qué pasó si todavía no ha pasado nada. Y no es cosa de redacción —
 * un formulario que pregunta fuera de tiempo enseña a ignorarlo, y ese es el
 * único canal por el que coordinación se entera de que alguien no contesta.
 *
 * Vive aquí y no dentro de la pantalla para poder probarlo sin montar React, y
 * para que el día que aparezca otro panel haya un sitio donde decidir cuándo
 * toca en vez de añadirlo suelto.
 */

export type CitaDelCaso = {
  startsAt: string | Date
  status?: string | null
  /** Se pinta junto a la fecha en «Tu próxima sesión». */
  modality?: string | null
}

export type MomentoDelCaso = {
  /** Recién asignado: aún puede decir que no y no hay nada que contar. */
  reciénAsignado: boolean
  /** Hay sesión por delante: se le dice cuándo y que no haga nada hasta entonces. */
  proximaCita: CitaDelCaso | null
  /** Ya hay algo que contar. */
  tocaReportar: boolean
}

const CITAS_VIVAS = ['PROGRAMADA', 'CONFIRMADA']

export function momentoDelCaso({
  puedeDeclinar,
  citas = [],
  reportes = 0,
  ahora = Date.now(),
}: {
  puedeDeclinar?: boolean
  citas?: CitaDelCaso[]
  reportes?: number
  ahora?: number
}): MomentoDelCaso {
  const cuando = (c: CitaDelCaso) => new Date(c.startsAt).getTime()

  const yaHuboSesion = citas.some((c) => cuando(c) <= ahora)

  const proximaCita =
    citas
      .filter((c) => cuando(c) > ahora && CITAS_VIVAS.includes(String(c.status)))
      .sort((a, b) => cuando(a) - cuando(b))[0] ?? null

  /**
   * Se pide el reporte cuando hay algo que reportar: ya pasó una sesión, ya
   * contó algo antes, o no queda ninguna cita por delante que esperar.
   *
   * Ese último caso es la red de seguridad. Si los datos vienen raros —el caso
   * activo pero sin cita— vale más enseñar el formulario de más que dejar sin
   * voz a quien está intentando avisar de algo.
   */
  return {
    reciénAsignado: puedeDeclinar === true,
    proximaCita,
    tocaReportar: puedeDeclinar !== true && (yaHuboSesion || reportes > 0 || !proximaCita),
  }
}
