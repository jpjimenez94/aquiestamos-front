'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  MoreHorizontal,
  Edit2,
  Plus,
  Users,
  MapPin,
  Sparkles,
  HeartHandshake,
  Package,
} from 'lucide-react'
import { ModalLider, type CategoriaNecesidad, type LiderData } from './ModalLider'
import { ModalBitacoraContacto } from './ModalBitacoraContacto'
import { inactivarLiderAction } from './actions'
import { enBogota } from '@/lib/portal'
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

export function TablaLideres({ lideresIniciales, catalogoNecesidades, esAdmin }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroNecesidad, setFiltroNecesidad] = useState<'TODAS' | 'PSICOLOGICA' | 'RECURSO' | 'AMBAS'>('TODAS')
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS')

  // Modales
  const [modalLiderAbierto, setModalLiderAbierto] = useState(false)
  const [liderAEditar, setLiderAEditar] = useState<LiderData | null>(null)
  const [modalContactoAbierto, setModalContactoAbierto] = useState(false)
  const [liderParaContacto, setLiderParaContacto] = useState<LiderFila | null>(null)

  const lideresFiltrados = useMemo(() => {
    return lideresIniciales.filter((l) => {
      // Filtro Estado
      if (filtroEstado !== 'TODOS' && l.status !== filtroEstado) {
        return false
      }

      // Filtro Necesidad
      if (filtroNecesidad === 'PSICOLOGICA' && !l.tienePsicologicas) {
        return false
      }
      if (filtroNecesidad === 'RECURSO' && !l.tieneRecursos) {
        return false
      }
      if (filtroNecesidad === 'AMBAS' && (!l.tienePsicologicas || !l.tieneRecursos)) {
        return false
      }

      // Filtro Búsqueda
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim()
        const coincide =
          l.name.toLowerCase().includes(q) ||
          l.territory.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          (l.nextAction && l.nextAction.toLowerCase().includes(q)) ||
          l.needs.some((n) => n.name.toLowerCase().includes(q))
        if (!coincide) return false
      }

      return true
    })
  }, [lideresIniciales, busqueda, filtroNecesidad, filtroEstado])

  async function handleInactivar(id: string) {
    if (!confirm('¿Seguro que deseas inactivar a este líder comunitario?')) return
    await inactivarLiderAction(id)
  }

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

  return (
    <div>
      {/* Barra de Filtros y Búsqueda */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          padding: '14px 16px',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          marginBottom: 16,
        }}
      >
        {/* Buscador */}
        <div style={{ position: 'relative', minWidth: 260, flex: 1 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            className="input"
            type="text"
            placeholder="Buscar por líder, territorio, tarea pendiente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>

        {/* Filtros de Tipo de Necesidad */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginRight: 4 }}>
            Necesidad:
          </span>
          <button
            type="button"
            className="boton-mini"
            data-tono={filtroNecesidad === 'TODAS' ? 'principal' : undefined}
            onClick={() => setFiltroNecesidad('TODAS')}
            style={filtroNecesidad === 'TODAS' ? { background: '#0f172a', color: '#fff' } : undefined}
          >
            Todas ({lideresIniciales.length})
          </button>
          <button
            type="button"
            className="boton-mini"
            onClick={() => setFiltroNecesidad('PSICOLOGICA')}
            style={
              filtroNecesidad === 'PSICOLOGICA'
                ? { background: '#059669', color: '#fff' }
                : { color: '#065f46', borderColor: '#a7f3d0' }
            }
          >
            <HeartHandshake size={13} />
            Psicológicas ({lideresIniciales.filter((l) => l.tienePsicologicas).length})
          </button>
          <button
            type="button"
            className="boton-mini"
            onClick={() => setFiltroNecesidad('RECURSO')}
            style={
              filtroNecesidad === 'RECURSO'
                ? { background: '#0284c7', color: '#fff' }
                : { color: '#0369a1', borderColor: '#bae6fd' }
            }
          >
            <Package size={13} />
            Recursos ({lideresIniciales.filter((l) => l.tieneRecursos).length})
          </button>
          <button
            type="button"
            className="boton-mini"
            onClick={() => setFiltroNecesidad('AMBAS')}
            style={
              filtroNecesidad === 'AMBAS'
                ? { background: '#7c3aed', color: '#fff' }
                : { color: '#6d28d9', borderColor: '#ddd6fe' }
            }
          >
            <Sparkles size={13} />
            Ambas ({lideresIniciales.filter((l) => l.tienePsicologicas && l.tieneRecursos).length})
          </button>
        </div>

        {/* Filtro Estado */}
        <div>
          <select
            className="input"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ minWidth: 140, padding: '6px 10px', height: 38 }}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVO">Activos</option>
            <option value="EN_SEGUIMIENTO">En seguimiento</option>
            <option value="ATENDIDO">Atendidos</option>
            <option value="INACTIVO">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Tabla de Líderes */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        {lideresFiltrados.length === 0 ? (
          <div style={{ padding: 36, textAlign: 'center', color: '#64748b' }}>
            <Users size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <strong style={{ display: 'block', fontSize: '1rem', color: '#334155' }}>
              No se encontraron líderes comunitarios con los filtros seleccionados.
            </strong>
            <p style={{ fontSize: '0.85rem', margin: '6px 0 0' }}>
              Prueba cambiando los criterios de búsqueda o registra un nuevo líder.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tabla" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ minWidth: 180 }}>Líder y Contacto</th>
                  <th style={{ minWidth: 160 }}>Territorio / Comunidad</th>
                  <th style={{ minWidth: 110, textAlign: 'center' }}>Impacto</th>
                  <th style={{ minWidth: 200 }}>Necesidades Clasificadas</th>
                  <th style={{ minWidth: 220 }}>Próxima Acción Pendiente</th>
                  <th style={{ minWidth: 120 }}>Último Contacto</th>
                  <th style={{ minWidth: 140, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lideresFiltrados.map((l) => {
                  const badge = getBadgeStatus(l.status)
                  const whatsappUrl = enlaceWhatsapp(
                    l.phone,
                    `Hola ${l.name}, te escribimos desde la coordinación de Red Aquí Estamos sobre el apoyo en ${l.territory}.`,
                  )

                  return (
                    <tr key={l.id} style={{ opacity: l.status === 'INACTIVO' ? 0.6 : 1 }}>
                      {/* Líder */}
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

                      {/* Territorio */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                          <MapPin size={14} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                            {l.territory}
                          </span>
                        </div>
                      </td>

                      {/* Beneficiarios */}
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

                      {/* Necesidades Clasificadas */}
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {l.needs.length === 0 ? (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sin clasificar</span>
                          ) : (
                            l.needs.map((n) => {
                              const esPsicologica = n.type === 'PSICOLOGICA'
                              return (
                                <span
                                  key={n.id}
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    padding: '2px 7px',
                                    borderRadius: 12,
                                    background: esPsicologica ? '#ecfdf5' : '#f0f9ff',
                                    color: esPsicologica ? '#065f46' : '#0369a1',
                                    border: `1px solid ${esPsicologica ? '#a7f3d0' : '#bae6fd'}`,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                  }}
                                >
                                  {esPsicologica ? <HeartHandshake size={10} /> : <Package size={10} />}
                                  {n.name}
                                </span>
                              )
                            })
                          )}
                        </div>
                      </td>

                      {/* Próxima Acción */}
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
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
