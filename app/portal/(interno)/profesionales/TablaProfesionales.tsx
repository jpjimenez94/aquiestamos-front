'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowUpDown, ArrowUp, ArrowDown, X, RotateCcw } from 'lucide-react'
import { Etiqueta, Vacio } from '../componentes'
import { PaginacionTabla } from '../PaginacionTabla'
import { BotonVerificarTarjeta } from '@/components/portal/BotonVerificarTarjeta'
import { nombrePropio } from '@/lib/nombre'
import { enBogota } from '@/lib/fechas'

export type Profesional = {
  enlaceDocumentos?: string | null
  id: string
  fullName: string
  email?: string | null
  phone?: string
  profession: string
  city: string
  modality: string
  populations: string[]
  professionalCardVerified?: boolean
  professionalCardVerifiedAt?: string | null
  professionalCardVerifiedBy?: string | null
  professionalCardNumber?: string | null
  professionalCardDocumentUrl?: string | null
  status: string
  estadoLegible: string
  maxActiveCases: number
  carga: number
}

type ColumnaOrden = 'profesional' | 'poblaciones' | 'modalidad' | 'carga' | 'tarjeta' | 'estado'
type Direccion = 'asc' | 'desc'

const estiloInputFiltro: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  fontSize: '0.76rem',
  border: '1px solid var(--color-border-default, #cbd5e1)',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: 'var(--color-text-main, #1e293b)',
  outline: 'none',
  boxSizing: 'border-box',
  minHeight: '28px',
  fontWeight: 'normal',
}

export function TablaProfesionales({ profesionales }: { profesionales: Profesional[] }) {
  const [filtroProfesional, setFiltroProfesional] = useState('')
  const [filtroPoblaciones, setFiltroPoblaciones] = useState('')
  const [filtroModalidad, setFiltroModalidad] = useState('')
  const [filtroCupo, setFiltroCupo] = useState('')
  const [filtroTarjeta, setFiltroTarjeta] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  const [columnaOrden, setColumnaOrden] = useState<ColumnaOrden>('profesional')
  const [direccion, setDireccion] = useState<Direccion>('asc')

  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(25)

  function alternarOrden(col: ColumnaOrden) {
    if (columnaOrden === col) {
      setDireccion(direccion === 'asc' ? 'desc' : 'asc')
    } else {
      setColumnaOrden(col)
      setDireccion('asc')
    }
  }

  const hayFiltros = Boolean(
    filtroProfesional.trim() ||
      filtroPoblaciones.trim() ||
      filtroModalidad ||
      filtroCupo ||
      filtroTarjeta ||
      filtroEstado,
  )

  function limpiarFiltros() {
    setFiltroProfesional('')
    setFiltroPoblaciones('')
    setFiltroModalidad('')
    setFiltroCupo('')
    setFiltroTarjeta('')
    setFiltroEstado('')
    setPagina(1)
  }

  const listaFiltrada = useMemo(() => {
    return profesionales.filter((p) => {
      if (filtroProfesional.trim()) {
        const q = filtroProfesional.toLowerCase().trim()
        const matchNombre = p.fullName.toLowerCase().includes(q)
        const matchCiudad = p.city?.toLowerCase().includes(q)
        const matchProfesion = p.profession?.toLowerCase().includes(q)
        const matchTelefono = p.phone?.includes(q)
        if (!matchNombre && !matchCiudad && !matchProfesion && !matchTelefono) {
          return false
        }
      }

      if (filtroPoblaciones.trim()) {
        const q = filtroPoblaciones.toLowerCase().trim()
        const matchPop = p.populations?.some((pop) => pop.toLowerCase().includes(q))
        if (!matchPop) return false
      }

      if (filtroModalidad && p.modality !== filtroModalidad) {
        return false
      }

      if (filtroCupo) {
        if (filtroCupo === 'CON_CUPO' && p.carga >= p.maxActiveCases) return false
        if (filtroCupo === 'SIN_CUPO' && p.carga < p.maxActiveCases) return false
      }

      if (filtroTarjeta) {
        if (filtroTarjeta === 'VERIFICADA' && !p.professionalCardVerified) return false
        if (filtroTarjeta === 'SIN_VERIFICAR' && p.professionalCardVerified) return false
      }

      if (filtroEstado && p.status !== filtroEstado) {
        return false
      }

      return true
    })
  }, [
    profesionales,
    filtroProfesional,
    filtroPoblaciones,
    filtroModalidad,
    filtroCupo,
    filtroTarjeta,
    filtroEstado,
  ])

  const listaOrdenada = useMemo(() => {
    return [...listaFiltrada].sort((a, b) => {
      let cmp = 0
      switch (columnaOrden) {
        case 'profesional':
          cmp = a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' })
          break
        case 'poblaciones': {
          const popA = a.populations?.join(', ') || ''
          const popB = b.populations?.join(', ') || ''
          cmp = popA.localeCompare(popB, 'es', { sensitivity: 'base' })
          break
        }
        case 'modalidad':
          cmp = a.modality.localeCompare(b.modality, 'es', { sensitivity: 'base' })
          break
        case 'carga': {
          cmp = a.carga - b.carga || a.maxActiveCases - b.maxActiveCases
          break
        }
        case 'tarjeta': {
          const verA = a.professionalCardVerified ? 1 : 0
          const verB = b.professionalCardVerified ? 1 : 0
          const dateA = a.professionalCardVerifiedAt || ''
          const dateB = b.professionalCardVerifiedAt || ''
          cmp = verA - verB || dateA.localeCompare(dateB) || (a.professionalCardNumber || '').localeCompare(b.professionalCardNumber || '')
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
          <strong>{listaOrdenada.length}</strong> {listaOrdenada.length === 1 ? 'profesional' : 'profesionales'}
          {hayFiltros ? ` (filtrado de ${profesionales.length} en total)` : ''}
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
                onClick={() => alternarOrden('profesional')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '24%' }}
                title="Ordenar por Profesional"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Profesional
                  <IconoOrden col="profesional" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('poblaciones')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '18%' }}
                title="Ordenar por Poblaciones"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Poblaciones
                  <IconoOrden col="poblaciones" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('modalidad')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '15%' }}
                title="Ordenar por Modalidad de apoyo"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Modalidad de apoyo
                  <IconoOrden col="modalidad" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('carga')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '10%' }}
                title="Ordenar por Carga"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Carga
                  <IconoOrden col="carga" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('tarjeta')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '15%' }}
                title="Ordenar por Tarjeta Profesional"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Tarjeta Profesional
                  <IconoOrden col="tarjeta" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('estado')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '10%' }}
                title="Ordenar por Estado"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Estado
                  <IconoOrden col="estado" />
                </span>
              </th>
              <th style={{ width: '8%', textAlign: 'right' }} />
            </tr>

            {/* Fila de filtros por columna */}
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '6px 8px' }}>
                <input
                  type="text"
                  placeholder="Filtrar nombre/ciudad..."
                  value={filtroProfesional}
                  onChange={(e) => {
                    setFiltroProfesional(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 8px' }}>
                <input
                  type="text"
                  placeholder="Filtrar población..."
                  value={filtroPoblaciones}
                  onChange={(e) => {
                    setFiltroPoblaciones(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 8px' }}>
                <select
                  value={filtroModalidad}
                  onChange={(e) => {
                    setFiltroModalidad(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                >
                  <option value="">Todas</option>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="VIRTUAL">Virtual</option>
                  <option value="AMBAS">Ambas</option>
                </select>
              </th>
              <th style={{ padding: '6px 8px' }}>
                <select
                  value={filtroCupo}
                  onChange={(e) => {
                    setFiltroCupo(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                >
                  <option value="">Todas</option>
                  <option value="CON_CUPO">Con cupo</option>
                  <option value="SIN_CUPO">Sin cupo</option>
                </select>
              </th>
              <th style={{ padding: '6px 8px' }}>
                <select
                  value={filtroTarjeta}
                  onChange={(e) => {
                    setFiltroTarjeta(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                >
                  <option value="">Todas</option>
                  <option value="VERIFICADA">Verificada</option>
                  <option value="SIN_VERIFICAR">Sin verificar</option>
                </select>
              </th>
              <th style={{ padding: '6px 8px' }}>
                <select
                  value={filtroEstado}
                  onChange={(e) => {
                    setFiltroEstado(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                >
                  <option value="">Todos</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="PAUSADO">Pausado</option>
                  <option value="INACTIVO">Inactivo</option>
                  <option value="PENDIENTE_VALIDACION">Pendiente</option>
                </select>
              </th>
              <th style={{ padding: '6px 8px', textAlign: 'right' }}>
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
                      ? 'Ningún profesional coincide con los filtros de columna aplicados.'
                      : 'Todavía no hay profesionales registrados.'}
                  </Vacio>
                </td>
              </tr>
            ) : (
              listaPaginada.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/portal/profesionales/${p.id}`} className="tabla__principal">
                      {nombrePropio(p.fullName)}
                    </Link>
                    <span className="tabla__secundario">
                      {p.profession} · {p.city}
                    </span>
                  </td>
                  <td className="tabla__secundario" style={{ marginTop: 0 }}>
                    {p.populations?.slice(0, 3).join(', ') || '—'}
                    {p.populations?.length > 3 ? '…' : ''}
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        textTransform: 'capitalize',
                        fontWeight: 500,
                      }}
                    >
                      {p.modality === 'AMBAS'
                        ? 'Presencial y virtual'
                        : p.modality === 'PRESENCIAL'
                        ? 'Presencial'
                        : 'Virtual'}
                    </span>
                  </td>
                  <td className="tabla__numero">
                    {p.carga} / {p.maxActiveCases}
                    {p.carga >= p.maxActiveCases ? (
                      <span className="tabla__secundario" style={{ color: 'var(--color-red)' }}>
                        sin cupo
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <BotonVerificarTarjeta
                      profesionalId={p.id}
                      profesionalNombre={p.fullName}
                      profesionalTelefono={p.phone}
                      profesionalEmail={p.email}
                      verificada={p.professionalCardVerified}
                      verificadaAt={p.professionalCardVerifiedAt}
                      verificadaPor={p.professionalCardVerifiedBy}
                      numero={p.professionalCardNumber}
                      documentoUrl={p.professionalCardDocumentUrl}
                      enlaceDocumentos={p.enlaceDocumentos ?? null}
                    />
                    {p.professionalCardVerified && p.professionalCardVerifiedAt ? (
                      <span className="tabla__secundario" style={{ fontSize: '0.72rem', marginTop: 3, display: 'block' }}>
                        Verificada: {enBogota(p.professionalCardVerifiedAt, false)}
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <Etiqueta estado={p.status} texto={p.estadoLegible} />
                  </td>
                  <td className="tabla__acciones">
                    <Link className="boton-mini" href={`/portal/profesionales/${p.id}`}>
                      Abrir
                    </Link>
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
        totalGeneral={profesionales.length}
        alCambiarPagina={setPagina}
        alCambiarPorPagina={(n) => {
          setPorPagina(n)
          setPagina(1)
        }}
      />
    </>
  )
}
