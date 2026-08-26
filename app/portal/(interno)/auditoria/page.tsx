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
  ingresar_sala: 'Ingresó a sala virtual',
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
  { value: 'sesion_virtual', label: 'Sesiones y salas virtuales' },
  { value: 'ReporteDeCaso', label: 'Reportes del profesional' },
  { value: 'CasoCompartido', label: 'Acceso al caso (enlace)' },
  { value: 'profesional', label: 'Profesionales' },
  { value: 'profesional_tarjeta', label: 'Tarjetas profesionales' },
  { value: 'postulacion', label: 'Postulaciones' },
  { value: 'colaborador', label: 'Voluntariado de apoyo' },
  { value: 'task', label: 'Tareas de apoyo' },
  { value: 'task_assignment', label: 'Asignaciones de tareas' },
  { value: 'disponibilidad', label: 'Disponibilidad' },
  { value: 'bloqueo', label: 'Bloqueos de agenda' },
  { value: 'documento', label: 'Documentos' },
  { value: 'usuario', label: 'Cuentas' },
  { value: 'leader', label: 'Líderes comunitarios' },
]

type Filtros = {
  q?: string
  accion?: string
  modulo?: string
  rol?: string
  desde?: string
  hasta?: string
  sistema?: string
}

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<Filtros>
}) {
  const f = await searchParams

  const p = new URLSearchParams()
  if (f.q) p.set('q', f.q)
  if (f.accion) p.set('action', f.accion)
  if (f.modulo) p.set('entity', f.modulo)
  if (f.rol) p.set('rol', f.rol)
  if (f.desde) p.set('desde', f.desde)
  if (f.hasta) p.set('hasta', f.hasta)
  if (f.sistema) p.set('sistema', '1')
  p.set('perPage', '1000')

  const respuesta = await portalFetch<Entrada[]>(`/audit?${p.toString()}`)
  const entradas = respuesta.data ?? []

  return (
    <>
      <Cabecera
        titulo="Auditoría"
        descripcion="Rastro completo de actividad y accesos. Consulta por rango de fechas, filtra por usuario o módulo y navega con paginación interactiva."
      />

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar la auditoría.'}</Vacio>
      ) : entradas.length === 0 ? (
        <Vacio>
          {f.desde || f.hasta
            ? 'No hay registros de auditoría para el rango de fechas seleccionado.'
            : 'Todavía no hay registros de auditoría.'}
        </Vacio>
      ) : (
        <TablaAuditoria
          entradas={entradas}
          modulos={MODULOS}
          accionMap={ACCION}
          desdeInicial={f.desde ?? ''}
          hastaInicial={f.hasta ?? ''}
        />
      )}
    </>
  )
}
