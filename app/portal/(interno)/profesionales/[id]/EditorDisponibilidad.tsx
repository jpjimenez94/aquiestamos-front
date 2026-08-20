'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Franja = {
  id?: string
  dia: string
  desdeMinuto: number
  hastaMinuto: number
  modalidad: string
}

const DIAS = [
  { valor: 'LUNES', texto: 'Lunes' },
  { valor: 'MARTES', texto: 'Martes' },
  { valor: 'MIERCOLES', texto: 'Miércoles' },
  { valor: 'JUEVES', texto: 'Jueves' },
  { valor: 'VIERNES', texto: 'Viernes' },
  { valor: 'SABADO', texto: 'Sábado' },
  { valor: 'DOMINGO', texto: 'Domingo' },
]

function aHora(minutos: number) {
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`
}

function aMinutos(hora: string) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

/**
 * Franjas recurrentes del profesional. Se guardan de golpe: es más fácil de
 * entender que editar una por una, y el backend las reemplaza en una
 * transacción.
 */
export function EditorDisponibilidad({
  profesionalId,
  franjasIniciales,
  puedeEditar,
}: {
  profesionalId: string
  franjasIniciales: Franja[]
  puedeEditar: boolean
}) {
  const router = useRouter()
  const [franjas, setFranjas] = useState<Franja[]>(franjasIniciales)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tono: string; texto: string } | null>(null)

  function agregar() {
    setFranjas((f) => [
      ...f,
      { dia: 'LUNES', desdeMinuto: 14 * 60, hastaMinuto: 18 * 60, modalidad: 'AMBAS' },
    ])
  }

  function cambiar(indice: number, cambios: Partial<Franja>) {
    setFranjas((f) => f.map((franja, i) => (i === indice ? { ...franja, ...cambios } : franja)))
  }

  function quitar(indice: number) {
    setFranjas((f) => f.filter((_, i) => i !== indice))
  }

  async function guardar() {
    setGuardando(true)
    setAviso(null)
    try {
      const respuesta = await fetch(`/api/portal/professionals/${profesionalId}/disponibilidad`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          franjas: franjas.map((f) => ({
            weekday: f.dia,
            startMinute: f.desdeMinuto,
            endMinute: f.hastaMinuto,
            modality: f.modalidad,
          })),
        }),
      })
      const datos = await respuesta.json()

      if (!respuesta.ok || !datos.success) {
        const detalle = datos.details
          ? Object.values(datos.details).filter((v) => typeof v === 'string').join('. ')
          : ''
        setAviso({ tono: 'rojo', texto: `${datos.message ?? 'No se pudo guardar'}${detalle ? ` — ${detalle}` : ''}` })
        return
      }

      setAviso({ tono: 'verde', texto: 'Disponibilidad actualizada.' })
      router.refresh()
    } catch {
      setAviso({ tono: 'rojo', texto: 'No pudimos conectarnos con el servidor' })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="panel">
      <h2>Disponibilidad</h2>
      <p className="panel__nota">
        Franjas recurrentes en hora de Bogotá. Cada una debe durar al menos 45 minutos, que es lo
        que dura una sesión.
      </p>

      {aviso ? (
        <div className="aviso-portal" data-tono={aviso.tono}>
          {aviso.texto}
        </div>
      ) : null}

      {franjas.length === 0 ? (
        <p className="vacio">Sin franjas cargadas. Sin ellas no se le puede agendar nada.</p>
      ) : (
        <div className="tabla-envoltorio" style={{ marginBottom: 16 }}>
          <table className="tabla">
            <thead>
              <tr>
                <th>Día</th>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Modalidad</th>
                {puedeEditar ? <th /> : null}
              </tr>
            </thead>
            <tbody>
              {franjas.map((f, i) => (
                <tr key={i}>
                  <td>
                    {puedeEditar ? (
                      <select
                        className="input"
                        style={{ padding: '6px 8px' }}
                        value={f.dia}
                        onChange={(e) => cambiar(i, { dia: e.target.value })}
                      >
                        {DIAS.map((d) => (
                          <option key={d.valor} value={d.valor}>
                            {d.texto}
                          </option>
                        ))}
                      </select>
                    ) : (
                      DIAS.find((d) => d.valor === f.dia)?.texto
                    )}
                  </td>
                  <td>
                    {puedeEditar ? (
                      <input
                        className="input"
                        style={{ padding: '6px 8px', width: 110 }}
                        type="time"
                        value={aHora(f.desdeMinuto)}
                        onChange={(e) => cambiar(i, { desdeMinuto: aMinutos(e.target.value) })}
                      />
                    ) : (
                      aHora(f.desdeMinuto)
                    )}
                  </td>
                  <td>
                    {puedeEditar ? (
                      <input
                        className="input"
                        style={{ padding: '6px 8px', width: 110 }}
                        type="time"
                        value={aHora(f.hastaMinuto)}
                        onChange={(e) => cambiar(i, { hastaMinuto: aMinutos(e.target.value) })}
                      />
                    ) : (
                      aHora(f.hastaMinuto)
                    )}
                  </td>
                  <td>{f.modalidad.toLowerCase()}</td>
                  {puedeEditar ? (
                    <td className="tabla__acciones">
                      <button className="boton-mini" data-tono="peligro" onClick={() => quitar(i)}>
                        Quitar
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {puedeEditar ? (
        <div className="button-row">
          <button className="boton-mini" onClick={agregar}>
            Agregar franja
          </button>
          <button className="boton-mini" data-tono="principal" onClick={guardar} disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar disponibilidad'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
