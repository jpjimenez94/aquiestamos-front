import Link from 'next/link'
import { portalFetch } from '@/lib/portal'
import { Cabecera, Etiqueta, Vacio } from '../componentes'
import { BotonVerificarTarjeta } from '@/components/portal/BotonVerificarTarjeta'
import { nombrePropio } from '@/lib/nombre'

export const metadata = { title: 'Profesionales' }

type Profesional = {
  enlaceDocumentos?: string | null
  id: string
  fullName: string
  phone?: string
  profession: string
  city: string
  modality: string
  populations: string[]
  professionalCardVerified?: boolean
  professionalCardNumber?: string | null
  professionalCardDocumentUrl?: string | null
  status: string
  estadoLegible: string
  maxActiveCases: number
  carga: number
}

export default async function ProfesionalesPage() {
  const respuesta = await portalFetch<Profesional[]>('/professionals')
  const profesionales = respuesta.data ?? []

  return (
    <>
      <Cabecera
        titulo="Profesionales de la red"
        descripcion="Voluntarios habilitados para acompañamiento psicológico y estado de validación legal de su tarjeta profesional."
      />

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar los profesionales.'}</Vacio>
      ) : profesionales.length === 0 ? (
        <Vacio>Todavía no hay profesionales registrados.</Vacio>
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Profesional</th>
                <th>Poblaciones</th>
                <th>Modalidad</th>
                <th>Carga</th>
                <th>Tarjeta Profesional</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {profesionales.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/portal/profesionales/${p.id}`} className="tabla__principal">
                      {nombrePropio(p.fullName)}
                    </Link>
                    <span className="tabla__secundario">
                      {p.profession} · {p.city}
                    </span>
                  </td>
                  <td className="tabla__secundario" style={{ marginTop: 0 }}>
                    {p.populations?.slice(0, 3).join(', ') || '—'}
                    {p.populations?.length > 3 ? '…' : ''}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{p.modality.toLowerCase()}</td>
                  <td className="tabla__numero">
                    {p.carga} / {p.maxActiveCases}
                    {p.carga >= p.maxActiveCases ? (
                      <span className="tabla__secundario" style={{ color: 'var(--color-red)' }}>
                        sin cupo
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <BotonVerificarTarjeta
                      profesionalId={p.id}
                      profesionalNombre={p.fullName}
                      profesionalTelefono={p.phone}
                      verificada={p.professionalCardVerified}
                      numero={p.professionalCardNumber}
                      documentoUrl={p.professionalCardDocumentUrl}
                      enlaceDocumentos={p.enlaceDocumentos ?? null}
                    />
                  </td>
                  <td>
                    <Etiqueta estado={p.status} texto={p.estadoLegible} />
                  </td>
                  <td className="tabla__acciones">
                    <Link className="boton-mini" href={`/portal/profesionales/${p.id}`}>
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
