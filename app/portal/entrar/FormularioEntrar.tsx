'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/forms/fields'
import { FormStatus, type Status } from '@/components/forms/FormStatus'

export function FormularioEntrar({ volver }: { volver?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault()
    setStatus(null)

    if (!email.trim() || !password) {
      setStatus({ type: 'error', message: 'Escribe tu correo y tu clave.' })
      return
    }

    setEnviando(true)
    try {
      const respuesta = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const datos = await respuesta.json()

      if (!respuesta.ok || !datos.success) {
        setStatus({ type: 'error', message: datos.message ?? 'No pudimos iniciar sesión.' })
        return
      }

      router.push(volver && volver.startsWith('/portal') ? volver : '/portal')
      router.refresh()
    } catch {
      setStatus({ type: 'error', message: 'No pudimos conectarnos con el servidor.' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} noValidate>
      <div className="entrar__campos">
        <TextField
          label="Correo"
          name="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={setEmail}
        />
        <TextField
          label="Clave"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />
        <FormStatus status={status} />
        <Button type="submit" variant="primary" disabled={enviando} icon={<LogIn size={16} />}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </Button>
      </div>
    </form>
  )
}
