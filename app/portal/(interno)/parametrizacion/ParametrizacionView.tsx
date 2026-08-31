'use client'

import { BurbujaWhatsApp } from "@/components/portal/BurbujaWhatsApp"
import { useState, useEffect, useRef } from "react"
import {
  MessageSquare,
  Mail,
  Sliders,
  Save,
  RotateCcw,
  Copy,
  Check,
  Search,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Info,
  User,
  Stethoscope,
  Users,
} from "lucide-react"
import { Cabecera } from "../componentes"
import { Usuario } from "@/lib/portal"

type SettingCategory = "MENSAJE_WHATSAPP" | "PLANTILLA_CORREO" | "PARAMETRO_GENERAL"

type SystemSetting = {
  id: string
  key: string
  category: SettingCategory
  name: string
  description?: string
  value: string
  defaultValue: string
  variables: string[]
  dataType: "TEXTO" | "NUMERO" | "BOOLEANO" | "JSON"
  updatedByEmail?: string
  updatedAt: string
}

const VALORES_EJEMPLO: Record<string, string> = {
  nombre: "Sofía",
  persona: "Sofía Beltrán",
  profesional: "Jean Franco Forero",
  cuando: "28/08/2026, 9:00 a. m.",
  cuandoAnterior: "28/08/2026, 9:00 a. m.",
  modalidad: "virtual",
  ciudad: "Buenaventura (Valle del Cauca)",
  prioridad: "Media",
  urgencia: "Te pedimos responder en los próximos días.",
  horarios: "jueves en la noche (de 6:00 p. m. a 9:00 p. m.)",
  enlace: "https://www.redaquiestamos.org/portal/caso/demo-caso-456",
  enlaceReunion: "https://www.redaquiestamos.org/sala/demo-sesion-123",
  enlaceCaso: "https://www.redaquiestamos.org/portal/caso/demo-caso-456",
  canalContacto: "WhatsApp",
  motivo: "un imprevisto médico de última hora",
  opcionesHorario: "· Martes 1 de Sep a las 4:00 p. m.\n· Jueves 3 de Sep a las 9:00 a. m.",
  territorio: "Barrio El Silencio, Pereira",
  titulo: "Diseño de piezas para redes sociales",
  descripcion: "Creación de infografías sobre primeros auxilios psicológicos.",
  nota: "Por favor coordinar con el equipo de comunicaciones.",
  fechaLimite: "30 de Agosto de 2026",
  disciplina: "Diseñador(a) Gráfico(a)",
  nombreVoluntario: "Carlos Pérez",
  accion: "ACEPTADO",
  motivoRechazo: "Cruce de horario laboral",
  resultado: "Sesión realizada exitosamente",
  queSigue: "Requiere 2 sesiones adicionales",
  dificultades: "Ninguna",
}

export function obtenerAudienciaWhatsapp(key: string): "PACIENTE" | "PROFESIONAL" | "COMUNIDAD" {
  if (
    key === "WHATSAPP_TAMIZAJE" ||
    key === "WHATSAPP_CUADRAR_HORARIO_PERSONA" ||
    key === "WHATSAPP_CONFIRMAR_CITA_PERSONA" ||
    key === "WHATSAPP_CONSENTIMIENTO" ||
    key === "WHATSAPP_CONSENTIMIENTO_FIRMADO" ||
    key === "WHATSAPP_RECORDATORIO_PREVIO_PERSONA" ||
    key === "WHATSAPP_REAGENDAMIENTO_EXCUSAS" ||
    key === "WHATSAPP_FEEDBACK_PERSONA"
  ) {
    return "PACIENTE"
  }
  if (
    key === "WHATSAPP_PROPUESTA_PROFESIONAL" ||
    key === "WHATSAPP_DESPACHO_PROFESIONAL" ||
    key === "WHATSAPP_SIGUIENTE_CITA_PROFESIONAL" ||
    key === "WHATSAPP_RECORDATORIO_PREVIO" ||
    key === "WHATSAPP_REAGENDAMIENTO_PEDIR_DISP" ||
    key === "WHATSAPP_PEDIR_DOCUMENTOS"
  ) {
    return "PROFESIONAL"
  }
  return "COMUNIDAD"
}

export function ParametrizacionView({ usuario }: { usuario: Usuario }) {
  const [categoriaActiva, setCategoriaActiva] = useState<SettingCategory>("MENSAJE_WHATSAPP")
  const [subFiltroWhatsapp, setSubFiltroWhatsapp] = useState<"TODOS" | "PACIENTE" | "PROFESIONAL" | "COMUNIDAD">("TODOS")
  const [configuraciones, setConfiguraciones] = useState<SystemSetting[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [claveSeleccionada, setClaveSeleccionada] = useState<string>("")
  const [valorEnEdicion, setValorEnEdicion] = useState<string>("")
  const [busqueda, setBusqueda] = useState<string>("")
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [mensajeError, setMensajeError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [simulacionVariables] = useState<Record<string, string>>(VALORES_EJEMPLO)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const puedeEditar = usuario.permisos.includes("*") || usuario.permisos.includes("configuracion:editar")

  useEffect(() => {
    cargarConfiguraciones()
  }, [])

  async function cargarConfiguraciones() {
    setCargando(true)
    try {
      const res = await fetch("/api/portal/settings", { cache: "no-store" })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setConfiguraciones(data.data)
        if (data.data.length > 0 && !claveSeleccionada) {
          const primero = data.data.find((s: SystemSetting) => s.category === categoriaActiva) || data.data[0]
          setClaveSeleccionada(primero.key)
          setValorEnEdicion(primero.value)
        }
      }
    } catch {
      setMensajeError("No se pudieron cargar las configuraciones del servidor.")
    } finally {
      setCargando(false)
    }
  }

  const elementoActual = configuraciones.find((s) => s.key === claveSeleccionada)

  useEffect(() => {
    if (elementoActual) {
      setValorEnEdicion(elementoActual.value)
    }
  }, [claveSeleccionada])

  function cambiarCategoria(cat: SettingCategory) {
    setCategoriaActiva(cat)
    const itemsDeCategoria = configuraciones.filter((s) => s.category === cat)
    if (itemsDeCategoria.length > 0) {
      setClaveSeleccionada(itemsDeCategoria[0].key)
      setValorEnEdicion(itemsDeCategoria[0].value)
    }
  }

  function insertarVariable(variable: string) {
    const textarea = textareaRef.current
    const textoVariable = "{" + variable + "}"
    if (!textarea) {
      setValorEnEdicion((prev) => prev + textoVariable)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const nuevoValor = valorEnEdicion.substring(0, start) + textoVariable + valorEnEdicion.substring(end)
    setValorEnEdicion(nuevoValor)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + textoVariable.length, start + textoVariable.length)
    }, 10)
  }

  function renderizarVistaPrevia(texto: string): string {
    if (!texto) return ""
    return texto.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, variable) => {
      return simulacionVariables[variable] !== undefined ? simulacionVariables[variable] : match
    })
  }

  async function guardarCambios() {
    if (!elementoActual || !puedeEditar) return
    setGuardando(true)
    setMensajeExito(null)
    setMensajeError(null)

    try {
      const res = await fetch("/api/portal/settings/" + elementoActual.key, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: valorEnEdicion }),
      })

      const data = await res.json()
      if (data.success) {
        setMensajeExito("Configuración guardada exitosamente.")
        setConfiguraciones((prev) =>
          prev.map((item) => (item.key === elementoActual.key ? { ...item, value: valorEnEdicion } : item))
        )
        setTimeout(() => setMensajeExito(null), 4000)
      } else {
        setMensajeError(data.message || "Error al guardar configuración.")
      }
    } catch {
      setMensajeError("Error de conexión al guardar.")
    } finally {
      setGuardando(false)
    }
  }

  async function restablecerPredeterminado() {
    if (!elementoActual || !puedeEditar) return
    if (!confirm("¿Estás seguro de restablecer " + elementoActual.name + " a su valor original de fábrica?")) return

    setGuardando(true)
    setMensajeExito(null)
    setMensajeError(null)

    try {
      const res = await fetch("/api/portal/settings/" + elementoActual.key + "/reset", {
        method: "POST",
      })

      const data = await res.json()
      if (data.success) {
        setValorEnEdicion(elementoActual.defaultValue)
        setMensajeExito("Se restableció al valor predeterminado de fábrica.")
        setConfiguraciones((prev) =>
          prev.map((item) => (item.key === elementoActual.key ? { ...item, value: elementoActual.defaultValue } : item))
        )
        setTimeout(() => setMensajeExito(null), 4000)
      } else {
        setMensajeError(data.message || "Error al restablecer.")
      }
    } catch {
      setMensajeError("Error de conexión al restablecer.")
    } finally {
      setGuardando(false)
    }
  }

  function copiarAlPortapapeles(texto: string) {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  const configuracionesFiltradas = configuraciones.filter((item) => {
    const coincideCategoria = item.category === categoriaActiva
    const coincideBusqueda =
      busqueda.trim() === "" ||
      item.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.key.toLowerCase().includes(busqueda.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(busqueda.toLowerCase()))

    let coincideSubFiltro = true
    if (categoriaActiva === "MENSAJE_WHATSAPP" && subFiltroWhatsapp !== "TODOS") {
      coincideSubFiltro = obtenerAudienciaWhatsapp(item.key) === subFiltroWhatsapp
    }

    return coincideCategoria && coincideBusqueda && coincideSubFiltro
  })

  return (
    <>
      <Cabecera
        titulo="Parametrización y Plantillas"
        descripcion="Personaliza los mensajes de WhatsApp, plantillas de correo y parámetros operativos de la red."
      />

      {/* Categorías Principales */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, borderBottom: "1px solid var(--color-border-default)", paddingBottom: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => cambiarCategoria("MENSAJE_WHATSAPP")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            fontSize: "0.88rem",
            fontWeight: 600,
            cursor: "pointer",
            background: categoriaActiva === "MENSAJE_WHATSAPP" ? "var(--navbar-background-color)" : "#f1f5f9",
            color: categoriaActiva === "MENSAJE_WHATSAPP" ? "var(--navbar-text-color)" : "#475569",
          }}
        >
          <MessageSquare size={16} />
          Mensajes de WhatsApp
          <span style={{ fontSize: "0.75rem", padding: "2px 7px", borderRadius: 10, background: categoriaActiva === "MENSAJE_WHATSAPP" ? "#ffffff33" : "#e2e8f0", fontWeight: 700 }}>
            {configuraciones.filter((s) => s.category === "MENSAJE_WHATSAPP").length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => cambiarCategoria("PLANTILLA_CORREO")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            fontSize: "0.88rem",
            fontWeight: 600,
            cursor: "pointer",
            background: categoriaActiva === "PLANTILLA_CORREO" ? "var(--navbar-background-color)" : "#f1f5f9",
            color: categoriaActiva === "PLANTILLA_CORREO" ? "var(--navbar-text-color)" : "#475569",
          }}
        >
          <Mail size={16} />
          Plantillas de Correo
          <span style={{ fontSize: "0.75rem", padding: "2px 7px", borderRadius: 10, background: categoriaActiva === "PLANTILLA_CORREO" ? "#ffffff33" : "#e2e8f0", fontWeight: 700 }}>
            {configuraciones.filter((s) => s.category === "PLANTILLA_CORREO").length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => cambiarCategoria("PARAMETRO_GENERAL")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            fontSize: "0.88rem",
            fontWeight: 600,
            cursor: "pointer",
            background: categoriaActiva === "PARAMETRO_GENERAL" ? "var(--navbar-background-color)" : "#f1f5f9",
            color: categoriaActiva === "PARAMETRO_GENERAL" ? "var(--navbar-text-color)" : "#475569",
          }}
        >
          <Sliders size={16} />
          Parámetros Operativos
          <span style={{ fontSize: "0.75rem", padding: "2px 7px", borderRadius: 10, background: categoriaActiva === "PARAMETRO_GENERAL" ? "#ffffff33" : "#e2e8f0", fontWeight: 700 }}>
            {configuraciones.filter((s) => s.category === "PARAMETRO_GENERAL").length}
          </span>
        </button>
      </div>

      {/* Sub-Pestañas para Separar Mensajes de Paciente y Profesional */}
      {categoriaActiva === "MENSAJE_WHATSAPP" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setSubFiltroWhatsapp("TODOS")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 14px",
              borderRadius: 20,
              border: subFiltroWhatsapp === "TODOS" ? "2px solid #059669" : "1px solid #cbd5e1",
              background: subFiltroWhatsapp === "TODOS" ? "#ecfdf5" : "#fff",
              color: subFiltroWhatsapp === "TODOS" ? "#065f46" : "#475569",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            <Users size={14} />
            Todos los Mensajes ({configuraciones.filter((s) => s.category === "MENSAJE_WHATSAPP").length})
          </button>

          <button
            type="button"
            onClick={() => setSubFiltroWhatsapp("PACIENTE")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 14px",
              borderRadius: 20,
              border: subFiltroWhatsapp === "PACIENTE" ? "2px solid #059669" : "1px solid #cbd5e1",
              background: subFiltroWhatsapp === "PACIENTE" ? "#ecfdf5" : "#fff",
              color: subFiltroWhatsapp === "PACIENTE" ? "#065f46" : "#475569",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            <User size={14} style={{ color: "#059669" }} />
            Para la Persona Acompañada / Paciente ({configuraciones.filter((s) => s.category === "MENSAJE_WHATSAPP" && obtenerAudienciaWhatsapp(s.key) === "PACIENTE").length})
          </button>

          <button
            type="button"
            onClick={() => setSubFiltroWhatsapp("PROFESIONAL")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 14px",
              borderRadius: 20,
              border: subFiltroWhatsapp === "PROFESIONAL" ? "2px solid #0284c7" : "1px solid #cbd5e1",
              background: subFiltroWhatsapp === "PROFESIONAL" ? "#f0f9ff" : "#fff",
              color: subFiltroWhatsapp === "PROFESIONAL" ? "#0369a1" : "#475569",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            <Stethoscope size={14} style={{ color: "#0284c7" }} />
            Para el Profesional / Psicólogo ({configuraciones.filter((s) => s.category === "MENSAJE_WHATSAPP" && obtenerAudienciaWhatsapp(s.key) === "PROFESIONAL").length})
          </button>

          <button
            type="button"
            onClick={() => setSubFiltroWhatsapp("COMUNIDAD")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 14px",
              borderRadius: 20,
              border: subFiltroWhatsapp === "COMUNIDAD" ? "2px solid #d97706" : "1px solid #cbd5e1",
              background: subFiltroWhatsapp === "COMUNIDAD" ? "#fef3c7" : "#fff",
              color: subFiltroWhatsapp === "COMUNIDAD" ? "#92400e" : "#475569",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            <Sparkles size={14} style={{ color: "#d97706" }} />
            Comunidad ({configuraciones.filter((s) => s.category === "MENSAJE_WHATSAPP" && obtenerAudienciaWhatsapp(s.key) === "COMUNIDAD").length})
          </button>
        </div>
      )}

      {mensajeExito && (
        <div className="aviso-portal" data-tono="verde" style={{ marginBottom: 16 }}>
          <Check size={16} />
          {mensajeExito}
        </div>
      )}

      {mensajeError && (
        <div className="aviso-portal" data-tono="rojo" style={{ marginBottom: 16 }}>
          <AlertCircle size={16} />
          {mensajeError}
        </div>
      )}

      {cargando ? (
        <div className="cargando">Cargando catálogo de configuraciones…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 340px) minmax(0, 1fr)", gap: 20, alignItems: "start" }}>
          {/* Columna Izquierda: Lista de Plantillas */}
          <div className="panel" style={{ padding: 14 }}>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input
                className="input"
                placeholder="Buscar parámetro o plantilla…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ width: "100%", paddingLeft: 32, fontSize: "0.84rem" }}
              />
              <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
              {configuracionesFiltradas.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "#64748b", fontSize: "0.84rem" }}>
                  No se encontraron elementos con ese filtro.
                </div>
              ) : (
                configuracionesFiltradas.map((item) => {
                  const seleccionada = item.key === claveSeleccionada
                  const modificado = item.value !== item.defaultValue
                  const aud = item.category === "MENSAJE_WHATSAPP" ? obtenerAudienciaWhatsapp(item.key) : null

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setClaveSeleccionada(item.key)
                        setValorEnEdicion(item.value)
                        setMensajeExito(null)
                        setMensajeError(null)
                      }}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: seleccionada ? "2px solid var(--navbar-background-color)" : "1px solid var(--color-border-default)",
                        background: seleccionada ? "#f0fdf4" : "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.86rem", color: seleccionada ? "var(--color-primary-text)" : "#1e293b" }}>
                          {item.name}
                        </span>
                        {modificado && (
                          <span style={{ fontSize: "0.68rem", padding: "1px 5px", background: "#fef3c7", color: "#92400e", borderRadius: 4, fontWeight: 700 }}>
                            Editado
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 5, alignItems: "center", marginTop: 2 }}>
                        {aud === "PACIENTE" && (
                          <span style={{ fontSize: "0.7rem", padding: "1px 6px", background: "#ecfdf5", color: "#065f46", borderRadius: 4, fontWeight: 700 }}>
                            👤 Para Paciente
                          </span>
                        )}
                        {aud === "PROFESIONAL" && (
                          <span style={{ fontSize: "0.7rem", padding: "1px 6px", background: "#f0f9ff", color: "#0369a1", borderRadius: 4, fontWeight: 700 }}>
                            🩺 Para Profesional
                          </span>
                        )}
                        {aud === "COMUNIDAD" && (
                          <span style={{ fontSize: "0.7rem", padding: "1px 6px", background: "#fef3c7", color: "#92400e", borderRadius: 4, fontWeight: 700 }}>
                            🤝 Comunidad
                          </span>
                        )}
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontFamily: "monospace" }}>
                          {item.key}
                        </span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Columna Derecha: Editor y Simulador */}
          {elementoActual ? (
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, borderBottom: "1px solid var(--color-border-default)", paddingBottom: 14 }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>
                      {elementoActual.name}
                    </h2>
                    {elementoActual.category === "MENSAJE_WHATSAPP" && (
                      <span style={{
                        fontSize: "0.75rem",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontWeight: 700,
                        background: obtenerAudienciaWhatsapp(elementoActual.key) === "PACIENTE" ? "#ecfdf5" : obtenerAudienciaWhatsapp(elementoActual.key) === "PROFESIONAL" ? "#f0f9ff" : "#fef3c7",
                        color: obtenerAudienciaWhatsapp(elementoActual.key) === "PACIENTE" ? "#065f46" : obtenerAudienciaWhatsapp(elementoActual.key) === "PROFESIONAL" ? "#0369a1" : "#92400e",
                      }}>
                        {obtenerAudienciaWhatsapp(elementoActual.key) === "PACIENTE" ? "👤 Mensaje para la Persona Acompañada" : obtenerAudienciaWhatsapp(elementoActual.key) === "PROFESIONAL" ? "🩺 Mensaje para el Profesional" : "🤝 Mensaje Comunitario"}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "0.84rem", color: "#64748b" }}>
                    {elementoActual.description || "Sin descripción adicional."}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="boton-mini"
                    onClick={restablecerPredeterminado}
                    disabled={guardando || !puedeEditar}
                    title="Restablecer al texto o valor de fábrica predeterminado"
                  >
                    <RotateCcw size={13} />
                    Restablecer
                  </button>

                  <button
                    type="button"
                    className="boton-mini"
                    data-tono="principal"
                    onClick={guardarCambios}
                    disabled={guardando || !puedeEditar}
                    style={{ fontWeight: 700 }}
                  >
                    <Save size={13} />
                    {guardando ? "Guardando…" : "Guardar Cambios"}
                  </button>
                </div>
              </div>

              {/* Inserción de Variables Dinámicas */}
              {elementoActual.variables && elementoActual.variables.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                    <Sparkles size={14} style={{ color: "var(--color-primary-text)" }} />
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                      Variables dinámicas disponibles (haz clic para insertar en el cursor):
                    </span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {elementoActual.variables.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertarVariable(v)}
                        style={{
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          padding: "3px 8px",
                          borderRadius: 6,
                          fontSize: "0.78rem",
                          fontFamily: "monospace",
                          fontWeight: 600,
                          color: "#1e293b",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                        title={"Inserta {" + v + "} en el texto"}
                      >
                        <span>{"{" + v + "}"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Editor del Valor */}
              <div style={{ marginTop: 14 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 6, textTransform: "uppercase" }}>
                  Contenido de la Plantilla:
                </label>
                <textarea
                  ref={textareaRef}
                  className="input"
                  rows={elementoActual.category === "MENSAJE_WHATSAPP" ? 11 : 6}
                  value={valorEnEdicion}
                  onChange={(e) => setValorEnEdicion(e.target.value)}
                  disabled={!puedeEditar}
                  style={{ width: "100%", fontFamily: "inherit", fontSize: "0.88rem", lineHeight: 1.5, resize: "vertical" }}
                />
              </div>

              {/* Simulador en Vivo de WhatsApp */}
              {elementoActual.category === "MENSAJE_WHATSAPP" && (
                <div style={{ marginTop: 18, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <MessageSquare size={15} style={{ color: "#059669" }} />
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#065f46" }}>
                        Simulador de WhatsApp en Vivo:
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => copiarAlPortapapeles(renderizarVistaPrevia(valorEnEdicion))}
                      className="boton-mini"
                      style={{ background: "#fff" }}
                    >
                      {copiado ? <Check size={13} style={{ color: "#059669" }} /> : <Copy size={13} />}
                      {copiado ? "¡Copiado!" : "Copiar Texto Renderizado"}
                    </button>
                  </div>

                  {/* La misma burbuja que enseña la ficha de la persona. */}
                  <BurbujaWhatsApp texto={renderizarVistaPrevia(valorEnEdicion)} />
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </>
  )
}
