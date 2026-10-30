/**
 * El «Manual operativo para profesionales de salud mental» (2026), en web.
 *
 * Era un PDF de 15 páginas. La operación pidió tenerlo para los psicólogos que
 * llegan a la red y poder mandárselo a los que ya están; en web se lee en el
 * celular, se enlaza a una sección concreta y se corrige sin reenviar nada.
 *
 * El texto es el del PDF que entregó la operación el 23 de octubre de 2026,
 * con tres cambios de forma y ninguno de fondo:
 *   · Las capturas del formulario de registro (pasos 2 y 3) se cambiaron por
 *     el enlace al formulario de verdad: una captura se desactualiza el día
 *     que cambia el formulario, el enlace no.
 *   · Erratas: «Pagina» → «Página», «PRIMCIPALES» → «principales», «SESION»
 *     → «sesión», y el WhatsApp escrito como en el resto del sitio.
 *   · Los subtítulos en mayúsculas sostenidas pasan a título normal; las
 *     mayúsculas de énfasis del texto («NO reemplaza») se quedan, en negrita.
 *
 * Mini-marcado de `TextoRico`: `**negrita**` y `[texto](enlace)`.
 */

import { site, whatsappHref } from '@/lib/site'

export type BloqueDelManual =
  | string
  | { lista: readonly string[] }
  | { pasos: readonly { titulo: string; texto: string }[] }
  | { subtitulo: string }
  | { destacado: string }

export type SeccionDelManual = {
  id: string
  /** El número del índice del manual. Las de presentación no llevan. */
  numero?: number
  titulo: string
  bloques: readonly BloqueDelManual[]
}

const WHATSAPP = `[${site.whatsappInternacional}](${whatsappHref})`

export const MANUAL = {
  titulo: 'Manual operativo para profesionales de salud mental',
  lema: 'Orientaciones para acompañar, conectar y reconstruir el tejido humano',
  institucion: 'Fundación Aquí Estamos — Red de Acompañamiento Psicológico y Atención en Crisis',
  uso: 'Documento institucional · Uso interno · Año 2026',

  presentacion: [
    {
      id: 'bienvenida',
      titulo: 'Bienvenidos a la Red Aquí Estamos',
      bloques: [
        'Hay momentos en los que una sociedad enfrenta situaciones que dejan heridas que no siempre son visibles. Una emergencia, una pérdida, una crisis familiar, un desastre natural, una situación de violencia o simplemente atravesar un momento profundamente difícil puede hacer que una persona sienta que está sola frente a aquello que está viviendo.',
        '**AQUÍ ESTAMOS** nace precisamente para recordar que no tiene por qué estarlo.',
        'Somos una red que busca poner las capacidades, conocimientos y voluntad de distintas personas al servicio de otros, especialmente cuando más necesitan apoyo.',
        'Nuestra convicción es sencilla, pero profunda: las sociedades también necesitan sanar, reconstruirse y volver a encontrarse. Por eso hablamos de reconstrucción del tejido humano.',
        'Porque reconstruir no significa únicamente levantar aquello que se cayó. Significa recuperar vínculos, devolver confianza, acompañar procesos, escuchar sin juzgar, abrir espacios seguros y ayudar a que una persona pueda volver a reconocerse como parte de una comunidad.',
        'Cada profesional que se incorpora a la Red Aquí Estamos se convierte en parte de esa tarea.',
        'Su conocimiento importa, su experiencia importa, su tiempo importa. Pero sobre todo, importa la manera en que decide ponerlos al servicio de otros.',
        'En esta Red entendemos que ayudar no significa resolver la vida de otra persona. Significa acompañarla con respeto, reconocer sus recursos, orientarla cuando sea necesario y en determinados momentos, simplemente estar. Porque a veces una conversación puede ser el primer hilo para comenzar a reconstruir algo que parecía perdido.',
      ],
    },
    {
      id: 'vision',
      titulo: 'Nuestra visión',
      bloques: [
        'Queremos contribuir a construir una sociedad más humana, solidaria y conectada, donde pedir ayuda no sea motivo de vergüenza y donde recibirla no dependa exclusivamente de tener recursos económicos, contactos o posibilidades de acceso.',
        'Aspiramos a fortalecer una red de personas y profesionales capaces de responder ante las dificultades con conocimiento, humanidad y responsabilidad.',
        'Y que cada intervención deje algo más que una atención puntual: queremos que contribuya a reconstruir vínculos, recuperar confianza y fortalecer el tejido humano de nuestras comunidades.',
      ],
    },
    {
      id: 'compromiso',
      titulo: 'Nuestro compromiso',
      bloques: [
        'Aquí Estamos no pretende reemplazar los sistemas formales de salud, protección o emergencia. Nuestro propósito es articular capacidades y acercar apoyo identificando necesidades, facilitando orientación y conectando a las personas con los recursos adecuados.',
        'Por eso esta Red se construye sobre dos pilares que deben avanzar siempre juntos: **humanidad y responsabilidad**.',
        { destacado: 'La humanidad nos recuerda por qué hacemos lo que hacemos, y la responsabilidad nos recuerda cómo debemos hacerlo.' },
        'Cada profesional tiene la libertad y el criterio para ejercer su profesión dentro de sus competencias y al mismo tiempo forma parte de una comunidad que debe proteger tanto a quienes reciben apoyo como a quienes lo entregan.',
        'Este manual nace para acompañar ese compromiso.',
        'Aquí encontrarás los procedimientos, responsabilidades, derechos, límites y herramientas necesarias para participar de manera segura, ética y organizada en la Red.',
        'Pero esperamos que encuentres también algo más: el sentido de formar parte de una comunidad que decidió no permanecer indiferente.',
        'Porque cuando una persona sostiene a otra, cuando un profesional comparte su conocimiento, cuando alguien escucha, orienta o simplemente permanece presente en un momento difícil, se reconstruye algo que va mucho más allá de esa situación particular. Se reconstruye humanidad. Porque cuando todo parece fragmentarse, siempre podemos comenzar por volver a encontrarnos.',
        'Gracias por estar. Bienvenido/a a Aquí Estamos.',
      ],
    },
  ] satisfies readonly SeccionDelManual[],

  secciones: [
    {
      id: 'registro',
      numero: 1,
      titulo: 'Registro y validación del profesional – Ingreso',
      bloques: [
        'Ser parte de la Red Aquí Estamos implica poner al servicio de otros los conocimientos, experiencia y capacidades profesionales, dentro de un marco de responsabilidad, respeto y cuidado.',
        'El ingreso a la Red se realiza mediante el formulario de registro dispuesto por Aquí Estamos. La información entregada debe ser veraz, completa y mantenerse actualizada.',
        {
          pasos: [
            {
              titulo: 'Paso 1',
              texto: 'Ingresa a la página web: [redaquiestamos.org/quiero-ser-parte](https://www.redaquiestamos.org/quiero-ser-parte).',
            },
            { titulo: 'Paso 2', texto: 'Pincha en la opción **Quiero dar apoyo psicológico**.' },
            {
              titulo: 'Paso 3',
              texto: 'Diligencia el [formulario](https://www.redaquiestamos.org/quiero-ser-parte#formulario).',
            },
            {
              titulo: 'Paso 4 — Documentación',
              texto:
                'En el paso 3, en la opción **Adjuntar documentos de verificación**, se despliega la opción de enviar la documentación requerida. Esta dependerá de la profesión y del tipo de atención que realizará cada profesional.',
            },
            {
              titulo: 'Paso 5 — Validación',
              texto:
                'Sea enviada vía WhatsApp o por la plataforma, la documentación será revisada antes de activar al profesional dentro de la Red.',
            },
            {
              titulo: 'Paso 6 — Activación',
              texto:
                'Una vez completada la validación, el profesional quedará disponible para la asignación de casos de acuerdo con su perfil, competencias, disponibilidad y necesidades de las personas que soliciten atención.',
            },
          ],
        },
        'En el caso de psicólogos, se solicitará, entre otros antecedentes:',
        {
          lista: [
            'Cédula de ciudadanía.',
            'Tarjeta profesional.',
            'Registro en ReTHUS.',
            'Antecedentes o verificaciones profesionales que correspondan.',
          ],
        },
        `Si la plataforma no permite cargar algún documento, podrá enviarse por el canal oficial de WhatsApp de Aquí Estamos, ${WHATSAPP}, para que el equipo de coordinación lo incorpore y realice la verificación correspondiente.`,
      ],
    },
    {
      id: 'derechos',
      numero: 2,
      titulo: 'Derechos y responsabilidades del profesional',
      bloques: [
        'La participación en Aquí Estamos se construye desde una relación de respeto mutuo.',
        { subtitulo: 'Derechos — El profesional tiene derecho a:' },
        {
          lista: [
            'Recibir un trato digno y respetuoso.',
            'Ejercer su criterio profesional dentro de sus competencias.',
            'Aceptar o rechazar una solicitud de atención.',
            'Solicitar cambio de caso cuando exista una razón profesional, ética o personal que lo justifique.',
            'Que se respete la disponibilidad informada.',
            'Recibir la información necesaria para comprender el caso.',
            'Solicitar orientación o apoyo a la coordinación ante situaciones complejas.',
            'No ser presionado para atender situaciones que excedan sus competencias.',
            'Retirarse voluntariamente de la Red, siguiendo el proceso correspondiente.',
            'Contar con canales de comunicación claros con Aquí Estamos.',
          ],
        },
        { destacado: 'Decir «Esto no lo puedo atender» también forma parte de una práctica profesional responsable.' },
        { subtitulo: 'Responsabilidades — El profesional se compromete a:' },
        {
          lista: [
            'Mantener actualizada su información y documentación.',
            'Informar una disponibilidad real.',
            'Responder las asignaciones recibidas.',
            'Cumplir los compromisos adquiridos con los usuarios.',
            'Mantener la confidencialidad y el secreto profesional cuando corresponda.',
            'Respetar los límites de la relación profesional.',
            'Informar oportunamente situaciones de riesgo, conflictos de interés o dificultades que puedan afectar la atención.',
            'Actuar dentro de sus competencias profesionales.',
            'Conocer y aplicar los procedimientos y protocolos vigentes de la Red.',
          ],
        },
        'La participación en la Red es voluntaria. La disponibilidad informada no significa una obligación permanente de aceptar casos.',
      ],
    },
    {
      id: 'disponibilidad',
      numero: 3,
      titulo: 'Disponibilidad y asignación de casos',
      bloques: [
        'Al registrarse en la Red, cada profesional informa sus horarios y disponibilidad para atender.',
        'La disponibilidad debe mantenerse actualizada, ya que las personas que solicitan atención podrán seleccionar horarios en función de ella.',
        `El profesional podrá modificar su disponibilidad cuando lo necesite mediante el enlace habilitado para ello o por medio del canal oficial de WhatsApp de Aquí Estamos, ${WHATSAPP}.`,
        { subtitulo: 'Asignación' },
        'La asignación de casos considera, según corresponda:',
        {
          lista: [
            'Perfil profesional.',
            'Competencias y experiencia.',
            'Tipo de situación.',
            'Modalidad de atención.',
            'Ubicación o cobertura.',
            'Disponibilidad.',
            'Características y necesidades generales del usuario.',
          ],
        },
        'La asignación podrá realizarse mediante la plataforma y será comunicada por los canales oficiales, principalmente WhatsApp o correo electrónico.',
        'El profesional recibirá información general necesaria para decidir si puede asumir el caso.',
      ],
    },
    {
      id: 'agendamiento',
      numero: 4,
      titulo: 'Agendamiento y atención',
      bloques: [
        'Una vez que el profesional acepta un caso, la persona usuaria (paciente) recibirá las opciones de horario disponibles para seleccionar su atención.',
        'La coordinación informará posteriormente al profesional la fecha y hora seleccionadas y enviará el enlace correspondiente.',
        'La modalidad de conexión podrá ajustarse de acuerdo con las herramientas tecnológicas disponibles en la Red.',
        { subtitulo: 'Durante la atención' },
        'El profesional deberá:',
        {
          lista: [
            'Generar un espacio respetuoso y seguro.',
            'Explicar, cuando corresponda, el propósito y alcance de la atención.',
            'Actuar de acuerdo con su formación y competencias.',
            'Respetar la autonomía de la persona.',
            'Mantener los límites profesionales.',
            'Identificar oportunamente situaciones que requieran otra intervención, derivación o apoyo.',
          ],
        },
        {
          destacado:
            'La atención ofrecida por Aquí Estamos busca acompañar y orientar. No reemplaza los servicios de urgencia, atención especializada, protección, justicia ni otros servicios institucionales que puedan ser necesarios.',
        },
        { subtitulo: 'Cierre de la sesión' },
        'Al finalizar, el profesional deberá registrar la información de seguimiento solicitada por la Red mediante el formulario correspondiente. (No guardamos copia ni registro de información proporcionada en la sesión llevada a cabo entre paciente/usuario y profesional.)',
      ],
    },
    {
      id: 'seguimiento',
      numero: 5,
      titulo: 'Seguimiento y continuidad',
      bloques: [
        'Después de cada atención, el profesional deberá completar el formulario de seguimiento habilitado por Aquí Estamos.',
        'Este formulario **no reemplaza la historia clínica** ni pretende convertirse en una historia clínica compartida por la Red. Su finalidad es permitir a la coordinación conocer de manera general la continuidad necesaria y las necesidades de apoyo.',
        'La información solicitada podrá incluir:',
        {
          lista: [
            'Si se recomienda una nueva sesión.',
            'Si se requiere otro tipo de atención o revisión.',
            'Situación general observada.',
            'Necesidades generales identificadas.',
            'Forma en que Aquí Estamos puede continuar apoyando.',
          ],
        },
        'Cuando sea necesaria una nueva sesión, idealmente el profesional y el usuario podrán acordar la continuidad durante la atención.',
        'El profesional deberá informar la necesidad de continuidad a la coordinación mediante el formulario y canal oficial.',
        { subtitulo: 'Número de sesiones' },
        'Como orientación general, la atención podrá contemplar:',
        {
          lista: ['Una sesión inicial de evaluación y orientación.', 'Hasta tres sesiones de seguimiento.'],
        },
        'Esto representa un esquema ordinario de hasta cuatro sesiones.',
        'Cuando exista una necesidad que justifique continuar, podrá solicitarse una continuidad excepcional, la cual será revisada y coordinada de acuerdo con las circunstancias del caso y la capacidad de la Red.',
        { destacado: 'La continuidad **NO** debe convertirse en una atención indefinida sin revisión.' },
      ],
    },
    {
      id: 'reagendamientos',
      numero: 6,
      titulo: 'Reagendamientos, cancelaciones e inasistencias',
      bloques: [
        'La atención de una persona requiere compromiso tanto del profesional como del usuario.',
        { subtitulo: 'Cuando el profesional necesita reagendar' },
        {
          lista: [
            'Debe informar a la coordinación con la mayor anticipación posible y, cuando corresponda, proponer alternativas de horario.',
          ],
        },
        { subtitulo: 'Cuando el usuario necesita reagendar' },
        {
          lista: [
            'La coordinación gestionará el cambio de horario procurando utilizar la disponibilidad vigente del profesional.',
          ],
        },
        { subtitulo: 'Inasistencias' },
        {
          lista: [
            'Las inasistencias deben quedar registradas y comunicarse a la coordinación cuando sea necesario.',
            'Cuando existan inasistencias o reagendamiento reiterado, la coordinación podrá revisar la continuidad del caso para evitar que permanezca abierto indefinidamente.',
            'Como criterio general, dos o más inasistencias o reagendamientos consecutivos podrán dar lugar a una revisión del caso y de la continuidad de la atención.',
          ],
        },
      ],
    },
    {
      id: 'limites',
      numero: 7,
      titulo: 'Vínculos, conflictos de interés y límites profesionales',
      bloques: [
        'La relación entre profesional y usuario debe mantenerse dentro de un marco profesional.',
        'Si el profesional conoce previamente al usuario, tiene una relación personal, familiar, laboral, comercial, afectiva o de cualquier otra naturaleza que pueda afectar su intervención, deberá informarlo de inmediato a la coordinación.',
        'Cuando exista un posible conflicto de interés, podrá solicitarse el cambio de profesional.',
        'Aquí Estamos busca proteger tanto al usuario como al profesional.',
        { subtitulo: 'Límites profesionales' },
        'Durante la participación en la Red **NO** corresponde:',
        {
          lista: [
            'Utilizar la información del usuario para beneficio personal.',
            'Solicitar o aceptar beneficios indebidos.',
            'Establecer relaciones económicas ajenas a la atención.',
            'Mantener relaciones afectivas o sexuales con usuarios.',
            'Utilizar la relación profesional para fines personales.',
            'Contactar al usuario mediante redes sociales personales sin una razón profesional y autorización correspondiente.',
            'Compartir información del usuario fuera de los canales y finalidades autorizadas.',
          ],
        },
        {
          destacado:
            'WhatsApp podrá utilizarse para coordinación y aspectos operativos, pero **NO** debe convertirse en un espacio paralelo de intervención terapéutica.',
        },
      ],
    },
    {
      id: 'crisis',
      numero: 8,
      titulo: 'Crisis, riesgo y derivación',
      bloques: [
        'Aquí Estamos reconoce que algunas situaciones requieren una respuesta distinta a una atención psicológica ordinaria.',
        'El profesional debe prestar especial atención cuando identifique, entre otras situaciones:',
        {
          lista: [
            'Riesgo suicida o autolesiones.',
            'Violencia o riesgo de violencia.',
            'Vulneración de derechos.',
            'Situaciones que involucren niños, niñas o adolescentes.',
            'Crisis psicológicas o psiquiátricas graves.',
            'Alteraciones importantes del estado de conciencia.',
            'Situaciones que requieran atención médica o de emergencia.',
            'Cualquier circunstancia que exceda las competencias del profesional.',
          ],
        },
        {
          destacado:
            'La Red **NO** reemplaza los servicios de emergencia ni las rutas institucionales de protección o atención en salud.',
        },
        'Ante una situación de riesgo, el profesional deberá actuar dentro de sus competencias, priorizando siempre la seguridad y bienestar de la persona y activando la ruta correspondiente. Asimismo, deberá informar a la coordinación de Aquí Estamos cuando la situación requiera intervención de la Red, derivación, seguimiento o apoyo adicional.',
        'Las rutas y protocolos específicos de la Red serán puestos a disposición de los profesionales y actualizados cuando corresponda. Este manual establece el marco general; los protocolos específicos contienen las orientaciones de actuación para cada situación.',
        'Cuando corresponda su aplicación, los profesionales deberán regirse por las rutas y protocolos vigentes, respetando los lineamientos establecidos. Estos instrumentos han sido diseñados y desarrollados específicamente para orientar la actuación profesional, reducir riesgos, prevenir actuaciones inadecuadas y favorecer una respuesta oportuna, segura y coherente frente a situaciones que puedan generar un daño mayor.',
        'Si una situación no se encuentra contemplada en los protocolos o existe alguna duda respecto de cómo proceder, el profesional deberá solicitar orientación a la coordinación antes de adoptar una decisión que pueda comprometer la seguridad o bienestar de la persona o su entorno.',
      ],
    },
    {
      id: 'confidencialidad',
      numero: 9,
      titulo: 'Confidencialidad y protección de datos',
      bloques: [
        'La información entregada por los usuarios debe ser tratada con especial cuidado.',
        'En Colombia, la información relacionada con la salud tiene la consideración de **dato sensible** y está sujeta a reglas especiales de protección. La Ley 1581 de 2012 establece, entre otros, principios de seguridad y confidencialidad en el tratamiento de datos personales.',
        'En el caso de los psicólogos, la Ley 1090 de 2006 establece deberes específicos relacionados con la reserva, secreto profesional, custodia de información y manejo de registros.',
        'Por ello:',
        {
          lista: [
            'Solo debe compartirse la información estrictamente necesaria.',
            'No deben enviarse antecedentes clínicos innecesarios por WhatsApp.',
            'Los documentos deben mantenerse protegidos.',
            'No deben almacenarse registros profesionales en dispositivos o espacios sin medidas adecuadas de seguridad.',
            'No debe compartirse información del usuario con terceros sin que exista una razón legítima y jurídicamente válida para hacerlo.',
            'La confidencialidad debe mantenerse también después de finalizar la participación en la Red.',
          ],
        },
        {
          destacado:
            'La información obtenida durante la atención **NO** puede utilizarse para beneficio personal o de terceros.',
        },
      ],
    },
    {
      id: 'nna',
      numero: 10,
      titulo: 'Atención de niños, niñas y adolescentes',
      bloques: [
        'La atención de niños, niñas y adolescentes requiere especial cuidado.',
        'El profesional deberá considerar su condición de sujetos de derechos y actuar priorizando su protección integral y su interés superior, conforme al marco colombiano de protección de la infancia y adolescencia.',
        'En estos casos es especialmente importante:',
        {
          lista: [
            'Actuar dentro de las competencias profesionales.',
            'Utilizar un lenguaje adecuado para la edad y características del niño, niña o adolescente.',
            'Respetar su dignidad, participación y capacidad de expresión.',
            'Considerar las reglas aplicables al consentimiento y a la participación de sus representantes.',
            'Proteger la información obtenida durante la atención.',
            'Identificar posibles situaciones de vulneración de derechos.',
            'Activar las rutas correspondientes cuando exista riesgo o vulneración.',
          ],
        },
        'La atención de NNA debe considerar tanto sus necesidades individuales como las obligaciones de protección que establece la legislación colombiana.',
      ],
    },
    {
      id: 'protocolos',
      numero: 11,
      titulo: 'Rutas y protocolos de actuación',
      bloques: [
        'Aquí Estamos cuenta y se encuentra desarrollando rutas y protocolos específicos de actuación para orientar la respuesta frente a situaciones que requieren procedimientos diferenciados.',
        'Estos documentos contemplan, entre otros aspectos, criterios de identificación de riesgo, actuación profesional, comunicación con la coordinación, derivación y activación de rutas institucionales cuando corresponda.',
        'Los protocolos específicos se encuentran en proceso de elaboración, revisión y fortalecimiento con participación de profesionales especializados, incluyendo psicología jurídica y un equipo de investigación.',
        'Por esta razón, este manual presenta únicamente el marco general de actuación y **NO** reemplaza dichos protocolos.',
        'Los documentos que se encuentren vigentes serán enviados o puestos a disposición de los profesionales de la Red según corresponda y deberán ser consultados cuando una situación requiera su aplicación.',
      ],
    },
    {
      id: 'retiro',
      numero: 12,
      titulo: 'Retiro y cierre de participación del profesional',
      bloques: [
        'La participación en Aquí Estamos es voluntaria.',
        'El profesional que desee retirarse deberá comunicarlo mediante el canal establecido y completar el procedimiento correspondiente.',
        'Cuando existan casos activos, será necesario informar a la coordinación para definir, según cada situación, la continuidad, transferencia o cierre de la atención.',
        { destacado: 'El retiro de la Red **NO** elimina las obligaciones de confidencialidad y protección de la información obtenida durante la participación.' },
        'Una vez finalizado el proceso con la documentación correspondiente, se procederá a la desactivación correspondiente en la plataforma.',
      ],
    },
    {
      id: 'marco-etico',
      numero: 13,
      titulo: 'Marco ético y normativo colombiano',
      bloques: [
        'El ejercicio profesional dentro de la Red debe desarrollarse de acuerdo con la legislación colombiana vigente y con las normas éticas propias de cada profesión.',
        'Para los profesionales de Psicología, constituye un marco fundamental la **Ley 1090 de 2006**, que reglamenta el ejercicio de la profesión y contiene el Código Deontológico y Bioético. Esta normativa contempla deberes relacionados con competencia profesional, secreto, confidencialidad, registros, bienestar del usuario y responsabilidad en el ejercicio profesional.',
        'También resultan relevantes, según el caso:',
        {
          lista: [
            'Ley 1581 de 2012 sobre protección de datos personales y tratamiento de datos sensibles.',
            'Ley 1098 de 2006, Código de la Infancia y la Adolescencia, cuando la atención involucre niños, niñas o adolescentes.',
            'Las demás disposiciones colombianas vigentes que resulten aplicables según la profesión, modalidad de atención, situación del usuario y naturaleza de la intervención.',
          ],
        },
        'Este manual **NO** sustituye la legislación colombiana, los códigos deontológicos, la formación profesional ni el criterio técnico del profesional.',
        'Cuando exista una situación que genere duda ética, legal o profesional, el profesional deberá solicitar orientación y, cuando corresponda, recurrir a la autoridad, institución o profesional competente y disponible en nuestra red.',
      ],
    },
    {
      id: 'canales',
      numero: 14,
      titulo: 'Canales de comunicación y contacto',
      bloques: [
        'La comunicación entre profesionales y Aquí Estamos deberá realizarse preferentemente mediante los canales oficiales de la Red.',
        { subtitulo: 'Canales principales' },
        {
          lista: [
            `WhatsApp oficial: ${WHATSAPP}`,
            '[Sitio web: www.redaquiestamos.org](https://www.redaquiestamos.org)',
          ],
        },
        'Los canales oficiales podrán utilizarse para:',
        {
          lista: [
            'Confirmar asignaciones.',
            'Informar aceptación o rechazo de casos.',
            'Actualizar disponibilidad.',
            'Solicitar apoyo a coordinación.',
            'Informar dificultades o situaciones relevantes.',
            'Coordinar continuidad.',
            'Reportar situaciones que requieran atención de la Red.',
          ],
        },
        'La comunicación por WhatsApp debe mantenerse principalmente en el ámbito operativo y de coordinación, evitando compartir información clínica innecesaria.',
        'Cuando exista una situación urgente o de riesgo, el profesional deberá priorizar la activación de los servicios de emergencia o las rutas institucionales correspondientes y, cuando proceda, informar a la coordinación de Aquí Estamos.',
      ],
    },
  ] satisfies readonly SeccionDelManual[],

  documentosComplementarios:
    'Los documentos, formularios, protocolos y herramientas que respaldan los procesos de la Red serán informados y estarán disponibles para los profesionales cuando corresponda. **No forman parte del contenido de este manual.**',

  cierre: {
    id: 'cierre',
    titulo: 'Cierre',
    bloques: [
      'Ser parte de Aquí Estamos no significa tener todas las respuestas.',
      'Significa estar dispuesto a escuchar, acompañar, orientar y reconocer cuándo es necesario sumar a otra persona, otro profesional o una institución.',
      'Nuestra labor busca conectar capacidades con necesidades y, desde ahí, contribuir a la reconstrucción del tejido humano.',
      'Cada atención es una oportunidad para recordar que detrás de una solicitud hay una persona que merece ser escuchada con respeto, tratada con dignidad y acompañada con responsabilidad.',
      '**Gracias por ser parte de la Red Aquí Estamos.**',
    ],
  } satisfies SeccionDelManual,
} as const

/** La dirección del manual, para enlazarla desde el portal y los mensajes. */
export const RUTA_DEL_MANUAL = '/manual-profesionales'
