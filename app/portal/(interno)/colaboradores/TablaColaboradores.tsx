'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, X, RotateCcw } from 'lucide-react'
import { Etiqueta, Vacio } from '../componentes'
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
  skills: string | null
  modality: string
  availableToTravel: string | null
  availableDays: string[]
  availableSlots: string[]
  weeklyHours: string | null
  status: string
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

type ColumnaOrden = 'persona' | 'disciplina' | 'experiencia' | 'ciudad' | 'fecha' | 'estado'
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

export function TablaColaboradores({ colaboradores }: { colaboradores: Colaborador[] }) {
  const [filtroPersona, setFiltroPersona] = useState('')
  const [filtroDisciplina, setFiltroDisciplina] = useState('')
  const [filtroExperiencia, setFiltroExperiencia] = useState('')
  const [filtroCiudad, setFiltroCiudad] = useState('')
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

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

  const hayFiltros = Boolean(
    filtroPersona.trim() ||
      filtroDisciplina.trim() ||
      filtroExperiencia ||
      filtroCiudad.trim() ||
      filtroDisponibilidad.trim() ||
      filtroFecha.trim() ||
      filtroEstado,
  )

  function limpiarFiltros() {
    setFiltroPersona('')
    setFiltroDisciplina('')
    setFiltroExperiencia('')
    setFiltroCiudad('')
    setFiltroDisponibilidad('')
    setFiltroFecha('')
    setFiltroEstado('')
  }

  const listaFiltrada = useMemo(() => {
    return colaboradores.filter((c) => {
      if (filtroPersona.trim()) {
        const q = filtroPersona.toLowerCase().trim()
        const matchNombre = c.fullName.toLowerCase().includes(q)
        const matchTel = c.phone?.includes(q)
        const matchEmail = c.email?.toLowerCase().includes(q)
        if (!matchNombre && !matchTel && !matchEmail) return false
      }

      if (filtroDisciplina.trim()) {
        const q = filtroDisciplina.toLowerCase().trim()
        const matchDisc = (c.discipline || '').toLowerCase().includes(q)
        const matchArea = (c.areaLegible || '').toLowerCase().includes(q)
        if (!matchDisc && !matchArea) return false
      }

      if (filtroExperiencia && c.yearsExperience !== filtroExperiencia) {
        return false
      }

      if (filtroCiudad.trim()) {
        const q = filtroCiudad.toLowerCase().trim()
        const matchCiudad = (c.city || '').toLowerCase().includes(q)
        const matchModalidad = (c.modality || '').toLowerCase().includes(q)
        if (!matchCiudad && !matchModalidad) return false
      }

      if (filtroDisponibilidad.trim()) {
        const q = filtroDisponibilidad.toLowerCase().trim()
        const matchDias = c.availableDays?.join(' ').toLowerCase() || ''
        const matchSkills = (c.skills || '').toLowerCase()
        if (!matchDias.includes(q) && !matchSkills.includes(q)) return false
      }

      if (filtroFecha.trim()) {
        const q = filtroFecha.toLowerCase().trim()
        if (!enBogota(c.createdAt, false).toLowerCase().includes(q)) return false
      }

      if (filtroEstado && c.status !== filtroEstado) {
        return false
      }

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
      let cmp = 0
      switch (columnaOrden) {
        case 'persona':
          cmp = a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' })
          break
        case 'disciplina':
          cmp = a.discipline.localeCompare(b.discipline, 'es', { sensitivity: 'base' })
          break
        case 'experiencia':
          cmp = (a.yearsExperience || '').localeCompare(b.yearsExperience || '', 'es', { sensitivity: 'base' })
          break
        case 'ciudad':
          cmp = a.city.localeCompare(b.city, 'es', { sensitivity: 'base' })
          break
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
          <strong>{listaOrdenada.length}</strong> {listaOrdenada.length === 1 ? 'voluntario' : 'voluntarios'}
          {hayFiltros ? ` (filtrado de ${colaboradores.length} en total)` : ''}
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
                onClick={() => alternarOrden('disciplina')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '18%' }}
                title="Ordenar por Disciplina"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Disciplina
                  <IconoOrden col="disciplina" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('experiencia')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '12%' }}
                title="Ordenar por Experiencia"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Experiencia
                  <IconoOrden col="experiencia" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('ciudad')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '16%' }}
                title="Ordenar por Dónde y cómo"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Dónde y cómo
                  <IconoOrden col="ciudad" />
                </span>
              </th>
              <th style={{ width: '14%' }}>Disponibilidad</th>
              <th
                onClick={() => alternarOrden('fecha')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '10%' }}
                title="Ordenar por Registro (Fecha)"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Registro
                  <IconoOrden col="fecha" />
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
              <th style={{ width: '6%', textAlign: 'right' }} />
            </tr>

            {/* Fila de filtros por columna */}
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Nombre, teléfono..."
                  value={filtroPersona}
                  onChange={(e) => setFiltroPersona(e.target.value)}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Disciplina, área..."
                  value={filtroDisciplina}
                  onChange={(e) => setFiltroDisciplina(e.target.value)}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroExperiencia}
                  onChange={(e) => setFiltroExperiencia(e.target.value)}
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
                  onChange={(e) => setFiltroCiudad(e.target.value)}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Día/habilidades..."
                  value={filtroDisponibilidad}
                  onChange={(e) => setFiltroDisponibilidad(e.target.value)}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Fecha..."
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  style={estiloInputFiltro}
                >
                  <option value="">Todos</option>
                  <option value="NUEVO">Nuevo</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
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
                <td colSpan={8} style={{ textAlign: 'center', padding: 24 }}>
                  <Vacio>
                    {hayFiltros
                      ? 'Ningún voluntario coincide con los filtros de columna aplicados.'
                      : 'Todavía no se ha registrado nadie desde otras disciplinas.'}
                  </Vacio>
                </td>
              </tr>
            ) : (
              listaOrdenada.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="tabla__principal">{nombrePropio(c.fullName)}</span>
                    <span className="tabla__secundario">
                      {c.phone} · {c.email}
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
                    {c.skills ? (
                      <span className="tabla__secundario" title={c.skills}>
                        {c.skills.length > 70 ? `${c.skills.slice(0, 70)}…` : c.skills}
                      </span>
                    ) : null}
                  </td>
                  <td className="tabla__numero">{enBogota(c.createdAt, false)}</td>
                  <td>
                    <Etiqueta estado={c.status} />
                  </td>
                  <td />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
