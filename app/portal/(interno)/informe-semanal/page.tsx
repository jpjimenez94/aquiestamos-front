import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Download, PhoneOff, CalendarClock, UserX } from 'lucide-react'
import { portalFetch, usuarioActual, puede, enBogota } from '@/lib/portal'
import { Cabecera, Etiqueta, Vacio } from '../componentes'
import { nombrePropio } from '@/lib/nombre'
import {
  AREA_LEGIBLE,
  PRIORIDAD_LEGIBLE,
  resumenPorPrioridad,
  GRUPOS_DE_CITAS,
  type InformeSemanal,
  type ListaPendiente,
} from '@/lib/informeSemanal'
import './informe.css'

export const metadata = { title: 'Informe semanal' }

/**
 * INFORME SEMANAL
 *
 * Cada semana hay que entregar un documento con las cifras de la red. Salían a
 * mano: abrir cada pantalla, contar, apuntar — y de ahí venían los números con
 * asterisco («75 citas, se incluyen pruebas») y las listas que había que
 * rastrear caso por caso.
 *
 * Aquí están todas juntas, en el mismo orden del documento y con el enlace a
 * la pantalla de donde sale cada una: una cifra que no se puede comprobar no
 * sirve para un informe que alguien va a firmar.
 *
 * Lo que esto NO hace es redactar. Los logros, los obstáculos y las
 * prioridades son criterio de quien dirige el área; un portal que los
 * escribiera estaría inventando.
 */

const DIA = 24 * 60 * 60 * 1000
const soloFecha = (d: Date) => d.toISOString().slice(0, 10)

function Cifra({
  que,
  cuanto,
  nota,
  enlace,
}: {
  que: string
  cuanto: number | string | null
  nota?: string
  enlace?: string
}) {
  const contenido = (
    <>
      <span className="cifra__numero">{cuanto === null ? '—' : cuanto}</span>
      <span className="cifra__que">{que}</span>
      {nota ? <span className="cifra__nota">{nota}</span> : null}
    </>
  )
  return enlace ? (
    <Link className="cifra cifra--enlace" href={enlace}>
      {contenido}
    </Link>
  ) : (
    <div className="cifra">{contenido}</div>
  )
}

function ListaDeCasos({
  titulo,
  icono,
  lista,
  linea,
}: {
  titulo: string
  icono: React.ReactNode
  lista: ListaPendiente[]
  linea: (x: ListaPendiente) => string
}) {
  return (
    <div className="panel">
      <h2>
        {icono} {titulo}{' '}
        <span className="tabla__secundario" style={{ fontWeight: 400 }}>
          · {resumenPorPrioridad(lista)}
        </span>
      </h2>
      {lista.length === 0 ? (
        <Vacio>Ninguno esta semana.</Vacio>
      ) : (
        <ul className="informe__lista">
          {lista.map((x) => (
            <li key={x.id}>
              <Link href={`/portal/personas/${x.id}`}>{nombrePropio(x.nombre)}</Link>
              <Etiqueta
                estado={x.prioridad}
                texto={PRIORIDAD_LEGIBLE[x.prioridad] ?? x.prioridad}
              />
              <span className="tabla__secundario">{linea(x)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default async function InformeSemanalPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string }>
}) {
  const usuario = await usuarioActual()
  if (!usuario) redirect('/portal/entrar?volver=/portal/informe-semanal')
  if (!puede(usuario, 'informe:leer')) redirect('/portal')

  const { desde } = await searchParams
  const consulta = desde ? `?desde=${encodeURIComponent(desde)}` : ''
  const respuesta = await portalFetch<InformeSemanal>(`/dashboard/informe-semanal${consulta}`)

  if (!respuesta.success || !respuesta.data) {
    return (
      <>
        <Cabecera titulo="Informe semanal" />
        <Vacio>{respuesta.message ?? 'No pudimos armar el informe.'}</Vacio>
      </>
    )
  }

  const d = respuesta.data
  const inicio = new Date(d.periodo.desde)
  const anterior = soloFecha(new Date(inicio.getTime() - 7 * DIA))
  const siguiente = soloFecha(new Date(inicio.getTime() + 7 * DIA))
  const haySiguiente = new Date(d.periodo.hasta).getTime() < Date.now()

  return (
    <>
      <Cabecera
        titulo="Informe semanal"
        descripcion={`Del ${enBogota(d.periodo.desde, false)} al ${enBogota(d.periodo.hasta, false)}. Las cifras salen del portal; lo que pide criterio se escribe aparte.`}
        acciones={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link className="boton-mini" href={`/portal/informe-semanal?desde=${anterior}`}>
              ← Semana anterior
            </Link>
            {haySiguiente ? (
              <Link className="boton-mini" href={`/portal/informe-semanal?desde=${siguiente}`}>
                Semana siguiente →
              </Link>
            ) : null}
            <a
              className="boton-mini"
              data-tono="principal"
              href={`/api/portal/informe-semanal?desde=${soloFecha(inicio)}&descargar=1`}
            >
              <Download size={14} />
              Descargar el informe
            </a>
          </div>
        }
      />

      {/* ---------- Voluntariado ---------- */}
      <div className="panel">
        <h2>Voluntariado</h2>
        <div className="informe__cifras">
          <Cifra que="Registrados" cuanto={d.voluntariado.registrados} enlace="/portal/colaboradores" />
          <Cifra que="Nuevos esta semana" cuanto={d.voluntariado.nuevosEnLaSemana} />
          <Cifra
            que="Activos esta semana"
            cuanto={d.voluntariado.activosEnLaSemana}
            nota="Con al menos una tarea asignada"
            enlace="/portal/tareas"
          />
          <Cifra que="% de activos" cuanto={`${d.voluntariado.porcentajeActivos}%`} />
        </div>
        <ul className="informe__lista informe__lista--simple">
          {d.voluntariado.porArea.map((a) => (
            <li key={a.area}>
              {AREA_LEGIBLE[a.area] ?? a.area}: <strong>{a.cuantos}</strong>
            </li>
          ))}
        </ul>
      </div>

      {/* ---------- Atenciones ---------- */}
      <div className="panel">
        <h2>Atenciones</h2>
        <div className="informe__cifras">
          <Cifra
            que="Solicitudes recibidas"
            cuanto={d.atenciones.solicitudesRecibidas}
            nota="En la semana"
            enlace="/portal/solicitudes"
          />
          <Cifra
            que="En acompañamiento"
            cuanto={d.atenciones.enAcompanamiento}
            nota="Hoy"
            enlace="/portal/personas"
          />
          <Cifra que="En admisión" cuanto={d.atenciones.enAdmision} nota="Hoy" />
          <Cifra que="Citas de la semana" cuanto={d.atenciones.citasDeLaSemana} enlace="/portal/agenda" />
          <Cifra
            que="Sesiones que se dieron"
            cuanto={d.atenciones.citasRealizadasEnLaSemana}
            nota={
              d.atenciones.citasRealizadasEnLaSemana !== d.atenciones.citasMarcadasRealizadas
                ? `${d.atenciones.citasMarcadasRealizadas} marcadas a mano, el resto por el reporte o la sala`
                : 'En la semana'
            }
            /*
              La cifra lleva a su propia lista.

              La sección que la detalla está al final de una página larga, por
              debajo de tres listas: quien mira el número no la encuentra, y un
              número que no se puede abrir vuelve a ser un número que no se
              puede defender. Tocar la cifra es el gesto natural para
              preguntar «¿cuáles?».
            */
            enlace="#citas"
          />
          {/*
            Las que nadie cerró, a la vista y no escondidas.

            Meterlas en «realizadas» infla la cifra; meterlas en «no asistió»
            la hunde. Decir cuántas son es lo único que no miente, y además le
            dice a quien firma el informe cuántas llamadas le faltan para que
            el número sea cierto.
          */}
          <Cifra
            que="Pendientes de cerrar"
            cuanto={d.atenciones.citasPendientesDeCerrar}
            nota="Ya pasaron y nadie dijo qué pasó · toca para ver cuáles"
            enlace="#citas"
          />
          <Cifra que="Canceladas" cuanto={d.atenciones.citasCanceladasEnLaSemana} nota="En la semana" />
          <Cifra que="Sin asistir" cuanto={d.atenciones.citasSinAsistirEnLaSemana} nota="En la semana" />
          <Cifra que="Citas en el histórico" cuanto={d.atenciones.citasHistorico} nota="Desde el inicio" />
        </div>
      </div>

      {/* ---------- Casos y profesionales ---------- */}
      <div className="panel">
        <h2>Casos y profesionales</h2>
        <div className="informe__cifras">
          <Cifra que="Casos nuevos" cuanto={d.casos.nuevosEnLaSemana} nota="En la semana" />
          <Cifra que="Casos cerrados" cuanto={d.casos.cerradosEnLaSemana} nota="En la semana" />
          <Cifra
            que="Derivados a red externa"
            cuanto={d.casos.derivadosRedExterna}
            nota="El portal no tiene dónde apuntarlas"
          />
          <Cifra
            que="Profesionales activos"
            cuanto={d.profesionales.activos}
            enlace="/portal/profesionales"
          />
          <Cifra que="Con casos asignados" cuanto={d.profesionales.conCasosAsignados} />
          <Cifra que="Nuevos esta semana" cuanto={d.profesionales.nuevosEnLaSemana} />
          <Cifra
            que="Pendientes de validar"
            cuanto={d.profesionales.pendientesDeValidar}
            enlace="/portal/verificaciones"
          />
          <Cifra
            que="Pidieron apoyo"
            cuanto={d.profesionales.pidieronApoyoEnLaSemana}
            nota="Cuidado del equipo"
            enlace="/portal/cuidado"
          />
        </div>
      </div>

      {/* ---------- Lo que hoy se busca a mano ---------- */}
      <ListaDeCasos
        titulo="No contestan"
        icono={<PhoneOff size={18} style={{ verticalAlign: -3, color: '#b45309' }} />}
        lista={d.pendientes.noContestan}
        linea={(x) =>
          `${x.intentos ?? 0} ${(x.intentos ?? 0) === 1 ? 'intento' : 'intentos'} · ${x.diasSinContacto} días sin contacto${x.motivo === 'NUMERO_ERRADO' ? ' · el número está mal' : ''}`
        }
      />

      <ListaDeCasos
        titulo="Asignados, falta que elijan hora"
        icono={<CalendarClock size={18} style={{ verticalAlign: -3, color: '#2b5f97' }} />}
        lista={d.pendientes.sinElegirHora}
        linea={(x) => `con ${x.profesional ?? 'profesional asignado'} · esperando hace ${x.diasEsperando} días`}
      />

      <ListaDeCasos
        titulo="Sin profesional asignado"
        icono={<UserX size={18} style={{ verticalAlign: -3, color: '#8a5524' }} />}
        lista={d.pendientes.sinProfesional}
        linea={(x) => `lleva ${x.diasEsperando} días en la red`}
      />

      {/*
        Las cifras, abiertas.

        «Me salen las cifras, pero quiero ver las citas puntuales que cuenta el
        informe» —Sofi—. Un número que no se puede abrir no se puede defender:
        quien firma tiene que poder contestar «¿cuáles seis?», y sobre todo
        saber a qué profesional preguntarle por cada una de las que faltan.
        «10 pendientes» sin nombres es un reproche sin destinatario.

        Las pendientes van primero y abiertas; las demás, cerradas, porque son
        para comprobar y no para trabajar.
      */}
      <div className="panel" id="citas">
        <h2>Las citas de la semana, una por una</h2>
        <p className="panel__nota" style={{ marginTop: 0 }}>
          De aquí salen las cifras de arriba. Cada cita dice de quién es y quién la atendía.
        </p>
        {/*
          El `?? []` no sobra.

          El front y el backend se despliegan por separado: entre que Vercel
          publica esto y Railway publica el campo que lo alimenta pasan unos
          minutos, y en esa ventana `citasDeLaSemana` llega sin definir. Sin la
          red, el informe entero —cifras incluidas— revienta con un error de
          servidor por una sección que es un añadido. Se vio en local, con esta
          misma pantalla y un backend viejo todavía escuchando.
        */}
        {(d.citasDeLaSemana ?? []).length === 0 ? (
          <Vacio>No hubo citas esta semana.</Vacio>
        ) : (
          GRUPOS_DE_CITAS.map((grupo) => {
            const suyas = (d.citasDeLaSemana ?? []).filter((c) => c.que === grupo.que)
            if (suyas.length === 0) return null
            return (
              <details
                className="informe__grupo"
                key={grupo.que}
                open={grupo.que === 'PENDIENTE'}
              >
                <summary>
                  <strong>{grupo.titulo}</strong>
                  <span className="tabla__secundario"> · {suyas.length}</span>
                </summary>
                <p className="panel__nota" style={{ margin: '6px 0 0' }}>
                  {grupo.explica}
                </p>
                <ul className="informe__lista">
                  {suyas.map((c) => (
                    <li key={c.id}>
                      <span className="informe__cuando">{enBogota(c.cuando)}</span>
                      {c.personaId ? (
                        <Link href={`/portal/personas/${c.personaId}`}>
                          {nombrePropio(c.persona ?? 'Sin nombre')}
                        </Link>
                      ) : (
                        <span>{nombrePropio(c.persona ?? 'Sin nombre')}</span>
                      )}
                      <span className="tabla__secundario">
                        con {nombrePropio(c.profesional ?? 'sin profesional')}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            )
          })
        )}
      </div>

      <p className="informe__pie">
        Lo que no sale de aquí —logros, obstáculos, estado del área y prioridades de la semana
        siguiente— es criterio tuyo: el documento descargado los deja señalados y en blanco.
      </p>
    </>
  )
}
