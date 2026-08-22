'use client'

import { useState } from 'react'
import { ChevronDown, Clock } from 'lucide-react'
import { enBogota } from '@/lib/fechas'

export type RespuestaTamizaje = {
  id: string
  prioridadSugerida: 'ALTA' | 'MEDIA' | 'BAJA'
  prioridadLegible: string
  razones: string[]
  respondidoEn: string
}

/**
 * Lo que respondió y en qué prioridad quedó.
 *
 * Nadie elige aquí: cuando la persona responde, el sistema calcula la
 * prioridad y la admite sola. Esta celda es la explicación de esa decisión, y
 * por eso las razones importan: son lo que permite darse cuenta de que hay
 * algo que las siete preguntas no recogieron.
 *
 * «Sin responder» se marca en ámbar y no en gris porque es trabajo pendiente:
 * conviene volver a escribirle. Pero ya no es un callejón sin salida — el
 * sistema la admite sola al cabo de unos días, y la celda dice cuántos faltan
 * para que nadie tenga que acordarse de vigilarla.
 *
 * Las respuestas pregunta por pregunta no llegan hasta aquí: el backend solo
 * se las devuelve a la administración, porque son datos de salud y la razón
 * ya dice lo que hay que saber para actuar.
 */
export function ResultadoTamizaje({
  respuesta,
  diasParaAdmision,
  yaAdmitida,
}: {
  respuesta: RespuestaTamizaje | null
  diasParaAdmision: number | null
  yaAdmitida: boolean
}) {
  const [abierto, setAbierto] = useState(false)

  if (!respuesta) {
    return (
      <div className="tamizaje-celda">
        <span className="tamizaje-sin-responder">
          <Clock size={12} />
          Sin responder
        </span>
        <span className="tabla__secundario" style={{ marginTop: 4 }}>
          {yaAdmitida
            ? 'Entró sola sin haber respondido. Vale la pena llamarla.'
            : diasParaAdmision === null
              ? null
              : diasParaAdmision === 0
                ? 'Entra sola en la próxima revisión.'
                : `Si no responde, entra sola en ${diasParaAdmision} ${
                    diasParaAdmision === 1 ? 'día' : 'días'
                  }.`}
        </span>
      </div>
    )
  }

  return (
    <div className="tamizaje-celda">
      <button
        className="tamizaje-celda__resumen"
        type="button"
        aria-expanded={abierto}
        title="Ver por qué quedó en esta prioridad"
        onClick={() => setAbierto((v) => !v)}
      >
        <span className="etiqueta" data-tono={TONO[respuesta.prioridadSugerida]}>
          {respuesta.prioridadLegible}
        </span>
        <ChevronDown
          size={13}
          style={{ transform: abierto ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
        />
      </button>

      {abierto ? (
        <div className="tamizaje-celda__detalle">
          <ul className="tamizaje__senales">
            {respuesta.razones.map((razon) => (
              <li key={razon}>{razon}</li>
            ))}
          </ul>
          <p className="tabla__secundario" style={{ marginTop: 8 }}>
            Respondió el {enBogota(respuesta.respondidoEn)}. Quedó admitida con esta prioridad y ya
            se le puede buscar profesional.
          </p>
        </div>
      ) : null}
    </div>
  )
}

const TONO: Record<string, string> = { ALTA: 'rojo', MEDIA: 'ambar', BAJA: 'verde' }
