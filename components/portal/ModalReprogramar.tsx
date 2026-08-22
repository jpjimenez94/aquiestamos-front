'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock, X, Clock } from 'lucide-react'

type Hueco = {
  inicio: string
  fin: string
  inicioLocal: string
  finLocal: string
  modalidad: string
}

type ModalReprogramarProps = {
  citaId: string
  profesionalId: string
  profesionalNombre: string
  pacienteNombre: string
  modalidadActual: string
  abierto: boolean
  onCerrar: () => void
}

export function ModalReprogramar({
  citaId,
  profesionalId,
  profesionalNombre,
  pacienteNombre,
  modalidadActual,
  abierto,
  onCerrar,
}: ModalReprogramarProps) {
  const router = useRouter()
  const [huecos, setHuecos] = useState<Hueco[]>([])
  const [cargandoHuecos, setCargandoHuecos] = useState(false)
  const [huecoSeleccionado, setHuecoSeleccionado] = useState<string | null>(null)
  const [modalidad, setModalidad] = useState(modalidadActual || 'VIRTUAL')
  const [fechaManual, setFechaManual] = useState('')
  const [horaInicioManual, setHoraInicioManual] = useState('')
  const [horaFinManual, setHoraFinManual] = useState('')
  const [usarManual, setUsarManual] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null)

  useEffect(() => {
    if (!abierto || !profesionalId) return

    async function cargarHuecos() {
      setCargandoHuecos(true)
      try {
        const res = await fetch(`/api/portal/appointments/huecos?professionalId=${profesionalId}`)
        const data = await res.json()
        if (res.ok && data.success && Array.isArray(data.data)) {
          setHuecos(data.data)
        }
      } catch {
        // En caso de error, el agendador puede usar selección manual
      } finally {
        setCargandoHuecos(false)
      }
    }

    cargarHuecos()
  }, [abierto, profesionalId])

  if (!abierto) return null

  async function ejecutarReprogramacion() {
    setGuardando(true)
    setMensaje(null)

    let inicioISO = ''
    let finISO = ''

    if (usarManual) {
      if (!fechaManual || !horaInicioManual || !horaFinManual) {
        setMensaje({ tipo: 'error', texto: 'Por favor completa la fecha y las horas de inicio y fin.' })
        setGuardando(false)
        return
      }
      inicioISO = new Date(`${fechaManual}T${horaInicioManual}:00-05:00`).toISOString()
      finISO = new Date(`${fechaManual}T${horaFinManual}:00-05:00`).toISOString()
    } else {
      if (!huecoSeleccionado) {
        setMensaje({ tipo: 'error', texto: 'Por favor selecciona un horario disponible.' })
        setGuardando(false)
        return
      }
      const [ini, fi] = huecoSeleccionado.split('|')
      inicioISO = ini
      finISO = fi
    }

    try {
      const res = await fetch(`/api/portal/appointments/${citaId}/reprogramar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inicio: inicioISO,
          fin: finISO,
          modalidad,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setMensaje({ tipo: 'exito', texto: 'Cita reprogramada exitosamente.' })
        setTimeout(() => {
          onCerrar()
          if (data.data?.id) {
            router.push(`/portal/agenda/${data.data.id}`)
          } else {
            router.refresh()
          }
        }, 1000)
      } else {
        setMensaje({ tipo: 'error', texto: data.message || 'No se pudo reprogramar la cita' })
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de conexión con el servidor.' })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal-telon">
      <div className="modal-caja" style={{ maxWidth: 540 }}>
        <div className="modal-cabecera">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarClock size={22} style={{ color: 'var(--color-principal, #0e7490)' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Reprogramar Cita</h3>
          </div>
          <button className="boton-icono" onClick={onCerrar} type="button" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <p className="panel__nota" style={{ marginTop: 4, marginBottom: 16 }}>
          Mover cita de <strong>{pacienteNombre}</strong> con el psicólogo <strong>{profesionalNombre}</strong>. La cita anterior quedará enlazada en el historial.
        </p>

        {mensaje && (
          <div className="aviso-portal" data-tono={mensaje.tipo === 'exito' ? 'verde' : 'rojo'} style={{ marginBottom: 14 }}>
            {mensaje.texto}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="field__label">Modalidad</label>
            <select
              className="input"
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value)}
            >
              <option value="VIRTUAL">Virtual</option>
              <option value="PRESENCIAL">Presencial</option>
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="field__label" style={{ marginBottom: 0 }}>
                {usarManual ? 'Horario Manual' : 'Huecos Disponibles del Psicólogo'}
              </label>
              <button
                type="button"
                className="boton-mini"
                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                onClick={() => setUsarManual(!usarManual)}
              >
                {usarManual ? 'Ver huecos automáticos' : 'Ingresar hora manual'}
              </button>
            </div>

            {!usarManual ? (
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--color-borde, #e2e8f0)', borderRadius: 8, padding: 8 }}>
                {cargandoHuecos ? (
                  <p className="tabla__secundario" style={{ textAlign: 'center', padding: 12 }}>
                    Consultando disponibilidad…
                  </p>
                ) : huecos.length === 0 ? (
                  <p className="tabla__secundario" style={{ textAlign: 'center', padding: 12 }}>
                    No hay franjas libres automáticas en los próximos 14 días. Usa la opción de ingreso manual.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {huecos.map((h, i) => {
                      const valor = `${h.inicio}|${h.fin}`
                      const seleccionado = huecoSeleccionado === valor
                      return (
                        <div
                          key={i}
                          onClick={() => setHuecoSeleccionado(valor)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            background: seleccionado ? 'var(--color-principal-suave, #e0f2fe)' : 'transparent',
                            border: seleccionado ? '1px solid var(--color-principal, #0284c7)' : '1px solid transparent',
                          }}
                        >
                          <Clock size={15} style={{ color: seleccionado ? 'var(--color-principal, #0284c7)' : 'inherit' }} />
                          <span style={{ fontSize: '0.88rem', fontWeight: seleccionado ? 600 : 400 }}>
                            {h.inicioLocal} – {h.finLocal}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label className="tabla__secundario" style={{ fontSize: '0.78rem' }}>Fecha</label>
                  <input
                    type="date"
                    className="input"
                    value={fechaManual}
                    onChange={(e) => setFechaManual(e.target.value)}
                  />
                </div>
                <div>
                  <label className="tabla__secundario" style={{ fontSize: '0.78rem' }}>Hora Inicio</label>
                  <input
                    type="time"
                    className="input"
                    value={horaInicioManual}
                    onChange={(e) => setHoraInicioManual(e.target.value)}
                  />
                </div>
                <div>
                  <label className="tabla__secundario" style={{ fontSize: '0.78rem' }}>Hora Fin</label>
                  <input
                    type="time"
                    className="input"
                    value={horaFinManual}
                    onChange={(e) => setHoraFinManual(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="button-row" style={{ marginTop: 24, justifyContent: 'flex-end' }}>
          <button className="boton-mini" onClick={onCerrar} type="button">
            Cancelar
          </button>
          <button
            className="boton-mini"
            data-tono="principal"
            onClick={ejecutarReprogramacion}
            disabled={guardando}
            type="button"
          >
            {guardando ? 'Reprogramando…' : 'Confirmar Reprogramación'}
          </button>
        </div>
      </div>
    </div>
  )
}
