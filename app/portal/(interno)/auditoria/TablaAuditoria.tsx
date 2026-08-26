'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  RotateCcw,
  Calendar,
  Filter,
  Search,
  Check,
  Clock,
  Shield,
  Activity,
  Loader2,
} from 'lucide-react'
import { enBogota } from '@/lib/fechas'
import { Vacio } from '../componentes'
import { PaginacionTabla } from '../PaginacionTabla'

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

function formatearFechaIsoBogota(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

function obtenerFechaIso(fechaIso: string): string {
  const d = new Date(fechaIso)
  if (isNaN(d.getTime())) return ''
  return formatearFechaIsoBogota(d)
}

export function TablaAuditoria({
  entradas,
  modulos,
  accionMap,
  desdeInicial = '',
  hastaInicial = '',
}: {
  entradas: EntradaAuditoria[]
  modulos: { value: string; label: string }[]
  accionMap: Record<string, string>
  desdeInicial?: string
  hastaInicial?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Filtros de Rango de Fechas
  const [filtroDesde, setFiltroDesde] = useState(desdeInicial)
  const [filtroHasta, setFiltroHasta] = useState(hastaInicial)

  // Filtros por Columna
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroActor, setFiltroActor] = useState('')
  const [filtroAccion, setFiltroAccion] = useState('')
  const [filtroModulo, setFiltroModulo] = useState('')
  const [filtroIp, setFiltroIp] = useState('')

  // Ordenamiento
  const [columnaOrden, setColumnaOrden] = useState<ColumnaOrden>('fecha')
  const [direccion, setDireccion] = useState<Direccion>('desc')

  // Paginación
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(50)

  function alternarOrden(col: ColumnaOrden) {
    if (columnaOrden === col) {
      setDireccion(direccion === 'asc' ? 'desc' : 'asc')
    } else {
      setColumnaOrden(col)
      setDireccion(col === 'fecha' ? 'desc' : 'asc')
    }
  }

  // Sincronizar búsqueda con el servidor (para traer registros históricos de la BD)
  function sincronizarConServidor(d: string, h: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (d) params.set('desde', d)
    else params.delete('desde')

    if (h) params.set('hasta', h)
    else params.delete('hasta')

    params.delete('page')

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  // Acción explícita: botón "Aplicar filtros"
  function handleAplicarFiltros(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setPagina(1)
    sincronizarConServidor(filtroDesde, filtroHasta)
  }

  // Atajos rápidos de rango de fechas
  function aplicarRangoRapido(tipo: 'hoy' | '7dias' | '30dias' | 'esteMes' | 'todo') {
    const ahora = new Date()
    const hoyStr = formatearFechaIsoBogota(ahora)
    let nuevoDesde = ''
    let nuevoHasta = ''

    if (tipo === 'todo') {
      nuevoDesde = ''
      nuevoHasta = ''
    } else if (tipo === 'hoy') {
      nuevoDesde = hoyStr
      nuevoHasta = hoyStr
    } else if (tipo === '7dias') {
      const hace7 = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000)
      nuevoDesde = formatearFechaIsoBogota(hace7)
      nuevoHasta = hoyStr
    } else if (tipo === '30dias') {
      const hace30 = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)
      nuevoDesde = formatearFechaIsoBogota(hace30)
      nuevoHasta = hoyStr
    } else if (tipo === 'esteMes') {
      const anio = ahora.getFullYear()
      const mes = String(ahora.getMonth() + 1).padStart(2, '0')
      nuevoDesde = `${anio}-${mes}-01`
      nuevoHasta = hoyStr
    }

    setFiltroDesde(nuevoDesde)
    setFiltroHasta(nuevoHasta)
    setPagina(1)
    sincronizarConServidor(nuevoDesde, nuevoHasta)
  }

  const hayFiltrosEnPagina = Boolean(
    filtroDesde ||
      filtroHasta ||
      filtroFecha.trim() ||
      filtroActor.trim() ||
      filtroAccion ||
      filtroModulo ||
      filtroIp.trim(),
  )

  function limpiarTodosFiltros() {
    setFiltroDesde('')
    setFiltroHasta('')
    setFiltroFecha('')
    setFiltroActor('')
    setFiltroAccion('')
    setFiltroModulo('')
    setFiltroIp('')
    setPagina(1)
    sincronizarConServidor('', '')
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
      // Filtro de rango de fechas
      if (filtroDesde || filtroHasta) {
        const fechaDia = obtenerFechaIso(e.fecha)
        if (filtroDesde && fechaDia < filtroDesde) return false
        if (filtroHasta && fechaDia > filtroHasta) return false
      }

      // Filtro de texto de fecha/hora
      if (filtroFecha.trim()) {
        const q = filtroFecha.toLowerCase().trim()
        const matchFecha = enBogota(e.fecha).toLowerCase().includes(q)
        if (!matchFecha) return false
      }

      // Filtro por actor
      if (filtroActor.trim()) {
        const q = filtroActor.toLowerCase().trim()
        const actorTexto = (e.actor || 'el sistema sin cuenta').toLowerCase()
        if (!actorTexto.includes(q)) return false
      }

      // Filtro por acción
      if (filtroAccion && e.accion !== filtroAccion) {
        return false
      }

      // Filtro por módulo / entidad
      if (filtroModulo && e.entidad !== filtroModulo) {
        return false
      }

      // Filtro por IP
      if (filtroIp.trim()) {
        const q = filtroIp.toLowerCase().trim()
        if (!e.ip?.toLowerCase().includes(q)) return false
      }

      return true
    })
  }, [entradas, filtroDesde, filtroHasta, filtroFecha, filtroActor, filtroAccion, filtroModulo, filtroIp])

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

  // Paginación en cliente
  const totalPaginas = Math.max(1, Math.ceil(listaOrdenada.length / porPagina))
  const paginaAjustada = Math.min(pagina, totalPaginas)
  const inicio = (paginaAjustada - 1) * porPagina
  const fin = inicio + porPagina
  const listaPaginada = listaOrdenada.slice(inicio, fin)

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
      {/* Barra superior de Rango de Fechas y Filtros Rápidos */}
      <form
        onSubmit={handleAplicarFiltros}
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '16px 18px',
          marginBottom: 16,
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          {/* Controles de selector Desde / Hasta + Botón Aplicar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a', fontWeight: 800, fontSize: '0.88rem' }}>
              <Calendar size={18} style={{ color: 'var(--color-primary, #059669)' }} />
              <span>Rango de fechas:</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Desde</label>
              <input
                type="date"
                value={filtroDesde}
                onChange={(e) => setFiltroDesde(e.target.value)}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.82rem',
                  borderRadius: 8,
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#1e293b',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Hasta</label>
              <input
                type="date"
                value={filtroHasta}
                onChange={(e) => setFiltroHasta(e.target.value)}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.82rem',
                  borderRadius: 8,
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#1e293b',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            {/* Botón Principal: Aplicar Filtros */}
            <button
              type="submit"
              disabled={isPending}
              className="boton-mini"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                fontSize: '0.82rem',
                fontWeight: 800,
                background: '#059669',
                color: '#ffffff',
                border: '1.5px solid #047857',
                borderRadius: 8,
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                cursor: isPending ? 'wait' : 'pointer',
              }}
            >
              {isPending ? <Loader2 size={14} className="anim-spin" /> : <Filter size={14} />}
              <span>Aplicar filtros</span>
            </button>
          </div>

          {/* Botones de Atajos Rápidos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginRight: 2 }}>Atajos:</span>
            <button
              type="button"
              onClick={() => aplicarRangoRapido('hoy')}
              className="boton-mini"
              style={{
                fontSize: '0.76rem',
                padding: '5px 10px',
                background: filtroDesde && filtroDesde === filtroHasta ? '#ecfdf5' : '#fff',
                borderColor: filtroDesde && filtroDesde === filtroHasta ? '#059669' : '#cbd5e1',
                color: filtroDesde && filtroDesde === filtroHasta ? '#047857' : '#334155',
                fontWeight: 700,
              }}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => aplicarRangoRapido('7dias')}
              className="boton-mini"
              style={{ fontSize: '0.76rem', padding: '5px 10px', fontWeight: 600 }}
            >
              Últimos 7 días
            </button>
            <button
              type="button"
              onClick={() => aplicarRangoRapido('30dias')}
              className="boton-mini"
              style={{ fontSize: '0.76rem', padding: '5px 10px', fontWeight: 600 }}
            >
              Últimos 30 días
            </button>
            <button
              type="button"
              onClick={() => aplicarRangoRapido('esteMes')}
              className="boton-mini"
              style={{ fontSize: '0.76rem', padding: '5px 10px', fontWeight: 600 }}
            >
              Este mes
            </button>

            {hayFiltrosEnPagina && (
              <button
                type="button"
                onClick={limpiarTodosFiltros}
                className="boton-mini"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.76rem',
                  padding: '5px 10px',
                  color: '#dc2626',
                  borderColor: '#fca5a5',
                  background: '#fef2f2',
                  fontWeight: 700,
                }}
                title="Limpiar todos los filtros y rango de fechas"
              >
                <RotateCcw size={12} />
                Limpiar
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Resumen de Conteo y Tabla */}
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
                  onChange={(e) => {
                    setFiltroFecha(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Filtrar por actor/correo..."
                  value={filtroActor}
                  onChange={(e) => {
                    setFiltroActor(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroAccion}
                  onChange={(e) => {
                    setFiltroAccion(e.target.value)
                    setPagina(1)
                  }}
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
                  onChange={(e) => {
                    setFiltroModulo(e.target.value)
                    setPagina(1)
                  }}
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
                    onChange={(e) => {
                      setFiltroIp(e.target.value)
                      setPagina(1)
                    }}
                    style={estiloInputFiltro}
                  />
                  {hayFiltrosEnPagina ? (
                    <button
                      type="button"
                      onClick={limpiarTodosFiltros}
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
            {listaPaginada.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>
                  <Vacio>
                    {hayFiltrosEnPagina
                      ? 'Ningún registro coincide con el rango de fechas o los filtros aplicados.'
                      : 'No hay registros de auditoría disponibles.'}
                  </Vacio>
                </td>
              </tr>
            ) : (
              listaPaginada.map((e) => (
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

      {/* Componente de Paginación */}
      <PaginacionTabla
        pagina={paginaAjustada}
        porPagina={porPagina}
        totalFiltrado={listaOrdenada.length}
        totalGeneral={entradas.length}
        alCambiarPagina={(p) => {
          setPagina(p)
          window.scrollTo({ top: 120, behavior: 'smooth' })
        }}
        alCambiarPorPagina={(n) => {
          setPorPagina(n)
          setPagina(1)
        }}
      />
    </>
  )
}
