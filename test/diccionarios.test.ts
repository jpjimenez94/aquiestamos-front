import { describe, it, expect } from 'vitest'
import { es } from '../lib/i18n/diccionarios/es'
import { en } from '../lib/i18n/diccionarios/en'
import { pt } from '../lib/i18n/diccionarios/pt'
import { enlacesDe } from '../lib/i18n/textoRico'
import { CASILLAS, LINEAS_EMERGENCIA } from '../lib/consentimiento'

/**
 * Los tres diccionarios dicen lo mismo.
 *
 * El compilador ya obliga a que `en.ts` y `pt.ts` tengan las mismas claves que
 * `es.ts`. Lo que no puede ver es lo que va DENTRO de las frases, y ahí es
 * donde una traducción se rompe sin que nada falle:
 *
 *   · una `{variable}` mal copiada sale en pantalla con sus llaves;
 *   · un enlace que se pierde al traducir deja a la persona sin la política
 *     de datos justo en el idioma en que más la necesita;
 *   · una lista con un elemento de menos descuadra los pasos del formulario;
 *   · una frase que se quedó sin traducir aparece en español en mitad de una
 *     página en inglés.
 *
 * Nada de eso lo ve el typecheck ni el build: son cadenas. Lo ve esto.
 */

const TRADUCCIONES = { en, pt } as const

/**
 * Frases que SOLO existen en las traducciones: avisos de que el texto que
 * vale es el español, de que los libros no están traducidos, de que el
 * servidor contesta en español. En `es.ts` van vacías a propósito.
 */
const SOLO_EN_TRADUCCIONES = new Set([
  'avisos.traduccion',
  'avisos.verOriginal',
  'avisos.fueraDeColombia',
  'avisos.atencionEnEspanol',
  'avisos.redEnEspanol',
  'formularios.comun.errorCampo',
  'formularios.comun.errorServidor',
  'recursos.soloEnEspanol',
  'recursos.notaIdioma',
])

/**
 * Frases que pueden ir vacías en los tres idiomas porque son opcionales: la
 * aclaración de un enlace del menú («Recursos» no lleva) y el distintivo de
 * una pregunta frecuente (no todas tienen).
 */
const OPCIONALES = [/^nav\.enlaces\.\w+\.aclaracion$/, /^preguntas\.items\.[\w-]+\.distintivo$/]
const esOpcional = (ruta: string) => OPCIONALES.some((regla) => regla.test(ruta))

/**
 * Lo que la base de datos trae en español y las traducciones sobrescriben por
 * `slug`. En español no hay nada que sobrescribir, así que no se comparan
 * clave a clave con él: se comparan el inglés y el portugués entre sí.
 */
const SOBRESCRITOS = new Set(['recursos.categorias', 'recursos.libros'])

/**
 * Frases que se escriben igual en español y en otro idioma, y no por olvido.
 * Lo que no esté aquí y coincida letra por letra con el español se da por no
 * traducido.
 */
const IGUALES_A_PROPOSITO: Record<keyof typeof TRADUCCIONES, RegExp[]> = {
  en: [],
  // «Recursos para todos» se dice exactamente así en portugués.
  pt: [/^inicio\.tarjetas\.recursos\.titulo$/, /^recursos\.meta\.titulo$/, /^recursos\.titulo$/],
}

type Hoja = { ruta: string; valor: string }

/** Todas las frases de un diccionario, con la ruta de claves que lleva a cada una. */
function hojas(nodo: unknown, ruta = ''): Hoja[] {
  if (typeof nodo === 'string') return [{ ruta, valor: nodo }]
  if (Array.isArray(nodo)) return nodo.flatMap((hijo, i) => hojas(hijo, `${ruta}[${i}]`))
  if (nodo && typeof nodo === 'object') {
    return Object.entries(nodo).flatMap(([clave, hijo]) =>
      SOBRESCRITOS.has(ruta ? `${ruta}.${clave}` : clave)
        ? []
        : hojas(hijo, ruta ? `${ruta}.${clave}` : clave),
    )
  }
  return []
}

/** La forma de un diccionario sin sus frases: qué es lista, qué es objeto y de qué tamaño. */
function forma(nodo: unknown, ruta = ''): string[] {
  if (Array.isArray(nodo)) {
    return [`${ruta}: lista de ${nodo.length}`, ...nodo.flatMap((h, i) => forma(h, `${ruta}[${i}]`))]
  }
  if (nodo && typeof nodo === 'object') {
    return Object.entries(nodo).flatMap(([clave, hijo]) => {
      const siguiente = ruta ? `${ruta}.${clave}` : clave
      return SOBRESCRITOS.has(siguiente) ? [] : [`${siguiente}: ${tipo(hijo)}`, ...forma(hijo, siguiente)]
    })
  }
  return []
}

function tipo(nodo: unknown): string {
  if (Array.isArray(nodo)) return 'lista'
  return nodo === null ? 'null' : typeof nodo
}

const variables = (frase: string) => [...frase.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

const HOJAS_ES = hojas(es)
const POR_RUTA_ES = new Map(HOJAS_ES.map((h) => [h.ruta, h.valor]))

describe('el diccionario español', () => {
  it('tiene frases (el recorrido ve lo que debe ver)', () => {
    // Si esto baja a cero, el escáner dejó de mirar y todo lo demás pasaría en falso.
    expect(HOJAS_ES.length).toBeGreaterThan(400)
  })

  it('solo deja vacío lo opcional y lo que es exclusivo de las traducciones', () => {
    const vacias = HOJAS_ES.filter((h) => h.valor.trim() === '' && !esOpcional(h.ruta))
    expect(vacias.map((h) => h.ruta).sort()).toEqual([...SOLO_EN_TRADUCCIONES].sort())
  })

  it('toma las casillas de autorización de donde viven, sin copiarlas', () => {
    // Cada versión publicada de estas frases es la prueba de qué aceptó cada
    // persona. Una copia en el diccionario podría cambiar sin cambiar la versión.
    const c = es.formularios.comun.casillas
    expect(c.atencion).toBe(CASILLAS.atencion)
    expect(c.datos).toBe(CASILLAS.datos)
    expect(c.sensiblesProfesional).toBe(CASILLAS.sensiblesProfesional)
    expect(c.representante).toBe(CASILLAS.representante)
    expect(c.comunicaciones).toBe(CASILLAS.comunicaciones)
  })
})

describe.each(Object.entries(TRADUCCIONES))('la traducción «%s»', (idioma, traduccion) => {
  const HOJAS = hojas(traduccion)

  it('tiene la misma forma que el español: mismas listas, del mismo tamaño', () => {
    expect(forma(traduccion)).toEqual(forma(es))
  })

  it('no deja ninguna frase vacía', () => {
    // Lo opcional puede ir vacío, pero solo donde el español también lo deja:
    // un distintivo que en español existe y aquí no es una frase perdida.
    const vacias = HOJAS.filter((h) => {
      if (h.valor.trim() !== '') return false
      return !(esOpcional(h.ruta) && (POR_RUTA_ES.get(h.ruta) ?? '').trim() === '')
    })
    expect(vacias.map((h) => h.ruta)).toEqual([])
  })

  it('no se inventa lo que el español deja vacío', () => {
    const sobrantes = HOJAS.filter(
      (h) => esOpcional(h.ruta) && h.valor.trim() !== '' && (POR_RUTA_ES.get(h.ruta) ?? '').trim() === '',
    )
    expect(sobrantes.map((h) => h.ruta)).toEqual([])
  })

  it('usa las mismas {variables} que el español en cada frase', () => {
    const distintas = HOJAS.filter((h) => {
      const original = POR_RUTA_ES.get(h.ruta) ?? ''
      // Lo que en español no existe no tiene con qué compararse.
      if (SOLO_EN_TRADUCCIONES.has(h.ruta)) return false
      return variables(h.valor).join() !== variables(original).join()
    })
    expect(
      distintas.map((h) => `${h.ruta}: ${variables(h.valor)} ≠ ${variables(POR_RUTA_ES.get(h.ruta) ?? '')}`),
    ).toEqual([])
  })

  it('conserva los enlaces del español, a los mismos destinos', () => {
    const distintas = HOJAS.filter((h) => {
      if (SOLO_EN_TRADUCCIONES.has(h.ruta)) return false
      const original = enlacesDe(POR_RUTA_ES.get(h.ruta) ?? '').sort()
      return enlacesDe(h.valor).sort().join() !== original.join()
    })
    expect(distintas.map((h) => h.ruta)).toEqual([])
  })

  it('escribe los enlaces internos sin prefijo de idioma', () => {
    // El prefijo lo pone `ruta()` al pintar. Un `/en/…` escrito a mano saldría
    // como `/en/en/…`.
    const conPrefijo = HOJAS.filter((h) =>
      enlacesDe(h.valor).some((destino) => /^\/(en|pt|es)(\/|$)/.test(destino)),
    )
    expect(conPrefijo.map((h) => h.ruta)).toEqual([])
  })

  it('cierra cada negrita que abre', () => {
    const descuadradas = HOJAS.filter((h) => (h.valor.match(/\*\*/g) ?? []).length % 2 !== 0)
    expect(descuadradas.map((h) => h.ruta)).toEqual([])
  })

  it('no arrastra puntuación del español', () => {
    const conSignos = HOJAS.filter((h) => /[¿¡]/.test(h.valor))
    expect(conSignos.map((h) => h.ruta)).toEqual([])
  })

  it('no deja frases sin traducir', () => {
    const sinTraducir = HOJAS.filter((h) => {
      const original = POR_RUTA_ES.get(h.ruta)
      if (original === undefined || h.valor !== original) return false
      // Una sola palabra puede coincidir por casualidad («Virtual», «No»).
      // Una frase entera igual, letra por letra, es una frase olvidada.
      if (!/\p{L}{2,}\s+\p{L}{2,}\s+\p{L}{2,}/u.test(h.valor)) return false
      return !IGUALES_A_PROPOSITO[idioma as keyof typeof TRADUCCIONES].some((regla) =>
        regla.test(h.ruta),
      )
    })
    expect(sinTraducir.map((h) => `${h.ruta}: ${h.valor}`)).toEqual([])
  })

  it('dice lo esencial en la autorización de datos de salud', () => {
    // Lo mismo que se le exige a la casilla en español (test/consentimiento):
    // que diga que el dato es sensible, que nadie está obligado a darlo y a
    // quién se le autoriza. Una traducción que lo suavice deja de ser la
    // misma autorización.
    const casilla = traduccion.formularios.comun.casillas.atencion
    expect(casilla).toMatch(/Red Aquí Estamos/)
    expect(casilla).toMatch(idioma === 'en' ? /sensitive/i : /sensível/i)
    expect(casilla).toMatch(idioma === 'en' ? /not obliged/i : /não sou obrigad/i)
    expect(casilla.length).toBeGreaterThan(80)
  })

  it('nombra todas las líneas de emergencia', () => {
    // Los números viven en `lib/consentimiento.ts`; el diccionario solo pone
    // el nombre. Una línea nueva sin nombre aquí saldría en español.
    const nombres = traduccion.consentimiento.lineas as Record<string, string>
    for (const linea of LINEAS_EMERGENCIA) {
      expect(nombres[linea.numero], `falta el nombre de la línea ${linea.numero}`).toBeTruthy()
    }
  })

  it('avisa de lo que en español no hace falta avisar', () => {
    for (const ruta of SOLO_EN_TRADUCCIONES) {
      const hoja = HOJAS.find((h) => h.ruta === ruta)
      expect(hoja?.valor.trim(), `${ruta} está vacía`).toBeTruthy()
    }
  })
})

describe('lo que las traducciones sobrescriben de la base de datos', () => {
  it('es lo mismo en inglés y en portugués', () => {
    // Un libro traducido a un idioma y no al otro no rompe nada —sale en
    // español—, pero casi siempre es un olvido.
    expect(Object.keys(en.recursos.libros).sort()).toEqual(Object.keys(pt.recursos.libros).sort())
    expect(Object.keys(en.recursos.categorias).sort()).toEqual(
      Object.keys(pt.recursos.categorias).sort(),
    )
  })

  it('no deja títulos ni descripciones a medias', () => {
    for (const traduccion of [en, pt]) {
      for (const [slug, libro] of Object.entries(traduccion.recursos.libros)) {
        expect(libro.descripcion.trim(), `descripción de ${slug}`).toBeTruthy()
      }
      for (const [slug, nombre] of Object.entries(traduccion.recursos.categorias)) {
        expect(nombre.trim(), `categoría ${slug}`).toBeTruthy()
      }
    }
  })
})
