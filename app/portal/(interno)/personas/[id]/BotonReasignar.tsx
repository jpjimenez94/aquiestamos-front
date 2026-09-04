'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw } from 'lucide-react'
import { usePlantillas } from '@/components/portal/Plantillas'
import { mensajeDeCambioDeProfesional } from '@/lib/mensajes'
import { Mensaje } from './Mensaje'

const MOTIVOS_REASIGNACION = [
  'El profesional no respondió',
  'El profesional tuvo un imprevisto / no puede continuar',
  'Incompatibilidad de horarios / fechas',
  'La persona solicitó cambio de profesional',
  'Otro motivo',
] as const

/**
 * El motivo que significa «no fue cosa de horarios: fue él».
 *
 * Soltar un caso tiene dos salidas y hasta ahora todas se escribían igual.
 * RECHAZADA dice que el profesional no podía; CANCELADA, que no se pudo
 * cuadrar. Distinguirlas es —según la propia máquina de estados— lo único que
 * permite saber si se está asignando mal, pero a RECHAZADA solo se llegaba
 * desde el enlace del profesional. Cuando avisaba por WhatsApp, que es lo
 * normal, coordinación pulsaba reasignar y la distinción se perdía.
 *
 * «No respondió» se queda fuera a propósito: el silencio no es lo mismo que un
 * no, y desde que asignar no pide permiso puede significar simplemente que
 * nadie le mandó el aviso.
 */
const MOTIVO_DEL_PROFESIONAL = 'El profesional tuvo un imprevisto / no puede continuar'

/** Estados desde los que la máquina de estados admite RECHAZADA. */
const ADMITEN_RECHAZO = ['PROPUESTA', 'ACEPTADA']

export function BotonReasignar({
  asignacionId,
  profesionalNombre,
  personaNombre,
  personaTelefono,
  cuandoAnterior,
  estadoAsignacion,
  textoBoton = 'Reasignar profesional',
  onError,
}: {
  asignacionId: string
  profesionalNombre: string
  /**
   * Con quién hay que hablar antes de confirmar.
   *
   * Sin estos datos el botón hace lo que hacía: cancelar y refrescar. Con
   * ellos ofrece el mensaje de aviso, que es lo que faltaba — reasignar era la
   * única acción de la ficha que no le decía nada a nadie, y la persona se
   * quedaba sin profesional y sin saberlo.
   */
  personaNombre?: string
  personaTelefono?: string
  /** La sesión que se cae con el cambio, ya en palabras, si la había. */
  cuandoAnterior?: string | null
  /** En qué estado está la asignación: decide si se puede registrar un rechazo. */
  estadoAsignacion?: string
  textoBoton?: string
  onError?: (m: string) => void
}) {
  const router = useRouter()
  const plantillasDelPortal = usePlantillas()
  const [confirmando, setConfirmando] = useState(false)
  const [motivo, setMotivo] = useState<string>('')
  const [detalle, setDetalle] = useState('')
  const [errorLocal, setErrorLocal] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  async function reasignar() {
    if (!motivo) {
      const msg = 'Elige el motivo de la reasignación.'
      setErrorLocal(msg)
      onError?.(msg)
      return
    }
    if (motivo === 'Otro motivo' && detalle.trim().length < 3) {
      const msg = 'Cuéntanos el motivo por el cual se reasigna.'
      setErrorLocal(msg)
      onError?.(msg)
      return
    }

    const texto =
      motivo === 'Otro motivo'
        ? detalle.trim().slice(0, 280)
        : detalle.trim()
          ? `${motivo}: ${detalle.trim()}`.slice(0, 300)
          : motivo

    /**
     * Si el caso se suelta porque él no puede, se escribe como rechazo.
     *
     * Solo desde los estados en que la máquina de estados lo admite: con una
     * sesión ya agendada la salida es CANCELADA, y mandar `rechazo` ahí
     * devolvería un error de transición en vez de reasignar.
     */
    const rechazo =
      motivo === MOTIVO_DEL_PROFESIONAL && ADMITEN_RECHAZO.includes(String(estadoAsignacion))

    setEnviando(true)
    setErrorLocal(null)
    try {
      const r = await fetch(`/api/portal/appointments/asignaciones/${asignacionId}/cancelar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: texto, rechazo }),
      })
      const d = await r.json()
      if (!r.ok || !d.success) {
        const msg = d.message ?? 'No se pudo reasignar'
        setErrorLocal(msg)
        onError?.(msg)
        return
      }
      router.refresh()
    } catch {
      const msg = 'No pudimos conectarnos con el servidor'
      setErrorLocal(msg)
      onError?.(msg)
    } finally {
      setEnviando(false)
    }
  }

  if (!confirmando) {
    return (
      <button className="boton-mini" type="button" onClick={() => setConfirmando(true)}>
        <RotateCcw size={14} />
        {textoBoton}
      </button>
    )
  }

  return (
    <div
      style={{
        marginTop: 12,
        padding: '14px 16px',
        backgroundColor: 'var(--color-bg-default)',
        borderRadius: 'var(--border-radii-layout)',
        border: '1px solid var(--color-border-default)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%',
      }}
    >
      <strong style={{ fontSize: '0.92rem', color: 'var(--color-text-default)' }}>
        Reasignar profesional (actual: {profesionalNombre})
      </strong>
      <p className="panel__nota" style={{ margin: 0 }}>
        ¿Por qué motivo se reasigna este caso?
      </p>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {MOTIVOS_REASIGNACION.map((m) => (
          <button
            key={m}
            className="boton-mini"
            data-tono={motivo === m ? 'principal' : undefined}
            type="button"
            aria-pressed={motivo === m}
            onClick={() => {
              setMotivo(m)
              setErrorLocal(null)
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <input
        className="input"
        style={{ maxWidth: 420 }}
        placeholder={motivo === 'Otro motivo' ? '¿Cuál es el motivo?' : 'Detalle o nota adicional (opcional)'}
        maxLength={280}
        value={detalle}
        onChange={(e) => {
          setDetalle(e.target.value)
          setErrorLocal(null)
        }}
      />

      <p className="panel__nota" style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
        Al confirmar, la asignación actual se cancelará y el caso volverá a <strong>Por asignar</strong> para que le busques otro profesional de inmediato. Si tenía una sesión agendada, se cancela.
      </p>

      {/*
        El aviso va aquí y no después de confirmar, por dónde acaba la pantalla.
        Al reasignar, el caso vuelve a la cola y este panel desaparece con él:
        un mensaje que apareciera «al terminar» no lo vería nadie. Aquí está a
        la vista en el momento en que se decide, que es cuando hay que mandarlo.
      */}
      {personaNombre && personaTelefono ? (
        <div style={{ marginTop: 4 }}>
          <Mensaje
            titulo="Avísale a la persona"
            nota="Se queda sin profesional y con su cita cancelada. Es el único aviso que va a recibir hasta que le asignes a alguien."
            telefono={personaTelefono}
            texto={mensajeDeCambioDeProfesional({
              plantilla: plantillasDelPortal?.WHATSAPP_CAMBIO_DE_PROFESIONAL,
              persona: personaNombre,
              profesional: profesionalNombre,
              cuandoAnterior,
            })}
            copiado={copiado}
            alCopiar={(t) => {
              navigator.clipboard.writeText(t)
              setCopiado(true)
              setTimeout(() => setCopiado(false), 2000)
            }}
          />
        </div>
      ) : null}

      {errorLocal ? (
        <div className="aviso-portal" data-tono="rojo">
          {errorLocal}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
        <button
          className="boton-mini"
          data-tono="peligro"
          type="button"
          onClick={reasignar}
          disabled={enviando}
        >
          {enviando ? 'Reasignando…' : 'Sí, reasignar caso'}
        </button>
        <button className="boton-mini" type="button" onClick={() => setConfirmando(false)}>
          Volver
        </button>
      </div>
    </div>
  )
}
