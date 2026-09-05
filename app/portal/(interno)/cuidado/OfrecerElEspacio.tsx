'use client'

import { useState } from 'react'
import { Copy, Check, MessageSquare, Send } from 'lucide-react'
import { usePlantillas } from '@/components/portal/Plantillas'
import { mensajeDeOfrecerCuidado, enlaceWhatsapp } from '@/lib/mensajes'
import { nombrePropio } from '@/lib/nombre'
import { BurbujaWhatsApp } from '@/components/portal/BurbujaWhatsApp'
import { Vacio } from '../componentes'

/**
 * A quién ofrecerle el espacio «¿Cómo estás tú?».
 *
 * El profesional solo ve su espacio si abre su enlace. Sin esta lista el
 * módulo esperaba a que alguien cargado se acordara solo de pedir ayuda —que
 * es justo lo que no hace—, y coordinación no tenía ni aviso ni botón.
 *
 * Son los que ya cruzaron el umbral y no tienen una petición sin atender. El
 * enlace lo firma el backend en cada carga: siempre va uno fresco.
 */

type Profesional = {
  id: string
  nombre: string
  telefono: string
  sesiones: number
  /** Firmado por el backend, recién hecho: nunca se manda uno vencido. */
  enlace: string
  ultimaVez: string | null
}

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', day: 'numeric', month: 'long' })

export function OfrecerElEspacio({
  profesionales,
  umbral,
}: {
  profesionales: Profesional[]
  umbral: number
}) {
  const plantillas = usePlantillas()

  return (
    <div className="panel">
      <h2>
        <Send size={18} style={{ verticalAlign: -3, marginRight: 6, color: '#a8731e' }} />
        Ofrecerles el espacio{' '}
        <span className="tabla__secundario" style={{ fontWeight: 400 }}>
          · {profesionales.length}
        </span>
      </h2>
      <p className="panel__nota">
        Ya llevan {umbral} sesiones o más y no han pedido nada. El espacio es un enlace suyo, y
        solo lo ven si se lo mandas: este WhatsApp es lo que se lo dice. Salen de la lista en
        cuanto lo pidan.
      </p>

      {profesionales.length === 0 ? (
        <Vacio>
          Nadie por ahora. Aparecen aquí solos en cuanto cruzan las {umbral} sesiones.
        </Vacio>
      ) : (
        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          {profesionales.map((p) => (
            <Fila key={p.id} profesional={p} plantilla={plantillas?.WHATSAPP_CUIDADO_OFRECER} />
          ))}
        </div>
      )}
    </div>
  )
}

function Fila({ profesional, plantilla }: { profesional: Profesional; plantilla?: string }) {
  const [copiado, setCopiado] = useState(false)
  const [verTexto, setVerTexto] = useState(false)

  const texto = mensajeDeOfrecerCuidado({
    plantilla,
    profesional: profesional.nombre,
    sesiones: profesional.sesiones,
    enlace: profesional.enlace,
  })
  const whatsapp = enlaceWhatsapp(profesional.telefono, texto)

  function copiar() {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div
      style={{
        border: '1px solid var(--color-border-default, #e2e8f0)',
        borderRadius: 12,
        padding: '12px 14px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <a href={`/portal/profesionales/${profesional.id}`} className="tabla__principal">
            {nombrePropio(profesional.nombre)}
          </a>
          <span className="tabla__secundario" style={{ display: 'block' }}>
            {profesional.sesiones} sesiones en la red
            {profesional.ultimaVez ? ` · pidió el espacio por última vez el ${fecha(profesional.ultimaVez)}` : ''}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {whatsapp ? (
            <a className="boton-mini" data-tono="principal" href={whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageSquare size={14} />
              Abrir WhatsApp
            </a>
          ) : (
            <span className="tabla__secundario">Sin teléfono</span>
          )}
          <button className="boton-mini" type="button" onClick={copiar}>
            {copiado ? <Check size={14} /> : <Copy size={14} />}
            {copiado ? '¡Copiado!' : 'Copiar mensaje'}
          </button>
          <button
            className="tabla__secundario"
            type="button"
            onClick={() => setVerTexto((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}
          >
            {verTexto ? 'Ocultar' : 'Ver el mensaje'}
          </button>
        </div>
      </div>

      {verTexto ? (
        <div style={{ marginTop: 10 }}>
          <BurbujaWhatsApp texto={texto} />
        </div>
      ) : null}
    </div>
  )
}
