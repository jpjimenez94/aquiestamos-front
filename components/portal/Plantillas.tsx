'use client'

import { createContext, useContext } from 'react'
import type { Plantillas } from '@/lib/plantillas'

/**
 * Los textos de Parametrización, disponibles en cualquier pantalla del portal.
 *
 * Existen quince plantillas y once componentes que arman mensajes con ellas,
 * repartidos por tablas, modales y botones sueltos. Pasarlas como prop obligaba
 * a enhebrarlas por cada página intermedia, y el que se saltara una quedaba
 * mandando el texto del código en silencio: exactamente lo que pasaba antes,
 * cuando editar en el portal no cambiaba nada de lo que recibía la persona.
 *
 * Se cargan una vez en el layout y se leen donde hagan falta. Es la misma
 * lección que ya nos costó salas de video vacías y un panel de solo lectura que
 * enseñaba de más: un dato que se deriva en muchos sitios acaba diciendo cosas
 * distintas en cada uno.
 */
const Contexto = createContext<Plantillas>({})

export function PlantillasProvider({
  valor,
  children,
}: {
  valor: Plantillas
  children: React.ReactNode
}) {
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

/**
 * Devuelve `{}` si nadie las proveyó, no lanza.
 *
 * Un fallo trayendo plantillas tiene que degradar a los textos del código, no
 * dejar sin mensaje a quien está intentando cuadrar una cita.
 */
export function usePlantillas(): Plantillas {
  return useContext(Contexto)
}
