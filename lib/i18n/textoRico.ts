/**
 * El poco formato que llevan las frases del diccionario.
 *
 * Los textos del sitio tienen negritas y enlaces en mitad de la frase. Si eso
 * se escribiera como JSX, cada idioma necesitaría su propio componente, y tres
 * componentes con el mismo párrafo son tres sitios donde uno puede quedarse
 * viejo sin que nada lo delate. Aquí el párrafo es una cadena y el formato va
 * dentro de ella, con tres marcas y nada más:
 *
 *   **así**            negrita
 *   [texto](/ruta)     enlace
 *   `así`              código
 *
 * Que sean cadenas tiene otra ventaja, y es la que de verdad importa: una
 * prueba puede comparar los tres idiomas y decir «en inglés falta el enlace a
 * la política de datos». Con JSX eso no se puede comprobar.
 *
 * No hay anidamiento a propósito. Con tres marcas planas, lo peor que hace una
 * frase mal escrita es enseñar un asterisco; con un intérprete de Markdown
 * completo, lo peor es bastante peor.
 */

export type Parte =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'fuerte'; texto: string }
  | { tipo: 'codigo'; texto: string }
  | { tipo: 'enlace'; texto: string; href: string }

const MARCAS = /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g

export function partes(frase: string): Parte[] {
  const resultado: Parte[] = []
  let cursor = 0

  for (const m of frase.matchAll(MARCAS)) {
    const inicio = m.index ?? 0
    if (inicio > cursor) resultado.push({ tipo: 'texto', texto: frase.slice(cursor, inicio) })

    if (m[1] !== undefined) resultado.push({ tipo: 'fuerte', texto: m[1] })
    else if (m[2] !== undefined) resultado.push({ tipo: 'codigo', texto: m[2] })
    else resultado.push({ tipo: 'enlace', texto: m[3], href: m[4] })

    cursor = inicio + m[0].length
  }

  if (cursor < frase.length) resultado.push({ tipo: 'texto', texto: frase.slice(cursor) })
  return resultado
}

/** Los destinos de los enlaces de una frase, en orden. Lo usan las pruebas. */
export function enlacesDe(frase: string): string[] {
  return partes(frase).flatMap((p) => (p.tipo === 'enlace' ? [p.href] : []))
}

/** La frase sin marcas, como se leería en voz alta. Para `aria-label` y metadatos. */
export function textoPlano(frase: string): string {
  return partes(frase)
    .map((p) => p.texto)
    .join('')
}
