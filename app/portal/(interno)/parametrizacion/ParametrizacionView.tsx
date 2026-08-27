"use client"

import { useState, useEffect, useRef } from "react"
import {
  MessageSquare,
  Mail,
  Sliders,
  Copy,
  Check,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Smartphone,
  ChevronRight,
} from "lucide-react"
import { Cabecera } from '../componentes'
import type { Usuario } from "@/lib/portal"

export type SettingCategory = "MENSAJE_WHATSAPP" | "PLANTILLA_CORREO" | "PARAMETRO_GENERAL"

export interface SystemSetting {
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
  ciudad: "Pereira (Risaralda)",
  prioridad: "Media",
  horarios: "Lunes a Jueves tardes",
  enlace: "https://www.redaquiestamos.org/sala/demo-sesion-123",
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

export function ParametrizacionView({ usuario }: { usuario: Usuario }) {
  const [categoriaActiva, setCategoriaActiva] = useState<SettingCategory>("MENSAJE_WHATSAPP")
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

  const puedeEditar = usuario.role === "ADMIN" || usuario.permisos.includes("*") || usuario.permisos.includes("configuracion:editar")

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
    } catch (err) {
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
    const primerItem = configuraciones.find((s) => s.category === cat)
    if (primerItem) {
      setClaveSeleccionada(primerItem.key)
      setValorEnEdicion(primerItem.value)
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
    }, 50)
  }

  function renderizarTexto(plantilla: string): string {
    if (!plantilla) return ""
    return plantilla.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, variable) => {
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
    } catch (err) {
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
    } catch (err) {
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
    return coincideCategoria && coincideBusqueda
  })

  return (
    <>
      <Cabecera
        titulo="Parametrización y Plantillas"
        descripcion="Personaliza los mensajes de WhatsApp, plantillas de correo y parámetros operativos de la red."
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid var(--color-border-default)", paddingBottom: 8 }}>
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
          Parámetros del Sistema
          <span style={{ fontSize: "0.75rem", padding: "2px 7px", borderRadius: 10, background: categoriaActiva === "PARAMETRO_GENERAL" ? "#ffffff33" : "#e2e8f0", fontWeight: 700 }}>
            {configuraciones.filter((s) => s.category === "PARAMETRO_GENERAL").length}
          </span>
        </button>
      </div>

      {mensajeExito && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "#ecfdf5", border: "1px solid #6ee7b7", color: "#065f46", marginBottom: 16, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 8 }}>
          <Check size={18} />
          {mensajeExito}
        </div>
      )}

      {mensajeError && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", marginBottom: 16, fontSize: "0.88rem" }}>
          {mensajeError}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 340px) minmax(0, 1fr)", gap: 20, alignItems: "start" }}>
        <div className="panel" style={{ padding: 14 }}>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <Search size={15} style={{ position: "absolute", left: 10, top: 10, color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Buscar plantilla o parámetro..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ width: "100%", padding: "7px 10px 7px 32px", borderRadius: 7, border: "1px solid #cbd5e1", fontSize: "0.84rem" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: "68vh", overflowY: "auto" }}>
            {cargando ? (
              <p style={{ fontSize: "0.84rem", color: "#64748b", textAlign: "center", padding: 16 }}>Cargando catálogo...</p>
            ) : configuracionesFiltradas.length === 0 ? (
              <p style={{ fontSize: "0.84rem", color: "#64748b", textAlign: "center", padding: 16 }}>No se encontraron elementos.</p>
            ) : (
              configuracionesFiltradas.map((item) => {
                const seleccionada = item.key === claveSeleccionada
                const modificada = item.value !== item.defaultValue

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setClaveSeleccionada(item.key)
                      setValorEnEdicion(item.value)
                    }}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: seleccionada ? "1.5px solid var(--navbar-background-color)" : "1px solid #e2e8f0",
                      background: seleccionada ? "#f8fafc" : "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontSize: "0.85rem", color: "#0f172a", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </strong>
                      <span style={{ fontSize: "0.74rem", color: "#64748b", display: "block", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.key}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {modificada && (
                        <span style={{ fontSize: "0.68rem", padding: "2px 5px", borderRadius: 4, background: "#fef3c7", color: "#92400e", fontWeight: 700 }}>
                          Editado
                        </span>
                      )}
                      <ChevronRight size={14} style={{ color: seleccionada ? "var(--navbar-background-color)" : "#94a3b8" }} />
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {elementoActual ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="panel" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#0f172a" }}>{elementoActual.name}</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "0.84rem", color: "#64748b" }}>
                    {elementoActual.description || elementoActual.key}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {elementoActual.value !== elementoActual.defaultValue && puedeEditar && (
                    <button
                      type="button"
                      className="boton-mini"
                      data-tono="neutro"
                      onClick={restablecerPredeterminado}
                      disabled={guardando}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                    >
                      <RotateCcw size={13} />
                      Restablecer
                    </button>
                  )}

                  {puedeEditar && (
                    <button
                      type="button"
                      className="boton-mini"
                      data-tono="principal"
                      onClick={guardarCambios}
                      disabled={guardando || valorEnEdicion === elementoActual.value}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 700 }}
                    >
                      <Save size={13} />
                      {guardando ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  )}
                </div>
              </div>

              {elementoActual.variables && elementoActual.variables.length > 0 && (
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Sparkles size={14} style={{ color: "#0284c7" }} />
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#334155" }}>
                      Variables disponibles (haz clic para insertar en el texto):
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {elementoActual.variables.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertarVariable(v)}
                        style={{
                          fontSize: "0.76rem",
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "#f0f9ff",
                          border: "1px solid #bae6fd",
                          color: "#0369a1",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {"{" + v + "}"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="panel" style={{ padding: 18 }}>
              <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                {elementoActual.category === "PARAMETRO_GENERAL" ? "Valor del Parámetro" : "Contenido de la Plantilla"}
              </label>

              {elementoActual.category === "PARAMETRO_GENERAL" && elementoActual.dataType === "NUMERO" ? (
                <input
                  type="number"
                  value={valorEnEdicion}
                  onChange={(e) => setValorEnEdicion(e.target.value)}
                  style={{ width: "100%", maxWidth: 240, padding: "8px 12px", borderRadius: 7, border: "1px solid #cbd5e1", fontSize: "1.1rem", fontWeight: 600 }}
                />
              ) : (
                <textarea
                  ref={textareaRef}
                  value={valorEnEdicion}
                  onChange={(e) => setValorEnEdicion(e.target.value)}
                  rows={categoriaActiva === "MENSAJE_WHATSAPP" ? 12 : 8}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontFamily: "monospace", fontSize: "0.86rem", lineHeight: 1.5, resize: "vertical" }}
                />
              )}
            </div>

            {categoriaActiva === "MENSAJE_WHATSAPP" && (
              <div className="panel" style={{ padding: 18, background: "#f8fafc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Smartphone size={16} style={{ color: "#059669" }} />
                    <strong style={{ fontSize: "0.9rem", color: "#0f172a" }}>
                      Simulador de WhatsApp en Vivo
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="boton-mini"
                    onClick={() => copiarAlPortapapeles(renderizarTexto(valorEnEdicion))}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                  >
                    {copiado ? <Check size={13} style={{ color: "#059669" }} /> : <Copy size={13} />}
                    {copiado ? "¡Copiado!" : "Copiar Texto"}
                  </button>
                </div>

                <div
                  style={{
                    maxWidth: 520,
                    margin: "0 auto",
                    padding: "16px 18px",
                    borderRadius: "12px 12px 2px 12px",
                    background: "#dcf8c6",
                    border: "1px solid #c7e8b4",
                    color: "#111827",
                    fontSize: "0.9rem",
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  {renderizarTexto(valorEnEdicion)}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </>
  )
}