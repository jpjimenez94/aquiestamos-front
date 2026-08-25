'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { ArrowUpDown, ArrowUp, ArrowDown, X, RotateCcw } from 'lucide-react'
import { Etiqueta, Vacio } from '../componentes'
import { PaginacionTabla } from '../PaginacionTabla'
import { BotonVerificarTarjeta } from '@/components/portal/BotonVerificarTarjeta'
import { BotonPedirDocumentosEmail } from '@/components/portal/BotonPedirDocumentosEmail'
import { BotonEliminarPostulacion } from './BotonEliminarPostulacion'
import { nombrePropio } from '@/lib/nombre'
import { enBogota } from '@/lib/fechas'

export type Postulacion = {
  enlaceDocumentos?: string | null
  id: string
  fullName: string
  email: string
  phone: string
  city: string | null
  profession: string | null
  yearsExperience: string | null
  populations: string[]
  modality: string
  availableDays: string[]
  status: string
  createdAt: string
  professionalId?: string | null
  professionalCardVerified?: boolean
  professionalCardNumber?: string | null
  professionalCardDocumentUrl?: string | null
}

const EXPERIENCIA: Record<string, string> = {
  MENOS_DE_1: '< 1 año',
  ENTRE_1_Y_3: '1–3 años',
  ENTRE_3_Y_5: '3–5 años',
  MAS_DE_5: '+5 años',
}

type ColumnaOrden =
  | 'profesional'
  | 'profesion'
  | 'experiencia'
  | 'modalidad'
  | 'fecha'
  | 'tarjeta'
  | 'estado'

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

export function TablaPostulaciones({
  postulaciones: listaInicial,
  veProfesionales = false,
  editaProfesionales = false,
  eliminaPostulaciones = false,
}: {
  postulaciones: Postulacion[]
  veProfesionales?: boolean
  editaProfesionales?: boolean
  eliminaPostulaciones?: boolean
}) {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>(listaInicial)

  useEffect(() => {
    setPostulaciones(listaInicial)
  }, [listaInicial])

  function alEliminar(id: string) {
    setPostulaciones((prev) => prev.filter((item) => item.id !== id))
  }

  const [filtroProfesional, setFiltroProfesional] = useState('')
  const [filtroProfesion, setFiltroProfesion] = useState('')
  const [filtroExperiencia, setFiltroExperiencia] = useState('')
  const [filtroModalidad, setFiltroModalidad] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroTarjeta, setFiltroTarjeta] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  const [columnaOrden, setColumnaOrden] = useState<ColumnaOrden>('fecha')
  const [direccion, setDireccion] = useState<Direccion>('desc')

  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(25)

  function alternarOrden(col: ColumnaOrden) {
    if (columnaOrden === col) {
      setDireccion(direccion === 'asc' ? 'desc' : 'asc')
    } else {
      setColumnaOrden(col)
      setDireccion(col === 'fecha' ? 'desc' : 'asc')
    }
  }

  const hayFiltros = Boolean(
    filtroProfesional.trim() ||
      filtroProfesion.trim() ||
      filtroExperiencia ||
      filtroModalidad ||
      filtroFecha.trim() ||
      filtroTarjeta ||
      filtroEstado,
  )

  function limpiarFiltros() {
    setFiltroProfesional('')
    setFiltroProfesion('')
    setFiltroExperiencia('')
    setFiltroModalidad('')
    setFiltroFecha('')
    setFiltroTarjeta('')
    setFiltroEstado('')
    setPagina(1)
  }

  const listaFiltrada = useMemo(() => {
    return postulaciones.filter((p) => {
      if (filtroProfesional.trim()) {
        const q = filtroProfesional.toLowerCase().trim()
        const matchNombre = p.fullName.toLowerCase().includes(q)
        const matchCiudad = (p.city || '').toLowerCase().includes(q)
        const matchTelefono = p.phone?.includes(q)
        const matchEmail = p.email?.toLowerCase().includes(q)
        if (!matchNombre && !matchCiudad && !matchTelefono && !matchEmail) return false
      }

      if (filtroProfesion.trim()) {
        const q = filtroProfesion.toLowerCase().trim()
        const matchProf = (p.profession || '').toLowerCase().includes(q)
        const matchPob = p.populations?.some((pop) => pop.toLowerCase().includes(q))
        if (!matchProf && !matchPob) return false
      }

      if (filtroExperiencia && p.yearsExperience !== filtroExperiencia) {
        return false
      }

      if (filtroModalidad && p.modality !== filtroModalidad) {
        return false
      }

      if (filtroFecha.trim()) {
        const q = filtroFecha.toLowerCase().trim()
        if (!enBogota(p.createdAt, false).toLowerCase().includes(q)) return false
      }

      if (filtroTarjeta) {
        if (filtroTarjeta === 'VERIFICADA' && !p.professionalCardVerified) return false
        if (filtroTarjeta === 'SIN_VERIFICAR' && p.professionalCardVerified) return false
      }

      if (filtroEstado && p.status !== filtroEstado) {
        return false
      }

      return true
    })
  }, [
    postulaciones,
    filtroProfesional,
    filtroProfesion,
    filtroExperiencia,
    filtroModalidad,
    filtroFecha,
    filtroTarjeta,
    filtroEstado,
  ])

  const listaOrdenada = useMemo(() => {
    return [...listaFiltrada].sort((a, b) => {
      let cmp = 0
      switch (columnaOrden) {
        case 'profesional':
          cmp = a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' })
          break
        case 'profesion':
          cmp = (a.profession || '').localeCompare(b.profession || '', 'es', { sensitivity: 'base' })
          break
        case 'experiencia':
          cmp = (a.yearsExperience || '').localeCompare(b.yearsExperience || '', 'es', { sensitivity: 'base' })
          break
        case 'modalidad':
          cmp = a.modality.localeCompare(b.modality, 'es', { sensitivity: 'base' })
          break
        case 'fecha': {
          const tA = new Date(a.createdAt).getTime()
          const tB = new Date(b.createdAt).getTime()
          cmp = tA - tB
          break
        }
        case 'tarjeta': {
          const verA = a.professionalCardVerified ? 1 : 0
          const verB = b.professionalCardVerified ? 1 : 0
          cmp = verA - verB
          break
        }
        case 'estado':
          cmp = a.status.localeCompare(b.status, 'es', { sensitivity: 'base' })
          break
      }
      return direccion === 'asc' ? cmp : -cmp
    })
  }, [listaFiltrada, columnaOrden, direccion])

  const totalFiltradas = listaOrdenada.length
  const totalPaginas = Math.max(1, Math.ceil(totalFiltradas / porPagina))
  const paginaAjustada = Math.min(pagina, totalPaginas)
  const listaPaginada = useMemo(() => {
    const start = (paginaAjustada - 1) * porPagina
    return listaOrdenada.slice(start, start + porPagina)
  }, [listaOrdenada, paginaAjustada, porPagina])

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

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p className="panel__nota" style={{ margin: 0, fontSize: '0.82rem' }}>
          <strong>{listaOrdenada.length}</strong> {listaOrdenada.length === 1 ? 'postulación' : 'postulaciones'}
          {hayFiltros ? ` (filtrado de ${postulaciones.length} en total)` : ''}
        </p>

        {hayFiltros ? (
          <button
            type="button"
            className="boton-mini"
            onClick={limpiarFiltros}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.76rem' }}
          >
            <RotateCcw size={12} />
            Restablecer filtros
          </button>
        ) : null}
      </div>

      <div className="tabla-envoltorio">
        <table className="tabla">
          <thead>
            <tr>
              <th
                onClick={() => alternarOrden('profesional')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '22%' }}
                title="Ordenar por Profesional"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Profesional
                  <IconoOrden col="profesional" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('profesion')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '18%' }}
                title="Ordenar por Profesión"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Profesión
                  <IconoOrden col="profesion" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('experiencia')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '12%' }}
                title="Ordenar por Experiencia"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Experiencia
                  <IconoOrden col="experiencia" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('modalidad')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '12%' }}
                title="Ordenar por Modalidad"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Modalidad
                  <IconoOrden col="modalidad" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('fecha')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '10%' }}
                title="Ordenar por Fecha Recibida"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Recibida
                  <IconoOrden col="fecha" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('tarjeta')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '14%' }}
                title="Ordenar por Tarjeta Profesional"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Tarjeta Profesional
                  <IconoOrden col="tarjeta" />
                </span>
              </th>
              <th
                onClick={() => alternarOrden('estado')}
                style={{ cursor: 'pointer', userSelect: 'none', width: '9%' }}
                title="Ordenar por Estado"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Estado
                  <IconoOrden col="estado" />
                </span>
              </th>
              <th style={{ width: '8%', textAlign: 'right' }}>Acciones</th>
            </tr>

            {/* Fila de filtros por columna */}
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Nombre, ciudad..."
                  value={filtroProfesional}
                  onChange={(e) => {
                    setFiltroProfesional(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Profesión, población..."
                  value={filtroProfesion}
                  onChange={(e) => {
                    setFiltroProfesion(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroExperiencia}
                  onChange={(e) => {
                    setFiltroExperiencia(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                >
                  <option value="">Todas</option>
                  <option value="MENOS_DE_1">&lt; 1 año</option>
                  <option value="ENTRE_1_Y_3">1–3 años</option>
                  <option value="ENTRE_3_Y_5">3–5 años</option>
                  <option value="MAS_DE_5">+5 años</option>
                </select>
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroModalidad}
                  onChange={(e) => {
                    setFiltroModalidad(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                >
                  <option value="">Todas</option>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="VIRTUAL">Virtual</option>
                  <option value="AMBAS">Ambas</option>
                </select>
              </th>
              <th style={{ padding: '6px 6px' }}>
                <input
                  type="text"
                  placeholder="Fecha..."
                  value={filtroFecha}
                  onChange={(e) => {
                    setFiltroFecha(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                />
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroTarjeta}
                  onChange={(e) => {
                    setFiltroTarjeta(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                >
                  <option value="">Todas</option>
                  <option value="VERIFICADA">Verificada</option>
                  <option value="SIN_VERIFICAR">Sin verificar</option>
                </select>
              </th>
              <th style={{ padding: '6px 6px' }}>
                <select
                  value={filtroEstado}
                  onChange={(e) => {
                    setFiltroEstado(e.target.value)
                    setPagina(1)
                  }}
                  style={estiloInputFiltro}
                >
                  <option value="">Todos</option>
                  <option value="NUEVO">Nuevo</option>
                  <option value="APROBADO">Aprobado</option>
                  <option value="RECHAZADO">Rechazado</option>
                </select>
              </th>
              <th style={{ padding: '6px 6px', textAlign: 'right' }}>
                {hayFiltros ? (
                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="boton-mini"
                    style={{ padding: '4px 6px', color: 'var(--color-red, #dc2626)' }}
                    title="Limpiar filtros"
                  >
                    <X size={13} />
                  </button>
                ) : null}
              </th>
            </tr>
          </thead>
          <tbody>
            {listaPaginada.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 24 }}>
                  <Vacio>
                    {hayFiltros
                      ? 'Ninguna postulación coincide con los filtros de columna aplicados.'
                      : 'Todavía no se ha postulado nadie.'}
                  </Vacio>
                </td>
              </tr>
            ) : (
              listaPaginada.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="tabla__principal">{nombrePropio(p.fullName)}</span>
                    <span className="tabla__secundario">
                      {p.city ?? 'Sin ciudad'} · {p.phone}
                    </span>
                  </td>
                  <td>
                    {p.profession ?? '—'}
                    <span className="tabla__secundario">
                      {p.populations?.slice(0, 3).join(', ')}
                      {p.populations?.length > 3 ? '…' : ''}
                    </span>
                  </td>
                  <td>{EXPERIENCIA[p.yearsExperience ?? ''] ?? '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{p.modality.toLowerCase()}</td>
                  <td className="tabla__numero">{enBogota(p.createdAt, false)}</td>
                  <td>
                    {p.professionalId && editaProfesionales ? (
                      <BotonVerificarTarjeta
                        profesionalId={p.professionalId}
                        profesionalNombre={p.fullName}
                        profesionalTelefono={p.phone}
                        profesionalEmail={p.email}
                        verificada={p.professionalCardVerified}
                        numero={p.professionalCardNumber}
                        documentoUrl={p.professionalCardDocumentUrl}
                        enlaceDocumentos={p.enlaceDocumentos ?? null}
                      />
                    ) : (
                      <span className="tabla__secundario" style={{ fontSize: '0.78rem' }}>
                        —
                      </span>
                    )}
                  </td>
                  <td>
                    <Etiqueta estado={p.status} />
                  </td>
                  <td className="tabla__acciones" style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                    {!p.professionalCardVerified && p.professionalId && editaProfesionales ? (
                      <BotonPedirDocumentosEmail
                        profesionalId={p.professionalId}
                        profesionalEmail={p.email}
                        profesionalNombre={p.fullName}
                        enlaceDocumentos={p.enlaceDocumentos}
                        texto="Enviar correo"
                      />
                    ) : null}
                    {p.professionalId && veProfesionales ? (
                      <Link className="boton-mini" href={`/portal/profesionales/${p.professionalId}`}>
                        Ver ficha
                      </Link>
                    ) : null}
                    {eliminaPostulaciones ? (
                      <BotonEliminarPostulacion
                        postulacionId={p.id}
                        nombreProfesional={p.fullName}
                        onEliminada={alEliminar}
                      />
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginacionTabla
        pagina={paginaAjustada}
        porPagina={porPagina}
        totalFiltrado={totalFiltradas}
        totalGeneral={postulaciones.length}
        alCambiarPagina={setPagina}
        alCambiarPorPagina={(n) => {
          setPorPagina(n)
          setPagina(1)
        }}
      />
    </>
  )
}
