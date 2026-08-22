import { describe, it, expect } from 'vitest'
import {
  mensajeDeAsignacion,
  enlaceWhatsapp,
  mensajeDeTamizaje,
  numeroDePregunta,
  PREGUNTAS_TAMIZAJE,
  GUIA_DE_PRIORIDAD,
  REGLAS_DE_LECTURA,
  LINEA_DE_CRISIS,
  respuestasParaLaApi,
  respuestaDeRiesgo,
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

describe('mensaje de asignación', () => {
  it('saluda por el nombre de pila, no por el nombre completo', () => {
    expect(mensajeDeAsignacion(base)).toContain('Hola Ana,')
    expect(mensajeDeAsignacion(base)).not.toContain('Pérez Gómez')
  })

  it('enumera los días como se dicen', () => {
    expect(mensajeDeAsignacion(base)).toContain('lunes, miércoles y viernes en la tarde')
  })

  it('no incluye días ni modalidad cuando no se declararon', () => {
    const texto = mensajeDeAsignacion({ ...base, dias: [], franjas: [], modalidad: null })
    expect(texto).not.toContain('Puede ')
    expect(texto).not.toContain('Prefiere')
    // Pero el enlace y las instrucciones siguen ahí: es lo que hace útil el
    // mensaje aunque falten datos.
    expect(texto).toContain(base.enlace)
  })

  /**
   * Lo que de verdad importa: el mensaje viaja por WhatsApp, fuera de la
   * protección del enlace. Si algún día alguien añade el nombre o el teléfono
   * de la persona acompañada, esta prueba tiene que fallar.
   */
  it('no filtra datos de contacto de la persona acompañada', () => {
    const texto = mensajeDeAsignacion(base)
    expect(texto).not.toMatch(/\d{7,}/)
    expect(texto.toLowerCase()).not.toContain('teléfono')
  })

  it('cambia la urgencia según la prioridad', () => {
    expect(mensajeDeAsignacion({ ...base, prioridad: 'ALTA' })).toContain('hoy mismo')
    expect(mensajeDeAsignacion({ ...base, prioridad: 'BAJA' })).toContain('esta semana')
  })

  it('pide siempre responder por el enlace', () => {
    const texto = mensajeDeAsignacion(base)
    expect(texto).toContain('cuéntanos cómo te fue desde ese mismo enlace')
    expect(texto).toContain('confidencial')
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
    expect(texto).toContain('Confírmanos por aquí cuando las hayas respondido')
    expect(texto).toContain('lo más pronto posible')
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
    expect(texto).toContain('no es tu psicólogo')
  })

  it('aguanta un nombre vacío sin dejar el saludo a medias', () => {
    expect(mensajeDeTamizaje({ nombre: '   ', enlace })).toContain('Hola hola,')
  })
})

describe('respuestas del tamizaje', () => {
  const todas = {
    seguridad: 'SI',
    intensidad: '4',
    sueno: 'MAS_O_MENOS',
    funcionamiento: 'CON_DIFICULTAD',
    red: 'NO',
    riesgo: 'NO',
    urgencia: 'ESTA_SEMANA',
  } as const

  it('traduce lo que se tocó en pantalla a lo que espera la API', () => {
    expect(respuestasParaLaApi(todas)).toEqual({
      safePlace: true,
      distress: 4,
      sleepAndEat: 'MAS_O_MENOS',
      dailyFunction: 'CON_DIFICULTAD',
      hasSupport: false,
      selfHarmThoughts: false,
      howSoon: 'ESTA_SEMANA',
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
    expect(respuestaDeRiesgo({ riesgo: 'NO' })).toBe(false)
    expect(respuestaDeRiesgo({ riesgo: 'SI' })).toBe(true)
    expect(respuestaDeRiesgo({ seguridad: 'NO' })).toBe(true)
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
    expect(numeroDePregunta('riesgo')).toBe(PREGUNTAS_TAMIZAJE.length - 1)
    expect(numeroDePregunta('urgencia')).toBe(PREGUNTAS_TAMIZAJE.length)
  })

  it('la señal de riesgo manda sola a prioridad alta', () => {
    const alta = GUIA_DE_PRIORIDAD.find((n) => n.prioridad === 'ALTA')
    expect(alta?.senales.some((s) => s.includes('ya es ALTA'))).toBe(true)
  })

  it('ante la duda se sube la prioridad, no se baja', () => {
    expect(REGLAS_DE_LECTURA.join(' ')).toContain('sube la prioridad')
  })
})
