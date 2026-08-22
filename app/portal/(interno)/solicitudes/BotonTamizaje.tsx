'use client'

import { useEffect, useState } from 'react'
import { Check, ClipboardList, Copy, MessageCircle, X } from 'lucide-react'
import {
  mensajeDeTamizaje,
  enlaceWhatsapp,
  PREGUNTAS_TAMIZAJE,
  GUIA_DE_PRIORIDAD,
  REGLAS_DE_LECTURA,
} from '@/lib/mensajes'

/**
 * El mensaje que abre el tamizaje.
 *
 * Está al lado del botón de admitir a propósito: son el mismo momento. Primero
 * se manda el enlace, la persona responde, y con eso el sistema propone ALTA,
 * MEDIA o BAJA. La guía de lectura va en el mismo panel porque es lo que
 * permite contradecir esa propuesta con criterio en vez de a ojo.
 *
 * El texto no se escribe aquí: vive en `lib/mensajes.ts` junto con las
 * preguntas y la guía, para que los tres no se separen.
 */
export function BotonTamizaje({
  nombre,
  telefono,
  enlace,
  yaRespondio,
}: {
  nombre: string
  telefono: string | null
  enlace: string | null
  yaRespondio: boolean
}) {
  const [abierto, setAbierto] = useState(false)
  const [copiado, setCopiado] = useState(false)

  // Escape cierra, igual que en el menú lateral: quien navega con teclado no
  // debe quedar atrapado dentro del panel.
  useEffect(() => {
    if (!abierto) return

    function alPulsar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setAbierto(false)
    }

    document.addEventListener('keydown', alPulsar)
    document.body.classList.add('sin-desplazamiento')

    return () => {
      document.removeEventListener('keydown', alPulsar)
      document.body.classList.remove('sin-desplazamiento')
    }
  }, [abierto])

  if (!enlace) return null

  const mensaje = mensajeDeTamizaje({ nombre, enlace })

  // Puede ser null: el número no trae indicativo y no es colombiano, así que
  // no hay a qué país mandarlo. Copiar el mensaje sigue funcionando.
  const whatsapp = enlaceWhatsapp(telefono, mensaje)

  /**
   * Un enlace a localhost o a una vista previa no le sirve de nada a la persona
   * que lo recibe en su teléfono. Antes esto pasaba en silencio: el mensaje
   * salía, la persona lo abría y veía "este enlace ya no sirve".
   */
  const enlaceLocal = /localhost|127\.0\.0\.1|\.vercel\.app/.test(enlace)

  function copiar() {
    navigator.clipboard.writeText(mensaje)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <>
      <button
        className="boton-mini"
        type="button"
        title={
          yaRespondio
            ? 'Ya respondió. Puedes volver a mandarle el enlace si su situación cambió.'
            : 'Arma el mensaje de WhatsApp con el enlace a las preguntas'
        }
        onClick={() => setAbierto(true)}
      >
        <ClipboardList size={14} />
        {yaRespondio ? 'Reenviar' : 'Preguntar'}
      </button>

      {abierto ? (
        <div className="modal-telon" onClick={() => setAbierto(false)}>
          <div
            className="modal-caja"
            style={{ maxWidth: 620 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tamizaje-titulo"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="modal-cabecera">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClipboardList size={20} style={{ color: 'var(--color-blue)' }} />
                <h3 id="tamizaje-titulo" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                  Preguntas para saber cómo está {nombre.trim().split(/\s+/)[0]}
                </h3>
              </div>
              <button
                className="boton-icono"
                type="button"
                aria-label="Cerrar"
                onClick={() => setAbierto(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="panel__nota" style={{ marginTop: 4 }}>
              El mensaje lleva un enlace con {PREGUNTAS_TAMIZAJE.length} preguntas que se
              responden con un toque cada una. En cuanto conteste, el sistema calcula su prioridad
              y la admite sola: no hay que hacer nada más aquí. Aparece en Personas lista para que
              se le busque profesional.
            </p>

            <div className="mensaje__acciones" style={{ marginTop: 14 }}>
              {whatsapp ? (
                <a
                  className="boton-mini"
                  data-tono="principal"
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={14} />
                  Abrir WhatsApp
                </a>
              ) : (
                <span className="tabla__secundario" style={{ marginTop: 0 }}>
                  {telefono
                    ? `No sabemos a qué país corresponde «${telefono}». Copia el mensaje y mándalo aparte, o corrige el número.`
                    : 'Esta solicitud no dejó teléfono: copia el mensaje y mándalo por donde puedas.'}
                </span>
              )}
              <button className="boton-mini" type="button" onClick={copiar}>
                {copiado ? <Check size={14} /> : <Copy size={14} />}
                {copiado ? '¡Copiado!' : 'Copiar mensaje'}
              </button>
            </div>

            {enlaceLocal ? (
              <div className="aviso-portal" data-tono="rojo" style={{ marginTop: 12 }}>
                <strong>Este enlace apunta a {new URL(enlace).host} y no va a abrir en el
                teléfono de nadie.</strong> Pasa cuando el servidor tiene <code>SITIO_URL</code>{' '}
                apuntando a una máquina de desarrollo. Míralo antes de mandar el mensaje.
              </div>
            ) : null}

            <pre className="mensaje__texto">{mensaje}</pre>

            <div className="tamizaje__seccion">
              <h4 className="tamizaje__subtitulo">Cómo decide la prioridad</h4>
              <p className="panel__nota" style={{ marginTop: 0 }}>
                Esto es lo que el sistema aplica solo, sin que nadie tenga que elegir. Está aquí para que
                sepas de dónde salió la prioridad de cada persona.
              </p>
              <div className="tamizaje__guia">
                {GUIA_DE_PRIORIDAD.map((nivel) => (
                  <div
                    className="tamizaje__nivel"
                    data-prioridad={nivel.prioridad}
                    key={nivel.prioridad}
                  >
                    <div className="tamizaje__cabecera">
                      <span className="tamizaje__prioridad">{nivel.prioridad}</span>
                      <span className="tamizaje__resumen">{nivel.resumen}</span>
                    </div>
                    <ul className="tamizaje__senales">
                      {nivel.senales.map((senal) => (
                        <li key={senal}>{senal}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="tamizaje__seccion">
              <h4 className="tamizaje__subtitulo">Y por encima de todo lo anterior</h4>
              <ul className="tamizaje__senales">
                {REGLAS_DE_LECTURA.map((regla) => (
                  <li key={regla}>{regla}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button className="boton-mini" type="button" onClick={() => setAbierto(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
