'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X } from 'lucide-react'

/**
 * Corregir los datos de contacto de un profesional.
 *
 * El backend ya sabía hacerlo: `PATCH /professionals/:id` existe desde hace
 * tiempo, con su permiso y su auditoría. Lo que no existía era la pantalla, así
 * que un nombre mal escrito o un teléfono viejo solo se podían arreglar
 * entrando a la base. Y el teléfono es el que abre los WhatsApp que le
 * mandamos: si está mal, el profesional simplemente no se entera de sus casos.
 *
 * Lo que no está aquí, a propósito:
 *
 *   · La tarjeta profesional y su verificación. Tienen su propio permiso
 *     —`profesional:verificar-tarjeta`— y su propia sección, porque quien
 *     lleva el WhatsApp sube el soporte pero no toca los datos maestros.
 *   · El estado. Ya tiene su botón, con sus efectos sobre los casos abiertos.
 *   · La agenda. Tiene su propio editor más abajo.
 */
type Campos = {
  fullName: string
  phone: string
  email: string
  city: string
  profession: string
  modality: string
  travelsTo: string
  maxActiveCases: number
  notes: string
}

export function BotonEditarProfesional({
  profesional,
}: {
  profesional: {
    id: string
    fullName: string
    phone: string
    email: string
    city: string
    profession: string
    modality: string
    travelsTo?: string | null
    maxActiveCases: number
    notes?: string | null
  }
}) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const desdeLaFicha = (): Campos => ({
    fullName: profesional.fullName ?? '',
    phone: profesional.phone ?? '',
    email: profesional.email ?? '',
    city: profesional.city ?? '',
    profession: profesional.profession ?? '',
    modality: profesional.modality ?? '',
    travelsTo: profesional.travelsTo ?? '',
    maxActiveCases: profesional.maxActiveCases ?? 3,
    notes: profesional.notes ?? '',
  })

  const [campos, setCampos] = useState<Campos>(desdeLaFicha)

  function abrir() {
    setCampos(desdeLaFicha())
    setError(null)
    setAbierto(true)
  }

  async function guardar() {
    setGuardando(true)
    setError(null)

    /**
     * Solo lo que cambió. Mandar el formulario entero haría que la auditoría
     * dijera que cambiaron nueve cosas cuando cambió una — y la auditoría de
     * un dato maestro es lo que permite saber quién puso ese número.
     */
    const original = desdeLaFicha()
    const cambios: Record<string, unknown> = {}
    for (const clave of Object.keys(campos) as (keyof Campos)[]) {
      if (original[clave] !== campos[clave]) cambios[clave] = campos[clave]
    }

    if (Object.keys(cambios).length === 0) {
      setAbierto(false)
      setGuardando(false)
      return
    }

    try {
      const res = await fetch(`/api/portal/professionals/${profesional.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cambios),
      })
      const datos = await res.json()
      if (!res.ok || !datos.success) {
        setError(datos.message ?? 'No se pudieron guardar los cambios')
        setGuardando(false)
        return
      }
      setAbierto(false)
      setGuardando(false)
      router.refresh()
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
      setGuardando(false)
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        className="boton-mini"
        onClick={abrir}
        title="Corregir los datos de contacto de este profesional"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
      >
        <Pencil size={13} />
        Editar datos
      </button>
    )
  }

  return (
    <div className="modal-eliminar-overlay" onClick={() => setAbierto(false)}>
      <div
        className="modal-eliminar"
        style={{ maxWidth: 620, textAlign: 'left', padding: '24px 26px', alignItems: 'stretch' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            borderBottom: '1px solid var(--color-border-default, #e2e8f0)',
            paddingBottom: 12,
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Corregir los datos</h2>
          <button
            type="button"
            className="boton-icono"
            onClick={() => setAbierto(false)}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <p className="panel__nota" style={{ margin: '10px 0 0' }}>
          El teléfono es el que abre los WhatsApp que le mandamos: si está mal, no se entera de
          sus casos. La tarjeta profesional, el estado y la agenda se editan en sus propias
          secciones.
        </p>

        {error ? (
          <div className="aviso-portal" data-tono="rojo" style={{ margin: '12px 0 0' }}>
            {error}
          </div>
        ) : null}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            marginTop: 14,
          }}
        >
          <Campo etiqueta="Nombre completo *">
            <input
              className="input"
              value={campos.fullName}
              onChange={(e) => setCampos({ ...campos, fullName: e.target.value })}
            />
          </Campo>

          <Campo etiqueta="Teléfono *" nota="Con indicativo si es de fuera de Colombia.">
            <input
              className="input"
              value={campos.phone}
              onChange={(e) => setCampos({ ...campos, phone: e.target.value })}
            />
          </Campo>

          <Campo etiqueta="Correo *" nota="Es con el que entra a su enlace del caso.">
            <input
              className="input"
              type="email"
              value={campos.email}
              onChange={(e) => setCampos({ ...campos, email: e.target.value })}
            />
          </Campo>

          <Campo etiqueta="Ciudad *">
            <input
              className="input"
              value={campos.city}
              onChange={(e) => setCampos({ ...campos, city: e.target.value })}
            />
          </Campo>

          <Campo etiqueta="Profesión *">
            <input
              className="input"
              value={campos.profession}
              onChange={(e) => setCampos({ ...campos, profession: e.target.value })}
            />
          </Campo>

          <Campo etiqueta="Modalidad">
            <select
              className="input"
              value={campos.modality}
              onChange={(e) => setCampos({ ...campos, modality: e.target.value })}
            >
              <option value="VIRTUAL">Virtual</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="AMBAS">Ambas</option>
            </select>
          </Campo>

          <Campo etiqueta="Se desplaza a">
            <input
              className="input"
              value={campos.travelsTo}
              onChange={(e) => setCampos({ ...campos, travelsTo: e.target.value })}
            />
          </Campo>

          <Campo
            etiqueta="Cuántos acompañamientos acepta a la vez"
            nota="Es el cupo que usa el sistema para no sobrecargarlo."
          >
            <input
              className="input"
              type="number"
              min={0}
              max={50}
              value={campos.maxActiveCases}
              onChange={(e) =>
                setCampos({ ...campos, maxActiveCases: Number(e.target.value) || 0 })
              }
            />
          </Campo>
        </div>

        <div style={{ marginTop: 12 }}>
          <Campo etiqueta="Notas internas" nota="Nunca salen al profesional ni al agendador.">
            <textarea
              className="input"
              rows={3}
              value={campos.notes}
              onChange={(e) => setCampos({ ...campos, notes: e.target.value })}
            />
          </Campo>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end',
            marginTop: 18,
            flexWrap: 'wrap',
          }}
        >
          <button type="button" className="boton-mini" onClick={() => setAbierto(false)}>
            Cancelar
          </button>
          <button
            type="button"
            className="boton-mini"
            data-tono="principal"
            onClick={guardar}
            disabled={guardando}
          >
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Campo({
  etiqueta,
  nota,
  children,
}: {
  etiqueta: string
  nota?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <span className="field__label">{etiqueta}</span>
      {children}
      {nota ? (
        <span className="tabla__secundario" style={{ fontSize: '0.76rem' }}>
          {nota}
        </span>
      ) : null}
    </div>
  )
}
