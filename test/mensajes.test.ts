import { describe, it, expect } from 'vitest'
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
   * El cambio de fondo: este mensaje PREGUNTA, no anuncia. Antes decía "te
   * asignamos un acompañamiento", como si aceptar fuera automático, y el
   * profesional es voluntario y puede no poder.
   */
  it('pregunta si puede, en vez de darlo por hecho', () => {
    const texto = mensajeDePropuesta(base)
    expect(texto).toContain('Mira si puedes tomarlo')
    expect(texto).not.toContain('Te asignamos')
  })

  it('le pide responder por el enlace, no por WhatsApp', () => {
    const texto = mensajeDePropuesta(base)
    expect(texto).toContain(base.enlace)
    expect(texto).toContain('los días y las horas en las que podrías')
  })

  it('le dice que los datos de la persona se abren solo si acepta', () => {
    const texto = mensajeDePropuesta(base)
    expect(texto).toContain('aparecen cuando aceptas, no antes')
    expect(texto).toContain('confidencial')
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

  it('pide que confirmen cuando hayan respondido', () => {
    expect(texto).toContain('avísanos por aquí')
    expect(texto).toContain('lo antes posible')
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
    expect(texto).toContain('No es un diagnóstico')
    expect(texto).toContain('No es un diagnóstico ni una evaluación')
    expect(texto).toContain('no hay respuestas buenas o malas')
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

  it('lleva la línea de crisis: sigue habiendo alguien esperando ayuda', () => {
    expect(texto).toContain(LINEA_DE_CRISIS)
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

  it('saluda por el nombre de pila y lleva el enlace completo', () => {
    expect(texto).toContain('Hola Camilo')
    expect(texto).toContain('con Juan')
    expect(texto).toContain('https://redaquiestamos.org/consentimiento/abc.def')
  })

  it('dice que es requisito, sin sonar a amenaza', () => {
    expect(texto).toContain('Es el paso que nos permite empezar')
    expect(texto).toContain('escríbenos por aquí')
  })

  it('lleva la línea de crisis, como todo mensaje a la persona', () => {
    expect(texto).toContain('123')
    expect(texto).toContain('106')
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

  it('el de la persona pregunta sin reprochar y lleva la línea de crisis', async () => {
    const { mensajeDeSeguimientoALaPersona } = await import('../lib/mensajes')
    const texto = mensajeDeSeguimientoALaPersona({
      persona: 'camilo torres',
      profesional: 'Ana María Pérez',
    })
    expect(texto).toContain('Hola Camilo')
    expect(texto).toContain('¿ya pudiste hablar con Ana')
    expect(texto).toContain('123')
    expect(texto).toContain('106')
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
  it('agradece, deja claro que es opcional y lleva la línea de crisis', async () => {
    const { mensajeDeEncuesta } = await import('../lib/mensajes')
    const texto = mensajeDeEncuesta({
      persona: 'camilo torres',
      enlace: 'https://redaquiestamos.org/encuesta/abc',
    })
    expect(texto).toContain('Hola Camilo')
    expect(texto).toContain('*dos preguntas*')
    expect(texto).toContain('si no la respondes, no pasa nada')
    expect(texto).toContain('/encuesta/abc')
    expect(texto).toContain('123')
    expect(texto).toContain('106')
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
    expect(conEnlace).toContain('seguridad más alta')
  })
})
