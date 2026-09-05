'use client'

import { useState } from 'react'
import { Copy, Check, MessageSquare, Send } from 'lucide-react'
import { usePlantillas } from '@/components/portal/Plantillas'
import { mensajeDeOfrecerCuidado, enlaceWhatsapp } from '@/lib/mensajes'
import { nombrePropio } from '@/lib/nombre'
import { Vacio } from '../componentes'

/**
 * A quién ofrecerle el espacio «¿Cómo estás tú?».
 *
 * El bloque vive al final del enlace del caso, y el profesional solo lo ve si
 * entra. Sin esta lista el módulo esperaba a que alguien cargado se acordara
 * solo de pedir ayuda —que es justo lo que no hace—, y coordinación no tenía
 * ni aviso ni botón.
 *
 * Son los que ya cruzaron el umbral y no tienen una petición sin atender. El
 * enlace lleva al ancla del bloque, para que no tenga que buscarlo al final de
 * su caso.
 */

type Profesional = {
  id: string
  nombre: string
  telefono: string
  sesiones: number
  pacienteId: string
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
        Ya llevan {umbral} sesiones o más y no han pedido nada. El bloque está al final de su
        enlace del caso, así que solo lo ven si entran: este WhatsApp es lo que se lo dice. Salen
        de la lista en cuanto lo pidan.
      </p>

      {profesionales.length === 0 ? (
        <Vacio>
          Nadie por ahora. Aparecen aquí solos cuando cruzan las {umbral} sesiones, siempre que
          tengan un caso abierto — el enlace que se les manda es el de uno de sus casos.
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

  // El ancla lleva directo al bloque, al final de la página del caso.
  const enlace =
    typeof window !== 'undefined'
      ? `${window.location.origin}/portal/caso/${profesional.pacienteId}#cuidado`
      : `/portal/caso/${profesional.pacienteId}#cuidado`

  const texto = mensajeDeOfrecerCuidado({
    plantilla,
    profesional: profesional.nombre,
    sesiones: profesional.sesiones,
    enlace,
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
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            fontSize: '0.86rem',
            color: '#475569',
            margin: '10px 0 0',
          }}
        >
          {texto}
        </pre>
      ) : null}
    </div>
  )
}
