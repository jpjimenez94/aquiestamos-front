'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageCircle, HelpCircle } from 'lucide-react'
import { whatsappHref, site } from '@/lib/site'

export function BotonFlotanteAcciones() {
  const pathname = usePathname()

  function irAPreguntas(e: React.MouseEvent) {
    if (pathname === '/') {
      e.preventDefault()
      const el = document.getElementById('preguntas-frecuentes')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <aside
      aria-label="Acciones rápidas de contacto y ayuda"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      {/* Botón flotante: Preguntas frecuentes */}
      <Link
        href="/#preguntas-frecuentes"
        onClick={irAPreguntas}
        aria-label="Ver preguntas frecuentes"
        title="Ver preguntas frecuentes"
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          borderRadius: 999,
          backgroundColor: '#15162e',
          color: '#fff6eb',
          fontSize: '0.86rem',
          fontWeight: 700,
          border: '1px solid rgba(255, 246, 235, 0.2)',
          boxShadow: '0 6px 18px rgba(21, 22, 46, 0.28)',
          textDecoration: 'none',
          transition: 'all 0.18s ease',
          backdropFilter: 'blur(8px)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(21, 22, 46, 0.38)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = '0 6px 18px rgba(21, 22, 46, 0.28)'
        }}
      >
        <HelpCircle size={18} style={{ color: '#fff6eb', flexShrink: 0 }} />
        <span>Preguntas frecuentes</span>
      </Link>

      {/* Botón flotante: WhatsApp */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribir a WhatsApp oficial"
        title="Escribir a WhatsApp oficial"
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 18px',
          borderRadius: 999,
          backgroundColor: '#22c55e',
          color: '#ffffff',
          fontSize: '0.9rem',
          fontWeight: 700,
          boxShadow: '0 6px 20px rgba(34, 197, 94, 0.38)',
          textDecoration: 'none',
          transition: 'all 0.18s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
          e.currentTarget.style.boxShadow = '0 8px 26px rgba(34, 197, 94, 0.48)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.38)'
        }}
      >
        <MessageCircle size={20} style={{ flexShrink: 0 }} />
        <span>WhatsApp</span>
      </a>
    </aside>
  )
}
