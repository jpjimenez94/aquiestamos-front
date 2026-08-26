"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  Menu,
  X,
  BookOpen,
  BarChart3,
  BadgeCheck,
  MapPin,
  ListTodo,
} from "lucide-react";
import type { Usuario } from "@/lib/portal";
import { nombrePropio } from "@/lib/nombre";
import { ModalCambiarMiClave } from "@/components/portal/ModalCambiarMiClave";
import { Key } from "lucide-react";

export type ContadoresBadges = {
  solicitudes?: number;
  postulaciones?: number;
  colaboradores?: number;
  verificaciones?: number;
};

type Enlace = {
  href: string;
  texto: string;
  icono: React.ReactNode;
  /** Sin permiso, el enlace es para todo el que tenga sesión. */
  permiso?: string;
  /** Si se indica, el enlace solo aparece para estos roles. */
  soloRoles?: Usuario["role"][];
  badgeKey?: keyof ContadoresBadges;
};

const GRUPOS: { titulo: string; enlaces: Enlace[] }[] = [
  {
    titulo: "Operación",
    enlaces: [
      {
        href: "/portal",
        texto: "Tablero",
        icono: <LayoutDashboard size={17} />,
        permiso: "agenda:leer",
        soloRoles: ["ADMIN", "AGENDADOR", "LECTURA"],
      },
      {
        href: "/portal/solicitudes",
        texto: "Solicitudes",
        icono: <Inbox size={17} />,
        permiso: "solicitud:leer",
        badgeKey: "solicitudes",
      },
      {
        href: "/portal/postulaciones",
        texto: "Postulaciones",
        icono: <UserPlus size={17} />,
        permiso: "postulacion:leer",
        badgeKey: "postulaciones",
      },
      {
        href: "/portal/colaboradores",
        texto: "Voluntariado de apoyo",
        icono: <HeartHandshake size={17} />,
        permiso: "colaborador:leer",
        badgeKey: "colaboradores",
      },
      {
        href: "/portal/tareas",
        texto: "Tareas de apoyo",
        icono: <ListTodo size={17} />,
        permiso: "tarea:leer",
      },
      {
        href: "/portal/verificaciones",
        texto: "Verificaciones",
        icono: <BadgeCheck size={17} />,
        permiso: "profesional:verificar-tarjeta",
        badgeKey: "verificaciones",
      },
    ],
  },
  {
    titulo: "Personas",
    enlaces: [
      {
        href: "/portal/personas",
        texto: "Acompañadas",
        icono: <Users size={17} />,
        permiso: "paciente:leer",
      },
      {
        href: "/portal/profesionales",
        texto: "Profesionales",
        icono: <Stethoscope size={17} />,
        permiso: "profesional:leer",
        soloRoles: ["ADMIN", "AGENDADOR", "LECTURA"],
      },
    ],
  },
  {
    titulo: "Agenda",
    enlaces: [
      {
        href: "/portal/agenda",
        texto: "Agenda de la red",
        icono: <CalendarDays size={17} />,
        permiso: "agenda:leer",
      },
      {
        href: "/portal/mi-agenda",
        texto: "Mi agenda",
        icono: <CalendarCheck size={17} />,
        permiso: "agenda:leer:propia",
        // El administrador tiene el permiso, pero no tiene ficha de profesional:
        // el enlace solo le llevaria a un aviso de que no esta enlazado.
        soloRoles: ["PROFESIONAL"],
      },
    ],
  },
  {
    titulo: "Administración",
    enlaces: [
      {
        href: "/portal/usuarios",
        texto: "Cuentas",
        icono: <Shield size={17} />,
        permiso: "usuario:leer",
      },
      {
        href: "/portal/auditoria",
        texto: "Auditoría",
        icono: <ScrollText size={17} />,
        permiso: "auditoria:leer",
      },
      {
        // Solo ADMIN y LECTURA: el permiso lo decide, y AGENDADOR no lo tiene.
        href: "/portal/metricas",
        texto: "Métricas",
        icono: <BarChart3 size={17} />,
        permiso: "metricas:leer",
      },
    ],
  },
  {
    titulo: "Comunidad",
    enlaces: [
      {
        href: "/portal/lideres",
        texto: "Líderes Comunitarios",
        icono: <MapPin size={17} />,
        permiso: "lideres:leer",
        soloRoles: ["ADMIN", "LIDERES_COMUNITARIOS"],
      },
    ],
  },
  {
    titulo: "Guía",
    enlaces: [
      {
        // Sin permiso a propósito: la guía de procesos es para todo el que
        // tenga sesión, incluido quien solo lee y el profesional.
        href: "/portal/procesos",
        texto: "Cómo funciona la red",
        icono: <BookOpen size={17} />,
      },
    ],
  },
];

function puede(usuario: Usuario, permiso: string) {
  return usuario.permisos.includes("*") || usuario.permisos.includes(permiso);
}

const NOMBRE_ROL: Record<string, string> = {
  ADMIN: "Administración",
  LIDERES_COMUNITARIOS: "Líderes Comunitarios",
  AGENDADOR: "Voluntario Digital (General)",
  ADMISION: "Admisión y Verificaciones",
  COORDINADOR_CASOS: "Gestión de Casos y Agenda",
  PROFESIONAL: "Profesional",
  LECTURA: "Solo lectura",
};

export function LateralPortal({
  usuario,
  contadores: contadoresIniciales = {},
}: {
  usuario: Usuario;
  contadores?: ContadoresBadges;
}) {
  const ruta = usePathname();
  const router = useRouter();

  const [contadores, setContadores] = useState<ContadoresBadges>(contadoresIniciales);

  useEffect(() => {
    setContadores(contadoresIniciales);
  }, [contadoresIniciales]);

  // Actualizar periódicamente los contadores en segundo plano
  useEffect(() => {
    let activo = true;
    async function refrescarBadges() {
      try {
        const res = await fetch("/api/portal/dashboard/badges");
        if (!res.ok) return;
        const r = await res.json();
        if (activo && r.success && r.data) {
          setContadores(r.data);
        }
      } catch {
        // Silencioso
      }
    }

    refrescarBadges();
    const intervalo = setInterval(refrescarBadges, 30000);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [ruta]);

  // En móvil el menú es un panel que se abre. En escritorio siempre está a la
  // vista y este estado no hace nada: lo decide el CSS, no el JavaScript.
  const [abierto, setAbierto] = useState(false);
  const [modalClaveAbierto, setModalClaveAbierto] = useState(false);
  const botonRef = useRef<HTMLButtonElement>(null);

  // Navegar cierra el menú. Sin esto, al tocar un enlace la página cambia
  // detrás del panel y parece que no pasó nada.
  useEffect(() => {
    setAbierto(false);
  }, [ruta]);

  // Escape cierra, y el foco vuelve al botón que lo abrió: quien navega con
  // teclado no debe quedar perdido al final del documento.
  useEffect(() => {
    if (!abierto) return;

    function alPulsar(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAbierto(false);
        botonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", alPulsar);
    // Con el panel abierto, el fondo no debe poder desplazarse.
    document.body.classList.add("sin-desplazamiento");

    return () => {
      document.removeEventListener("keydown", alPulsar);
      document.body.classList.remove("sin-desplazamiento");
    };
  }, [abierto]);

  async function salir() {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal/entrar");
    router.refresh();
  }

  return (
    <>
      {/* Barra superior. Solo se ve en móvil; en escritorio el menú ya está. */}
      <header className="portal__barra">
        <span className="portal__marca">Aquí Estamos</span>
        <button
          ref={botonRef}
          className="portal__hamburguesa"
          type="button"
          aria-expanded={abierto}
          aria-controls="portal-menu"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setAbierto((v) => !v)}
        >
          {abierto ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Telón: tocar fuera cierra. Es lo que la gente intenta primero. */}
      <div
        className="portal__telon"
        data-visible={abierto}
        onClick={() => setAbierto(false)}
        aria-hidden="true"
      />

      <aside
        id="portal-menu"
        className="portal__lateral"
        data-abierto={abierto}
      >
        <div className="portal__marca portal__marca--lateral">Aquí Estamos</div>

        <nav className="portal__nav">
          {GRUPOS.map((grupo) => {
            const visibles = grupo.enlaces.filter((e) => {
              const tienePermiso = !e.permiso || puede(usuario, e.permiso);
              const listaRoles = Array.isArray((usuario as any).roles) && (usuario as any).roles.length > 0
                ? (usuario as any).roles
                : [usuario.role];
              const rolPermitido = !e.soloRoles || e.soloRoles.some((r: any) => listaRoles.includes(r));
              return tienePermiso && rolPermitido;
            });
            if (visibles.length === 0) return null;

            return (
              <div key={grupo.titulo}>
                <p className="portal__grupo">{grupo.titulo}</p>
                {visibles.map((enlace) => {
                  const cuenta = enlace.badgeKey
                    ? (contadores[enlace.badgeKey] ?? 0)
                    : 0;

                  return (
                    <Link
                      key={enlace.href}
                      className="portal__enlace"
                      href={enlace.href}
                      data-activo={
                        enlace.href === "/portal"
                          ? ruta === "/portal"
                          : ruta.startsWith(enlace.href)
                      }
                    >
                      {enlace.icono}
                      <span>{enlace.texto}</span>
                      {cuenta > 0 ? (
                        <span
                          className="portal__enlace-punto"
                          title={`${cuenta} ${cuenta === 1 ? "pendiente / nuevo" : "pendientes / nuevos"}`}
                        >
                          <span className="portal__punto-luz" />
                          <span>{cuenta}</span>
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="portal__pie">
          <div className="portal__quien">
            <strong>{nombrePropio(usuario.name)}</strong>
            <span className="portal__rol">
              {NOMBRE_ROL[usuario.role] ?? usuario.role}
            </span>
          </div>
          <button className="portal__salir" type="button" onClick={salir}>
            <LogOut
              size={14}
              style={{ verticalAlign: "-2px", marginRight: 6 }}
            />
            Salir
          </button>
        </div>
      </aside>
    </>
  );
}
