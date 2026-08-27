'use client'

import { useMemo, useState } from 'react'
import { ordenar, paginar, type Direccion, type Extractor } from './tabla'

/**
 * Ordenar y paginar una tabla del portal.
 *
 * Las siete tablas repetían el mismo bloque: un `useMemo` para ordenar, el
 * cálculo de páginas, el recorte, y el ajuste de la página cuando se sale del
 * rango. Copiado siete veces y ya divergido: seis ordenaban con
 * `localeCompare('es')` y una comparaba con `<`, así que en el directorio de
 * colaboradores los apellidos con tilde caían al final de la lista.
 *
 * Lo que este hook NO se lleva son los filtros. Cada tabla filtra por cosas
 * distintas —cupo, tarjeta verificada, prioridad, rango de fechas— y forzarlas
 * a una forma común convertiría siete bloques legibles en una abstracción que
 * hay que descifrar. La regla es llevarse lo que YA era igual, no igualar lo
 * que es distinto.
 *
 * Se le pasa la lista ya filtrada:
 *
 *     const filtrada = useMemo(() => datos.filter(...), [deps])
 *     const t = useTabla(filtrada, {
 *       orden: { nombre: (p) => p.fullName, ciudad: (p) => p.city },
 *       inicial: { columna: 'nombre', direccion: 'asc' },
 *     })
 */
export type OpcionesTabla<T, C extends string> = {
  /** Por qué valor ordena cada columna. */
  orden: Record<C, Extractor<T>>
  inicial: { columna: C; direccion?: Direccion }
  porPagina?: number
}

export function useTabla<T, C extends string>(
  lista: T[],
  { orden, inicial, porPagina: porPaginaInicial = 25 }: OpcionesTabla<T, C>,
) {
  const [columnaOrden, setColumnaOrden] = useState<C>(inicial.columna)
  const [direccion, setDireccion] = useState<Direccion>(inicial.direccion ?? 'asc')
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(porPaginaInicial)

  const ordenada = useMemo(
    () => ordenar(lista, orden[columnaOrden], direccion),
    // `orden` es un objeto literal que cambia de identidad en cada render, así
    // que se depende de la COLUMNA y no del objeto. Si se pusiera `orden`,
    // este memo no serviría de nada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lista, columnaOrden, direccion],
  )

  // `paginar` ajusta la página al rango: al filtrar estando en la página 5, si
  // solo quedan dos, te lleva a la última en vez de enseñar una tabla vacía
  // que se lee como «no hay resultados».
  const pagina_ = paginar(ordenada, pagina, porPagina)

  /**
   * Pulsar una columna: si ya ordenabas por ella, invierte; si no, ordena por
   * ella desde el principio y vuelve a la página 1 —quedarse en la página 4 de
   * un orden nuevo no significa nada.
   */
  function alternarOrden(columna: C) {
    if (columna === columnaOrden) {
      setDireccion((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setColumnaOrden(columna)
      setDireccion('asc')
    }
    setPagina(1)
  }

  return {
    filas: pagina_.filas,
    total: pagina_.total,
    totalPaginas: pagina_.totalPaginas,
    pagina: pagina_.pagina,
    desde: pagina_.desde,
    hasta: pagina_.hasta,
    setPagina,
    porPagina,
    setPorPagina,
    columnaOrden,
    direccion,
    alternarOrden,
  }
}
