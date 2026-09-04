/**
 * Textos de autorización de tratamiento de datos.
 *
 * Nunca edites el texto de una versión ya publicada: crea una nueva y súbela a
 * VERSION_ACTUAL. Cada envío guarda la versión que la persona aceptó, y esa es
 * la única forma de probar después qué autorizó exactamente.
 *
 * El backend valida la versión contra `src/consent/versions.js`. Si añades una
 * aquí, añádela también allá.
 */

export const VERSION_CONSENTIMIENTO = '2026-09'

export const RESPONSABLE = {
  nombre: 'Red Aquí Estamos',
  /** Pendiente: el NIT está en gestión. */
  nit: null as string | null,
  /** Pendiente: no hay sede física. */
  direccion: null as string | null,
  /** Provisional hasta que exista un correo dedicado de habeas data. */
  canal: 'WhatsApp +57 310 218 6299',
  canalHref: 'https://wa.me/573102186299',
  retencionMeses: 24,
} as const

/**
 * EL CONSENTIMIENTO DE LA SESIÓN.
 *
 * Distinto de la autorización de datos de arriba: aquello es la Ley 1581
 * —qué hacemos con lo que nos cuentas—; esto es la Ley 1090 —en qué consiste
 * el acompañamiento y hasta dónde llega el secreto profesional—. Se firman en
 * momentos distintos y por eso llevan versiones distintas.
 *
 * Vivía dentro del formulario de firma. Ahora lo leen tres pantallas —el
 * formulario, la página pública y el momento de elegir hora—, y el texto que
 * se firma no puede depender de por cuál de ellas entró la persona.
 *
 * Nunca edites el texto de una versión ya publicada: crea una nueva y súbela
 * a `version`. Cada firma guarda la que aceptó, y esa es la única forma de
 * probar en noviembre qué aceptó quien firmó en agosto.
 *
 * Versión sesion-2026-08-2 — revisada contra el marco colombiano:
 *   · Ley 1090/2006 (secreto profesional del psicólogo y sus excepciones,
 *     consentimiento informado) y Ley 1616/2013 (derechos en salud mental).
 *   · Ley 1581/2012 y Decreto 1377/2013: los datos de salud son SENSIBLES y
 *     su autorización debe ser explícita, informando que no es obligatoria.
 *   · La confidencialidad tiene DOS límites legales, no uno: el riesgo serio
 *     y el requerimiento formal de autoridad competente. Decir «un solo
 *     límite» era jurídicamente impreciso.
 */
export const CONSENTIMIENTO_SESION = {
  version: 'sesion-2026-08-2',
  /** La página donde vive el texto completo, para enlazarlo desde donde se firma. */
  url: '/consentimiento-informado',
  /**
   * Punto por punto y en el idioma de la red: sin párrafos de contrato que
   * nadie lee. Cada punto es una frase que se entiende desde el teléfono y
   * con poca cabeza.
   */
  puntos: [
    {
      titulo: 'Qué es esto',
      texto:
        'Un acompañamiento psicológico voluntario y gratuito, con un profesional de la Red Aquí Estamos. No reemplaza un tratamiento médico ni psiquiátrico, y no somos un servicio de emergencias.',
    },
    {
      titulo: 'Confidencialidad',
      texto:
        'Lo que hables en la sesión es confidencial y está protegido por el secreto profesional. Solo tiene dos límites, ambos previstos por la ley: si hay riesgo serio para tu vida o la de otra persona, el profesional puede activar ayuda; y si una autoridad competente lo exige formalmente.',
    },
    {
      titulo: 'Es voluntario',
      texto:
        'Puedes pausar o dejar el acompañamiento cuando quieras, sin dar explicaciones y sin que eso cambie cómo te tratamos.',
    },
    {
      titulo: 'Tus datos',
      texto:
        'Tus datos de salud son sensibles según la ley colombiana y no estás obligado a autorizar su uso; si aceptas, los usamos solo para coordinar tu acompañamiento, como dice nuestra política de datos. Puedes pedir verlos, corregirlos o eliminarlos cuando quieras. La red no guarda historia clínica de tus sesiones.',
    },
    {
      titulo: 'Tu firma',
      texto:
        'Al escribir tu nombre y aceptar, queda registrado qué versión de este texto aceptaste y cuándo. Si algo no te queda claro, pregúntanos por WhatsApp antes de firmar: con gusto te lo explicamos.',
    },
  ],
} as const

export const LINEAS_EMERGENCIA = [
  { nombre: 'Línea de emergencias', numero: '123', href: 'tel:123' },
  { nombre: 'Línea de salud mental', numero: '106', href: 'tel:106' },
] as const

/** Párrafo informativo que va encima de las casillas. */
export const AVISO_TRATAMIENTO = {
  atencion:
    'Red Aquí Estamos es responsable de los datos que nos compartes. Los usamos para contactarte, coordinar tu acompañamiento y llevar el registro interno de la red. Se comparten únicamente con el profesional que te acompañe y con el equipo de coordinación: no los vendemos ni los entregamos a terceros.',
  profesionales:
    'Red Aquí Estamos es responsable de los datos que nos compartes. Los usamos para evaluar tu postulación, coordinar los acompañamientos que asumas y llevar el registro interno de la red. No los vendemos ni los entregamos a terceros.',
  apoyo:
    'Red Aquí Estamos es responsable de los datos que nos compartes. Los usamos para tener un directorio del voluntariado de la red y poder buscarte cuando aparezca una necesidad que encaje con lo que sabes hacer. No los vendemos ni los entregamos a terceros.',
} as const

export const AVISO_DERECHOS =
  'Puedes pedirnos en cualquier momento conocer, actualizar o corregir tus datos, eliminarlos, o retirar esta autorización.'

/** Texto exacto de cada casilla. Lo que se guarda como prueba es la versión. */
export const CASILLAS = {
  /**
   * Atención psicológica, en una sola casilla.
   *
   * Eran dos: una para los datos y otra para el dato de salud. Las dos pedían
   * la misma decisión, y se las estábamos pidiendo a alguien que escribe
   * porque está mal. El formulario del voluntario ya enlazaba a la política y
   * cabía en una línea; el de quien pide ayuda llevaba el párrafo entero.
   *
   * Juntarlas no relaja nada. La ley pide que la autorización del dato
   * sensible sea explícita y que a la persona se le diga que es sensible, para
   * qué se usa y que no está obligada a darlo (Ley 1581 art. 6, Decreto 1377
   * art. 6). No pide dos casillas: pide que esas tres cosas estén dichas. Por
   * eso esto es una frase y no un «acepto los términos».
   */
  atencion:
    'Autorizo a Red Aquí Estamos a tratar mis datos para acompañarme, incluido el de mi salud mental, que es un dato sensible y que no estoy obligado ni obligada a entregar.',

  /**
   * Estos dos se quedan por los registros de la versión 2026-08, que los
   * aceptaron por separado. No se editan nunca: son la prueba de qué autorizó
   * cada quien.
   */

  datos: 'Autorizo a Red Aquí Estamos a tratar mis datos personales para las finalidades descritas arriba.',

  sensiblesAtencion:
    'Entiendo que solicitar acompañamiento psicológico es un dato sensible de salud, que no estoy obligado ni obligada a entregarlo, y autorizo de forma expresa su tratamiento para poder recibir el acompañamiento.',

  sensiblesProfesional:
    'Entiendo que el dato sobre mi vacunación es un dato de salud, que no estoy obligado ni obligada a entregarlo, y autorizo su tratamiento para las salidas de campo.',

  representante:
    'Soy el padre, la madre o el representante legal de la persona menor de edad que va a recibir el acompañamiento, y autorizo su participación.',

  comunicaciones: 'Quiero recibir información sobre otras actividades y recursos de la red.',
} as const
