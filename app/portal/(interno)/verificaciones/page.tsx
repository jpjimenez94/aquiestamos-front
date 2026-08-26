import { ExternalLink, ShieldCheck } from 'lucide-react'
import { portalFetch, enBogota } from '@/lib/portal'
import { Cabecera, Vacio } from '../componentes'
import { nombrePropio } from '@/lib/nombre'
import { TarjetaPendiente } from './TarjetaPendiente'
import { BotonPedirDocumentos } from './BotonPedirDocumentos'

export const metadata = { title: 'Verificaciones' }

const SITIOS_VERIFICACION = [
  {
    nombre: 'Colpsic',
    entidad: 'Colegio Colombiano de Psicólogos',
    pais: 'Colombia',
    bandera: '🇨🇴',
    url: 'https://sara.colpsic.org.co/publico/verificacion-tarjetas',
    desc: 'Verificación de Tarjeta Profesional',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
  },
  {
    nombre: 'ReTHUS',
    entidad: 'SISPRO · MinSalud Colombia',
    pais: 'Colombia',
    bandera: '🇨🇴',
    url: 'https://web.sispro.gov.co/THS/Cliente/ConsultasPublicas/ConsultaPublicaDeTHxIdentificacion.aspx',
    desc: 'Registro de Talento Humano en Salud',
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
  },
  {
    nombre: 'CPSP',
    entidad: 'Colegio de Psicólogos del Perú',
    pais: 'Perú',
    bandera: '🇵🇪',
    url: 'https://www.cpsp.pe/busquedas/busqueda_colegiados.html',
    desc: 'Búsqueda de Psicólogos Colegiados',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
  },
  {
    nombre: 'SUNEDU',
    entidad: 'Superintendencia Nacional · Perú',
    pais: 'Perú',
    bandera: '🇵🇪',
    url: 'https://enlinea.sunedu.gob.pe/',
    desc: 'Registro Nacional de Grados y Títulos',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
]

type Profesional = {
  id: string
  fullName: string
  phone: string
  city: string
  profession: string
  yearsExperience: string
  professionalCardNumber: string | null
  professionalCardDocumentUrl: string | null
  professionalCardVerified: boolean
  identityDocumentUrl: string | null
  identityDocumentBackUrl: string | null
  documentsSubmittedAt: string | null
  status: string
  enlaceDocumentos: string | null
}

export default async function VerificacionesPage() {
  const respuesta = await portalFetch<Profesional[]>('/professionals')
  const profesionales = (respuesta.data ?? []).filter((p) => p.status === 'ACTIVO')

  const pendientes = profesionales
    .filter((p) => !p.professionalCardVerified && p.documentsSubmittedAt)
    .sort(
      (a, b) =>
        new Date(b.documentsSubmittedAt as string).getTime() -
        new Date(a.documentsSubmittedAt as string).getTime(),
    )

  const porNotificar = profesionales.filter(
    (p) => !p.professionalCardVerified && !p.documentsSubmittedAt,
  )

  return (
    <>
      <Cabecera
        titulo="Verificaciones"
        descripcion="Quién ya subió sus documentos y espera aprobación, y a quién falta pedírselos."
      />

      {/* Sitios Oficiales para Verificación de Psicólogos y Profesionales */}
      <div
        className="panel"
        style={{
          marginBottom: 20,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '18px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <ShieldCheck size={20} color="#059669" />
          <h2 style={{ fontSize: '1.05rem', margin: 0, color: '#0f172a' }}>
            Sitios Oficiales para Verificación de Psicólogos y Profesionales
          </h2>
        </div>
        <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 14px', lineHeight: 1.4 }}>
          Acceso rápido a las plataformas oficiales de consulta pública de tarjetas profesionales,
          colegiaturas y títulos en Colombia y Perú:
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 12,
          }}
        >
          {SITIOS_VERIFICACION.map((sitio) => (
            <a
              key={sitio.nombre}
              href={sitio.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 10,
                border: `1px solid ${sitio.border}`,
                background: sitio.bg,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '1rem' }}>{sitio.bandera}</span>
                    <strong style={{ fontSize: '0.95rem', color: sitio.color }}>{sitio.nombre}</strong>
                  </div>
                  <ExternalLink size={14} color={sitio.color} />
                </div>
                <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 2 }}>
                  {sitio.entidad}
                </span>
                <span style={{ display: 'block', fontSize: '0.73rem', color: '#64748b' }}>
                  {sitio.desc}
                </span>
              </div>

              <div
                style={{
                  marginTop: 10,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: sitio.color,
                }}
              >
                Consultar en línea &rarr;
              </div>
            </a>
          ))}
        </div>
      </div>

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar los profesionales.'}</Vacio>
      ) : (
        <>
          <div className="panel">
            <h2>
              Pendientes de aprobación{' '}
              <span className="tabla__secundario" style={{ fontWeight: 400 }}>
                · {pendientes.length}
              </span>
            </h2>
            <p className="panel__nota">
              Subieron sus documentos por su enlace. Revisa y aprueba aquí mismo.
            </p>
            {pendientes.length === 0 ? (
              <Vacio>Nadie espera aprobación en este momento.</Vacio>
            ) : (
              <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
                {pendientes.map((p) => (
                  <TarjetaPendiente
                    key={p.id}
                    profesional={{
                      id: p.id,
                      nombre: nombrePropio(p.fullName),
                      telefono: p.phone,
                      ciudad: p.city,
                      profesion: p.profession,
                      experiencia: p.yearsExperience,
                      numero: p.professionalCardNumber,
                      claveTarjeta: p.professionalCardDocumentUrl,
                      claveIdentidad: p.identityDocumentUrl,
                      claveIdentidadRespaldo: p.identityDocumentBackUrl,
                      subioEl: p.documentsSubmittedAt ? enBogota(p.documentsSubmittedAt) : '',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="panel" style={{ marginTop: 20 }}>
            <h2>
              Por notificar{' '}
              <span className="tabla__secundario" style={{ fontWeight: 400 }}>
                · {porNotificar.length}
              </span>
            </h2>
            <p className="panel__nota">
              Todavía no suben sus documentos. El mensaje lleva su enlace personal: suben desde el
              teléfono, directo al almacenamiento privado.
            </p>
            {porNotificar.length === 0 ? (
              <Vacio>Todos los perfiles activos tienen sus documentos.</Vacio>
            ) : (
              <div className="tabla-envoltorio" style={{ marginTop: 12 }}>
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Profesional</th>
                      <th>Ciudad</th>
                      <th>Profesión</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {porNotificar.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <span className="tabla__principal">{nombrePropio(p.fullName)}</span>
                        </td>
                        <td>{p.city}</td>
                        <td>{p.profession}</td>
                        <td>
                          {p.enlaceDocumentos ? (
                            <BotonPedirDocumentos
                              profesional={p.fullName}
                              telefono={p.phone}
                              enlace={p.enlaceDocumentos}
                            />
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
