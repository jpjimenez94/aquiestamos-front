import { describe, it, expect } from 'vitest'
import { nombrePropio, nombreDePila } from '../lib/nombre'

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
