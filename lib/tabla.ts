/**
 * La maquinaria común de las tablas del portal: filtrar, ordenar, paginar.
 *
 * Las siete tablas del portal —solicitudes, personas, profesionales,
 * colaboradores, postulaciones, líderes y auditoría— suman más de 5.000 líneas
 * y todas repiten el mismo esqueleto: unos cuantos `filtroX`, una columna de
 * orden, una dirección, una página, y dos `useMemo` encadenados.
 *
 * Que se repita sería solo aburrido. El problema es que las copias divergen:
 * seis ordenaban con `localeCompare('es')` y una comparaba con `<`, así que en
 * el directorio de colaboradores todos los apellidos con tilde caían al final
 * de la lista. Es el mismo patrón que puso al profesional en una sala vacía y
 * que dejó ver el tamizaje completo a una cuenta de solo lectura: una regla
 * derivada en varios sitios, separándose sin que nadie se entere.
 *
 * Estas funciones son puras y viven fuera de React a propósito: así se pueden
 * probar sin montar un componente, que es lo que hace que la red de seguridad
 * exista de verdad.
 */

/** Cómo se saca el valor por el que se ordena o se filtra, de cada fila. */
export type Extractor<T> = (fila: T) => unknown

export type Direccion = 'asc' | 'desc'

/**
 * Compara dos valores para ordenar.
 *
 * El texto va SIEMPRE por `localeCompare` en español: es lo que pone «Álvarez»
 * antes que «Zapata» y no al revés. Los números y las fechas se restan. Los
 * vacíos van al final en orden ascendente, porque una fila sin dato no es «la
 * primera», es la que no se sabe.
 */
export function comparar(a: unknown, b: unknown): number {
  const aVacio = a === null || a === undefined || a === ''
  const bVacio = b === null || b === undefined || b === ''
  if (aVacio && bVacio) return 0
  if (aVacio) return 1
  if (bVacio) return -1

  if (a instanceof Date || b instanceof Date) {
    return new Date(a as Date).getTime() - new Date(b as Date).getTime()
  }
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b)

  return String(a).localeCompare(String(b), 'es', { sensitivity: 'base' })
}

/** Ordena una lista por un extractor, sin tocar la original. */
export function ordenar<T>(lista: T[], valor: Extractor<T>, direccion: Direccion = 'asc'): T[] {
  const orden = [...lista].sort((a, b) => comparar(valor(a), valor(b)))
  return direccion === 'asc' ? orden : orden.reverse()
}

/**
 * ¿Contiene este texto lo que se busca, ignorando tildes y mayúsculas?
 *
 * Buscar «Nunez» tiene que encontrar a «Núñez». Quien escribe en el portal
 * suele estar copiando de un WhatsApp o escribiendo de memoria, y exigirle la
 * tilde exacta convierte una búsqueda en una lotería.
 */
export function contiene(texto: unknown, buscado: string): boolean {
  if (!buscado) return true
  // `normalize('NFD')` separa la tilde de su letra y `\p{Diacritic}` se lleva
  // las tildes sueltas. Se usa la propiedad Unicode y no un rango de códigos a
  // propósito: un rango se escribe con caracteres invisibles que cualquier
  // copiar-pegar pierde sin avisar, y el filtro dejaría de funcionar en
  // silencio.
  const limpiar = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
  return limpiar(String(texto ?? '')).includes(limpiar(buscado))
}

/**
 * Recorta la página pedida y devuelve además los totales.
 *
 * Ajusta la página al rango: si estabas en la 5 y un filtro deja dos páginas,
 * te lleva a la última en vez de enseñarte una tabla vacía que parece un error.
 */
export function paginar<T>(lista: T[], pagina: number, porPagina: number) {
  const total = lista.length
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina))
  const paginaAjustada = Math.min(Math.max(1, pagina), totalPaginas)
  const inicio = (paginaAjustada - 1) * porPagina

  return {
    filas: lista.slice(inicio, inicio + porPagina),
    total,
    totalPaginas,
    pagina: paginaAjustada,
    desde: total === 0 ? 0 : inicio + 1,
    hasta: Math.min(inicio + porPagina, total),
  }
}
