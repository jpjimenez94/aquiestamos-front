import { redirect } from 'next/navigation'
import { BookOpen, Users } from 'lucide-react'
import { usuarioActual } from '@/lib/portal'
import { Cabecera } from '../componentes'
import { VIDEOS_CAPACITACION } from '@/lib/capacitacion'
import { Reproductor } from './Reproductor'
import './capacitacion.css'

export const metadata = { title: 'Capacitación' }

/**
 * CAPACITACIÓN
 *
 * Las grabaciones de las sesiones con las que se explica la operación. Es la
 * página que se le manda a alguien que entra: «mira esto antes del lunes».
 *
 * Cualquiera que haya iniciado sesión la ve, como el manual: esconderle a un
 * voluntario cómo funciona la red no protege nada y le complica el primer día.
 *
 * Los vídeos NO se publican en YouTube ni en ningún sitio abierto. Son
 * grabaciones de Meet con las caras y los nombres de quienes estaban en la
 * llamada, y en alguna se cuela una notificación de WhatsApp con nombres del
 * grupo de operaciones: viven en el Drive de la fundación y se ven aquí, que
 * es una pantalla con sesión.
 */
export default async function CapacitacionPage() {
  const usuario = await usuarioActual()
  if (!usuario) redirect('/portal/entrar?volver=/portal/capacitacion')

  return (
    <>
      <Cabecera
        titulo="Capacitación"
        descripcion="Las sesiones grabadas del equipo. Para ver de una vez al entrar, y para volver cuando algo no cuadre."
      />

      <div className="capacitacion">
        {VIDEOS_CAPACITACION.map((v) => (
          <article className="capacitacion__ficha" id={v.id} key={v.id}>
            <div className="capacitacion__texto">
              <span className="capacitacion__para">
                <Users size={13} aria-hidden />
                {v.para}
              </span>
              <h2 className="capacitacion__titulo">{v.titulo}</h2>
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

            <Reproductor drive={v.drive} titulo={v.titulo} />
          </article>
        ))}
      </div>

      <p className="capacitacion__aviso">
        Estas grabaciones son internas: se ven las caras y los nombres de quienes estaban en la
        sesión. No las publiques ni las reenvíes fuera de la red — para eso están aquí, detrás
        de la contraseña del portal.
      </p>
    </>
  )
}
