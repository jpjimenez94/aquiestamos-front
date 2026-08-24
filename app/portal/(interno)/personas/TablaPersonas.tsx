'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowUpDown, ArrowUp, ArrowDown, X, UserCheck, Calendar, RotateCcw } from 'lucide-react'
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

export function TablaPersonas({
  personas,
  enlaceDelSitio,
  puedeBorrar = false,
}: {
  personas: Persona[]
  enlaceDelSitio: string
  puedeBorrar?: boolean
}) {
  const [filtroPersona, setFiltroPersona] = useState('')
  const [filtroProfesional, setFiltroProfesional] = useState('')
  const [filtroCita, setFiltroCita] = useState('')
  const [filtroComentarios, setFiltroComentarios] = useState('')
  const [filtroCiudad, setFiltroCiudad] = useState('')
  const [filtroPrioridad, setFiltroPrioridad] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

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
    filtroPersona.trim() ||
      filtroProfesional.trim() ||
      filtroCita ||
      filtroComentarios.trim() ||
      filtroCiudad.trim() ||
      filtroPrioridad ||
      filtroEstado,
  )

  function limpiarFiltros() {
    setFiltroPersona('')
    setFiltroProfesional('')
    setFiltroCita('')
    setFiltroComentarios('')
    setFiltroCiudad('')
    setFiltroPrioridad('')
    setFiltroEstado('')
  }

  const listaFiltrada = useMemo(() => {
    return personas.filter((p) => {
      if (filtroPersona.trim()) {
        const q = filtroPersona.toLowerCase().trim()
        const matchNombre = p.fullName.toLowerCase().includes(q)
        const matchTelefono = p.phone?.includes(q)
        if (!matchNombre && !matchTelefono) return false
      }

      if (filtroProfesional.trim()) {
        const q = filtroProfesional.toLowerCase().trim()
        const matchProf = p.asignacion?.profesional?.nombre?.toLowerCase().includes(q)
        if (!matchProf) return false
      }

      if (filtroCita) {
        if (filtroCita === 'CON_CITA' && !p.cita) return false
        if (filtroCita === 'SIN_CITA' && p.cita) return false
        if (filtroCita === 'PROGRAMADA' && p.cita?.estado !== 'PROGRAMADA') return false
        if (filtroCita === 'CONFIRMADA' && p.cita?.estado !== 'CONFIRMADA') return false
        if (filtroCita === 'REALIZADA' && p.cita?.estado !== 'REALIZADA') return false
      }

      if (filtroComentarios.trim()) {
        const q = filtroComentarios.toLowerCase().trim()
        const notas = (p.comentarios || p.cita?.notas || p.asignacion?.notaDisponibilidad || '').toLowerCase()
        if (!notas.includes(q)) return false
      }

      if (filtroCiudad.trim()) {
        const q = filtroCiudad.toLowerCase().trim()
        if (!p.city?.toLowerCase().includes(q)) return false
      }

      if (filtroPrioridad && p.priority !== filtroPrioridad) {
        return false
      }

      if (filtroEstado && p.status !== filtroEstado) {
        return false
      }

      return true
    })
  }, [
    personas,
    filtroPersona,
    filtroProfesional,
    filtroCita,
    filtroComentarios,
    filtroCiudad,
    filtroPrioridad,
    filtroEstado,
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
          <strong>{listaOrdenada.length}</strong> {listaOrdenada.length === 1 ? 'persona' : 'personas'}
          {hayFiltros ? ` (filtrado de ${personas.length} en total)` : ''}
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
                style={{ cursor: 'pointer', userSelect: 'none', width: '18%' }}
                title="Ordenar por Persona"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Persona Acompañada
                  <IconoOrden col="persona" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('profesional')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '15%' }}
                title="Ordenar por Profesional"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Profesional Asignado
                  <IconoOrden col="profesional" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('cita')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '13%' }}
                title="Ordenar por Cita en Agenda"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Cita en Agenda
                  <IconoOrden col="cita" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('comentarios')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '13%' }}
                title="Ordenar por Comentarios / Notas"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Comentarios y Notas
                  <IconoOrden col="comentarios" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('ciudad')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '10%' }}
                title="Ordenar por Ciudad"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Ciudad
                  <IconoOrden col="ciudad" />
                </span>
              </th>
              <th style={{ width: '8%' }}>Disponibilidad</th>
              <th
                onClick={() => alternarOrden('esperando')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '8%' }}
                title="Ordenar por Tiempo de espera"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Esperando
                  <IconoOrden col="esperando" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('prioridad')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '7%' }}
                title="Ordenar por Prioridad"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Prioridad
                  <IconoOrden col="prioridad" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('estado')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '8%' }}
                title="Ordenar por Estado"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Estado
                  <IconoOrden col="estado" />
                </span>
              </th>
              <th style={{ width: puedeBorrar ? '10%' : '7%', textAlign: 'right' }}>Acciones</th>
            </tr>

            {/* Fila de filtros por columna */}
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Nombre/teléfono..."
                  value={filtroPersona}
                  onChange={(e) => setFiltroPersona(e.target.value)}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Profesional..."
                  value={filtroProfesional}
                  onChange={(e) => setFiltroProfesional(e.target.value)}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroCita}
                  onChange={(e) => setFiltroCita(e.target.value)}
                  style={estiloInputFiltro}
                >
                  <option value="">Todas</option>
                  <option value="CON_CITA">Con cita</option>
                  <option value="SIN_CITA">Sin cita</option>
                  <option value="PROGRAMADA">Programada</option>
                  <option value="CONFIRMADA">Confirmada</option>
                  <option value="REALIZADA">Realizada</option>
                </select>
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Filtrar notas..."
                  value={filtroComentarios}
                  onChange={(e) => setFiltroComentarios(e.target.value)}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Ciudad..."
                  value={filtroCiudad}
                  onChange={(e) => setFiltroCiudad(e.target.value)}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }} />
              <th style={{ padding: '6px 6px' }} />
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroPrioridad}
                  onChange={(e) => setFiltroPrioridad(e.target.value)}
                  style={estiloInputFiltro}
                >
                  <option value="">Todas</option>
                  <option value="ALTA">Alta</option>
                  <option value="MEDIA">Media</option>
                  <option value="BAJA">Baja</option>
                </select>
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  style={estiloInputFiltro}
                >
                  <option value="">Todos</option>
                  <option value="NUEVO">Nuevo</option>
                  <option value="EN_ADMISION">En admisión</option>
                  <option value="ASIGNADO">Asignado</option>
                  <option value="EN_ACOMPANAMIENTO">Acompañamiento</option>
                  <option value="CERRADO">Cerrado</option>
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
            {listaOrdenada.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: 24 }}>
                  <Vacio>
                    {hayFiltros
                      ? 'Ninguna persona coincide con los filtros de columna aplicados.'
                      : 'Todavía no hay personas admitidas.'}
                  </Vacio>
                </td>
              </tr>
            ) : (
              listaOrdenada.map((p) => {
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
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
