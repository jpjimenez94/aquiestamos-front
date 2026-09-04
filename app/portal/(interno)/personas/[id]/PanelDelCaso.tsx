'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarCheck, RotateCcw, Clock } from 'lucide-react'
import {
  mensajeDePropuesta,
  mensajeParaCuadrarHorario,
  mensajeDePedirNuevaDisponibilidadAlProfesional,
  mensajeDeExcusasYReagendamiento,
} from '@/lib/mensajes'
import { enBogota } from '@/lib/fechas'
import { ModalAgendar } from './ModalAgendar'
import { BotonReasignar } from './BotonReasignar'
import { BotonConfirmoAparte } from './BotonConfirmoAparte'
import { QueTocaAhora } from './QueTocaAhora'
import { Mensaje } from './Mensaje'
import type { Seguimiento } from '@/lib/seguimiento'

/**
 * El caso, según en qué punto va la negociación.
 *
 * Asignar dejó de ser un clic. Ahora es una conversación de tres —quien
 * coordina, el profesional y la persona acompañada— y cada tramo tiene
 * exactamente un mensaje y una acción. Este panel decide cuál toca, para que
 * quien coordina no tenga que acordarse.
 */

export type Asignacion = {
  id: string
  estado: 'PROPUESTA' | 'ACEPTADA' | 'ACTIVA' | 'RECHAZADA' | 'CANCELADA' | 'CERRADA'
  estadoLegible: string
  siguientePaso: string | null
  desde: string
  respondioEn: string | null
  /**
   * Cuándo el profesional confirmó ÉL que puede. Nulo = todavía no.
   *
   * No vale `respondioEn`: se escribe al asignar, así que dice lo mismo para
   * «me avisaron» que para «dije que sí». De este campo cuelga el paso 4.
   */
  confirmadoEn?: string | null
  /** Con valor, lo dio por confirmado coordinación y no él. */
  confirmadoPor?: string | null
  nota: string | null
  motivoRechazo: string | null
  /** `agenda` son sus franjas en palabras: lo que ella va a ver para elegir. */
  profesional: { id: string; nombre: string; telefono: string; agenda?: string | null }
}

type Persona = {
  id: string
  fullName: string
  phone: string
  city: string
  priority: string
  preferredContact: string | null
  preferredModality: string | null
  availableDays: string[]
  availableSlots: string[]
}

const TONO: Record<string, string> = {
  PROPUESTA: 'ambar',
  ACEPTADA: 'azul',
  ACTIVA: 'verde',
  RECHAZADA: 'rojo',
  CANCELADA: 'rojo',
  CERRADA: 'gris',
}

const DIA: Record<string, string> = {
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles', JUEVES: 'Jueves',
  VIERNES: 'Viernes', SABADO: 'Sábado', DOMINGO: 'Domingo',
}
const FRANJA: Record<string, string> = { MANANA: 'mañana', TARDE: 'tarde', NOCHE: 'noche' }

export function PanelDelCaso({
  persona,
  asignacion,
  enlaceCaso,
  enlaceAgenda,
  plantillas,
  proximaCita,
  queToca,
  ultimaCita,
}: {
  persona: Persona
  asignacion: Asignacion
  enlaceCaso: string
  /** Enlace con el que la persona agenda sus propias sesiones. */
  enlaceAgenda?: string | null
  /** Textos editables desde Parametrización. Mandan sobre los del código. */
  plantillas?: Record<string, string>
  /**
   * Qué toca ahora, con la misma regla que enciende la lista de personas.
   * Nulo = nada pendiente. Manda sobre el texto fijo por estado del backend,
   * que decía «ya hay cita» mirara lo que mirara.
   */
  queToca?: Seguimiento | null
  /** La última sesión ya pasada, para las acciones que la necesitan. */
  ultimaCita?: { id: string; inicio: string; estado: string } | null
  /** La cita abierta más próxima, para que el mensaje diga la fecha real. */
  proximaCita?: {
    id?: string
    cuando: string
    modalidad: string
    /** Llave de sala firmada para la persona acompañada. */
    salaTokenPaciente?: string | null
    /** Si la persona ya firmó el consentimiento informado de esta cita. */
    consentSigned?: boolean
  } | null
}) {
  const [copiado, setCopiado] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [agendando, setAgendando] = useState(false)

  function copiar(clave: string, texto: string) {
    navigator.clipboard.writeText(texto)
    setCopiado(clave)
    setTimeout(() => setCopiado(null), 2000)
  }

  const terminada = asignacion.estado === 'RECHAZADA' || asignacion.estado === 'CANCELADA'

  const sitioUrl = typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.redaquiestamos.org').replace(/\/$/, '')

  return (
    <div className="panel">
      <div className="caso-cabecera">
        <h2 style={{ margin: 0 }}>El acompañamiento</h2>
        <span className="etiqueta" data-tono={TONO[asignacion.estado]}>
          {asignacion.estadoLegible}
        </span>
      </div>

      <p className="panel__nota">
        Con <strong>{asignacion.profesional.nombre}</strong>, desde el{' '}
        {enBogota(asignacion.desde, false)}.
      </p>

      {/*
        En ACTIVA, «qué toca ahora» es una tarjeta con su botón (más abajo).
        En los demás estados, el texto fijo del backend sigue valiendo.
      */}
      {asignacion.estado !== 'ACTIVA' && asignacion.siguientePaso ? (
        <p className="caso-siguiente">
          <strong>Siguiente paso:</strong>{' '}
          {/*
            Una acción, no la lista de las dos.

            El texto del backend nombra los dos pasos de ACEPTADA —avisar al
            profesional y mandarle a ella su enlace— porque desde allí no se
            sabe si él ya confirmó. Aquí sí, y decir las dos cosas cuando solo
            una se puede hacer es lo que hacía que la pantalla no dijera qué
            toca ahora.
          */}
          {asignacion.estado === 'ACEPTADA'
            ? asignacion.confirmadoEn
              ? 'Mándale a la persona su enlace de agenda para que elija hora.'
              : `Avísale a ${asignacion.profesional.nombre.split(' ')[0]} que tiene el caso, y espera a que confirme su agenda.`
            : asignacion.siguientePaso}
        </p>
      ) : null}

      {error ? (
        <div className="aviso-portal" data-tono="rojo" style={{ marginBottom: 16 }}>
          {error}
        </div>
      ) : null}

      {/* Si el profesional rechazó o se canceló, se explica por qué */}
      {terminada && asignacion.motivoRechazo ? (
        <div className="caso-motivo">
          <strong>Motivo:</strong> {asignacion.motivoRechazo}
        </div>
      ) : null}

      {/* PASO 1 — Se le propuso el caso al profesional. Esperando que diga si puede. */}
      {asignacion.estado === 'PROPUESTA' ? (
        <>
          <Mensaje
            titulo="3 · Proponle el caso al profesional (asignación antigua)"
            nota="Los datos de contacto de la persona no van aquí: se los mostramos solo si acepta."
            telefono={asignacion.profesional.telefono}
            texto={mensajeDePropuesta({
              plantilla: plantillas?.WHATSAPP_PROPUESTA_PROFESIONAL,
              profesional: asignacion.profesional.nombre,
              ciudad: persona.city,
              modalidad: persona.preferredModality,
              dias: persona.availableDays,
              franjas: persona.availableSlots,
              enlace: enlaceCaso,
              prioridad: persona.priority,
              // Su disponibilidad, para que no acepte a ciegas.
              agenda: asignacion.profesional.agenda ?? null,
            })}
            copiado={copiado === 'propuesta'}
            alCopiar={(t) => copiar('propuesta', t)}
          />

          <div className="mensaje__acciones" style={{ marginTop: 16 }}>
            <BotonReasignar
              asignacionId={asignacion.id}
              profesionalNombre={asignacion.profesional.nombre}
              personaNombre={persona.fullName}
              personaTelefono={persona.phone}
              cuandoAnterior={proximaCita?.cuando ?? null}
              estadoAsignacion={asignacion.estado}
              textoBoton="No contestó / Proponer a otra persona"
              onError={setError}
            />
          </div>
        </>
      ) : null}

      {/* PASO 2 — El profesional aceptó y dejó sus días/horas. Toca cuadrar con la persona. */}
      {asignacion.estado === 'ACEPTADA' ? (
        <>
          {/*
            Primero el profesional, después la persona.

            Este aviso vivía SOLO en la rama PROPUESTA. Desde que asignar dejó
            de pedir permiso ninguna asignación nueva pasa por ahí —nacen en
            ACEPTADA—, así que el panel saltaba directo al paso 4 y este
            mensaje no se le ofrecía a nadie: quien coordina no tenía botón
            para avisarle, y el profesional se enteraba de que tenía un caso
            cuando ya había alguien con hora escogida, si es que se enteraba.

            Importa más que un paso perdido. El texto le promete «si no puedes,
            dilo ahí mismo», y ese «ahí» es el enlace del caso, que solo viaja
            en este mensaje. Sin mandarlo, la puerta de salida existe en el
            código y en la máquina de estados, pero él nunca recibe la llave.

            Va antes del 4 a propósito: la persona elige sobre la agenda del
            profesional, y que elija antes de que él sepa que tiene el caso es
            justo el orden que hay que evitar.
          */}
          {/*
            Un paso a la vez: el que toca abierto, el hecho plegado.

            Bloquear el 4 hasta que él confirme no bastaba. Una vez confirmaba,
            el 3 y el 4 quedaban los dos abiertos y con los mismos botones, así
            que la pantalla dejaba de decir qué toca ahora: dos mensajes listos
            para mandar, sin nada que distinguiera el que ya se mandó del que
            falta.

            Es el mismo patrón que `QueTocaAhora` ya usa en los casos activos:
            una tarjeta con la acción de ahora, y lo demás plegado debajo. El 3
            no desaparece —a veces hay que reenviarlo— pero deja de competir.
          */}
          {asignacion.confirmadoEn ? (
            <details className="caso-alternativas">
              <summary>3 · Ya le avisaste, y confirmó — volver a mandarle el mensaje</summary>
              <div className="caso-alternativas__cuerpo">
                <Mensaje
                  titulo="3 · Aviso al profesional"
                  nota="Ya está avisado y confirmó. Vuelve a mandárselo solo si hace falta."
                  telefono={asignacion.profesional.telefono}
                  texto={mensajeDePropuesta({
                    plantilla: plantillas?.WHATSAPP_PROPUESTA_PROFESIONAL,
                    profesional: asignacion.profesional.nombre,
                    ciudad: persona.city,
                    modalidad: persona.preferredModality,
                    dias: persona.availableDays,
                    franjas: persona.availableSlots,
                    enlace: enlaceCaso,
                    prioridad: persona.priority,
                    agenda: asignacion.profesional.agenda ?? null,
                  })}
                  copiado={copiado === 'aviso-profesional'}
                  alCopiar={(t) => copiar('aviso-profesional', t)}
                />
              </div>
            </details>
          ) : (
            <Mensaje
              titulo="3 · Avísale al profesional que tiene el caso"
              nota="Se le avisa, no se le pide permiso. Si no puede, lo dice desde su enlace y el caso vuelve a la cola el mismo día."
              telefono={asignacion.profesional.telefono}
              texto={mensajeDePropuesta({
                plantilla: plantillas?.WHATSAPP_PROPUESTA_PROFESIONAL,
                profesional: asignacion.profesional.nombre,
                ciudad: persona.city,
                modalidad: persona.preferredModality,
                dias: persona.availableDays,
                franjas: persona.availableSlots,
                enlace: enlaceCaso,
                prioridad: persona.priority,
                // Su disponibilidad, para que no acepte a ciegas.
                agenda: asignacion.profesional.agenda ?? null,
              })}
              copiado={copiado === 'aviso-profesional'}
              alCopiar={(t) => copiar('aviso-profesional', t)}
            />
          )}

          {/*
            Aquí se listaban los días y franjas que el profesional escribía al
            aceptar. Ya no se le piden: su agenda está cargada desde que se
            registró y es de ahí de donde la persona elige. Queda la nota, que
            es el matiz que una agenda no sabe decir.
          */}
          {asignacion.nota ? (
            <div className="caso-horarios">
              <strong>Lo que dijo el profesional:</strong>
              <em>«{asignacion.nota}»</em>
            </div>
          ) : null}

          {/*
            El paso 4 espera al 3, y no es burocracia.

            Ella elige la hora de la agenda de ÉL. Mandarle el enlace antes de
            que él confirme que esa agenda sigue vigente la expone a reservar un
            espacio que ya no existe — y a que la sesión se caiga después, que
            es peor que esperar un día.

            La espera tiene puerta a propósito: esperar un clic es justo lo que
            mató siete de cada ocho asignaciones del modelo anterior. Si él
            contestó por WhatsApp o por teléfono, quien coordina lo hace constar
            y sigue.
          */}
          {asignacion.confirmadoEn ? (
            <Mensaje
              titulo="4 · Mándale su enlace para que elija hora"
              /**
               * Quién hace qué, dicho con sujeto.
               *
               * Decía «Ve la agenda real y agenda sola», y así no se entiende:
               * en pantalla parece una orden a quien coordina —ve, agenda—
               * cuando quien mira la agenda y elige es ELLA. La frase describía
               * el flujo desde dentro, no desde el lado de quien la lee.
               */
              nota={
                asignacion.confirmadoPor
                  ? `Lo dio por confirmado ${asignacion.confirmadoPor}, no ${asignacion.profesional.nombre.split(' ')[0]}. Con este enlace ella elige su hora sobre la agenda de él.`
                  : `${asignacion.profesional.nombre.split(' ')[0]} ya confirmó que su agenda sigue vigente. Con este enlace ella elige su hora, y le sirve para todas sus sesiones.`
              }
              telefono={persona.phone}
              texto={mensajeParaCuadrarHorario({
                persona: persona.fullName,
                profesional: asignacion.profesional.nombre,
                dias: [],
                franjas: [],
                nota: asignacion.nota,
                enlaceAgenda,
                plantilla: plantillas?.WHATSAPP_CUADRAR_HORARIO_PERSONA,
              })}
              copiado={copiado === 'cuadrar'}
              alCopiar={(t) => copiar('cuadrar', t)}
            />
          ) : (
            <div className="mensaje" style={{ opacity: 0.72 }}>
              <div className="mensaje__cabecera">
                {/* Mismos estilos en línea que `Mensaje`: esas clases no existen. */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-default)' }}>
                    4 · Mándale su enlace para que elija hora
                  </strong>
                  <span
                    style={{
                      fontSize: '0.84rem',
                      lineHeight: 1.5,
                      color: 'var(--color-text-light, #64748b)',
                    }}
                  >
                    Esperando a que {asignacion.profesional.nombre.split(' ')[0]} confirme que
                    su agenda sigue vigente. Ella va a elegir de esa agenda: si cambió,
                    reservaría un espacio que ya no existe.
                  </span>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <BotonConfirmoAparte asignacionId={asignacion.id} />
              </div>
            </div>
          )}

          <div className="mensaje__acciones" style={{ marginTop: 16 }}>
            <button
              className="boton-mini"
              data-tono="principal"
              type="button"
              onClick={() => setAgendando(true)}
            >
              <CalendarCheck size={14} />
              Ya me confirmó: agendar
            </button>
            <BotonReasignar
              asignacionId={asignacion.id}
              profesionalNombre={asignacion.profesional.nombre}
              personaNombre={persona.fullName}
              personaTelefono={persona.phone}
              cuandoAnterior={proximaCita?.cuando ?? null}
              estadoAsignacion={asignacion.estado}
              textoBoton="No se pudo cuadrar / Reasignar"
              onError={setError}
            />
          </div>

          {/* Opciones cuando los horarios no le sirven a la persona */}
          <details className="caso-alternativas">
            <summary>¿No le sirvieron los horarios?</summary>
            <div className="caso-alternativas__cuerpo">
              <p className="panel__nota">
                Si la persona no puede en ninguna de esas franjas, tienes dos opciones según lo que
                ella te haya dicho:
              </p>

              <Mensaje
                titulo="Pedirle otras franjas al profesional"
                nota="Úsalo si la persona te dio opciones y quieres ver si el profesional puede alguna de ellas."
                telefono={asignacion.profesional.telefono}
                texto={mensajeDePedirNuevaDisponibilidadAlProfesional({
              plantilla: plantillas?.WHATSAPP_REAGENDAMIENTO_PEDIR_DISP,
                  profesional: asignacion.profesional.nombre,
                  persona: persona.fullName,
                  enlace: enlaceCaso,
                })}
                copiado={copiado === 'pedir-otra'}
                alCopiar={(t) => copiar('pedir-otra', t)}
              />

              <Mensaje
                titulo="Mandarla de nuevo a su enlace, con excusas"
                nota="Se disculpa y la manda a su agenda, donde ve las horas libres del profesional."
                telefono={persona.phone}
                texto={mensajeDeExcusasYReagendamiento({
              plantilla: plantillas?.WHATSAPP_REAGENDAMIENTO_EXCUSAS,
                  persona: persona.fullName,
                  profesional: asignacion.profesional.nombre,
                  motivo: 'un compromiso médico/personal de última hora',
                  // Los días y franjas ya no se le piden al profesional: su
                  // agenda es la fuente, y la persona elige de ella.
                  dias: [],
                  franjas: [],
                  nota: asignacion.nota,
                })}
                copiado={copiado === 'excusas'}
                alCopiar={(t) => copiar('excusas', t)}
              />
            </div>
          </details>
        </>
      ) : null}

      {/*
        Pasos 5 y 6 — preparar y tener la sesión — son de la CITA, no de la
        ficha. Aquí vivía una copia del mensaje de despacho al profesional, el
        mismo que el detalle de la cita ofrece en el paso 5: dos sitios para el
        mismo botón, y quien agendaba no sabía si eran dos cosas que hacer.
        La ficha ahora lleva a la cita en vez de imitarla.
      */}
      {asignacion.estado === 'ACTIVA' ? (
        <>
          {/*
            Una acción por caso.

            Los mensajes de un caso vivían en cinco sitios —la ficha, el
            detalle de la cita, el modal de recordatorio, el de seguimiento y
            la lista— y quien coordina tenía que saber dónde estaba cada cosa.
            Aquí hay UNA tarjeta que dice qué toca y UN botón para hacerlo. Lo
            demás sigue existiendo, plegado debajo.
          */}
          <QueTocaAhora
            queToca={queToca ?? null}
            proximaCita={proximaCita ?? null}
            persona={persona}
            asignacion={asignacion}
            enlaceCaso={enlaceCaso}
            enlaceAgenda={enlaceAgenda}
            plantillas={plantillas}
            onAgendar={() => setAgendando(true)}
            onError={setError}
          />

          <details style={{ marginTop: 12 }}>
            <summary className="tabla__secundario" style={{ cursor: 'pointer', fontSize: '0.84rem' }}>
              Más acciones
            </summary>
            <div className="mensaje__acciones" style={{ marginTop: 10 }}>
              <button className="boton-mini" type="button" onClick={() => setAgendando(true)}>
                <CalendarCheck size={14} />
                Agendar nueva sesión
              </button>
              <BotonReasignar
                asignacionId={asignacion.id}
                profesionalNombre={asignacion.profesional.nombre}
                personaNombre={persona.fullName}
                personaTelefono={persona.phone}
                cuandoAnterior={proximaCita?.cuando ?? null}
                estadoAsignacion={asignacion.estado}
                textoBoton="Reasignar a otro profesional"
                onError={setError}
              />
              {proximaCita?.id ? (
                <a className="boton-mini" href={`/portal/agenda/${proximaCita.id}`}>
                  Ver la próxima cita →
                </a>
              ) : null}
              {ultimaCita?.id ? (
                <a className="boton-mini" href={`/portal/agenda/${ultimaCita.id}`}>
                  Ver la última cita →
                </a>
              ) : null}
            </div>
          </details>
        </>
      ) : null}

      {agendando ? (
        <ModalAgendar
          personaId={persona.id}
          persona={persona}
          asignacionId={asignacion.id}
          profesional={asignacion.profesional}
          enlaceCaso={enlaceCaso}
          esNuevaSesion={asignacion.estado === 'ACTIVA'}
          onCerrar={() => setAgendando(false)}
        />
      ) : null}
    </div>
  )
}

