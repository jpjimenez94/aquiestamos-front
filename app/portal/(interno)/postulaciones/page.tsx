import { portalFetch, enBogota, usuarioActual, puede } from '@/lib/portal'
import Link from 'next/link'
import { Cabecera, Etiqueta, Vacio, Paginacion, leerPagina } from '../componentes'
import { BotonVerificarTarjeta } from '@/components/portal/BotonVerificarTarjeta'
import { nombrePropio } from '@/lib/nombre'

export const metadata = { title: 'Postulaciones' }

type Postulacion = {
  id: string
  fullName: string
  email: string
  phone: string
  city: string | null
  profession: string | null
  yearsExperience: string | null
  populations: string[]
  modality: string
  availableDays: string[]
  status: string
  createdAt: string
  /** ID del profesional creado si ya fue aprobado (auto-aprobación) */
  professionalId?: string | null
  professionalCardVerified?: boolean
  professionalCardNumber?: string | null
  professionalCardDocumentUrl?: string | null
}

const EXPERIENCIA: Record<string, string> = {
  MENOS_DE_1: '< 1 año',
  ENTRE_1_Y_3: '1–3 años',
  ENTRE_3_Y_5: '3–5 años',
  MAS_DE_5: '+5 años',
}

const POR_PAGINA = 25

export default async function PostulacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>
}) {
  const [pagina, usuario] = await Promise.all([
    searchParams.then((p) => leerPagina(p.pagina)),
    usuarioActual(),
  ])

  // Quien agenda NO ve el modulo de profesionales: es una decision expresa de
  // la red, escrita en la matriz de permisos. Antes estos controles se le
  // pintaban igual y al tocarlos recibia un 403 que la pagina traducia a "no
  // encontramos esta pagina", que ademas es mentira: la ficha existe.
  const veProfesionales = puede(usuario, 'profesional:leer')
  const editaProfesionales = puede(usuario, 'profesional:verificar-tarjeta')

  const respuesta = await portalFetch<Postulacion[]>(
    `/volunteers?page=${pagina}&perPage=${POR_PAGINA}`,
  )
  const postulaciones = respuesta.data ?? []
  const total = Number(respuesta.meta?.total ?? postulaciones.length)

  return (
    <>
      <Cabecera
        titulo="Postulaciones de profesionales"
        descripcion="Registro histórico de postulaciones recibidas. Los psicólogos se aprueban automáticamente al enviar el formulario y su tarjeta profesional puede ser validada aquí."
      />

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar las postulaciones.'}</Vacio>
      ) : postulaciones.length === 0 ? (
        <Vacio>
          {pagina > 1
            ? 'Esta página ya no tiene postulaciones.'
            : 'Todavía no se ha postulado nadie.'}
        </Vacio>
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Profesional</th>
                <th>Profesión</th>
                <th>Experiencia</th>
                <th>Modalidad</th>
                <th>Recibida</th>
                <th>Tarjeta Profesional</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {postulaciones.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="tabla__principal">{nombrePropio(p.fullName)}</span>
                    <span className="tabla__secundario">
                      {p.city ?? 'Sin ciudad'} · {p.phone}
                    </span>
                  </td>
                  <td>
                    {p.profession ?? '—'}
                    <span className="tabla__secundario">
                      {p.populations?.slice(0, 3).join(', ')}
                      {p.populations?.length > 3 ? '…' : ''}
                    </span>
                  </td>
                  <td>{EXPERIENCIA[p.yearsExperience ?? ''] ?? '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{p.modality.toLowerCase()}</td>
                  <td className="tabla__numero">{enBogota(p.createdAt, false)}</td>
                  <td>
                    {p.professionalId && editaProfesionales ? (
                      <BotonVerificarTarjeta
                        profesionalId={p.professionalId}
                        profesionalNombre={p.fullName}
                        profesionalTelefono={p.phone}
                        verificada={p.professionalCardVerified}
                        numero={p.professionalCardNumber}
                        documentoUrl={p.professionalCardDocumentUrl}
                      />
                    ) : (
                      <span className="tabla__secundario" style={{ fontSize: '0.78rem' }}>
                        —
                      </span>
                    )}
                  </td>
                  <td>
                    <Etiqueta estado={p.status} />
                  </td>
                  <td className="tabla__acciones">
                    {p.professionalId && veProfesionales ? (
                      <Link className="boton-mini" href={`/portal/profesionales/${p.professionalId}`}>
                        Ver ficha
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {respuesta.success ? (
        <Paginacion
          pagina={pagina}
          porPagina={POR_PAGINA}
          total={total}
          ruta="/portal/postulaciones"
        />
      ) : null}
    </>
  )
}
