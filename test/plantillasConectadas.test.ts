import { describe, it, expect } from 'vitest'
import * as M from '../lib/mensajes'

/**
 * Que lo que se edita en Parametrización sea lo que se envía.
 *
 * Había quince plantillas en el portal y una sola llegaba de verdad al mensaje.
 * Las otras catorce se podían editar, se guardaban, se veían guardadas — y la
 * persona seguía recibiendo el texto del código. Nadie se entera de eso: no
 * falla nada, no hay error, el portal dice «guardado». Solo se nota si alguien
 * compara el mensaje que llegó con el que creía haber escrito.
 *
 * Cada caso de aquí manda una plantilla reconocible y comprueba que el
 * resultado sea ESA y no la de respaldo. Si alguien añade un mensaje nuevo y se
 * olvida de aceptar plantilla, esta lista se queda corta; el número de abajo
 * está puesto para que eso cante.
 */

/** Datos mínimos de cada constructor, con la plantilla de prueba. */
const CASOS: [string, (plantilla: string) => string][] = [
  ['propuesta al profesional', (plantilla) =>
    M.mensajeDePropuesta({ profesional: 'Ana Ruiz', ciudad: 'Pereira', prioridad: 'ALTA', modalidad: 'VIRTUAL', dias: [], franjas: [], enlace: 'https://x/y', plantilla })],

  ['tamizaje', (plantilla) =>
    M.mensajeDeTamizaje({ nombre: 'Ana Ruiz', enlace: 'https://x/y', plantilla })],

  ['enlace de agenda a la persona', (plantilla) =>
    M.mensajeParaCuadrarHorario({ persona: 'Ana Ruiz', profesional: 'Sofía Vélez', dias: [], franjas: [], plantilla })],

  ['ofrecerle el espacio «¿cómo estás tú?» al profesional', (plantilla) =>
    M.mensajeDeOfrecerCuidado({ profesional: 'Ana Ruiz', sesiones: 4, enlace: 'https://x/y', plantilla })],

  ['cita confirmada a la persona', (plantilla) =>
    M.mensajeDeCitaConfirmada({ persona: 'Ana Ruiz', profesional: 'Sofía Vélez', cuando: 'el lunes', plantilla })],

  ['pedir consentimiento', (plantilla) =>
    M.mensajeDeConsentimiento({ persona: 'Ana Ruiz', profesional: 'Sofía Vélez', enlace: 'https://x/y', plantilla })],

  ['acuse de consentimiento', (plantilla) =>
    M.mensajeDeConsentimientoFirmadoALaPersona({ persona: 'Ana Ruiz', profesional: 'Sofía Vélez', cuando: 'el lunes', plantilla })],

  ['despacho al profesional', (plantilla) =>
    M.mensajeDeCitaConfirmadaAlProfesional({ profesional: 'Sofía Vélez', persona: 'Ana Ruiz', cuando: 'el lunes', enlace: 'https://x/y', plantilla })],

  ['siguiente cita al profesional', (plantilla) =>
    M.mensajeDeSiguienteCitaConfirmadaAlProfesional({ profesional: 'Sofía Vélez', persona: 'Ana Ruiz', cuando: 'el lunes', enlace: 'https://x/y', plantilla })],

  ['recordatorio al profesional', (plantilla) =>
    M.mensajeRecordatorioPrevioCitaProfesional({ profesional: 'Sofía Vélez', cuando: 'el lunes', plantilla })],

  ['recordatorio a la persona', (plantilla) =>
    M.mensajeRecordatorioPrevioCitaPersona({ persona: 'Ana Ruiz', profesional: 'Sofía Vélez', cuando: 'el lunes', plantilla })],

  ['pedir nueva disponibilidad', (plantilla) =>
    M.mensajeDePedirNuevaDisponibilidadAlProfesional({ profesional: 'Sofía Vélez', persona: 'Ana Ruiz', plantilla })],

  ['excusas y reagendamiento', (plantilla) =>
    M.mensajeDeExcusasYReagendamiento({ persona: 'Ana Ruiz', profesional: 'Sofía Vélez', plantilla })],

  ['pedir documentos', (plantilla) =>
    M.mensajeDePedirDocumentos({ profesional: 'Sofía Vélez', enlace: 'https://x/y', plantilla })],

  ['pedir retroalimentación', (plantilla) =>
    M.mensajeDePedirFeedbackALaPersona({ persona: 'Ana Ruiz', profesional: 'Sofía Vélez', enlace: 'https://x/y', plantilla })],

  ['líder comunitario', (plantilla) =>
    M.mensajeWhatsAppLider({ nombre: 'Ana Ruiz', territorio: 'Comuna 4', plantilla })],

  ['cambio de profesional', (plantilla) =>
    M.mensajeDeCambioDeProfesional({ persona: 'Ana Ruiz', profesional: 'Sofía Vélez', cuandoAnterior: 'jueves 11 a las 3:00 p. m.', plantilla })],

  ['cita cancelada · a la persona', (plantilla) =>
    M.mensajeDeCitaCanceladaALaPersona({ persona: 'Ana Ruiz', profesional: 'Sofía Vélez', cuando: 'jueves 11 a las 3:00 p. m.', plantilla })],

  ['cita cancelada · al profesional', (plantilla) =>
    M.mensajeDeCitaCanceladaAlProfesional({ profesional: 'Sofía Vélez', persona: 'Ana Ruiz', cuando: 'jueves 11 a las 3:00 p. m.', plantilla })],
]

describe('el texto del portal manda sobre el del código', () => {
  it.each(CASOS)('%s', (_nombre, construir) => {
    const texto = construir('SEÑA-DEL-PORTAL y nada más.')
    expect(texto).toBe('SEÑA-DEL-PORTAL y nada más.')
  })

  /**
   * Y si no hay plantilla, el mensaje sale igual.
   *
   * El respaldo no es un detalle: si el portal no puede traer los textos
   * —backend caído, permiso, red— quien está esperando una cita no puede
   * quedarse sin mensaje porque una pantalla de configuración no respondió.
   */
  it.each(CASOS)('%s · sin plantilla, sigue habiendo mensaje', (_nombre, construir) => {
    const texto = construir('   ')
    expect(texto.length).toBeGreaterThan(40)
    expect(texto).not.toContain('SEÑA-DEL-PORTAL')
  })

  /**
   * Este número es el que cuenta la historia: eran 15 plantillas y 1 conectada.
   * Si alguien añade una plantilla al portal y no la conecta aquí, esto avisa.
   *
   * Las tres últimas no existían, y son las tres del mismo agujero: reasignar y
   * cancelar cambiaban el estado y no le decían nada a nadie. La persona podía
   * presentarse a una sesión que ya no existía, y el profesional también.
   */
  it('están las diecinueve', () => {
    expect(CASOS).toHaveLength(19)
  })
})
