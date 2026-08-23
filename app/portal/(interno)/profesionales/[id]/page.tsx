import Link from 'next/link'
import { notFound } from 'next/navigation'
import { portalFetch, enBogota, usuarioActual, puede } from '@/lib/portal'
import { Cabecera, Dato, Etiqueta, Vacio } from '../../componentes'
import { EditorDisponibilidad } from './EditorDisponibilidad'
import { SeccionTarjetaProfesional } from './SeccionTarjetaProfesional'
import { nombrePropio } from '@/lib/nombre'

type Profesional = {
  id: string
  fullName: string
  email: string
  phone: string
  city: string
  profession: string
  modality: string
  populations: string[]
  travelsTo?: string | null
  professionalCardNumber?: string | null
  professionalCardDocumentUrl?: string | null
  professionalCardVerified?: boolean
  status: string
  estadoLegible: string
  maxActiveCases: number
  carga: number
  notes?: string | null
  casos: { id: string; paciente: { id: string; nombre: string }; desde: string }[]
}

type Franja = {
  id: string
  dia: string
  diaLegible: string
  desde: string
  hasta: string
  desdeMinuto: number
  hastaMinuto: number
  modalidad: string
  activa: boolean
}

export default async function ProfesionalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const usuario = await usuarioActual()

  const [respuesta, disponibilidad] = await Promise.all([
    portalFetch<Profesional>(`/professionals/${id}`),
    portalFetch<{ franjas: Franja[]; bloqueos: { id: string; inicio: string; fin: string; motivo: string | null }[] }>(
      `/professionals/${id}/disponibilidad`,
    ),
  ])

  /**
   * Un 403 no es un 404. Antes cualquier fallo acababa en "no encontramos esta
   * página", y a quien agenda —que por decisión de la red no ve el módulo de
   * profesionales— le decía que la ficha no existe cuando sí existe. Media hora
   * buscando un enlace roto que nunca estuvo roto.
   */
  if (!respuesta.success && respuesta.details?.permiso) {
    return (
      <>
        <Cabecera titulo="Ficha del profesional" />
        <div className="panel">
          <h2>Esto no te toca a ti</h2>
          <p className="panel__nota">
            Las fichas de los profesionales son datos maestros y tu rol no las abre. No es un
            error: la ficha existe y quien coordina puede verla. Si necesitas algo de ahí,
            pídeselo a la administración.
          </p>
          <div className="button-row" style={{ marginTop: 14 }}>
            <Link className="boton-mini" href="/portal/postulaciones">
              Volver a las postulaciones
            </Link>
          </div>
        </div>
      </>
    )
  }

  if (!respuesta.success || !respuesta.data) notFound()
  const p = respuesta.data
  const franjas = disponibilidad.data?.franjas ?? []

  return (
    <>
      <Cabecera
        titulo={nombrePropio(p.fullName)}
        descripcion={`${p.profession} · ${p.city}`}
        acciones={
          <Link className="boton-mini" href="/portal/profesionales">
            Volver
          </Link>
        }
      />

      <div className="panel">
        <div className="datos">
          <Dato etiqueta="Estado">
            <Etiqueta estado={p.status} texto={p.estadoLegible} />
          </Dato>
          <Dato etiqueta="Carga">
            {p.carga} de {p.maxActiveCases} acompañamientos
          </Dato>
          <Dato etiqueta="Modalidad">{p.modality.toLowerCase()}</Dato>
          <Dato etiqueta="Teléfono">{p.phone}</Dato>
          <Dato etiqueta="Correo">{p.email}</Dato>
          <Dato etiqueta="Poblaciones">{p.populations?.join(', ') || '—'}</Dato>
          {p.travelsTo ? <Dato etiqueta="Se desplaza a">{p.travelsTo}</Dato> : null}
          {p.notes ? <Dato etiqueta="Notas internas">{p.notes}</Dato> : null}
        </div>
      </div>

      <SeccionTarjetaProfesional
        profesionalId={p.id}
        profesionalNombre={p.fullName}
        profesionalTelefono={p.phone}
        verificada={p.professionalCardVerified}
        numero={p.professionalCardNumber}
        documentoUrl={p.professionalCardDocumentUrl}
        puedeVerificar={puede(usuario, 'profesional:verificar-tarjeta')}
      />

      <div className="panel">
        <h2>Acompañamientos activos</h2>
        {p.casos.length === 0 ? (
          <Vacio>No lleva ningún caso ahora mismo.</Vacio>
        ) : (
          <div className="tabla-envoltorio" style={{ marginBottom: 0, border: 0 }}>
            <table className="tabla">
              <tbody>
                {p.casos.map((caso) => (
                  <tr key={caso.id}>
                    <td>
                      <Link href={`/portal/personas/${caso.paciente.id}`}>
                        {caso.paciente.nombre}
                      </Link>
                    </td>
                    <td className="tabla__numero">desde {enBogota(caso.desde, false)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditorDisponibilidad
        profesionalId={p.id}
        franjasIniciales={franjas}
        puedeEditar={puede(usuario, 'profesional:editar') || usuario?.role === 'ADMIN'}
      />
    </>
  )
}
