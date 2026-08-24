'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X } from 'lucide-react'
import { Etiqueta, Vacio } from '../componentes'
import { BotonVerificarTarjeta } from '@/components/portal/BotonVerificarTarjeta'
import { nombrePropio } from '@/lib/nombre'

export type Profesional = {
  enlaceDocumentos?: string | null
  id: string
  fullName: string
  phone?: string
  profession: string
  city: string
  modality: string
  populations: string[]
  professionalCardVerified?: boolean
  professionalCardNumber?: string | null
  professionalCardDocumentUrl?: string | null
  status: string
  estadoLegible: string
  maxActiveCases: number
  carga: number
}

type ColumnaOrden = 'profesional' | 'poblaciones' | 'modalidad' | 'carga' | 'tarjeta' | 'estado'
type Direccion = 'asc' | 'desc'

export function TablaProfesionales({ profesionales }: { profesionales: Profesional[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroModalidad, setFiltroModalidad] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroTarjeta, setFiltroTarjeta] = useState('')
  const [filtroCupo, setFiltroCupo] = useState('')

  const [columnaOrden, setColumnaOrden] = useState<ColumnaOrden>('profesional')
  const [direccion, setDireccion] = useState<Direccion>('asc')

  function alternarOrden(col: ColumnaOrden) {
    if (columnaOrden === col) {
      setDireccion(direccion === 'asc' ? 'desc' : 'asc')
    } else {
      setColumnaOrden(col)
      setDireccion('asc')
    }
  }

  const hayFiltros = Boolean(
    busqueda.trim() || filtroModalidad || filtroEstado || filtroTarjeta || filtroCupo,
  )

  function limpiarFiltros() {
    setBusqueda('')
    setFiltroModalidad('')
    setFiltroEstado('')
    setFiltroTarjeta('')
    setFiltroCupo('')
  }

  const listaFiltrada = useMemo(() => {
    return profesionales.filter((p) => {
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim()
        const matchNombre = p.fullName.toLowerCase().includes(q)
        const matchCiudad = p.city.toLowerCase().includes(q)
        const matchProfesion = p.profession.toLowerCase().includes(q)
        const matchPoblaciones = p.populations?.some((pop) => pop.toLowerCase().includes(q))
        const matchTelefono = p.phone?.includes(q)
        if (!matchNombre && !matchCiudad && !matchProfesion && !matchPoblaciones && !matchTelefono) {
          return false
        }
      }

      if (filtroModalidad && p.modality !== filtroModalidad) {
        return false
      }

      if (filtroEstado && p.status !== filtroEstado) {
        return false
      }

      if (filtroTarjeta) {
        if (filtroTarjeta === 'VERIFICADA' && !p.professionalCardVerified) return false
        if (filtroTarjeta === 'SIN_VERIFICAR' && p.professionalCardVerified) return false
      }

      if (filtroCupo) {
        if (filtroCupo === 'CON_CUPO' && p.carga >= p.maxActiveCases) return false
        if (filtroCupo === 'SIN_CUPO' && p.carga < p.maxActiveCases) return false
      }

      return true
    })
  }, [profesionales, busqueda, filtroModalidad, filtroEstado, filtroTarjeta, filtroCupo])

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
          // Ordenar por ocupación o carga absoluta
          cmp = a.carga - b.carga || a.maxActiveCases - b.maxActiveCases
          break
        }
        case 'tarjeta': {
          const verA = a.professionalCardVerified ? 1 : 0
          const verB = b.professionalCardVerified ? 1 : 0
          cmp = verA - verB || (a.professionalCardNumber || '').localeCompare(b.professionalCardNumber || '')
          break
        }
        case 'estado':
          cmp = a.status.localeCompare(b.status, 'es', { sensitivity: 'base' })
          break
      }
      return direccion === 'asc' ? cmp : -cmp
    })
  }, [listaFiltrada, columnaOrden, direccion])

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

  return (
    <>
      <div
        className="filtros"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 16,
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', minWidth: 220, flex: '1 1 220px' }}>
          <input
            className="input"
            type="text"
            placeholder="Buscar por nombre, profesión, ciudad, población..."
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

        <select
          className="input"
          value={filtroModalidad}
          onChange={(e) => setFiltroModalidad(e.target.value)}
          style={{ minWidth: 150 }}
        >
          <option value="">Todas las modalidades</option>
          <option value="PRESENCIAL">Presencial</option>
          <option value="VIRTUAL">Virtual</option>
          <option value="AMBAS">Ambas (Presencial y Virtual)</option>
        </select>

        <select
          className="input"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          style={{ minWidth: 140 }}
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="PAUSADO">Pausado</option>
          <option value="INACTIVO">Inactivo</option>
          <option value="PENDIENTE_VALIDACION">Pendiente validación</option>
        </select>

        <select
          className="input"
          value={filtroTarjeta}
          onChange={(e) => setFiltroTarjeta(e.target.value)}
          style={{ minWidth: 150 }}
        >
          <option value="">Tarjeta Profesional</option>
          <option value="VERIFICADA">Verificada</option>
          <option value="SIN_VERIFICAR">Sin verificar</option>
        </select>

        <select
          className="input"
          value={filtroCupo}
          onChange={(e) => setFiltroCupo(e.target.value)}
          style={{ minWidth: 130 }}
        >
          <option value="">Cupo / Carga</option>
          <option value="CON_CUPO">Con cupo disponible</option>
          <option value="SIN_CUPO">Sin cupo (al límite)</option>
        </select>

        {hayFiltros ? (
          <button
            type="button"
            className="boton-mini"
            onClick={limpiarFiltros}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <X size={13} />
            Limpiar filtros
          </button>
        ) : null}
      </div>

      <p className="panel__nota" style={{ margin: '0 0 10px', fontSize: '0.8rem' }}>
        {listaOrdenada.length} {listaOrdenada.length === 1 ? 'profesional' : 'profesionales'}
        {hayFiltros ? ` de ${profesionales.length} registrados` : ''}
      </p>

      {listaOrdenada.length === 0 ? (
        <Vacio>
          {hayFiltros
            ? 'Ningún profesional coincide con los filtros aplicados.'
            : 'Todavía no hay profesionales registrados.'}
        </Vacio>
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th
                  onClick={() => alternarOrden('profesional')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por Profesional"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Profesional
                    <IconoOrden col="profesional" />
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('poblaciones')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por Poblaciones"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Poblaciones
                    <IconoOrden col="poblaciones" />
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('modalidad')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por Modalidad de apoyo"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Modalidad de apoyo
                    <IconoOrden col="modalidad" />
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('carga')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por Carga"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Carga
                    <IconoOrden col="carga" />
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('tarjeta')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por Tarjeta Profesional"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Tarjeta Profesional
                    <IconoOrden col="tarjeta" />
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('estado')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por Estado"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Estado
                    <IconoOrden col="estado" />
                  </span>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {listaOrdenada.map((p) => (
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
                      verificada={p.professionalCardVerified}
                      numero={p.professionalCardNumber}
                      documentoUrl={p.professionalCardDocumentUrl}
                      enlaceDocumentos={p.enlaceDocumentos ?? null}
                    />
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
