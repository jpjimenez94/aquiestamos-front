'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle } from 'lucide-react'

/**
 * Cerrar una sesión grupal: se hizo —y quién estuvo— o se canceló.
 *
 * Marcar quién asistió es parte de marcarla realizada, no un paso aparte que
 * alguien tenga que recordar después: es la única forma de saber, con el
 * tiempo, si el espacio le sirve a quien lo pide.
 */
export function AccionesSesion({
  sesionId,
  invitados,
}: {
  sesionId: string
  invitados: { id: string; nombre: string }[]
}) {
  const router = useRouter()
  const [cerrando, setCerrando] = useState(false)
  const [asistieron, setAsistieron] = useState<Set<string>>(() => new Set(invitados.map((i) => i.id)))
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function patch(ruta: string, body: unknown) {
    const r = await fetch(`/api/portal/cuidado/sesiones/${sesionId}/${ruta}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const d = await r.json()
    if (!r.ok || !d.success) throw new Error(d.message ?? 'No se pudo guardar.')
  }

  async function marcarRealizada() {
    setError(null)
    setOcupado(true)
    try {
      await patch('asistencia', { asistieron: [...asistieron] })
      await patch('estado', { estado: 'REALIZADA' })
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.')
    } finally {
      setOcupado(false)
    }
  }

  async function cancelar() {
    if (!window.confirm('¿Cancelar esta sesión? A los invitados no se les avisa solo: escríbeles.')) return
    setError(null)
    setOcupado(true)
    try {
      await patch('estado', { estado: 'CANCELADA' })
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cancelar.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #e4dfd3' }}>
      {!cerrando ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="boton-mini" data-tono="principal" onClick={() => setCerrando(true)} disabled={ocupado}>
            <CheckCircle2 size={14} />
            Se hizo: marcar realizada
          </button>
          <button type="button" className="boton-mini" onClick={cancelar} disabled={ocupado}>
            <XCircle size={14} />
            Cancelar sesión
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>¿Quién estuvo?</span>
          {invitados.map((i) => (
            <label key={i.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={asistieron.has(i.id)}
                onChange={() =>
                  setAsistieron((prev) => {
                    const s = new Set(prev)
                    if (s.has(i.id)) s.delete(i.id)
                    else s.add(i.id)
                    return s
                  })
                }
              />
              {i.nombre}
            </label>
          ))}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="boton-mini" data-tono="principal" onClick={marcarRealizada} disabled={ocupado}>
              {ocupado ? 'Guardando…' : 'Guardar y marcar realizada'}
            </button>
            <button type="button" className="boton-mini" onClick={() => setCerrando(false)} disabled={ocupado}>
              Volver
            </button>
          </div>
        </div>
      )}
      {error ? (
        <p className="tamizaje__error" role="alert" style={{ marginTop: 8 }}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
