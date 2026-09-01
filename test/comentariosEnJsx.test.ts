import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Un comentario suelto entre elementos de JSX no es un comentario: es texto.
 *
 * Al renombrar una columna del tablero quedó un bloque de comentario entre dos
 * `<div>`, y el portal lo publicó tal cual: doce líneas de comentario en medio
 * de la agenda, en producción, delante de quien coordina.
 *
 * Lo peor no es el fallo: es que las dos redes que había lo dejaron pasar.
 * `tsc --noEmit` limpio y `npm run build` limpio, y con razón — en JSX, texto
 * entre elementos es válido. No hay nada que compilar mal. La única forma de
 * verlo era abrir esa pantalla y mirarla.
 *
 * Por eso vive aquí. Es la clase de fallo que no se descubre revisando el
 * código: el editor pinta el comentario en gris, como cualquier otro, y el
 * navegador lo pinta en negro.
 */

const RAIZ = ['app', 'components', 'lib']

function tsxDe(dir: string): string[] {
  const salida: string[] = []
  for (const entrada of readdirSync(dir)) {
    if (entrada === 'node_modules' || entrada.startsWith('.')) continue
    const ruta = join(dir, entrada)
    if (statSync(ruta).isDirectory()) salida.push(...tsxDe(ruta))
    else if (entrada.endsWith('.tsx')) salida.push(ruta)
  }
  return salida
}

/**
 * Los cierres que no pueden ser otra cosa que el final de un elemento.
 *
 * No basta con «la línea anterior termina en mayor-que»: así se marcaba
 * `plantillas?: Record<string, string>`, que es un tipo, no una etiqueta. Una
 * prueba que grita donde no hay nada se acaba desactivando, y entonces deja de
 * avisar también donde sí lo hay.
 */
const CIERRA_ELEMENTO = [
  /\/>$/, //            <Algo … />
  /<\/[A-Za-z][\w.-]*>$/, // </Algo>
  /["'}]>$/, //         <div className="x">  ·  <X y={z}>
  /^>$/, //             el mayor-que suelto de una etiqueta partida en líneas
]

/** Devuelve las líneas donde un comentario acabaría publicado como texto. */
export function comentariosQueSonTexto(fuente: string): number[] {
  const lineas = fuente.split('\n')
  const malos: number[] = []
  let dentroDeBloque = false

  for (let i = 0; i < lineas.length; i++) {
    const limpia = lineas[i].trim()

    if (dentroDeBloque) {
      if (limpia.includes('*/')) dentroDeBloque = false
      continue
    }
    if (!limpia.startsWith('/*')) continue
    if (!limpia.includes('*/')) dentroDeBloque = true

    // Qué había justo antes, saltando líneas en blanco.
    let j = i - 1
    while (j >= 0 && lineas[j].trim() === '') j--
    if (j < 0) continue

    const anterior = lineas[j].trim()
    if (anterior.startsWith('//')) continue
    if (CIERRA_ELEMENTO.some((patron) => patron.test(anterior))) malos.push(i + 1)
  }
  return malos
}

describe('los comentarios de JSX', () => {
  it('van entre llaves cuando están entre elementos, o se publican como texto', () => {
    const culpables: string[] = []
    for (const raiz of RAIZ) {
      for (const archivo of tsxDe(raiz)) {
        for (const n of comentariosQueSonTexto(readFileSync(archivo, 'utf8'))) {
          culpables.push(`${archivo}:${n}`)
        }
      }
    }
    expect(culpables).toEqual([])
  })

  /**
   * La prueba de la prueba. Sin esto sería un adorno que pasa siempre: tiene
   * que cazar el caso real y callarse en los tres que no lo son.
   */
  it('caza el texto y se calla con los comentarios de verdad', () => {
    const enPantalla = ['      </div>', '', '  /*', '    esto se publica', '  */'].join('\n')
    expect(comentariosQueSonTexto(enPantalla)).toEqual([3])

    const trasEtiquetaAbierta = ['  <div className="col">', '  /*', '    también', '  */'].join('\n')
    expect(comentariosQueSonTexto(trasEtiquetaAbierta)).toEqual([2])

    const enExpresion = ['  ) : cerrado ? (', '  /*', '    comentario de verdad', '  */'].join('\n')
    expect(comentariosQueSonTexto(enExpresion)).toEqual([])

    const entreAtributos = ['    disabled={cargando}', '    /*', '      comentario', '    */'].join('\n')
    expect(comentariosQueSonTexto(entreAtributos)).toEqual([])

    // Un tipo genérico termina igual que una etiqueta, y no lo es.
    const tipoGenerico = ['  plantillas?: Record<string, string>', '  /** La cita. */'].join('\n')
    expect(comentariosQueSonTexto(tipoGenerico)).toEqual([])
  })
})
