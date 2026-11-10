'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/**
 * Copia un dato tal cual —un número de cuenta, por ejemplo— para no tener que
 * dictárselo al teléfono cifra a cifra. Los textos llegan en el idioma de la
 * página.
 */
export function CopiarDato({ texto, etiqueta, hecho }: { texto: string; etiqueta: string; hecho: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Sin permiso para el portapapeles: el dato sigue a la vista para copiarlo a mano.
    }
  }

  return (
    <Button variant="default" type="button" onClick={copiar} icon={copiado ? <Check size={16} /> : <Copy size={16} />}>
      {copiado ? hecho : etiqueta}
    </Button>
  )
}
