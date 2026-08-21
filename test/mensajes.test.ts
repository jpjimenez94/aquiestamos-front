import { describe, it, expect } from 'vitest'
import { mensajeDeAsignacion, enlaceWhatsapp } from '../lib/mensajes'

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
