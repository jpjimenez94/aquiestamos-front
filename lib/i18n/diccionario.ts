import type { Idioma } from './idiomas'
import { es, type Diccionario } from './diccionarios/es'
import { en } from './diccionarios/en'
import { pt } from './diccionarios/pt'
import { fr } from './diccionarios/fr'

/**
 * El diccionario de un idioma.
 *
 * Solo lo llaman los componentes de servidor. Los de cliente —el menú, los
 * formularios, las preguntas frecuentes— reciben por props el trozo que
 * necesitan: si importaran esto, los cuatro idiomas enteros viajarían al
 * navegador de cada visitante para enseñarle uno. Hay una prueba que lo
 * vigila (`test/i18nCliente.test.ts`).
 */
const DICCIONARIOS: Record<Idioma, Diccionario> = { es, en, pt, fr }

export function diccionario(idioma: Idioma): Diccionario {
  return DICCIONARIOS[idioma]
}

export type { Diccionario }
