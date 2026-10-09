import { site } from '../../site'
import {
  AVISO_DERECHOS,
  AVISO_TRATAMIENTO,
  CASILLAS,
  CONSENTIMIENTO_SESION,
} from '../../consentimiento'
import { ERROR_TELEFONO, PISTA_TELEFONO } from '../../telefono'

/**
 * EL SITIO PÚBLICO, EN ESPAÑOL.
 *
 * Este archivo es el original: cada frase es la que el sitio ya decía antes de
 * que existieran los otros idiomas, sacada de las páginas sin cambiarle una
 * coma. `en.ts` y `pt.ts` son traducciones de este, y el compilador las obliga
 * a tener exactamente las mismas claves (`Diccionario = typeof es`): una frase
 * que se añada aquí y no allá no compila.
 *
 * Formato dentro de las frases — lo interpreta `TextoRico`:
 *   **negrita**   [texto](/ruta)   `código`   {variable}
 *
 * Los enlaces internos se escriben SIN prefijo de idioma (`/recursos`, no
 * `/en/recursos`): el prefijo lo pone quien pinta la frase.
 *
 * Tres clases de texto NO se editan aquí porque tienen dueño en otro sitio, y
 * este archivo solo los señala:
 *   · las casillas de autorización y el consentimiento → `lib/consentimiento.ts`
 *     (cada versión publicada es prueba de qué aceptó cada persona);
 *   · la pista y el error del teléfono → `lib/telefono.ts`;
 *   · el nombre, el lema y la descripción → `lib/site.ts`.
 */

/** Ensancha a `string` lo que viene de un `as const`, para que se pueda traducir. */
const s = (valor: string): string => valor

export const es = {
  sitio: {
    nombre: s(site.name),
    lema: s(site.tagline),
    descripcion: s(site.description),
    /** `aria-label` del logo de la barra. */
    irAlInicio: '{nombre} — inicio',
  },

  idioma: {
    /** Para el lector de pantalla, sobre el selector. */
    etiqueta: 'Idioma',
    /**
     * La franja que se le ofrece a quien llega con el navegador en este
     * idioma a una página en otro. Va dicha EN este idioma: es a esa persona
     * a quien le habla.
     */
    sugerencia: 'Este sitio también está en español.',
    ver: 'Ver en español',
    cerrar: 'Cerrar este aviso',
  },

  nav: {
    principal: 'Navegación principal',
    movil: 'Navegación móvil',
    tituloMenu: 'Menú de navegación',
    abrir: 'Abrir menú',
    cerrar: 'Cerrar menú',
    enlaces: {
      serParte: {
        etiqueta: 'Quiero dar apoyo psicológico',
        aclaracion: '(Graduados o estudiantes de últimos semestres)',
      },
      apoyar: {
        etiqueta: 'Quiero ser voluntario general',
        aclaracion: '(Abogados, administrativos, logística, diseño, etc.)',
      },
      ayuda: {
        etiqueta: 'Necesito ayuda',
        aclaracion: '(Solicitar apoyo emocional y atención psicológica)',
      },
      recursos: { etiqueta: 'Recursos', aclaracion: '' },
    },
  },

  pie: {
    presentacion:
      'Somos una red colaborativa que busca facilitar el acceso a la atención psicológica y promover el bienestar emocional a través de la comunidad, la información y el acompañamiento.',
    enlaces: 'Enlaces del pie de página',
    preguntas: 'Preguntas frecuentes',
    politica: 'Política de datos',
    consentimiento: 'Consentimiento informado',
    cierre: 'Acompañar es una forma de reconstruir nuestro país.',
  },

  flotante: {
    grupo: 'Acciones rápidas de contacto y ayuda',
    preguntas: 'Preguntas frecuentes',
    preguntasAyuda: 'Ver preguntas frecuentes',
    whatsapp: 'WhatsApp',
    whatsappAyuda: 'Escribir a WhatsApp oficial',
  },

  migas: {
    inicio: 'Inicio',
    ruta: 'Ruta de navegación',
  },

  noEncontrada: {
    titulo: 'No encontramos esta página',
    texto:
      'Puede que el enlace haya cambiado. Desde el inicio puedes llegar a todo lo que tenemos disponible.',
    inicio: 'Volver al inicio',
    recursos: 'Ver los recursos',
  },

  /**
   * Avisos que SOLO llevan las traducciones. En español van vacíos a propósito
   * y no se pintan: aquí no hay nada que avisar.
   */
  avisos: {
    /** En las páginas legales: cuál es el texto que vale. */
    traduccion: '',
    /** El enlace a ese texto, que es este: el español. */
    verOriginal: '',
    /** Junto a las líneas de emergencia, que son colombianas. */
    fueraDeColombia: '',
    /** Sobre el formulario de pedir ayuda: en qué idioma se acompaña. */
    atencionEnEspanol: '',
    /** Sobre los formularios de voluntariado: en qué idioma se trabaja. */
    redEnEspanol: '',
  },

  inicio: {
    heroAlt: 'Ilustración de la red Aquí Estamos',
    titulo: 'Red de acompañamiento psicológico y atención en crisis',
    duracion:
      'Brindará acompañamiento y atención durante los próximos **3 a 4 meses**, aportando así a la reconstrucción del tejido social.',
    etapa:
      'Durante esta primera etapa, estamos construyendo una comunidad colaborativa de profesionales comprometidos con el cuidado emocional, la prevención y la atención en situaciones de crisis.',
    accesos: '¿Cómo podemos ayudarte?',
    tarjetas: {
      serParte: {
        titulo: 'Quiero dar apoyo psicológico',
        texto:
          'Para graduados o estudiantes de últimos semestres de psicología que quieran acompañar.',
      },
      apoyar: {
        titulo: 'Quiero ser voluntario general',
        texto:
          'Abogados, administrativos, logística, diseño y más: súmate desde lo que sabes hacer.',
      },
      ayuda: {
        titulo: 'Necesito ayuda',
        texto: 'Solicita apoyo emocional y atención psicológica: te acompañamos.',
      },
      recursos: {
        titulo: 'Recursos para todos',
        texto: 'Guías, libros y herramientas para situaciones que requieren apoyo.',
      },
    },
    sobreAlt: 'Manos que se acompañan',
    sobreTitulo: 'Sobre Aquí Estamos',
    sobreTexto:
      'Somos una red colaborativa que busca facilitar el acceso a la atención psicológica y promover el bienestar emocional a través de la comunidad, la información y el acompañamiento.',
    contacto: 'Contáctanos',
    noEstasSola: 'No estás sola/o.',
    estamosAqui: 'Estamos aquí para acompañarte.',
    whatsappTitulo: 'Escríbenos por WhatsApp',
    whatsappBoton: 'Enviar mensaje a Whatsapp',
    instagramTitulo: 'Síguenos en Instagram',
    instagramBoton: 'Síguenos',
    cierreAlt: 'Ilustración de comunidad',
    cierre: 'Acompañar es una forma de reconstruir nuestro país',
  },

  /**
   * «Cuando una emergencia termina…»: lo que era `contacto.png`.
   *
   * El texto es el de la infografía, literal. Estaba dibujado dentro de una
   * imagen de 1024×1536: en un teléfono no se leía, no se podía traducir, un
   * lector de pantalla solo oía una línea de `alt` y Google no indexaba nada.
   */
  emergencia: {
    nombre: 'Por qué existe la red',
    tituloInicio: 'Cuando una emergencia termina,',
    tituloFin: 'muchas cosas apenas comienzan.',
    familias: {
      titulo: 'Hay familias tratando de volver a organizar su vida.',
      texto: 'Hay miedo, incertidumbre, pérdidas y muchas preguntas.',
    },
    espacio: {
      titulo:
        'En estos momentos, tener un espacio para hablar, ser escuchado y encontrar orientación puede hacer una diferencia.',
      porEso: 'Por eso estamos creando una',
      red: 'Red de **Acompañamiento Psicológico** y **Atención en Crisis.**',
    },
    temporal: {
      texto:
        'Una red temporal de profesionales, estudiantes y aliados que quieran aportar a la respuesta psicológica frente a la emergencia del **10 de agosto de 2026 en Colombia.**',
      vigencia: 'La red tendrá una **vigencia inicial de cuatro meses.**',
    },
    personas: {
      texto:
        'Estamos buscando personas que quieran poner su conocimiento, su tiempo y su escucha al servicio de quienes hoy lo necesitan.',
      paraTi:
        'Si eres psicólogo/a o estudiante de Psicología, **este espacio también es para ti.**',
    },
    cierre: 'Acompañar es una forma de reconstruir nuestro país.',
  },

  /**
   * «¿Cómo puedes hacer parte?»: lo que era `ser-parte-body.png`.
   *
   * Dos cosas cambian respecto a la imagen, y las dos eran errores de la
   * imagen: decía «te compartimos el formulario» estando el formulario en esta
   * misma página, y llevaba dibujado un número de WhatsApp que ya no es el de
   * la red. El número sale ahora de `lib/site.ts`, como en el resto del sitio.
   */
  camino: {
    titulo: '¿Cómo puedes hacer parte de Aquí Estamos?',
    bajada:
      'Si eres profesional de la salud mental y quieres sumarte a nuestra red para acompañar a más personas, este es el camino.',
    misionTitulo: 'Nuestra misión',
    mision:
      'Conectar personas con profesionales de la salud mental y acercar recursos confiables, para el cuidado emocional, la prevención y la atención en crisis.',
    pasosTitulo: 'Pasos para hacer parte de la red',
    pasos: [
      {
        titulo: 'Diligencia el formulario',
        texto:
          'Completa el formulario de inscripción con tu información profesional, áreas de atención y datos de contacto.',
      },
      {
        titulo: 'Revisión de información',
        texto:
          'Revisamos tu perfil para asegurarnos de que tu enfoque se alinea con los valores y objetivos de la red.',
      },
      {
        titulo: 'Confirmación',
        texto:
          'Te escribiremos para confirmar tu participación y compartirte los detalles de los siguientes pasos.',
      },
      {
        titulo: 'Bienvenida e integración',
        texto:
          'Recibirás acceso a nuestros canales de comunicación, recursos y materiales de la red.',
      },
      {
        titulo: 'Acompañamos juntxs',
        texto:
          'Haces parte de una comunidad colaborativa que busca generar bienestar y prevención.',
      },
    ],
    beneficiosTitulo: 'Al hacer parte de Aquí Estamos, podrás:',
    beneficios: [
      'Hacer parte de una red ética y colaborativa de profesionales.',
      'Acceder y compartir recursos confiables para el cuidado emocional.',
      'Participar en espacios de difusión, aprendizaje y actualización.',
      'Aportar a la prevención y al bienestar de más personas.',
    ],
    listaTitulo: '¿Lista/o para hacer parte de la red?',
    listaTexto: 'El formulario está en esta misma página. Y si tienes dudas, escríbenos.',
    irAlFormulario: 'Ir al formulario',
    whatsapp: 'Escríbenos por WhatsApp',
    instagram: 'Síguenos en Instagram',
    cierre:
      'Aquí Estamos es un espacio seguro, humano y sensible al contexto de cada persona. Gracias por sumar tu conocimiento, tu tiempo y tu corazón.',
  },

  preguntas: {
    ceja: 'Centro de orientación y respuestas',
    titulo: 'Preguntas frecuentes',
    intro:
      'Resolvemos tus dudas sobre cómo recibir atención, vincularte como profesional voluntario/a o apoyar en labores de la fundación.',
    buscar: 'Buscar una duda (ej. REPS, ReTHUS, costo, sesiones, certificado...)',
    limpiar: 'Limpiar',
    resultadosPara: 'Resultados de búsqueda para',
    coincidencia: 'coincidencia',
    coincidencias: 'coincidencias',
    sinResultados: 'No encontramos preguntas relacionadas con',
    verTodas: 'Ver todas las preguntas',
    dudaTitulo: '¿Tienes alguna duda adicional sobre el modelo o la red?',
    dudaTexto: 'Nuestro equipo de coordinación está disponible para orientarte directamente.',
    dudaBoton: 'Escribir por WhatsApp',
    categorias: {
      psicologia: {
        etiqueta: 'Profesionales de Psicología',
        aclaracion: 'ReTHUS, acompañamiento y marco ético',
      },
      pacientes: {
        etiqueta: 'Personas y Familias',
        aclaracion: 'Solicitud de apoyo, gratuidad y sesiones',
      },
      voluntarios: {
        etiqueta: 'Voluntariado General',
        aclaracion: 'Otras disciplinas y labores de apoyo',
      },
      fundacion: {
        etiqueta: 'Sobre la Fundación',
        aclaracion: 'Misión, datos y marco legal',
      },
    },
    /**
     * Cada respuesta es una lista de bloques: una cadena es un párrafo, y
     * `{ lista: [...] }` son viñetas. El orden y a qué categoría pertenece
     * cada pregunta están en `SeccionPreguntasFrecuentes`, no aquí.
     */
    items: {
      'psi-reps-rethus': {
        distintivo: 'Marco Legal ReTHUS',
        pregunta:
          '¿Necesito tener REPS como profesional independiente para hacer parte de la red?',
        respuesta: [
          '**No necesitas tener REPS como profesional independiente** para hacer parte del modelo de acompañamiento de Aquí Estamos.',
          'Tu **ReTHUS** (Registro Único Nacional del Talento Humano en Salud) y tu **tarjeta profesional vigente** son los requisitos profesionales oficiales que verificamos para tu vinculación.',
          'El REPS corresponde al prestador institucional y, en nuestro modelo, estamos estructurando la **Fundación Aquí Estamos** como la persona jurídica que organiza, gestiona y respalda el acompañamiento. Mientras consolidamos el modelo de habilitación institucional correspondiente, tu participación se encuentra enmarcada en el alcance propio del **acompañamiento psicológico, primeros auxilios emocionales y contención en crisis** de Aquí Estamos, y no en la prestación independiente de consultas o tratamientos clínicos aislados.',
        ],
      },
      'psi-registro-confidencialidad': {
        distintivo: '',
        pregunta:
          '¿Cómo se maneja el registro de las sesiones y la confidencialidad de la información?',
        respuesta: [
          'Todo el proceso se rige bajo estrictos principios de **secreto profesional** y la **Ley 1581 de 2012 (Habeas Data)**.',
          'Como profesional, accedes al caso asignado a través de un **enlace seguro con autenticación** donde únicamente se visualizan los datos necesarios para brindar la atención. Al finalizar cada sesión, registras una bitácora breve sobre el estado del proceso en la plataforma interna. Nunca compartimos números de teléfono ni datos sensibles en canales abiertos.',
        ],
      },
      'psi-disponibilidad-horarios': {
        distintivo: '',
        pregunta: '¿Cuánto tiempo debo dedicar y cómo se coordina mi disponibilidad?',
        respuesta: [
          'El voluntariado es flexible y se adapta a tu agenda. Al postularte en [Quiero dar apoyo psicológico](/quiero-ser-parte), tú decides cuántas horas semanales puedes aportar y en qué días y franjas horarias (mañanas, tardes o noches).',
          'Nuestro sistema solo te propone personas que coincidan exactamente con tus horarios declarados. Las sesiones duran **45 minutos** y la plataforma programa intervalos automáticos de descanso entre citas para cuidar tu bienestar.',
        ],
      },
      'psi-alcance-casos': {
        distintivo: '',
        pregunta: '¿Qué tipo de casos atiende la Red Aquí Estamos?',
        respuesta: [
          'Nos enfocamos en **primeros auxilios psicológicos, contención emocional y acompañamiento psicosocial breve** (ciclos de 3 a 4 sesiones).',
          'No atendemos urgencias psiquiátricas con riesgo vital inminente ni psicopatologías severas que requieran hospitalización. En caso de detectarse un riesgo alto durante el tamizaje o la sesión, se activa de inmediato la **ruta de remisión institucional** hacia centros de salud y líneas nacionales de emergencia.',
        ],
      },
      'pac-gratuidad': {
        distintivo: '100% Gratuito',
        pregunta: '¿El servicio de atención y acompañamiento psicológico tiene algún costo?',
        respuesta: [
          '**No, es completamente gratuito.** La Red Aquí Estamos es una iniciativa solidaria sin ánimo de lucro creada para garantizar que cualquier persona que necesite apoyo emocional pueda recibirlo sin barreras económicas.',
        ],
      },
      'pac-como-solicitar': {
        distintivo: '',
        pregunta: '¿Cómo solicito una sesión de acompañamiento psicológico?',
        respuesta: [
          'Solo debes ingresar a [Necesito ayuda](/atencion-psicologica) y diligenciar un formulario breve con tus datos de contacto y tus horarios disponibles.',
          'Un coordinador de nuestro equipo revisará tu solicitud y te contactará por **WhatsApp o correo electrónico** para confirmar la fecha y hora de tu primera sesión con un psicólogo/a voluntario/a.',
        ],
      },
      'pac-cuantas-sesiones': {
        distintivo: '',
        pregunta: '¿Cuántas sesiones de apoyo voy a recibir?',
        respuesta: [
          'El programa contempla un ciclo de **3 a 4 sesiones de acompañamiento focalizado** con el mismo profesional.',
          'Al concluir este proceso, si tú y el profesional consideran que requieres un tratamiento continuo o especializado a largo plazo, te brindamos orientación sobre redes de salud y servicios complementarios.',
        ],
      },
      'pac-modalidad': {
        distintivo: '',
        pregunta: '¿La atención es virtual o presencial?',
        respuesta: [
          'La gran mayoría de las atenciones se realizan de manera **virtual (por videollamada o llamada telefónica)**, permitiendo brindar apoyo a personas en cualquier municipio de Colombia o en el exterior.',
          'En caso de realizarse jornadas o brigadas comunitarias presenciales en puntos específicos, se informará oportunamente en nuestros canales oficiales.',
        ],
      },
      'pac-emergencias-graves': {
        distintivo: 'Atención de Emergencias',
        pregunta: '¿Qué debo hacer en caso de una emergencia vital o crisis inmediata?',
        respuesta: [
          'Si tú o una persona cercana se encuentra en riesgo inminente, con ideación suicida activa o peligro para su integridad física, **debes acudir de inmediato al centro de salud o urgencias más cercano** o comunicarte con las líneas gratuitas de emergencia nacional:',
          {
            lista: [
              '**Línea Nacional de Emergencias:** 123',
              '**Línea de Orientación en Salud Mental (Minsalud):** 106 / 192',
              '**Línea Púrpura (Mujeres en Bogotá):** 018000 112 137',
            ],
          },
        ],
      },
      'vol-quienes-pueden': {
        distintivo: '',
        pregunta: 'No soy psicólogo/a, ¿cómo puedo sumarme como voluntario/a?',
        respuesta: [
          '¡Tu talento es fundamental para la red! En nuestro programa [Quiero apoyar (Voluntariado General)](/quiero-apoyar) recibimos a profesionales y estudiantes de **derecho, medicina, enfermería, trabajo social, diseño gráfico, comunicaciones, ingeniería de sistemas, administración, logística y gestión comunitaria**.',
          'Apoyamos en labores internas de verificación de perfiles, gestión de agendas, creación de piezas pedagógicas, llamadas de seguimiento y soporte organizativo.',
        ],
      },
      'vol-como-asignan-tareas': {
        distintivo: '',
        pregunta: '¿Cómo me asignan las labores o turnos de apoyo?',
        respuesta: [
          'Cuando el equipo de coordinación genera una tarea que coincide con tu disponibilidad horaria y disciplina, te llegará una invitación personalizada a tu correo o WhatsApp con un enlace único (`/turno/...`).',
          'Al abrir el enlace podrás ver los detalles de la labor, fecha, horario y notas del equipo, y confirmar con un solo clic si aceptas participar.',
        ],
      },
      'vol-certificado': {
        distintivo: '',
        pregunta: '¿Entregan certificado de horas de voluntariado?',
        respuesta: [
          '**No.** La Red Aquí Estamos es una iniciativa de apoyo solidario y comunitario que **no emite certificados de voluntariado ni constancias de horas** para fines académicos o laborales. La vinculación de todos los profesionales y colaboradores es 100% voluntaria, motivada por el compromiso social y el cuidado colectivo.',
        ],
      },
      'fun-que-es': {
        distintivo: '',
        pregunta: '¿Qué es la Red Aquí Estamos y cuál es su misión?',
        respuesta: [
          'Somos una red colaborativa sin ánimo de lucro que busca facilitar el acceso universal a la atención psicológica y promover el bienestar emocional a través de la comunidad, la información y el acompañamiento humano, aportando a la reconstrucción del tejido social.',
        ],
      },
      'fun-seguridad-datos': {
        distintivo: '',
        pregunta: '¿Cómo protegen mis datos personales y mi privacidad?',
        respuesta: [
          'Toda la información registrada se trata bajo estrictos estándares de seguridad informática y en total apego a la **Ley Estatutaria 1581 de 2012** de Protección de Datos Personales (Habeas Data).',
          'Puedes consultar nuestra política completa en [Política de datos](/politica-de-datos). Tus datos nunca son comercializados ni compartidos con terceros.',
        ],
      },
    },
  },

  atencion: {
    meta: {
      titulo: 'Necesito ayuda · Atención Psicológica',
      descripcion:
        'Solicita acompañamiento psicológico gratuito con profesionales voluntarios de la Red Aquí Estamos.',
    },
    titulo: 'Necesito ayuda',
    bajada: 'Acompañamiento psicológico y apoyo emocional',
    aviso:
      '**Estamos contigo.** Este formulario toma menos de 2 minutos y casi todas las preguntas se responden con un solo toque. Tus respuestas son estrictamente confidenciales y nos permiten conectarte con un profesional voluntario de acuerdo a tu urgencia.',
    whatsapp: 'Prefiero escribir directamente por WhatsApp {numero}',
  },

  serParte: {
    meta: {
      titulo: 'Quiero dar apoyo psicológico',
      descripcion:
        'Haz parte de nuestra red de profesionales y construyamos más posibilidades de acompañamiento.',
    },
    titulo: 'Quiero dar apoyo psicológico',
    bajada:
      'Haz parte de nuestra red de profesionales y construyamos más posibilidades de acompañamiento.',
    aviso: [
      'Estamos conformando una red de profesionales de psicología interesados en brindar acompañamiento psicológico y primeros auxilios psicológicos a familias afectadas por situaciones de emergencia y crisis durante los próximos cuatro meses.',
      'La información registrada será utilizada para identificar perfiles, experiencia y población de enfoque de los profesionales disponibles para participar en esta iniciativa.',
      'Gracias por poner tu conocimiento y experiencia al servicio de quienes hoy necesitan acompañamiento.',
    ],
    whatsapp: 'Enviar mensaje a Whatsapp',
    formulario: 'Diligencia el formulario',
    /** `{asterisco}` se pinta como el asterisco rojo de los campos. */
    obligatorios: 'Los campos marcados con {asterisco} son obligatorios.',
  },

  apoyar: {
    meta: {
      titulo: 'Quiero ser voluntario general · Red Aquí Estamos',
      descripcion:
        'Súmate al voluntariado de la red desde tu disciplina: salud, logística, derecho, comunicación, tecnología, gestión y más.',
    },
    titulo: 'Quiero ser voluntario general',
    bajada:
      'Una emergencia no se atiende solo desde la psicología. Súmate desde lo que sabes hacer.',
    aviso:
      '**Directorio de Voluntariado Multidisciplinario.** Si quieres aportar desde salud y primeros auxilios, logística, derecho, trabajo social, comunicación, tecnología o gestión de proyectos, déjanos tus datos. Cuando surja una brigada o necesidad concreta, el equipo de coordinación te contactará. Registrarte toma 2 minutos y no te compromete a nada.',
    whatsapp: '¿Tienes dudas? Escríbenos al WhatsApp {numero}',
  },

  recursos: {
    meta: {
      titulo: 'Recursos para todos',
      descripcion: 'Guías, libros y herramientas para situaciones que requieren apoyo.',
    },
    titulo: 'Recursos para todos',
    bajada: 'Guías, libros y herramientas para situaciones que requieren apoyo.',
    seccion: 'Cuentos infantiles',
    noDisponible:
      'La biblioteca no está disponible en este momento. Vuelve a intentarlo en unos minutos.',
    profesionales: 'Material para profesionales',
    proximamente: 'Próximamente.',
    compartir: 'Si tienes algún otro recurso que desees compartir puedes contactarnos.',
    noEncontrado: 'Recurso no encontrado',
    categoria: 'Categoría',
    archivos: 'Archivos y multimedia',
    abrir: 'Abrir el material',
    volver: 'Volver a la biblioteca',
    vistaPrevia: 'Vista previa de {titulo}',
    sinVisor: 'Tu navegador no puede mostrar el PDF aquí.',
    abrirPestana: 'Ábrelo en una pestaña nueva',
    /**
     * Solo en las traducciones: los libros son de sus autores y están en
     * español. Vacío aquí, donde no hay nada que aclarar.
     */
    soloEnEspanol: '',
    notaIdioma: '',
    /**
     * Los títulos y las descripciones viven en la base de datos, en español.
     * Las traducciones los sobrescriben por `slug`; lo que no esté aquí sale
     * tal como viene de la base. En español no hace falta nada.
     */
    categorias: {} as Record<string, string>,
    libros: {} as Record<string, { titulo: string; descripcion: string }>,
  },

  politica: {
    meta: {
      titulo: 'Política de Tratamiento de Datos',
      descripcion:
        'Cómo Red Aquí Estamos recoge, usa, guarda y elimina los datos personales de quienes solicitan acompañamiento y de los profesionales voluntarios.',
    },
    version: 'Versión {version}',
    titulo: 'Política de Tratamiento de Datos',
    intro:
      'Esta política explica qué datos recogemos, para qué los usamos, con quién los compartimos, cuánto tiempo los guardamos y cómo puedes pedirnos que los cambiemos o los borremos.',
    /**
     * Cada sección es un título y sus bloques: una cadena es un párrafo,
     * `{ lista }` son viñetas y `{ aviso }` es el recuadro destacado.
     * Variables: {responsable} {canal} {canalHref} {anos}.
     */
    secciones: [
      {
        titulo: '1. Quién responde por tus datos',
        bloques: [
          '**{responsable}** es responsable del tratamiento de los datos personales que recogemos a través de este sitio.',
          'Puedes contactarnos por [{canal}]({canalHref}). Ese es también el canal para ejercer cualquiera de los derechos que se describen más abajo.',
        ],
      },
      {
        titulo: '2. Qué datos recogemos',
        bloques: [
          '**Si solicitas acompañamiento:** tu nombre, tu celular, tu correo si decides dárnoslo, la ciudad desde donde nos escribes, los días y las franjas en que puedes, si prefieres presencial o virtual, y lo que quieras contarnos en el campo libre. Si la solicitud es para otra persona, también su nombre, tu relación con ella y si es menor de edad.',
          '**Si te postulas como profesional:** tu nombre, tu celular, tu correo, tu ciudad, tu profesión y formación, tus años de experiencia, tu tarjeta profesional, las poblaciones con las que trabajas, tu disponibilidad y, si puedes acompañar de forma presencial, tu estado de vacunación contra la fiebre amarilla.',
          {
            aviso:
              '**Datos sensibles.** El hecho de solicitar acompañamiento psicológico y el estado de vacunación son datos de salud, que la ley considera sensibles. No estás obligado ni obligada a entregarlos. Solo los tratamos si nos das una autorización expresa y separada, marcando la casilla correspondiente en el formulario.',
          },
        ],
      },
      {
        titulo: '3. Para qué los usamos',
        bloques: [
          {
            lista: [
              'Contactarte y coordinar tu acompañamiento, o evaluar tu postulación.',
              'Asignar un profesional y agendar las sesiones.',
              'Llevar el registro interno de la red y sus estadísticas de operación.',
              'Enviarte información sobre otras actividades, solo si lo autorizaste aparte.',
            ],
          },
          'No usamos tus datos para ninguna otra finalidad, y no tomamos decisiones automatizadas sobre ti.',
        ],
      },
      {
        titulo: '4. Con quién los compartimos',
        bloques: [
          'Con el profesional de la red que te acompañe y con el equipo de coordinación, y solo en la medida necesaria para prestar el servicio. **No vendemos tus datos ni los entregamos a terceros** ajenos a la red, salvo que una autoridad competente nos lo exija por ley.',
          'La información se guarda en servidores de nuestros proveedores de infraestructura tecnológica, que la procesan únicamente por nuestra instrucción.',
        ],
      },
      {
        titulo: '5. Cuánto tiempo los guardamos',
        bloques: [
          'Conservamos tus datos durante **{anos} años** contados desde el cierre de tu acompañamiento o desde el fin de tu participación en la red. Cumplido ese plazo, se eliminan.',
        ],
      },
      {
        titulo: '6. Tus derechos',
        bloques: [
          'En cualquier momento puedes pedirnos:',
          {
            lista: [
              'Conocer qué datos tuyos tenemos y cómo los estamos usando.',
              'Actualizarlos o corregirlos si están mal o incompletos.',
              'Eliminarlos, cuando no exista un deber legal de conservarlos.',
              'Retirar la autorización que nos diste, en cualquier momento.',
              'Presentar una queja ante la Superintendencia de Industria y Comercio.',
            ],
          },
          'Para ejercer cualquiera de estos derechos escríbenos por [{canal}]({canalHref}). Responderemos en los plazos que establece la ley: hasta diez días hábiles para una consulta y hasta quince días hábiles para un reclamo.',
          'Retirar la autorización significa que no podremos seguir prestándote el acompañamiento, porque los datos son necesarios para coordinarlo.',
        ],
      },
      {
        titulo: '7. Niñas, niños y adolescentes',
        bloques: [
          'Cuando el acompañamiento es para una persona menor de 18 años, la autorización la debe dar su padre, su madre o su representante legal, y siempre se atiende al interés superior de la niña, el niño o el adolescente.',
        ],
      },
      {
        titulo: '8. Seguridad',
        bloques: [
          'Aplicamos medidas técnicas y organizativas razonables para proteger tus datos: el acceso al sistema interno es nominal y con contraseña, cada consulta a datos de salud queda registrada, y la información viaja cifrada.',
        ],
      },
      {
        titulo: '9. Cambios en esta política',
        bloques: [
          'Si cambiamos este texto, publicamos una versión nueva con su fecha. Las autorizaciones que ya nos diste quedan asociadas a la versión que aceptaste en su momento, y se conserva el registro de cuál fue.',
        ],
      },
    ],
    pendiente:
      '**Información pendiente.** El NIT de la organización está en trámite y todavía no hay una sede física ni un correo exclusivo para solicitudes de datos. En cuanto existan, se incorporan aquí y se publica una versión nueva.',
    volver: 'Volver al inicio',
  },

  consentimiento: {
    meta: {
      titulo: 'Consentimiento informado',
      descripcion:
        'Qué aceptas cuando agendas una sesión con la Red Aquí Estamos: en qué consiste el acompañamiento, hasta dónde llega la confidencialidad y qué hacemos con tus datos.',
    },
    version: 'Versión {version}',
    titulo: 'Consentimiento informado',
    intro:
      'Esto es lo que aceptas cuando agendas una sesión con la red. Lo verás otra vez al elegir tu hora, y ahí lo firmas escribiendo tu nombre. Si algo no te queda claro, pregúntanos antes: preferimos explicarlo.',
    /**
     * Los cinco puntos son los de `CONSENTIMIENTO_SESION`: el mismo texto que
     * se firma. No se copian aquí; se señalan. Una copia sería publicar una
     * versión que puede dejar de coincidir con la que la gente acepta.
     */
    puntos: CONSENTIMIENTO_SESION.puntos.map((p) => ({ titulo: s(p.titulo), texto: s(p.texto) })),
    riesgoTitulo: 'Si estás en riesgo ahora mismo',
    riesgoTexto:
      'Este acompañamiento no es un servicio de emergencias y no atiende crisis en el momento. Si tú o alguien más está en peligro, llama:',
    /** El nombre de cada línea, por su número. */
    lineas: {
      '123': 'Línea de emergencias',
      '106': 'Línea de salud mental',
    },
    dudasTitulo: 'Preguntas sobre este texto',
    dudasTexto:
      'Escríbenos por [{canal}]({canalHref}). Para lo que tiene que ver con tus datos —verlos, corregirlos, borrarlos o retirar tu autorización— está la [política de tratamiento de datos](/politica-de-datos), que es el documento que lo desarrolla en detalle.',
  },

  formularios: {
    /** Lo que comparten los tres formularios públicos. */
    comun: {
      pasoDe: 'Paso {paso} de 3',
      atras: 'Atrás',
      opcional: '(Opcional)',
      errorConexion:
        'No pudimos conectarnos con el servidor. Revisa tu conexión e intenta de nuevo.',
      /**
       * Solo en las traducciones: cuando el servidor rechaza un campo, su
       * explicación llega en español. Antes que enseñar una frase en un idioma
       * que quizá no se lee, se enseña esta. Vacío aquí: en español se enseña
       * la del servidor, que es más precisa.
       */
      errorCampo: '',
      errorServidor: '',
      telefono: {
        pista: s(PISTA_TELEFONO),
        error: s(ERROR_TELEFONO),
      },
      nombreSoloLetras: 'Cuéntanos tu nombre completo (solo letras)',
      municipio: {
        desplegar: 'Desplegar lista de municipios',
        coincidencias: 'Coincidencias para "{busqueda}" (o escribe libremente):',
        principales: 'Ciudades y municipios principales de Colombia:',
        noEsta: 'No encontramos “{busqueda}” en la lista, pero',
        seGuarda: 'se guardará tal como lo escribiste',
      },
      /**
       * Las autorizaciones. Son las de `lib/consentimiento.ts`, la versión que
       * queda registrada con cada envío; aquí solo se señalan.
       */
      casillas: {
        atencion: s(CASILLAS.atencion),
        datos: s(CASILLAS.datos),
        sensiblesProfesional: s(CASILLAS.sensiblesProfesional),
        representante: s(CASILLAS.representante),
        comunicaciones: s(CASILLAS.comunicaciones),
      },
      avisoTratamiento: {
        profesionales: s(AVISO_TRATAMIENTO.profesionales),
        apoyo: s(AVISO_TRATAMIENTO.apoyo),
      },
      avisoDerechos: s(AVISO_DERECHOS),
    },

    /** «Necesito ayuda»: la solicitud de acompañamiento. */
    atencion: {
      pasos: [
        '¿A quién acompañamos y contacto?',
        '¿Cómo te sientes hoy? (Evaluación breve)',
        'Modalidad y Confirmación',
      ],
      paraQuien: {
        etiqueta: 'El acompañamiento es…',
        opciones: { PARA_MI: 'Para mí', PARA_OTRA_PERSONA: 'Para otra persona' },
      },
      esMenor: {
        etiqueta: '¿Esa persona es menor de edad?',
        opciones: { NO: 'No, es mayor de edad', SI: 'Sí, es menor de 18 años' },
      },
      tuNombre: {
        etiqueta: '¿Cómo te llamas tú?',
        pista: 'Para saber con quién hablamos cuando llamemos.',
      },
      relacion: {
        etiqueta: '¿Cuál es tu relación con esa persona?',
        pista: 'Opcional. Por ejemplo: madre, hijo, pareja, amiga.',
      },
      nombre: '¿Cómo te llamas?',
      nombreOtra: '¿Cómo se llama esa persona?',
      celular: {
        etiqueta: 'Celular / WhatsApp',
        pista: 'Un número al que podamos escribirte o llamarte.',
      },
      correo: {
        etiqueta: 'Correo electrónico',
        pista: 'Opcional. El celular o WhatsApp es suficiente.',
      },
      canal: {
        etiqueta: '¿Por dónde prefieres que te contactemos?',
        opciones: {
          WHATSAPP: 'WhatsApp',
          LLAMADA: 'Llamada telefónica',
          CORREO: 'Correo electrónico',
        },
      },
      ciudad: {
        etiqueta: '¿Desde qué ciudad o municipio nos escribes?',
        ejemplo: 'Busca o escribe tu ciudad o municipio...',
        pista: 'Selecciona de la lista de Colombia o escríbelo si no aparece.',
      },
      siguiente1: 'Siguiente: ¿Cómo te sientes hoy?',
      intro2:
        '**4 preguntas breves de 1 solo toque.** Nos ayudan a entender tu situación actual y conectarte con el profesional más adecuado con la prioridad que necesitas.',
      malestar: {
        etiqueta: '1. Del 1 al 5, ¿qué tan difícil o abrumador sientes el día de hoy? *',
        niveles: [
          { etiqueta: '1 · Leve', detalle: 'Lo estoy sobrellevando' },
          { etiqueta: '2 · Manejable', detalle: 'Con algo de dificultad' },
          { etiqueta: '3 · Difícil', detalle: 'Me cuesta bastante' },
          { etiqueta: '4 · Muy difícil', detalle: 'Casi no puedo con el día' },
          { etiqueta: '5 · Extremo', detalle: 'Desbordado / En crisis' },
        ],
      },
      dano: {
        etiqueta:
          '2. En estos días, ¿has tenido pensamientos de hacerte daño o no querer seguir? *',
        no: 'No',
        si: 'Sí, he tenido esos pensamientos',
        contencionTitulo: 'Tu vida es muy valiosa. No estás solo/a.',
        contencionTexto:
          'Si sientes que estás en peligro inmediato o no puedes contener la angustia, puedes marcar gratis al **106** o **192** en Colombia (24 horas).',
      },
      urgencia: {
        etiqueta: '3. ¿Qué tan pronto sientes que necesitas hablar con un profesional? *',
        opciones: {
          HOY: 'Hoy mismo / Muy urgente',
          ESTA_SEMANA: 'En los próximos días / Esta semana',
          PUEDO_ESPERAR: 'Puedo esperar un poco más',
        },
      },
      seguro: {
        etiqueta:
          '4. ¿Estás en un lugar seguro y cuentas con lo básico (dormir, alimentación)? *',
        si: 'Sí, estoy seguro/a',
        no: 'No me siento seguro/a o me falta lo básico',
      },
      siguiente2: 'Siguiente: Modalidad y Confirmación',
      modalidad: {
        etiqueta: '¿Cómo prefieres recibir el acompañamiento?',
        opciones: {
          VIRTUAL: 'Virtual (por videollamada o llamada telefónica)',
          PRESENCIAL: 'Presencial (en consultorio o espacio acordado en tu municipio)',
          INDIFERENTE: 'Me es indiferente (puedo virtual o presencial)',
        },
      },
      mensaje: {
        etiqueta: '¿Quieres dejarnos algún mensaje o detalle adicional?',
        pista: 'Opcional. Puedes contarnos brevemente lo que consideres importante.',
      },
      datosTitulo: 'Tus datos y tu confidencialidad',
      datosTexto:
        'Solo los ve el profesional que te acompañe y el equipo que coordina. No los vendemos ni los damos a nadie más. [Cómo tratamos tus datos y cómo puedes borrarlos](/politica-de-datos).',
      enviar: 'Solicitar Acompañamiento Psicológico',
      enviando: 'Enviando solicitud…',
      errores: {
        forWhom: 'Selecciona para quién es el acompañamiento',
        isMinor: 'Cuéntanos si esa persona es menor de 18 años',
        contactName: 'Dinos tu nombre para saber con quién hablamos',
        name: 'Necesitamos un nombre de contacto',
        phone: 'Necesitamos un número de teléfono/WhatsApp',
        emailInvalido: 'Ese correo no parece válido',
        emailFalta: 'Si prefieres correo, necesitamos tu dirección',
        preferredContact: 'Selecciona por dónde prefieres que te contactemos',
        city: 'Selecciona o escribe desde qué ciudad o municipio nos escribes',
        distress: 'Selecciona del 1 al 5 cómo te sientes hoy',
        selfHarmThoughts: 'Por favor responde esta pregunta',
        howSoon: 'Indícanos qué tan pronto necesitas hablar con alguien',
        safePlace: 'Por favor indícanos si estás en un lugar seguro',
        preferredModality: 'Selecciona la modalidad de acompañamiento',
        dataConsent: 'Necesitamos tu autorización para poder contactarte',
        guardianConsent:
          'Como es para un menor de edad, necesitamos la autorización del representante legal',
        incompleto: 'Por favor completa los campos requeridos antes de enviar.',
        envio: 'No pudimos enviar tus datos. Intenta de nuevo.',
      },
      exito: {
        titulo: '¡Recibimos tu solicitud, {nombre}!',
        sinNombre: 'Amigo/a',
        /** `{telefono}` se pinta en negrita. */
        texto:
          'Estamos aquí contigo. Tu información ya fue recibida por nuestro equipo de coordinación y un profesional voluntario de la red se comunicará contigo vía WhatsApp o llamada a tu número {telefono} para acompañarte.',
        prioridadTitulo: 'Atención prioritaria y líneas de emergencia 24/7',
        prioridadTexto:
          'Si sientes que estás en peligro o necesitas hablar de inmediato con un especialista, puedes llamar gratis en Colombia a la **Línea 106** o **Línea 192** (24 horas).',
        volver: 'Volver al inicio',
      },
    },

    /** «Quiero dar apoyo psicológico»: la postulación del profesional. */
    profesional: {
      pestanas: ['Tus Datos', 'Perfil', 'Disponibilidad'],
      paso1: {
        titulo: 'Paso 1: ¿Quién eres y cómo te contactamos?',
        bajada: 'Información básica para comunicarnos contigo y coordinar tu participación.',
        nombre: { etiqueta: 'Nombre completo', ejemplo: 'Ej: Laura Sofía Morales' },
        celular: { etiqueta: 'Celular / WhatsApp', ejemplo: 'Ej: 315 789 4561' },
        correo: { etiqueta: 'Correo electrónico', ejemplo: 'correo@ejemplo.com' },
        ciudad: {
          etiqueta: '¿En qué ciudad o municipio vives?',
          ejemplo: 'Busca tu municipio en Colombia o escribe tu ciudad...',
        },
        continuar: 'Continuar al perfil profesional',
      },
      paso2: {
        titulo: 'Paso 2: Tu perfil profesional y experiencia',
        bajada:
          'Nos permite asignarte personas y comunidades afines a tu formación y enfoque.',
        profesion: {
          etiqueta: 'Profesión',
          /** La clave es el valor que se guarda, en español; no se traduce. */
          opciones: {
            Psicología: 'Psicología',
            Psiquiatría: 'Psiquiatría',
            'Trabajo Social': 'Trabajo Social',
            Otra: 'Otra profesión',
          },
        },
        anos: {
          etiqueta: 'Años de experiencia',
          opciones: {
            MENOS_DE_1: 'Menos de 1 año',
            ENTRE_1_Y_3: '1 a 3 años',
            ENTRE_3_Y_5: '3 a 5 años',
            MAS_DE_5: 'Más de 5 años',
          },
        },
        otraProfesion: {
          etiqueta: '¿Qué otra profesión?',
          ejemplo: 'Ej: Licenciatura en Pedagogía / Psicopedagogía',
        },
        tarjeta: {
          etiqueta: '¿Cuentas con tarjeta profesional?',
          opciones: { SI: 'Sí, la tengo', EN_TRAMITE: 'En trámite', ESTUDIANTE: 'Soy estudiante' },
        },
        poblaciones: {
          etiqueta: '¿Con qué poblaciones tienes experiencia?',
          pista: 'Toca para seleccionar todas las poblaciones que apliquen.',
          /** La clave es el valor que se guarda, en español; no se traduce. */
          opciones: {
            'Niños y niñas': 'Niños y niñas',
            Adolescentes: 'Adolescentes',
            Jóvenes: 'Jóvenes',
            Adultos: 'Adultos',
            'Personas mayores': 'Personas mayores',
            Familias: 'Familias',
            'Enfoque de género': 'Enfoque de género',
            'Población víctima de violencia': 'Población víctima de violencia',
            'Población desplazada/migrante': 'Población desplazada/migrante',
            Otra: 'Otra',
          },
        },
        otraPoblacion: '¿Con qué otra población trabajas?',
        crisis: {
          etiqueta:
            '¿Tienes experiencia o formación en atención en crisis / primeros auxilios psicológicos?',
          opciones: {
            SI: 'Sí, tengo formación y experiencia práctica',
            FORMACION_POCA_PRACTICA: 'Tengo formación teórica, con poca práctica',
            SIN_FORMACION_DISPONIBLE_APRENDER: 'No tengo formación previa, pero quiero aprender',
            NO: 'No cuento con experiencia en crisis',
          },
        },
        volver: 'Volver',
        continuar: 'Continuar a disponibilidad',
      },
      paso3: {
        titulo: 'Paso 3: Disponibilidad y Documentos',
        bajada:
          'Define cómo te gustaría participar y adjunta tus documentos de forma opcional.',
        modalidad: {
          etiqueta: '¿En qué modalidad puedes acompañar?',
          opciones: {
            VIRTUAL: { nombre: 'Virtual', detalle: 'Atención 100% online por videollamada' },
            PRESENCIAL: { nombre: 'Presencial', detalle: 'En territorio o centros comunitarios' },
            AMBAS: { nombre: 'Ambas', detalle: 'Disponible presencial y virtual' },
          },
        },
        desplazamiento: {
          etiqueta: '¿A qué municipios o zonas podrías desplazarte?',
          pista: 'Opcional.',
          ejemplo: 'Ej: Municipios aledaños / Zonas rurales cercanas',
        },
        fiebre: {
          etiqueta: '¿Estás vacunado o vacunada contra la fiebre amarilla?',
          pista: 'Exigido para acceso a ciertas zonas de emergencia.',
          opciones: {
            SI: 'Sí, ya tengo el carné de vacunación',
            CITA_AGENDADA: 'Todavía no, pero tengo cita agendada',
            NO: 'No estoy vacunado o vacunada',
          },
        },
        dias: {
          etiqueta: '¿Qué días tienes disponibilidad?',
          todos: 'Todos los días',
          ninguno: 'Desmarcar todos',
          opciones: {
            LUNES: { corto: 'Lun', nombre: 'Lunes' },
            MARTES: { corto: 'Mar', nombre: 'Martes' },
            MIERCOLES: { corto: 'Mié', nombre: 'Miércoles' },
            JUEVES: { corto: 'Jue', nombre: 'Jueves' },
            VIERNES: { corto: 'Vie', nombre: 'Viernes' },
            SABADO: { corto: 'Sáb', nombre: 'Sábado' },
            DOMINGO: { corto: 'Dom', nombre: 'Domingo' },
          },
        },
        franjas: {
          etiqueta: '¿En qué franjas del día?',
          opciones: {
            MANANA: { nombre: 'Mañana', horario: '8 a. m. – 12 m.' },
            TARDE: { nombre: 'Tarde', horario: '12 m. – 6 p. m.' },
            NOCHE: { nombre: 'Noche', horario: '6 – 9 p. m.' },
          },
        },
        horas: {
          etiqueta: '¿Cuántas horas a la semana podrías dedicar?',
          opciones: {
            ENTRE_1_Y_3: { nombre: '1 a 3 horas / semana', detalle: '1 o 2 sesiones' },
            ENTRE_4_Y_6: { nombre: '4 a 6 horas / semana', detalle: '3 o 4 sesiones' },
            MAS_DE_6: { nombre: 'Más de 6 horas / semana', detalle: '5 o más sesiones' },
            VARIABLE: { nombre: 'Variable', detalle: 'Depende de la semana' },
          },
        },
        documentos: {
          titulo: 'Adjuntar documentos de verificación (Opcional)',
          elegidos: '✓ Documentos seleccionados',
          despues: 'Puedes adjuntarlos ahora o enviarlos después por WhatsApp',
          confidencialidad:
            '🔒 **Confidencialidad:** Uso exclusivo del equipo de coordinación para validar tu identidad y tarjeta profesional conforme a la Ley 1581 de 2012.',
          porWhatsappTitulo: 'Envía tus documentos por WhatsApp',
          /** Variables: {numero} {enlace}. */
          porWhatsappTexto:
            'Cuando completes tu registro, nuestro equipo te contactará para solicitarlos. También puedes enviarlos directamente al [{numero}]({enlace}) indicando tu nombre y número de tarjeta profesional.',
          verificando: 'Verificando disponibilidad…',
          tarjeta: {
            etiqueta: 'Tarjeta Profesional o Certificado',
            pista: 'Foto o PDF de tarjeta, acta de grado o certificado.',
          },
          numeroTarjeta: {
            etiqueta: 'Número de Tarjeta Profesional',
            pista: 'Opcional.',
            ejemplo: 'Ej: 123456',
          },
          cedulaFrente: {
            etiqueta: 'Cédula de Ciudadanía (Frente)',
            pista: 'Foto o PDF de tu documento de identidad.',
          },
          cedulaRespaldo: {
            etiqueta: 'Cédula de Ciudadanía (Respaldo)',
            pista: 'Opcional si subiste ambas caras en el anterior.',
          },
          archivo: {
            subiendo: 'Subiendo archivo…',
            listo: '✓ Listo: {nombre}',
            elegir: '📎 Elegir foto o PDF (máx. 10 MB)',
            quitar: 'Quitar archivo',
            errorSubida: 'No se pudo subir el archivo.',
            errorRed:
              'No se pudo subir. Si el archivo es muy pesado, prueba con una foto más liviana; si no, revisa tu conexión.',
          },
        },
        autorizaciones: {
          titulo: 'Autorizaciones y Tratamiento de Datos',
          /** Variable: {anos}. Va detrás del aviso de tratamiento. */
          retencion: 'Conservamos tus datos durante {anos} años.',
          politica: 'Ver Política de Tratamiento de Datos',
        },
        volver: 'Volver al perfil',
        enviar: 'Enviar mi registro',
        enviando: 'Enviando registro…',
      },
      errores: {
        email: 'Escribe un correo válido',
        city: 'Dinos en qué ciudad o municipio vives',
        profession: 'Selecciona una profesión',
        professionOther: 'Cuéntanos cuál es tu profesión',
        yearsExperience: 'Selecciona tus años de experiencia',
        professionalCard: 'Selecciona el estado de tu tarjeta',
        populations: 'Selecciona al menos una población',
        populationOther: 'Cuéntanos con qué otra población trabajas',
        crisisExperience: 'Selecciona una opción sobre atención en crisis',
        modality: 'Selecciona una modalidad',
        availableDays: 'Selecciona al menos un día',
        availableSlots: 'Selecciona al menos una franja',
        weeklyHours: 'Selecciona cuántas horas puedes dedicar',
        yellowFeverVaccine: 'Selecciona el estado de vacunación',
        dataConsent: 'Necesitamos tu autorización para poder contactarte',
        sensitiveDataConsent:
          'Necesitamos tu autorización expresa para guardar el dato de vacunación',
        envio: 'No pudimos guardar tu registro. Intenta de nuevo.',
      },
      exito: {
        titulo: '¡Gracias por tu apoyo, {nombre}!',
        recibido:
          'Recibimos tu registro exitosamente. Tu disposición para acompañar a quienes más lo necesitan hace parte de algo muy grande.',
        contacto:
          'En los próximos días, alguien de nuestro equipo se comunicará contigo por WhatsApp para coordinar los siguientes pasos.',
        queSigue: '¿Qué pasa ahora?',
        pasos: [
          'Revisamos tu perfil y te asignamos a comunidades afines.',
          'Te contactamos por WhatsApp para coordinar tu vinculación.',
          '¡Empezamos a acompañar juntos!',
        ],
        whatsapp: '💬 Escribirnos por WhatsApp',
        otra: 'Registrar otra persona',
      },
    },

    /** «Quiero ser voluntario general»: el directorio de apoyo. */
    apoyo: {
      pasos: [
        'Tus Datos de Contacto',
        '¿En qué área y oficio puedes apoyar?',
        'Disponibilidad y Autorizaciones',
      ],
      nombre: { etiqueta: 'Nombre completo', ejemplo: 'Tu nombre y apellido' },
      celular: { etiqueta: 'Celular / WhatsApp', ejemplo: 'Ej: 300 123 4567' },
      correo: { etiqueta: 'Correo electrónico', ejemplo: 'correo@ejemplo.com' },
      ciudad: {
        etiqueta: '¿Desde qué ciudad o municipio te sumas?',
        ejemplo: 'Busca o escribe tu ciudad o municipio...',
        pista: 'Selecciona de la lista de Colombia o escríbelo si no aparece.',
      },
      siguiente1: 'Siguiente: ¿En qué puedes ayudar?',
      area: {
        etiqueta: '¿En qué área está lo tuyo? *',
        opciones: {
          SALUD: 'Salud y primeros auxilios',
          SOCIAL_LEGAL_EDUCATIVO: 'Social, legal y educativo',
          OPERACION_LOGISTICA: 'Operación y logística',
          COMUNICACION_TECNOLOGIA: 'Comunicación y tecnología',
          GESTION_PROYECTOS: 'Gestión y proyectos',
          OTRA: 'Otra área u oficio',
        },
      },
      disciplina: {
        etiqueta: '¿Cuál es tu disciplina u oficio? *',
        /** La clave es el valor que se guarda, en español; no se traduce. */
        opciones: {
          Medicina: 'Medicina',
          Enfermería: 'Enfermería',
          Fisioterapia: 'Fisioterapia',
          'Terapia ocupacional': 'Terapia ocupacional',
          Fonoaudiología: 'Fonoaudiología',
          'Nutrición y dietética': 'Nutrición y dietética',
          Odontología: 'Odontología',
          'Primeros auxilios': 'Primeros auxilios',
          'Trabajo social': 'Trabajo social',
          Derecho: 'Derecho',
          Docencia: 'Docencia',
          Pedagogía: 'Pedagogía',
          'Primera infancia': 'Primera infancia',
          'Gestión comunitaria': 'Gestión comunitaria',
          Logística: 'Logística',
          'Transporte y conducción': 'Transporte y conducción',
          'Bodega e inventario': 'Bodega e inventario',
          'Cocina y alimentación': 'Cocina y alimentación',
          'Construcción y obra': 'Construcción y obra',
          'Gestión del riesgo de desastres': 'Gestión del riesgo de desastres',
          'Comunicación social': 'Comunicación social',
          Diseño: 'Diseño',
          'Sistemas y tecnología': 'Sistemas y tecnología',
          'Análisis de datos': 'Análisis de datos',
          'Traducción e interpretación': 'Traducción e interpretación',
          'Gerencia de proyectos': 'Gerencia de proyectos',
          Administración: 'Administración',
          'Finanzas y contabilidad': 'Finanzas y contabilidad',
          'Talento humano': 'Talento humano',
          Otra: 'Otra',
        },
      },
      otraDisciplina: {
        siOtraArea: '¿Cuál es tu oficio o profesión?',
        siOtraDisciplina: '¿Cuál otra disciplina?',
        ejemplo: 'Escribe tu profesión u oficio...',
      },
      anos: {
        etiqueta: '¿Cuántos años llevas de experiencia en eso?',
        opciones: {
          MENOS_DE_1: 'Menos de 1 año',
          ENTRE_1_Y_3: 'Entre 1 y 3 años',
          ENTRE_3_Y_5: 'Entre 3 y 5 años',
          MAS_DE_5: 'Más de 5 años',
        },
      },
      tarjeta: {
        etiqueta: '¿Tienes tarjeta o registro profesional?',
        pista: 'Solo si tu profesión la exige. Si no aplica a tu oficio, puedes dejarla vacía.',
        opciones: {
          SI: 'Sí, la tengo',
          EN_TRAMITE: 'Está en trámite',
          ESTUDIANTE: 'Todavía soy estudiante',
        },
      },
      habilidades: {
        etiqueta: '¿Qué sabes hacer o qué habilidades nos pueden servir?',
        pista:
          'Opcional: herramientas que manejas, idiomas, si conduces vehículo, si has apoyado en terreno o emergencias.',
      },
      siguiente2: 'Siguiente: Disponibilidad',
      modalidad: {
        etiqueta: '¿Cómo puedes apoyar?',
        opciones: {
          PRESENCIAL: 'Presencial',
          VIRTUAL: 'Virtual, desde donde estoy',
          AMBAS: 'Las dos',
        },
      },
      desplazamiento: {
        etiqueta: '¿A qué municipios o zonas podrías desplazarte en caso necesario?',
        pista: 'Opcional. Por ejemplo: Todo el departamento, veredas cercanas, etc.',
      },
      dias: {
        etiqueta: '¿Qué días de la semana tienes disponibilidad? *',
        opciones: {
          LUNES: 'Lunes',
          MARTES: 'Martes',
          MIERCOLES: 'Miércoles',
          JUEVES: 'Jueves',
          VIERNES: 'Viernes',
          SABADO: 'Sábado',
          DOMINGO: 'Domingo',
        },
      },
      franjas: {
        etiqueta: '¿En qué franjas del día? *',
        opciones: {
          MANANA: 'Mañana (8 a. m. – 12 m.)',
          TARDE: 'Tarde (12 m. – 6 p. m.)',
          NOCHE: 'Noche (6 – 9 p. m.)',
        },
      },
      horas: {
        etiqueta: '¿Cuántas horas a la semana podrías dedicar?',
        opciones: {
          ENTRE_1_Y_3: 'Entre 1 y 3 horas',
          ENTRE_4_Y_6: 'Entre 4 y 6 horas',
          MAS_DE_6: 'Más de 6 horas',
          VARIABLE: 'Depende de la semana',
        },
      },
      fiebre: {
        etiqueta: '¿Estás vacunado/a contra la fiebre amarilla?',
        pista:
          'Algunas zonas de terreno exigen carné de vacunación para el ingreso. Si no la tienes, igual puedes apoyar virtualmente.',
        opciones: { SI: 'Sí', NO: 'No', CITA_AGENDADA: 'Tengo la cita agendada' },
      },
      autorizaciones: {
        titulo: 'Autorizaciones y tratamiento de datos',
        /** Variable: {anos}. Va entre el aviso de tratamiento y el de derechos. */
        retencion: 'Conservamos tus datos durante {anos} años desde que culminas tu participación.',
      },
      enviar: 'Quiero apoyar como voluntario',
      enviando: 'Enviando registro…',
      errores: {
        email: 'Escribe un correo electrónico válido',
        city: 'Selecciona o escribe en qué ciudad o municipio vives',
        area: 'Selecciona el área en la que deseas apoyar',
        discipline: 'Selecciona tu disciplina u oficio',
        disciplineOther: 'Cuéntanos cuál es tu oficio o profesión',
        modality: 'Selecciona cómo puedes apoyar',
        availableDays: 'Selecciona al menos un día',
        availableSlots: 'Selecciona al menos una franja',
        weeklyHours: 'Selecciona cuántas horas puedes dedicar',
        yellowFeverVaccine: 'Selecciona una opción de vacunación',
        dataConsent: 'Necesitamos tu autorización para poder contactarte',
        sensitiveDataConsent: 'Necesitamos tu autorización para guardar el dato de vacunación',
        incompleto: 'Revisa los campos marcados antes de enviar.',
        envio: 'No pudimos guardar tu registro. Intenta de nuevo.',
      },
      exito: {
        titulo: '¡Gracias por sumarte a la red, {nombre}!',
        sinNombre: 'Voluntario/a',
        /** `{telefono}` se pinta en negrita. */
        texto:
          'Tus datos ya están guardados en el directorio del voluntariado de la red. Cuando aparezca una brigada o necesidad que encaje con tu disciplina y disponibilidad, nuestro equipo de coordinación te escribirá a tu WhatsApp {telefono}.',
        otro: 'Registrar otro voluntario o volver al inicio',
      },
    },
  },
}

/**
 * La forma del diccionario. Las traducciones se declaran con este tipo, y eso
 * es lo que hace que una clave que falte —o que sobre— no compile.
 */
export type Diccionario = typeof es

/** Un bloque de texto largo: párrafo, viñetas o recuadro. */
export type Bloque = string | { lista: string[] } | { aviso: string }

/** Una pregunta frecuente, como la consume la sección. */
export type PreguntaFrecuente = {
  distintivo: string
  pregunta: string
  respuesta: (string | { lista: string[] })[]
}

export type IdPregunta = keyof Diccionario['preguntas']['items']
export type IdCategoriaPregunta = keyof Diccionario['preguntas']['categorias']
