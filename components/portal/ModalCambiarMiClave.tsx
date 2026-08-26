'use client'

import { useState } from 'react'
import { Key, X, Lock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function ModalCambiarMiClave({
  abierto,
  alCerrar,
}: {
  abierto: boolean
  alCerrar: () => void
}) {
  const [claveActual, setClaveActual] = useState('')
  const [claveNueva, setClaveNueva] = useState('')
  const [claveConfirmar, setClaveConfirmar] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [cargando, setCargando] = useState(false)

  if (!abierto) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setExito('')

    if (!claveActual) {
      setError('Debes ingresar tu contraseña actual.')
      return
    }
    if (!claveNueva || claveNueva.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (claveNueva !== claveConfirmar) {
      setError('La confirmación no coincide con la nueva contraseña.')
      return
    }
    if (claveActual === claveNueva) {
      setError('La nueva contraseña debe ser diferente de la actual.')
      return
    }

    setCargando(true)
    try {
      const res = await fetch('/api/portal/auth/cambiar-clave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actual: claveActual, nueva: claveNueva }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'No pudimos cambiar la contraseña. Verifica tu clave actual.')
        return
      }

      setExito('¡Contraseña actualizada con éxito! Redirigiendo al inicio de sesión…')
      setTimeout(() => {
        window.location.href = '/portal/entrar'
      }, 1500)
    } catch {
      setError('Error de conexión con el servidor. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
      onClick={alCerrar}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
            <Key size={18} style={{ color: '#059669' }} />
            Cambiar mi contraseña
          </div>
          <button
            type="button"
            onClick={alCerrar}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 16px', fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5 }}>
            Por seguridad, al cambiar tu contraseña se cerrarán las demás sesiones activas en otros dispositivos.
          </p>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', color: '#991b1b', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {exito && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 12px', color: '#166534', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{exito}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Contraseña actual
              </label>
              <input
                type="password"
                required
                value={claveActual}
                onChange={(e) => setClaveActual(e.target.value)}
                placeholder="Ingresa tu clave actual"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Nueva contraseña
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={claveNueva}
                onChange={(e) => setClaveNueva(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Confirmar nueva contraseña
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={claveConfirmar}
                onChange={(e) => setClaveConfirmar(e.target.value)}
                placeholder="Vuelve a escribir la nueva clave"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              onClick={alCerrar}
              style={{ background: '#f1f5f9', border: 'none', padding: '8px 14px', borderRadius: 8, color: '#475569', fontWeight: 600, fontSize: '0.86rem', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <Button
              type="submit"
              variant="primary"
              disabled={cargando || Boolean(exito)}
              icon={<Lock size={15} />}
            >
              {cargando ? 'Actualizando…' : 'Guardar nueva clave'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
