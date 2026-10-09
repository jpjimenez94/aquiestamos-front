import { describe, it, expect } from 'vitest'
import {
  alternativas,
  equivalente,
  estaTraducida,
  idiomaDeRuta,
  idiomaPreferido,
  rellenar,
  ruta,
  sinPrefijo,
} from '../lib/i18n/idiomas'
import { enlacesDe, partes, textoPlano } from '../lib/i18n/textoRico'

/**
 * Las direcciones del sitio en cada idioma.
 *
 * Todo enlace interno del sitio público pasa por `ruta()`, y el selector de
 * idioma por `equivalente()`. Si alguna de las dos se equivoca no falla nada:
 * la persona acaba en una página en otro idioma, o en un 404, y solo se nota
 * navegando.
 */

describe('la dirección de una ruta en un idioma', () => {
  it('deja el español donde ha estado siempre, sin prefijo', () => {
    // Estas direcciones están en mensajes de WhatsApp ya enviados.
    expect(ruta('es', '/')).toBe('/')
    expect(ruta('es', '/atencion-psicologica')).toBe('/atencion-psicologica')
    expect(ruta('es', '/#preguntas-frecuentes')).toBe('/#preguntas-frecuentes')
  })

  it('cuelga los demás idiomas de su prefijo', () => {
    expect(ruta('en', '/recursos')).toBe('/en/recursos')
    expect(ruta('pt', '/recursos/el-monstruo')).toBe('/pt/recursos/el-monstruo')
  })

  it('no deja una barra colgando en la portada', () => {
    expect(ruta('en', '/')).toBe('/en')
    expect(ruta('pt', '/')).toBe('/pt')
  })

  it('conserva el ancla y la consulta', () => {
    expect(ruta('en', '/#preguntas-frecuentes')).toBe('/en#preguntas-frecuentes')
    expect(ruta('pt', '/quiero-ser-parte#formulario')).toBe('/pt/quiero-ser-parte#formulario')
    expect(ruta('en', '/recursos?categoria=duelo')).toBe('/en/recursos?categoria=duelo')
  })

  it('no toca lo que no es una ruta del sitio', () => {
    for (const destino of ['https://wa.me/573102186299', 'tel:106', '#formulario', '//otro.sitio']) {
      expect(ruta('en', destino)).toBe(destino)
    }
  })
})

describe('de qué idioma es una dirección', () => {
  it('mira el primer tramo entero, no el principio de la cadena', () => {
    expect(idiomaDeRuta('/en')).toBe('en')
    expect(idiomaDeRuta('/en/recursos')).toBe('en')
    expect(idiomaDeRuta('/pt/quiero-apoyar')).toBe('pt')
    // «/entrar» y «/portal» empiezan como un idioma y no lo son.
    expect(idiomaDeRuta('/entrar')).toBe('es')
    expect(idiomaDeRuta('/portal/entrar')).toBe('es')
    expect(idiomaDeRuta('/ptolomeo')).toBe('es')
  })

  it('da español para lo que no lleva prefijo, y para nada', () => {
    expect(idiomaDeRuta('/')).toBe('es')
    expect(idiomaDeRuta('/recursos')).toBe('es')
    expect(idiomaDeRuta(null)).toBe('es')
    expect(idiomaDeRuta(undefined)).toBe('es')
  })

  it('le quita el prefijo a una dirección', () => {
    expect(sinPrefijo('/en')).toBe('/')
    expect(sinPrefijo('/en/recursos')).toBe('/recursos')
    expect(sinPrefijo('/pt/recursos/el-monstruo')).toBe('/recursos/el-monstruo')
    expect(sinPrefijo('/recursos')).toBe('/recursos')
    expect(sinPrefijo('/entrar')).toBe('/entrar')
    expect(sinPrefijo(null)).toBe('/')
  })
})

describe('a dónde lleva el selector de idioma', () => {
  it('lleva a la misma página en el otro idioma', () => {
    expect(equivalente('/politica-de-datos', 'en')).toBe('/en/politica-de-datos')
    expect(equivalente('/en/politica-de-datos', 'pt')).toBe('/pt/politica-de-datos')
    expect(equivalente('/pt/politica-de-datos', 'es')).toBe('/politica-de-datos')
  })

  it('lleva de portada a portada', () => {
    expect(equivalente('/', 'en')).toBe('/en')
    expect(equivalente('/en', 'es')).toBe('/')
    expect(equivalente('/pt', 'en')).toBe('/en')
  })

  it('conserva el libro que se estaba mirando', () => {
    expect(equivalente('/recursos/el-monstruo', 'pt')).toBe('/pt/recursos/el-monstruo')
  })

  it('lleva a la portada desde una página que solo existe en español', () => {
    // La confirmación de un turno no está traducida: mandar a `/en/turno/…`
    // sería mandar a un 404.
    expect(estaTraducida('/turno/abc123')).toBe(false)
    expect(equivalente('/turno/abc123', 'en')).toBe('/en')
    expect(equivalente('/portal/personas', 'pt')).toBe('/pt')
  })
})

describe('las versiones de una página para los buscadores', () => {
  it('anuncia los tres idiomas, con el portugués como brasileño', () => {
    expect(alternativas('/recursos')).toEqual({
      es: '/recursos',
      en: '/en/recursos',
      'pt-BR': '/pt/recursos',
      'x-default': '/recursos',
    })
  })
})

describe('el idioma que le conviene a alguien según su navegador', () => {
  it('respeta el orden de preferencia', () => {
    expect(idiomaPreferido(['pt-BR', 'pt', 'en'])).toBe('pt')
    expect(idiomaPreferido(['en-US', 'es'])).toBe('en')
    expect(idiomaPreferido(['es-CO', 'en'])).toBe('es')
  })

  it('mira la lengua y no el país', () => {
    expect(idiomaPreferido(['en-GB'])).toBe('en')
    expect(idiomaPreferido(['pt-PT'])).toBe('pt')
    expect(idiomaPreferido(['ES-419'])).toBe('es')
  })

  it('salta los idiomas que el sitio no tiene', () => {
    expect(idiomaPreferido(['fr-FR', 'de', 'en'])).toBe('en')
  })

  it('no propone nada a quien no lee ninguno de los tres', () => {
    expect(idiomaPreferido(['fr-FR', 'de'])).toBeNull()
    expect(idiomaPreferido([])).toBeNull()
    expect(idiomaPreferido(null)).toBeNull()
  })
})

describe('las frases con huecos', () => {
  it('rellena las variables', () => {
    expect(rellenar('Paso {paso} de 3', { paso: 2 })).toBe('Paso 2 de 3')
    expect(rellenar('{a} y {b}, y otra vez {a}', { a: 'uno', b: 'dos' })).toBe(
      'uno y dos, y otra vez uno',
    )
  })

  it('deja a la vista lo que nadie le pasó', () => {
    // Un `{nombre}` suelto en pantalla es feo y se corrige. Un hueco
    // silencioso se publica y nadie lo ve.
    expect(rellenar('Hola, {nombre}', {})).toBe('Hola, {nombre}')
    expect(rellenar('Hola, {nombre}', { nombre: null })).toBe('Hola, {nombre}')
  })

  it('acepta el cero, que también es un valor', () => {
    expect(rellenar('{n} citas', { n: 0 })).toBe('0 citas')
  })
})

describe('el formato dentro de las frases', () => {
  it('separa la negrita, el enlace y el código del texto', () => {
    expect(partes('Hola **mundo**, lee [esto](/politica-de-datos) y `eso`.')).toEqual([
      { tipo: 'texto', texto: 'Hola ' },
      { tipo: 'fuerte', texto: 'mundo' },
      { tipo: 'texto', texto: ', lee ' },
      { tipo: 'enlace', texto: 'esto', href: '/politica-de-datos' },
      { tipo: 'texto', texto: ' y ' },
      { tipo: 'codigo', texto: 'eso' },
      { tipo: 'texto', texto: '.' },
    ])
  })

  it('deja intacta una frase sin formato', () => {
    expect(partes('Sin nada especial.')).toEqual([{ tipo: 'texto', texto: 'Sin nada especial.' }])
    expect(partes('')).toEqual([])
  })

  it('enseña el asterisco de una negrita que no se cerró, en vez de comerse la frase', () => {
    expect(textoPlano('Esto **no cierra')).toBe('Esto **no cierra')
  })

  it('saca los destinos de los enlaces, en orden', () => {
    expect(enlacesDe('[a](/uno) y [b](https://dos.example) y **c**')).toEqual([
      '/uno',
      'https://dos.example',
    ])
  })

  it('da la frase sin marcas, como se leería en voz alta', () => {
    expect(textoPlano('Llama al **106** o lee [la política](/politica-de-datos).')).toBe(
      'Llama al 106 o lee la política.',
    )
  })
})
