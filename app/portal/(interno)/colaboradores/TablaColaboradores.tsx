
'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, X, RotateCcw, Edit3, Trash2, Check, AlertCircle, MessageSquare, Mail, Copy } from 'lucide-react'
import { Etiqueta, Vacio } from '../componentes'
import { PaginacionTabla } from '../PaginacionTabla'
import { nombrePropio } from '@/lib/nombre'
import { enBogota } from '@/lib/fechas'

export type Colaborador = {
  id: string
  fullName: string
  email: string
  phone: string
  city: string
  area: string
  areaLegible: string
  discipline: string
  yearsExperience: string | null
  professionalCard?: string | null
  skills: string | null
  modality: string
  availableToTravel: string | null
  availableDays: string[]
  availableSlots: string[]
  weeklyHours: string | null
  status: string
  totalAssignments?: number
  completedAssignments?: number
  createdAt: string
}

const EXPERIENCIA: Record<string, string> = {
  MENOS_DE_1: '< 1 año',
  ENTRE_1_Y_3: '1–3 años',
  ENTRE_3_Y_5: '3–5 años',
  MAS_DE_5: '+5 años',
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

const AREAS = [
  { value: 'SALUD', label: 'Salud y primeros auxilios' },
  { value: 'SOCIAL_LEGAL_EDUCATIVO', label: 'Social, legal y educativo' },
  { value: 'OPERACION_LOGISTICA', label: 'Operación y logística' },
  { value: 'COMUNICACION_TECNOLOGIA', label: 'Comunicación y tecnología' },
  { value: 'GESTION_PROYECTOS', label: 'Gestión y proyectos' },
  { value: 'OTRA', label: 'Otra área' },
]

const DIAS_TODOS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']
const FRANJAS_TODAS = [
  { value: 'MANANA', label: 'Mañana' },
  { value: 'TARDE', label: 'Tarde' },
  { value: 'NOCHE', label: 'Noche' },
]

type ColumnaOrden = 'persona' | 'disciplina' | 'experiencia' | 'ciudad' | 'fecha' | 'estado'
type Direccion = 'asc' | 'desc'

const estiloInputFiltro: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  fontSize: '0.74rem',
  border: '1px solid var(--color-border-default, #cbd5e1)',
  borderRadius: 5,
  background: '#fff',
  outline: 'none',
}

export function TablaColaboradores({
  colaboradores: iniciales,
  esAdmin = false,
  puedeEditar = false,
}: {
  colaboradores: Colaborador[]
  esAdmin?: boolean
  puedeEditar?: boolean
}) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(iniciales)
  const [columnaOrden, setColumnaOrden] = useState<ColumnaOrden>('fecha')
  const [direccion, setDireccion] = useState<Direccion>('desc')
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(25)

  // Filtros por columna
  const [filtroPersona, setFiltroPersona] = useState('')
  const [filtroDisciplina, setFiltroDisciplina] = useState('')
  const [filtroExperiencia, setFiltroExperiencia] = useState('')
  const [filtroCiudad, setFiltroCiudad] = useState('')
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  // Modales
  const [colabAEditar, setColabAEditar] = useState<Colaborador | null>(null)
  const [colabAEliminar, setColabAEliminar] = useState<Colaborador | null>(null)
  const [formEdit, setFormEdit] = useState<Partial<Colaborador>>({})
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [errorModal, setErrorModal] = useState<string | null>(null)

  function alternarOrden(col: ColumnaOrden) {
    if (columnaOrden === col) {
      setDireccion(direccion === 'asc' ? 'desc' : 'asc')
    } else {
      setColumnaOrden(col)
      setDireccion('asc')
    }
    setPagina(1)
  }

  function limpiarFiltros() {
    setFiltroPersona('')
    setFiltroDisciplina('')
    setFiltroExperiencia('')
    setFiltroCiudad('')
    setFiltroDisponibilidad('')
    setFiltroFecha('')
    setFiltroEstado('')
    setPagina(1)
  }

  const hayFiltros =
    filtroPersona ||
    filtroDisciplina ||
    filtroExperiencia ||
    filtroCiudad ||
    filtroDisponibilidad ||
    filtroFecha ||
    filtroEstado

  const listaFiltrada = useMemo(() => {
    return colaboradores.filter((c) => {
      if (
        filtroPersona &&
        !c.fullName.toLowerCase().includes(filtroPersona.toLowerCase()) &&
        !c.phone.includes(filtroPersona) &&
        !c.email.toLowerCase().includes(filtroPersona.toLowerCase())
      )
        return false

      if (
        filtroDisciplina &&
        !c.discipline.toLowerCase().includes(filtroDisciplina.toLowerCase()) &&
        !c.areaLegible.toLowerCase().includes(filtroDisciplina.toLowerCase())
      )
        return false

      if (filtroExperiencia && c.yearsExperience !== filtroExperiencia) return false

      if (
        filtroCiudad &&
        !c.city.toLowerCase().includes(filtroCiudad.toLowerCase()) &&
        !c.modality.toLowerCase().includes(filtroCiudad.toLowerCase())
      )
        return false

      if (filtroDisponibilidad) {
        const textoDisp =
          c.availableDays.join(' ') +
          ' ' +
          c.availableSlots.join(' ') +
          ' ' +
          (c.skills ?? '')
        if (!textoDisp.toLowerCase().includes(filtroDisponibilidad.toLowerCase()))
          return false
      }

      if (filtroFecha && !enBogota(c.createdAt, false).includes(filtroFecha))
        return false

      if (filtroEstado && c.status !== filtroEstado) return false

      return true
    })
  }, [
    colaboradores,
    filtroPersona,
    filtroDisciplina,
    filtroExperiencia,
    filtroCiudad,
    filtroDisponibilidad,
    filtroFecha,
    filtroEstado,
  ])

  const listaOrdenada = useMemo(() => {
    return [...listaFiltrada].sort((a, b) => {
      let va: any = ''
      let vb: any = ''

      switch (columnaOrden) {
        case 'persona':
          va = a.fullName.toLowerCase()
          vb = b.fullName.toLowerCase()
          break
        case 'disciplina':
          va = a.discipline.toLowerCase()
          vb = b.discipline.toLowerCase()
          break
        case 'experiencia':
          va = a.yearsExperience ?? ''
          vb = b.yearsExperience ?? ''
          break
        case 'ciudad':
          va = a.city.toLowerCase()
          vb = b.city.toLowerCase()
          break
        case 'fecha':
          va = new Date(a.createdAt).getTime()
          vb = new Date(b.createdAt).getTime()
          break
        case 'estado':
          va = a.status
          vb = b.status
          break
      }

      if (va < vb) return direccion === 'asc' ? -1 : 1
      if (va > vb) return direccion === 'asc' ? 1 : -1
      return 0
    })
  }, [listaFiltrada, columnaOrden, direccion])

  const totalFiltrados = listaOrdenada.length
  const totalPaginas = Math.ceil(totalFiltrados / porPagina) || 1
  const paginaAjustada = Math.min(pagina, totalPaginas)
  const inicio = (paginaAjustada - 1) * porPagina
  const fin = inicio + porPagina
  const listaPaginada = listaOrdenada.slice(inicio, fin)

  function IconoOrden({ col }: { col: ColumnaOrden }) {
    if (columnaOrden !== col) {
      return <ArrowUpDown size={12} style={{ marginLeft: 4, opacity: 0.3 }} />
    }
    return direccion === 'asc' ? (
      <ArrowUp size={12} style={{ marginLeft: 4, color: 'var(--color-primary, #059669)' }} />
    ) : (
      <ArrowDown size={12} style={{ marginLeft: 4, color: 'var(--color-primary, #059669)' }} />
    )
  }

  function abrirModalEditar(c: Colaborador) {
    setColabAEditar(c)
    setFormEdit({
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      city: c.city,
      area: c.area,
      discipline: c.discipline,
      yearsExperience: c.yearsExperience,
      modality: c.modality,
      availableDays: [...(c.availableDays ?? [])],
      availableSlots: [...(c.availableSlots ?? [])],
      status: c.status,
      skills: c.skills ?? '',
    })
    setErrorModal(null)
  }

  async function guardarEdicion(ev: React.FormEvent) {
    ev.preventDefault()
    if (!colabAEditar) return
    setGuardando(true)
    setErrorModal(null)
    try {
      const res = await fetch(`/api/portal/collaborators/${colabAEditar.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEdit),
      })
      const payload = await res.json()
      if (!res.ok || !payload.success) {
        setErrorModal(payload.message ?? 'Error al actualizar voluntario.')
        return
      }
      setColaboradores((prev) =>
        prev.map((c) => (c.id === colabAEditar.id ? { ...c, ...payload.data } : c))
      )
      setColabAEditar(null)
      setMensajeExito('Voluntario actualizado con éxito.')
      setTimeout(() => setMensajeExito(null), 4000)
    } catch {
      setErrorModal('Error de conexión con el servidor.')
    } finally {
      setGuardando(false)
    }
  }

  async function ejecutarEliminacion() {
    if (!colabAEliminar) return
    setEliminando(true)
    try {
      const res = await fetch(`/api/portal/collaborators/${colabAEliminar.id}`, {
        method: 'DELETE',
      })
      const payload = await res.json()
      if (!res.ok || !payload.success) {
        alert(payload.message ?? 'No se pudo eliminar el voluntario.')
        return
      }
      setColaboradores((prev) => prev.filter((c) => c.id !== colabAEliminar.id))
      setColabAEliminar(null)
      setMensajeExito('Voluntario eliminado del directorio.')
      setTimeout(() => setMensajeExito(null), 4000)
    } catch {
      alert('Error de conexión al eliminar.')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {mensajeExito && (
        <div style={{ padding: '10px 16px', borderRadius: 8, background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={16} />
          {mensajeExito}
        </div>
      )}

      {/* Barra de control */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
          Mostrando <strong>{totalFiltrados}</strong> de {colaboradores.length} personas registradas
          {hayFiltros ? ' (filtrados)' : ''}
        </p>
        {hayFiltros && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="boton-mini"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}
          >
            <RotateCcw size={12} />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="tabla-envoltorio">
        <table className="tabla">
          <thead>
            <tr>
              <th onClick={() => alternarOrden('persona')} style={{ cursor: 'pointer', userSelect: 'none', width: '22%' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Persona <IconoOrden col="persona" />
                </span>
              </th>
              <th onClick={() => alternarOrden('disciplina')} style={{ cursor: 'pointer', userSelect: 'none', width: '17%' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Disciplina <IconoOrden col="disciplina" />
                </span>
              </th>
              <th onClick={() => alternarOrden('experiencia')} style={{ cursor: 'pointer', userSelect: 'none', width: '10%' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Experiencia <IconoOrden col="experiencia" />
                </span>
              </th>
              <th onClick={() => alternarOrden('ciudad')} style={{ cursor: 'pointer', userSelect: 'none', width: '15%' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Dónde y cómo <IconoOrden col="ciudad" />
                </span>
              </th>
              <th style={{ width: '14%' }}>Disponibilidad</th>
              <th onClick={() => alternarOrden('fecha')} style={{ cursor: 'pointer', userSelect: 'none', width: '8%' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Registro <IconoOrden col="fecha" />
                </span>
              </th>
              <th onClick={() => alternarOrden('estado')} style={{ cursor: 'pointer', userSelect: 'none', width: '7%' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Estado <IconoOrden col="estado" />
                </span>
              </th>
              <th style={{ width: '7%', textAlign: 'right' }}>Acciones</th>
            </tr>

            {/* Fila de Filtros */}
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Nombre/correo/celular..."
                  value={filtroPersona}
                  onChange={(e) => { setFiltroPersona(e.target.value); setPagina(1) }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Disciplina/área..."
                  value={filtroDisciplina}
                  onChange={(e) => { setFiltroDisciplina(e.target.value); setPagina(1) }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroExperiencia}
                  onChange={(e) => { setFiltroExperiencia(e.target.value); setPagina(1) }}
                  style={estiloInputFiltro}
                >
                  <option value="">Todas</option>
                  <option value="MENOS_DE_1">&lt; 1 año</option>
                  <option value="ENTRE_1_Y_3">1–3 años</option>
                  <option value="ENTRE_3_Y_5">3–5 años</option>
                  <option value="MAS_DE_5">+5 años</option>
                </select>
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Ciudad/modalidad..."
                  value={filtroCiudad}
                  onChange={(e) => { setFiltroCiudad(e.target.value); setPagina(1) }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Día/habilidades..."
                  value={filtroDisponibilidad}
                  onChange={(e) => { setFiltroDisponibilidad(e.target.value); setPagina(1) }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Fecha..."
                  value={filtroFecha}
                  onChange={(e) => { setFiltroFecha(e.target.value); setPagina(1) }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroEstado}
                  onChange={(e) => { setFiltroEstado(e.target.value); setPagina(1) }}
                  style={estiloInputFiltro}
                >
                  <option value="">Todos</option>
                  <option value="NUEVO">Nuevo</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </th>
              <th style={{ padding: '6px 6px', textAlign: 'right' }}>
                {hayFiltros && (
                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="boton-mini"
                    style={{ padding: '4px 6px', color: '#dc2626' }}
                    title="Limpiar filtros"
                  >
                    <X size={13} />
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {listaPaginada.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 24 }}>
                  <Vacio>
                    {hayFiltros
                      ? 'Ningún voluntario coincide con los filtros aplicados.'
                      : 'Todavía no se ha registrado nadie desde otras disciplinas.'}
                  </Vacio>
                </td>
              </tr>
            ) : (
              listaPaginada.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="tabla__principal" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {nombrePropio(c.fullName)}
                      {c.completedAssignments && c.completedAssignments > 0 ? (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: '#ecfdf5', color: '#059669' }}>
                          ✨ {c.completedAssignments} {c.completedAssignments === 1 ? 'labor' : 'labores'}
                        </span>
                      ) : null}
                    </span>
                    <span className="tabla__secundario" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 3 }}>
                      <span>{c.phone} · {c.email}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(c.email);
                          alert('Correo copiado: ' + c.email);
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 5px', borderRadius: 4, background: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 600, color: '#475569' }}
                        title="Copiar correo"
                      >
                        <Mail size={10} /> Copiar
                      </button>
                      {c.phone && (
                        <a
                          href={`https://wa.me/${c.phone.replace(/\D/g, '').startsWith('57') ? c.phone.replace(/\D/g, '') : '57' + c.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${c.fullName.split(' ')[0]}, te contactamos de la Fundación Aquí Estamos.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 5px', borderRadius: 4, background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 600 }}
                          title="Escribir por WhatsApp"
                        >
                          <MessageSquare size={10} /> WhatsApp
                        </a>
                      )}
                    </span>
                  </td>
                  <td>
                    {c.discipline}
                    <span className="tabla__secundario">{c.areaLegible}</span>
                  </td>
                  <td>{EXPERIENCIA[c.yearsExperience ?? ''] ?? '—'}</td>
                  <td>
                    {c.city}
                    <span className="tabla__secundario">
                      {c.modality.toLowerCase()}
                      {c.availableToTravel ? ` · viaja a ${c.availableToTravel}` : ''}
                    </span>
                  </td>
                  <td>
                    <span className="tabla__secundario" style={{ marginTop: 0 }}>
                      {c.availableDays?.length
                        ? c.availableDays.map((d) => DIA_CORTO[d] ?? d).join(' ')
                        : '—'}
                      {c.availableSlots?.length
                        ? ` · ${c.availableSlots.map((f) => FRANJA_CORTA[f] ?? f).join(', ')}`
                        : ''}
                    </span>
                    {c.skills && (
                      <span className="tabla__secundario" title={c.skills}>
                        {c.skills.length > 60 ? `${c.skills.slice(0, 60)}…` : c.skills}
                      </span>
                    )}
                  </td>
                  <td className="tabla__numero">{enBogota(c.createdAt, false)}</td>
                  <td>
                    <Etiqueta estado={c.status} />
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      {puedeEditar && (
                        <button
                          type="button"
                          onClick={() => abrirModalEditar(c)}
                          style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.74rem', fontWeight: 600, color: '#0f172a' }}
                          title="Modificar voluntario"
                        >
                          <Edit3 size={13} color="#059669" />
                          Modificar
                        </button>
                      )}
                      {esAdmin && (
                        <button
                          type="button"
                          onClick={() => setColabAEliminar(c)}
                          style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.74rem', fontWeight: 600, color: '#dc2626' }}
                          title="Eliminar voluntario"
                        >
                          <Trash2 size={13} />
                          Eliminar
                        </button>
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
        totalFiltrado={totalFiltrados}
        totalGeneral={colaboradores.length}
        alCambiarPagina={setPagina}
        alCambiarPorPagina={(n) => { setPorPagina(n); setPagina(1) }}
      />

      {/* ─── Modal Modificar Colaborador ─── */}
      {colabAEditar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 620, width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Modificar voluntario</h2>
              <button onClick={() => setColabAEditar(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={guardarEdicion} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Nombre completo *</label>
                  <input
                    type="text"
                    value={formEdit.fullName ?? ''}
                    onChange={(e) => setFormEdit({ ...formEdit, fullName: e.target.value })}
                    style={{ padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e2e8f0', fontSize: '0.88rem' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Correo electrónico *</label>
                  <input
                    type="email"
                    value={formEdit.email ?? ''}
                    onChange={(e) => setFormEdit({ ...formEdit, email: e.target.value })}
                    style={{ padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e2e8f0', fontSize: '0.88rem' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Teléfono / Celular *</label>
                  <input
                    type="text"
                    value={formEdit.phone ?? ''}
                    onChange={(e) => setFormEdit({ ...formEdit, phone: e.target.value })}
                    style={{ padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e2e8f0', fontSize: '0.88rem' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Ciudad *</label>
                  <input
                    type="text"
                    value={formEdit.city ?? ''}
                    onChange={(e) => setFormEdit({ ...formEdit, city: e.target.value })}
                    style={{ padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e2e8f0', fontSize: '0.88rem' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Área de labor</label>
                  <select
                    value={formEdit.area ?? 'SALUD'}
                    onChange={(e) => setFormEdit({ ...formEdit, area: e.target.value })}
                    style={{ padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e2e8f0', fontSize: '0.88rem', background: '#fff' }}
                  >
                    {AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Disciplina u oficio</label>
                  <input
                    type="text"
                    value={formEdit.discipline ?? ''}
                    onChange={(e) => setFormEdit({ ...formEdit, discipline: e.target.value })}
                    style={{ padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e2e8f0', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Modalidad</label>
                  <select
                    value={formEdit.modality ?? 'AMBAS'}
                    onChange={(e) => setFormEdit({ ...formEdit, modality: e.target.value })}
                    style={{ padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e2e8f0', fontSize: '0.88rem', background: '#fff' }}
                  >
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="VIRTUAL">Virtual</option>
                    <option value="AMBAS">Ambas</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Estado</label>
                  <select
                    value={formEdit.status ?? 'ACTIVO'}
                    onChange={(e) => setFormEdit({ ...formEdit, status: e.target.value })}
                    style={{ padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e2e8f0', fontSize: '0.88rem', background: '#fff' }}
                  >
                    <option value="NUEVO">Nuevo</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>
              </div>

              {/* Días disponibles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Días disponibles</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {DIAS_TODOS.map((d) => {
                    const sel = (formEdit.availableDays ?? []).includes(d)
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          const actual = formEdit.availableDays ?? []
                          const nuevo = sel ? actual.filter((x) => x !== d) : [...actual, d]
                          setFormEdit({ ...formEdit, availableDays: nuevo })
                        }}
                        style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                          border: '1.5px solid ' + (sel ? '#059669' : '#e2e8f0'),
                          background: sel ? '#ecfdf5' : '#fff',
                          color: sel ? '#065f46' : '#475569',
                        }}
                      >
                        {DIA_CORTO[d]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Franjas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Franjas horarias</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {FRANJAS_TODAS.map((f) => {
                    const sel = (formEdit.availableSlots ?? []).includes(f.value)
                    return (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => {
                          const actual = formEdit.availableSlots ?? []
                          const nuevo = sel ? actual.filter((x) => x !== f.value) : [...actual, f.value]
                          setFormEdit({ ...formEdit, availableSlots: nuevo })
                        }}
                        style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                          border: '1.5px solid ' + (sel ? '#059669' : '#e2e8f0'),
                          background: sel ? '#ecfdf5' : '#fff',
                          color: sel ? '#065f46' : '#475569',
                        }}
                      >
                        {f.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {errorModal && <p style={{ color: '#dc2626', fontSize: '0.84rem', margin: 0 }}>{errorModal}</p>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setColabAEditar(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} style={{ padding: '8px 20px', borderRadius: 8, background: '#059669', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal Confirmar Eliminación (Solo ADMIN) ─── */}
      {colabAEliminar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 440, width: '100%', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <Trash2 size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px' }}>¿Eliminar voluntario?</h2>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                ¿Estás seguro de eliminar a <strong>{colabAEliminar.fullName}</strong> ({colabAEliminar.email}) del directorio? Esta acción queda registrada en la auditoría.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 6 }}>
              <button type="button" onClick={() => setColabAEliminar(null)} style={{ padding: '9px 18px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button
                type="button"
                disabled={eliminando}
                onClick={ejecutarEliminacion}
                style={{ padding: '9px 20px', borderRadius: 8, background: '#dc2626', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
