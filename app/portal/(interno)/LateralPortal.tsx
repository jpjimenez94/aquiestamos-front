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
  Activity,
  UserRound,
  Calendar,
  Settings,
  Globe,
  Compass,
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

// Cada grupo lleva su icono, de la misma familia y tamaño que los enlaces:
// plegado, el título es lo único que se ve, y sin icono era solo una palabra.
const GRUPOS: { titulo: string; icono: React.ReactNode; enlaces: Enlace[] }[] = [
  {
    titulo: "Operación",
    icono: <Activity size={15} />,
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
    icono: <UserRound size={15} />,
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
    icono: <Calendar size={15} />,
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
    icono: <Settings size={15} />,
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
    icono: <Globe size={15} />,
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
    icono: <Compass size={15} />,
    enlaces: [
      {
        href: "/portal/procesos",
        texto: "Cómo funciona la red",
        icono: <BookOpen size={17} />,
      },
    ],
  },
];

/**
 * El grupo que arranca abierto. «Operación» es donde está el trabajo del día
 * —solicitudes, postulaciones, verificaciones, cuidado del equipo—, y es la
 * primera pregunta al abrir el portal: qué hay pendiente.
 *
 * Si un rol no lo ve —Líderes Comunitarios solo abre su módulo—, no se fuerza
 * nada: se abre el primer grupo que ese rol sí ve. Un menú que arranca con
 * todo plegado porque el único abierto está oculto no ayuda a nadie.
 */
const GRUPO_POR_DEFECTO = "Operación";

/** Qué enlaces de un grupo ve este usuario. Una sola regla para todo el menú. */
function enlacesVisibles(grupo: (typeof GRUPOS)[number], usuario: Usuario) {
  const listaRoles =
    Array.isArray((usuario as any).roles) && (usuario as any).roles.length > 0
      ? (usuario as any).roles
      : [usuario.role];
  return grupo.enlaces.filter((e) => {
    const tienePermiso = !e.permiso || puede(usuario, e.permiso);
    const rolPermitido = !e.soloRoles || e.soloRoles.some((r: any) => listaRoles.includes(r));
    return tienePermiso && rolPermitido;
  });
}

/** El que abre al cargar: «Operación» si lo ve, y si no el primero que sí vea. */
function grupoInicial(usuario: Usuario): string | null {
  const conEnlaces = GRUPOS.filter((g) => enlacesVisibles(g, usuario).length > 0);
  const porDefecto = conEnlaces.find((g) => g.titulo === GRUPO_POR_DEFECTO);
  return (porDefecto ?? conEnlaces[0])?.titulo ?? null;
}

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
   * El menú es un acordeón: solo un grupo abierto a la vez. Seis grupos con
   * veinte enlaces desplegados eran una columna que había que recorrer con los
   * ojos cada vez; con uno solo abierto, los títulos hacen de mapa —igual que
   * los capítulos del manual—.
   *
   * Al cargar abre «Operación» y solo ese: es donde está el trabajo del día.
   * Abría el grupo de la ruta, y entrar a la ficha de una persona dejaba
   * abierto «Personas» —lo que se estaba mirando, no lo que toca hacer—.
   *
   * Después manda quien lo usa: abrir otro cierra ese, y tocar el abierto lo
   * pliega. Navegar NO lo mueve, a propósito: si al entrar a una ficha desde
   * el tablero el menú saltara solo, escondería el grupo que el propio usuario
   * acababa de abrir.
   */
  const [grupoAbierto, setGrupoAbierto] = useState<string | null>(() => grupoInicial(usuario));
  function alternarGrupo(titulo: string) {
    setGrupoAbierto((prev) => (prev === titulo ? null : titulo));
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
            const visibles = enlacesVisibles(grupo, usuario);
            if (visibles.length === 0) return null;

            const plegado = grupoAbierto !== grupo.titulo;

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
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <span style={{ display: "inline-flex", opacity: 0.85 }}>{grupo.icono}</span>
                    {grupo.titulo}
                  </span>
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
