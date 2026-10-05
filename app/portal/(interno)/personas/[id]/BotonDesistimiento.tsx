'use client'

import { useState } from 'react'
import { FileCheck2, HeartHandshake, X } from 'lucide-react'
import { Mensaje } from './Mensaje'
import { mensajeDeDesistimiento } from '@/lib/mensajes'
import type { Plantillas } from '@/lib/plantillas'
import { nombrePropio } from '@/lib/nombre'

/**
 * «No quiso tomar la atención»: que lo diga ella, no nosotros.
 *
 * Cerrar un caso por desistimiento ya se podía —el motivo está en «Cerrar
 * caso»— pero quedaba escrito por quien coordina: nuestra palabra sobre la
 * decisión de otra persona. Si meses después alguien pregunta por qué no se
 * la acompañó, lo único que hay es una frase que escribimos nosotros.
 *
 * Esto manda un enlace donde ella lee y acepta. Lo que queda archivado es el
 * texto ÍNTEGRO que leyó, con su versión y la fecha: eso sí se puede mostrar.
 *
 * Deliberado: desde aquí NO se cierra nada. El botón solo manda el enlace. Si
 * hay que cerrar sin ella —porque no contesta, por ejemplo— eso ya existe y es
 * «Cerrar caso», que dice claramente que la decisión fue de la red.
 */

export type Desistimiento = {
  firmadaEl: string
  nombre: string
  version: string
  motivo: string | null
} | null

const fechaLarga = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

export function BotonDesistimiento({
  nombre,
  telefono,
  enlace,
  desistimiento,
  plantillas,
}: {
  nombre: string
  telefono?: string | null
  enlace: string
  desistimiento: Desistimiento
  plantillas: Plantillas
}) {
  const [abierto, setAbierto] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const firmada = Boolean(desistimiento)

  function copiar(texto: string) {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <>
      <button
        className="boton-mini"
        type="button"
        onClick={() => setAbierto(true)}
        title={
          firmada
            ? `Dejó constancia el ${fechaLarga(desistimiento!.firmadaEl)}`
            : 'Mandarle el enlace para que confirme ella misma que no quiere continuar'
        }
        style={
          firmada
            ? { borderColor: 'var(--color-green)', color: 'var(--color-green)', fontWeight: 700 }
            : undefined
        }
      >
        {firmada ? <FileCheck2 size={14} /> : <HeartHandshake size={14} />}
        {firmada ? 'Desistió · con constancia' : 'Desistió'}
      </button>

      {abierto ? (
        <div
          className="modal-telon"
          role="dialog"
          aria-modal="true"
          aria-label="Desistimiento"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAbierto(false)
          }}
        >
          <div className="modal-caja">
            <div className="modal-cabecera">
              <h2
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '1.1rem',
                  margin: 0,
                }}
              >
                {firmada ? <FileCheck2 size={17} /> : <HeartHandshake size={17} />}
                {firmada ? 'Dejó constancia de que no quiso continuar' : 'No quiere continuar'}
              </h2>
              <button
                className="boton-icono"
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {firmada ? (
              <div>
                <div className="sin-contacto">
                  <p className="sin-contacto__titulo">
                    <FileCheck2 size={15} aria-hidden />
                    Firmada el {fechaLarga(desistimiento!.firmadaEl)}
                  </p>
                  <p className="sin-contacto__detalle">
                    La aceptó como <strong>{nombrePropio(desistimiento!.nombre)}</strong> · texto
                    versión {desistimiento!.version}. El caso quedó cerrado por esa decisión.
                  </p>
                </div>

                {desistimiento!.motivo ? (
                  <>
                    <p className="tabla__secundario" style={{ margin: '14px 0 4px' }}>
                      Lo que quiso contarnos:
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.55 }}>
                      «{desistimiento!.motivo}»
                    </p>
                  </>
                ) : (
                  <p className="panel__nota" style={{ marginTop: 14 }}>
                    No dejó motivo, y no se le pidió: desistir no hay que justificarlo.
                  </p>
                )}

                <p className="panel__nota" style={{ marginTop: 14 }}>
                  El texto completo que leyó quedó guardado tal cual, con esa versión. Si algún
                  día hay que mostrarlo, está en la auditoría del caso.
                </p>
              </div>
            ) : (
              <div>
                <p style={{ margin: '0 0 12px', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Mándale este enlace. Ahí lee y acepta, con su nombre, que por su propia
                  voluntad decide no continuar — y el caso se cierra solo cuando ella lo toque.
                </p>

                <Mensaje
                  titulo="Mandarle la constancia"
                  nota="Ella la acepta desde su teléfono. Hasta entonces el caso sigue abierto."
                  telefono={telefono}
                  texto={mensajeDeDesistimiento({
                    persona: nombre,
                    enlace,
                    plantilla: plantillas.WHATSAPP_DESISTIMIENTO,
                  })}
                  copiado={copiado}
                  alCopiar={copiar}
                />

                <p className="panel__nota" style={{ marginTop: 14 }}>
                  Esto no cierra el caso por su cuenta y no reemplaza a «Cerrar caso»: si nunca
                  contesta, el cierre lo decide la red y ahí se dice así.
                </p>
              </div>
            )}

            <div className="mensaje__acciones" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
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
