'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Menu, X } from 'lucide-react'
import { navLinks, site } from '@/lib/site'

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Cierra el menú al navegar a otra página.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link className="navbar__logo" href="/" aria-label={`${site.name} — inicio`}>
          <Image
            src="/images/logo.png"
            alt={site.name}
            width={179}
            height={69}
            priority
          />
        </Link>

        <nav aria-label="Navegación principal">
          <ul className="navbar__links">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  className="navbar__link"
                  href={link.href}
                  data-active={pathname === link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="navbar__toggle" type="button" aria-label="Abrir menú">
              <Menu size={26} />
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="navbar__overlay" />
            <Dialog.Content className="navbar__sheet">
              <VisuallyHidden asChild>
                <Dialog.Title>Menú de navegación</Dialog.Title>
              </VisuallyHidden>

              <div className="navbar__sheet-header">
                <Dialog.Close asChild>
                  <button className="navbar__toggle" type="button" aria-label="Cerrar menú">
                    <X size={26} />
                  </button>
                </Dialog.Close>
              </div>

              <nav aria-label="Navegación móvil">
                {navLinks.map((link) => (
                  <Link key={link.href} className="navbar__sheet-link" href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  )
}
