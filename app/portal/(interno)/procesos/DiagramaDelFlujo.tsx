'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, Printer } from 'lucide-react'

/**
 * El flujo completo, dibujado: para quien prefiere verlo de un vistazo en vez
 * de leerlo por pasos, y para poder llevárselo (SVG descargable o impresión).
 *
 * Es SVG a mano con los colores del portal — sin librerías: pesa nada y el
 * archivo descargado se abre en cualquier navegador o se pega en un
 * documento. Los colores van fijos (no variables CSS) a propósito: el SVG
 * tiene que verse igual fuera del portal.
 */

const TINTA = '#23254c'
const TINTA_SUAVE = '#5a5c7d'
const PAPEL = '#fffdf8'
const VERDE = '#2e7d5b'
const VERDE_SUAVE = '#e4efe8'
const AMBAR = '#a8731e'
const AMBAR_SUAVE = '#f7ecd8'
const ROJO = '#b13a3a'

function Caja({
  x,
  y,
  w = 190,
  h = 54,
  titulo,
  detalle,
  tono = 'normal',
}: {
  x: number
  y: number
  w?: number
  h?: number
  titulo: string
  detalle?: string
  tono?: 'normal' | 'espera' | 'logro' | 'final'
}) {
  const fondo = tono === 'espera' ? AMBAR_SUAVE : tono === 'logro' ? VERDE_SUAVE : tono === 'final' ? TINTA : PAPEL
  const borde = tono === 'espera' ? AMBAR : tono === 'logro' ? VERDE : TINTA
  const texto = tono === 'final' ? '#fff6eb' : TINTA
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={fondo} stroke={borde} strokeWidth={1.5} />
      <text
        x={x + w / 2}
        y={y + (detalle ? 22 : h / 2 + 4)}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill={texto}
        fontFamily="Montserrat, system-ui, sans-serif"
      >
        {titulo}
      </text>
      {detalle ? (
        <text
          x={x + w / 2}
          y={y + 40}
          textAnchor="middle"
          fontSize={10.5}
          fill={tono === 'final' ? '#d9d3e8' : TINTA_SUAVE}
          fontFamily="Montserrat, system-ui, sans-serif"
        >
          {detalle}
        </text>
      ) : null}
    </g>
  )
}

function Flecha({ d, tono = 'normal', punta = 'flecha' }: { d: string; tono?: 'normal' | 'alerta'; punta?: string }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={tono === 'alerta' ? ROJO : TINTA_SUAVE}
      strokeWidth={1.6}
      strokeDasharray={tono === 'alerta' ? '5 4' : undefined}
      markerEnd={`url(#${punta}${tono === 'alerta' ? '-roja' : ''})`}
    />
  )
}

function Nota({ x, y, texto, tono = 'normal' }: { x: number; y: number; texto: string; tono?: 'normal' | 'alerta' }) {
  return (
    <text
      x={x}
      y={y}
      fontSize={10.5}
      fill={tono === 'alerta' ? ROJO : TINTA_SUAVE}
      fontFamily="Montserrat, system-ui, sans-serif"
      textAnchor="middle"
    >
      {texto}
    </text>
  )
}

export function DiagramaDelFlujo() {
  const contenedor = useRef<SVGSVGElement>(null)
  const [copiado, setCopiado] = useState(false)

  /**
   * Antes de imprimir se abren todas las etapas: un PDF con secciones
   * cerradas no documenta nada. Cubre también el Ctrl+P del navegador.
   */
  useEffect(() => {
    const abrirTodo = () => {
      document.querySelectorAll<HTMLDetailsElement>('details.proc-etapa').forEach((d) => {
        d.open = true
      })
    }
    window.addEventListener('beforeprint', abrirTodo)
    return () => window.removeEventListener('beforeprint', abrirTodo)
  }, [])

  function descargar() {
    const svg = contenedor.current
    if (!svg) return
    const fuente = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${fuente}`], {
      type: 'image/svg+xml;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'como-funciona-la-red.svg'
    a.click()
    URL.revokeObjectURL(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="panel" style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0 }}>El flujo, en un diagrama</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="boton-mini" type="button" onClick={descargar}>
            <Download size={14} />
            {copiado ? 'Descargado' : 'Descargar SVG'}
          </button>
          <button className="boton-mini" type="button" onClick={() => window.print()}>
            <Printer size={14} />
            Imprimir / PDF
          </button>
        </div>
      </div>
      <p className="proc-intro" style={{ marginTop: 6 }}>
        Las líneas punteadas rojas son las vueltas a la cola: rechazo o silencio vencido. El SVG
        descargado se abre en cualquier navegador y se puede pegar en un documento.
      </p>

      <div style={{ overflowX: 'auto', marginTop: 10 }}>
        <svg
          ref={contenedor}
          viewBox="0 0 900 640"
          role="img"
          aria-label="El flujo completo de un caso: solicitud, tamizaje, asignación al profesional, la persona elige su hora y firma en el mismo acto, sesión, reporte y cierre. Las líneas punteadas muestran las vueltas a la cola cuando el profesional no puede o cuando pasan tres días sin que ella elija hora."
          style={{ minWidth: 720, maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', background: PAPEL, borderRadius: 12 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <marker id="flecha" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
              <polygon points="0 0, 9 4.5, 0 9" fill={TINTA_SUAVE} />
            </marker>
            <marker id="flecha-roja" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
              <polygon points="0 0, 9 4.5, 0 9" fill={ROJO} />
            </marker>
          </defs>

          {/* ---------- fila 1: la entrada ---------- */}
          <Caja x={40} y={30} titulo="La persona pide ayuda" detalle="formulario del sitio" />
          <Flecha d="M 230 57 H 280" />
          <Caja x={282} y={30} titulo="Tamizaje por enlace" detalle="7 preguntas → prioridad" />
          <Flecha d="M 472 57 H 522" />
          <Caja x={524} y={30} w={210} titulo="Cola: Por Asignar" detalle="admite sola · 2 días si calla" tono="logro" />

          {/* ---------- fila 2: se asigna, no se pide permiso ---------- */}
          <Flecha d="M 629 84 V 130" />
          <Caja x={524} y={132} w={210} titulo="Se le asigna y se le avisa" detalle="WhatsApp con su enlace" tono="espera" />
          <Nota x={853} y={162} texto="«ahora no" tono="alerta" />
          <Nota x={853} y={175} texto="puedo»" tono="alerta" />

          {/* declina: vuelve a la cola el mismo día */}
          <Flecha d="M 745 159 H 800 V 57 H 740" tono="alerta" />

          {/* ---------- fila 3: ella escoge de la agenda real ---------- */}
          <Flecha d="M 629 186 V 232" />
          <Nota x={655} y={212} texto="confirma o corrige su agenda" />
          <Caja x={524} y={234} w={210} titulo="Ella elige su hora" detalle="de la agenda real de él" tono="espera" />
          <Nota x={853} y={264} texto="3 días o" tono="alerta" />
          <Nota x={853} y={277} texto="se libera" tono="alerta" />
          <Flecha d="M 745 261 H 810 V 57 H 740" tono="alerta" />

          {/* ---------- fila 4: la hora y la firma, un solo acto ---------- */}
          <Flecha d="M 629 288 V 334" />
          <Nota x={657} y={314} texto="elige la hora Y firma" />
          <Caja x={524} y={336} w={210} titulo="Cita CONFIRMADA" detalle="45 min + 30 de descanso" tono="logro" />

          {/* el consentimiento no es un paso aparte: va en la misma pantalla */}
          <Caja x={250} y={336} w={220} titulo="Consentimiento firmado" detalle="misma pantalla · sin firma no hay cita" />
          <Flecha d="M 472 363 H 522" />

          {/* ---------- fila 5: sesión y reporte ---------- */}
          <Flecha d="M 629 390 V 436" />
          <Caja x={524} y={438} w={210} titulo="La sesión" detalle="realizada · no asistió · se mueve" />
          <Flecha d="M 524 465 H 470" />
          <Caja x={250} y={438} w={220} titulo="El profesional reporta" detalle="qué pasó y qué sigue" />

          {/* necesita más: vuelve a cuadrar, por fuera de las cajas */}
          <Flecha d="M 250 465 H 208 V 261 H 522" />
          <Nota x={352} y={253} texto="«necesita más sesiones»" />

          {/* ---------- fila 6: el cierre ---------- */}
          <Flecha d="M 360 492 V 538" />
          <Nota x={445} y={518} texto="«con esta fue suficiente»" />
          <Caja x={250} y={540} w={220} titulo="Coordinación cierra el caso" detalle="con motivo · el cupo se libera" tono="final" />

          {/* leyenda */}
          <g>
            <rect x={40} y={556} width={14} height={14} rx={4} fill={AMBAR_SUAVE} stroke={AMBAR} />
            <text x={60} y={567} fontSize={10.5} fill={TINTA_SUAVE} fontFamily="Montserrat, system-ui, sans-serif">espera con reloj</text>
            <rect x={40} y={578} width={14} height={14} rx={4} fill={VERDE_SUAVE} stroke={VERDE} />
            <text x={60} y={589} fontSize={10.5} fill={TINTA_SUAVE} fontFamily="Montserrat, system-ui, sans-serif">avanzó</text>
            <line x1={40} y1={607} x2={54} y2={607} stroke={ROJO} strokeWidth={1.6} strokeDasharray="5 4" />
            <text x={60} y={611} fontSize={10.5} fill={TINTA_SUAVE} fontFamily="Montserrat, system-ui, sans-serif">vuelve a la cola: rechazo o silencio vencido</text>
          </g>
        </svg>
      </div>
    </div>
  )
}
