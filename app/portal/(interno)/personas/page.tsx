import Link from 'next/link'
import { portalFetch, usuarioActual, puede } from '@/lib/portal'
import { Cabecera, Vacio } from '../componentes'
import { ModalSeguimientoGeneral } from './ModalSeguimientoGeneral'
import { TablaPersonas, type Persona } from './TablaPersonas'

export const metadata = { title: 'Personas acompañadas' }

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<{ sinAsignar?: string }>
}) {
  const usuario = await usuarioActual()
  const puedeBorrar = puede(usuario, 'paciente:borrar')

  // El enlace del caso sale de la configuración del sitio, no del navegador
  const enlaceDelSitio = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
  const { sinAsignar } = await searchParams
  const filtro = sinAsignar === 'true'

  const respuesta = await portalFetch<Persona[]>(
    filtro ? '/patients?sinAsignar=true' : '/patients',
  )
  const personas = respuesta.data ?? []

  const casosAsignados = personas
    .filter((p) => p.asignacion?.profesional?.nombre)
    .map((p) => ({
      pacienteNombre: p.fullName,
      pacienteTelefono: p.phone,
      profesionalNombre: p.asignacion!.profesional!.nombre,
      profesionalTelefono: p.asignacion!.profesional!.telefono,
    }))

  return (
    <>
      <Cabecera
        titulo="Personas acompañadas"
        descripcion={
          filtro
            ? 'Admitidas que todavía no tienen profesional asignado. Las que llevan más tiempo esperando, primero.'
            : 'Todas las personas admitidas en la red, citas agendadas y su asignación profesional.'
        }
        acciones={
          <>
            <ModalSeguimientoGeneral casos={casosAsignados} />
            <Link
              className="boton-mini"
              data-tono={filtro ? undefined : 'principal'}
              href="/portal/personas"
            >
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
        <TablaPersonas
          personas={personas}
          enlaceDelSitio={enlaceDelSitio}
          puedeBorrar={puedeBorrar}
        />
      )}
    </>
  )
}
