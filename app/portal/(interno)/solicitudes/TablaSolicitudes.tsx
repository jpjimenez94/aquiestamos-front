'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, X, RotateCcw } from 'lucide-react'
import { Etiqueta, Vacio } from '../componentes'
import { PaginacionTabla } from '../PaginacionTabla'
import { BotonAdmitirSolicitud } from './BotonAdmitirSolicitud'
import { BotonEliminarSolicitud } from './BotonEliminarSolicitud'
import { BotonEditarSolicitud } from './BotonEditarSolicitud'
import { BotonTamizaje } from './BotonTamizaje'
import { ResultadoTamizaje } from './ResultadoTamizaje'
import { nombrePropio } from '@/lib/nombre'
import { enBogota } from '@/lib/fechas'

type Tamizaje = {
  enlace: string
  respuesta: {
    id: string
    prioridadSugerida: 'ALTA' | 'MEDIA' | 'BAJA'
    prioridadLegible: string
    razones: string[]
    respondidoEn: string
  } | null
  diasParaAdmisionAutomatica: number
}

export type Solicitud = {
  id: string
  name: string
  phone: string
  /** Opcional a propósito: la red trabaja por WhatsApp. */
  email?: string | null
  city: string
  isMinor: boolean | null
  forWhom?: string | null
  /** Solo cuando la solicitud es para otra persona; los devuelve la vista de admin. */
  contactName?: string | null
  relationship?: string | null
  preferredContact: string | null
  preferredModality: string | null
  availableDays: string[]
  availableSlots: string[]
  status: string
  createdAt: string
  tamizaje: Tamizaje | null
}

const DIA_CORTO: Record<string, string> = {
  LUNES: 'Lu',
  MARTES: 'Ma',
  MIERCOLES: 'Mi',
  JUEVES: 'Ju',
  VIERNES: 'Vi',
  SABADO: 'Sa',
  DOMINGO: 'Do',
}

const FRANJA_CORTA: Record<string, string> = {
  MANANA: 'mañana',
  TARDE: 'tarde',
  NOCHE: 'noche',
}

type ColumnaOrden = 'persona' | 'ciudad' | 'tamizaje' | 'fecha' | 'estado'
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

export function TablaSolicitudes({
  solicitudes,
  esAdmin = false,
}: {
  solicitudes: Solicitud[]
  esAdmin?: boolean
}) {
  const [filtroPersona, setFiltroPersona] = useState('')
  const [filtroCiudad, setFiltroCiudad] = useState('')
  const [filtroTamizaje, setFiltroTamizaje] = useState('')
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  const [columnaOrden, setColumnaOrden] = useState<ColumnaOrden>('fecha')
  const [direccion, setDireccion] = useState<Direccion>('desc')

  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(25)

  function alternarOrden(col: ColumnaOrden) {
    if (columnaOrden === col) {
      setDireccion(direccion === 'asc' ? 'desc' : 'asc')
    } else {
      setColumnaOrden(col)
      setDireccion(col === 'fecha' ? 'desc' : 'asc')
    }
  }

  const hayFiltros = Boolean(
    filtroPersona.trim() ||
      filtroCiudad.trim() ||
      filtroTamizaje ||
      filtroDisponibilidad.trim() ||
      filtroFecha.trim() ||
      filtroEstado,
  )

  function limpiarFiltros() {
    setFiltroPersona('')
    setFiltroCiudad('')
    setFiltroTamizaje('')
    setFiltroDisponibilidad('')
    setFiltroFecha('')
    setFiltroEstado('')
    setPagina(1)
  }

  const listaFiltrada = useMemo(() => {
    return solicitudes.filter((s) => {
      if (filtroPersona.trim()) {
        const q = filtroPersona.toLowerCase().trim()
        const matchNombre = s.name.toLowerCase().includes(q)
        const matchTel = s.phone?.includes(q)
        if (!matchNombre && !matchTel) return false
      }

      if (filtroCiudad.trim()) {
        const q = filtroCiudad.toLowerCase().trim()
        if (!s.city?.toLowerCase().includes(q)) return false
      }

      if (filtroTamizaje) {
        if (filtroTamizaje === 'RESPONDIDO' && !s.tamizaje?.respuesta) return false
        if (filtroTamizaje === 'PENDIENTE' && s.tamizaje?.respuesta) return false
        if (
          ['ALTA', 'MEDIA', 'BAJA'].includes(filtroTamizaje) &&
          s.tamizaje?.respuesta?.prioridadSugerida !== filtroTamizaje
        ) {
          return false
        }
      }

      if (filtroDisponibilidad.trim()) {
        const q = filtroDisponibilidad.toLowerCase().trim()
        const dias = s.availableDays?.join(' ').toLowerCase() || ''
        const franjas = s.availableSlots?.join(' ').toLowerCase() || ''
        if (!dias.includes(q) && !franjas.includes(q)) return false
      }

      if (filtroFecha.trim()) {
        const q = filtroFecha.toLowerCase().trim()
        if (!enBogota(s.createdAt, false).toLowerCase().includes(q)) return false
      }

      if (filtroEstado && s.status !== filtroEstado) {
        return false
      }

      return true
    })
  }, [
    solicitudes,
    filtroPersona,
    filtroCiudad,
    filtroTamizaje,
    filtroDisponibilidad,
    filtroFecha,
    filtroEstado,
  ])

  const listaOrdenada = useMemo(() => {
    return [...listaFiltrada].sort((a, b) => {
      let cmp = 0
      switch (columnaOrden) {
        case 'persona':
          cmp = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
          break
        case 'ciudad':
          cmp = (a.city || '').localeCompare(b.city || '', 'es', { sensitivity: 'base' })
          break
        case 'tamizaje': {
          const peso: Record<string, number> = { ALTA: 3, MEDIA: 2, BAJA: 1 }
          const pA = peso[a.tamizaje?.respuesta?.prioridadSugerida ?? ''] ?? 0
          const pB = peso[b.tamizaje?.respuesta?.prioridadSugerida ?? ''] ?? 0
          cmp = pA - pB
          break
        }
        case 'fecha': {
          const tA = new Date(a.createdAt).getTime()
          const tB = new Date(b.createdAt).getTime()
          cmp = tA - tB
          break
        }
        case 'estado':
          cmp = a.status.localeCompare(b.status, 'es', { sensitivity: 'base' })
          break
      }
      return direccion === 'asc' ? cmp : -cmp
    })
  }, [listaFiltrada, columnaOrden, direccion])

  const totalFiltradas = listaOrdenada.length
  const totalPaginas = Math.max(1, Math.ceil(totalFiltradas / porPagina))
  const paginaAjustada = Math.min(pagina, totalPaginas)
  const listaPaginada = useMemo(() => {
    const start = (paginaAjustada - 1) * porPagina
    return listaOrdenada.slice(start, start + porPagina)
  }, [listaOrdenada, paginaAjustada, porPagina])

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

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p className="panel__nota" style={{ margin: 0, fontSize: '0.82rem' }}>
          <strong>{listaOrdenada.length}</strong> {listaOrdenada.length === 1 ? 'solicitud' : 'solicitudes'}
          {hayFiltros ? ` (filtrado de ${solicitudes.length} en total)` : ''}
        </p>

        {hayFiltros ? (
          <button
            type="button"
            className="boton-mini"
            onClick={limpiarFiltros}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.76rem' }}
          >
            <RotateCcw size={12} />
            Restablecer filtros
          </button>
        ) : null}
      </div>

      <div className="tabla-envoltorio">
        <table className="tabla">
          <thead>
            <tr>
              <th
                onClick={() => alternarOrden('persona')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '22%' }}
                title="Ordenar por Persona"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Persona
                  <IconoOrden col="persona" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('ciudad')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '14%' }}
                title="Ordenar por Ciudad"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Ciudad
                  <IconoOrden col="ciudad" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('tamizaje')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '22%' }}
                title="Ordenar por Cómo está / Tamizaje"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Cómo está
                  <IconoOrden col="tamizaje" />
                </span>
              </th>
              <th style={{ width: '14%' }}>Disponibilidad</th>
              <th
                onClick={() => alternarOrden('fecha')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '10%' }}
                title="Ordenar por Fecha Recibida"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Recibida
                  <IconoOrden col="fecha" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('estado')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '9%' }}
                title="Ordenar por Estado"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Estado
                  <IconoOrden col="estado" />
                </span>
              </th>
              <th style={{ width: '9%', textAlign: 'right' }}>Acciones</th>
            </tr>

            {/* Fila de filtros por columna */}
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Nombre, teléfono..."
                  value={filtroPersona}
                  onChange={(e) => {
                    setFiltroPersona(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Ciudad..."
                  value={filtroCiudad}
                  onChange={(e) => {
                    setFiltroCiudad(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroTamizaje}
                  onChange={(e) => {
                    setFiltroTamizaje(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                >
                  <option value="">Todos</option>
                  <option value="ALTA">Prioridad Alta</option>
                  <option value="MEDIA">Prioridad Media</option>
                  <option value="BAJA">Prioridad Baja</option>
                  <option value="RESPONDIDO">Respondido</option>
                  <option value="PENDIENTE">Pendiente</option>
                </select>
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Día/franja..."
                  value={filtroDisponibilidad}
                  onChange={(e) => {
                    setFiltroDisponibilidad(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Fecha..."
                  value={filtroFecha}
                  onChange={(e) => {
                    setFiltroFecha(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroEstado}
                  onChange={(e) => {
                    setFiltroEstado(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                >
                  <option value="">Todos</option>
                  <option value="NUEVO">Nuevo</option>
                  <option value="EN_ADMISION">En admisión</option>
                  <option value="ADMITIDA">Admitida</option>
                </select>
              </th>
              <th style={{ padding: '6px 6px', textAlign: 'right' }}>
                {hayFiltros ? (
                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="boton-mini"
                    style={{ padding: '4px 6px', color: 'var(--color-red, #dc2626)' }}
                    title="Limpiar filtros"
                  >
                    <X size={13} />
                  </button>
                ) : null}
              </th>
            </tr>
          </thead>
          <tbody>
            {listaPaginada.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>
                  <Vacio>
                    {hayFiltros
                      ? 'Ninguna solicitud coincide con los filtros de columna aplicados.'
                      : 'Todavía no ha llegado ninguna solicitud.'}
                  </Vacio>
                </td>
              </tr>
            ) : (
              listaPaginada.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="tabla__principal">{nombrePropio(s.name)}</span>
                    <span className="tabla__secundario">
                      {s.phone}
                      {s.isMinor ? ' · menor de edad' : ''}
                    </span>
                  </td>
                  <td>{s.city ?? '—'}</td>
                  <td>
                    <ResultadoTamizaje
                      respuesta={s.tamizaje?.respuesta ?? null}
                      diasParaAdmision={s.tamizaje?.diasParaAdmisionAutomatica ?? null}
                      yaAdmitida={s.status !== 'NUEVO'}
                    />
                  </td>
                  <td>
                    <span className="tabla__secundario" style={{ marginTop: 0 }}>
                      {s.availableDays?.length
                        ? s.availableDays.map((d) => DIA_CORTO[d] ?? d).join(' ')
                        : '—'}
                      {s.availableSlots?.length
                        ? ` · ${s.availableSlots.map((f) => FRANJA_CORTA[f] ?? f).join(', ')}`
                        : ''}
                    </span>
                  </td>
                  <td className="tabla__numero">{enBogota(s.createdAt, false)}</td>
                  <td>
                    <Etiqueta estado={s.status} />
                  </td>
                  <td className="tabla__acciones">
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'flex-end' }}>
                      <BotonTamizaje
                        nombre={s.name}
                        telefono={s.phone}
                        enlace={s.tamizaje?.enlace ?? null}
                        yaRespondio={Boolean(s.tamizaje?.respuesta)}
                      />
                      {esAdmin && (
                        <BotonAdmitirSolicitud
                          solicitudId={s.id}
                          nombrePersona={s.name}
                          yaAdmitida={s.status !== 'NUEVO'}
                        />
                      )}
                      {esAdmin && <BotonEditarSolicitud solicitud={s} />}
                      {esAdmin && (
                        <BotonEliminarSolicitud
                          solicitudId={s.id}
                          nombrePersona={s.name}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginacionTabla
        pagina={paginaAjustada}
        porPagina={porPagina}
        totalFiltrado={totalFiltradas}
        totalGeneral={solicitudes.length}
        alCambiarPagina={setPagina}
        alCambiarPorPagina={(n) => {
          setPorPagina(n)
          setPagina(1)
        }}
      />
    </>
  )
}
