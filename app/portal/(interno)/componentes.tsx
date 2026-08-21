import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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

/**
 * Paginación de los listados de trabajo.
 *
 * Son enlaces, no botones: la página es un componente de servidor y el número
 * vive en la URL. Así se puede compartir o guardar "la página 3 de
 * postulaciones", el botón atrás del navegador funciona, y no hace falta
 * mandar JavaScript al cliente para esto.
 */
export function Paginacion({
  pagina,
  porPagina,
  total,
  ruta,
  filtros,
}: {
  pagina: number
  porPagina: number
  total: number
  ruta: string
  /** Lo que haya en la URL además de la página, para no perderlo al avanzar. */
  filtros?: Record<string, string | undefined>
}) {
  const ultima = Math.max(1, Math.ceil(total / porPagina))
  const desde = (pagina - 1) * porPagina + 1
  const hasta = Math.min(pagina * porPagina, total)

  // A una página que no existe se llega escribiendo el número a mano. No es
  // un error, pero el rango no se puede mostrar: "2451-71 de 71" no dice nada.
  const fueraDeRango = pagina > ultima

  // Con una sola página el control no aporta nada, pero el recuento sí:
  // saber que son 12 y no 12 de 300 cambia cómo se lee la tabla.
  const enlace = (n: number) => {
    const query = new URLSearchParams()
    for (const [clave, valor] of Object.entries(filtros ?? {})) {
      if (valor) query.set(clave, valor)
    }
    // La primera página no lleva número: deja la URL limpia y hace que
    // "Anterior" desde la 2 devuelva a la misma dirección que el menú.
    if (n > 1) query.set('pagina', String(n))

    const cadena = query.toString()
    return cadena ? `${ruta}?${cadena}` : ruta
  }

  // Desde fuera de rango, "Anterior" devuelve a la última página real en vez
  // de a otra página vacía.
  const anterior = Math.min(pagina - 1, ultima)

  return (
    <nav className="paginacion" aria-label="Paginación">
      <p className="paginacion__recuento">
        {total === 0 ? (
          'Sin registros'
        ) : fueraDeRango ? (
          <>{total} en total</>
        ) : (
          <>
            <strong>
              {desde}–{hasta}
            </strong>{' '}
            de {total}
          </>
        )}
      </p>

      {ultima > 1 ? (
        <div className="paginacion__controles">
          {pagina > 1 ? (
            <Link className="boton-mini" href={enlace(anterior)} rel="prev">
              <ChevronLeft size={14} />
              Anterior
            </Link>
          ) : (
            <span className="boton-mini" aria-disabled="true">
              <ChevronLeft size={14} />
              Anterior
            </span>
          )}

          <span className="paginacion__pagina">
            Página {Math.min(pagina, ultima)} de {ultima}
          </span>

          {pagina < ultima ? (
            <Link className="boton-mini" href={enlace(pagina + 1)} rel="next">
              Siguiente
              <ChevronRight size={14} />
            </Link>
          ) : (
            <span className="boton-mini" aria-disabled="true">
              Siguiente
              <ChevronRight size={14} />
            </span>
          )}
        </div>
      ) : null}
    </nav>
  )
}

/**
 * Lee el número de página de la URL. Cualquier cosa rara (texto, 0, negativo)
 * cae en la página 1 en vez de romper la consulta.
 */
export function leerPagina(valor: string | string[] | undefined): number {
  const crudo = Array.isArray(valor) ? valor[0] : valor
  const numero = Number(crudo)
  return Number.isInteger(numero) && numero > 0 ? numero : 1
}
