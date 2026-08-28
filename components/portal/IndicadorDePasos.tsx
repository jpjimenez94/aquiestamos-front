import { PASOS_DEL_CASO, type PasoDelCaso } from '@/lib/pasosDelCaso'

/**
 * El camino completo del acompañamiento, con el paso actual encendido.
 *
 * Va arriba de la ficha de la persona Y del detalle de la cita, y esa es su
 * razón de ser: las dos pantallas enseñaban trozos numerados de un manual que
 * no estaba escrito en ninguna parte (1·2·3 en una, 7·8·9·10 en la otra), y
 * quien agendaba no tenía forma de saber que eran el mismo camino.
 *
 * Con la misma tira en las dos, la ficha y la cita dejan de parecer dos
 * procesos: son dos ventanas al mismo, cada una dueña de sus pasos.
 */
export function IndicadorDePasos({ actual }: { actual: PasoDelCaso }) {
  return (
    <ol className="pasos" aria-label={`Paso ${actual.n} de 7: ${actual.titulo}`}>
      {PASOS_DEL_CASO.map((paso) => {
        const estado = paso.n < actual.n ? 'hecho' : paso.n === actual.n ? 'actual' : 'pendiente'
        return (
          <li key={paso.n} className="pasos__paso" data-estado={estado}>
            <span className="pasos__numero" aria-hidden>
              {paso.n}
            </span>
            <span className="pasos__titulo">{paso.titulo}</span>
          </li>
        )
      })}
    </ol>
  )
}
