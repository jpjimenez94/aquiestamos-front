import { BookOpen, Users } from 'lucide-react'
import { VIDEOS_CAPACITACION } from '@/lib/capacitacion'
import { Reproductor } from './Reproductor'

/**
 * La parte audiovisual de «Cómo funciona la red».
 *
 * Nació como página aparte y estaba mal: quien entra nuevo no tiene por qué
 * saber que lo que busca —cómo se hace esto— está repartido en dos sitios del
 * menú. Aquí arriba, antes del mapa de procesos, es el orden natural: primero
 * lo ves contado, y debajo tienes el detalle de cada etapa para consultarlo.
 *
 * Los vídeos NO se publican en YouTube ni en ningún sitio abierto. Son
 * grabaciones de Meet con las caras y los nombres de quienes estaban en la
 * llamada, y en alguna se cuela una notificación de WhatsApp con nombres del
 * grupo de operaciones: viven en el Drive de la fundación y se ven aquí, que
 * es una pantalla con sesión.
 */
export function SeccionCapacitacion() {
  if (VIDEOS_CAPACITACION.length === 0) return null

  return (
    <section className="capacitacion" id="capacitacion">
      <div className="capacitacion__intro">
        <h2 className="capacitacion__encabezado">Míralo contado</h2>
        <p className="capacitacion__bajada">
          Las sesiones grabadas del equipo. Para ver de una vez al entrar, y para volver cuando
          algo no cuadre. Debajo, el mismo recorrido por escrito, etapa por etapa.
        </p>
      </div>

      <div className="capacitacion__lista">
        {VIDEOS_CAPACITACION.map((v) => (
          <article className="capacitacion__ficha" id={v.id} key={v.id}>
            <Reproductor drive={v.drive} titulo={v.titulo} />
            <div className="capacitacion__texto">
              <span className="capacitacion__para">
                <Users size={13} aria-hidden />
                {v.para}
              </span>
              <h3 className="capacitacion__titulo">{v.titulo}</h3>
              <p className="capacitacion__resumen">{v.resumen}</p>

            {v.momentos?.length ? (
              <ul className="capacitacion__momentos">
                {v.momentos.map((m) => (
                  <li key={m.minuto}>
                    <strong>{m.minuto}</strong> {m.que}
                  </li>
                ))}
              </ul>
            ) : null}

            {v.capitulo ? (
              <a
                className="boton-mini"
                href={`/api/portal/manual-operativo#${v.capitulo.ancla}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BookOpen size={14} />
                Lo mismo por escrito · {v.capitulo.texto}
              </a>
            ) : null}
            </div>
          </article>
        ))}
      </div>

      <p className="capacitacion__aviso">
        Estas grabaciones son internas: se ven las caras y los nombres de quienes estaban en la
        sesión. No las publiques ni las reenvíes fuera de la red — para eso están aquí, detrás
        de la contraseña del portal.
      </p>
    </section>
  )
}
