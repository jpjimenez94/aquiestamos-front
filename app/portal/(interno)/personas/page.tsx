import Link from 'next/link'
import { portalFetch, enBogota } from '@/lib/portal'
import { Cabecera, Etiqueta, Vacio } from '../componentes'

export const metadata = { title: 'Personas acompañadas' }

type Persona = {
  id: string
  fullName: string
  phone: string
  city: string
  isMinor: boolean
  preferredModality: string | null
  availableDays: string[]
  availableSlots: string[]
  status: string
  estadoLegible: string
  priority: string
  prioridadLegible: string
  createdAt: string
  diasEsperando: number
}

const DIA_CORTO: Record<string, string> = {
  LUNES: 'Lu', MARTES: 'Ma', MIERCOLES: 'Mi', JUEVES: 'Ju',
  VIERNES: 'Vi', SABADO: 'Sa', DOMINGO: 'Do',
}

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<{ sinAsignar?: string }>
}) {
  const { sinAsignar } = await searchParams
  const filtro = sinAsignar === 'true'

  const respuesta = await portalFetch<Persona[]>(
    filtro ? '/patients?sinAsignar=true' : '/patients',
  )
  const personas = respuesta.data ?? []

  return (
    <>
      <Cabecera
        titulo="Personas acompañadas"
        descripcion={
          filtro
            ? 'Admitidas que todavía no tienen profesional. Las que llevan más tiempo esperando, primero.'
            : 'Todas las personas admitidas en la red.'
        }
        acciones={
          <>
            <Link className="boton-mini" data-tono={filtro ? undefined : 'principal'} href="/portal/personas">
              Todas
            </Link>
            <Link
              className="boton-mini"
              data-tono={filtro ? 'principal' : undefined}
              href="/portal/personas?sinAsignar=true"
            >
              Sin asignar
            </Link>
          </>
        }
      />

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar las personas.'}</Vacio>
      ) : personas.length === 0 ? (
        <Vacio>
          {filtro ? 'Nadie está esperando asignación. ' : 'Todavía no hay personas admitidas. '}
          {filtro ? 'Buen momento.' : 'Admite una solicitud para empezar.'}
        </Vacio>
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Persona</th>
                <th>Ciudad</th>
                <th>Disponibilidad</th>
                <th>Esperando</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {personas.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="tabla__principal">{p.fullName}</span>
                    <span className="tabla__secundario">
                      {p.phone}
                      {p.isMinor ? ' · menor de edad' : ''}
                      {p.preferredModality ? ` · ${p.preferredModality.toLowerCase()}` : ''}
                    </span>
                  </td>
                  <td>{p.city}</td>
                  <td className="tabla__secundario" style={{ marginTop: 0 }}>
                    {p.availableDays?.length
                      ? p.availableDays.map((d) => DIA_CORTO[d] ?? d).join(' ')
                      : '—'}
                  </td>
                  <td className="tabla__numero">
                    {p.diasEsperando} {p.diasEsperando === 1 ? 'día' : 'días'}
                    <span className="tabla__secundario">{enBogota(p.createdAt, false)}</span>
                  </td>
                  <td>
                    <Etiqueta estado={p.priority} texto={p.prioridadLegible} />
                  </td>
                  <td>
                    <Etiqueta estado={p.status} texto={p.estadoLegible} />
                  </td>
                  <td className="tabla__acciones">
                    <Link className="boton-mini" href={`/portal/personas/${p.id}`}>
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
