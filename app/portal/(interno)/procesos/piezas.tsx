/**
 * Las piezas con las que se dibujan los flujogramas de la guía: cajas,
 * flechas y notas sobre SVG, con los colores del portal fijos (no variables
 * CSS) para que un diagrama descargado se vea igual fuera del portal.
 *
 * Sin 'use client' a propósito: son presentacionales puras y las usan tanto
 * el diagrama maestro (cliente, por el botón de descarga) como los diagramas
 * de cada etapa, que se renderizan en el servidor.
 */

export const TINTA = '#23254c'
export const TINTA_SUAVE = '#5a5c7d'
export const PAPEL = '#fffdf8'
export const VERDE = '#2e7d5b'
export const VERDE_SUAVE = '#e4efe8'
export const AMBAR = '#a8731e'
export const AMBAR_SUAVE = '#f7ecd8'
export const ROJO = '#b13a3a'
export const ROJO_SUAVE = '#f6e3e0'

export function Caja({
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
  tono?: 'normal' | 'espera' | 'logro' | 'alerta' | 'final'
}) {
  const fondo =
    tono === 'espera'
      ? AMBAR_SUAVE
      : tono === 'logro'
        ? VERDE_SUAVE
        : tono === 'alerta'
          ? ROJO_SUAVE
          : tono === 'final'
            ? TINTA
            : PAPEL
  const borde =
    tono === 'espera' ? AMBAR : tono === 'logro' ? VERDE : tono === 'alerta' ? ROJO : TINTA
  const texto = tono === 'final' ? '#fff6eb' : tono === 'alerta' ? '#7c2626' : TINTA
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
          fill={tono === 'final' ? '#d9d3e8' : tono === 'alerta' ? '#9c4a41' : TINTA_SUAVE}
          fontFamily="Montserrat, system-ui, sans-serif"
        >
          {detalle}
        </text>
      ) : null}
    </g>
  )
}

export function Flecha({
  d,
  tono = 'normal',
}: {
  d: string
  tono?: 'normal' | 'alerta'
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={tono === 'alerta' ? ROJO : TINTA_SUAVE}
      strokeWidth={1.6}
      strokeDasharray={tono === 'alerta' ? '5 4' : undefined}
      markerEnd={`url(#${tono === 'alerta' ? 'punta-roja' : 'punta'})`}
    />
  )
}

export function Nota({
  x,
  y,
  texto,
  tono = 'normal',
}: {
  x: number
  y: number
  texto: string
  tono?: 'normal' | 'alerta'
}) {
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

/**
 * El lienzo de un flujograma: viewBox, fondo papel, las dos puntas de flecha
 * ya definidas, y el desplazamiento horizontal en pantallas chicas.
 */
export function Lienzo({
  ancho,
  alto,
  etiqueta,
  children,
}: {
  ancho: number
  alto: number
  etiqueta: string
  children: React.ReactNode
}) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 10 }}>
      <svg
        viewBox={`0 0 ${ancho} ${alto}`}
        role="img"
        aria-label={etiqueta}
        style={{
          minWidth: Math.min(ancho, 680),
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          margin: '0 auto',
          background: PAPEL,
          borderRadius: 12,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="punta" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <polygon points="0 0, 9 4.5, 0 9" fill={TINTA_SUAVE} />
          </marker>
          <marker id="punta-roja" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <polygon points="0 0, 9 4.5, 0 9" fill={ROJO} />
          </marker>
        </defs>
        {children}
      </svg>
    </div>
  )
}
