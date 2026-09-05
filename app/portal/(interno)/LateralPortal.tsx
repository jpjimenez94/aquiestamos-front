"use client";

import Image from "next/image";
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
  Key,
  SlidersHorizontal,
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
  /**
   * Acompañadas cuenta TAREAS pendientes, no personas.
   *
   * Las demás secciones marcan lo que está sin revisar, y esa idea no traduce
   * directo aquí: una persona no se revisa una vez, se acompaña durante
   * semanas. Un punto que contara cuántas hay marcaría nueve para siempre, y
   * en dos días nadie volvería a mirarlo.
   */
  personas?: number;
  /** Cuidado del equipo: quiénes pidieron el espacio y nadie ha convocado. */
  cuidado?: number;
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
      {
        href: "/portal/cuidado",
        texto: "Cuidado del equipo",
        icono: <HeartHandshake size={17} />,
        permiso: "cuidado:leer",
        badgeKey: "cuidado",
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
        badgeKey: "personas",
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
      {
        href: "/portal/parametrizacion",
        texto: "Parametrización",
        icono: <SlidersHorizontal size={17} />,
        permiso: "configuracion:leer",
        soloRoles: ["ADMIN", "LECTURA"],
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

/**
 * La marca, en la barra móvil y en el lateral.
 *
 * Llevaba el logo y, al lado, un `<span>` con «Aquí Estamos». Pero el archivo
 * no es un símbolo: es el lockup completo, nombre incluido. Así que la barra
 * decía «Aquí Estamos» dos veces, y para que cupieran las dos el logo quedaba
 * en 30px de alto — tan pequeño que el nombre dentro de la imagen no se leía,
 * y parecía cortado.
 *
 * El texto se va y el logo se queda con el ancho entero. El razonamiento de
 * antes —«un logo solo obliga a reconocerlo»— seguiría valiendo si el logo
 * fuera solo el símbolo; con el nombre dentro, ya no.
 *
 * Ahora el `alt` sí dice el nombre: era lo único que lo aportaba a quien usa
 * lector de pantalla, y estaba vacío justamente porque el texto lo repetía.
 */
function Marca() {
  return (
    <Image
      className="portal__logo"
      src="/images/logo.png"
      alt="Aquí Estamos"
      width={2000}
      height={729}
      priority
    />
  );
}

export function LateralPortal({
  usuario,
  contadores: contadoresIniciales = {},
}: {
  usuario: Usuario;
  contadores?: ContadoresBadges;
}) {
  const ruta = usePathname();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [modalClaveAbierto, setModalClaveAbierto] = useState(false);
  const [contadores, setContadores] =
    useState<ContadoresBadges>(contadoresIniciales);

  /**
   * Los grupos del menú se pliegan desde su título y se quedan como los
   * dejaste: seis grupos con veinte enlaces desplegados eran una columna que
   * había que recorrer con los ojos cada vez. Se recuerda en el navegador,
   * no en la cuenta: es una comodidad de esta pantalla, no un dato.
   *
   * El grupo donde estás nunca se pliega solo: si te lo escondieras, no
   * sabrías dónde estás.
   */
  const CLAVE_PLEGADOS = "portal:grupos-plegados";
  const [plegados, setPlegados] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CLAVE_PLEGADOS);
      if (guardado) setPlegados(new Set(JSON.parse(guardado) as string[]));
    } catch {
      /* sin almacenamiento, el menú arranca desplegado y ya */
    }
  }, []);
  function alternarGrupo(titulo: string) {
    setPlegados((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(titulo)) siguiente.delete(titulo);
      else siguiente.add(titulo);
      try {
        window.localStorage.setItem(CLAVE_PLEGADOS, JSON.stringify([...siguiente]));
      } catch {
        /* igual funciona, solo no se recuerda */
      }
      return siguiente;
    });
  }
  const ultimoSonidoRef = useRef<number>(0);
  const contadoresAnterioresRef =
    useRef<ContadoresBadges>(contadoresIniciales);

  useEffect(() => {
    setContadores(contadoresIniciales);
    contadoresAnterioresRef.current = contadoresIniciales;
  }, [contadoresIniciales]);

  useEffect(() => {
    setAbierto(false);
  }, [ruta]);

  useEffect(() => {
    if (abierto) {
      document.body.classList.add("sin-desplazamiento");
    } else {
      document.body.classList.remove("sin-desplazamiento");
    }
    return () => {
      document.body.classList.remove("sin-desplazamiento");
    };
  }, [abierto]);

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
    <>
      {/* Barra superior visible únicamente en pantallas móviles (< 900px) */}
      <div className="portal__barra">
        <div className="portal__marca">
          <Marca />
        </div>
        <button
          className="portal__hamburguesa"
          type="button"
          aria-label={abierto ? "Cerrar menú lateral" : "Abrir menú lateral"}
          aria-expanded={abierto}
          aria-controls="portal-menu"
          onClick={() => setAbierto((v) => !v)}
        >
          {abierto ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Telón oscuro al abrir el menú en móviles */}
      <div
        className="portal__telon"
        data-visible={abierto}
        onClick={() => setAbierto(false)}
        aria-hidden="true"
      />

      {/* Menú lateral (fijo a la izquierda en desktop, deslizante en mobile) */}
      <aside
        id="portal-menu"
        className="portal__lateral"
        data-abierto={abierto}
      >
        <div className="portal__marca portal__marca--lateral">
          <Marca />
        </div>

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

            const contieneLaActiva = visibles.some((e) =>
              e.href === "/portal" ? ruta === "/portal" : ruta.startsWith(e.href),
            );
            const plegado = plegados.has(grupo.titulo) && !contieneLaActiva;

            return (
              <div key={grupo.titulo}>
                <button
                  type="button"
                  className="portal__grupo"
                  onClick={() => alternarGrupo(grupo.titulo)}
                  aria-expanded={!plegado}
                  title={plegado ? "Desplegar" : "Plegar"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    font: "inherit",
                    color: "inherit",
                    letterSpacing: "inherit",
                    textTransform: "inherit",
                    padding: 0,
                  }}
                >
                  <span>{grupo.titulo}</span>
                  <span
                    aria-hidden="true"
                    style={{
                      display: "inline-block",
                      width: 7,
                      height: 7,
                      borderRight: "1.5px solid currentColor",
                      borderBottom: "1.5px solid currentColor",
                      transform: plegado ? "rotate(-45deg)" : "rotate(45deg)",
                      transition: "transform 0.15s ease",
                      opacity: 0.7,
                      marginRight: 6,
                    }}
                  />
                </button>
                {plegado ? null : visibles.map((enlace) => {
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
    </>
  );
}
