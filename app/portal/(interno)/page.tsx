import Link from 'next/link'
import { redirect } from 'next/navigation'
import { portalFetch, usuarioActual, puede, tieneRol } from '@/lib/portal'
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
  /** Lo que se está parando ahora y alguien puede desatascar hoy. */
  atascos?: {
    sinElegirHora: number
    sinElegirHoraDiasMax: number
    sinElegirHoraPorVencer: number
    citasHoySinConsentimiento: number
    sesionesSinReporte: number
  }
}

export default async function TableroPage() {
  const usuario = await usuarioActual()

  if (tieneRol(usuario, 'ADMISION')) {
    redirect('/portal/solicitudes')
  }
  if (tieneRol(usuario, 'COORDINADOR_CASOS')) {
    redirect('/portal/agenda')
  }
  if (tieneRol(usuario, 'LIDERES_COMUNITARIOS')) {
    redirect('/portal/lideres')
  }
  if (tieneRol(usuario, 'PROFESIONAL')) {
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

  const { bandeja, red, agenda, atascos } = respuesta.data
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

      {/*
        Lo que se está atascando, aparte de lo que entra.
      
        Los indicadores de arriba cuentan lo que llega y lo que hay. Estos
        cuentan lo que está parado — y desde que asignar dejó de ser pedir
        permiso, el atasco se movió de sitio: ya no muere en el «sí» del
        profesional, muere en el silencio de después.
      
        Los tres se resuelven hoy con un mensaje. Si nadie mira, se resuelven
        solos de la peor manera: el caso se libera, la sesión ocurre sin
        consentimiento, o nadie se entera de que la persona no apareció.
      */}
      {atascos ? (
        <div className="panel">
          <h2>Lo que está parado</h2>
          <p className="panel__nota">
            Cosas que se destraban hoy con un mensaje, y que solas terminan mal.
          </p>

          <div className="indicadores" style={{ marginTop: 12 }}>
            <Indicador
              cifra={atascos.sinElegirHora}
              etiqueta={
                atascos.sinElegirHoraPorVencer > 0
                  ? `Sin elegir hora · ${atascos.sinElegirHoraPorVencer} se liberan mañana`
                  : atascos.sinElegirHora > 0
                    ? `Sin elegir hora · la más antigua lleva ${atascos.sinElegirHoraDiasMax} d`
                    : 'Personas sin elegir hora'
              }
              alerta={atascos.sinElegirHoraPorVencer > 0}
            />
            <Indicador
              cifra={atascos.citasHoySinConsentimiento}
              etiqueta="Sesiones de hoy sin consentimiento firmado"
              alerta={atascos.citasHoySinConsentimiento > 0}
            />
            <Indicador
              cifra={atascos.sesionesSinReporte}
              etiqueta="Sesiones que ya pasaron sin reporte"
              alerta={atascos.sesionesSinReporte > 0}
            />
          </div>
        </div>
      ) : null}

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
