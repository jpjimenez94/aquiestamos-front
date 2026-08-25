'use client'

import { useState } from 'react'
import { Edit2, PhoneCall, MessageCircle } from 'lucide-react'
import { ModalLider, type CategoriaNecesidad, type LiderData } from '../ModalLider'
import { ModalBitacoraContacto } from '../ModalBitacoraContacto'
import { enlaceWhatsapp } from '@/lib/mensajes'

type Props = {
  lider: LiderData
  catalogoNecesidades: CategoriaNecesidad[]
}

export function BotonAccionesLider({ lider, catalogoNecesidades }: Props) {
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
  const [modalContactoAbierto, setModalContactoAbierto] = useState(false)

  const whatsappUrl = enlaceWhatsapp(
    lider.phone,
    `Hola ${lider.name}, te escribimos desde la coordinación de Red Aquí Estamos sobre el apoyo en ${lider.territory}.`,
  )

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="boton-mini"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#16a34a',
            textDecoration: 'none',
          }}
        >
          <MessageCircle size={14} />
          WhatsApp
        </a>
      )}

      <button
        className="boton-mini"
        type="button"
        onClick={() => setModalContactoAbierto(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: '#eff6ff',
          color: '#1d4ed8',
          borderColor: '#bfdbfe',
        }}
      >
        <PhoneCall size={14} />
        Registrar Contacto
      </button>

      <button
        className="boton-mini"
        data-tono="principal"
        type="button"
        onClick={() => setModalEditarAbierto(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: '#059669',
          color: '#ffffff',
        }}
      >
        <Edit2 size={14} />
        Editar Perfil
      </button>

      <ModalLider
        abierto={modalEditarAbierto}
        alCerrar={() => setModalEditarAbierto(false)}
        liderAEditar={lider}
        catalogoNecesidades={catalogoNecesidades}
      />

      <ModalBitacoraContacto
        abierto={modalContactoAbierto}
        alCerrar={() => setModalContactoAbierto(false)}
        lider={lider as any}
      />
    </div>
  )
}
