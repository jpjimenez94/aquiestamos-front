import Link from 'next/link'
import { portalFetch, enBogota } from '@/lib/portal'
import { Cabecera, Vacio } from '../componentes'

export const metadata = { title: 'Auditoría' }

type Entrada = {
  id: string
  actor: string | null
  accion: string
  entidad: string
  entidadId: string | null
  fecha: string
  ip: string | null
}

const ACCION: Record<string, string> = {
  acceder: 'Entró al portal',
  acceso_fallido: 'Intento fallido',
  salir: 'Cerró sesión',
  consultar: 'Consultó',
  crear: 'Creó',
  editar: 'Editó',
  borrar: 'Dio de baja',
  cambiar_clave: 'Cambió la clave',
}

/**
 * Los módulos tal como se registran en el rastro. Los valores tienen que ser
 * EXACTOS (mayúsculas incluidas): son los que el backend escribió.
 */
const MODULOS: { value: string; label: string }[] = [
  { value: 'paciente', label: 'Personas acompañadas' },
  { value: 'solicitud', label: 'Solicitudes' },
  { value: 'Tamizaje', label: 'Tamizaje' },
  { value: 'asignacion', label: 'Asignaciones' },
  { value: 'cita', label: 'Citas' },
  { value: 'cita_consentimiento', label: 'Consentimientos' },
  { value: 'ReporteDeCaso', label: 'Reportes del profesional' },
  { value: 'CasoCompartido', label: 'Acceso al caso (enlace)' },
  { value: 'profesional', label: 'Profesionales' },
  { value: 'profesional_tarjeta', label: 'Tarjetas profesionales' },
  { value: 'postulacion', label: 'Postulaciones' },
  { value: 'colaborador', label: 'Voluntariado de apoyo' },
  { value: 'disponibilidad', label: 'Disponibilidad' },
  { value: 'bloqueo', label: 'Bloqueos de agenda' },
  { value: 'documento', label: 'Documentos' },
  { value: 'usuario', label: 'Cuentas' },
]

const ROLES: { value: string; label: string }[] = [
  { value: 'ADMIN', label: 'Administración' },
  { value: 'AGENDADOR', label: 'Agenda' },
  { value: 'PROFESIONAL', label: 'Profesional' },
  { value: 'LECTURA', label: 'Solo lectura' },
]

const POR_PAGINA = 50

type Filtros = {
  q?: string
  accion?: string
  modulo?: string
  rol?: string
  desde?: string
  hasta?: string
  sistema?: string
  page?: string
}

/** El querystring del portal → el querystring del backend. */
function consulta(f: Filtros, page: number) {
  const p = new URLSearchParams()
  if (f.q) p.set('q', f.q)
  if (f.accion) p.set('action', f.accion)
  if (f.modulo) p.set('entity', f.modulo)
  if (f.rol) p.set('rol', f.rol)
  if (f.desde) p.set('desde', f.desde)
  if (f.hasta) p.set('hasta', f.hasta)
  if (f.sistema) p.set('sistema', '1')
  p.set('page', String(page))
  p.set('perPage', String(POR_PAGINA))
  return p.toString()
}

/** El enlace a otra página conservando los filtros puestos. */
function enlaceDePagina(f: Filtros, page: number) {
  const p = new URLSearchParams()
  for (const clave of ['q', 'accion', 'modulo', 'rol', 'desde', 'hasta', 'sistema'] as const) {
    if (f[clave]) p.set(clave, String(f[clave]))
  }
  if (page > 1) p.set('page', String(page))
  const qs = p.toString()
  return qs ? `/portal/auditoria?${qs}` : '/portal/auditoria'
}

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<Filtros>
}) {
  const f = await searchParams
  const page = Math.max(1, Number(f.page ?? 1))

  const respuesta = await portalFetch<Entrada[]>(`/audit?${consulta(f, page)}`)
  const entradas = respuesta.data ?? []
  const total = Number((respuesta.meta as { total?: number } | undefined)?.total ?? entradas.length)
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA))
  const hayFiltros = Boolean(
    f.q || f.accion || f.modulo || f.rol || f.desde || f.hasta || f.sistema,
  )

  return (
    <>
      <Cabecera
        titulo="Auditoría"
        descripcion="Quién hizo qué y cuándo. Con datos de salud también se registra quién consulta, no solo quién edita."
      />

      <form className="filtros" method="GET" action="/portal/auditoria" style={{ marginBottom: 18 }}>
        <div className="filtros__grupo">
          <input
            className="input"
            type="text"
            name="q"
            defaultValue={f.q || ''}
            placeholder="Buscar por correo, id o IP…"
            style={{ minWidth: 220 }}
          />
          <select className="input" name="modulo" defaultValue={f.modulo || ''}>
            <option value="">Todos los módulos</option>
            {MODULOS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select className="input" name="accion" defaultValue={f.accion || ''}>
            <option value="">Todas las acciones</option>
            {Object.entries(ACCION).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select className="input" name="rol" defaultValue={f.rol || ''}>
            <option value="">Todos los roles</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filtros__grupo" style={{ marginTop: 8 }}>
          <label className="filtros__campo">
            <span>Desde</span>
            <input className="input" type="date" name="desde" defaultValue={f.desde || ''} />
          </label>
          <label className="filtros__campo">
            <span>Hasta</span>
            <input className="input" type="date" name="hasta" defaultValue={f.hasta || ''} />
          </label>
          <label
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
          >
            <input type="checkbox" name="sistema" value="1" defaultChecked={f.sistema === '1'} />
            Solo el sistema y accesos sin cuenta
          </label>
          <button className="boton-mini" type="submit">
            Filtrar
          </button>
          {hayFiltros ? (
            <Link className="boton-mini" href="/portal/auditoria">
              Limpiar
            </Link>
          ) : null}
        </div>
      </form>

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar la auditoría.'}</Vacio>
      ) : entradas.length === 0 ? (
        <Vacio>
          {hayFiltros
            ? 'Nada coincide con esos filtros. Prueba quitando alguno.'
            : 'Todavía no hay registros.'}
        </Vacio>
      ) : (
        <>
          <p className="panel__nota" style={{ margin: '0 0 8px' }}>
            {total} {total === 1 ? 'registro' : 'registros'}
            {hayFiltros ? ' con estos filtros' : ''} · página {page} de {paginas}
          </p>
          <div className="tabla-envoltorio">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Cuándo</th>
                  <th>Quién</th>
                  <th>Qué hizo</th>
                  <th>Sobre</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {entradas.map((e) => (
                  <tr key={e.id}>
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
                    <td>{ACCION[e.accion] ?? e.accion}</td>
                    <td>
                      {MODULOS.find((m) => m.value === e.entidad)?.label ?? e.entidad}
                      {e.entidadId ? (
                        <span className="tabla__secundario">{e.entidadId.slice(0, 8)}…</span>
                      ) : null}
                    </td>
                    <td className="tabla__secundario">{e.ip ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginas > 1 ? (
            <div className="paginacion" style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              {page > 1 ? (
                <Link className="boton-mini" href={enlaceDePagina(f, page - 1)}>
                  ← Más recientes
                </Link>
              ) : null}
              {page < paginas ? (
                <Link className="boton-mini" href={enlaceDePagina(f, page + 1)}>
                  Más antiguos →
                </Link>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </>
  )
}
