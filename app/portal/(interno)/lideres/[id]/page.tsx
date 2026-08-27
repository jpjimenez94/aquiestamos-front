import Link from 'next/link'
import { notFound } from 'next/navigation'
import { portalFetch, usuarioActual, puede, enBogota, esAdministrador } from '@/lib/portal'
import { Cabecera, Dato, Etiqueta, Vacio } from '../../componentes'
import { BotonAccionesLider } from './BotonAccionesLider'
import {
  MapPin,
  Phone,
  Mail,
  Users,
  Calendar,
  Sparkles,
  HeartHandshake,
  Package,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import type { CategoriaNecesidad, LiderData } from '../ModalLider'

type LeaderDetail = {
  id: string
  name: string
  phone: string
  email?: string | null
  territory: string
  beneficiariesCount: number
  status: 'ACTIVO' | 'EN_SEGUIMIENTO' | 'ATENDIDO' | 'INACTIVO'
  estadoLegible: string
  lastContactAt?: string | null
  nextAction?: string | null
  nextActionDate?: string | null
  notes?: string | null
  tienePsicologicas: boolean
  tieneRecursos: boolean
  needs: {
    id: string
    name: string
    type: 'PSICOLOGICA' | 'RECURSO'
    tipoLegible: string
    details?: string | null
    status: string
  }[]
  contacts: {
    id: string
    contactedAt: string
    contactedBy: string
    notes: string
    nextActionDefined?: string | null
    createdAt: string
  }[]
  createdBy?: { id: string; name: string; email: string } | null
  createdAt: string
  updatedAt: string
}

export default async function LeaderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const usuario = await usuarioActual()
  if (!usuario || !puede(usuario, 'lideres:leer')) {
    notFound()
  }

  const { id } = await params

  const [resLider, resCatalogo] = await Promise.all([
    portalFetch<LeaderDetail>(`/leaders/${id}`),
    portalFetch<CategoriaNecesidad[]>('/needs-catalog'),
  ])

  if (!resLider.success || !resLider.data) {
    notFound()
  }

  const lider = resLider.data
  const catalogo = resCatalogo.data || []

  const psicologicas = lider.needs.filter((n) => n.type === 'PSICOLOGICA')
  const recursos = lider.needs.filter((n) => n.type === 'RECURSO')

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <Link
          href="/portal/lideres"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.85rem',
            color: '#64748b',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={15} /> Volver al Centro de Mando de Líderes
        </Link>
      </div>

      <Cabecera
        titulo={lider.name}
        descripcion={`Líder comunitario en ${lider.territory}`}
        acciones={
          <BotonAccionesLider
            lider={lider as unknown as LiderData}
            catalogoNecesidades={catalogo}
            esAdmin={esAdministrador(usuario)}
          />
        }
      />

      {/* Grid de 2 Columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Columna Izquierda: Información de la Comunidad */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Tarjeta de Resumen y Contacto */}
          <div className="panel">
            <h2 style={{ fontSize: '1.05rem', margin: '0 0 14px' }}>Datos de la Comunidad</h2>
            <div className="lista-datos">
              <Dato etiqueta="Territorio / Comunidad">{lider.territory}</Dato>
              <Dato etiqueta="Teléfono de contacto">{lider.phone}</Dato>
              {lider.email ? <Dato etiqueta="Correo electrónico">{lider.email}</Dato> : null}
              <Dato etiqueta="Personas impactadas (aprox.)">
                {lider.beneficiariesCount} beneficiarios estimados
              </Dato>
              <Dato etiqueta="Estado actual">
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: lider.status === 'ACTIVO' ? '#ecfdf5' : '#eff6ff',
                    color: lider.status === 'ACTIVO' ? '#065f46' : '#1e40af',
                  }}
                >
                  {lider.estadoLegible}
                </span>
              </Dato>
              <Dato etiqueta="Registrado el">{enBogota(lider.createdAt)}</Dato>
            </div>

            {lider.notes && (
              <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: 4 }}>
                  Notas y Contexto del Territorio:
                </strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.5 }}>
                  {lider.notes}
                </p>
              </div>
            )}
          </div>

          {/* Tarjeta de Próxima Acción */}
          <div
            className="panel"
            style={{
              background: lider.nextAction ? '#fffbeb' : '#ffffff',
              borderColor: lider.nextAction ? '#fef3c7' : '#e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Clock size={16} color="#d97706" />
              <h2 style={{ fontSize: '1.02rem', margin: 0, color: '#92400e' }}>
                Próxima Acción Pendiente
              </h2>
            </div>

            {lider.nextAction ? (
              <div>
                <p style={{ margin: '0 0 6px', fontSize: '0.92rem', fontWeight: 600, color: '#78350f' }}>
                  {lider.nextAction}
                </p>
                {lider.nextActionDate && (
                  <span style={{ fontSize: '0.78rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={13} /> Programada para: {enBogota(lider.nextActionDate)}
                  </span>
                )}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                No hay ninguna acción pendiente programada actualmente.
              </p>
            )}
          </div>

          {/* Clasificación de Necesidades */}
          <div className="panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Sparkles size={16} color="#059669" />
              <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Necesidades Clasificadas</h2>
            </div>

            {/* Psicológicas */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <HeartHandshake size={14} color="#059669" />
                <strong style={{ fontSize: '0.82rem', color: '#065f46', textTransform: 'uppercase' }}>
                  Necesidades Psicológicas ({psicologicas.length})
                </strong>
              </div>
              {psicologicas.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Sin requerimientos psicológicos reportados.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {psicologicas.map((n) => (
                    <span
                      key={n.id}
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: 14,
                        background: '#ecfdf5',
                        color: '#065f46',
                        border: '1px solid #a7f3d0',
                      }}
                    >
                      ✓ {n.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Recursos */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Package size={14} color="#0284c7" />
                <strong style={{ fontSize: '0.82rem', color: '#0369a1', textTransform: 'uppercase' }}>
                  Necesidades de Recursos / Insumos ({recursos.length})
                </strong>
              </div>
              {recursos.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Sin requerimientos de insumos o recursos reportados.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {recursos.map((n) => (
                    <span
                      key={n.id}
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: 14,
                        background: '#f0f9ff',
                        color: '#0369a1',
                        border: '1px solid #bae6fd',
                      }}
                    >
                      ✓ {n.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Bitácora de Seguimiento */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="panel">
            <h2 style={{ fontSize: '1.05rem', margin: '0 0 4px' }}>
              Bitácora de Contacto y Seguimiento
            </h2>
            <p className="panel__nota">
              Historial cronológico de llamadas, visitas y acuerdos con el líder comunitario.
            </p>

            {lider.contacts.length === 0 ? (
              <Vacio>
                Todavía no hay registros en la bitácora de seguimiento.
              </Vacio>
            ) : (
              <ul className="bitacora">
                {lider.contacts.map((c) => (
                  <li key={c.id} className="bitacora__entrada">
                    <div className="bitacora__cabecera">
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                        {c.contactedBy}
                      </strong>
                      <span className="bitacora__fecha">{enBogota(c.contactedAt)}</span>
                    </div>

                    <p className="bitacora__dato" style={{ marginTop: 6, fontSize: '0.86rem', lineHeight: 1.55 }}>
                      {c.notes}
                    </p>

                    {c.nextActionDefined && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: '6px 10px',
                          borderRadius: 6,
                          background: '#fffbeb',
                          border: '1px solid #fef3c7',
                          fontSize: '0.78rem',
                          color: '#92400e',
                        }}
                      >
                        <strong>Próxima acción pactada:</strong> {c.nextActionDefined}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
