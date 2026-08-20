'use client'

import { useState, useEffect } from 'react'
import { Link2, Check } from 'lucide-react'
import { Button } from './Button'

export function BotonCopiarEnlace({ ruta, etiqueta = 'Copiar enlace' }: { ruta: string, etiqueta?: string }) {
  const [copiado, setCopiado] = useState(false)
  
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])

  function copiar() {
    const texto = `${window.location.origin}${ruta}`
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (!montado) return null

  return (
    <Button variant="default" type="button" onClick={copiar} icon={copiado ? <Check size={16} /> : <Link2 size={16} />}>
      {copiado ? '¡Copiado!' : etiqueta}
    </Button>
  )
}
