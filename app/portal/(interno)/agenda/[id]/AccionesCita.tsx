'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ETIQUETA: Record<string, string> = {
  CONFIRMADA: 'Confirmar',
  REALIZADA: 'Marcar como realizada',
  NO_ASISTIO: 'Marcar que no asistió',
  CANCELADA: 'Cancelar',
  REPROGRAMADA: 'Reprogramar',
}

export function AccionesCita({
  citaId,
  estado,
  siguientesEstados,
}: {
  citaId: string
  estado: string
  siguientesEstados: string[]
}) {
  const router = useRouter()
  const [cargando, setCargando] = useState<string | null>(null)
  const [motivo, setMotivo] = useState('')
  const [pidiendoMotivo, setPidiendoMotivo] = useState(false)
  const [aviso, setAviso] = useState<{ tono: string; texto: string } | null>(null)

  async function cambiar(nuevo: string, motivoTexto?: string) {
    setCargando(nuevo)
    setAviso(null)
    try {
      const respuesta = await fetch(`/api/portal/appointments/${citaId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevo, motivo: motivoTexto }),
      })
      const datos = await respuesta.json()

      if (!respuesta.ok || !datos.success) {
        setAviso({ tono: 'rojo', texto: datos.message ?? 'No se pudo cambiar el estado' })
        return
      }

      setPidiendoMotivo(false)
      setMotivo('')
      router.refresh()
    } catch {
      setAviso({ tono: 'rojo', texto: 'No pudimos conectarnos con el servidor' })
    } finally {
      setCargando(null)
    }
  }

  const posibles = siguientesEstados.filter((e) => e !== 'REPROGRAMADA')

  if (posibles.length === 0) {
    return (
      <div className="panel">
        <h2>Acciones</h2>
        <p className="panel__nota">
          Una cita {estado.toLowerCase()} ya no se puede cambiar. Queda así en el historial.
        </p>
      </div>
    )
  }

  return (
    <div className="panel">
      <h2>Acciones</h2>
      <p className="panel__nota">
        Cancelar libera la franja de inmediato, incluido el descanso.
      </p>

      {aviso ? (
        <div className="aviso-portal" data-tono={aviso.tono}>
          {aviso.texto}
        </div>
      ) : null}

      {pidiendoMotivo ? (
        <div style={{ marginBottom: 14 }}>
          <label className="field__label" htmlFor="motivo-cancelacion">
            ¿Por qué se cancela?
          </label>
          <input
            id="motivo-cancelacion"
            className="input"
            value={motivo}
            placeholder="Ej. la persona pidió moverla"
            onChange={(e) => setMotivo(e.target.value)}
          />
          <div className="button-row" style={{ marginTop: 10 }}>
            <button
              className="boton-mini"
              data-tono="peligro"
              disabled={!motivo.trim() || cargando !== null}
              onClick={() => cambiar('CANCELADA', motivo.trim())}
            >
              {cargando ? 'Cancelando…' : 'Confirmar cancelación'}
            </button>
            <button className="boton-mini" onClick={() => setPidiendoMotivo(false)}>
              Volver
            </button>
          </div>
        </div>
      ) : (
        <div className="button-row">
          {posibles.map((siguiente) =>
            siguiente === 'CANCELADA' ? (
              <button
                className="boton-mini"
                data-tono="peligro"
                key={siguiente}
                onClick={() => setPidiendoMotivo(true)}
              >
                Cancelar
              </button>
            ) : (
              <button
                className="boton-mini"
                data-tono={siguiente === 'CONFIRMADA' ? 'principal' : undefined}
                key={siguiente}
                disabled={cargando !== null}
                onClick={() => cambiar(siguiente)}
              >
                {cargando === siguiente ? 'Guardando…' : (ETIQUETA[siguiente] ?? siguiente)}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
