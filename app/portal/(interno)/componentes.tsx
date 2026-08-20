import type { ReactNode } from 'react'

export function Cabecera({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: string
  descripcion?: string
  acciones?: ReactNode
}) {
  return (
    <header className="portal__cabecera">
      <div>
        <h1>{titulo}</h1>
        {descripcion ? <p>{descripcion}</p> : null}
      </div>
      {acciones ? <div className="button-row">{acciones}</div> : null}
    </header>
  )
}

const TONOS: Record<string, string> = {
  // Profesionales
  ACTIVO: 'verde',
  PENDIENTE_VALIDACION: 'ambar',
  PAUSADO: 'ambar',
  INACTIVO: 'rojo',
  // Personas acompanadas
  NUEVO: 'ambar',
  EN_ADMISION: 'azul',
  ASIGNADO: 'azul',
  EN_ACOMPANAMIENTO: 'verde',
  CERRADO: '',
  // Citas
  PROGRAMADA: 'azul',
  CONFIRMADA: 'verde',
  REALIZADA: 'verde',
  CANCELADA: '',
  NO_ASISTIO: 'rojo',
  REPROGRAMADA: '',
  // Formularios
  EN_REVISION: 'azul',
  CONTACTADO: 'azul',
  DESCARTADO: '',
}

export function Etiqueta({ estado, texto }: { estado: string; texto?: string }) {
  return (
    <span className="etiqueta" data-tono={TONOS[estado] ?? ''}>
      {texto ?? estado}
    </span>
  )
}

export function Vacio({ children }: { children: ReactNode }) {
  return <p className="vacio">{children}</p>
}

export function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <p className="dato__etiqueta">{etiqueta}</p>
      <div className="dato__valor">{children ?? '—'}</div>
    </div>
  )
}

export function Indicador({
  cifra,
  etiqueta,
  alerta,
}: {
  cifra: number | string
  etiqueta: string
  alerta?: boolean
}) {
  return (
    <div className="indicador">
      <span className="indicador__cifra" data-alerta={Boolean(alerta)}>
        {cifra}
      </span>
      <span className="indicador__etiqueta">{etiqueta}</span>
    </div>
  )
}
