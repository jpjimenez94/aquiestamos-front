'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Phone,
  MessageCircle,
  Clock,
  Calendar,
  Edit2,
  Users,
  MapPin,
  Sparkles,
  HeartHandshake,
  Package,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  RotateCcw,
} from 'lucide-react'
import { ModalLider, type CategoriaNecesidad, type LiderData } from './ModalLider'
import { ModalBitacoraContacto } from './ModalBitacoraContacto'
import { PaginacionTabla } from '../PaginacionTabla'
import { enBogota } from '@/lib/fechas'
import { enlaceWhatsapp } from '@/lib/mensajes'

export type LiderFila = {
  id: string
  name: string
  phone: string
  email?: string | null
  territory: string
  beneficiariesCount: number
  status: 'ACTIVO' | 'EN_SEGUIMIENTO' | 'ATENDIDO' | 'INACTIVO'
  estadoLegible: string
  lastContactAt?: string | null
  nextAction?: string | null
  nextActionDate?: string | null
  notes?: string | null
  tienePsicologicas: boolean
  tieneRecursos: boolean
  needs: {
    id: string
    name: string
    type: 'PSICOLOGICA' | 'RECURSO'
    tipoLegible: string
    details?: string | null
    status: string
  }[]
  totalContactos: number
  createdAt: string
  updatedAt: string
}

type Props = {
  lideresIniciales: LiderFila[]
  catalogoNecesidades: CategoriaNecesidad[]
  esAdmin: boolean
}

type ColumnaOrden =
  | 'lider'
  | 'territorio'
  | 'impacto'
  | 'necesidades'
  | 'proximaAccion'
  | 'contacto'
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

export function TablaLideres({ lideresIniciales, catalogoNecesidades, esAdmin }: Props) {
  // Filtros globales y por columna
  const [filtroLider, setFiltroLider] = useState('')
  const [filtroTerritorio, setFiltroTerritorio] = useState('')
  const [filtroImpacto, setFiltroImpacto] = useState('')
  const [filtroTipoNecesidad, setFiltroTipoNecesidad] = useState<'TODAS' | 'PSICOLOGICA' | 'RECURSO' | 'AMBAS'>('TODAS')
  const [filtroTextoNecesidad, setFiltroTextoNecesidad] = useState('')
  const [filtroProximaAccion, setFiltroProximaAccion] = useState('')
  const [filtroUltimoContacto, setFiltroUltimoContacto] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS')

  // Ordenamiento
  const [columnaOrden, setColumnaOrden] = useState<ColumnaOrden>('contacto')
  const [direccion, setDireccion] = useState<Direccion>('desc')

  // Paginación
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(25)

  // Modales
  const [modalLiderAbierto, setModalLiderAbierto] = useState(false)
  const [liderAEditar, setLiderAEditar] = useState<LiderData | null>(null)
  const [modalContactoAbierto, setModalContactoAbierto] = useState(false)
  const [liderParaContacto, setLiderParaContacto] = useState<LiderFila | null>(null)

  function alternarOrden(col: ColumnaOrden) {
    if (columnaOrden === col) {
      setDireccion(direccion === 'asc' ? 'desc' : 'asc')
    } else {
      setColumnaOrden(col)
      setDireccion(col === 'impacto' || col === 'contacto' ? 'desc' : 'asc')
    }
  }

  const hayFiltros = Boolean(
    filtroLider.trim() ||
      filtroTerritorio.trim() ||
      filtroImpacto.trim() ||
      filtroTipoNecesidad !== 'TODAS' ||
      filtroTextoNecesidad.trim() ||
      filtroProximaAccion.trim() ||
      filtroUltimoContacto.trim() ||
      filtroEstado !== 'TODOS',
  )

  function limpiarFiltros() {
    setFiltroLider('')
    setFiltroTerritorio('')
    setFiltroImpacto('')
    setFiltroTipoNecesidad('TODAS')
    setFiltroTextoNecesidad('')
    setFiltroProximaAccion('')
    setFiltroUltimoContacto('')
    setFiltroEstado('TODOS')
    setPagina(1)
  }

  const lideresFiltrados = useMemo(() => {
    return lideresIniciales.filter((l) => {
      // Filtro Líder (nombre, teléfono, email)
      if (filtroLider.trim()) {
        const q = filtroLider.toLowerCase().trim()
        const matchNombre = l.name.toLowerCase().includes(q)
        const matchTel = l.phone.includes(q)
        const matchEmail = (l.email || '').toLowerCase().includes(q)
        if (!matchNombre && !matchTel && !matchEmail) return false
      }

      // Filtro Territorio
      if (filtroTerritorio.trim()) {
        const q = filtroTerritorio.toLowerCase().trim()
        if (!l.territory.toLowerCase().includes(q)) return false
      }

      // Filtro Impacto (mínimo personas)
      if (filtroImpacto.trim()) {
        const num = parseInt(filtroImpacto, 10)
        if (!isNaN(num) && (l.beneficiariesCount || 0) < num) return false
      }

      // Filtro Tipo de Necesidad
      if (filtroTipoNecesidad === 'PSICOLOGICA' && !l.tienePsicologicas) {
        return false
      }
      if (filtroTipoNecesidad === 'RECURSO' && !l.tieneRecursos) {
        return false
      }
      if (filtroTipoNecesidad === 'AMBAS' && (!l.tienePsicologicas || !l.tieneRecursos)) {
        return false
      }

      // Filtro Texto Necesidad
      if (filtroTextoNecesidad.trim()) {
        const q = filtroTextoNecesidad.toLowerCase().trim()
        const coincideNecesidad = l.needs.some((n) => n.name.toLowerCase().includes(q))
        if (!coincideNecesidad) return false
      }

      // Filtro Próxima Acción
      if (filtroProximaAccion.trim()) {
        const q = filtroProximaAccion.toLowerCase().trim()
        const matchAccion = (l.nextAction || '').toLowerCase().includes(q)
        const matchFecha = l.nextActionDate ? enBogota(l.nextActionDate).toLowerCase().includes(q) : false
        if (!matchAccion && !matchFecha) return false
      }

      // Filtro Último Contacto
      if (filtroUltimoContacto.trim()) {
        const q = filtroUltimoContacto.toLowerCase().trim()
        const matchFecha = l.lastContactAt ? enBogota(l.lastContactAt).toLowerCase().includes(q) : false
        if (!matchFecha && q !== 'sin registro') return false
      }

      // Filtro Estado
      if (filtroEstado !== 'TODOS' && l.status !== filtroEstado) {
        return false
      }

      return true
    })
  }, [
    lideresIniciales,
    filtroLider,
    filtroTerritorio,
    filtroImpacto,
    filtroTipoNecesidad,
    filtroTextoNecesidad,
    filtroProximaAccion,
    filtroUltimoContacto,
    filtroEstado,
  ])

  // Ordenamiento
  const lideresOrdenados = useMemo(() => {
    return [...lideresFiltrados].sort((a, b) => {
      let resultado = 0
      switch (columnaOrden) {
        case 'lider':
          resultado = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
          break
        case 'territorio':
          resultado = a.territory.localeCompare(b.territory, 'es', { sensitivity: 'base' })
          break
        case 'impacto':
          resultado = (a.beneficiariesCount || 0) - (b.beneficiariesCount || 0)
          break
        case 'necesidades':
          resultado = a.needs.length - b.needs.length
          break
        case 'proximaAccion':
          resultado = (a.nextAction || '').localeCompare(b.nextAction || '', 'es', { sensitivity: 'base' })
          break
        case 'contacto': {
          const tiempoA = a.lastContactAt ? new Date(a.lastContactAt).getTime() : 0
          const tiempoB = b.lastContactAt ? new Date(b.lastContactAt).getTime() : 0
          resultado = tiempoA - tiempoB
          break
        }
        case 'estado':
          resultado = a.status.localeCompare(b.status)
          break
      }
      return direccion === 'asc' ? resultado : -resultado
    })
  }, [lideresFiltrados, columnaOrden, direccion])

  // Paginación
  const totalFiltrados = lideresOrdenados.length
  const totalPaginas = Math.max(1, Math.ceil(totalFiltrados / porPagina))
  const paginaAjustada = Math.min(pagina, totalPaginas)
  const inicio = (paginaAjustada - 1) * porPagina
  const lideresPaginados = lideresOrdenados.slice(inicio, inicio + porPagina)

  function getBadgeStatus(status: LiderFila['status']) {
    switch (status) {
      case 'ACTIVO':
        return { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0', label: 'Activo' }
      case 'EN_SEGUIMIENTO':
        return { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe', label: 'En seguimiento' }
      case 'ATENDIDO':
        return { bg: '#f8fafc', color: '#475569', border: '#cbd5e1', label: 'Atendido' }
      case 'INACTIVO':
        return { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', label: 'Inactivo' }
    }
  }

  function renderIconoOrden(col: ColumnaOrden) {
    if (columnaOrden !== col) {
      return <ArrowUpDown size={12} style={{ opacity: 0.4, marginLeft: 4 }} />
    }
    return direccion === 'asc' ? (
      <ArrowUp size={12} style={{ marginLeft: 4, color: '#059669' }} />
    ) : (
      <ArrowDown size={12} style={{ marginLeft: 4, color: '#059669' }} />
    )
  }

  return (
    <div>
      {/* Botones de Acceso Rápido por Tipo de Necesidad */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          background: '#ffffff',
          padding: '12px 16px',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginRight: 4 }}>
          Filtrar por Necesidades:
        </span>
        <button
          type="button"
          className="boton-mini"
          data-tono={filtroTipoNecesidad === 'TODAS' ? 'principal' : undefined}
          onClick={() => { setFiltroTipoNecesidad('TODAS'); setPagina(1) }}
          style={filtroTipoNecesidad === 'TODAS' ? { background: '#0f172a', color: '#fff' } : undefined}
        >
          Todas ({lideresIniciales.length})
        </button>
        <button
          type="button"
          className="boton-mini"
          onClick={() => { setFiltroTipoNecesidad('PSICOLOGICA'); setPagina(1) }}
          style={
            filtroTipoNecesidad === 'PSICOLOGICA'
              ? { background: '#059669', color: '#fff' }
              : { color: '#065f46', borderColor: '#a7f3d0', background: '#ecfdf5' }
          }
        >
          <HeartHandshake size={13} />
          💚 Psicológicas ({lideresIniciales.filter((l) => l.tienePsicologicas).length})
        </button>
        <button
          type="button"
          className="boton-mini"
          onClick={() => { setFiltroTipoNecesidad('RECURSO'); setPagina(1) }}
          style={
            filtroTipoNecesidad === 'RECURSO'
              ? { background: '#0284c7', color: '#fff' }
              : { color: '#0369a1', borderColor: '#bae6fd', background: '#f0f9ff' }
          }
        >
          <Package size={13} />
          📦 Recursos / Insumos ({lideresIniciales.filter((l) => l.tieneRecursos).length})
        </button>
        <button
          type="button"
          className="boton-mini"
          onClick={() => { setFiltroTipoNecesidad('AMBAS'); setPagina(1) }}
          style={
            filtroTipoNecesidad === 'AMBAS'
              ? { background: '#7c3aed', color: '#fff' }
              : { color: '#6d28d9', borderColor: '#ddd6fe', background: '#f5f3ff' }
          }
        >
          <Sparkles size={13} />
          ✨ Ambas ({lideresIniciales.filter((l) => l.tienePsicologicas && l.tieneRecursos).length})
        </button>

        {hayFiltros && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="boton-mini"
            style={{ marginLeft: 'auto', color: '#dc2626', borderColor: '#fca5a5' }}
          >
            <RotateCcw size={12} />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla de Líderes con Filtros por Columna */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="tabla" style={{ margin: 0 }}>
            <thead>
              {/* Fila 1: Títulos de Columna con Ordenamiento */}
              <tr>
                <th
                  onClick={() => alternarOrden('lider')}
                  style={{ minWidth: 200, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Líder y Contacto {renderIconoOrden('lider')}
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('territorio')}
                  style={{ minWidth: 170, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Territorio / Comunidad {renderIconoOrden('territorio')}
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('impacto')}
                  style={{ minWidth: 110, textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    Impacto {renderIconoOrden('impacto')}
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('necesidades')}
                  style={{ minWidth: 260, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Necesidades Clasificadas {renderIconoOrden('necesidades')}
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('proximaAccion')}
                  style={{ minWidth: 210, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Próxima Acción Pendiente {renderIconoOrden('proximaAccion')}
                  </span>
                </th>
                <th
                  onClick={() => alternarOrden('contacto')}
                  style={{ minWidth: 130, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Último Contacto {renderIconoOrden('contacto')}
                  </span>
                </th>
                <th style={{ minWidth: 140, textAlign: 'right' }}>
                  Acciones
                </th>
              </tr>

              {/* Fila 2: Filtros por Columna */}
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {/* Filtro Líder */}
                <th style={{ padding: '6px 6px' }}>
                  <input
                    type="text"
                    placeholder="Filtrar por nombre, tel..."
                    value={filtroLider}
                    onChange={(e) => {
                      setFiltroLider(e.target.value)
                      setPagina(1)
                    }}
                    style={estiloInputFiltro}
                  />
                </th>

                {/* Filtro Territorio */}
                <th style={{ padding: '6px 6px' }}>
                  <input
                    type="text"
                    placeholder="Filtrar territorio..."
                    value={filtroTerritorio}
                    onChange={(e) => {
                      setFiltroTerritorio(e.target.value)
                      setPagina(1)
                    }}
                    style={estiloInputFiltro}
                  />
                </th>

                {/* Filtro Impacto */}
                <th style={{ padding: '6px 6px' }}>
                  <input
                    type="number"
                    min="0"
                    placeholder="Mín. pers..."
                    value={filtroImpacto}
                    onChange={(e) => {
                      setFiltroImpacto(e.target.value)
                      setPagina(1)
                    }}
                    style={{ ...estiloInputFiltro, textAlign: 'center' }}
                  />
                </th>

                {/* Filtro Necesidades */}
                <th style={{ padding: '6px 6px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <select
                      value={filtroTipoNecesidad}
                      onChange={(e) => {
                        setFiltroTipoNecesidad(e.target.value as any)
                        setPagina(1)
                      }}
                      style={{ ...estiloInputFiltro, flex: '0 0 110px' }}
                    >
                      <option value="TODAS">Todas</option>
                      <option value="PSICOLOGICA">💚 Psic.</option>
                      <option value="RECURSO">📦 Recursos</option>
                      <option value="AMBAS">✨ Ambas</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Buscar necesidad..."
                      value={filtroTextoNecesidad}
                      onChange={(e) => {
                        setFiltroTextoNecesidad(e.target.value)
                        setPagina(1)
                      }}
                      style={estiloInputFiltro}
                    />
                  </div>
                </th>

                {/* Filtro Próxima Acción */}
                <th style={{ padding: '6px 6px' }}>
                  <input
                    type="text"
                    placeholder="Filtrar por acción o fecha..."
                    value={filtroProximaAccion}
                    onChange={(e) => {
                      setFiltroProximaAccion(e.target.value)
                      setPagina(1)
                    }}
                    style={estiloInputFiltro}
                  />
                </th>

                {/* Filtro Último Contacto */}
                <th style={{ padding: '6px 6px' }}>
                  <input
                    type="text"
                    placeholder="Filtrar fecha..."
                    value={filtroUltimoContacto}
                    onChange={(e) => {
                      setFiltroUltimoContacto(e.target.value)
                      setPagina(1)
                    }}
                    style={estiloInputFiltro}
                  />
                </th>

                {/* Filtro Estado / Botón Reset */}
                <th style={{ padding: '6px 6px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'flex-end' }}>
                    <select
                      value={filtroEstado}
                      onChange={(e) => {
                        setFiltroEstado(e.target.value)
                        setPagina(1)
                      }}
                      style={{ ...estiloInputFiltro, maxWidth: 110 }}
                    >
                      <option value="TODOS">Todos</option>
                      <option value="ACTIVO">Activo</option>
                      <option value="EN_SEGUIMIENTO">Seguimiento</option>
                      <option value="ATENDIDO">Atendido</option>
                      <option value="INACTIVO">Inactivo</option>
                    </select>
                    {hayFiltros && (
                      <button
                        type="button"
                        onClick={limpiarFiltros}
                        className="boton-mini"
                        style={{ padding: '4px 6px', color: '#dc2626', borderColor: '#fca5a5' }}
                        title="Limpiar filtros"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {lideresPaginados.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 36, textAlign: 'center', color: '#64748b' }}>
                    <Users size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                    <strong style={{ display: 'block', fontSize: '1rem', color: '#334155' }}>
                      {hayFiltros
                        ? 'Ningún líder comunitario coincide con los filtros aplicados.'
                        : 'Todavía no hay líderes comunitarios registrados.'}
                    </strong>
                    <p style={{ fontSize: '0.85rem', margin: '6px 0 0' }}>
                      {hayFiltros
                        ? 'Prueba modificando o limpiando los filtros de columna.'
                        : 'Usa el botón "Registrar Líder" para agregar el primero.'}
                    </p>
                  </td>
                </tr>
              ) : (
                lideresPaginados.map((l) => {
                  const badge = getBadgeStatus(l.status)
                  const whatsappUrl = enlaceWhatsapp(
                    l.phone,
                    `Hola ${l.name}, te escribimos desde la coordinación de Red Aquí Estamos sobre el apoyo en ${l.territory}.`,
                  )

                  const psicologicas = l.needs.filter((n) => n.type === 'PSICOLOGICA')
                  const recursos = l.needs.filter((n) => n.type === 'RECURSO')

                  return (
                    <tr key={l.id} style={{ opacity: l.status === 'INACTIVO' ? 0.6 : 1 }}>
                      {/* Líder y Contacto */}
                      <td>
                        <Link
                          href={`/portal/lideres/${l.id}`}
                          style={{
                            fontWeight: 700,
                            color: '#0f172a',
                            textDecoration: 'none',
                            display: 'block',
                          }}
                        >
                          {l.name}
                        </Link>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Phone size={12} /> {l.phone}
                        </span>
                        {l.email && (
                          <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginTop: 1 }}>
                            {l.email}
                          </span>
                        )}
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: 4,
                            padding: '1px 6px',
                            borderRadius: 4,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Territorio / Comunidad */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                          <MapPin size={14} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                            {l.territory}
                          </span>
                        </div>
                      </td>

                      {/* Impacto */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: '#f1f5f9',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#334155',
                          }}
                        >
                          <Users size={13} color="#64748b" />
                          {l.beneficiariesCount || 0}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>
                          personas
                        </span>
                      </td>

                      {/* Necesidades Clasificadas (Separadas en Psicológicas y Recursos) */}
                      <td>
                        {l.needs.length === 0 ? (
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Sin clasificar</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {/* Bloque Psicológicas */}
                            {psicologicas.length > 0 && (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                  <HeartHandshake size={11} color="#059669" />
                                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                    Psicológicas ({psicologicas.length})
                                  </span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                  {psicologicas.map((n) => (
                                    <span
                                      key={n.id}
                                      style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        padding: '2px 7px',
                                        borderRadius: 12,
                                        background: '#ecfdf5',
                                        color: '#065f46',
                                        border: '1px solid #a7f3d0',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 3,
                                      }}
                                    >
                                      ✓ {n.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Bloque Recursos / Insumos */}
                            {recursos.length > 0 && (
                              <div style={{ marginTop: psicologicas.length > 0 ? 3 : 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                  <Package size={11} color="#0284c7" />
                                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                    Recursos ({recursos.length})
                                  </span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                  {recursos.map((n) => (
                                    <span
                                      key={n.id}
                                      style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        padding: '2px 7px',
                                        borderRadius: 12,
                                        background: '#f0f9ff',
                                        color: '#0369a1',
                                        border: '1px solid #bae6fd',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 3,
                                      }}
                                    >
                                      📦 {n.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Próxima Acción Pendiente */}
                      <td>
                        {l.nextAction ? (
                          <div
                            style={{
                              padding: '6px 10px',
                              borderRadius: 6,
                              background: '#fffbeb',
                              border: '1px solid #fef3c7',
                            }}
                          >
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#92400e', display: 'block' }}>
                              {l.nextAction}
                            </span>
                            {l.nextActionDate && (
                              <span style={{ fontSize: '0.72rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                                <Calendar size={11} /> Programada: {enBogota(l.nextActionDate)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Ninguna definida</span>
                        )}
                      </td>

                      {/* Último Contacto */}
                      <td>
                        {l.lastContactAt ? (
                          <span style={{ fontSize: '0.78rem', color: '#475569' }}>
                            {enBogota(l.lastContactAt)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Sin registro</span>
                        )}
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8' }}>
                          {l.totalContactos} {l.totalContactos === 1 ? 'contacto' : 'contactos'}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                          {/* Botón WhatsApp */}
                          {whatsappUrl && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="boton-mini"
                              title="Abrir WhatsApp con el líder"
                              style={{ padding: '4px 6px', color: '#16a34a' }}
                            >
                              <MessageCircle size={14} />
                            </a>
                          )}

                          {/* Botón Bitácora */}
                          <button
                            type="button"
                            className="boton-mini"
                            onClick={() => {
                              setLiderParaContacto(l)
                              setModalContactoAbierto(true)
                            }}
                            title="Registrar contacto / Próxima acción"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8' }}
                          >
                            <Clock size={13} />
                            Bitácora
                          </button>

                          {/* Botón Editar */}
                          <button
                            type="button"
                            className="boton-mini"
                            onClick={() => {
                              setLiderAEditar(l)
                              setModalLiderAbierto(true)
                            }}
                            title="Editar líder"
                            style={{ padding: '4px 6px' }}
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      <PaginacionTabla
        pagina={paginaAjustada}
        porPagina={porPagina}
        totalFiltrado={totalFiltrados}
        totalGeneral={lideresIniciales.length}
        alCambiarPagina={setPagina}
        alCambiarPorPagina={(n) => {
          setPorPagina(n)
          setPagina(1)
        }}
      />

      {/* Modal para Crear / Editar Líder */}
      <ModalLider
        abierto={modalLiderAbierto}
        alCerrar={() => {
          setModalLiderAbierto(false)
          setLiderAEditar(null)
        }}
        liderAEditar={liderAEditar}
        catalogoNecesidades={catalogoNecesidades}
      />

      {/* Modal para Registrar Contacto / Bitácora */}
      <ModalBitacoraContacto
        abierto={modalContactoAbierto}
        alCerrar={() => {
          setModalContactoAbierto(false)
          setLiderParaContacto(null)
        }}
        lider={liderParaContacto}
      />
    </div>
  )
}
