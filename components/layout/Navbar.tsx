'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Menu, X } from 'lucide-react'
import { ENLACES_NAV } from '@/lib/site'
import { ruta, type Idioma } from '@/lib/i18n/idiomas'
import type { Diccionario } from '@/lib/i18n/diccionarios/es'
import { SelectorIdioma } from '@/components/sitio/SelectorIdioma'

/**
 * La barra del sitio.
 *
 * Es un componente de cliente —abre y cierra el menú del teléfono—, así que no
 * lee el diccionario: recibe por props el trozo que necesita. Importarlo aquí
 * mandaría los tres idiomas enteros al navegador de cada visitante.
 */
export function Navbar({
  idioma,
  t,
  nombre,
  irAlInicio,
  etiquetaIdioma,
}: {
  idioma: Idioma
  t: Diccionario['nav']
  /** El nombre de la red, para el `alt` del logo. */
  nombre: string
  /** `aria-label` del logo, ya con el nombre puesto. */
  irAlInicio: string
  /** Cómo se llama el selector de idioma para un lector de pantalla. */
  etiquetaIdioma: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Cierra el menú al navegar a otra página.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const enlaces = ENLACES_NAV.map((enlace) => ({
    ...enlace,
    href: ruta(idioma, enlace.href),
    ...t.enlaces[enlace.id],
  }))

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link className="navbar__logo" href={ruta(idioma, '/')} aria-label={irAlInicio}>
          <Image src="/images/logo.png" alt={nombre} width={179} height={69} priority />
        </Link>

        <nav aria-label={t.principal}>
          <ul className="navbar__links">
            {enlaces.map((link) => (
              <li key={link.id}>
                <Link
                  className="navbar__link"
                  data-cta={link.cta || undefined}
                  href={link.href}
                  data-active={pathname === link.href}
                >
                  {link.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="navbar__toggle" type="button" aria-label={t.abrir}>
              <Menu size={26} />
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="navbar__overlay" />
            <Dialog.Content className="navbar__sheet">
              <VisuallyHidden asChild>
                <Dialog.Title>{t.tituloMenu}</Dialog.Title>
              </VisuallyHidden>

              <div className="navbar__sheet-header">
                <Dialog.Close asChild>
                  <button className="navbar__toggle" type="button" aria-label={t.cerrar}>
                    <X size={26} />
                  </button>
                </Dialog.Close>
              </div>

              <nav aria-label={t.movil}>
                {enlaces.map((link) => (
                  <Link
                    key={link.id}
                    className="navbar__sheet-link"
                    data-cta={link.cta || undefined}
                    href={link.href}
                  >
                    {link.etiqueta}
                    {link.aclaracion ? (
                      <span className="navbar__sheet-sub">{link.aclaracion}</span>
                    ) : null}
                  </Link>
                ))}
              </nav>

              {/*
                El idioma también aquí, al pie del menú.

                La franja de arriba se va al bajar por la página; el menú es lo
                único que el teléfono tiene siempre a mano. Quien abre el menú
                buscando «English» tiene que encontrarlo.
              */}
              <div className="navbar__sheet-idioma">
                <SelectorIdioma idioma={idioma} etiqueta={etiquetaIdioma} />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  )
}
