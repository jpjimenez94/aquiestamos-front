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
  BookOpen,
  BarChart3,
  BadgeCheck,
  MapPin,
  ListTodo,
  Key,
} from "lucide-react";
import type { Usuario } from "@/lib/portal";
import { nombrePropio } from "@/lib/nombre";
import { ModalCambiarMiClave } from "@/components/portal/ModalCambiarMiClave";

export type ContadoresBadges = {
  solicitudes?: number;
  postulaciones?: number;
  colaboradores?: number;
  verificaciones?: number;
  agenda?: number;
  miAgenda?: number;
  tareas?: number;
};

type Enlace = {
  href: string;
  texto: string;
  icono: React.ReactNode;
  permiso?: string;
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
        badgeKey: "tareas",
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
        badgeKey: "agenda",
      },
      {
        href: "/portal/mi-agenda",
        texto: "Mi agenda",
        icono: <CalendarCheck size={17} />,
        permiso: "agenda:leer:propia",
        soloRoles: ["PROFESIONAL"],
        badgeKey: "miAgenda",
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
  const [modalClaveAbierto, setModalClaveAbierto] = useState(false);
  const [contadores, setContadores] =
    useState<ContadoresBadges>(contadoresIniciales);
  const ultimoSonidoRef = useRef<number>(0);
  const contadoresAnterioresRef =
    useRef<ContadoresBadges>(contadoresIniciales);

  useEffect(() => {
    setContadores(contadoresIniciales);
    contadoresAnterioresRef.current = contadoresIniciales;
  }, [contadoresIniciales]);

  useEffect(() => {
    let cancelado = false;

    async function actualizarBadges() {
      try {
        const respuesta = await fetch("/api/portal/dashboard/badges", {
          cache: "no-store",
        });
        if (!respuesta.ok) return;
        const cuerpo = await respuesta.json();
        if (cancelado || !cuerpo?.success || !cuerpo?.data) return;

        const nuevos: ContadoresBadges = cuerpo.data;
        const anteriores = contadoresAnterioresRef.current;

        const hayNuevos =
          (nuevos.solicitudes ?? 0) > (anteriores.solicitudes ?? 0) ||
          (nuevos.postulaciones ?? 0) > (anteriores.postulaciones ?? 0) ||
          (nuevos.colaboradores ?? 0) > (anteriores.colaboradores ?? 0) ||
          (nuevos.verificaciones ?? 0) > (anteriores.verificaciones ?? 0) ||
          (nuevos.agenda ?? 0) > (anteriores.agenda ?? 0) ||
          (nuevos.miAgenda ?? 0) > (anteriores.miAgenda ?? 0) ||
          (nuevos.tareas ?? 0) > (anteriores.tareas ?? 0);

        if (hayNuevos) {
          const ahora = Date.now();
          if (ahora - ultimoSonidoRef.current > 10000) {
            ultimoSonidoRef.current = ahora;
            try {
              const audio = new Audio("/alerta.mp3");
              audio.volume = 0.4;
              audio.play().catch(() => {});
            } catch {}
          }
        }

        contadoresAnterioresRef.current = nuevos;
        setContadores(nuevos);
      } catch {}
    }

    const intervalo = setInterval(actualizarBadges, 20000);
    return () => {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, []);

  async function salir() {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal/entrar");
    router.refresh();
  }

  return (
    <aside id="portal-menu" className="portal__lateral">
      <div className="portal__marca portal__marca--lateral">Aquí Estamos</div>

      <nav className="portal__nav">
        {GRUPOS.map((grupo) => {
          const visibles = grupo.enlaces.filter((e) => {
            const tienePermiso = !e.permiso || puede(usuario, e.permiso);
            const listaRoles =
              Array.isArray((usuario as any).roles) &&
              (usuario as any).roles.length > 0
                ? (usuario as any).roles
                : [usuario.role];
            const rolPermitido =
              !e.soloRoles || e.soloRoles.some((r: any) => listaRoles.includes(r));
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
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
          <button
            className="portal__salir"
            type="button"
            onClick={() => setModalClaveAbierto(true)}
            title="Cambiar mi contraseña personal"
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              padding: "7px 6px",
              fontSize: "0.82rem",
              fontWeight: 600,
            }}
          >
            <Key size={13} />
            Clave
          </button>
          <button
            className="portal__salir"
            type="button"
            onClick={salir}
            title="Cerrar sesión"
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              padding: "7px 6px",
              fontSize: "0.82rem",
              fontWeight: 600,
            }}
          >
            <LogOut size={13} />
            Salir
          </button>
        </div>
      </div>

      <ModalCambiarMiClave
        abierto={modalClaveAbierto}
        alCerrar={() => setModalClaveAbierto(false)}
      />
    </aside>
  );
}
