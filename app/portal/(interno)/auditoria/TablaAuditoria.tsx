'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  AlertTriangle,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  RotateCcw,
  Calendar,
  Filter,
  Search,
  Check,
  Clock,
  Shield,
  Activity,
  Loader2,
} from 'lucide-react'
import { enBogota } from '@/lib/fechas'
import { Vacio } from '../componentes'
import { PaginacionTabla } from '../PaginacionTabla'

export type EntradaAuditoria = {
  id: string
  actor: string | null
  accion: string
  entidad: string
  entidadId: string | null
  antes?: any
  despues?: any
  fecha: string
  ip: string | null
}

type ColumnaOrden = 'fecha' | 'actor' | 'accion' | 'entidad' | 'ip'
type Direccion = 'asc' | 'desc'

const estiloInputFiltro: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  fontSize: '0.74rem',
  border: '1px solid var(--color-border-default, #cbd5e1)',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: 'var(--color-text-main, #1e293b)',
  outline: 'none',
  boxSizing: 'border-box',
  minHeight: '28px',
  fontWeight: 'normal',
}

function formatearFechaIsoBogota(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

function obtenerFechaIso(fechaIso: string): string {
  const d = new Date(fechaIso)
  if (isNaN(d.getTime())) return ''
  return formatearFechaIsoBogota(d)
}


function renderizarDiagnosticoError(e: EntradaAuditoria) {
  const d = e.despues || {}
  const esPruebaLocal =
    e.ip?.includes('127.0.0.1') ||
    e.ip?.includes('::1') ||
    e.actor?.includes('@ejemplo.com') ||
    e.actor?.includes('@pruebas.local') ||
    d.email?.includes('@pruebas.local') ||
    d.correo?.includes('@ejemplo.com')

  if (e.accion === 'acceso_fallido') {
    if (e.entidad === 'CasoCompartido') {
      return (
        <div
          style={{
            fontSize: '0.76rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 6,
            padding: '5px 9px',
            color: '#991b1b',
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <div>
            <strong>🔒 Causa:</strong> Intento de acceso a caso con correo no autorizado.
          </div>
          {d.correo ? (
            <div style={{ fontSize: '0.72rem', color: '#b91c1c' }}>
              Correo digitado: <code>{d.correo}</code>
            </div>
          ) : null}
          {esPruebaLocal ? (
            <span
              style={{
                fontSize: '0.68rem',
                background: '#e2e8f0',
                color: '#334155',
                padding: '2px 6px',
                borderRadius: 4,
                width: 'fit-content',
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              🧪 Prueba de seguridad automatizada
            </span>
          ) : null}
        </div>
      )
    }

    if (e.entidad === 'usuario') {
      return (
        <div
          style={{
            fontSize: '0.76rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 6,
            padding: '5px 9px',
            color: '#991b1b',
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <div>
            <strong>🔒 Causa:</strong>{' '}
            {d.bloqueado
              ? '🚨 Cuenta bloqueada por exceso de intentos erróneos'
              : 'Contraseña incorrecta (Intento ' + (d.intentos ?? 1) + ' de 5)'}
          </div>
          {d.email ? (
            <div style={{ fontSize: '0.72rem', color: '#b91c1c' }}>
              Correo: <code>{d.email}</code>
            </div>
          ) : null}
          {esPruebaLocal ? (
            <span
              style={{
                fontSize: '0.68rem',
                background: '#e2e8f0',
                color: '#334155',
                padding: '2px 6px',
                borderRadius: 4,
                width: 'fit-content',
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              🧪 Prueba de seguridad automatizada
            </span>
          ) : null}
        </div>
      )
    }

    return (
      <div
        style={{
          fontSize: '0.76rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 6,
          padding: '5px 9px',
          color: '#991b1b',
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <div>
          <strong>🔒 Causa:</strong> Acceso o autenticación rechazada por el sistema.
        </div>
        {esPruebaLocal ? (
          <span
            style={{
              fontSize: '0.68rem',
              background: '#e2e8f0',
              color: '#334155',
              padding: '2px 6px',
              borderRadius: 4,
              width: 'fit-content',
              fontWeight: 600,
              marginTop: 2,
            }}
          >
            🧪 Prueba de seguridad automatizada
          </span>
        ) : null}
      </div>
    )
  }

  if (e.accion === 'error_videollamada') {
    return (
      <div
        style={{
          fontSize: '0.76rem',
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: 6,
          padding: '5px 9px',
          color: '#9f1239',
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <div>
          <strong>🚨 Fallo en videollamada:</strong> {d.motivo || d.errorDetalle || 'Problema de conexión WebRTC'}
        </div>
        {d.urlFallida ? (
          <div style={{ fontSize: '0.72rem', color: '#be123c' }}>
            Servidor / URL: <code>{d.urlFallida}</code>
          </div>
        ) : null}
        {d.rol ? (
          <div style={{ fontSize: '0.72rem', color: '#be123c' }}>
            Afectó a: <strong>{d.rol === 'PROFESIONAL' ? 'Psicólogo(a)' : 'Persona acompañada'}</strong>
          </div>
        ) : null}
      </div>
    )
  }

  if (e.accion === 'error_servidor') {
    return (
      <div
        style={{
          fontSize: '0.76rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 6,
          padding: '5px 9px',
          color: '#991b1b',
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <div>
          <strong>⚠️ Error interno 500:</strong> {d.error || 'Excepción no controlada'}
        </div>
        {d.ruta ? (
          <div style={{ fontSize: '0.72rem', color: '#b91c1c' }}>
            Endpoint: <code>{(d.metodo || 'GET') + ' ' + d.ruta}</code>
          </div>
        ) : null}
      </div>
    )
  }

  if (e.accion === 'error_notificacion') {
    return (
      <div
        style={{
          fontSize: '0.76rem',
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 6,
          padding: '5px 9px',
          color: '#92400e',
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <div>
          <strong>✉️ Fallo de notificación:</strong> {d.error || 'No se pudo entregar el correo'}
        </div>
        {d.para ? <div style={{ fontSize: '0.72rem', color: '#b45309' }}>Destinatario: {d.para}</div> : null}
        {d.plantilla ? <div style={{ fontSize: '0.72rem', color: '#b45309' }}>Plantilla: {d.plantilla}</div> : null}
      </div>
    )
  }

  if (d.motivo || d.error || d.errorDetalle) {
    return (
      <div
        style={{
          fontSize: '0.76rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 6,
          padding: '5px 9px',
          color: '#991b1b',
          marginTop: 4,
        }}
      >
        <div>
          <strong>Detalle del fallo:</strong> {String(d.motivo || d.error || d.errorDetalle)}
        </div>
      </div>
    )
  }

  return null
}

export function TablaAuditoria({
  entradas,
  modulos,
  accionMap,
  desdeInicial = '',
  hastaInicial = '',
}: {
  entradas: EntradaAuditoria[]
  modulos: { value: string; label: string }[]
  accionMap: Record<string, string>
  desdeInicial?: string
  hastaInicial?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Pestaña activa: Actividad del Portal vs Salas de Videollamada vs Incidentes vs Todo
  const [tabAuditoria, setTabAuditoria] = useState<'portal' | 'llamadas' | 'errores' | 'todo'>('portal')

  // Filtros de Rango de Fechas
  const [filtroDesde, setFiltroDesde] = useState(desdeInicial)
  const [filtroHasta, setFiltroHasta] = useState(hastaInicial)

  // Filtros por Columna
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroActor, setFiltroActor] = useState('')
  const [filtroAccion, setFiltroAccion] = useState('')
  const [filtroModulo, setFiltroModulo] = useState('')
  const [filtroIp, setFiltroIp] = useState('')

  // Ordenamiento
  const [columnaOrden, setColumnaOrden] = useState<ColumnaOrden>('fecha')
  const [direccion, setDireccion] = useState<Direccion>('desc')

  // Paginación
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(50)

  function alternarOrden(col: ColumnaOrden) {
    if (columnaOrden === col) {
      setDireccion(direccion === 'asc' ? 'desc' : 'asc')
    } else {
      setColumnaOrden(col)
      setDireccion(col === 'fecha' ? 'desc' : 'asc')
    }
  }

  // Sincronizar búsqueda con el servidor (para traer registros históricos de la BD)
  function sincronizarConServidor(d: string, h: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (d) params.set('desde', d)
    else params.delete('desde')

    if (h) params.set('hasta', h)
    else params.delete('hasta')

    params.delete('page')

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  // Acción explícita: botón "Aplicar filtros"
  function handleAplicarFiltros(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setPagina(1)
    sincronizarConServidor(filtroDesde, filtroHasta)
  }

  // Atajos rápidos de rango de fechas
  function aplicarRangoRapido(tipo: 'hoy' | '7dias' | '30dias' | 'esteMes' | 'todo') {
    const ahora = new Date()
    const hoyStr = formatearFechaIsoBogota(ahora)
    let nuevoDesde = ''
    let nuevoHasta = ''

    if (tipo === 'todo') {
      nuevoDesde = ''
      nuevoHasta = ''
    } else if (tipo === 'hoy') {
      nuevoDesde = hoyStr
      nuevoHasta = hoyStr
    } else if (tipo === '7dias') {
      const hace7 = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000)
      nuevoDesde = formatearFechaIsoBogota(hace7)
      nuevoHasta = hoyStr
    } else if (tipo === '30dias') {
      const hace30 = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)
      nuevoDesde = formatearFechaIsoBogota(hace30)
      nuevoHasta = hoyStr
    } else if (tipo === 'esteMes') {
      const anio = ahora.getFullYear()
      const mes = String(ahora.getMonth() + 1).padStart(2, '0')
      nuevoDesde = `${anio}-${mes}-01`
      nuevoHasta = hoyStr
    }

    setFiltroDesde(nuevoDesde)
    setFiltroHasta(nuevoHasta)
    setPagina(1)
    sincronizarConServidor(nuevoDesde, nuevoHasta)
  }

  const hayFiltrosEnPagina = Boolean(
    filtroDesde ||
      filtroHasta ||
      filtroFecha.trim() ||
      filtroActor.trim() ||
      filtroAccion ||
      filtroModulo ||
      filtroIp.trim(),
  )

  function limpiarTodosFiltros() {
    setFiltroDesde('')
    setFiltroHasta('')
    setFiltroFecha('')
    setFiltroActor('')
    setFiltroAccion('')
    setFiltroModulo('')
    setFiltroIp('')
    setPagina(1)
    sincronizarConServidor('', '')
  }

  const moduloLabelMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of modulos) {
      map.set(m.value, m.label)
    }
    return map
  }, [modulos])

  const esError = (e: EntradaAuditoria) =>
    ['error_servidor', 'error_videollamada', 'error_notificacion', 'acceso_fallido'].includes(e.accion)

  const esLlamada = (e: EntradaAuditoria) =>
    e.entidad === 'sesion_virtual' || ['ingresar_sala', 'finalizar_sala', 'error_videollamada'].includes(e.accion)

  // Contadores para las pestañas
  const conteoErrores = useMemo(() => entradas.filter(esError).length, [entradas])
  const conteoLlamadas = useMemo(() => entradas.filter(esLlamada).length, [entradas])
  const conteoPortal = useMemo(() => entradas.filter((e) => !esLlamada(e) && !esError(e)).length, [entradas])

  const listaFiltrada = useMemo(() => {
    return entradas.filter((e) => {
      // Filtro de pestaña principal
      if (tabAuditoria === 'portal' && (esLlamada(e) || esError(e))) {
        return false
      }
      if (tabAuditoria === 'llamadas' && !esLlamada(e)) {
        return false
      }
      if (tabAuditoria === 'errores' && !esError(e)) {
        return false
      }
      // Filtro de rango de fechas
      if (filtroDesde || filtroHasta) {
        const fechaDia = obtenerFechaIso(e.fecha)
        if (filtroDesde && fechaDia < filtroDesde) return false
        if (filtroHasta && fechaDia > filtroHasta) return false
      }

      // Filtro de texto de fecha/hora
      if (filtroFecha.trim()) {
        const q = filtroFecha.toLowerCase().trim()
        const matchFecha = enBogota(e.fecha).toLowerCase().includes(q)
        if (!matchFecha) return false
      }

      // Filtro por actor
      if (filtroActor.trim()) {
        const q = filtroActor.toLowerCase().trim()
        const actorTexto = (e.actor || 'el sistema sin cuenta').toLowerCase()
        if (!actorTexto.includes(q)) return false
      }

      // Filtro por acción
      if (filtroAccion && e.accion !== filtroAccion) {
        return false
      }

      // Filtro por módulo / entidad
      if (filtroModulo && e.entidad !== filtroModulo) {
        return false
      }

      // Filtro por IP
      if (filtroIp.trim()) {
        const q = filtroIp.toLowerCase().trim()
        if (!e.ip?.toLowerCase().includes(q)) return false
      }

      return true
    })
  }, [entradas, tabAuditoria, filtroDesde, filtroHasta, filtroFecha, filtroActor, filtroAccion, filtroModulo, filtroIp])

  const listaOrdenada = useMemo(() => {
    return [...listaFiltrada].sort((a, b) => {
      let cmp = 0
      switch (columnaOrden) {
        case 'fecha': {
          const tA = new Date(a.fecha).getTime()
          const tB = new Date(b.fecha).getTime()
          cmp = tA - tB
          break
        }
        case 'actor': {
          const actA = a.actor || 'zzz'
          const actB = b.actor || 'zzz'
          cmp = actA.localeCompare(actB, 'es', { sensitivity: 'base' })
          break
        }
        case 'accion': {
          const lblA = accionMap[a.accion] ?? a.accion
          const lblB = accionMap[b.accion] ?? b.accion
          cmp = lblA.localeCompare(lblB, 'es', { sensitivity: 'base' })
          break
        }
        case 'entidad': {
          const modA = moduloLabelMap.get(a.entidad) ?? a.entidad
          const modB = moduloLabelMap.get(b.entidad) ?? b.entidad
          cmp = modA.localeCompare(modB, 'es', { sensitivity: 'base' })
          break
        }
        case 'ip': {
          const ipA = a.ip || ''
          const ipB = b.ip || ''
          cmp = ipA.localeCompare(ipB, 'es', { sensitivity: 'base' })
          break
        }
      }
      return direccion === 'asc' ? cmp : -cmp
    })
  }, [listaFiltrada, columnaOrden, direccion, accionMap, moduloLabelMap])

  // Paginación en cliente
  const totalPaginas = Math.max(1, Math.ceil(listaOrdenada.length / porPagina))
  const paginaAjustada = Math.min(pagina, totalPaginas)
  const inicio = (paginaAjustada - 1) * porPagina
  const fin = inicio + porPagina
  const listaPaginada = listaOrdenada.slice(inicio, fin)

  function IconoOrden({ col }: { col: ColumnaOrden }) {
    if (columnaOrden !== col) {
      return <ArrowUpDown size={12} style={{ opacity: 0.35, marginLeft: 4 }} />
    }
    return direccion === 'asc' ? (
      <ArrowUp size={12} style={{ color: 'var(--color-primary, #059669)', marginLeft: 4 }} />
    ) : (
      <ArrowDown size={12} style={{ color: 'var(--color-primary, #059669)', marginLeft: 4 }} />
    )
  }

  // Extraer las acciones y entidades únicas presentes en los resultados
  const accionesPresentes = useMemo(() => {
    const set = new Set<string>()
    for (const e of entradas) {
      if (e.accion) set.add(e.accion)
    }
    return Array.from(set)
  }, [entradas])

  const modulosPresentes = useMemo(() => {
    const set = new Set<string>()
    for (const e of entradas) {
      if (e.entidad) set.add(e.entidad)
    }
    return Array.from(set)
  }, [entradas])

  return (
    <>

      {/* Banner de alerta si hay errores o fallas detectadas */}
      {conteoErrores > 0 ? (
        <div
          style={{
            background: '#fef2f2',
            border: '1.5px solid #fecaca',
            borderRadius: 12,
            padding: '12px 18px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            boxShadow: '0 2px 8px rgba(220,38,38,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#991b1b', fontWeight: 700, fontSize: '0.88rem' }}>
            <AlertTriangle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
            <span>
              <strong>Alerta de Incidente / Fallo:</strong> Se registraron <strong>{conteoErrores}</strong> eventos de error o fallos en el sistema.
            </span>
          </div>
          <button
            type="button"
            onClick={() => { setTabAuditoria('errores'); setPagina(1); }}
            className="boton-mini"
            style={{
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.8rem',
              padding: '6px 14px',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Ver {conteoErrores} incidentes
          </button>
        </div>
      ) : null}

      {/* Pestañas de separación: Actividad del Portal vs Salas vs Errores vs Todo */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => { setTabAuditoria('portal'); setPagina(1); }}
          style={{
            padding: '9px 18px',
            borderRadius: 20,
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: tabAuditoria === 'portal' ? '#059669' : '#ffffff',
            color: tabAuditoria === 'portal' ? '#ffffff' : '#475569',
            boxShadow: tabAuditoria === 'portal' ? '0 2px 8px rgba(5,150,105,0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
            border: tabAuditoria === 'portal' ? 'none' : '1px solid #cbd5e1',
            transition: 'all 0.15s ease',
          }}
        >
          <Shield size={16} />
          Actividad del Portal
          <span style={{ background: tabAuditoria === 'portal' ? 'rgba(255,255,255,0.25)' : '#f1f5f9', padding: '2px 8px', borderRadius: 10, fontSize: '0.74rem' }}>
            {conteoPortal}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setTabAuditoria('llamadas'); setPagina(1); }}
          style={{
            padding: '9px 18px',
            borderRadius: 20,
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: tabAuditoria === 'llamadas' ? '#059669' : '#ffffff',
            color: tabAuditoria === 'llamadas' ? '#ffffff' : '#475569',
            boxShadow: tabAuditoria === 'llamadas' ? '0 2px 8px rgba(5,150,105,0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
            border: tabAuditoria === 'llamadas' ? 'none' : '1px solid #cbd5e1',
            transition: 'all 0.15s ease',
          }}
        >
          <Activity size={16} />
          Salas y Videollamadas
          <span style={{ background: tabAuditoria === 'llamadas' ? 'rgba(255,255,255,0.25)' : '#f1f5f9', padding: '2px 8px', borderRadius: 10, fontSize: '0.74rem' }}>
            {conteoLlamadas}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setTabAuditoria('errores'); setPagina(1); }}
          style={{
            padding: '9px 18px',
            borderRadius: 20,
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: tabAuditoria === 'errores' ? '#dc2626' : '#ffffff',
            color: tabAuditoria === 'errores' ? '#ffffff' : (conteoErrores > 0 ? '#dc2626' : '#475569'),
            boxShadow: tabAuditoria === 'errores' ? '0 2px 8px rgba(220,38,38,0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
            border: tabAuditoria === 'errores' ? 'none' : (conteoErrores > 0 ? '1.5px solid #fca5a5' : '1px solid #cbd5e1'),
            transition: 'all 0.15s ease',
          }}
        >
          <AlertTriangle size={16} />
          ⚠️ Errores e Incidentes
          <span style={{ background: tabAuditoria === 'errores' ? 'rgba(255,255,255,0.25)' : (conteoErrores > 0 ? '#fee2e2' : '#f1f5f9'), color: tabAuditoria === 'errores' ? '#fff' : (conteoErrores > 0 ? '#dc2626' : '#475569'), padding: '2px 8px', borderRadius: 10, fontSize: '0.74rem', fontWeight: 800 }}>
            {conteoErrores}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setTabAuditoria('todo'); setPagina(1); }}
          style={{
            padding: '9px 18px',
            borderRadius: 20,
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: tabAuditoria === 'todo' ? '#059669' : '#ffffff',
            color: tabAuditoria === 'todo' ? '#ffffff' : '#475569',
            boxShadow: tabAuditoria === 'todo' ? '0 2px 8px rgba(5,150,105,0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
            border: tabAuditoria === 'todo' ? 'none' : '1px solid #cbd5e1',
            transition: 'all 0.15s ease',
          }}
        >
          Todo el Rastro
          <span style={{ background: tabAuditoria === 'todo' ? 'rgba(255,255,255,0.25)' : '#f1f5f9', padding: '2px 8px', borderRadius: 10, fontSize: '0.74rem' }}>
            {entradas.length}
          </span>
        </button>
      </div>

      {/* Barra superior de Rango de Fechas y Filtros Rápidos */}
      <form
        onSubmit={handleAplicarFiltros}
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '16px 18px',
          marginBottom: 16,
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          {/* Controles de selector Desde / Hasta + Botón Aplicar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a', fontWeight: 800, fontSize: '0.88rem' }}>
              <Calendar size={18} style={{ color: 'var(--color-primary, #059669)' }} />
              <span>Rango de fechas:</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Desde</label>
              <input
                type="date"
                value={filtroDesde}
                onChange={(e) => setFiltroDesde(e.target.value)}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.82rem',
                  borderRadius: 8,
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#1e293b',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Hasta</label>
              <input
                type="date"
                value={filtroHasta}
                onChange={(e) => setFiltroHasta(e.target.value)}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.82rem',
                  borderRadius: 8,
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#1e293b',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            {/* Botón Principal: Aplicar Filtros */}
            <button
              type="submit"
              disabled={isPending}
              className="boton-mini"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                fontSize: '0.82rem',
                fontWeight: 800,
                background: '#059669',
                color: '#ffffff',
                border: '1.5px solid #047857',
                borderRadius: 8,
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                cursor: isPending ? 'wait' : 'pointer',
              }}
            >
              {isPending ? <Loader2 size={14} className="anim-spin" /> : <Filter size={14} />}
              <span>Aplicar filtros</span>
            </button>
          </div>

          {/* Botones de Atajos Rápidos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginRight: 2 }}>Atajos:</span>
            <button
              type="button"
              onClick={() => aplicarRangoRapido('hoy')}
              className="boton-mini"
              style={{
                fontSize: '0.76rem',
                padding: '5px 10px',
                background: filtroDesde && filtroDesde === filtroHasta ? '#ecfdf5' : '#fff',
                borderColor: filtroDesde && filtroDesde === filtroHasta ? '#059669' : '#cbd5e1',
                color: filtroDesde && filtroDesde === filtroHasta ? '#047857' : '#334155',
                fontWeight: 700,
              }}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => aplicarRangoRapido('7dias')}
              className="boton-mini"
              style={{ fontSize: '0.76rem', padding: '5px 10px', fontWeight: 600 }}
            >
              Últimos 7 días
            </button>
            <button
              type="button"
              onClick={() => aplicarRangoRapido('30dias')}
              className="boton-mini"
              style={{ fontSize: '0.76rem', padding: '5px 10px', fontWeight: 600 }}
            >
              Últimos 30 días
            </button>
            <button
              type="button"
              onClick={() => aplicarRangoRapido('esteMes')}
              className="boton-mini"
              style={{ fontSize: '0.76rem', padding: '5px 10px', fontWeight: 600 }}
            >
              Este mes
            </button>

            {hayFiltrosEnPagina && (
              <button
                type="button"
                onClick={limpiarTodosFiltros}
                className="boton-mini"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.76rem',
                  padding: '5px 10px',
                  color: '#dc2626',
                  borderColor: '#fca5a5',
                  background: '#fef2f2',
                  fontWeight: 700,
                }}
                title="Limpiar todos los filtros y rango de fechas"
              >
                <RotateCcw size={12} />
                Limpiar
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Resumen de Conteo y Tabla */}
      <div className="tabla-envoltorio">
        <table className="tabla">
          <thead>
            <tr>
              <th
                onClick={() => alternarOrden('fecha')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '22%' }}
                title="Ordenar por Cuándo (Fecha)"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Cuándo
                  <IconoOrden col="fecha" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('actor')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '24%' }}
                title="Ordenar por Quién"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Quién
                  <IconoOrden col="actor" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('accion')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '20%' }}
                title="Ordenar por Qué hizo"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Qué hizo
                  <IconoOrden col="accion" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('entidad')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '20%' }}
                title="Ordenar por Sobre"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Sobre
                  <IconoOrden col="entidad" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('ip')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '14%' }}
                title="Ordenar por IP"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  IP
                  <IconoOrden col="ip" />
                </span>
              </th>
            </tr>

            {/* Fila de filtros por columna */}
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Filtrar fecha/hora..."
                  value={filtroFecha}
                  onChange={(e) => {
                    setFiltroFecha(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Filtrar por actor/correo..."
                  value={filtroActor}
                  onChange={(e) => {
                    setFiltroActor(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroAccion}
                  onChange={(e) => {
                    setFiltroAccion(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                >
                  <option value="">Todas</option>
                  {accionesPresentes.map((acc) => (
                    <option key={acc} value={acc}>
                      {accionMap[acc] ?? acc}
                    </option>
                  ))}
                </select>
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroModulo}
                  onChange={(e) => {
                    setFiltroModulo(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                >
                  <option value="">Todos</option>
                  {modulosPresentes.map((mod) => (
                    <option key={mod} value={mod}>
                      {moduloLabelMap.get(mod) ?? mod}
                    </option>
                  ))}
                </select>
              </th>
              <th style={{ padding: '6px 6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="text"
                    placeholder="Filtrar IP..."
                    value={filtroIp}
                    onChange={(e) => {
                      setFiltroIp(e.target.value)
                      setPagina(1)
                    }}
                    style={estiloInputFiltro}
                  />
                  {hayFiltrosEnPagina ? (
                    <button
                      type="button"
                      onClick={limpiarTodosFiltros}
                      className="boton-mini"
                      style={{ padding: '4px 6px', color: 'var(--color-red, #dc2626)' }}
                      title="Limpiar filtros"
                    >
                      <X size={13} />
                    </button>
                  ) : null}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {listaPaginada.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>
                  <Vacio>
                    {hayFiltrosEnPagina
                      ? 'Ningún registro coincide con el rango de fechas o los filtros aplicados.'
                      : 'No hay registros de auditoría disponibles.'}
                  </Vacio>
                </td>
              </tr>
            ) : (
              listaPaginada.map((e) => (
                <tr key={e.id} style={{ background: esError(e) ? '#fff7f7' : undefined }}>
                  <td className="tabla__numero">{enBogota(e.fecha)}</td>
                  <td>
                    {e.actor ?? (
                      <span className="tabla__secundario">
                        {['acceder', 'acceso_fallido', 'salir'].includes(e.accion)
                          ? 'sin cuenta'
                          : 'el sistema'}
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {esError(e) ? (
                          <span style={{ color: '#dc2626', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <AlertTriangle size={14} />
                            {accionMap[e.accion] ?? e.accion}
                          </span>
                        ) : e.accion === 'finalizar_sala' ? (
                          <span style={{ color: '#0369a1', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={14} />
                            {accionMap[e.accion] ?? e.accion}
                          </span>
                        ) : e.accion === 'ingresar_sala' ? (
                          <span style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Activity size={14} />
                            {accionMap[e.accion] ?? e.accion}
                          </span>
                        ) : (
                          <span>{accionMap[e.accion] ?? e.accion}</span>
                        )}
                      </div>

                      {/* Chip de Telemetría: Duración efectiva en sesión */}
                      {e.despues?.duracionTexto || e.despues?.duracionMinutos !== undefined ? (
                        <div style={{ fontSize: '0.76rem', color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4, width: 'fit-content', fontWeight: 700 }}>
                          ⏱️ Duración: {e.despues.duracionTexto || `${e.despues.duracionMinutos} min`}
                        </div>
                      ) : null}

                      {/* Diagnóstico detallado del error o fallo */}
                      {esError(e) ? renderizarDiagnosticoError(e) : null}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div>
                        {moduloLabelMap.get(e.entidad) ?? e.entidad}
                        {e.entidadId ? (
                          <span className="tabla__secundario"> {e.entidadId.slice(0, 8)}…</span>
                        ) : null}
                      </div>
                      {e.despues?.paciente || e.despues?.profesional ? (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {e.despues.paciente ? `👤 ${e.despues.paciente}` : ''}
                          {e.despues.paciente && e.despues.profesional ? ' · ' : ''}
                          {e.despues.profesional ? `🩺 ${e.despues.profesional}` : ''}
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="tabla__secundario">{e.ip ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Componente de Paginación */}
      <PaginacionTabla
        pagina={paginaAjustada}
        porPagina={porPagina}
        totalFiltrado={listaOrdenada.length}
        totalGeneral={entradas.length}
        alCambiarPagina={(p) => {
          setPagina(p)
          window.scrollTo({ top: 120, behavior: 'smooth' })
        }}
        alCambiarPorPagina={(n) => {
          setPorPagina(n)
          setPagina(1)
        }}
      />
    </>
  )
}
