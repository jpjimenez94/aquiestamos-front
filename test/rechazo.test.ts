import { describe, it, expect } from 'vitest'
import { pasoConError, rechazoDelServidor } from '../components/forms/rechazo'
import { es } from '../lib/i18n/diccionarios/es'
import { en } from '../lib/i18n/diccionarios/en'
import { pt } from '../lib/i18n/diccionarios/pt'

/**
 * Lo que ve la persona cuando el servidor rechaza su formulario.
 *
 * El servidor contesta en español. Eso está bien en la versión en español y
 * está mal en las otras dos: una frase que no se entiende, debajo de un campo,
 * en el momento en que algo ya salió mal.
 */

const RESPUESTA = {
  success: false,
  message: 'Revisa los datos del formulario',
  details: { phone: 'Número de celular no válido', email: 'Correo no válido' },
}

describe('el rechazo del servidor, en español', () => {
  it('enseña lo que dijo el servidor, que es lo más preciso', () => {
    expect(rechazoDelServidor(es.formularios.comun, RESPUESTA, 'respaldo')).toEqual({
      campos: { phone: 'Número de celular no válido', email: 'Correo no válido' },
      mensaje: 'Revisa los datos del formulario',
    })
  })

  it('usa la frase de respaldo si el servidor no dijo nada', () => {
    expect(rechazoDelServidor(es.formularios.comun, {}, 'respaldo')).toEqual({
      campos: {},
      mensaje: 'respaldo',
    })
  })
})

describe.each([
  ['en', en],
  ['pt', pt],
] as const)('el rechazo del servidor, en «%s»', (_idioma, traduccion) => {
  const comun = traduccion.formularios.comun

  it('no enseña la frase en español del servidor', () => {
    const { campos, mensaje } = rechazoDelServidor(comun, RESPUESTA, 'respaldo')
    const todo = [mensaje, ...Object.values(campos)].join(' ')
    expect(todo).not.toMatch(/Número|Revisa los datos|Correo no válido/)
  })

  it('marca igualmente los campos que fallaron, para saber dónde mirar', () => {
    const { campos } = rechazoDelServidor(comun, RESPUESTA, 'respaldo')
    expect(Object.keys(campos).sort()).toEqual(['email', 'phone'])
    expect(campos.phone).toBe(comun.errorCampo)
  })

  it('explica el fallo en su idioma', () => {
    expect(rechazoDelServidor(comun, RESPUESTA, 'respaldo').mensaje).toBe(comun.errorServidor)
  })
})

describe('el rechazo del servidor, cuando la respuesta viene rota', () => {
  it.each([null, undefined, 'texto', 42, { details: 'no es un objeto' }, { details: null }])(
    'no se cae con %j',
    (respuesta) => {
      expect(rechazoDelServidor(es.formularios.comun, respuesta, 'respaldo')).toEqual({
        campos: {},
        mensaje: 'respaldo',
      })
    },
  )

  it('descarta los detalles que no son texto', () => {
    const { campos } = rechazoDelServidor(
      es.formularios.comun,
      { details: { phone: 'Mal', otro: { anidado: true }, vacio: null } },
      'respaldo',
    )
    expect(campos).toEqual({ phone: 'Mal' })
  })
})

describe('a qué paso hay que volver', () => {
  const PASOS = { name: 1, phone: 1, city: 1, distress: 2, howSoon: 2 } as const

  it('vuelve al paso donde está el campo rechazado', () => {
    expect(pasoConError({ phone: 'Mal' }, PASOS)).toBe(1)
    expect(pasoConError({ howSoon: 'Mal' }, PASOS)).toBe(2)
  })

  it('con varios rechazos, vuelve al primero: se corrige en el orden en que se pregunta', () => {
    expect(pasoConError({ howSoon: 'Mal', phone: 'Mal' }, PASOS)).toBe(1)
  })

  it('no mueve a nadie si lo rechazado está en el paso desde el que se envía', () => {
    // Los campos del último paso no están en el mapa: ya se están viendo.
    expect(pasoConError({ dataConsent: 'Falta' }, PASOS)).toBeNull()
    expect(pasoConError({}, PASOS)).toBeNull()
  })

  it('no se deja engañar por un campo que se llame como algo que todo objeto trae', () => {
    expect(pasoConError({ toString: 'Mal', constructor: 'Mal' }, PASOS)).toBeNull()
  })
})
