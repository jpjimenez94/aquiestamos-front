'use client'

import { usePlantillas } from '@/components/portal/Plantillas'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, PhoneCall, MessageCircle } from 'lucide-react'
import { ModalLider, type CategoriaNecesidad, type LiderData } from '../ModalLider'
import { ModalBitacoraContacto } from '../ModalBitacoraContacto'
import { BotonEliminarLider } from '../BotonEliminarLider'
import { enlaceWhatsapp, mensajeWhatsAppLider } from '@/lib/mensajes'

type Props = {
  lider: LiderData
  catalogoNecesidades: CategoriaNecesidad[]
  esAdmin?: boolean
}

export function BotonAccionesLider({ lider, catalogoNecesidades, esAdmin = false }: Props) {
  const plantillasDelPortal = usePlantillas()
  const router = useRouter()
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
  const [modalContactoAbierto, setModalContactoAbierto] = useState(false)

  const mensajeTexto = mensajeWhatsAppLider({
              plantilla: plantillasDelPortal?.WHATSAPP_LIDER_COMUNITARIO,
    nombre: lider.name,
    territorio: lider.territory,
    necesidades: lider.needs?.map((n) => n.name),
  })

  const whatsappUrl = enlaceWhatsapp(lider.phone, mensajeTexto)

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

      {esAdmin && lider.id && (
        <BotonEliminarLider
          liderId={lider.id}
          nombreLider={lider.name}
          territorio={lider.territory}
          onEliminado={() => router.push('/portal/lideres')}
        />
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
