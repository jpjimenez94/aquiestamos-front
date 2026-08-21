'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Inbox,
  UserPlus,
  HeartHandshake,
  Users,
  Stethoscope,
  CalendarDays,
  CalendarCheck,
  Shield,
  ScrollText,
  LogOut,
} from 'lucide-react'
import type { Usuario } from '@/lib/portal'

type Enlace = {
  href: string
  texto: string
  icono: React.ReactNode
  permiso: string
  /** Si se indica, el enlace solo aparece para estos roles. */
  soloRoles?: Usuario['role'][]
}

const GRUPOS: { titulo: string; enlaces: Enlace[] }[] = [
  {
    titulo: 'Operación',
    enlaces: [
      { href: '/portal', texto: 'Tablero', icono: <LayoutDashboard size={17} />, permiso: 'agenda:leer' },
      { href: '/portal/solicitudes', texto: 'Solicitudes', icono: <Inbox size={17} />, permiso: 'solicitud:leer' },
      { href: '/portal/postulaciones', texto: 'Postulaciones', icono: <UserPlus size={17} />, permiso: 'postulacion:leer' },
      {
        href: '/portal/colaboradores',
        texto: 'Voluntariado de apoyo',
        icono: <HeartHandshake size={17} />,
        permiso: 'colaborador:leer',
      },
    ],
  },
  {
    titulo: 'Personas',
    enlaces: [
      { href: '/portal/personas', texto: 'Acompañadas', icono: <Users size={17} />, permiso: 'paciente:leer' },
      { href: '/portal/profesionales', texto: 'Profesionales', icono: <Stethoscope size={17} />, permiso: 'profesional:leer' },
    ],
  },
  {
    titulo: 'Agenda',
    enlaces: [
      { href: '/portal/agenda', texto: 'Agenda de la red', icono: <CalendarDays size={17} />, permiso: 'agenda:leer' },
      {
        href: '/portal/mi-agenda',
        texto: 'Mi agenda',
        icono: <CalendarCheck size={17} />,
        permiso: 'agenda:leer:propia',
        // El administrador tiene el permiso, pero no tiene ficha de profesional:
        // el enlace solo le llevaria a un aviso de que no esta enlazado.
        soloRoles: ['PROFESIONAL'],
      },
    ],
  },
  {
    titulo: 'Administración',
    enlaces: [
      { href: '/portal/usuarios', texto: 'Cuentas', icono: <Shield size={17} />, permiso: 'usuario:leer' },
      { href: '/portal/auditoria', texto: 'Auditoría', icono: <ScrollText size={17} />, permiso: 'auditoria:leer' },
    ],
  },
]

function puede(usuario: Usuario, permiso: string) {
  return usuario.permisos.includes('*') || usuario.permisos.includes(permiso)
}

const NOMBRE_ROL: Record<string, string> = {
  ADMIN: 'Administración',
  AGENDADOR: 'Agenda',
  PROFESIONAL: 'Profesional',
}

export function LateralPortal({ usuario }: { usuario: Usuario }) {
  const ruta = usePathname()
  const router = useRouter()

  async function salir() {
    await fetch('/api/portal/logout', { method: 'POST' })
    router.push('/portal/entrar')
    router.refresh()
  }

  return (
    <aside className="portal__lateral">
      <div className="portal__marca">Aquí Estamos</div>

      <nav className="portal__nav">
        {GRUPOS.map((grupo) => {
          const visibles = grupo.enlaces.filter(
            (e) => puede(usuario, e.permiso) && (!e.soloRoles || e.soloRoles.includes(usuario.role)),
          )
          if (visibles.length === 0) return null

          return (
            <div key={grupo.titulo}>
              <p className="portal__grupo">{grupo.titulo}</p>
              {visibles.map((enlace) => (
                <Link
                  key={enlace.href}
                  className="portal__enlace"
                  href={enlace.href}
                  data-activo={
                    enlace.href === '/portal' ? ruta === '/portal' : ruta.startsWith(enlace.href)
                  }
                >
                  {enlace.icono}
                  {enlace.texto}
                </Link>
              ))}
            </div>
          )
        })}
      </nav>

      <div className="portal__pie">
        <div className="portal__quien">
          <strong>{usuario.name}</strong>
          <span className="portal__rol">{NOMBRE_ROL[usuario.role] ?? usuario.role}</span>
        </div>
        <button className="portal__salir" type="button" onClick={salir}>
          <LogOut size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
          Salir
        </button>
      </div>
    </aside>
  )
}
