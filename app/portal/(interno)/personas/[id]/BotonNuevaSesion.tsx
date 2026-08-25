'use client'

import { useState } from 'react'
import { CalendarPlus, CalendarCheck } from 'lucide-react'
import { ModalAgendar } from './ModalAgendar'

export function BotonNuevaSesion({
  persona,
  profesional,
  asignacionId,
  fechaInicial,
  modalidadInicial,
  enlaceCaso,
  texto = 'Agendar nueva sesión',
  variante = 'default',
}: {
  persona: { id: string; fullName: string; phone: string; preferredModality?: string | null }
  profesional: { id: string; nombre: string; telefono?: string }
  asignacionId?: string
  fechaInicial?: string | null
  modalidadInicial?: string | null
  enlaceCaso?: string
  texto?: string
  variante?: 'default' | 'destacado' | 'link'
}) {
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      {variante === 'destacado' ? (
        <button
          className="boton-mini"
          data-tono="principal"
          type="button"
          onClick={() => setAbierto(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8 }}
        >
          <CalendarCheck size={14} />
          {texto}
        </button>
      ) : variante === 'link' ? (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primario, #2563eb)',
            fontWeight: 600,
            fontSize: '0.84rem',
            cursor: 'pointer',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <CalendarPlus size={14} />
          {texto}
        </button>
      ) : (
        <button
          className="boton-mini"
          type="button"
          onClick={() => setAbierto(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <CalendarPlus size={14} />
          {texto}
        </button>
      )}

      {abierto ? (
        <ModalAgendar
          asignacionId={asignacionId}
          personaId={persona.id}
          profesionalId={profesional.id}
          persona={persona}
          profesional={profesional}
          enlaceCaso={enlaceCaso}
          fechaInicial={fechaInicial}
          modalidadInicial={modalidadInicial}
          esNuevaSesion={true}
          onCerrar={() => setAbierto(false)}
        />
      ) : null}
    </>
  )
}
