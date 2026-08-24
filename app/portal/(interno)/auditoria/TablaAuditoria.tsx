'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X } from 'lucide-react'
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

export function TablaAuditoria({
  entradas,
  modulos,
  accionMap,
}: {
  entradas: EntradaAuditoria[]
  modulos: { value: string; label: string }[]
  accionMap: Record<string, string>
}) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroAccion, setFiltroAccion] = useState('')
  const [filtroModulo, setFiltroModulo] = useState('')

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

  const hayFiltrosEnPagina = Boolean(busqueda.trim() || filtroAccion || filtroModulo)

  function limpiarFiltrosEnPagina() {
    setBusqueda('')
    setFiltroAccion('')
    setFiltroModulo('')
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
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim()
        const matchActor = (e.actor || 'el sistema sin cuenta').toLowerCase().includes(q)
        const accionTexto = (accionMap[e.accion] ?? e.accion).toLowerCase()
        const matchAccion = accionTexto.includes(q)
        const moduloTexto = (moduloLabelMap.get(e.entidad) ?? e.entidad).toLowerCase()
        const matchModulo = moduloTexto.includes(q)
        const matchEntidadId = (e.entidadId || '').toLowerCase().includes(q)
        const matchIp = (e.ip || '').toLowerCase().includes(q)
        const matchFecha = enBogota(e.fecha).toLowerCase().includes(q)

        if (
          !matchActor &&
          !matchAccion &&
          !matchModulo &&
          !matchEntidadId &&
          !matchIp &&
          !matchFecha
        ) {
          return false
        }
      }

      if (filtroAccion && e.accion !== filtroAccion) {
        return false
      }

      if (filtroModulo && e.entidad !== filtroModulo) {
        return false
      }

      return true
    })
  }, [entradas, busqueda, filtroAccion, filtroModulo, accionMap, moduloLabelMap])

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
      return <ArrowUpDown size={12} style={{ opacity: 0.4, marginLeft: 4 }} />
    }
    return direccion === 'asc' ? (
      <ArrowUp size={12} style={{ color: 'var(--color-primary, #059669)', marginLeft: 4 }} />
    ) : (
      <ArrowDown size={12} style={{ color: 'var(--color-primary, #059669)', marginLeft: 4 }} />
    )
  }

  // Extraer las acciones y entidades únicas presentes en los resultados para filtros rápidos
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
      <div
        className="filtros"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 12,
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', minWidth: 200, flex: '1 1 200px' }}>
          <input
            className="input"
            type="text"
            placeholder="Filtrar en esta página por quién, ID, fecha o IP..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ width: '100%', paddingLeft: 30 }}
          />
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0.5,
              pointerEvents: 'none',
            }}
          />
        </div>

        {accionesPresentes.length > 1 ? (
          <select
            className="input"
            value={filtroAccion}
            onChange={(e) => setFiltroAccion(e.target.value)}
            style={{ minWidth: 140 }}
          >
            <option value="">Todas las acciones en vista</option>
            {accionesPresentes.map((acc) => (
              <option key={acc} value={acc}>
                {accionMap[acc] ?? acc}
              </option>
            ))}
          </select>
        ) : null}

        {modulosPresentes.length > 1 ? (
          <select
            className="input"
            value={filtroModulo}
            onChange={(e) => setFiltroModulo(e.target.value)}
            style={{ minWidth: 150 }}
          >
            <option value="">Todos los módulos en vista</option>
            {modulosPresentes.map((mod) => (
              <option key={mod} value={mod}>
                {moduloLabelMap.get(mod) ?? mod}
              </option>
            ))}
          </select>
        ) : null}

        {hayFiltrosEnPagina ? (
          <button
            type="button"
            className="boton-mini"
            onClick={limpiarFiltrosEnPagina}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <X size={13} />
            Limpiar filtro local
          </button>
        ) : null}
      </div>

      {listaOrdenada.length === 0 ? (
        <Vacio>
          {hayFiltrosEnPagina
            ? 'Ningún registro de esta página coincide con los filtros aplicados.'
            : 'No hay registros en esta vista.'}
        </Vacio>
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th
                  onClick={() => alternarOrden('fecha')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por Cuándo (Fecha)"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Cuándo
                    <IconoOrden col="fecha" />
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('actor')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por Quién"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Quién
                    <IconoOrden col="actor" />
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('accion')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por Qué hizo"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Qué hizo
                    <IconoOrden col="accion" />
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('entidad')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por Sobre"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Sobre
                    <IconoOrden col="entidad" />
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('ip')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por IP"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    IP
                    <IconoOrden col="ip" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {listaOrdenada.map((e) => (
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
