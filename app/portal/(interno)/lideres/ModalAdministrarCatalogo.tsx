'use client'

import { useState } from 'react'
import { X, Settings, Plus, Edit2, Trash2, Check, AlertCircle, HeartHandshake, Package } from 'lucide-react'
import {
  crearCategoriaNecesidadAction,
  editarCategoriaNecesidadAction,
  eliminarCategoriaNecesidadAction,
  type NeedCategoryInput,
} from './actions'
import type { CategoriaNecesidad } from './ModalLider'

type Props = {
  abierto: boolean
  alCerrar: () => void
  categorias: CategoriaNecesidad[]
  alActualizar?: () => void
}

export function ModalAdministrarCatalogo({
  abierto,
  alCerrar,
  categorias,
  alActualizar,
}: Props) {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'PSICOLOGICA' | 'RECURSO'>('PSICOLOGICA')
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoOrden, setNuevoOrden] = useState('0')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [nombreEditado, setNombreEditado] = useState('')

  if (!abierto) return null

  const filtradas = categorias.filter((c) => c.type === tipoSeleccionado)

  async function agregarCategoria(e: React.FormEvent) {
    e.preventDefault()
    if (!nuevoNombre.trim()) return

    setGuardando(true)
    setError(null)
    try {
      const payload: NeedCategoryInput = {
        type: tipoSeleccionado,
        name: nuevoNombre.trim(),
        order: parseInt(nuevoOrden, 10) || 0,
        active: true,
      }
      const res = await crearCategoriaNecesidadAction(payload)
      if (!res.success) {
        setError(res.message || 'Error al agregar la opción.')
        return
      }
      setNuevoNombre('')
      setNuevoOrden('0')
      alActualizar?.()
    } catch {
      setError('Error inesperado al conectar con el servidor.')
    } finally {
      setGuardando(false)
    }
  }

  async function guardarEdicion(id: string) {
    if (!nombreEditado.trim()) return
    setGuardando(true)
    setError(null)
    try {
      const res = await editarCategoriaNecesidadAction(id, { name: nombreEditado.trim() })
      if (!res.success) {
        setError(res.message || 'Error al actualizar.')
        return
      }
      setEditandoId(null)
      setNombreEditado('')
      alActualizar?.()
    } catch {
      setError('Error al actualizar la opción.')
    } finally {
      setGuardando(false)
    }
  }

  async function toggleActivo(id: string, actual: boolean) {
    setGuardando(true)
    setError(null)
    try {
      const res = await editarCategoriaNecesidadAction(id, { active: !actual })
      if (!res.success) {
        setError(res.message || 'Error al cambiar estado.')
        return
      }
      alActualizar?.()
    } catch {
      setError('Error al cambiar estado.')
    } finally {
      setGuardando(false)
    }
  }

  async function eliminarOpcion(id: string) {
    if (!confirm('¿Deseas eliminar o desactivar esta opción del catálogo?')) return
    setGuardando(true)
    setError(null)
    try {
      const res = await eliminarCategoriaNecesidadAction(id)
      if (!res.success) {
        setError(res.message || 'Error al eliminar la opción.')
        return
      }
      alActualizar?.()
    } catch {
      setError('Error al eliminar la opción.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 9999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) alCerrar()
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          maxWidth: 640,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Cabecera */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Settings size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Catálogo Dinámico de Necesidades
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Administración de opciones para la clasificación de comunidades (Solo Administrador)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Pestañas de Tipo */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            padding: '0 20px',
          }}
        >
          <button
            type="button"
            onClick={() => setTipoSeleccionado('PSICOLOGICA')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: tipoSeleccionado === 'PSICOLOGICA' ? '#059669' : '#64748b',
              borderBottom: tipoSeleccionado === 'PSICOLOGICA' ? '2px solid #059669' : '2px solid transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <HeartHandshake size={15} />
            Necesidades Psicológicas ({categorias.filter((c) => c.type === 'PSICOLOGICA').length})
          </button>

          <button
            type="button"
            onClick={() => setTipoSeleccionado('RECURSO')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: tipoSeleccionado === 'RECURSO' ? '#0284c7' : '#64748b',
              borderBottom: tipoSeleccionado === 'RECURSO' ? '2px solid #0284c7' : '2px solid transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Package size={15} />
            Necesidades de Recursos ({categorias.filter((c) => c.type === 'RECURSO').length})
          </button>
        </div>

        {/* Contenido */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Formulario para agregar nueva opción */}
          <form
            onSubmit={agregarCategoria}
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
              background: '#f8fafc',
              padding: '12px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ flex: 1 }}>
              <label className="field__label" style={{ fontSize: '0.78rem' }}>
                Nueva opción de necesidad {tipoSeleccionado === 'PSICOLOGICA' ? 'psicológica' : 'de recursos'}
              </label>
              <input
                className="input"
                type="text"
                placeholder={
                  tipoSeleccionado === 'PSICOLOGICA'
                    ? 'Ej: Primeros auxilios psicológicos / Talleres comunitarios'
                    : 'Ej: Kits de higiene menstrual / Filtros de agua'
                }
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                required
              />
            </div>

            <button
              className="boton-mini"
              data-tono="principal"
              type="submit"
              disabled={guardando || !nuevoNombre.trim()}
              style={{
                backgroundColor: tipoSeleccionado === 'PSICOLOGICA' ? '#059669' : '#0284c7',
                color: '#ffffff',
                height: 38,
                padding: '0 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Plus size={14} />
              Agregar
            </button>
          </form>

          {/* Lista de opciones actuales */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Opciones configuradas en el sistema
            </span>

            {filtradas.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '10px 0' }}>
                No hay opciones registradas en esta categoría.
              </p>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filtradas.map((cat) => (
                  <li
                    key={cat.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      background: cat.active ? '#ffffff' : '#f1f5f9',
                      opacity: cat.active ? 1 : 0.65,
                    }}
                  >
                    {editandoId === cat.id ? (
                      <div style={{ display: 'flex', gap: 6, flex: 1, marginRight: 8 }}>
                        <input
                          className="input"
                          type="text"
                          value={nombreEditado}
                          onChange={(e) => setNombreEditado(e.target.value)}
                          style={{ padding: '4px 8px', height: 32 }}
                          autoFocus
                        />
                        <button
                          className="boton-mini"
                          type="button"
                          onClick={() => guardarEdicion(cat.id)}
                          style={{ background: '#059669', color: '#fff' }}
                        >
                          <Check size={13} />
                        </button>
                        <button
                          className="boton-mini"
                          type="button"
                          onClick={() => setEditandoId(null)}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: cat.active ? (cat.type === 'PSICOLOGICA' ? '#059669' : '#0284c7') : '#94a3b8',
                          }}
                        />
                        <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#0f172a' }}>
                          {cat.name}
                        </span>
                        {!cat.active && (
                          <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#e2e8f0', padding: '1px 6px', borderRadius: 4 }}>
                            Inactiva
                          </span>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditandoId(cat.id)
                          setNombreEditado(cat.name)
                        }}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
                        title="Editar nombre"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActivo(cat.id, cat.active)}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          color: cat.active ? '#d97706' : '#059669',
                          fontSize: '0.75rem',
                          padding: '2px 6px',
                        }}
                        title={cat.active ? 'Pausar opción' : 'Activar opción'}
                      >
                        {cat.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarOpcion(cat.id)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Pie */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            background: '#f8fafc',
            borderBottomLeftRadius: 14,
            borderBottomRightRadius: 14,
          }}
        >
          <button className="boton-mini" type="button" onClick={alCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
