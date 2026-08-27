import { LINEAS_EMERGENCIA } from './consentimiento'
import { nombreDePila } from './nombre'
import { paraWhatsapp } from './telefono'

/**
 * El mensaje que la coordinación le manda al profesional cuando le asigna un
 * acompañamiento.
 *
 * Vive aquí, en un solo sitio, porque lo usan tres caminos distintos: el botón
 * de copiar, el enlace de WhatsApp y —más adelante— el correo. Si el texto se
 * escribiera en cada uno, se irían separando.
 *
 * CON FORMATO DE WHATSAPP, con moderación: *asteriscos* = negrita al
 * enviarse. Solo en lo que el ojo debe encontrar primero — la fecha de la
 * cita, los números de crisis, la prioridad. Un mensaje todo en negrita no
 * subraya nada.
 *
 * SIN EMOJIS, a propósito: viajan dentro de una URL de wa.me y según el
 * dispositivo llegan como un cuadro vacío o un signo roto — justo en mensajes
 * donde el tono importa. La calidez va en las palabras, que llegan siempre.
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

/**
 * Con las horas entre paréntesis: "en la noche" a secas obliga a la persona a
 * adivinar si eso es a las 7 o a las 11. Los rangos son los mismos que define
 * el backend en `timezone.service.js` (FRANJAS) — si allá cambian, cambian
 * aquí también.
 */
const FRANJA_LARGA: Record<string, string> = {
  MANANA: 'en la mañana (de 8:00 a. m. a 12:00 p. m.)',
  TARDE: 'en la tarde (de 12:00 p. m. a 6:00 p. m.)',
  NOCHE: 'en la noche (de 6:00 p. m. a 9:00 p. m.)',
}

const MODALIDAD_LARGA: Record<string, string> = {
  PRESENCIAL: 'presencial',
  VIRTUAL: 'virtual',
  INDIFERENTE: 'presencial o virtual, le da igual',
}

const URGENCIA: Record<string, string> = {
  ALTA: 'Es un caso de *prioridad alta*: si puedes, respóndenos hoy mismo.',
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
  const nombre = nombreDePila(d.profesional)

  /**
   * Lo que NO sabemos se dice, no se calla.
   *
   * Antes, si la solicitud llegaba sin modalidad y sin días, esas líneas
   * simplemente no salían y el mensaje quedaba en «la persona está en Cali».
   * Un profesional lee ese silencio como «no tiene restricciones» —que es lo
   * contrario de lo que significa— y puede aceptar creyendo que es flexible
   * para descubrir después que solo puede los domingos.
   *
   * No es un caso raro: el formulario público pide la disponibilidad como
   * opcional y en la práctica casi nadie la llena.
   */
  const faltantes = [
    !modalidad ? 'qué modalidad prefiere' : null,
    !cuando ? 'qué días puede' : null,
  ].filter((x): x is string => x !== null)

  const lineas = [
    // Neutro a propósito: «gracias por sumarte» es para quien acaba de
    // llegar, y este mensaje le va a llegar a la misma persona muchas veces.
    `Hola ${nombre}, te escribimos de Red Aquí Estamos.`,
    '',
    'Queremos proponerte un acompañamiento. Cuéntanos si puedes tomarlo:',
    '',
    `· La persona está en ${d.ciudad}.`,
    modalidad ? `· Prefiere que sea ${modalidad}.` : null,
    cuando ? `· Puede ${cuando}.` : null,
    faltantes.length
      ? `· No sabemos ${enumerar(faltantes)}: no quedó en el formulario. Eso lo cuadramos contigo después.`
      : null,
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

  /**
   * Las tres últimas no son sobre cómo está, sino sobre cuándo puede.
   *
   * Van aquí y no en el formulario público por una razón concreta: allá se
   * preguntan como opcionales y no las llena nadie —de las cinco solicitudes
   * que había, cinco llegaron sin días—, y la consecuencia sale al otro lado
   * de la red: al profesional le llega una propuesta sin más dato que la
   * ciudad y tiene que decidir a ciegas.
   *
   * Aquí sí las responde, porque ya está contestando y le cuestan dos toques.
   */
  {
    clave: 'dias',
    pregunta: '¿Qué días podrías tener el acompañamiento?',
    ayuda: 'Marca todos los que te sirvan. Entre más marques, más rápido te encontramos con quién.',
    multiple: true,
    respuestas: [
      { valor: 'LUNES', etiqueta: 'Lunes' },
      { valor: 'MARTES', etiqueta: 'Martes' },
      { valor: 'MIERCOLES', etiqueta: 'Miércoles' },
      { valor: 'JUEVES', etiqueta: 'Jueves' },
      { valor: 'VIERNES', etiqueta: 'Viernes' },
      { valor: 'SABADO', etiqueta: 'Sábado' },
      { valor: 'DOMINGO', etiqueta: 'Domingo' },
    ],
  },
  {
    clave: 'franjas',
    pregunta: '¿A qué horas te queda mejor?',
    ayuda: 'También puedes marcar varias.',
    multiple: true,
    respuestas: [
      { valor: 'MANANA', etiqueta: 'Mañana (8 a. m. – 12 m.)' },
      { valor: 'TARDE', etiqueta: 'Tarde (12 m. – 6 p. m.)' },
      { valor: 'NOCHE', etiqueta: 'Noche (6 – 9 p. m.)' },
    ],
  },
  {
    clave: 'modalidad',
    pregunta: '¿Cómo prefieres que sea?',
    respuestas: [
      { valor: 'VIRTUAL', etiqueta: 'Por video o llamada' },
      { valor: 'PRESENCIAL', etiqueta: 'En persona' },
      { valor: 'INDIFERENTE', etiqueta: 'Me da igual' },
    ],
  },
] as const

export type ClaveTamizaje = (typeof PREGUNTAS_TAMIZAJE)[number]['clave']

/**
 * Lo que responde la persona.
 *
 * Siempre una lista, incluso en las preguntas de una sola respuesta, que
 * guardan una lista de un elemento. Tener dos formas —a veces texto, a veces
 * lista— obliga a preguntar en cada sitio cuál es cuál, y ese es justo el tipo
 * de rama que acaba leyendo mal una respuesta.
 */
export type RespuestasTamizaje = Partial<Record<ClaveTamizaje, string[]>>

/** La primera respuesta de una pregunta de opción única. */
function una(r: RespuestasTamizaje, clave: ClaveTamizaje): string | undefined {
  return r[clave]?.[0]
}

/**
 * De lo que se tocó en pantalla a lo que entiende el backend.
 *
 * La conversión vive aquí y no en el componente porque los nombres de la
 * derecha son el contrato con la API: si cambian, tienen que cambiar al lado
 * de las preguntas que los producen.
 */
export function respuestasParaLaApi(r: RespuestasTamizaje) {
  return {
    safePlace: una(r, 'seguridad') === 'SI',
    distress: Number(una(r, 'intensidad')),
    sleepAndEat: una(r, 'sueno'),
    dailyFunction: una(r, 'funcionamiento'),
    hasSupport: una(r, 'red') === 'SI',
    selfHarmThoughts: una(r, 'riesgo') === 'SI',
    howSoon: una(r, 'urgencia'),
    // Cuándo puede: esto es lo que acaba en su ficha y en la propuesta que
    // recibe el profesional.
    availableDays: r.dias ?? [],
    availableSlots: r.franjas ?? [],
    preferredModality: una(r, 'modalidad'),
    sensitiveDataConsent: true as const,
  }
}

/** Si esto es cierto, la salida de emergencia tiene que aparecer YA en pantalla. */
export function respuestaDeRiesgo(r: RespuestasTamizaje): boolean {
  return una(r, 'riesgo') === 'SI' || una(r, 'seguridad') === 'NO'
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
  (l) => `*${l.numero}* (${l.nombre.toLowerCase()})`,
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
  const primero = nombreDePila(nombre) || 'hola'

  return [
    `Hola ${primero}, te escribimos de la Red Aquí Estamos.`,
    '',
    /**
     * Lo lee alguien que acaba de pedir ayuda; el tono importa más que en
     * ningún otro mensaje. Tres cosas que este texto NO debe hacer:
     *   - hablar de lo que NOSOTROS necesitamos («para saber qué tan pronto
     *     necesitamos llamarte»): se habla de la persona, no de la operación;
     *   - contarle que está en una fila («saber en qué orden acompañar»);
     *   - condicionar la ayuda a que conteste («así podemos acompañarte lo
     *     antes posible»).
     */
    'Recibimos tu solicitud de acompañamiento. Gracias por dar este paso: pedir compañía no siempre es fácil. Ya estamos buscando a la persona que va a acompañarte.',
    '',
    `Mientras tanto, nos gustaría conocerte un poco mejor para acompañarte bien desde el comienzo. Son *${PREGUNTAS_TAMIZAJE.length} preguntas cortas* en nuestro sitio, redaquiestamos.org — se responden en un minuto, tocando una opción en cada una:`,
    '',
    enlace,
    '',
    'No hay respuestas buenas ni malas, y no es una evaluación ni un diagnóstico: lo que respondas queda entre tú y el equipo de la red.',
    '',
    'Cuando las respondas, cuéntanos por aquí.',
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
  const nombre = nombreDePila(d.persona) || 'hola'
  const dias = enumerar(d.dias.map((x) => DIA_LARGO[x] ?? x.toLowerCase()))
  const franjas = enumerar(d.franjas.map((x) => FRANJA_LARGA[x] ?? x.toLowerCase()))

  return [
    `Hola ${nombre}, te escribimos de la Red Aquí Estamos.`,
    '',
    `Ya tenemos quién te acompañe: ${d.profesional}, profesional de la red.`,
    '',
    dias || franjas ? 'Estos son los horarios en los que puede atenderte:' : 'Estamos cuadrando el horario.',
    dias ? `· ${dias}` : null,
    franjas ? `· ${franjas}` : null,
    d.nota ? `· ${d.nota}` : null,
    '',
    '*¿Cuál de esos te sirve?* Respóndenos por aquí y lo dejamos agendado. Si ninguno te queda bien, dinos tú cuándo puedes y lo miramos.',
  ]
    .filter((l) => l !== null)
    .join('\n')
}

/**
 * REAGENDAMIENTO · Al profesional: pedirle su nueva disponibilidad tras un imprevisto.
 *
 * Cuando el profesional avisa de un compromiso personal o cita médica en el
 * horario anterior, coordinación le escribe pidiéndole qué otros días y horas
 * tiene libres para armar la propuesta de horarios a la persona acompañada.
 */
export function mensajeDePedirNuevaDisponibilidadAlProfesional(d: {
  profesional: string
  persona: string
  cuandoAnterior?: string | null
  enlace?: string | null
}): string {
  const nombreProf = nombreDePila(d.profesional) || 'hola'
  const nombrePers = nombreDePila(d.persona) || 'la persona'
  const horarioRef = d.cuandoAnterior ? ` que teníamos acordado (${d.cuandoAnterior})` : ''

  return [
    `Hola ${nombreProf}, te escribimos de la Red Aquí Estamos sobre el caso de ${nombrePers}.`,
    '',
    `Entendemos que te surgió un imprevisto con el horario${horarioRef}. No te preocupes.`,
    '',
    `Cuéntanos por favor qué otros días y horas tienes disponibles esta o la próxima semana para coordinar con ${nombrePers} y dejar la cita reprogramada:`,
    d.enlace ? `Puedes consultar el caso en tu enlace seguro: ${d.enlace}` : null,
    '',
    'Quedamos muy atentos a tu respuesta para armar la propuesta de horarios. ¡Muchas gracias por tu compromiso!',
  ]
    .filter((l) => l !== null)
    .join('\n')
}

/**
 * REAGENDAMIENTO · Excusas a la persona acompañada por imprevisto / cambio de agenda del profesional.
 *
 * Cuando el profesional avisa de un compromiso de fuerza mayor o cita médica
 * en el horario pactado, coordinación le escribe a la persona disculpándose,
 * confirmándole que el mismo profesional sigue comprometido en atenderla, y
 * proponiéndole los nuevos espacios disponibles.
 */
export function mensajeDeExcusasYReagendamiento(d: {
  persona: string
  profesional: string
  cuandoAnterior?: string | null
  motivo?: string | null
  dias?: string[]
  franjas?: string[]
  nota?: string | null
}): string {
  const nombrePers = nombreDePila(d.persona) || 'hola'
  const nombreProf = nombreDePila(d.profesional) || 'el profesional'
  const dias = d.dias?.length ? enumerar(d.dias.map((x) => DIA_LARGO[x] ?? x.toLowerCase())) : null
  const franjas = d.franjas?.length ? enumerar(d.franjas.map((x) => FRANJA_LARGA[x] ?? x.toLowerCase())) : null

  const razon = d.motivo?.trim() || 'un compromiso personal de fuerza mayor'
  const referenciaHorario = d.cuandoAnterior ? ` que teníamos acordado (${d.cuandoAnterior})` : ''

  return [
    `Hola ${nombrePers}, te escribimos de la Red Aquí Estamos.`,
    '',
    `Queremos pedirte una disculpa sincera: ${nombreProf} tuvo ${razon} y se le cruza con el horario${referenciaHorario}.`,
    '',
    `${nombreProf} sigue a cargo de tu acompañamiento y está con total disposición de atenderte. Estos son los horarios que nos confirmó disponibles para reprogramar tu sesión:`,
    dias ? `· Días: ${dias}` : null,
    franjas ? `· Momentos del día: ${franjas}` : null,
    d.nota ? `· ${d.nota}` : null,
    !dias && !franjas && !d.nota ? '· Podemos agendarla a la misma hora en otro día, o en el espacio que te quede mejor.' : null,
    '',
    '*¿Cuál de estos espacios te sirve mejor?* Respóndenos por aquí y dejamos la cita reprogramada de una vez. Si ninguno te queda bien, cuéntanos qué otros momentos te sirven y lo coordinamos.',
    '',
    'Muchas gracias por tu comprensión y paciencia.',
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
  enlaceReunion?: string | null
}): string {
  const nombre = nombreDePila(d.persona) || 'hola'
  const modalidad = d.modalidad ? MODALIDAD_LARGA[d.modalidad] ?? d.modalidad.toLowerCase() : null

  return [
    `Listo, ${nombre}. Tu acompañamiento quedó agendado.`,
    '',
    `· *Con:* ${d.profesional}`,
    `· *Cuándo:* ${d.cuando}`,
    modalidad ? `· *Modalidad:* ${modalidad}` : null,
    d.enlaceReunion ? `· *Enlace de videollamada:* ${d.enlaceReunion}` : null,
    '',
    d.enlaceReunion
      ? `A la hora acordada, solo debes hacer clic en el enlace de videollamada desde tu celular o computador para unirte a la sesión con ${nombreDePila(d.profesional)}. No tienes que descargar nada ni registrarte.`
      : `${nombreDePila(d.profesional)} se va a poner en contacto contigo para ese momento. No tienes que hacer nada más.`,
    '',
    'Si te surge algo y no puedes, escríbenos por aquí con tiempo y lo movemos. No pasa nada.',
  ]
    .filter((l) => l !== null)
    .join('\n')
}

/**
 * PASO 3b · A la persona: firma el consentimiento antes de la sesión.
 *
 * El enlace va COMPLETO y lo arma el servidor con SITIO_URL, como todos los
 * enlaces que salen por WhatsApp. Dice para qué es y qué pasa si no se firma,
 * sin sonar a contrato: es requisito, no amenaza.
 */
export function mensajeDeConsentimiento(d: {
  persona: string
  profesional: string
  enlace: string
}): string {
  const nombre = nombreDePila(d.persona) || 'hola'

  return [
    `Hola ${nombre}, antes de tu sesión con ${nombreDePila(d.profesional)} te pedimos leer y firmar el consentimiento informado. Es corto y se hace desde cualquier dispositivo en nuestro sitio web oficial:`,
    d.enlace,
    '',
    'Es el paso que nos permite empezar: explica cómo funciona el acompañamiento y cómo cuidamos lo que nos cuentes. Te toma un par de minutos.',
    '',
    'Si algo no te queda claro, escríbenos por aquí y te lo explicamos con gusto.',
  ].join('\n')
}

/**
 * DOCUMENTOS · Al profesional: sube tu tarjeta y tu identidad por tu enlace.
 *
 * El porqué va primero y sin rodeos: es por la seguridad de todos — de
 * quienes acompañan y de quienes son acompañados. Con enlace, el documento
 * viaja del teléfono directo al almacenamiento privado y WhatsApp nunca lo
 * toca; sin enlace (fallback), se pide como respuesta al mensaje.
 */
export function mensajeDePedirDocumentos(d: {
  profesional: string
  enlace?: string | null
  tipo?: 'general' | 'graduado' | 'estudiante'
}): string {
  const nombre = nombreDePila(d.profesional) || 'hola'

  const pedido =
    d.tipo === 'graduado'
      ? ['· Tu *tarjeta profesional* (foto o PDF) y su número.']
      : d.tipo === 'estudiante'
        ? ['· Tu *certificado de estudios*, constancia de matrícula de últimos semestres o carné estudiantil vigente.']
        : [
            '· Si ya eres graduado/a: tu *tarjeta profesional* (foto o PDF).',
            '· Si estás en formación: tu *certificado de estudios* o constancia de matrícula.',
          ]

  return [
    `Hola ${nombre}, te escribimos de Red Aquí Estamos.`,
    '',
    /**
     * Abre agradeciendo y sin género: le llega igual a quien acaba de
     * postularse que a quien lleva tiempo y aún no sube sus documentos.
     */
    'Recibimos tu postulación para acompañar en la red. Gracias por dar este paso: nos alegra contar contigo.',
    '',
    'Para dejar tu perfil listo y poder asignarte acompañamientos, nos faltan dos documentos. Es por la seguridad de todos — de quienes acompañan y de quienes son acompañados:',
    ...pedido,
    '· Tu *documento de identidad*.',
    '',
    /**
     * Lenguaje anti-phishing a propósito: se nombra el dominio real, no se
     * engolosina el enlace («personal», «exclusivo»), y se le da permiso a
     * la persona de desconfiar y verificar por este mismo chat — que es
     * exactamente lo que un estafador nunca ofrece.
     */
    d.enlace
      ? 'Los puedes subir en esta página de nuestro sitio, redaquiestamos.org:'
      : 'Nos los puedes mandar respondiendo a este mensaje.',
    d.enlace ?? null,
    '',
    'Quedan en un almacenamiento privado y cifrado: solo los ve el equipo de la red, y cada consulta queda registrada.',
    '',
    d.enlace
      ? 'Si este mensaje te genera dudas, respóndenos por aquí antes de abrir el enlace: verificar siempre está bien.'
      : null,
    d.enlace ? '' : null,
    'Gracias por tu tiempo.',
  ]
    .filter((l) => l !== null)
    .join('\n')
}

/**
 * CIERRE · A la persona: la encuesta breve, opcional de verdad.
 *
 * Mismos lineamientos que todo mensaje a la persona: nombre de pila, sin
 * emojis, negrita solo donde el ojo debe caer, línea de crisis al final. Y
 * un cuidado extra: deja claro que no responder no tiene consecuencia — una
 * encuesta que se siente obligatoria, en este contexto, es una carga más.
 */
export function mensajeDeEncuesta(d: { persona: string; enlace: string }): string {
  const nombre = nombreDePila(d.persona) || 'hola'

  return [
    `Hola ${nombre}, te escribimos de la Red Aquí Estamos.`,
    '',
    'Tu acompañamiento quedó cerrado. Gracias por confiar en la red: fue un gusto estar contigo en esto.',
    '',
    'Si quieres, cuéntanos cómo te fue. Son *dos preguntas*, toma menos de un minuto y nos ayuda a acompañar mejor a quien viene después:',
    d.enlace,
    '',
    'Es completamente opcional: si no la respondes, no pasa nada. Y si más adelante vuelves a necesitarnos, aquí estamos.',
  ].join('\n')
}

/**
 * SEGUIMIENTO · Al profesional, sobre su caso.
 *
 * Vivía suelto en un componente, con emoji, y con el nombre y el TELÉFONO de
 * la persona acompañada dentro del chat — la única pantalla de la red
 * rompiendo la regla de que esos datos van detrás del enlace, nunca por
 * WhatsApp. El tono pregunta antes de recordar: quien acompaña es voluntario,
 * no un contratista al que se le cobra el avance.
 */
export function mensajeDeSeguimientoAlProfesional(d: {
  profesional: string
  enlace?: string | null
}): string {
  const nombre = nombreDePila(d.profesional) || 'hola'

  return [
    `Hola ${nombre}, te escribimos de Red Aquí Estamos.`,
    '',
    '¿Cómo va el acompañamiento que tienes a cargo? Si ya hubo contacto o sesión, cuéntanos desde tu enlace del caso: así sabemos en qué va sin estar preguntándote.',
    d.enlace ? d.enlace : null,
    '',
    'Y si algo se ha complicado —la persona no contesta, no has podido tú, lo que sea— dínoslo por aquí y lo resolvemos juntos. Para eso estamos.',
    '',
    'Gracias por tu tiempo.',
  ]
    .filter((l) => l !== null)
    .join('\n')
}

/**
 * SEGUIMIENTO · A la persona acompañada: ¿cómo vas?
 *
 * Pregunta abierta y sin reproche: si el contacto no se ha dado, la causa
 * puede ser el profesional, el teléfono o que la persona no está bien — y el
 * mensaje no debe hacerla sentir en falta por ninguna de las tres.
 */
export function mensajeDeSeguimientoALaPersona(d: {
  persona: string
  profesional: string
}): string {
  const nombre = nombreDePila(d.persona) || 'hola'

  return [
    `Hola ${nombre}, te escribimos de la Red Aquí Estamos.`,
    '',
    `Queríamos saber cómo vas: ¿ya pudiste hablar con ${nombreDePila(d.profesional)}, o sigue pendiente?`,
    '',
    'Lo que necesites —mover un horario, contarnos algo, o simplemente decirnos que sigues ahí— respóndenos por aquí. Estamos para acompañarte.',
  ].join('\n')
}

/**
 * SEGUIMIENTO · Recordatorio general a profesionales (se manda uno a uno).
 * Genérico a propósito: no nombra casos, así el mismo texto sirve para todos.
 */
export function mensajeDeSeguimientoGeneral(): string {
  return [
    'Hola, te escribimos de Red Aquí Estamos.',
    '',
    'Un recordatorio corto: si tienes un acompañamiento a cargo, entra a tu enlace del caso y cuéntanos en qué va — si ya hubo contacto, si hay sesión agendada, o si algo se complicó.',
    '',
    'Con eso el equipo sabe en qué va cada caso sin escribirte a cada rato. Y si necesitas algo de nosotros, respóndenos por aquí.',
    '',
    'Gracias por tu tiempo.',
  ].join('\n')
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
  enlaceReunion?: string | null
}): string {
  const nombre = nombreDePila(d.profesional) || 'hola'
  const modalidad = d.modalidad ? MODALIDAD_LARGA[d.modalidad] ?? d.modalidad.toLowerCase() : null

  return [
    `Hola ${nombre}, ya cuadramos el horario.`,
    '',
    `· *Cuándo:* ${d.cuando}`,
    modalidad ? `· *Modalidad:* ${modalidad}` : null,
    d.enlaceReunion ? `· *Enlace de la videollamada:* ${d.enlaceReunion}` : null,
    '',
    'Los datos de contacto de la persona están en tu enlace. Entras con el mismo correo:',
    d.enlace,
    '',
    'Le dijimos que tú vas a contactarla para ese momento, así que te está esperando.',
    '',
    /**
     * El pedido de después de la sesión va en tres preguntas concretas, no en
     * un «cuéntanos cómo te fue»: con esas tres coordinación cierra la cita y
     * decide lo que sigue sin llamar a nadie. La tercera es la que faltaba —
     * sin ella no había forma de saber si agendar otra o cerrar el caso.
     */
    'Cuando pase la sesión, entra a ese mismo enlace y cuéntanos *tres cosas*:',
    '1. Si la sesión se pudo hacer o no.',
    '2. Cómo te fue.',
    '3. Si crees que necesita más sesiones, o con esta fue suficiente.',
    '',
    'Con eso cerramos esta cita y cuadramos la siguiente si hace falta, sin tener que llamarte a preguntar.',
    '',
    'Gracias por tu tiempo.',
  ]
    .filter((l) => l !== null)
    .join('\n')
}

const CANAL_CONTACTO: Record<string, string> = {
  WHATSAPP: 'WhatsApp',
  LLAMADA: 'llamada telefónica',
  CORREO: 'correo electrónico',
}

/**
 * PASO 10 · Al profesional: la cita está confirmada y el consentimiento firmado.
 *
 * Entrega formal del caso al profesional:
 *   - Informa que el consentimiento informado ya está firmado y la cita confirmada.
 *   - Especifica fecha, hora, modalidad y el canal preferido de la persona.
 *   - Enfatiza su responsabilidad de dar el primer paso de contacto y la puntualidad/compromiso.
 *   - Proporciona el enlace seguro para consultar los datos protegidos y reportar post-sesión.
 *   - Solicita confirmar de recibido el mensaje.
 */
export function mensajeDeCitaConfirmadaAlProfesional(d: {
  profesional: string
  persona: string
  cuando: string
  modalidad?: string | null
  canalContacto?: string | null
  enlace: string
  enlaceReunion?: string | null
}): string {
  const nombreProf = nombreDePila(d.profesional) || 'hola'
  const nombrePers = nombreDePila(d.persona) || 'la persona acompañada'
  const modalidad = d.modalidad ? MODALIDAD_LARGA[d.modalidad] ?? d.modalidad.toLowerCase() : null
  const canal = d.canalContacto ? CANAL_CONTACTO[d.canalContacto] ?? d.canalContacto.toLowerCase() : 'WhatsApp'

  return [
    `Hola ${nombreProf}, la cita ya está confirmada y lista para iniciar.`,
    '',
    `· *Persona acompañada:* ${nombrePers}`,
    `· *Cuándo:* ${d.cuando}`,
    modalidad ? `· *Modalidad:* ${modalidad}` : null,
    d.enlaceReunion ? `· *Enlace de videollamada:* ${d.enlaceReunion}` : null,
    `· *Canal preferido de la persona:* ${canal}`,
    '· *Consentimiento informado:* Firmado por la persona',
    '',
    '*Tu responsabilidad en este acompañamiento:*',
    `1. Tú das el primer paso: ponte en contacto con ella por ${canal} unos *15 minutos antes* de la cita para coordinar el inicio de la sesión en la fecha y hora acordadas. Ella ya sabe que la vas a contactar.`,
    '2. Compromiso y puntualidad: la persona te está esperando. Si te surge un imprevisto de fuerza mayor, avísanos de inmediato por aquí para no dejarla esperando y poder reagendar a tiempo.',
    '',
    'Los datos de contacto y la información del caso están en tu enlace seguro:',
    d.enlace,
    '',
    'Al terminar la sesión, entra a ese mismo enlace para registrar el reporte de cierre (si se realizó, cómo fue y si necesita más sesiones).',
    '',
    'Por favor *respóndenos a este mensaje confirmando que lo recibiste y lo tienes agendado*.',
    '',
    'Gracias por tu compromiso y por acompañar en la red.',
  ]
    .filter((l) => l !== null)
    .join('\n')
}

/**
 * SEGUIMIENTO · Al profesional: quedó agendada la siguiente sesión de acompañamiento.
 */
export function mensajeDeSiguienteCitaConfirmadaAlProfesional(d: {
  profesional: string
  persona: string
  cuando: string
  modalidad?: string | null
  enlace: string
  enlaceReunion?: string | null
}): string {
  const nombreProf = nombreDePila(d.profesional) || 'hola'
  const nombrePers = nombreDePila(d.persona) || 'la persona acompañada'
  const modalidad = d.modalidad ? MODALIDAD_LARGA[d.modalidad] ?? d.modalidad.toLowerCase() : null

  return [
    `Hola ${nombreProf}, te escribimos de Red Aquí Estamos.`,
    '',
    `Quedó agendada tu siguiente sesión de acompañamiento con ${nombrePers}:`,
    '',
    `· *Cuándo:* ${d.cuando}`,
    modalidad ? `· *Modalidad:* ${modalidad}` : null,
    d.enlaceReunion ? `· *Enlace de la videollamada:* ${d.enlaceReunion}` : null,
    '',
    '*Tu responsabilidad en este acompañamiento:*',
    '1. Tú das el primer paso: ponte en contacto con ella por WhatsApp unos *15 minutos antes* de la cita para coordinar el inicio de la sesión en la fecha y hora acordadas. Ella ya sabe que la vas a contactar.',
    '2. Compromiso y puntualidad: la persona te está esperando. Si te surge un imprevisto de fuerza mayor, avísanos de inmediato por aquí para no dejarla esperando y poder reagendar a tiempo.',
    '',
    'Puedes consultar la información del caso en tu enlace seguro:',
    d.enlace,
    '',
    'Al terminar la sesión, entra a ese mismo enlace para dejarnos tu reporte de seguimiento.',
    '',
    '¡Muchas gracias por tu compromiso y tiempo!',
  ]
    .filter((l) => l !== null)
    .join('\n')
}

/**
 * CONFIRMACIÓN · A la persona: recibimos tu consentimiento informado firmado.
 *
 * Se le confirma que todo está listo para su sesión y que el profesional la contactará
 * unos 15 minutos antes de la hora pactada.
 */
export function mensajeDeConsentimientoFirmadoALaPersona(d: {
  persona: string
  profesional: string
  cuando: string
  modalidad?: string | null
}): string {
  const nombrePers = nombreDePila(d.persona) || 'hola'
  const nombreProf = nombreDePila(d.profesional) || 'el profesional'
  const modalidad = d.modalidad ? MODALIDAD_LARGA[d.modalidad] ?? d.modalidad.toLowerCase() : null

  return [
    `Hola ${nombrePers}, confirmamos que recibimos tu consentimiento informado firmado.`,
    '',
    'Todo está listo para tu acompañamiento:',
    `· *Con:* ${d.profesional}`,
    `· *Cuándo:* ${d.cuando}`,
    modalidad ? `· *Modalidad:* ${modalidad}` : null,
    '',
    `${nombreProf} se pondrá en contacto contigo unos *15 minutos antes* de la hora acordada para iniciar la sesión. No tienes que hacer nada más.`,
    '',
    'Si te surge alguna duda o necesitas mover el horario, escríbenos por aquí con tiempo.',
  ]
    .filter((l) => l !== null)
    .join('\n')
}

/**
 * RETROALIMENTACIÓN POST-SESIÓN · A la persona acompañada.
 *
 * Se le pide retroalimentación sobre cómo se sintió en la sesión y si desea
 * continuar con el profesional.
 */
export function mensajeDePedirFeedbackALaPersona(d: {
  persona: string
  profesional?: string | null
  enlace: string
}): string {
  const nombrePers = nombreDePila(d.persona) || 'hola'
  const nombreProf = d.profesional ? nombreDePila(d.profesional) : 'el profesional'

  return [
    `Hola ${nombrePers}, te escribimos de Red Aquí Estamos.`,
    '',
    `Esperamos que tu espacio con ${nombreProf} haya sido útil y seguro para ti.`,
    '',
    'Nos gustaría conocer brevemente cómo te fue (son *2 preguntas cortas*, toma menos de 1 minuto):',
    d.enlace,
    '',
    'Lo que respondas es *completamente confidencial* y solo lo lee el equipo de coordinación de la red, no quien te acompañó.',
    '',
    '¡Muchas gracias por tu tiempo y confianza!',
  ].join('\n')
}

/**
 * CONTACTO CON LÍDER COMUNITARIO · Coordinación territorial.
 *
 * Mensaje cálido, empático y profesional para establecer articulación con el
 * líder comunitario y su comunidad.
 */
export function mensajeWhatsAppLider(d: {
  nombre: string
  territorio: string
  necesidades?: string[]
}): string {
  const nombre = nombreDePila(d.nombre) || d.nombre.trim()
  const territorio = d.territorio.trim()
  const listaNecesidades =
    d.necesidades && d.necesidades.length > 0
      ? `\n\n📌 *Enfoque prioritario identificado:* ${d.necesidades.slice(0, 3).join(', ')}.`
      : ''

  return [
    `¡Hola, ${nombre}! Te saludamos con mucho aprecio desde la coordinación de la *Red Aquí Estamos* (red de apoyo psicosocial y atención en crisis).`,
    '',
    `Nos comunicamos contigo reconociendo tu valioso liderazgo en *${territorio}* y queremos articularnos para apoyar a las familias de tu comunidad.${listaNecesidades}`,
    '',
    '🤝 *¿Cómo podemos colaborar?*',
    '• Acompañamiento emocional y primeros auxilios psicológicos para las familias.',
    '• Orientación y articulación para la atención de necesidades prioritarias.',
    '',
    '¿Cómo se encuentran tú y tu comunidad en este momento? ¿En qué momento te quedaría bien que conversemos unos minutos para coordinar el apoyo?',
    '',
    '¡Un abrazo solidario y muchas gracias por tu entrega comunitaria!',
  ].join('\n')
}

/**
 * Recordatorio previo de cita al profesional (60 minutos o menos antes de la sesión).
 */
export function mensajeRecordatorioPrevioCitaProfesional(d: {
  profesional: string
  cuando: string
  modalidad?: string | null
  enlaceCaso?: string | null
  enlaceReunion?: string | null
}): string {
  const nombre = nombreDePila(d.profesional) || d.profesional.trim()
  const modalidad = d.modalidad ? ` en modalidad *${d.modalidad.toLowerCase()}*` : ''

  return [
    `¡Hola ${nombre}! Te saludamos desde la coordinación de la Red Aquí Estamos.`,
    '',
    `Te recordamos que tienes una sesión de acompañamiento psicológico programada para dentro de poco: *${d.cuando}*${modalidad}.`,
    d.enlaceReunion ? `\n· *Enlace de videollamada:* ${d.enlaceReunion}` : '',
    '',
    '*Tu responsabilidad en este acompañamiento:*',
    '1. Tú das el primer paso: ponte en contacto con ella por WhatsApp unos *15 minutos antes* de la cita para coordinar el inicio de la sesión en la fecha y hora acordadas. Ella ya sabe que la vas a contactar.',
    '2. Compromiso y puntualidad: la persona te está esperando. Si te surge un imprevisto de fuerza mayor, avísanos de inmediato por aquí para no dejarla esperando y poder reagendar a tiempo.',
    d.enlaceCaso
      ? `\nLos datos de contacto y la información del caso están en tu enlace seguro:\n${d.enlaceCaso}\n\nAl terminar la sesión, entra a ese mismo enlace para registrar el reporte de cierre (si se realizó, cómo fue y si necesita más sesiones).\n\nPor favor *respóndenos a este mensaje confirmando que lo recibiste y lo tienes agendado*.`
      : '',
    '',
    '¡Muchísimas gracias por tu tiempo, calidez y compromiso solidario!',
  ].filter(Boolean).join('\n')
}

/**
 * Recordatorio previo de cita a la persona acompañada (el día de la sesión o < 60 min antes).
 */
export function mensajeRecordatorioPrevioCitaPersona(d: {
  persona: string
  profesional: string
  cuando: string
  modalidad?: string | null
  enlaceReunion?: string | null
}): string {
  const nombre = nombreDePila(d.persona) || d.persona.trim()
  const modalidad = d.modalidad ? ` en modalidad *${d.modalidad.toLowerCase()}*` : ''

  return [
    `¡Hola ${nombre}! Te saludamos de la Red Aquí Estamos.`,
    '',
    `Te recordamos que tienes tu sesión de acompañamiento con ${d.profesional} programada para dentro de poco: *${d.cuando}*${modalidad}.`,
    d.enlaceReunion
      ? `\n· *Enlace de videollamada:* ${d.enlaceReunion}\n\nA la hora acordada, solo debes hacer clic en el enlace de videollamada desde tu celular o computador para unirte a la sesión con ${nombreDePila(d.profesional)}. No tienes que descargar nada ni registrarte.`
      : '',
    '',
    `${nombreDePila(d.profesional)} se pondrá en contacto contigo por WhatsApp unos *15 minutos antes* de la hora para coordinar el inicio.`,
    '',
    `Si te surge un imprevisto y no puedes asistir, por favor escríbenos por aquí con tiempo para avisarle a ${nombreDePila(d.profesional)} y reprogramar tu espacio.`,
    '',
    '¡Un abrazo y que tengas una muy buena sesión!',
  ].filter(Boolean).join('\n')
}





