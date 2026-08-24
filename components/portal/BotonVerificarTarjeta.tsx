'use client'

import { useState } from 'react'
import { ModalTarjetaProfesional } from './ModalTarjetaProfesional'
import { ShieldCheck, ShieldAlert, FileText, Edit3 } from 'lucide-react'

type BotonVerificarTarjetaProps = {
  profesionalId: string
  profesionalNombre: string
  profesionalTelefono?: string | null
  enlaceDocumentos?: string | null
  verificada?: boolean
  numero?: string | null
  documentoUrl?: string | null
  mostrarSoloBoton?: boolean
}

export function BotonVerificarTarjeta({
  profesionalId,
  profesionalNombre,
  profesionalTelefono,
  enlaceDocumentos,
  verificada = false,
  numero,
  documentoUrl,
  mostrarSoloBoton = false,
}: BotonVerificarTarjetaProps) {
  const [modalAbierto, setModalAbierto] = useState(false)

  return (
    <>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {!mostrarSoloBoton && (
          verificada ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                color: '#059669',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: '#ecfdf5',
                padding: '2px 7px',
                borderRadius: 4,
                border: '1px solid #a7f3d0',
              }}
              title={numero ? `TP: ${numero}` : 'Tarjeta profesional verificada'}
            >
              <ShieldCheck size={13} />
              Verificada
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                color: '#dc2626',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: '#fef2f2',
                padding: '2px 7px',
                borderRadius: 4,
                border: '1px solid #fecaca',
              }}
              title="Tarjeta profesional pendiente de verificación"
            >
              <ShieldAlert size={13} />
              Pendiente TP
            </span>
          )
        )}

        <button
          type="button"
          className="boton-mini"
          data-tono={verificada ? undefined : 'principal'}
          onClick={() => setModalAbierto(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.76rem', padding: '3px 7px' }}
          title="Verificar o cargar tarjeta profesional"
        >
          {verificada ? <Edit3 size={12} /> : <ShieldCheck size={12} />}
          {verificada ? 'Editar TP' : 'Verificar TP'}
        </button>
      </div>

      <ModalTarjetaProfesional
        profesionalId={profesionalId}
        profesionalNombre={profesionalNombre}
        profesionalTelefono={profesionalTelefono}
        numeroActual={numero}
        documentoUrlActual={documentoUrl}
        verificadaActual={verificada}
        enlaceDocumentos={enlaceDocumentos}
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
      />
    </>
  )
}
