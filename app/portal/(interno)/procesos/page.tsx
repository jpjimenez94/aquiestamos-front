import { Cabecera, Etiqueta } from '../componentes'
import { DiagramaDelFlujo } from './DiagramaDelFlujo'
import {
  DiagramaSolicitud,
  DiagramaProfesionales,
  DiagramaAsignacion,
  DiagramaCita,
  DiagramaCierre,
} from './DiagramasEtapa'
import './procesos.css'

export const metadata = { title: 'Cómo funciona la red' }

/**
 * La guía de procesos, dentro del portal: se entra con la sesión de siempre
 * (correo autorizado + rol) y la puede leer cualquier rol, incluido LECTURA.
 *
 * Es contenido, no datos: no consulta nada del backend. Si un proceso cambia
 * en el código, esta página se actualiza en el mismo pull request — está al
 * lado del código justamente para que no se le olvide a nadie.
 */

type Desvio = { tono: 'reloj' | 'alerta' | 'logro'; titulo: string; texto: string }
type Paso = { quien: string; titulo: string; detalle: string; desvios?: Desvio[] }

function Flujo({ pasos }: { pasos: Paso[] }) {
  return (
    <div className="proc-flujo">
      {pasos.map((p, i) => (
        <div className="proc-paso" key={p.titulo}>
          <div className="proc-paso__numero">{i + 1}</div>
          <div className="proc-paso__cuerpo">
            <span className="proc-paso__quien">{p.quien}</span>
            <h3 className="proc-paso__titulo">{p.titulo}</h3>
            <p className="proc-paso__detalle">{p.detalle}</p>
            {p.desvios?.length ? (
              <div className="proc-desvios">
                {p.desvios.map((d) => (
                  <div className="proc-desvio" data-tono={d.tono} key={d.titulo}>
                    <strong>{d.titulo}</strong>
                    <span>{d.texto}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Una etapa que se abre y se cierra. Es un <details> nativo: colapsa sin
 * JavaScript, el estado lo recuerda el navegador dentro de la página, y el
 * lector abre solo lo que le interesa en vez de desplazar seis pantallas.
 */
function Etapa({
  titulo,
  abierta = false,
  children,
}: {
  titulo: string
  abierta?: boolean
  children: React.ReactNode
}) {
  return (
    <details className="panel proc-etapa" open={abierta || undefined}>
      <summary>
        <h2>{titulo}</h2>
        <span className="proc-etapa__chevron" aria-hidden>›</span>
      </summary>
      <div className="proc-etapa__contenido">{children}</div>
    </details>
  )
}

function Estados({ cadena }: { cadena: { estado: string; texto: string }[] }) {
  return (
    <div className="proc-estados">
      {cadena.map((e, i) => (
        <span key={e.estado} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {i > 0 ? <span className="proc-estados__flecha">→</span> : null}
          <Etiqueta estado={e.estado} texto={e.texto} />
        </span>
      ))}
    </div>
  )
}

export default function ProcesosPage() {
  return (
    <>
      <Cabecera
        titulo="Cómo funciona la red"
        descripcion="El viaje de un caso de punta a punta: quién hace qué, qué corre solo y qué se espera en cada tramo."
        acciones={
          <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
            {/* El manual técnico: mismo contenido, en formato documento con
                flujogramas. Lo sirve una ruta con sesión y se puede bajar. */}
            <a className="boton-mini" href="/api/portal/manual-procesos" target="_blank" rel="noopener noreferrer">
              Manual técnico
            </a>
            <a className="boton-mini" href="/api/portal/manual-procesos?descargar=1">
              Descargar manual
            </a>
          </span>
        }
      />

      <div className="panel">
        <h2>El viaje completo</h2>
        <p className="proc-intro">
          Seis etapas. Las esperas tienen reloj: si alguien no responde, el sistema libera solo y
          el caso vuelve a la cola en vez de quedarse quieto.
        </p>
        <div className="proc-viaje">
          <span className="proc-viaje__etapa"><span>1</span>Pide ayuda</span>
          <span className="proc-viaje__flecha">→</span>
          <span className="proc-viaje__etapa"><span>2</span>Tamizaje y admisión</span>
          <span className="proc-viaje__flecha">→</span>
          <span className="proc-viaje__etapa"><span>3</span>Se le propone un profesional</span>
          <span className="proc-viaje__flecha">→</span>
          <span className="proc-viaje__etapa"><span>4</span>Cita propuesta</span>
          <span className="proc-viaje__flecha">→</span>
          <span className="proc-viaje__etapa"><span>5</span>Citas confirmadas</span>
          <span className="proc-viaje__flecha">→</span>
          <span className="proc-viaje__etapa"><span>6</span>Sesión, reporte y cierre</span>
        </div>
      </div>

      <DiagramaDelFlujo />

      <Etapa titulo="1 · Solicitud y tamizaje">
        <p className="proc-intro">
          La entrada de quien pide ayuda. El tamizaje decide la prioridad con lo que la persona
          cuenta hoy, y nadie se queda por fuera por no responder.
        </p>
        <DiagramaSolicitud />
        <Flujo
          pasos={[
            {
              quien: 'La persona',
              titulo: 'Llena «Necesito ayuda» en el sitio',
              detalle: 'Queda una solicitud nueva y a coordinación le llega el aviso.',
            },
            {
              quien: 'Coordinación',
              titulo: 'Le envía el tamizaje por WhatsApp',
              detalle: 'Un enlace personal con 7 preguntas cortas, pensadas para responderse desde el teléfono.',
              desvios: [
                { tono: 'reloj', titulo: '2 días sin responder:', texto: 'el sistema la admite igual, con prioridad por silencio, y la marca para llamarla.' },
              ],
            },
            {
              quien: 'El sistema',
              titulo: 'Calcula la prioridad y admite solo',
              detalle: 'Con las respuestas sale la prioridad (alta, media, baja) y la persona entra a la cola sin que nadie tenga que hacer clic.',
              desvios: [
                { tono: 'alerta', titulo: 'Respuesta de riesgo:', texto: 'la pantalla ofrece las líneas 123 y 106 en el momento, y coordinación recibe un aviso urgente.' },
                { tono: 'logro', titulo: 'Resultado:', texto: 'persona en admisión, columna «Por Asignar» del tablero.' },
              ],
            },
          ]}
        />
      </Etapa>

      <Etapa titulo="2 · Entrada de profesionales">
        <p className="proc-intro">
          La otra puerta del sitio. La tarjeta profesional es un trámite del profesional — vive en
          Postulaciones y nunca es una etapa del caso.
        </p>
        <DiagramaProfesionales />
        <Flujo
          pasos={[
            {
              quien: 'Quien se postula',
              titulo: 'Llena «Quiero dar apoyo psicológico»',
              detalle: 'Coordinación recibe la postulación con su formación, ciudad y disponibilidad.',
            },
            {
              quien: 'Coordinación',
              titulo: 'Revisa y aprueba',
              detalle: 'Al aprobar, el profesional queda activo y le llega su correo de bienvenida.',
            },
            {
              quien: 'El profesional',
              titulo: 'Sube su tarjeta profesional y certificados',
              detalle: 'Los documentos van a un almacenamiento privado; el portal los muestra con enlaces que caducan en un minuto.',
              desvios: [
                { tono: 'reloj', titulo: 'TP sin verificar:', texto: 'no bloquea asignar, pero el tablero y la cita lo marcan en rojo hasta que coordinación la verifique.' },
                { tono: 'logro', titulo: 'Resultado:', texto: 'elegible para asignaciones, con cupo de casos.' },
              ],
            },
          ]}
        />
      </Etapa>

      <Etapa titulo="3 · La asignación es una negociación">
        <p className="proc-intro">
          Entre coordinación, el profesional y la persona. Puede fallar en cada tramo, y por eso
          cada tramo tiene estado, mensaje y reloj.
        </p>
        <DiagramaAsignacion />
        <Estados
          cadena={[
            { estado: 'PROPUESTA', texto: 'Propuesta enviada' },
            { estado: 'ACEPTADA', texto: 'Aceptada, falta horario' },
            { estado: 'ACTIVA', texto: 'En acompañamiento' },
            { estado: 'CERRADA', texto: 'Cerrada' },
          ]}
        />
        <Flujo
          pasos={[
            {
              quien: 'Coordinación',
              titulo: 'Elige candidato y le manda la propuesta',
              detalle: 'El emparejamiento sugiere el top 10 por experiencia, modalidad, cercanía y cupo. El mensaje de WhatsApp lleva su enlace personal — sin el nombre ni el teléfono de la persona.',
            },
            {
              quien: 'El profesional',
              titulo: 'Decide desde su enlace',
              detalle: 'Si acepta, deja él mismo los días y franjas en que puede para este caso. Su respuesta entra directa al sistema, sin transcripciones.',
              desvios: [
                { tono: 'alerta', titulo: '«Ahora no puedo»:', texto: 'el caso vuelve a la cola con su motivo, para proponérselo a otro.' },
                { tono: 'reloj', titulo: '2 días en silencio:', texto: 'el sistema libera la asignación solo y avisa a coordinación.' },
              ],
            },
            {
              quien: 'Coordinación',
              titulo: 'Cuadra el horario con la persona',
              detalle: 'Le escribe con los horarios que el profesional ofreció — con las horas de cada franja — y agenda cuando la persona confirma.',
              desvios: [
                { tono: 'reloj', titulo: '3 días sin confirmar:', texto: 'se libera al profesional y el caso vuelve a la cola.' },
                { tono: 'logro', titulo: 'Resultado:', texto: 'asignación activa y cita agendada.' },
              ],
            },
          ]}
        />
        <p className="proc-intro" style={{ marginTop: 14 }}>
          Una propuesta ocupa cupo desde que sale: si no, se le podría proponer el mismo profesional
          a diez personas a la vez y todas «cabrían». Al liberarse, se libera todo junto: el cupo, el
          candado de una negociación por persona y el enlace del caso.
        </p>
      </Etapa>

      <Etapa titulo="4 · Cita propuesta">
        <p className="proc-intro">
          Coordinación agenda preliminarmente según los horarios y franjas ofrecidas por el profesional
          y le presenta la propuesta de horario a la persona acompañada.
        </p>
        <Estados
          cadena={[
            { estado: 'PROGRAMADA', texto: 'Programada / Propuesta' },
          ]}
        />
        <Flujo
          pasos={[
            {
              quien: 'Coordinación',
              titulo: 'Agenda fecha y modalidad preliminar',
              detalle: 'El sistema valida contra lo que el profesional ofreció para este caso y contra su agenda general: cualquiera de las dos deja pasar.',
              desvios: [
                { tono: 'reloj', titulo: 'Fuera de ambas:', texto: 'el error dice qué ofreció; la casilla de excepción queda en auditoría.' },
                { tono: 'alerta', titulo: 'Bloqueo de agenda:', texto: '«estas dos semanas no estoy» no se salta nunca.' },
              ],
            },
            {
              quien: 'Coordinación',
              titulo: 'Propone el horario a la persona',
              detalle: 'Envía mensaje por WhatsApp con los detalles de fecha y hora propuesta para que la persona confirme su asistencia o solicite ajuste.',
              desvios: [
                { tono: 'logro', titulo: 'Al confirmar:', texto: 'el caso pasa inmediatamente a la columna 5 de Citas Confirmadas.' },
              ],
            },
          ]}
        />
      </Etapa>

      <Etapa titulo="5 · Citas confirmadas y consentimiento">
        <p className="proc-intro">
          La cita ha sido confirmada. La sesión dura 45 minutos y deja 30 de descanso. Antes de empezar, el consentimiento tiene
          que estar firmado (o heredado si se trata de una reprogramación).
        </p>
        <DiagramaCita />
        <Estados
          cadena={[
            { estado: 'CONFIRMADA', texto: 'Confirmada' },
            { estado: 'REALIZADA', texto: 'Realizada' },
          ]}
        />
        <Flujo
          pasos={[
            {
              quien: 'Coordinación',
              titulo: 'Confirma a los dos por WhatsApp',
              detalle: 'A la persona: quedó confirmada y el canal acordado. Al profesional: recordatorio con fecha, canal y pautas de reporte.',
            },
            {
              quien: 'La persona',
              titulo: 'Firma el consentimiento desde su teléfono',
              detalle: 'Un enlace personal con el consentimiento en 4 puntos cortos. Su nombre tecleado es la firma; si es menor, firma su acudiente. Al reprogramar, el consentimiento firmado previo se conserva automáticamente.',
              desvios: [
                { tono: 'logro', titulo: 'Firmado:', texto: 'ya nadie lo edita. Para la firma en papel de una sesión presencial, coordinación sube el escaneo.' },
              ],
            },
            {
              quien: 'El día de la sesión',
              titulo: 'La cita termina en uno de cuatro finales',
              detalle: 'Realizada, no asistió, cancelada con motivo, o reprogramada — al reprogramar la cita no se edita: se cierra y apunta a la nueva conservando la validez del consentimiento.',
            },
          ]}
        />
      </Etapa>

      <Etapa titulo="6 · Seguimiento y cierre">
        <p className="proc-intro">
          El profesional reporta, coordinación lee y decide. Cerrar siempre es un humano con motivo
          — nunca el sistema.
        </p>
        <DiagramaCierre />
        <Flujo
          pasos={[
            {
              quien: 'El profesional',
              titulo: 'Cuenta qué pasó desde su mismo enlace',
              detalle: 'Si la sesión se hizo, responde también «¿qué sigue?»: necesita más sesiones, con esta fue suficiente, o todavía no lo sabe. Nunca se le pregunta el contenido de la sesión: la red no guarda historia clínica.',
              desvios: [
                { tono: 'alerta', titulo: '«No se presentó»:', texto: 'coordinación marca la cita como no asistió y reagenda o habla con la persona.' },
              ],
            },
            {
              quien: 'Coordinación',
              titulo: 'Lee el reporte y decide',
              detalle: 'La respuesta llega a la ficha y al correo de quien asignó. «Necesita más» abre una nueva cita y el ciclo se repite; «suficiente» abre el cierre.',
            },
            {
              quien: 'Coordinación',
              titulo: 'Cierra el caso, con motivo',
              detalle: 'El botón vive debajo del reporte — se lee y ahí mismo se decide — y solo aparece cuando hay al menos un reporte: cerrar sin haber leído al profesional es cerrar a ciegas.',
              desvios: [
                { tono: 'logro', titulo: 'Al cerrar:', texto: 'el profesional libera cupo y el caso pasa a «Cerrados recientes» del tablero. Cerrar no es desaparecer.' },
              ],
            },
          ]}
        />
      </Etapa>

      <Etapa titulo="Lo que corre solo">
        <p className="proc-intro">
          Los relojes de la red. Todos revisan cada hora, todos avisan lo que hicieron y todo queda
          en auditoría. Los umbrales se cambian por configuración, sin tocar código.
        </p>
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Espera</th>
                <th>Umbral</th>
                <th>Qué hace el sistema al vencer</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tamizaje sin responder</td>
                <td>2 días</td>
                <td>Admite igual, con prioridad por silencio, y marca la solicitud para llamar</td>
              </tr>
              <tr>
                <td>Propuesta sin respuesta del profesional</td>
                <td>2 días</td>
                <td>Libera la asignación; el caso vuelve a «Por Asignar»</td>
              </tr>
              <tr>
                <td>Horario sin confirmar por la persona</td>
                <td>3 días</td>
                <td>Libera al profesional; el caso vuelve a «Por Asignar»</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="proc-intro" style={{ marginTop: 12 }}>
          El tablero muestra la cuenta regresiva en cada card («Se libera en 2 días si no hay
          respuesta») con el mismo umbral que usa el reloj: dos sitios contando días serían un sitio
          mintiendo.
        </p>
      </Etapa>
    </>
  )
}
