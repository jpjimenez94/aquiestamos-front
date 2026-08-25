'use client'

import { useState } from 'react'
import { Plus, Settings } from 'lucide-react'
import { ModalLider, type CategoriaNecesidad } from './ModalLider'
import { ModalAdministrarCatalogo } from './ModalAdministrarCatalogo'

type Props = {
  catalogoNecesidades: CategoriaNecesidad[]
  esAdmin: boolean
}

export function BotonAccionesCabecera({ catalogoNecesidades, esAdmin }: Props) {
  const [modalLiderAbierto, setModalLiderAbierto] = useState(false)
  const [modalCatalogoAbierto, setModalCatalogoAbierto] = useState(false)

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      {esAdmin && (
        <button
          className="boton-mini"
          type="button"
          onClick={() => setModalCatalogoAbierto(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Settings size={14} />
          Catálogo de Necesidades
        </button>
      )}

      <button
        className="boton-mini"
        data-tono="principal"
        type="button"
        onClick={() => setModalLiderAbierto(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: '#059669',
          color: '#ffffff',
          fontWeight: 600,
        }}
      >
        <Plus size={14} />
        Registrar Líder Comunitario
      </button>

      <ModalLider
        abierto={modalLiderAbierto}
        alCerrar={() => setModalLiderAbierto(false)}
        catalogoNecesidades={catalogoNecesidades}
      />

      {esAdmin && (
        <ModalAdministrarCatalogo
          abierto={modalCatalogoAbierto}
          alCerrar={() => setModalCatalogoAbierto(false)}
          categorias={catalogoNecesidades}
        />
      )}
    </div>
  )
}
