import Link from 'next/link'
import { portalFetch } from '@/lib/portal'
import { Cabecera, Vacio } from '../componentes'
import { TablaAuditoria, type EntradaAuditoria } from './TablaAuditoria'

export const metadata = { title: 'Auditoría' }

type Entrada = EntradaAuditoria

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

  return (
    <>
      <Cabecera
        titulo="Auditoría"
        descripcion="Quién hizo qué y cuándo. Con datos de salud también se registra quién consulta, no solo quién edita."
      />

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar la auditoría.'}</Vacio>
      ) : entradas.length === 0 ? (
        <Vacio>
          {page > 1 ? 'Esta página ya no tiene registros.' : 'Todavía no hay registros de auditoría.'}
        </Vacio>
      ) : (
        <>
          <TablaAuditoria entradas={entradas} modulos={MODULOS} accionMap={ACCION} />

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
