import { describe, it, expect } from 'vitest'
import { comparar, ordenar, contiene, paginar } from '../lib/tabla'

/**
 * La maquinaria de las tablas del portal.
 *
 * Estas pruebas existen antes que el refactor, no después. Las siete tablas
 * son las pantallas donde se hace el trabajo diario de la fundación, y las 92
 * pruebas que había no tocaban ninguna: refactorizarlas sin esto sería a
 * ciegas.
 */

describe('ordenar texto en español', () => {
  // El fallo que originó todo esto: `TablaColaboradores` comparaba con `<`, y
  // en UTF-16 la «Á» va después de la «Z», así que todos los apellidos con
  // tilde caían al final del directorio.
  it('pone Álvarez antes que Zapata, no al final', () => {
    const apellidos = ['Zapata', 'Álvarez', 'Muñoz', 'Núñez', 'Ochoa']
    expect(ordenar(apellidos, (x) => x)).toEqual([
      'Álvarez',
      'Muñoz',
      'Núñez',
      'Ochoa',
      'Zapata',
    ])
  })

  it('la ñ va entre la n y la o, como en un diccionario', () => {
    expect(ordenar(['Ochoa', 'Muñoz', 'Nava'], (x) => x)).toEqual(['Muñoz', 'Nava', 'Ochoa'])
  })

  it('ignora mayúsculas', () => {
    expect(ordenar(['beta', 'Alfa', 'GAMMA'], (x) => x)).toEqual(['Alfa', 'beta', 'GAMMA'])
  })

  it('descendente es exactamente el reverso', () => {
    const l = ['Zapata', 'Álvarez', 'Muñoz']
    expect(ordenar(l, (x) => x, 'desc')).toEqual([...ordenar(l, (x) => x)].reverse())
  })

  it('no toca la lista original', () => {
    const l = ['b', 'a']
    ordenar(l, (x) => x)
    expect(l).toEqual(['b', 'a'])
  })
})

describe('ordenar números y fechas', () => {
  it('los números van por valor, no por texto', () => {
    // Como texto, '10' iría antes que '9'.
    expect(ordenar([9, 10, 1], (x) => x)).toEqual([1, 9, 10])
  })

  it('las fechas van cronológicamente', () => {
    const l = [new Date('2026-08-27'), new Date('2026-01-05'), new Date('2026-12-31')]
    expect(ordenar(l, (x) => x).map((d) => d.getFullYear() + '-' + (d.getMonth() + 1))).toEqual([
      '2026-1',
      '2026-8',
      '2026-12',
    ])
  })
})

describe('los vacíos van al final', () => {
  // Una fila sin dato no es «la primera»: es la que no se sabe. Ponerla arriba
  // hace que lo incompleto tape lo que sí está.
  it('null, undefined y cadena vacía se van al fondo', () => {
    const filas = [{ c: null }, { c: 'Bogotá' }, { c: undefined }, { c: '' }, { c: 'Armenia' }]
    expect(ordenar(filas, (f) => f.c).map((f) => f.c)).toEqual([
      'Armenia',
      'Bogotá',
      null,
      undefined,
      '',
    ])
  })

  it('siguen al final también en descendente', () => {
    const filas = [{ c: null }, { c: 'Bogotá' }, { c: 'Armenia' }]
    const desc = ordenar(filas, (f) => f.c, 'desc').map((f) => f.c)
    expect(desc[0]).toBe(null)
  })
})

describe('buscar sin pelear con las tildes', () => {
  // Quien escribe en el portal está copiando de un WhatsApp o escribiendo de
  // memoria. Exigirle la tilde exacta convierte la búsqueda en una lotería.
  it('«Nunez» encuentra a «Núñez»', () => {
    expect(contiene('María Núñez', 'nunez')).toBe(true)
  })

  it('y «Núñez» también encuentra a «Nunez»', () => {
    expect(contiene('Maria Nunez', 'Núñez')).toBe(true)
  })

  it('ignora mayúsculas', () => {
    expect(contiene('Bogotá', 'BOGOTA')).toBe(true)
  })

  it('una búsqueda vacía no filtra nada', () => {
    expect(contiene('lo que sea', '')).toBe(true)
  })

  it('un valor ausente no revienta', () => {
    expect(contiene(null, 'algo')).toBe(false)
    expect(contiene(undefined, 'algo')).toBe(false)
  })

  it('sigue sin encontrar lo que no está', () => {
    expect(contiene('Núñez', 'perez')).toBe(false)
  })
})

describe('paginar', () => {
  const cien = Array.from({ length: 100 }, (_, i) => i + 1)

  it('recorta la página pedida', () => {
    const r = paginar(cien, 2, 25)
    expect(r.filas[0]).toBe(26)
    expect(r.filas).toHaveLength(25)
    expect(r.desde).toBe(26)
    expect(r.hasta).toBe(50)
  })

  it('la última página puede venir corta', () => {
    const r = paginar(cien.slice(0, 30), 2, 25)
    expect(r.filas).toHaveLength(5)
    expect(r.hasta).toBe(30)
  })

  // Filtras estando en la página 5, quedan dos, y la tabla sale vacía: parece
  // que el filtro no encontró nada cuando sí encontró.
  it('si la página se sale del rango, te lleva a la última', () => {
    const r = paginar(cien.slice(0, 30), 99, 25)
    expect(r.pagina).toBe(2)
    expect(r.filas).toHaveLength(5)
  })

  it('una lista vacía no rompe ni deja la página en cero', () => {
    const r = paginar([], 1, 25)
    expect(r.filas).toEqual([])
    expect(r.total).toBe(0)
    expect(r.totalPaginas).toBe(1)
    expect(r.desde).toBe(0)
    expect(r.hasta).toBe(0)
  })
})

describe('comparar, en crudo', () => {
  it('devuelve 0 para iguales', () => {
    expect(comparar('a', 'a')).toBe(0)
    expect(comparar(1, 1)).toBe(0)
    expect(comparar(null, undefined)).toBe(0)
  })

  it('los booleanos: false antes que true', () => {
    expect(comparar(false, true)).toBeLessThan(0)
  })
})
