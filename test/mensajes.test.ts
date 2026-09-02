import {
  describe,
  it,
  expect } from 'vitest'
import {
  mensajeDePropuesta,
  enlaceWhatsapp,
  mensajeDeTamizaje,
  numeroDePregunta,
  PREGUNTAS_TAMIZAJE,
  GUIA_DE_PRIORIDAD,
  REGLAS_DE_LECTURA,
  LINEA_DE_CRISIS,
  respuestasParaLaApi,
  respuestaDeRiesgo,
  mensajeParaCuadrarHorario,
  mensajeDeCitaConfirmada,
  mensajeDeCitaAlProfesional,
  mensajeDeConsentimiento,
  mensajeRecordatorioPrevioCitaProfesional,
  mensajeRecordatorioPrevioCitaPersona,
} from '../lib/mensajes'
import { LINEAS_EMERGENCIA } from '../lib/consentimiento'

const base = {
  profesional: 'Ana María Pérez Gómez',
  ciudad: 'Ibagué',
  prioridad: 'MEDIA',
  modalidad: 'VIRTUAL',
  dias: ['LUNES', 'MIERCOLES', 'VIERNES'],
  franjas: ['TARDE'],
  enlace: 'https://redaquiestamos.org/portal/caso/abc-123',
}

describe('mensaje de propuesta al profesional', () => {
  it('saluda por el nombre de pila, no por el nombre completo', () => {
    expect(mensajeDePropuesta(base)).toContain('Hola Ana,')
    expect(mensajeDePropuesta(base)).not.toContain('Pérez Gómez')
  })

  it('enumera los días como se dicen', () => {
    expect(mensajeDePropuesta(base)).toContain(
      'lunes, miércoles y viernes en la tarde (de 12:00 p. m. a 6:00 p. m.)',
    )
  })

  /**
   * Lo que no se sabe se dice. El silencio se lee como "no tiene
   * restricciones", que es lo contrario de lo que significa, y en la práctica
   * casi ninguna solicitud trae la disponibilidad llena.
   */
  it('dice lo que NO sabemos en vez de callarlo', () => {
    const texto = mensajeDePropuesta({ ...base, dias: [], franjas: [], modalidad: null })
    expect(texto).toContain('No sabemos qué modalidad prefiere y qué días puede')
    expect(texto).toContain('no quedó en el formulario')
    expect(texto).not.toContain('· Puede ')
    expect(texto).not.toContain('· Prefiere')
    // Y el enlace sigue ahí: el mensaje es útil aunque falten datos.
    expect(texto).toContain(base.enlace)
  })

  it('nombra solo lo que de verdad falta', () => {
    const sinDias = mensajeDePropuesta({ ...base, dias: [], franjas: [] })
    expect(sinDias).toContain('No sabemos qué días puede')
    expect(sinDias).not.toContain('qué modalidad prefiere')
    expect(sinDias).toContain('· Prefiere que sea virtual.')
  })

  it('cuando está todo, no dice que falte nada', () => {
    expect(mensajeDePropuesta(base)).not.toContain('No sabemos')
  })

  /**
   * Este mensaje le llega a la misma persona muchas veces. "Gracias por
   * sumarte" es para quien acaba de llegar; a la quinta propuesta suena a
   * plantilla mal puesta.
   */
  it('saluda sin dar por hecho que es la primera vez', () => {
    expect(mensajeDePropuesta(base)).not.toContain('gracias por sumarte')
  })

  /**
   * Lo que de verdad importa: el mensaje viaja por WhatsApp, fuera de la
   * protección del enlace. Si algún día alguien añade el nombre o el teléfono
   * de la persona acompañada, esta prueba tiene que fallar.
   */
  it('no filtra datos de contacto de la persona acompañada', () => {
    const texto = mensajeDePropuesta(base)
    expect(texto).not.toMatch(/\d{7,}/)
    expect(texto.toLowerCase()).not.toContain('teléfono')
  })

  it('cambia la urgencia según la prioridad', () => {
    expect(mensajeDePropuesta({ ...base, prioridad: 'ALTA' })).toContain('hoy mismo')
    expect(mensajeDePropuesta({ ...base, prioridad: 'BAJA' })).toContain('esta semana')
  })

  /**
   * Anuncia, y por eso tiene que ofrecer la salida en la misma frase.
   *
   * Aquí se afirmaba lo contrario —que el mensaje PREGUNTA y no anuncia— y era
   * la decisión correcta mientras el caso se quedaba parado hasta que él dijera
   * que sí. Los datos dijeron lo que costaba: siete de cada ocho asignaciones
   * murieron con el motivo «el profesional no respondió».
   *
   * Ahora se le asigna y se le avisa. Eso solo es legítimo si el mismo mensaje
   * que le da la noticia le da la puerta, así que las dos cosas se comprueban
   * juntas: si alguien quita la segunda línea, esto se pone rojo.
   */
  it('le dice que el caso es suyo Y cómo salirse', () => {
    const texto = mensajeDePropuesta(base)
    expect(texto).toContain('Te asignamos un acompañamiento')
    expect(texto).toMatch(/si en este momento no puedes/i)
  })

  it('le manda a su enlace, no a responder por WhatsApp', () => {
    const texto = mensajeDePropuesta(base)
    expect(texto).toContain(base.enlace)

    // Ya no le pide horarios: su agenda está en su perfil y de ahí elige ella.
    expect(texto).not.toContain('los días y las horas en las que podrías')
  })

  /**
   * Sigue sin llevar el nombre ni el teléfono de la persona.
   *
   * Esto no cambió con el flujo y no debe cambiar: el mensaje sale por WhatsApp
   * y puede acabar en un chat que no controlamos. Para saber si puede tomar el
   * caso hace falta dónde está y cómo prefiere que sea, no quién es.
   */
  it('no lleva datos de la persona, solo lo que hace falta para decidir', () => {
    const texto = mensajeDePropuesta(base)
    expect(texto).toContain('confidencial')
    expect(texto).toContain(base.ciudad)
  })

  it('deja claro que decir que no está bien', () => {
    expect(mensajeDePropuesta(base)).toContain('No pasa nada: es voluntario')
  })
})

describe('enlace de WhatsApp', () => {
  it('le pone el indicativo a un celular colombiano', () => {
    expect(enlaceWhatsapp('3001234567', 'hola')).toContain('wa.me/573001234567')
  })

  it('respeta un número que ya lo trae', () => {
    expect(enlaceWhatsapp('+34 600 123 456', 'hola')).toContain('wa.me/34600123456')
  })

  it('escapa el mensaje para que los saltos de línea sobrevivan', () => {
    const url = enlaceWhatsapp('3001234567', 'línea uno\nlínea dos')
    expect(url).toContain('%0A')
    expect(url).not.toContain('\n')
  })
})

describe('mensaje de tamizaje', () => {
  const enlace = 'https://redaquiestamos.org/tamizaje/abc.def'
  const texto = mensajeDeTamizaje({ nombre: 'Luisa Fernanda Ortiz', enlace })

  it('saluda por el nombre de pila', () => {
    expect(texto).toContain('Hola Luisa,')
    expect(texto).not.toContain('Ortiz')
  })

  it('lleva el enlace y no las preguntas', () => {
    expect(texto).toContain(enlace)
    for (const p of PREGUNTAS_TAMIZAJE) {
      expect(texto).not.toContain(p.pregunta)
    }
  })

  it('dice cuántas preguntas son, contándolas de la lista', () => {
    expect(texto).toContain(`${PREGUNTAS_TAMIZAJE.length} preguntas cortas`)
  })

  /**
   * Pide el aviso sin condicionar la ayuda a que conteste: el «así podemos
   * acompañarte lo antes posible» de antes era presión sutil sobre alguien
   * que acaba de pedir ayuda. Si vuelve, esta prueba falla.
   */
  it('pide que confirmen cuando hayan respondido, sin presionar', () => {
    expect(texto).toContain('cuéntanos por aquí')
    expect(texto).not.toContain('lo antes posible')
    expect(texto).not.toContain('necesitamos llamarte')
    expect(texto).not.toContain('en qué orden')
  })

  /**
   * La pregunta de riesgo vive detrás del enlace, pero quien recibe este
   * mensaje puede estar mal AHORA, antes de abrir nada. Si algún día alguien
   * saca la línea de crisis para acortar el texto, esta prueba falla.
   */
  it('lleva la salida de emergencia aunque las preguntas estén detrás del enlace', () => {
    expect(texto).toContain(LINEA_DE_CRISIS)
    for (const linea of LINEAS_EMERGENCIA) {
      expect(texto).toContain(linea.numero)
    }
  })

  it('dice que no es un diagnóstico y que quien escribe no es el psicólogo', () => {
    expect(texto).toContain('ni un diagnóstico')
    expect(texto).toContain('No hay respuestas buenas ni malas')
  })

  it('aguanta un nombre vacío sin dejar el saludo a medias', () => {
    expect(mensajeDeTamizaje({ nombre: '   ', enlace })).toContain('Hola hola,')
  })
})

describe('respuestas del tamizaje', () => {
  // Cada respuesta es una lista, tambien las de opcion unica: tener dos
  // formas obliga a preguntar en cada sitio cual es cual.
  const todas = {
    seguridad: ['SI'],
    intensidad: ['4'],
    sueno: ['MAS_O_MENOS'],
    funcionamiento: ['CON_DIFICULTAD'],
    red: ['NO'],
    riesgo: ['NO'],
    urgencia: ['ESTA_SEMANA'],
    dias: ['MARTES', 'JUEVES'],
    franjas: ['TARDE'],
    modalidad: ['VIRTUAL'],
  }

  it('traduce lo que se tocó en pantalla a lo que espera la API', () => {
    expect(respuestasParaLaApi(todas)).toEqual({
      safePlace: true,
      distress: 4,
      sleepAndEat: 'MAS_O_MENOS',
      dailyFunction: 'CON_DIFICULTAD',
      hasSupport: false,
      selfHarmThoughts: false,
      howSoon: 'ESTA_SEMANA',
      availableDays: ['MARTES', 'JUEVES'],
      availableSlots: ['TARDE'],
      preferredModality: 'VIRTUAL',
      sensitiveDataConsent: true,
    })
  })

  it('la intensidad sale como número, no como el texto del botón', () => {
    expect(typeof respuestasParaLaApi(todas).distress).toBe('number')
  })

  /**
   * De esto depende que las líneas de emergencia salgan en pantalla en el
   * momento en que la persona marca la respuesta, y no al final del formulario.
   */
  it('detecta riesgo en cuanto se marca, sin esperar a que termine', () => {
    expect(respuestaDeRiesgo({})).toBe(false)
    expect(respuestaDeRiesgo({ riesgo: ['NO'] })).toBe(false)
    expect(respuestaDeRiesgo({ riesgo: ['SI'] })).toBe(true)
    expect(respuestaDeRiesgo({ seguridad: ['NO'] })).toBe(true)
  })
})

describe('guía de prioridad', () => {
  it('cubre los tres niveles que ofrece el botón de admitir', () => {
    expect(GUIA_DE_PRIORIDAD.map((n) => n.prioridad)).toEqual(['ALTA', 'MEDIA', 'BAJA'])
  })

  /**
   * La guía cita las preguntas por número. Si alguien reordena la lista, los
   * números tienen que seguirla solos: una guía que apunta a otra pregunta es
   * peor que no tener guía.
   */
  it('numera las preguntas a partir de la lista, no a mano', () => {
    expect(numeroDePregunta('seguridad')).toBe(1)
    // La de riesgo es la 6 y la de urgencia la 7, delante de las de
    // disponibilidad: primero cómo está, después cuándo puede.
    expect(numeroDePregunta('riesgo')).toBe(6)
    expect(numeroDePregunta('urgencia')).toBe(7)
    expect(numeroDePregunta('modalidad')).toBe(PREGUNTAS_TAMIZAJE.length)
  })

  /**
   * Las de disponibilidad van al FINAL a propósito. Si alguien abandona el
   * formulario a medias, lo que interesa haber preguntado ya es cómo está,
   * no qué días le sirven.
   */
  it('pregunta cómo está antes que cuándo puede', () => {
    const claves = PREGUNTAS_TAMIZAJE.map((p) => p.clave)
    expect(claves.slice(-3)).toEqual(['dias', 'franjas', 'modalidad'])
  })

  it('las de varias respuestas están marcadas como tales', () => {
    const multiples = PREGUNTAS_TAMIZAJE.filter((p) => 'multiple' in p && p.multiple).map((p) => p.clave)
    expect(multiples).toEqual(['dias', 'franjas'])
  })

  it('la señal de riesgo manda sola a prioridad alta', () => {
    const alta = GUIA_DE_PRIORIDAD.find((n) => n.prioridad === 'ALTA')
    expect(alta?.senales.some((s) => s.includes('ya es ALTA'))).toBe(true)
  })

  it('ante la duda se sube la prioridad, no se baja', () => {
    expect(REGLAS_DE_LECTURA.join(' ')).toContain('sube la prioridad')
  })
})


/**
 * Los tres mensajes que siguen a la propuesta.
 *
 * Lo que más se cuida aquí es quién puede ver el teléfono de quién. La red
 * decidió que el número del profesional no llega a la persona acompañada y
 * que el de ella no llega a él por WhatsApp: cada uno ve lo suyo, y quien
 * coordina es el puente. Si alguien afloja eso, estas pruebas fallan.
 */
describe('cuadrar el horario con la persona', () => {
  const datos = {
    persona: 'Luisa Fernanda Ortiz',
    profesional: 'Ana María Pérez Gómez',
    dias: ['MARTES', 'JUEVES'],
    franjas: ['TARDE'],
    nota: 'después de las 4 mejor',
  }
  const texto = mensajeParaCuadrarHorario(datos)

  it('saluda por el nombre de pila', () => {
    expect(texto).toContain('Hola Luisa,')
  })

  it('dice quién la va a acompañar, con nombre completo', () => {
    expect(texto).toContain('Ana María Pérez Gómez')
  })

  /** El nombre sí, el teléfono no: coordinar es trabajo de quien coordina. */
  it('NO lleva el teléfono del profesional', () => {
    expect(texto).not.toMatch(/d{7,}/)
  })

  it('lista los horarios que el profesional puso él mismo, con las horas', () => {
    expect(texto).toContain('martes y jueves')
    // "en la tarde" a secas obliga a adivinar; el paréntesis lo resuelve.
    expect(texto).toContain('en la tarde (de 12:00 p. m. a 6:00 p. m.)')
    expect(texto).toContain('después de las 4 mejor')
  })

  it('deja salida si ninguno le sirve', () => {
    expect(texto).toContain('dinos tú cuándo puedes')
  })
})

describe('confirmación de la cita a la persona', () => {
  const texto = mensajeDeCitaConfirmada({
    persona: 'Luisa Fernanda Ortiz',
    profesional: 'Ana María Pérez Gómez',
    cuando: '2026-09-03 15:00',
    modalidad: 'VIRTUAL',
  })

  it('lleva cuándo, con quién y en qué modalidad', () => {
    expect(texto).toContain('2026-09-03 15:00')
    expect(texto).toContain('Ana María Pérez Gómez')
    expect(texto).toContain('virtual')
  })

  /**
   * Sin esta frase la persona se queda esperando sin saber quién da el primer
   * paso, y en una espera así no saber es lo que más pesa.
   */
  it('dice explícitamente que el profesional la va a contactar', () => {
    expect(texto).toContain('se va a poner en contacto contigo')
  })

  it('sigue sin llevar el teléfono del profesional', () => {
    expect(texto).not.toMatch(/d{7,}/)
  })
})

describe('confirmación de la cita al profesional', () => {
  const texto = mensajeDeCitaAlProfesional({
    profesional: 'Ana María Pérez Gómez',
    cuando: '2026-09-03 15:00',
    modalidad: 'VIRTUAL',
    enlace: 'https://redaquiestamos.org/portal/caso/abc-123',
  })

  it('lleva la cita y el enlace', () => {
    expect(texto).toContain('2026-09-03 15:00')
    expect(texto).toContain('https://redaquiestamos.org/portal/caso/abc-123')
  })

  /** Los datos de la persona nunca viajan por WhatsApp: van tras el enlace. */
  it('no lleva el nombre ni el teléfono de la persona acompañada', () => {
    expect(texto).not.toMatch(/d{7,}/)
    expect(texto.toLowerCase()).not.toContain('teléfono')
  })

  it('le avisa de que la persona lo está esperando a él', () => {
    expect(texto).toContain('tú vas a contactarla')
  })

  /**
   * El pedido de después va en tres preguntas concretas, no en un «cuéntanos
   * cómo te fue»: la tercera es la que decide si se agenda otra o se cierra.
   */
  it('pide las tres respuestas que permiten cerrar la cita', () => {
    expect(texto).toContain('1. Si la sesión se pudo hacer o no.')
    expect(texto).toContain('2. Cómo te fue.')
    expect(texto).toContain('3. Si crees que necesita más sesiones')
    expect(texto).toContain('cerramos esta cita')
  })
})

describe('mensaje de consentimiento', () => {
  const texto = mensajeDeConsentimiento({
    persona: 'camilo andrés torres',
    profesional: 'juan pablo jiménez',
    enlace: 'https://redaquiestamos.org/consentimiento/abc.def',
  })

  it('saluda por el nombre de pila, especifica que se hace desde cualquier dispositivo y lleva el enlace completo', () => {
    expect(texto).toContain('Hola Camilo')
    expect(texto).toContain('con Juan')
    expect(texto).toContain('desde cualquier dispositivo en nuestro sitio web oficial:')
    expect(texto).toContain('https://redaquiestamos.org/consentimiento/abc.def')
  })

  it('dice que es requisito, sin sonar a amenaza', () => {
    expect(texto).toContain('Es el paso que nos permite empezar')
    expect(texto).toContain('escríbenos por aquí')
  })
})

describe('mensajes de seguimiento', () => {
  it('el del profesional NO lleva el nombre ni el teléfono de la persona', async () => {
    const { mensajeDeSeguimientoAlProfesional } = await import('../lib/mensajes')
    const texto = mensajeDeSeguimientoAlProfesional({
      profesional: 'Ana María Pérez',
      enlace: 'https://redaquiestamos.org/portal/caso/abc',
    })
    expect(texto).toContain('Hola Ana')
    expect(texto).toContain('/portal/caso/abc')
    expect(texto).not.toMatch(/\d{7,}/)
    expect(texto).toContain('lo resolvemos juntos')
  })

  it('el de la persona pregunta sin reprochar', async () => {
    const { mensajeDeSeguimientoALaPersona } = await import('../lib/mensajes')
    const texto = mensajeDeSeguimientoALaPersona({
      persona: 'camilo torres',
      profesional: 'Ana María Pérez',
    })
    expect(texto).toContain('Hola Camilo')
    expect(texto).toContain('¿ya pudiste hablar con Ana')
    // sin reproche: nada de «recuerda» ni de ponerla en falta
    expect(texto.toLowerCase()).not.toContain('recuerda')
  })

  /** Los emojis viajan en una URL y según el dispositivo llegan rotos. */
  it('ningún mensaje de la red lleva emojis', async () => {
    const m = await import('../lib/mensajes')
    const textos = [
      m.mensajeDeSeguimientoAlProfesional({ profesional: 'Ana', enlace: 'x' }),
      m.mensajeDeSeguimientoALaPersona({ persona: 'Ana', profesional: 'Luis' }),
      m.mensajeDeSeguimientoGeneral(),
      m.mensajeDeTamizaje({ nombre: 'Ana', enlace: 'x' }),
      m.mensajeDeConsentimiento({ persona: 'Ana', profesional: 'Luis', enlace: 'x' }),
    ]
    for (const t of textos) {
      expect(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(t)).toBe(false)
    }
  })
})

describe('formato de WhatsApp', () => {
  /**
   * *asteriscos* = negrita al enviarse. Solo en lo que el ojo debe encontrar
   * primero: si esto falla, alguien quitó el resaltado de los números de
   * crisis o de la fecha de la cita.
   */
  it('los números de crisis van en negrita', async () => {
    const { LINEA_DE_CRISIS } = await import('../lib/mensajes')
    expect(LINEA_DE_CRISIS).toContain('*123*')
    expect(LINEA_DE_CRISIS).toContain('*106*')
  })

  it('la fecha de la cita va en negrita para la persona y el profesional', async () => {
    const m = await import('../lib/mensajes')
    expect(
      m.mensajeDeCitaConfirmada({ persona: 'Ana', profesional: 'Luis', cuando: 'lunes 3 pm' }),
    ).toContain('*Cuándo:* lunes 3 pm')
    expect(
      m.mensajeDeCitaAlProfesional({ profesional: 'Luis', cuando: 'lunes 3 pm', enlace: 'x' }),
    ).toContain('*Cuándo:* lunes 3 pm')
  })
})

describe('mensaje de la encuesta del cierre', () => {
  it('agradece y deja claro que es opcional', async () => {
    const { mensajeDeEncuesta } = await import('../lib/mensajes')
    const texto = mensajeDeEncuesta({
      persona: 'camilo torres',
      enlace: 'https://redaquiestamos.org/encuesta/abc',
    })
    expect(texto).toContain('Hola Camilo')
    expect(texto).toContain('*dos preguntas*')
    expect(texto).toContain('si no la respondes, no pasa nada')
    expect(texto).toContain('/encuesta/abc')
  })
})

describe('mensaje de pedir documentos', () => {
  it('tiene saltos de línea, negrita en los documentos y cero emojis', async () => {
    const { mensajeDePedirDocumentos } = await import('../lib/mensajes')
    const texto = mensajeDePedirDocumentos({ profesional: 'maria fernanda marin', tipo: 'general' })
    expect(texto).toContain('Hola Maria')
    expect(texto.split('\n').length).toBeGreaterThan(5)
    expect(texto).toContain('*tarjeta profesional*')
    expect(texto).toContain('seguridad de todos')
    expect(/[\u{1F300}-\u{1FAFF}]/u.test(texto)).toBe(false)
  })

  it('cada variante pide exactamente lo suyo', async () => {
    const { mensajeDePedirDocumentos } = await import('../lib/mensajes')
    const graduado = mensajeDePedirDocumentos({ profesional: 'Ana', tipo: 'graduado' })
    expect(graduado).toContain('*tarjeta profesional* (foto o PDF) y su número')
    expect(graduado).not.toContain('certificado de estudios')
    const estudiante = mensajeDePedirDocumentos({ profesional: 'Ana', tipo: 'estudiante' })
    expect(estudiante).toContain('*certificado de estudios*')
    expect(estudiante).not.toContain('tarjeta profesional*')
    const conEnlace = mensajeDePedirDocumentos({
      profesional: 'Ana',
      enlace: 'https://redaquiestamos.org/documentos/abc',
    })
    expect(conEnlace).toContain('/documentos/abc')
    expect(conEnlace).toContain('*documento de identidad*')
    expect(conEnlace).toContain('redaquiestamos.org')
    expect(conEnlace).toContain('verificar siempre está bien')
  })
})

describe('mensajeDeCitaConfirmadaAlProfesional (Paso 10)', () => {
  it('incluye el nombre del profesional, nombre de la persona, fecha, canal preferido y enlace seguro', async () => {
    const { mensajeDeCitaConfirmadaAlProfesional } = await import('../lib/mensajes')
    const texto = mensajeDeCitaConfirmadaAlProfesional({
      profesional: 'Roberto Gómez',
      persona: 'María Camila Restrepo',
      cuando: 'jueves, 28 de agosto a las 4:00 p. m.',
      modalidad: 'VIRTUAL',
      canalContacto: 'WHATSAPP',
      enlace: 'https://redaquiestamos.org/portal/caso/p-123',
      consentimientoFirmado: true,
    })

    expect(texto).toContain('Hola Roberto')
    expect(texto).toContain('María')
    expect(texto).toContain('jueves, 28 de agosto a las 4:00 p. m.')
    expect(texto).toContain('*Modalidad:* virtual')
    expect(texto).toContain('*Canal preferido de la persona:* WhatsApp')
    expect(texto).toContain('*Consentimiento informado:* Firmado por la persona')

    /**
     * Y si NO está firmado, tiene que decirlo.
     *
     * Esa línea era texto fijo: afirmaba «Firmado por la persona» sin mirar el
     * dato, en el mismo caso en el que el tablero marcaba que faltaba. El
     * profesional la lee, no lo pide, y la sesión ocurre sin consentimiento
     * registrado.
     *
     * Es un fallo silencioso por partida doble: nada se rompe, y lo que se
     * pierde solo se echa en falta el día que alguien pregunte qué se firmó.
     */
    const sinFirmar = mensajeDeCitaConfirmadaAlProfesional({
      profesional: 'Roberto Gómez',
      persona: 'María Camila Restrepo',
      cuando: 'jueves, 28 de agosto a las 4:00 p. m.',
      enlace: 'https://redaquiestamos.org/portal/caso/p-123',
    })
    expect(sinFirmar).not.toContain('Firmado por la persona')
    expect(sinFirmar).toMatch(/TODAVÍA NO lo ha firmado/)
    expect(sinFirmar).toMatch(/Pídeselo antes de empezar/)
    expect(texto).toContain('Tú das el primer paso')
    expect(texto).toContain('unos *15 minutos antes* de la cita')
    expect(texto).toContain('Compromiso y puntualidad')
    expect(texto).toContain('https://redaquiestamos.org/portal/caso/p-123')
    expect(texto).toContain('confirmando que lo recibiste')
    expect(/[\u{1F300}-\u{1FAFF}]/u.test(texto)).toBe(false)
  })

  it('soporta llamada telefónica y correo como canales preferidos', async () => {
    const { mensajeDeCitaConfirmadaAlProfesional } = await import('../lib/mensajes')
    const llamada = mensajeDeCitaConfirmadaAlProfesional({
      profesional: 'Laura',
      persona: 'Carlos',
      cuando: 'viernes 10:00 a. m.',
      canalContacto: 'LLAMADA',
      enlace: 'https://redaquiestamos.org/portal/caso/p-456',
    })
    expect(llamada).toContain('*Canal preferido de la persona:* llamada telefónica')
    expect(llamada).toContain('por llamada telefónica unos *15 minutos antes*')

    const correo = mensajeDeCitaConfirmadaAlProfesional({
      profesional: 'Laura',
      persona: 'Carlos',
      cuando: 'viernes 10:00 a. m.',
      canalContacto: 'CORREO',
      enlace: 'https://redaquiestamos.org/portal/caso/p-456',
    })
    expect(correo).toContain('*Canal preferido de la persona:* correo electrónico')
    expect(correo).toContain('por correo electrónico unos *15 minutos antes*')
  })
})

describe('mensajeDeConsentimientoFirmadoALaPersona (Paso 9b)', () => {
  it('confirma a la persona que el consentimiento fue recibido y que la contactarán 15 min antes', async () => {
    const { mensajeDeConsentimientoFirmadoALaPersona } = await import('../lib/mensajes')
    const texto = mensajeDeConsentimientoFirmadoALaPersona({
      persona: 'Pierangely',
      profesional: 'Andrés Gómez',
      cuando: 'lunes, 24 de agosto a las 3:00 p. m.',
      modalidad: 'PRESENCIAL',
    })

    expect(texto).toContain('Hola Pierangely')
    expect(texto).toContain('confirmamos que recibimos tu consentimiento informado firmado')
    expect(texto).toContain('*Con:* Andrés Gómez')
    expect(texto).toContain('*Cuándo:* lunes, 24 de agosto a las 3:00 p. m.')
    expect(texto).toContain('*Modalidad:* presencial')
    expect(texto).toContain('Andrés se pondrá en contacto contigo unos *15 minutos antes*')
    expect(/[\u{1F300}-\u{1FAFF}]/u.test(texto)).toBe(false)
  })
})

describe('mensajeDePedirNuevaDisponibilidadAlProfesional', () => {
  it('solicita al profesional sus nuevos días y horas disponibles tras un imprevisto', async () => {
    const { mensajeDePedirNuevaDisponibilidadAlProfesional } = await import('../lib/mensajes')
    const texto = mensajeDePedirNuevaDisponibilidadAlProfesional({
      profesional: 'Andrés Gómez',
      persona: 'Pierangely',
      cuandoAnterior: 'miércoles, 26 de agosto a las 3:00 p. m.',
      enlace: 'https://redaquiestamos.org/portal/caso/p-123',
    })

    expect(texto).toContain('Hola Andrés')
    expect(texto).toContain('Pierangely')
    expect(texto).toContain('miércoles, 26 de agosto a las 3:00 p. m.')
    expect(texto).toContain('qué otros días y horas tienes disponibles')
    expect(texto).toContain('https://redaquiestamos.org/portal/caso/p-123')
    expect(texto).toContain('¡Muchas gracias por tu compromiso!')
    expect(/[\u{1F300}-\u{1FAFF}]/u.test(texto)).toBe(false)
  })
})

describe('mensajeDeExcusasYReagendamiento', () => {
  it('incluye disculpas, motivo de cambio de agenda, nuevos horarios y mantiene el tono empático', async () => {
    const { mensajeDeExcusasYReagendamiento } = await import('../lib/mensajes')
    const texto = mensajeDeExcusasYReagendamiento({
      persona: 'Pierangely',
      profesional: 'Andrés Gómez',
      cuandoAnterior: 'miércoles, 26 de agosto a las 3:00 p. m.',
      motivo: 'un compromiso médico personal de última hora',
      dias: ['JUEVES', 'VIERNES'],
      franjas: ['TARDE'],
      nota: 'puede a la misma hora 3:00 p. m.',
    })

    expect(texto).toContain('Hola Pierangely')
    expect(texto).toContain('Queremos pedirte una disculpa sincera')
    expect(texto).toContain('un compromiso médico personal de última hora')
    expect(texto).toContain('miércoles, 26 de agosto a las 3:00 p. m.')
    expect(texto).toContain('Andrés sigue a cargo de tu acompañamiento')
    expect(texto).toContain('jueves y viernes')
    expect(texto).toContain('tarde')
    expect(texto).toContain('puede a la misma hora 3:00 p. m.')
    expect(texto).toContain('*¿Cuál de estos espacios te sirve mejor?*')
    expect(texto).toContain('Muchas gracias por tu comprensión y paciencia')
    expect(/[\u{1F300}-\u{1FAFF}]/u.test(texto)).toBe(false)
  })
})

describe('mensajeDePedirFeedbackALaPersona', () => {
  it('genera el mensaje correcto para pedir retroalimentación de la sesión', async () => {
    const { mensajeDePedirFeedbackALaPersona } = await import('../lib/mensajes')
    const texto = mensajeDePedirFeedbackALaPersona({
      persona: 'Camila Morales',
      profesional: 'Mauricio Zambrano',
      enlace: 'https://redaquiestamos.org/experiencia/token-123',
    })

    expect(texto).toContain('Hola Camila')
    expect(texto).toContain('Mauricio')
    expect(texto).toContain('https://redaquiestamos.org/experiencia/token-123')
    expect(texto).toContain('completamente confidencial')
    expect(/[\u{1F300}-\u{1FAFF}]/u.test(texto)).toBe(false)
  })
})

describe('mensajeRecordatorioPrevioCitaProfesional', () => {
  it('genera el recordatorio previo a la cita correctamente', async () => {
    const { mensajeRecordatorioPrevioCitaProfesional } = await import('../lib/mensajes')
    const texto = mensajeRecordatorioPrevioCitaProfesional({
      profesional: 'Carolina Benavides',
      cuando: 'hoy a las 4:00 p. m.',
      modalidad: 'VIRTUAL',
      enlaceCaso: 'https://redaquiestamos.org/portal/caso/xyz-789',
    })

    expect(texto).toContain('Hola Carolina')
    expect(texto).toContain('hoy a las 4:00 p. m.')
    expect(texto).toContain('virtual')
    expect(texto).toContain('https://redaquiestamos.org/portal/caso/xyz-789')
    expect(texto).toContain('Red Aquí Estamos')
    expect(/[\u{1F300}-\u{1FAFF}]/u.test(texto)).toBe(false)
  })
})




describe('mensajeDeCitaConfirmada con enlace de videollamada', () => {
  it('incluye el enlace de videollamada si está disponible', () => {
    const texto = mensajeDeCitaConfirmada({
      persona: 'Carlos Morales',
      profesional: 'Dra. Laura Vega',
      cuando: 'Martes 18 de agosto a las 3:00 p. m.',
      modalidad: 'VIRTUAL',
      enlaceReunion: 'https://meet.jit.si/AquiEstamos-Sesion-12345678',
    })
    expect(texto).toContain('https://meet.jit.si/AquiEstamos-Sesion-12345678')
    expect(texto).toContain('solo debes hacer clic en el enlace de videollamada')
  })
})

/**
 * La plantilla dice «en modalidad *{modalidad}*». Con el valor crudo salía
 * «*VIRTUAL*»: el nombre interno del campo, a gritos, en el teléfono de alguien.
 * El texto de respaldo ya lo ponía en minúscula; el camino de la plantilla no.
 * La misma regla escrita en dos sitios, y solo uno se enteró — dos veces, una
 * por cada recordatorio.
 */
describe('la modalidad en los recordatorios previos', () => {
  const plantilla = 'Sesión {cuando} en modalidad *{modalidad}*.'

  it('al profesional va en minúscula, no como el nombre del campo', () => {
    const texto = mensajeRecordatorioPrevioCitaProfesional({
      plantilla,
      profesional: 'Andres Mauricio Zambrano',
      cuando: 'mañana',
      modalidad: 'VIRTUAL',
    })
    expect(texto).toContain('*virtual*')
    expect(texto).not.toContain('VIRTUAL')
  })

  it('a la persona también', () => {
    const texto = mensajeRecordatorioPrevioCitaPersona({
      plantilla,
      persona: 'Pierangely',
      profesional: 'Andres Mauricio Zambrano',
      cuando: 'mañana',
      modalidad: 'PRESENCIAL',
    })
    expect(texto).toContain('*presencial*')
    expect(texto).not.toContain('PRESENCIAL')
  })
})
