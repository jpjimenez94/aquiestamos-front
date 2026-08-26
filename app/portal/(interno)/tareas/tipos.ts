
export type TareaStatus = 'BORRADOR' | 'ABIERTA' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA'
export type TareaPriority = 'BAJA' | 'MEDIA' | 'ALTA'
export type AsignacionStatus =
  | 'INVITADO'
  | 'ACEPTADO'
  | 'RECHAZADO'
  | 'EN_PROGRESO'
  | 'COMPLETADO'
  | 'NO_RESPONDIO'

export type ColaboradorResumen = {
  id: string
  fullName: string
  phone: string
  email: string
  area: string
  areaLegible: string
  discipline: string
  availableDays: string[]
  availableSlots: string[]
}

export type Asignacion = {
  id: string
  status: AsignacionStatus
  note: string | null
  confirmToken?: string
  respondedAt: string | null
  declineReason: string | null
  completionUrl?: string | null
  completionNote?: string | null
  createdAt: string
  collaborator?: ColaboradorResumen
}

export type Tarea = {
  id: string
  area: string
  areaLegible: string
  title: string
  description: string | null
  dueDate: string | null
  startTime: string | null
  endTime: string | null
  materialsUrl: string | null
  priority: TareaPriority
  priorityLegible: string
  status: TareaStatus
  statusLegible: string
  notes: string | null
  createdByEmail: string | null
  totalAssignments: number
  assignments?: Asignacion[]
  createdAt: string
  updatedAt: string
}

export const STATUS_TAREA_COLOR: Record<TareaStatus, { bg: string; color: string; border: string }> = {
  BORRADOR: { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
  ABIERTA: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  EN_PROGRESO: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  COMPLETADA: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  CANCELADA: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
}

export const STATUS_ASIGNACION_COLOR: Record<AsignacionStatus, { bg: string; color: string }> = {
  INVITADO: { bg: '#f1f5f9', color: '#475569' },
  ACEPTADO: { bg: '#f0fdf4', color: '#16a34a' },
  RECHAZADO: { bg: '#fef2f2', color: '#dc2626' },
  EN_PROGRESO: { bg: '#fffbeb', color: '#d97706' },
  COMPLETADO: { bg: '#ecfdf5', color: '#059669' },
  NO_RESPONDIO: { bg: '#f8fafc', color: '#94a3b8' },
}

export const PRIORITY_COLOR: Record<TareaPriority, { bg: string; color: string }> = {
  ALTA: { bg: '#fef2f2', color: '#dc2626' },
  MEDIA: { bg: '#fffbeb', color: '#d97706' },
  BAJA: { bg: '#f0fdf4', color: '#16a34a' },
}

export const AREA_ICONS: Record<string, string> = {
  SALUD: '🩺',
  SOCIAL_LEGAL_EDUCATIVO: '⚖️',
  OPERACION_LOGISTICA: '📦',
  COMUNICACION_TECNOLOGIA: '💻',
  GESTION_PROYECTOS: '📊',
  OTRA: '✨',
}

export const DIA_LEGIBLE: Record<string, string> = {
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves', VIERNES: 'Viernes', SABADO: 'Sábado', DOMINGO: 'Domingo',
}

export const FRANJA_LEGIBLE: Record<string, string> = {
  MANANA: 'Mañana (8am-12pm)', TARDE: 'Tarde (2pm-6pm)', NOCHE: 'Noche (6pm-9pm)',
}

export const STATUS_ASIGNACION_TEXTO: Record<AsignacionStatus, string> = {
  INVITADO: 'Invitado (pendiente respuesta)',
  ACEPTADO: 'Aceptó apoyar',
  RECHAZADO: 'No puede / Rechazó',
  EN_PROGRESO: 'En progreso',
  COMPLETADO: 'Completado',
  NO_RESPONDIO: 'Sin respuesta',
}

export const STATUS_TAREA_OPCIONES: { value: TareaStatus; label: string }[] = [
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'ABIERTA', label: 'Abierta' },
  { value: 'EN_PROGRESO', label: 'En progreso' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'CANCELADA', label: 'Cancelada' },
]

export const DIA_SEMANA_MAP: Record<number, string> = {
  0: 'DOMINGO',
  1: 'LUNES',
  2: 'MARTES',
  3: 'MIERCOLES',
  4: 'JUEVES',
  5: 'VIERNES',
  6: 'SABADO',
}
