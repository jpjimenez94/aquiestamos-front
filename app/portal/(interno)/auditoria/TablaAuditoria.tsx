'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, X, RotateCcw } from 'lucide-react'
import { enBogota } from '@/lib/fechas'
import { Vacio } from '../componentes'

export type EntradaAuditoria = {
  id: string
  actor: string | null
  accion: string
  entidad: string
  entidadId: string | null
  fecha: string
  ip: string | null
}

type ColumnaOrden = 'fecha' | 'actor' | 'accion' | 'entidad' | 'ip'
type Direccion = 'asc' | 'desc'

const estiloInputFiltro: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  fontSize: '0.74rem',
  border: '1px solid var(--color-border-default, #cbd5e1)',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: 'var(--color-text-main, #1e293b)',
  outline: 'none',
  boxSizing: 'border-box',
  minHeight: '28px',
  fontWeight: 'normal',
}

export function TablaAuditoria({
  entradas,
  modulos,
  accionMap,
}: {
  entradas: EntradaAuditoria[]
  modulos: { value: string; label: string }[]
  accionMap: Record<string, string>
}) {
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroActor, setFiltroActor] = useState('')
  const [filtroAccion, setFiltroAccion] = useState('')
  const [filtroModulo, setFiltroModulo] = useState('')
  const [filtroIp, setFiltroIp] = useState('')

  const [columnaOrden, setColumnaOrden] = useState<ColumnaOrden>('fecha')
  const [direccion, setDireccion] = useState<Direccion>('desc')

  function alternarOrden(col: ColumnaOrden) {
    if (columnaOrden === col) {
      setDireccion(direccion === 'asc' ? 'desc' : 'asc')
    } else {
      setColumnaOrden(col)
      setDireccion(col === 'fecha' ? 'desc' : 'asc')
    }
  }

  const hayFiltrosEnPagina = Boolean(
    filtroFecha.trim() ||
      filtroActor.trim() ||
      filtroAccion ||
      filtroModulo ||
      filtroIp.trim(),
  )

  function limpiarFiltrosEnPagina() {
    setFiltroFecha('')
    setFiltroActor('')
    setFiltroAccion('')
    setFiltroModulo('')
    setFiltroIp('')
  }

  const moduloLabelMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of modulos) {
      map.set(m.value, m.label)
    }
    return map
  }, [modulos])

  const listaFiltrada = useMemo(() => {
    return entradas.filter((e) => {
      if (filtroFecha.trim()) {
        const q = filtroFecha.toLowerCase().trim()
        const matchFecha = enBogota(e.fecha).toLowerCase().includes(q)
        if (!matchFecha) return false
      }

      if (filtroActor.trim()) {
        const q = filtroActor.toLowerCase().trim()
        const actorTexto = (e.actor || 'el sistema sin cuenta').toLowerCase()
        if (!actorTexto.includes(q)) return false
      }

      if (filtroAccion && e.accion !== filtroAccion) {
        return false
      }

      if (filtroModulo) {
        if (e.entidad !== filtroModulo) return false
      }

      if (filtroIp.trim()) {
        const q = filtroIp.toLowerCase().trim()
        if (!e.ip?.toLowerCase().includes(q)) return false
      }

      return true
    })
  }, [entradas, filtroFecha, filtroActor, filtroAccion, filtroModulo, filtroIp])

  const listaOrdenada = useMemo(() => {
    return [...listaFiltrada].sort((a, b) => {
      let cmp = 0
      switch (columnaOrden) {
        case 'fecha': {
          const tA = new Date(a.fecha).getTime()
          const tB = new Date(b.fecha).getTime()
          cmp = tA - tB
          break
        }
        case 'actor': {
          const actA = a.actor || 'zzz'
          const actB = b.actor || 'zzz'
          cmp = actA.localeCompare(actB, 'es', { sensitivity: 'base' })
          break
        }
        case 'accion': {
          const lblA = accionMap[a.accion] ?? a.accion
          const lblB = accionMap[b.accion] ?? b.accion
          cmp = lblA.localeCompare(lblB, 'es', { sensitivity: 'base' })
          break
        }
        case 'entidad': {
          const modA = moduloLabelMap.get(a.entidad) ?? a.entidad
          const modB = moduloLabelMap.get(b.entidad) ?? b.entidad
          cmp = modA.localeCompare(modB, 'es', { sensitivity: 'base' })
          break
        }
        case 'ip': {
          const ipA = a.ip || ''
          const ipB = b.ip || ''
          cmp = ipA.localeCompare(ipB, 'es', { sensitivity: 'base' })
          break
        }
      }
      return direccion === 'asc' ? cmp : -cmp
    })
  }, [listaFiltrada, columnaOrden, direccion, accionMap, moduloLabelMap])

  function IconoOrden({ col }: { col: ColumnaOrden }) {
    if (columnaOrden !== col) {
      return <ArrowUpDown size={12} style={{ opacity: 0.35, marginLeft: 4 }} />
    }
    return direccion === 'asc' ? (
      <ArrowUp size={12} style={{ color: 'var(--color-primary, #059669)', marginLeft: 4 }} />
    ) : (
      <ArrowDown size={12} style={{ color: 'var(--color-primary, #059669)', marginLeft: 4 }} />
    )
  }

  // Extraer las acciones y entidades únicas presentes en los resultados
  const accionesPresentes = useMemo(() => {
    const set = new Set<string>()
    for (const e of entradas) {
      if (e.accion) set.add(e.accion)
    }
    return Array.from(set)
  }, [entradas])

  const modulosPresentes = useMemo(() => {
    const set = new Set<string>()
    for (const e of entradas) {
      if (e.entidad) set.add(e.entidad)
    }
    return Array.from(set)
  }, [entradas])

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <p className="panel__nota" style={{ margin: 0, fontSize: '0.8rem' }}>
          Mostrando <strong>{listaOrdenada.length}</strong> de {entradas.length} en esta página
          {hayFiltrosEnPagina ? ' (filtrados localmente)' : ''}
        </p>

        {hayFiltrosEnPagina ? (
          <button
            type="button"
            className="boton-mini"
            onClick={limpiarFiltrosEnPagina}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.74rem' }}
          >
            <RotateCcw size={12} />
            Restablecer filtro local
          </button>
        ) : null}
      </div>

      <div className="tabla-envoltorio">
        <table className="tabla">
          <thead>
            <tr>
              <th
                onClick={() => alternarOrden('fecha')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '22%' }}
                title="Ordenar por Cuándo (Fecha)"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Cuándo
                  <IconoOrden col="fecha" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('actor')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '24%' }}
                title="Ordenar por Quién"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Quién
                  <IconoOrden col="actor" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('accion')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '20%' }}
                title="Ordenar por Qué hizo"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Qué hizo
                  <IconoOrden col="accion" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('entidad')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '20%' }}
                title="Ordenar por Sobre"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Sobre
                  <IconoOrden col="entidad" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('ip')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '14%' }}
                title="Ordenar por IP"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  IP
                  <IconoOrden col="ip" />
                </span>
              </th>
            </tr>

            {/* Fila de filtros por columna */}
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Filtrar fecha/hora..."
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Filtrar por actor/correo..."
                  value={filtroActor}
                  onChange={(e) => setFiltroActor(e.target.value)}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroAccion}
                  onChange={(e) => setFiltroAccion(e.target.value)}
                  style={estiloInputFiltro}
                >
                  <option value="">Todas</option>
                  {accionesPresentes.map((acc) => (
                    <option key={acc} value={acc}>
                      {accionMap[acc] ?? acc}
                    </option>
                  ))}
                </select>
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroModulo}
                  onChange={(e) => setFiltroModulo(e.target.value)}
                  style={estiloInputFiltro}
                >
                  <option value="">Todos</option>
                  {modulosPresentes.map((mod) => (
                    <option key={mod} value={mod}>
                      {moduloLabelMap.get(mod) ?? mod}
                    </option>
                  ))}
                </select>
              </th>
              <th style={{ padding: '6px 6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="text"
                    placeholder="Filtrar IP..."
                    value={filtroIp}
                    onChange={(e) => setFiltroIp(e.target.value)}
                    style={estiloInputFiltro}
                  />
                  {hayFiltrosEnPagina ? (
                    <button
                      type="button"
                      onClick={limpiarFiltrosEnPagina}
                      className="boton-mini"
                      style={{ padding: '4px 6px', color: 'var(--color-red, #dc2626)' }}
                      title="Limpiar filtros"
                    >
                      <X size={13} />
                    </button>
                  ) : null}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {listaOrdenada.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>
                  <Vacio>
                    {hayFiltrosEnPagina
                      ? 'Ningún registro de esta página coincide con los filtros aplicados.'
                      : 'No hay registros en esta vista.'}
                  </Vacio>
                </td>
              </tr>
            ) : (
              listaOrdenada.map((e) => (
                <tr key={e.id}>
                  <td className="tabla__numero">{enBogota(e.fecha)}</td>
                  <td>
                    {e.actor ?? (
                      <span className="tabla__secundario">
                        {['acceder', 'acceso_fallido', 'salir'].includes(e.accion)
                          ? 'sin cuenta'
                          : 'el sistema'}
                      </span>
                    )}
                  </td>
                  <td>{accionMap[e.accion] ?? e.accion}</td>
                  <td>
                    {moduloLabelMap.get(e.entidad) ?? e.entidad}
                    {e.entidadId ? (
                      <span className="tabla__secundario">{e.entidadId.slice(0, 8)}…</span>
                    ) : null}
                  </td>
                  <td className="tabla__secundario">{e.ip ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
