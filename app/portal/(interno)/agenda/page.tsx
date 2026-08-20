import Link from 'next/link'
import { portalFetch, soloHora } from '@/lib/portal'
import { Cabecera, Vacio } from '../componentes'

export const metadata = { title: 'Agenda' }

type Cita = {
  id: string
  inicio: string
  fin: string
  estado: string
  estadoLegible: string
  modalidad: string
  profesional: { id: string; nombre?: string }
  paciente: { id: string; nombre?: string }
}

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

/** El lunes de la semana que contiene esa fecha, en hora local del servidor. */
function lunesDe(fecha: Date) {
  const d = new Date(fecha)
  const dia = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - dia)
  d.setHours(0, 0, 0, 0)
  return d
}

function claveDia(fecha: Date | string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(typeof fecha === 'string' ? new Date(fecha) : fecha)
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>
}) {
  const { semana } = await searchParams
  const referencia = semana ? new Date(`${semana}T12:00:00`) : new Date()
  const lunes = lunesDe(Number.isNaN(referencia.getTime()) ? new Date() : referencia)
  const domingo = new Date(lunes)
  domingo.setDate(domingo.getDate() + 7)

  const respuesta = await portalFetch<Cita[]>(
    `/appointments?desde=${lunes.toISOString()}&hasta=${domingo.toISOString()}`,
  )
  const citas = respuesta.data ?? []

  const porDia = new Map<string, Cita[]>()
  for (const cita of citas) {
    const clave = claveDia(cita.inicio)
    porDia.set(clave, [...(porDia.get(clave) ?? []), cita])
  }

  const anterior = new Date(lunes)
  anterior.setDate(anterior.getDate() - 7)
  const siguiente = new Date(lunes)
  siguiente.setDate(siguiente.getDate() + 7)
  const aParam = (d: Date) => d.toISOString().slice(0, 10)

  const hoy = claveDia(new Date())

  return (
    <>
      <Cabecera
        titulo="Agenda de la red"
        descripcion={`Semana del ${lunes.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}`}
        acciones={
          <>
            <Link className="boton-mini" href={`/portal/agenda?semana=${aParam(anterior)}`}>
              ← Semana anterior
            </Link>
            <Link className="boton-mini" href="/portal/agenda">
              Esta semana
            </Link>
            <Link className="boton-mini" href={`/portal/agenda?semana=${aParam(siguiente)}`}>
              Semana siguiente →
            </Link>
          </>
        }
      />

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar la agenda.'}</Vacio>
      ) : (
        <div className="semana">
          {DIAS.map((nombre, indice) => {
            const fecha = new Date(lunes)
            fecha.setDate(fecha.getDate() + indice)
            const clave = claveDia(fecha)
            const delDia = (porDia.get(clave) ?? []).sort((a, b) =>
              a.inicio.localeCompare(b.inicio),
            )

            return (
              <div className="dia" key={nombre} data-hoy={clave === hoy}>
                <div className="dia__cabecera">
                  {nombre.slice(0, 3)}
                  <span className="dia__numero">{fecha.getDate()}</span>
                </div>

                {delDia.length === 0 ? (
                  <span className="tabla__secundario" style={{ marginTop: 0 }}>
                    —
                  </span>
                ) : (
                  delDia.map((cita) => (
                    <Link
                      className="cita-mini"
                      data-estado={cita.estado}
                      href={`/portal/agenda/${cita.id}`}
                      key={cita.id}
                    >
                      <strong>{soloHora(cita.inicio)}</strong>
                      {cita.paciente.nombre ?? 'Persona'}
                      <br />
                      <span style={{ opacity: 0.7 }}>{cita.profesional.nombre ?? ''}</span>
                    </Link>
                  ))
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
