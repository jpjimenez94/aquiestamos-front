import Link from 'next/link'
import { redirect } from 'next/navigation'
import { portalFetch, usuarioActual, puede } from '@/lib/portal'
import { Cabecera, Indicador, Vacio } from './componentes'

export const metadata = { title: 'Tablero' }

type Tablero = {
  bandeja: {
    solicitudesSinRevisar: number
    personasSinAsignar: number
    esperaMasLarga: { dias: number; desde: string } | null
  }
  red: { profesionalesActivos: number; conCupoLibre: number }
  agenda: {
    citasProximas24h: number
    citasProximos7dias: number
    porEstado: Record<string, number>
  }
}

export default async function TableroPage() {
  const usuario = await usuarioActual()

  if (usuario?.role === 'ADMISION') {
    redirect('/portal/solicitudes')
  }
  if (usuario?.role === 'COORDINADOR_CASOS') {
    redirect('/portal/agenda')
  }
  if (usuario?.role === 'PROFESIONAL') {
    redirect('/portal/mi-agenda')
  }

  const respuesta = await portalFetch<Tablero>('/dashboard')

  if (!respuesta.success || !respuesta.data) {
    return (
      <>
        <Cabecera titulo="Tablero" />
        <Vacio>{respuesta.message ?? 'No pudimos cargar los indicadores.'}</Vacio>
      </>
    )
  }

  const { bandeja, red, agenda } = respuesta.data
  const espera = bandeja.esperaMasLarga

  return (
    <>
      <Cabecera
        titulo={`Hola, ${usuario?.name.split(' ')[0] ?? ''}`}
        descripcion="Esto es lo que hay sobre la mesa hoy."
      />

      <div className="indicadores">
        <Indicador
          cifra={bandeja.solicitudesSinRevisar}
          etiqueta="Solicitudes sin revisar"
          alerta={bandeja.solicitudesSinRevisar > 0}
        />
        <Indicador
          cifra={bandeja.personasSinAsignar}
          etiqueta="Personas admitidas sin profesional"
          alerta={bandeja.personasSinAsignar > 0}
        />
        <Indicador
          cifra={espera ? `${espera.dias} d` : '—'}
          etiqueta="La espera más larga sin asignar"
          alerta={Boolean(espera && espera.dias > 3)}
        />
        <Indicador cifra={agenda.citasProximas24h} etiqueta="Citas en las próximas 24 horas" />
        <Indicador cifra={agenda.citasProximos7dias} etiqueta="Citas esta semana" />
        <Indicador
          cifra={`${red.conCupoLibre} / ${red.profesionalesActivos}`}
          etiqueta="Profesionales activos con cupo libre"
          alerta={red.profesionalesActivos > 0 && red.conCupoLibre === 0}
        />
      </div>

      <div className="panel">
        <h2>Por dónde seguir</h2>
        <p className="panel__nota">
          En una emergencia lo que importa es que nadie lleve días esperando.
        </p>
        <div className="button-row">
          {puede(usuario, 'solicitud:leer') ? (
            <Link className="boton-mini" data-tono="principal" href="/portal/solicitudes">
              Revisar solicitudes
            </Link>
          ) : null}
          {puede(usuario, 'paciente:leer') ? (
            <Link className="boton-mini" href="/portal/personas?sinAsignar=true">
              Personas sin asignar
            </Link>
          ) : null}
          {puede(usuario, 'agenda:leer') ? (
            <Link className="boton-mini" href="/portal/agenda">
              Ver la agenda
            </Link>
          ) : null}
        </div>
      </div>
    </>
  )
}
