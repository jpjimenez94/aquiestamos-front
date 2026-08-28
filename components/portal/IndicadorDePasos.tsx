'use client'

import { useState } from 'react'
import { PASOS_DEL_CASO, type PasoDelCaso } from '@/lib/pasosDelCaso'

/**
 * El camino completo del acompañamiento: el paso actual encendido, y cada
 * paso se puede abrir para ver qué pasó en él.
 *
 * Va arriba de la ficha de la persona Y del detalle de la cita. Las dos
 * pantallas enseñaban trozos numerados de un manual que no estaba escrito en
 * ninguna parte (1·2·3 en una, 7·8·9·10 en la otra); con la misma tira en las
 * dos dejan de parecer dos procesos.
 *
 * `hechos` son siete listas de líneas —una por paso— con lo que esta vista
 * sabe de cada uno. Lo que esta vista no sabe se enlaza a la pantalla que sí
 * (`enlaces`), en vez de callarse: la ficha manda a la cita para los pasos de
 * la sesión, la cita manda a la ficha para los del caso.
 */
export function IndicadorDePasos({
  actual,
  hechos,
  enlaces,
}: {
  actual: PasoDelCaso
  hechos?: string[][]
  enlaces?: Partial<Record<number, { href: string; texto: string }>>
}) {
  const [abierto, setAbierto] = useState<number | null>(null)

  const navegable = hechos !== undefined || enlaces !== undefined
  const paso = abierto ? PASOS_DEL_CASO[abierto - 1] : null
  const lineas = abierto && hechos ? hechos[abierto - 1] : []
  const enlace = abierto ? enlaces?.[abierto] : undefined

  return (
    <div className="pasos">
      <ol className="pasos__lista" aria-label={`Paso ${actual.n} de 7: ${actual.titulo}`}>
        {PASOS_DEL_CASO.map((p) => {
          const estado = p.n < actual.n ? 'hecho' : p.n === actual.n ? 'actual' : 'pendiente'
          const contenido = (
            <>
              <span className="pasos__numero" aria-hidden>
                {p.n}
              </span>
              <span className="pasos__titulo">{p.titulo}</span>
            </>
          )
          return (
            <li key={p.n} className="pasos__paso" data-estado={estado} data-abierto={abierto === p.n}>
              {navegable ? (
                <button
                  type="button"
                  className="pasos__boton"
                  aria-expanded={abierto === p.n}
                  onClick={() => setAbierto(abierto === p.n ? null : p.n)}
                >
                  {contenido}
                </button>
              ) : (
                contenido
              )}
            </li>
          )
        })}
      </ol>

      {paso ? (
        <div className="pasos__detalle" role="region" aria-label={`Qué pasó en: ${paso.titulo}`}>
          <strong>
            {paso.n} · {paso.titulo}
          </strong>

          {lineas.length > 0 ? (
            <ul>
              {lineas.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          ) : paso.n > actual.n ? (
            <p>Todavía no se llega a este paso.</p>
          ) : !enlace ? (
            <p>No hay nada registrado de este paso.</p>
          ) : null}

          {enlace ? (
            <a className="boton-mini" href={enlace.href}>
              {enlace.texto}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
