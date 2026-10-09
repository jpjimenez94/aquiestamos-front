import { describe, it, expect } from 'vitest'
import { nombrePropio, nombreDePila, nombreValido } from '../lib/nombre'

/**
 * El formulario recibe el nombre como lo teclea quien pide ayuda. Estas
 * pruebas fijan qué se corrige al mostrarlo y, sobre todo, qué NO: un apellido
 * escrito a propósito con la mayúscula adentro no es un error que arreglar.
 */

describe('nombre propio', () => {
  it('arregla lo que el teclado del teléfono se comió', () => {
    expect(nombrePropio('juan pablo')).toBe('Juan Pablo')
    expect(nombrePropio('MARIA LOPEZ')).toBe('Maria Lopez')
    expect(nombrePropio('  ana   sofía  ')).toBe('Ana Sofía')
  })

  it('deja las partículas en minúscula, salvo que abran el nombre', () => {
    expect(nombrePropio('juan de la cruz')).toBe('Juan de la Cruz')
    expect(nombrePropio('maría del pilar gómez')).toBe('María del Pilar Gómez')
    expect(nombrePropio('de la torre')).toBe('De la Torre')
  })

  it('no toca los apellidos que llevan la mayúscula adentro a propósito', () => {
    expect(nombrePropio('Cody McKinley')).toBe('Cody McKinley')
    expect(nombrePropio('Ana DiCaprio')).toBe('Ana DiCaprio')
  })

  it('vuelve a empezar después de un guion o un apóstrofo', () => {
    expect(nombrePropio('ana-maría pérez')).toBe('Ana-María Pérez')
    expect(nombrePropio("shannon o'connor")).toBe("Shannon O'Connor")
  })

  it('no se cae con lo que no hay', () => {
    expect(nombrePropio('')).toBe('')
    expect(nombrePropio(null)).toBe('')
    expect(nombrePropio(undefined)).toBe('')
  })
})

describe('nombre de pila', () => {
  it('saluda con el primer nombre, ya escrito como se debe', () => {
    expect(nombreDePila('juan pablo jiménez')).toBe('Juan')
    expect(nombreDePila('MARIA LOPEZ')).toBe('Maria')
  })

  it('devuelve vacío si no hay nombre, para que quien llama decida el respaldo', () => {
    expect(nombreDePila('')).toBe('')
    expect(nombreDePila(null)).toBe('')
  })
})

describe('lo que puede ser el nombre de una persona', () => {
  it('acepta los nombres de siempre', () => {
    expect(nombreValido('Laura Sofía Morales')).toBe(true)
    expect(nombreValido('juan pablo jiménez de la cruz')).toBe(true)
    expect(nombreValido('Ñuñoa Peña')).toBe(true)
  })

  it('acepta letras que el español no tiene', () => {
    // La regla anterior solo conocía á, é, í, ó, ú y ñ: con ella nadie de
    // Brasil podía postularse desde la versión en portugués.
    for (const nombre of ['João Gonçalves', 'Conceição Araújo', 'Zoë Müller', 'Søren Åberg', 'Łukasz']) {
      expect(nombreValido(nombre), nombre).toBe(true)
    }
  })

  it('acepta apóstrofos, guiones y la inicial con su punto', () => {
    for (const nombre of ["Shannon O'Connor", 'Shannon O’Connor', 'Ana-María Pérez', 'María J. Rojas']) {
      expect(nombreValido(nombre), nombre).toBe(true)
    }
  })

  it('acepta las tildes que llegan sueltas, como las manda algún teclado', () => {
    // «é» escrita como «e» + tilde combinatoria: se ve igual y son dos signos.
    expect(nombreValido('Jose\u0301 Pe\u0301rez')).toBe(true)
  })

  it('rechaza lo que suele ser otro dato en la casilla equivocada', () => {
    for (const nombre of ['3001234567', 'ana@correo.com', 'Ana 2', 'Ana_María', 'Ana (mamá)']) {
      expect(nombreValido(nombre), nombre).toBe(false)
    }
  })

  it('rechaza lo que no tiene ninguna letra', () => {
    for (const nombre of ['', '   ', '...', '-', "'"]) {
      expect(nombreValido(nombre), JSON.stringify(nombre)).toBe(false)
    }
    expect(nombreValido(null)).toBe(false)
    expect(nombreValido(undefined)).toBe(false)
  })
})
