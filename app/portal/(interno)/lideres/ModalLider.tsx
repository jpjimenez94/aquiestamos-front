'use client'

import { useState } from 'react'
import { X, UserPlus, Save, AlertCircle, Sparkles, HeartHandshake, Package } from 'lucide-react'
import { crearLiderAction, editarLiderAction, type LiderInput } from './actions'

export type CategoriaNecesidad = {
  id: string
  type: 'PSICOLOGICA' | 'RECURSO'
  name: string
  description?: string | null
  active: boolean
}

export type LiderData = {
  id?: string
  name: string
  phone: string
  email?: string | null
  territory: string
  beneficiariesCount: number
  status: 'ACTIVO' | 'EN_SEGUIMIENTO' | 'ATENDIDO' | 'INACTIVO'
  nextAction?: string | null
  nextActionDate?: string | null
  notes?: string | null
  needs?: { id: string; type: string; name: string }[]
}

type Props = {
  abierto: boolean
  alCerrar: () => void
  liderAEditar?: LiderData | null
  catalogoNecesidades: CategoriaNecesidad[]
  alGuardarExitoso?: () => void
}

export function ModalLider({
  abierto,
  alCerrar,
  liderAEditar,
  catalogoNecesidades,
  alGuardarExitoso,
}: Props) {
  const esEdicion = Boolean(liderAEditar?.id)

  const [name, setName] = useState(liderAEditar?.name || '')
  const [phone, setPhone] = useState(liderAEditar?.phone || '')
  const [email, setEmail] = useState(liderAEditar?.email || '')
  const [territory, setTerritory] = useState(liderAEditar?.territory || '')
  const [beneficiariesCount, setBeneficiariesCount] = useState(
    liderAEditar?.beneficiariesCount?.toString() || '0',
  )
  const [status, setStatus] = useState<LiderData['status']>(liderAEditar?.status || 'ACTIVO')
  const [nextAction, setNextAction] = useState(liderAEditar?.nextAction || '')
  const [nextActionDate, setNextActionDate] = useState(
    liderAEditar?.nextActionDate ? liderAEditar.nextActionDate.slice(0, 10) : '',
  )
  const [notes, setNotes] = useState(liderAEditar?.notes || '')
  const [selectedNeedIds, setSelectedNeedIds] = useState<string[]>(
    liderAEditar?.needs?.map((n) => n.id) || [],
  )

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!abierto) return null

  const necesidadesPsicologicas = catalogoNecesidades.filter((c) => c.type === 'PSICOLOGICA')
  const necesidadesRecursos = catalogoNecesidades.filter((c) => c.type === 'RECURSO')

  function alternarNecesidad(id: string) {
    setSelectedNeedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !phone.trim() || !territory.trim()) {
      setError('Por favor completa el nombre, teléfono y territorio de la comunidad.')
      return
    }

    setGuardando(true)
    try {
      const payload: LiderInput = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        territory: territory.trim(),
        beneficiariesCount: parseInt(beneficiariesCount, 10) || 0,
        status,
        nextAction: nextAction.trim() || null,
        nextActionDate: nextActionDate ? new Date(nextActionDate).toISOString() : null,
        notes: notes.trim() || null,
        needIds: selectedNeedIds,
      }

      let res
      if (esEdicion && liderAEditar?.id) {
        res = await editarLiderAction(liderAEditar.id, payload)
      } else {
        res = await crearLiderAction(payload)
      }

      if (!res.success) {
        setError(res.message || 'Error al guardar el líder comunitario')
        return
      }

      alGuardarExitoso?.()
      alCerrar()
    } catch {
      setError('Error inesperado al conectar con el servidor.')
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
          maxWidth: 680,
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
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {esEdicion ? <Save size={18} /> : <UserPlus size={18} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                {esEdicion ? 'Editar Líder Comunitario' : 'Registrar Nuevo Líder Comunitario'}
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Centro de mando operativo · Coordinación territorial
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

        {/* Contenido scrolleable */}
        <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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

            {/* Fila 1: Nombre y Teléfono */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <div>
                <label className="field__label" htmlFor="lider-name">
                  Nombre del Líder <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  id="lider-name"
                  className="input"
                  type="text"
                  placeholder="Ej: Carmen Julia Morales"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="field__label" htmlFor="lider-phone">
                  Teléfono / WhatsApp <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  id="lider-phone"
                  className="input"
                  type="tel"
                  placeholder="Ej: 315 789 4561"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Fila 2: Correo y Territorio */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <div>
                <label className="field__label" htmlFor="lider-territory">
                  Territorio o Comunidad a cargo <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  id="lider-territory"
                  className="input"
                  type="text"
                  placeholder="Ej: Vereda El Vergel / Albergue Central"
                  value={territory}
                  onChange={(e) => setTerritory(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="field__label" htmlFor="lider-email">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  id="lider-email"
                  className="input"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Fila 3: Beneficiarios y Estado */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <div>
                <label className="field__label" htmlFor="lider-beneficiaries">
                  Personas Impactadas (Aprox.)
                </label>
                <input
                  id="lider-beneficiaries"
                  className="input"
                  type="number"
                  min="0"
                  placeholder="Ej: 80"
                  value={beneficiariesCount}
                  onChange={(e) => setBeneficiariesCount(e.target.value)}
                />
              </div>

              <div>
                <label className="field__label" htmlFor="lider-status">
                  Estado Operativo
                </label>
                <select
                  id="lider-status"
                  className="input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LiderData['status'])}
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="EN_SEGUIMIENTO">En seguimiento</option>
                  <option value="ATENDIDO">Atendido</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            </div>

            {/* Clasificación de Necesidades Dinámicas */}
            <div
              style={{
                padding: '14px',
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color="#059669" />
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                  Clasificación de Necesidades de la Comunidad
                </strong>
              </div>

              {/* Categoría 1: Psicológicas */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <HeartHandshake size={14} color="#059669" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>
                    Necesidades Psicológicas
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {necesidadesPsicologicas.map((cat) => {
                    const seleccionada = selectedNeedIds.includes(cat.id)
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => alternarNecesidad(cat.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 20,
                          fontSize: '0.78rem',
                          fontWeight: seleccionada ? 600 : 500,
                          border: seleccionada ? '1px solid #059669' : '1px solid #cbd5e1',
                          background: seleccionada ? '#ecfdf5' : '#ffffff',
                          color: seleccionada ? '#065f46' : '#475569',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {seleccionada ? '✓ ' : '+ '}
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Categoría 2: Recursos */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Package size={14} color="#0284c7" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
                    Necesidades de Recursos / Insumos
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {necesidadesRecursos.map((cat) => {
                    const seleccionada = selectedNeedIds.includes(cat.id)
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => alternarNecesidad(cat.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 20,
                          fontSize: '0.78rem',
                          fontWeight: seleccionada ? 600 : 500,
                          border: seleccionada ? '1px solid #0284c7' : '1px solid #cbd5e1',
                          background: seleccionada ? '#f0f9ff' : '#ffffff',
                          color: seleccionada ? '#0369a1' : '#475569',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {seleccionada ? '✓ ' : '+ '}
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Próxima Acción y Fecha */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <div>
                <label className="field__label" htmlFor="lider-next-action">
                  Próxima Acción Pendiente
                </label>
                <input
                  id="lider-next-action"
                  className="input"
                  type="text"
                  placeholder="Ej: Enviar suministros el viernes / Agendar psicólogo"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                />
              </div>

              <div>
                <label className="field__label" htmlFor="lider-next-date">
                  Fecha Programada para la Acción
                </label>
                <input
                  id="lider-next-date"
                  className="input"
                  type="date"
                  value={nextActionDate}
                  onChange={(e) => setNextActionDate(e.target.value)}
                />
              </div>
            </div>

            {/* Notas / Contexto */}
            <div>
              <label className="field__label" htmlFor="lider-notes">
                Notas y Contexto del Territorio (Opcional)
              </label>
              <textarea
                id="lider-notes"
                className="input"
                rows={2}
                placeholder="Observaciones de acceso al territorio, puntos de encuentro o particularidades..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Pie de modal */}
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              background: '#f8fafc',
              borderBottomLeftRadius: 14,
              borderBottomRightRadius: 14,
            }}
          >
            <button className="boton-mini" type="button" onClick={alCerrar} disabled={guardando}>
              Cancelar
            </button>
            <button
              className="boton-mini"
              data-tono="principal"
              type="submit"
              disabled={guardando}
              style={{
                backgroundColor: '#059669',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              {guardando ? 'Guardando…' : esEdicion ? 'Guardar Cambios' : 'Registrar Líder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
