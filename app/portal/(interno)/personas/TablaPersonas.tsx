'use client'

import { seguimientoPendiente, type Seguimiento } from '@/lib/seguimiento'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowUpDown, ArrowUp, ArrowDown, X, UserCheck, Calendar, RotateCcw, MessageSquare } from 'lucide-react'
import { Etiqueta, Vacio } from '../componentes'
import { PaginacionTabla } from '../PaginacionTabla'
import { BotonSeguimientoWhatsApp } from './BotonSeguimientoWhatsApp'
import { BotonRecordarCitaPrevia } from './BotonRecordarCitaPrevia'
import { BotonEliminarPersona } from './BotonEliminarPersona'
import { ModalNotasSeguimiento, type NotaSeguimiento } from './ModalNotasSeguimiento'
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
    meetingUrl?: string | null
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
    /** Si el profesional ya contó qué pasó con alguna sesión. */
    hayReporte?: boolean
    profesional?: {
      id: string
      nombre: string
      telefono?: string
      email?: string
    } | null
  } | null
  comentarios?: string | null
  notasSeguimiento?: NotaSeguimiento[]
  totalNotas?: number
  ultimaNota?: {
    id?: string
    nota: string
    autor: string
    fecha: string
    fechaLocal?: string
  } | null
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
  | 'notas'
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
  const [filtroNotas, setFiltroNotas] = useState('')
  const [filtroCiudad, setFiltroCiudad] = useState('')
  const [filtroPrioridad, setFiltroPrioridad] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  const [columnaOrden, setColumnaOrden] = useState<ColumnaOrden>('esperando')
  const [direccion, setDireccion] = useState<Direccion>('desc')

  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(25)

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
      filtroNotas.trim() ||
      filtroCiudad.trim() ||
      filtroPrioridad ||
      filtroEstado,
  )

  function limpiarFiltros() {
    setFiltroPersona('')
    setFiltroProfesional('')
    setFiltroCita('')
    setFiltroNotas('')
    setFiltroCiudad('')
    setFiltroPrioridad('')
    setFiltroEstado('')
    setPagina(1)
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

      if (filtroNotas.trim()) {
        const q = filtroNotas.toLowerCase().trim()
        const matchUltima = (p.ultimaNota?.nota || '').toLowerCase().includes(q)
        const matchAutor = (p.ultimaNota?.autor || '').toLowerCase().includes(q)
        const matchHistorial = p.notasSeguimiento?.some(
          (n) => n.nota.toLowerCase().includes(q) || n.autor.toLowerCase().includes(q),
        )
        const matchComentarios = (p.comentarios || '').toLowerCase().includes(q)
        if (!matchUltima && !matchAutor && !matchHistorial && !matchComentarios) return false
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
    filtroNotas,
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
        case 'notas': {
          const tA = a.ultimaNota?.fecha ? new Date(a.ultimaNota.fecha).getTime() : 0
          const tB = b.ultimaNota?.fecha ? new Date(b.ultimaNota.fecha).getTime() : 0
          cmp = tA - tB || (a.totalNotas ?? 0) - (b.totalNotas ?? 0)
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
              {/*
                Qué hay que hacer con esta persona, no en qué estado está.
              
                La tabla contaba el estado —«Asignado», la cita si la hay— pero
                alguien con cita mañana y alguien cuya sesión fue ayer se veían
                igual, cuando lo que se necesita de cada uno es lo contrario.
              */}
              <th style={{ width: '13%', minWidth: 170 }}>Qué sigue</th>
              <th
                onClick={() => alternarOrden('notas')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '15%' }}
                title="Ordenar por Notas de seguimiento"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Notas de seguimiento
                  <IconoOrden col="notas" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('ciudad')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '9%' }}
                title="Ordenar por Ciudad"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Ciudad
                  <IconoOrden col="ciudad" />
                </span>
              </th>
              <th style={{ width: '7%' }}>Disponibilidad</th>
              <th
                onClick={() => alternarOrden('esperando')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '7%' }}
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
                  placeholder="Profesional..."
                  value={filtroProfesional}
                  onChange={(e) => {
                    setFiltroProfesional(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroCita}
                  onChange={(e) => {
                    setFiltroCita(e.target.value)
                    setPagina(1)
                  }}
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
              {/*
                La celda de «Qué sigue» en la fila de filtros.
              
                Va vacía —el aviso se calcula, no se filtra— pero TIENE que
                estar: al añadir la cabecera sin su hueco aquí, la fila de
                filtros se corrió una columna entera y el buscador de notas
                aparecía bajo «Qué sigue». Una tabla desalineada se lee como un
                error de datos, no de maquetación.
              */}
              <th style={{ padding: '6px 6px' }} />
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Filtrar notas/autor..."
                  value={filtroNotas}
                  onChange={(e) => {
                    setFiltroNotas(e.target.value)
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
              <th style={{ padding: '6px 6px' }} />
              <th style={{ padding: '6px 6px' }} />
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroPrioridad}
                  onChange={(e) => {
                    setFiltroPrioridad(e.target.value)
                    setPagina(1)
                  }}
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
                  onChange={(e) => {
                    setFiltroEstado(e.target.value)
                    setPagina(1)
                  }}
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
            {listaPaginada.length === 0 ? (
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
              listaPaginada.map((p) => {
                const cita = p.cita

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
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 2, flexWrap: 'wrap' }}>
                            <Etiqueta estado={cita.estado} texto={cita.estadoLegible} />
                            <span className="tabla__secundario" style={{ textTransform: 'capitalize' }}>
                              {cita.modalidad?.toLowerCase()}
                            </span>
                          </div>
                          {p.asignacion?.profesional && (
                            <BotonRecordarCitaPrevia
                              cita={cita}
                              profesional={p.asignacion.profesional}
                              pacienteNombre={p.fullName}
                              pacienteTelefono={p.phone}
                              enlaceCaso={`${enlaceDelSitio}/portal/caso/${p.id}`}
                            />
                          )}
                        </div>
                      ) : (
                        <span className="tabla__secundario">— Sin cita —</span>
                      )}
                    </td>

                    {/* Qué sigue: la tarea, no el estado. */}
                    <td>
                      <AvisoDeSeguimiento
                        seguimiento={seguimientoPendiente({
                          estadoPersona: p.status,
                          estadoAsignacion: p.asignacion?.estado,
                          diasEsperando: p.diasEsperando,
                          cita: cita ? { inicio: cita.inicio, estado: cita.estado } : null,
                          hayReporte: p.asignacion?.hayReporte === true,
                          asignadaDesde: p.asignacion?.desde,
                        })}
                      />
                    </td>

                    {/* Columna Notas de seguimiento (con modal interactivo) */}
                    <td style={{ maxWidth: 220 }}>
                      <ModalNotasSeguimiento
                        personaId={p.id}
                        personaNombre={p.fullName}
                        notasIniciales={p.notasSeguimiento}
                        totalNotas={p.totalNotas}
                        ultimaNota={p.ultimaNota}
                      />
                    </td>

                    <td>{p.city}</td>

                    {/*
                      El color y el tamaño de "tabla__secundario", pero sin su
                      "display: block" — que en un td le quita su condición de
                      celda y hace que no crezca con la fila. Esta medía 45
                      píxeles mientras las demás medían 92.
                    */}
                    <td style={{ color: 'var(--color-text-light)', fontSize: '0.8rem' }}>
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
                        {cita && p.asignacion?.profesional && (
                          <BotonRecordarCitaPrevia
                            cita={cita}
                            profesional={p.asignacion.profesional}
                            pacienteNombre={p.fullName}
                            enlaceCaso={`${enlaceDelSitio}/portal/caso/${p.id}`}
                            compact
                          />
                        )}
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

      <PaginacionTabla
        pagina={paginaAjustada}
        porPagina={porPagina}
        totalFiltrado={totalFiltradas}
        totalGeneral={personas.length}
        alCambiarPagina={setPagina}
        alCambiarPorPagina={(n) => {
          setPorPagina(n)
          setPagina(1)
        }}
      />
    </>
  )
}


/**
 * El aviso de qué toca hacer, en una celda.
 *
 * Tres tonos y no cinco: si todo grita, nada grita. «Ahora» es lo que caduca
 * hoy —una cita en tres horas, un caso que se libera mañana—; «pronto» es lo
 * que conviene no dejar pasar; el resto va en gris, presente pero sin pedir
 * atención.
 *
 * Sin aviso la celda queda vacía a propósito: un «—» en cada fila sin tarea
 * llenaría la columna de ruido y haría más difícil ver las que sí tienen.
 */
function AvisoDeSeguimiento({ seguimiento }: { seguimiento: Seguimiento | null }) {
  if (!seguimiento) return null

  /**
   * Un punto de color y el texto al lado, no una etiqueta rellena.
   *
   * La primera versión pintaba un recuadro de color con la frase entera
   * dentro: en una columna estrecha se partía en una tira de siete líneas,
   * estiraba la fila al triple y desalineaba toda la tabla.
   *
   * Con el punto, el color sigue diciendo la urgencia de un vistazo —que es
   * para lo que estaba— y el texto se comporta como el de las demás columnas.
   * El verbo no se parte nunca; el detalle sí puede, y no pasa nada porque va
   * en gris y en pequeño.
   */
  const color =
    seguimiento.urgencia === 'ahora'
      ? '#dc2626'
      : seguimiento.urgencia === 'pronto'
        ? '#d97706'
        : '#94a3b8'

  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 7 }}>
      <span
        aria-hidden
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
          transform: 'translateY(-1px)',
        }}
      />
      <span>
        <strong style={{ fontSize: '0.83rem', color, whiteSpace: 'nowrap' }}>
          {seguimiento.accion}
        </strong>
        {seguimiento.detalle ? (
          <span className="tabla__secundario">{seguimiento.detalle}</span>
        ) : null}
      </span>
    </span>
  )
}