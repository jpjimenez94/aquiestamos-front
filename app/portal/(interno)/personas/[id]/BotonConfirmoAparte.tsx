'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PhoneCall } from 'lucide-react'

/**
 * La escapatoria del paso 4.
 *
 * El enlace de agenda de la persona espera a que el profesional confirme que su
 * disponibilidad sigue vigente: ella elige de esa agenda, y ofrecérsela antes
 * es exponerla a reservar un espacio que ya no existe.
 *
 * Pero esperar un clic es lo que este flujo vino a quitar. De cada ocho
 * asignaciones del modelo anterior, siete murieron esperando una respuesta que
 * llegaba por WhatsApp o por teléfono y no por la pantalla. Así que la espera
 * tiene puerta: quien coordina puede decir «hablé con él» y seguir.
 *
 * Queda con su correo en la asignación y en la auditoría, porque es una
 * afirmación sobre una conversación que nadie más presenció.
 */
export function BotonConfirmoAparte({ asignacionId }: { asignacionId: string }) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function confirmar() {
    setEnviando(true)
    setError(null)
    try {
      const r = await fetch(
        `/api/portal/appointments/asignaciones/${asignacionId}/confirmar-profesional`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      )
      const d = await r.json()
      if (!r.ok || !d.success) {
        setError(d.message ?? 'No se pudo registrar la confirmación')
        return
      }
      router.refresh()
    } catch {
      setError('No pudimos conectarnos con el servidor')
    } finally {
      setEnviando(false)
    }
  }

  if (!confirmando) {
    return (
      <button className="boton-mini" type="button" onClick={() => setConfirmando(true)}>
        <PhoneCall size={14} />
        Ya me confirmó por otro medio
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
      <p className="panel__nota" style={{ margin: 0, fontSize: '0.82rem' }}>
        Vas a dar por confirmado que <strong>habló contigo</strong> y que su disponibilidad
        sigue vigente. Queda registrado con tu correo. Solo después de esto se le puede
        mandar a la persona su enlace para elegir hora.
      </p>

      {error ? (
        <div className="aviso-portal" data-tono="rojo">
          {error}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button
          className="boton-mini"
          data-tono="principal"
          type="button"
          onClick={confirmar}
          disabled={enviando}
        >
          {enviando ? 'Registrando…' : 'Sí, hablé con él'}
        </button>
        <button className="boton-mini" type="button" onClick={() => setConfirmando(false)}>
          Volver
        </button>
      </div>
    </div>
  )
}
