import { LINEAS_EMERGENCIA } from './consentimiento'
import { paraWhatsapp } from './telefono'

/**
 * El mensaje que la coordinación le manda al profesional cuando le asigna un
 * acompañamiento.
 *
 * Vive aquí, en un solo sitio, porque lo usan tres caminos distintos: el botón
 * de copiar, el enlace de WhatsApp y —más adelante— el correo. Si el texto se
 * escribiera en cada uno, se irían separando.
 *
 * Decisión importante: el mensaje NO lleva el nombre ni el teléfono de la
 * persona acompañada. Esos datos solo se ven al abrir el enlace y confirmar el
 * correo del profesional. Mandarlos también por WhatsApp los sacaría de esa
 * protección y los dejaría en el historial de dos teléfonos.
 */

const DIA_LARGO: Record<string, string> = {
  LUNES: 'lunes',
  MARTES: 'martes',
  MIERCOLES: 'miércoles',
  JUEVES: 'jueves',
  VIERNES: 'viernes',
  SABADO: 'sábado',
  DOMINGO: 'domingo',
}

const FRANJA_LARGA: Record<string, string> = {
  MANANA: 'en la mañana',
  TARDE: 'en la tarde',
  NOCHE: 'en la noche',
}

const MODALIDAD_LARGA: Record<string, string> = {
  PRESENCIAL: 'presencial',
  VIRTUAL: 'virtual',
  INDIFERENTE: 'presencial o virtual, le da igual',
}

const URGENCIA: Record<string, string> = {
  ALTA: 'Es un caso de prioridad alta: si puedes, respóndenos hoy mismo.',
  MEDIA: 'Te pedimos responder en los próximos días.',
  BAJA: 'Puedes responder cuando tengas un momento esta semana.',
}

/** "lunes, miércoles y viernes" — con la coma y la "y" donde van. */
function enumerar(partes: string[]): string {
  if (partes.length === 0) return ''
  if (partes.length === 1) return partes[0]
  return `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`
}

export type DatosDelMensaje = {
  profesional: string
  ciudad: string
  prioridad: string
  modalidad: string | null
  dias: string[]
  franjas: string[]
  enlace: string
}

/**
 * PASO 1 · Al profesional: te proponemos un caso, ¿puedes?
 *
 * Antes este mensaje decía "te asignamos un acompañamiento", en indicativo,
 * como si aceptar fuera automático. No lo es: es voluntario y puede no poder.
 * Ahora pregunta, y le pide que responda por su enlace en vez de por WhatsApp
 * — así sus horarios entran al sistema tal como él los escribe, sin que nadie
 * los transcriba y sin depender de que quien coordina se acuerde.
 *
 * Sigue sin llevar el nombre ni el teléfono de la persona: para decidir si
 * puede acompañarla hace falta saber dónde está, cómo prefiere que sea y
 * cuándo puede, no quién es. Si dice que no, no se lleva nada.
 */
export function mensajeDePropuesta(d: DatosDelMensaje): string {
  const dias = enumerar(d.dias.map((x) => DIA_LARGO[x] ?? x.toLowerCase()))
  const franjas = enumerar(d.franjas.map((x) => FRANJA_LARGA[x] ?? x.toLowerCase()))
  const modalidad = d.modalidad ? MODALIDAD_LARGA[d.modalidad] ?? d.modalidad.toLowerCase() : null

  const cuando = [dias, franjas].filter(Boolean).join(' ')

  // Solo el nombre de pila: en un saludo, el apellido sobra.
  const nombre = d.profesional.trim().split(/\s+/)[0]

  const lineas = [
    `Hola ${nombre}, gracias por sumarte a Red Aquí Estamos.`,
    '',
    'Tenemos un acompañamiento que podría encajarte y queremos saber si puedes tomarlo.',
    '',
    `· La persona está en ${d.ciudad}.`,
    modalidad ? `· Prefiere que sea ${modalidad}.` : null,
    cuando ? `· Puede ${cuando}.` : null,
    '',
    URGENCIA[d.prioridad] ?? URGENCIA.MEDIA,
    '',
    'Entra aquí con el correo con el que te registraste y dinos si puedes. Si aceptas, ahí mismo nos dejas los días y las horas en las que podrías:',
    d.enlace,
    '',
    'Con eso cuadramos el horario con ella y te confirmamos. Sus datos de contacto aparecen cuando aceptas, no antes.',
    '',
    'Si no puedes, dínoslo en esa misma pantalla y se lo proponemos a otra persona. No pasa nada: es voluntario.',
    '',
    'Es un acompañamiento confidencial. Te pedimos manejarlo con responsabilidad ética y profesional, y no compartir los datos de la persona con nadie más.',
    '',
    'Gracias por tu tiempo.',
  ]

  return lineas.filter((l) => l !== null).join('\n')
}

/**
 * Enlace que abre WhatsApp con el mensaje ya escrito.
 *
 * Se usa `wa.me` y no la API de WhatsApp Business a propósito: Meta quitó el
 * tramo gratuito en julio de 2025 y desde octubre de 2026 cobra también las
 * plantillas de utilidad. Esto es gratis, no necesita verificación de negocio
 * ni aprobación de plantillas, y lo único que cambia es que alguien tiene que
 * darle a enviar.
 */
export function enlaceWhatsapp(
  telefono: string | null | undefined,
  mensaje: string,
): string | null {
  // Qué indicativo lleva el número lo decide `paraWhatsapp`, en un solo sitio.
  // Si no se puede saber, esto devuelve null y quien llame tiene que enseñar
  // otra cosa: un enlace a un número inexistente parece que funcionó.
  const numero = paraWhatsapp(telefono)
  if (!numero) return null

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}

// ---------------------------------------------------------------------------
// Tamizaje: las preguntas que se le hacen a la persona ANTES de admitirla.
// ---------------------------------------------------------------------------

/**
 * Admitir una solicitud obliga a elegir prioridad, y hasta ahora esa decisión
 * se tomaba con lo único que trae el formulario: nombre, ciudad y cuándo
 * puede. Eso no dice cómo está la persona hoy, así que la prioridad acababa
 * siendo MEDIA casi siempre y la cola se ordenaba por fecha de llegada en vez
 * de por urgencia, que es justo lo que la prioridad venía a evitar.
 *
 * Estas preguntas las manda por WhatsApp quien opera la entrada, y lo que
 * responda la persona es lo que sostiene la elección de ALTA, MEDIA o BAJA.
 *
 * Qué NO es esto: no es un instrumento clínico ni un diagnóstico, y quien lo
 * manda no es psicólogo. Es un triaje —en qué orden acompañar— y el mensaje se
 * lo dice a la persona con esas palabras, para que nadie crea que ya la
 * atendieron y se quede esperando.
 *
 * A diferencia del mensaje al profesional, este SÍ lleva el nombre de la
 * persona: va dirigido a ella misma y a su propio teléfono. Lo que no puede
 * llevar nunca es el dato de un tercero.
 */
const SI_O_NO = [
  { valor: 'SI', etiqueta: 'Sí' },
  { valor: 'NO', etiqueta: 'No' },
] as const

export const PREGUNTAS_TAMIZAJE = [
  {
    clave: 'seguridad',
    pregunta: '¿Estás en un lugar seguro y tienes lo básico (dónde dormir, agua, comida)?',
    respuestas: SI_O_NO,
  },
  {
    clave: 'intensidad',
    pregunta: 'Del 1 al 5, ¿qué tan mal la estás pasando hoy?',
    ayuda: '1 es «lo estoy sobrellevando» y 5 es «no puedo con esto».',
    respuestas: [
      { valor: '1', etiqueta: '1' },
      { valor: '2', etiqueta: '2' },
      { valor: '3', etiqueta: '3' },
      { valor: '4', etiqueta: '4' },
      { valor: '5', etiqueta: '5' },
    ],
  },
  {
    clave: 'sueno',
    pregunta: '¿Has podido dormir y comer estos días?',
    respuestas: [
      { valor: 'SI', etiqueta: 'Sí' },
      { valor: 'MAS_O_MENOS', etiqueta: 'Más o menos' },
      { valor: 'NO', etiqueta: 'No' },
    ],
  },
  {
    clave: 'funcionamiento',
    pregunta: '¿Puedes con tus cosas del día (trabajo, estudio, cuidar a alguien)?',
    respuestas: [
      { valor: 'SI', etiqueta: 'Sí' },
      { valor: 'CON_DIFICULTAD', etiqueta: 'Con dificultad' },
      { valor: 'NO', etiqueta: 'No' },
    ],
  },
  {
    clave: 'red',
    pregunta: '¿Tienes cerca a alguien que te acompañe?',
    respuestas: SI_O_NO,
  },
  {
    clave: 'riesgo',
    pregunta: 'En estos días, ¿has tenido pensamientos de hacerte daño o de no querer seguir?',
    respuestas: SI_O_NO,
  },
  {
    clave: 'urgencia',
    pregunta: '¿Qué tan pronto sientes que necesitas hablar con alguien?',
    respuestas: [
      { valor: 'HOY', etiqueta: 'Hoy' },
      { valor: 'ESTA_SEMANA', etiqueta: 'Esta semana' },
      { valor: 'PUEDO_ESPERAR', etiqueta: 'Puedo esperar' },
    ],
  },
] as const

export type ClaveTamizaje = (typeof PREGUNTAS_TAMIZAJE)[number]['clave']

/** Lo que responde la persona, tal como lo guarda el formulario: todo texto. */
export type RespuestasTamizaje = Partial<Record<ClaveTamizaje, string>>

/**
 * De lo que se tocó en pantalla a lo que entiende el backend.
 *
 * La conversión vive aquí y no en el componente porque los nombres de la
 * derecha son el contrato con la API: si cambian, tienen que cambiar al lado
 * de las preguntas que los producen.
 */
export function respuestasParaLaApi(r: Required<RespuestasTamizaje>) {
  return {
    safePlace: r.seguridad === 'SI',
    distress: Number(r.intensidad),
    sleepAndEat: r.sueno,
    dailyFunction: r.funcionamiento,
    hasSupport: r.red === 'SI',
    selfHarmThoughts: r.riesgo === 'SI',
    howSoon: r.urgencia,
    sensitiveDataConsent: true as const,
  }
}

/** Si esto es cierto, la salida de emergencia tiene que aparecer YA en pantalla. */
export function respuestaDeRiesgo(r: RespuestasTamizaje): boolean {
  return r.riesgo === 'SI' || r.seguridad === 'NO'
}

/**
 * Qué número le toca a una pregunta en el mensaje.
 *
 * La guía de lectura lo usa en vez de escribir "la 6" a mano: reordenar o
 * añadir una pregunta no puede dejar la guía señalando otra distinta.
 */
export function numeroDePregunta(clave: ClaveTamizaje): number {
  return PREGUNTAS_TAMIZAJE.findIndex((p) => p.clave === clave) + 1
}

/**
 * El aviso de crisis va al final y DENTRO del mismo mensaje, no en uno aparte.
 *
 * Preguntarle a alguien si ha pensado en hacerse daño y dejarlo esperando una
 * respuesta que puede tardar horas sería irresponsable: la salida inmediata
 * tiene que viajar en el mismo mensaje que la pregunta.
 */
export const LINEA_DE_CRISIS = `Si en este momento estás en peligro o sientes que puedes hacerte daño, no esperes nuestra respuesta: llama al ${LINEAS_EMERGENCIA.map(
  (l) => `${l.numero} (${l.nombre.toLowerCase()})`,
).join(' o al ')}. Son gratuitas y atienden a toda hora.`

/**
 * El mensaje que abre el tamizaje.
 *
 * Las siete preguntas NO van en el chat: van detrás del enlace. Contestarlas
 * escribiendo obliga a la persona a redactar siete veces y obliga a quien
 * coordina a interpretar un chat; con el enlace es un toque por pregunta y la
 * prioridad sale calculada. El texto en el chat es corto a propósito: es una
 * invitación, no el formulario.
 *
 * La línea de crisis se queda aquí aunque la pregunta de riesgo viva detrás
 * del enlace. Quien recibe esto puede estar mal AHORA, antes de abrir nada.
 */
export function mensajeDeTamizaje({
  nombre,
  enlace,
}: {
  nombre: string
  enlace: string
}): string {
  // Solo el nombre de pila, igual que en el mensaje al profesional.
  const primero = String(nombre ?? '').trim().split(/\s+/)[0] || 'hola'

  return [
    `Hola ${primero}, te escribimos de la Red Aquí Estamos.`,
    '',
    'Recibimos tu solicitud de acompañamiento psicológico y ya estamos buscándote profesional.',
    '',
    `Para saber qué tan pronto necesitamos llamarte, te dejamos ${PREGUNTAS_TAMIZAJE.length} preguntas cortas. Se responden en un minuto, tocando una opción en cada una:`,
    '',
    enlace,
    '',
    'Confírmanos por aquí cuando las hayas respondido, por favor, así te asignamos ayuda lo más pronto posible.',
    '',
    'No es un diagnóstico y quien te escribe no es tu psicólogo: son preguntas para saber en qué orden acompañar. Lo que respondas queda entre tú y el equipo de la red.',
    '',
    LINEA_DE_CRISIS,
  ].join('\n')
}

/**
 * Cómo se leen las respuestas.
 *
 * Vive aquí, al lado de las preguntas, y no en el componente: si las preguntas
 * cambian y la guía se quedó en otro archivo, nadie se entera hasta que
 * alguien admite mal un caso.
 */
export const GUIA_DE_PRIORIDAD = [
  {
    prioridad: 'ALTA',
    resumen: 'Búscale profesional hoy',
    senales: [
      `Contestó que sí a la ${numeroDePregunta('riesgo')}, la de hacerse daño. Esa sola respuesta ya es ALTA, y además hay que avisarle a coordinación de una vez.`,
      `Contestó que no a la ${numeroDePregunta('seguridad')}: no está en un lugar seguro o le falta lo básico.`,
      `Puso 5 en la ${numeroDePregunta('intensidad')}, o puso 4 y además no puede con el día.`,
      `Dijo «Hoy» en la ${numeroDePregunta('urgencia')}.`,
      'Es menor de edad y aparece cualquier señal de MEDIA: en un menor, MEDIA sube a ALTA.',
    ],
  },
  {
    prioridad: 'MEDIA',
    resumen: 'En los próximos días',
    senales: [
      `Puso 3 o 4 en la ${numeroDePregunta('intensidad')}.`,
      `No está durmiendo ni comiendo bien (${numeroDePregunta('sueno')}), o va «con dificultad» con sus cosas del día (${numeroDePregunta('funcionamiento')}).`,
      `Dijo «Esta semana» en la ${numeroDePregunta('urgencia')}.`,
      `Está sola o solo (${numeroDePregunta('red')}: No), aunque el resto se vea bien.`,
    ],
  },
  {
    prioridad: 'BAJA',
    resumen: 'Puede esperar',
    senales: [
      `Puso 1 o 2 en la ${numeroDePregunta('intensidad')}, está en un lugar seguro, duerme, come, puede con el día y tiene con quién.`,
      `Dijo «Puedo esperar» en la ${numeroDePregunta('urgencia')}.`,
    ],
  },
] as const

/** Lo que hay que saber además de la tabla, para no confiarse de ella. */
export const REGLAS_DE_LECTURA = [
  'Ante la duda, el sistema sube la prioridad, no la baja: una sola señal de ALTA basta aunque todo lo demás esté bien, y en un menor de edad cualquier señal de MEDIA se vuelve ALTA.',
  'Que no conteste NO significa que esté bien. A los dos días el sistema la admite igual, en MEDIA, para que no se quede fuera de la cola — pero esa prioridad es una suposición, no algo que ella haya dicho. A quien entró así hay que llamarla, no solo asignarle profesional.',
  'La prioridad sale de siete preguntas, no de conocer a la persona. Si sabes algo que las preguntas no recogieron, dilo en su ficha de Personas y trátalo como lo que sepas, no como lo que diga la etiqueta.',
] as const

// ---------------------------------------------------------------------------
// Los tres mensajes que siguen a la propuesta.
//
// Asignar no es un clic: es una negociación entre quien coordina, el
// profesional y la persona acompañada. Cada estado de esa negociación tiene
// exactamente un mensaje, y viven aquí los cuatro juntos para que se lean
// como lo que son —una conversación— y no como cuatro textos sueltos.
// ---------------------------------------------------------------------------

/**
 * PASO 2 · A la persona acompañada: ya hay profesional, ¿cuándo puedes?
 *
 * Lleva el NOMBRE del profesional pero no su teléfono. Saber quién la va a
 * acompañar es lo que convierte «alguien te va a llamar» en algo real; darle
 * el número, en cambio, saca el de un voluntario de la red al historial de
 * WhatsApp de un tercero. Quien cuadra el horario es coordinación.
 */
export function mensajeParaCuadrarHorario(d: {
  persona: string
  profesional: string
  dias: string[]
  franjas: string[]
  nota?: string | null
}): string {
  const nombre = String(d.persona ?? '').trim().split(/\s+/)[0] || 'hola'
  const dias = enumerar(d.dias.map((x) => DIA_LARGO[x] ?? x.toLowerCase()))
  const franjas = enumerar(d.franjas.map((x) => FRANJA_LARGA[x] ?? x.toLowerCase()))

  return [
    `Hola ${nombre}, te escribimos de la Red Aquí Estamos.`,
    '',
    `Ya tenemos quién te acompañe: ${d.profesional}, profesional de la red.`,
    '',
    dias || franjas ? 'Nos dijo que puede en estos momentos:' : 'Estamos cuadrando el horario.',
    dias ? `· ${dias}` : null,
    franjas ? `· ${franjas}` : null,
    d.nota ? `· ${d.nota}` : null,
    '',
    '¿Cuál de esos te sirve? Respóndenos por aquí y lo dejamos agendado. Si ninguno te queda bien, dinos tú cuándo puedes y lo miramos.',
    '',
    LINEA_DE_CRISIS,
  ]
    .filter((l) => l !== null)
    .join('\n')
}

/**
 * PASO 3 · A la persona acompañada: quedó agendada.
 *
 * Con la fecha, la hora y el nombre de quien la va a acompañar, y diciéndole
 * claramente que el profesional la va a contactar. Sin esa última frase, la
 * persona se queda esperando sin saber quién da el primer paso — y en una
 * espera así, no saber es lo que más pesa.
 */
export function mensajeDeCitaConfirmada(d: {
  persona: string
  profesional: string
  cuando: string
  modalidad?: string | null
}): string {
  const nombre = String(d.persona ?? '').trim().split(/\s+/)[0] || 'hola'
  const modalidad = d.modalidad ? MODALIDAD_LARGA[d.modalidad] ?? d.modalidad.toLowerCase() : null

  return [
    `Listo, ${nombre}. Tu acompañamiento quedó agendado.`,
    '',
    `· Con: ${d.profesional}`,
    `· Cuándo: ${d.cuando}`,
    modalidad ? `· Modalidad: ${modalidad}` : null,
    '',
    `${d.profesional.trim().split(/\s+/)[0]} se va a poner en contacto contigo para ese momento. No tienes que hacer nada más.`,
    '',
    'Si te surge algo y no puedes, escríbenos por aquí con tiempo y lo movemos. No pasa nada.',
    '',
    LINEA_DE_CRISIS,
  ]
    .filter((l) => l !== null)
    .join('\n')
}

/**
 * PASO 4 · Al profesional: quedó para tal día.
 *
 * Los datos de contacto de la persona siguen sin viajar por WhatsApp: van
 * detrás del enlace, como siempre.
 */
export function mensajeDeCitaAlProfesional(d: {
  profesional: string
  cuando: string
  modalidad?: string | null
  enlace: string
}): string {
  const nombre = String(d.profesional ?? '').trim().split(/\s+/)[0] || 'hola'
  const modalidad = d.modalidad ? MODALIDAD_LARGA[d.modalidad] ?? d.modalidad.toLowerCase() : null

  return [
    `Hola ${nombre}, ya cuadramos el horario.`,
    '',
    `· Cuándo: ${d.cuando}`,
    modalidad ? `· Modalidad: ${modalidad}` : null,
    '',
    'Los datos de contacto de la persona están en tu enlace. Entras con el mismo correo:',
    d.enlace,
    '',
    'Le dijimos que tú vas a contactarla para ese momento, así que te está esperando.',
    '',
    'Cuando pase, cuéntanos cómo te fue desde ese mismo enlace. Eso es lo que nos permite saber en qué va el caso sin tener que llamarte a preguntar.',
    '',
    'Gracias por tu tiempo.',
  ]
    .filter((l) => l !== null)
    .join('\n')
}
