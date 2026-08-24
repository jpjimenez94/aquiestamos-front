'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X, UserCheck, Calendar, MessageSquare } from 'lucide-react'
import { Etiqueta, Vacio } from '../componentes'
import { BotonSeguimientoWhatsApp } from './BotonSeguimientoWhatsApp'
import { BotonEliminarPersona } from './BotonEliminarPersona'
import { nombrePropio } from '@/lib/nombre'
import { enBogota } from '@/lib/fechas'

export type Persona = {
  id: string
  fullName: string
  phone: string
  city: string
  isMinor: boolean
  preferredModality: string | null
  availableDays: string[]
  availableSlots: string[]
  status: string
  estadoLegible: string
  priority: string
  prioridadLegible: string
  createdAt: string
  diasEsperando: number
  cita?: {
    id: string
    inicio: string
    fin: string
    inicioLocal?: string
    finLocal?: string
    modalidad: string
    estado: string
    estadoLegible: string
    profesional?: string | null
    notas?: string | null
    motivoCancelacion?: string | null
  } | null
  asignacion?: {
    id: string
    desde?: string
    estado?: string
    notaDisponibilidad?: string | null
    motivoCierre?: string | null
    profesional?: {
      id: string
      nombre: string
      telefono?: string
      email?: string
    } | null
  } | null
  comentarios?: string | null
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

type ColumnaOrden =
  | 'persona'
  | 'profesional'
  | 'cita'
  | 'comentarios'
  | 'ciudad'
  | 'esperando'
  | 'prioridad'
  | 'estado'

type Direccion = 'asc' | 'desc'

export function TablaPersonas({
  personas,
  enlaceDelSitio,
  puedeBorrar = false,
}: {
  personas: Persona[]
  enlaceDelSitio: string
  puedeBorrar?: boolean
}) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroPrioridad, setFiltroPrioridad] = useState('')
  const [filtroAsignacion, setFiltroAsignacion] = useState('')
  const [filtroCita, setFiltroCita] = useState('')
  const [filtroModalidad, setFiltroModalidad] = useState('')

  const [columnaOrden, setColumnaOrden] = useState<ColumnaOrden>('esperando')
  const [direccion, setDireccion] = useState<Direccion>('desc')

  function alternarOrden(col: ColumnaOrden) {
    if (columnaOrden === col) {
      setDireccion(direccion === 'asc' ? 'desc' : 'asc')
    } else {
      setColumnaOrden(col)
      setDireccion(col === 'esperando' ? 'desc' : 'asc')
    }
  }

  const hayFiltros = Boolean(
    busqueda.trim() ||
      filtroEstado ||
      filtroPrioridad ||
      filtroAsignacion ||
      filtroCita ||
      filtroModalidad,
  )

  function limpiarFiltros() {
    setBusqueda('')
    setFiltroEstado('')
    setFiltroPrioridad('')
    setFiltroAsignacion('')
    setFiltroCita('')
    setFiltroModalidad('')
  }

  const listaFiltrada = useMemo(() => {
    return personas.filter((p) => {
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim()
        const matchNombre = p.fullName.toLowerCase().includes(q)
        const matchTelefono = p.phone?.includes(q)
        const matchCiudad = p.city?.toLowerCase().includes(q)
        const matchProfesional = p.asignacion?.profesional?.nombre?.toLowerCase().includes(q)
        const matchNotas = p.comentarios?.toLowerCase().includes(q) || p.cita?.notas?.toLowerCase().includes(q)
        if (!matchNombre && !matchTelefono && !matchCiudad && !matchProfesional && !matchNotas) {
          return false
        }
      }

      if (filtroEstado && p.status !== filtroEstado) {
        return false
      }

      if (filtroPrioridad && p.priority !== filtroPrioridad) {
        return false
      }

      if (filtroAsignacion) {
        if (filtroAsignacion === 'ASIGNADO' && !p.asignacion?.profesional) return false
        if (filtroAsignacion === 'SIN_ASIGNAR' && p.asignacion?.profesional) return false
      }

      if (filtroCita) {
        if (filtroCita === 'CON_CITA' && !p.cita) return false
        if (filtroCita === 'SIN_CITA' && p.cita) return false
      }

      if (filtroModalidad && p.preferredModality !== filtroModalidad) {
        return false
      }

      return true
    })
  }, [
    personas,
    busqueda,
    filtroEstado,
    filtroPrioridad,
    filtroAsignacion,
    filtroCita,
    filtroModalidad,
  ])

  const listaOrdenada = useMemo(() => {
    return [...listaFiltrada].sort((a, b) => {
      let cmp = 0
      switch (columnaOrden) {
        case 'persona':
          cmp = a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' })
          break
        case 'profesional': {
          const profA = a.asignacion?.profesional?.nombre || ''
          const profB = b.asignacion?.profesional?.nombre || ''
          cmp = profA.localeCompare(profB, 'es', { sensitivity: 'base' })
          break
        }
        case 'cita': {
          const tA = a.cita?.inicio ? new Date(a.cita.inicio).getTime() : 0
          const tB = b.cita?.inicio ? new Date(b.cita.inicio).getTime() : 0
          cmp = tA - tB
          break
        }
        case 'comentarios': {
          const comA = a.comentarios || a.cita?.notas || ''
          const comB = b.comentarios || b.cita?.notas || ''
          cmp = comA.localeCompare(comB, 'es', { sensitivity: 'base' })
          break
        }
        case 'ciudad':
          cmp = a.city.localeCompare(b.city, 'es', { sensitivity: 'base' })
          break
        case 'esperando':
          cmp = a.diasEsperando - b.diasEsperando
          break
        case 'prioridad': {
          const peso: Record<string, number> = { ALTA: 3, MEDIA: 2, BAJA: 1 }
          cmp = (peso[a.priority] ?? 0) - (peso[b.priority] ?? 0)
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
            placeholder="Buscar por nombre, teléfono, ciudad, profesional, notas..."
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
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          style={{ minWidth: 140 }}
        >
          <option value="">Todos los estados</option>
          <option value="NUEVO">Nuevo</option>
          <option value="EN_ADMISION">En admisión</option>
          <option value="ASIGNADO">Asignado</option>
          <option value="EN_ACOMPANAMIENTO">En acompañamiento</option>
          <option value="CERRADO">Cerrado</option>
        </select>

        <select
          className="input"
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value)}
          style={{ minWidth: 120 }}
        >
          <option value="">Prioridad</option>
          <option value="ALTA">Alta</option>
          <option value="MEDIA">Media</option>
          <option value="BAJA">Baja</option>
        </select>

        <select
          className="input"
          value={filtroAsignacion}
          onChange={(e) => setFiltroAsignacion(e.target.value)}
          style={{ minWidth: 140 }}
        >
          <option value="">Asignación</option>
          <option value="ASIGNADO">Con profesional</option>
          <option value="SIN_ASIGNAR">Sin asignar</option>
        </select>

        <select
          className="input"
          value={filtroCita}
          onChange={(e) => setFiltroCita(e.target.value)}
          style={{ minWidth: 130 }}
        >
          <option value="">Cita en agenda</option>
          <option value="CON_CITA">Con cita</option>
          <option value="SIN_CITA">Sin cita</option>
        </select>

        <select
          className="input"
          value={filtroModalidad}
          onChange={(e) => setFiltroModalidad(e.target.value)}
          style={{ minWidth: 130 }}
        >
          <option value="">Modalidad</option>
          <option value="PRESENCIAL">Presencial</option>
          <option value="VIRTUAL">Virtual</option>
          <option value="INDIFERENTE">Indiferente</option>
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
        {listaOrdenada.length} {listaOrdenada.length === 1 ? 'persona' : 'personas'}
        {hayFiltros ? ` de ${personas.length} registradas` : ''}
      </p>

      {listaOrdenada.length === 0 ? (
        <Vacio>
          {hayFiltros
            ? 'Ninguna persona coincide con los filtros aplicados.'
            : 'Todavía no hay personas admitidas.'}
        </Vacio>
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th
                  onClick={() => alternarOrden('persona')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por Persona"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Persona Acompañada
                    <IconoOrden col="persona" />
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('profesional')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por Profesional"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Profesional Asignado
                    <IconoOrden col="profesional" />
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('cita')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por Cita en Agenda"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Cita en Agenda
                    <IconoOrden col="cita" />
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('comentarios')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por Comentarios / Notas"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Comentarios y Notas
                    <IconoOrden col="comentarios" />
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('ciudad')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por Ciudad"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Ciudad
                    <IconoOrden col="ciudad" />
                  </span>
                </th>
                <th>Disponibilidad</th>
                <th
                  onClick={() => alternarOrden('esperando')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por Tiempo de espera"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Esperando
                    <IconoOrden col="esperando" />
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('prioridad')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Ordenar por Prioridad"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Prioridad
                    <IconoOrden col="prioridad" />
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
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaOrdenada.map((p) => {
                const cita = p.cita
                const comentarios = p.comentarios || cita?.notas || p.asignacion?.notaDisponibilidad

                return (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/portal/personas/${p.id}`} className="tabla__principal">
                        {nombrePropio(p.fullName)}
                      </Link>
                      <span className="tabla__secundario">
                        {p.phone}
                        {p.isMinor ? ' · menor de edad' : ''}
                        {p.preferredModality ? ` · ${p.preferredModality.toLowerCase()}` : ''}
                      </span>
                    </td>

                    {/* Profesional Asignado */}
                    <td>
                      {p.asignacion?.profesional ? (
                        <div>
                          <Link
                            href={`/portal/profesionales/${p.asignacion.profesional.id}`}
                            style={{
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <UserCheck size={14} style={{ color: '#059669' }} />
                            {p.asignacion.profesional.nombre}
                          </Link>
                          {p.asignacion.profesional.telefono && (
                            <span className="tabla__secundario">
                              Tel: {p.asignacion.profesional.telefono}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="tabla__secundario" style={{ color: '#d97706' }}>
                          — Sin asignar —
                        </span>
                      )}
                    </td>

                    {/* Columna Cita en Agenda */}
                    <td>
                      {cita ? (
                        <div>
                          <Link
                            href={`/portal/agenda/${cita.id}`}
                            style={{
                              fontWeight: 600,
                              fontSize: '0.84rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Calendar size={13} style={{ color: 'var(--color-primary, #059669)' }} />
                            {cita.inicioLocal ?? enBogota(cita.inicio)}
                          </Link>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 2 }}>
                            <Etiqueta estado={cita.estado} texto={cita.estadoLegible} />
                            <span className="tabla__secundario" style={{ textTransform: 'capitalize' }}>
                              {cita.modalidad?.toLowerCase()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="tabla__secundario">— Sin cita —</span>
                      )}
                    </td>

                    {/* Columna Comentarios y Notas */}
                    <td style={{ maxWidth: 220 }}>
                      {comentarios ? (
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: '#334155',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.35,
                          }}
                          title={comentarios}
                        >
                          {comentarios}
                        </span>
                      ) : (
                        <span className="tabla__secundario">—</span>
                      )}
                    </td>

                    <td>{p.city}</td>

                    <td className="tabla__secundario" style={{ marginTop: 0 }}>
                      {p.availableDays?.length
                        ? p.availableDays.map((d) => DIA_CORTO[d] ?? d).join(' ')
                        : '—'}
                    </td>

                    <td className="tabla__numero">
                      {p.diasEsperando} {p.diasEsperando === 1 ? 'día' : 'días'}
                      <span className="tabla__secundario">{enBogota(p.createdAt, false)}</span>
                    </td>

                    <td>
                      <Etiqueta estado={p.priority} texto={p.prioridadLegible} />
                    </td>

                    <td>
                      <Etiqueta estado={p.status} texto={p.estadoLegible} />
                    </td>

                    <td className="tabla__acciones">
                      <div
                        style={{
                          display: 'flex',
                          gap: 6,
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                        }}
                      >
                        {p.asignacion?.profesional && (
                          <BotonSeguimientoWhatsApp
                            pacienteNombre={p.fullName}
                            pacienteTelefono={p.phone}
                            profesionalNombre={p.asignacion.profesional.nombre}
                            profesionalTelefono={p.asignacion.profesional.telefono}
                            enlaceCaso={`${enlaceDelSitio}/portal/caso/${p.id}`}
                          />
                        )}
                        <Link className="boton-mini" href={`/portal/personas/${p.id}`}>
                          Abrir
                        </Link>
                        {puedeBorrar ? (
                          <BotonEliminarPersona personaId={p.id} personaNombre={p.fullName} />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
