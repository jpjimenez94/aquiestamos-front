'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HeartHandshake } from 'lucide-react'

/**
 * La fecha en palabras, aquí y no desde `@/lib/portal`: ese módulo lee
 * cookies con `next/headers` y un componente cliente no puede importarlo —
 * el build lo rechaza—. Es una fecha, no hace falta más.
 */
function enBogota(iso: string, _conHora = false): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Marcar —o desmarcar— a un profesional como supervisor desde su ficha.
 *
 * Él puede ofrecerse desde su enlace del caso. Esto es para cuando lo dijo por
 * WhatsApp o en una llamada y coordinación lo apunta por él: la misma puerta
 * del backend (`PATCH /cuidado/supervisores/:id`), con su permiso y su
 * auditoría. Sin permiso de gestionar, solo se ve el estado.
 *
 * Ofrecerse no lo hace facilitar: para eso tiene que estar activo y con la
 * tarjeta verificada, y aquí se le avisa a quien marca si le falta eso.
 */
export function BotonSupervisor({
  profesionalId,
  esSupervisor,
  desde,
  puedeGestionar,
  tarjetaVerificada,
}: {
  profesionalId: string
  esSupervisor: boolean
  desde: string | null
  puedeGestionar: boolean
  tarjetaVerificada: boolean
}) {
  const router = useRouter()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function alternar() {
    setError(null)
    setGuardando(true)
    try {
      const r = await fetch(`/api/portal/cuidado/supervisores/${profesionalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disponible: !esSupervisor }),
      })
      const d = await r.json()
      if (!r.ok || !d.success) {
        setError(d.message ?? 'No se pudo guardar.')
        return
      }
      router.refresh()
    } catch {
      setError('No pudimos conectarnos con el servidor.')
    } finally {
      setGuardando(false)
    }
  }

  const estado = esSupervisor ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#2e7d5b', fontWeight: 600 }}>
      <HeartHandshake size={14} />
      Se ofreció{desde ? ` · desde el ${enBogota(desde, false)}` : ''}
    </span>
  ) : (
    <span className="tabla__secundario">No se ha ofrecido</span>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {estado}
        {puedeGestionar ? (
          <button type="button" className="boton-mini" onClick={alternar} disabled={guardando}>
            {guardando ? 'Guardando…' : esSupervisor ? 'Quitar' : 'Marcar como supervisor'}
          </button>
        ) : null}
      </div>
      {esSupervisor && !tarjetaVerificada ? (
        <span style={{ fontSize: '0.78rem', color: '#a8731e', fontWeight: 600 }}>
          Para facilitar necesita la tarjeta verificada: hasta entonces no aparece en Cuidado del equipo.
        </span>
      ) : null}
      {error ? (
        <span className="tamizaje__error" role="alert" style={{ fontSize: '0.8rem' }}>
          {error}
        </span>
      ) : null}
    </div>
  )
}
