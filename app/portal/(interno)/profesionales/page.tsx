import Link from 'next/link'
import { portalFetch } from '@/lib/portal'
import { Cabecera, Etiqueta, Vacio } from '../componentes'

export const metadata = { title: 'Profesionales' }

type Profesional = {
  id: string
  fullName: string
  profession: string
  city: string
  modality: string
  populations: string[]
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
        descripcion="La carga se calcula contando acompañamientos activos: nunca se guarda en un campo, así no se desincroniza."
      />

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar los profesionales.'}</Vacio>
      ) : profesionales.length === 0 ? (
        <Vacio>Todavía no hay profesionales. Aprueba una postulación para empezar.</Vacio>
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Profesional</th>
                <th>Poblaciones</th>
                <th>Modalidad</th>
                <th>Carga</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {profesionales.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="tabla__principal">{p.fullName}</span>
                    <span className="tabla__secundario">
                      {p.profession} · {p.city}
                    </span>
                  </td>
                  <td className="tabla__secundario" style={{ marginTop: 0 }}>
                    {p.populations?.slice(0, 3).join(', ') || '—'}
                    {p.populations?.length > 3 ? '…' : ''}
                  </td>
                  <td>{p.modality.toLowerCase()}</td>
                  <td className="tabla__numero">
                    {p.carga} / {p.maxActiveCases}
                    {p.carga >= p.maxActiveCases ? (
                      <span className="tabla__secundario" style={{ color: 'var(--color-red)' }}>
                        sin cupo
                      </span>
                    ) : null}
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
