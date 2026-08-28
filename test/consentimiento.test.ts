import { describe, it, expect } from 'vitest'
import { CASILLAS, VERSION_CONSENTIMIENTO } from '../lib/consentimiento'

/**
 * Lo que una casilla tiene que decir para que valga.
 *
 * Las dos casillas de la atención psicológica se volvieron una. Juntarlas está
 * bien; vaciarlas no. La ley no pide dos casillas —pide que la autorización
 * del dato sensible sea explícita y que a la persona se le diga qué es, para
 * qué se usa y que no está obligada a darlo (Ley 1581 art. 6, Decreto 1377
 * art. 6)—. Todo eso vive ahora en una sola frase, y una frase es fácil de
 * acortar.
 *
 * Sin esto, alguien la cambia por «Acepto los términos» para que quepa mejor,
 * la pantalla se ve más limpia, nada se pone rojo, y la autorización de todas
 * las personas que entren después no sirve. No es un fallo que se vea: se ve
 * el día que alguien la pide.
 */

describe('la casilla de la atención psicológica', () => {
  it('dice que el dato es sensible', () => {
    expect(CASILLAS.atencion).toMatch(/sensible/i)
  })

  it('dice que no está obligada a darlo', () => {
    expect(CASILLAS.atencion).toMatch(/no est(oy|á) obligad/i)
  })

  it('dice para qué se usa: no vale una autorización en blanco', () => {
    expect(CASILLAS.atencion).toMatch(/acompañar|acompañamiento/i)
  })

  it('dice quién trata los datos', () => {
    expect(CASILLAS.atencion).toMatch(/Red Aquí Estamos/)
  })

  /**
   * Un «acepto los términos y condiciones» no es una autorización explícita
   * de dato sensible, por muy corta que quede la pantalla.
   */
  it('no es un «acepto los términos»', () => {
    expect(CASILLAS.atencion).not.toMatch(/términos y condiciones/i)
    expect(CASILLAS.atencion.length).toBeGreaterThan(80)
  })
})

describe('la versión del consentimiento', () => {
  /**
   * El texto cambió, así que la versión tiene que cambiar. Es lo único que
   * permite saber después qué aceptó exactamente quien se registró en agosto.
   * El backend valida esta cadena contra su propia lista: si sube aquí y no
   * allá, todos los envíos empiezan a rebotar.
   */
  it('subió al cambiar el texto', () => {
    expect(VERSION_CONSENTIMIENTO).toBe('2026-09')
  })

  it('los textos de la versión anterior se conservan intactos', () => {
    // Son la prueba de qué autorizaron las personas de 2026-08. Editarlos
    // borra esa prueba sin dejar rastro.
    expect(CASILLAS.datos).toMatch(/finalidades descritas arriba/)
    expect(CASILLAS.sensiblesAtencion).toMatch(/dato sensible de salud/)
  })
})
