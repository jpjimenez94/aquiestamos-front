import { portalFetch, enBogota } from '@/lib/portal'
import { Cabecera, Vacio } from '../componentes'
import { nombrePropio } from '@/lib/nombre'
import { TarjetaPendiente } from './TarjetaPendiente'
import { BotonPedirDocumentos } from './BotonPedirDocumentos'

export const metadata = { title: 'Verificaciones' }

/**
 * La banda de verificación de profesionales, en dos filas:
 *
 *   1. PENDIENTES DE APROBACIÓN — ya subieron sus documentos por su enlace.
 *      El documento a la vista y los datos del perfil al lado, para aprobar
 *      sin abrir cinco pestañas.
 *   2. POR NOTIFICAR — todavía no los suben. El mensaje con su enlace, listo.
 *
 * Verificado no aparece aquí: esta pantalla es una bandeja de trabajo, no un
 * directorio. Para eso está Profesionales.
 */

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
