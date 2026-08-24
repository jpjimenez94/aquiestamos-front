'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

export function PaginacionTabla({
  pagina,
  porPagina,
  totalFiltrado,
  totalGeneral,
  alCambiarPagina,
  alCambiarPorPagina,
}: {
  pagina: number
  porPagina: number
  totalFiltrado: number
  totalGeneral: number
  alCambiarPagina: (p: number) => void
  alCambiarPorPagina?: (n: number) => void
}) {
  const totalPaginas = Math.max(1, Math.ceil(totalFiltrado / porPagina))
  const paginaAjustada = Math.min(pagina, totalPaginas)
  const desde = totalFiltrado === 0 ? 0 : (paginaAjustada - 1) * porPagina + 1
  const hasta = Math.min(paginaAjustada * porPagina, totalFiltrado)
  const hayFiltro = totalFiltrado !== totalGeneral

  return (
    <nav
      className="paginacion"
      aria-label="Paginación de la tabla"
      style={{
        marginTop: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <p className="paginacion__conteo" style={{ margin: 0, fontSize: '0.84rem' }}>
          {totalFiltrado === 0 ? (
            'Sin registros'
          ) : (
            <>
              Mostrando <strong>{desde}–{hasta}</strong> de <strong>{totalFiltrado}</strong>
              {hayFiltro ? (
                <span className="tabla__secundario" style={{ marginLeft: 4, display: 'inline' }}>
                  (filtrado de {totalGeneral} en total)
                </span>
              ) : null}
            </>
          )}
        </p>

        {alCambiarPorPagina ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>Por página:</span>
            <select
              value={porPagina}
              onChange={(e) => alCambiarPorPagina(Number(e.target.value))}
              style={{
                padding: '3px 6px',
                fontSize: '0.78rem',
                borderRadius: 4,
                border: '1px solid var(--color-border-default, #cbd5e1)',
                background: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={999999}>Todas</option>
            </select>
          </div>
        ) : null}
      </div>

      {totalPaginas > 1 ? (
        <div className="paginacion__controles" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            className="boton-mini"
            disabled={paginaAjustada <= 1}
            onClick={() => alCambiarPagina(Math.max(1, paginaAjustada - 1))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              cursor: paginaAjustada <= 1 ? 'not-allowed' : 'pointer',
              opacity: paginaAjustada <= 1 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={14} />
            Anterior
          </button>

          <span className="paginacion__pagina" style={{ fontSize: '0.84rem', padding: '0 4px' }}>
            Página {paginaAjustada} de {totalPaginas}
          </span>

          <button
            type="button"
            className="boton-mini"
            disabled={paginaAjustada >= totalPaginas}
            onClick={() => alCambiarPagina(Math.min(totalPaginas, paginaAjustada + 1))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              cursor: paginaAjustada >= totalPaginas ? 'not-allowed' : 'pointer',
              opacity: paginaAjustada >= totalPaginas ? 0.4 : 1,
            }}
          >
            Siguiente
            <ChevronRight size={14} />
          </button>
        </div>
      ) : null}
    </nav>
  )
}
