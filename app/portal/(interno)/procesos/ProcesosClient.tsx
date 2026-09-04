'use client'

import { useState, useMemo } from 'react'
import {
  HeartHandshake,
  Users,
  MapPin,
  Cpu,
  Search,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  ShieldCheck,
  Calendar,
  Sparkles,
  FileText,
  RotateCcw,
} from 'lucide-react'
import { Etiqueta } from '../componentes'
import { DiagramaDelFlujo } from './DiagramaDelFlujo'
import {
  DiagramaSolicitud,
  DiagramaProfesionales,
  DiagramaAsignacion,
  DiagramaCita,
  DiagramaCierre,
  DiagramaVoluntariadoTareas,
  DiagramaLideresComunitarios,
} from './DiagramasEtapa'

type Desvio = { tono: 'reloj' | 'alerta' | 'logro'; titulo: string; texto: string }
type Paso = {
  quien: string
  rolTag?: 'persona' | 'coordinacion' | 'profesional' | 'voluntario' | 'lider' | 'sistema'
  titulo: string
  detalle: string
  desvios?: Desvio[]
}

function Flujo({ pasos }: { pasos: Paso[] }) {
  return (
    <div className="proc-flujo">
      {pasos.map((p, i) => (
        <div className="proc-paso" key={p.titulo}>
          <div className="proc-paso__numero">{i + 1}</div>
          <div className="proc-paso__cuerpo">
            <span className="proc-paso__quien" data-rol={p.rolTag ?? 'coordinacion'}>
              {p.quien}
            </span>
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

type Seccion = {
  id: string
  categoria: 'casos' | 'voluntariado' | 'territorio' | 'automatizaciones'
  numero: string
  titulo: string
  tag: string
  descripcion: string
  diagrama?: React.ReactNode
  estados?: { estado: string; texto: string }[]
  pasos: Paso[]
  notaFinal?: string
}

export function ProcesosClient() {
  const [categoriaActiva, setCategoriaActiva] = useState<'todas' | 'casos' | 'voluntariado' | 'territorio' | 'automatizaciones'>('casos')
  const [busqueda, setBusqueda] = useState('')
  const [abiertas, setAbiertas] = useState<Record<string, boolean>>({
    '1': true,
    '2': false,
    '3': false,
    '4': false,
    '5': false,
    '6': false,
    'vol-1': true,
    'lid-1': true,
    'auto-1': true,
  })

  function toggleEtapa(id: string) {
    setAbiertas((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function expandirTodo(abrir: boolean) {
    const next: Record<string, boolean> = {}
    for (const s of SECCIONES) {
      next[s.id] = abrir
    }
    setAbiertas(next)
  }

  const SECCIONES: Seccion[] = [
    // --- CASOS ---
    {
      id: '1',
      categoria: 'casos',
      numero: 'Etapa 1',
      titulo: 'Solicitud y tamizaje automatizado',
      tag: 'Entrada de Ayuda',
      descripcion: 'La entrada de quien pide acompañamiento psicológico. El tamizaje calcula la prioridad automáticamente y la persona entra al flujo sin bloqueos.',
      diagrama: <DiagramaSolicitud />,
      pasos: [
        {
          quien: 'La persona',
          rolTag: 'persona',
          titulo: 'Llena «Necesito ayuda» en el sitio web',
          detalle: 'Queda una solicitud registrada y coordinación recibe la notificación con sus datos de contacto y motivo.',
        },
        {
          quien: 'Coordinación',
          rolTag: 'coordinacion',
          titulo: 'Le envía el enlace de tamizaje por WhatsApp',
          detalle: 'Un enlace personal y seguro con 7 preguntas breves de escala y bienestar, diseñado para responderse en 1 minuto desde el celular.',
          desvios: [
            { tono: 'reloj', titulo: '2 días sin responder:', texto: 'el barrido automático del sistema la admite igual con prioridad preventiva y la marca para llamada.' },
          ],
        },
        {
          quien: 'El sistema',
          rolTag: 'sistema',
          titulo: 'Calcula la prioridad y admite de forma automática',
          detalle: 'Con las respuestas se determina la prioridad (ALTA, MEDIA, BAJA) y la persona pasa a la columna «Por Asignar» del tablero.',
          desvios: [
            { tono: 'alerta', titulo: 'Riesgo detectado:', texto: 'la pantalla ofrece de inmediato las líneas de emergencia (106 / 123) y coordinación recibe un aviso prioritario.' },
            { tono: 'logro', titulo: 'Resultado:', texto: 'Persona admitida y disponible en la lista de Personas Acompañadas.' },
          ],
        },
      ],
    },
    {
      id: '2',
      categoria: 'casos',
      numero: 'Etapa 2',
      titulo: 'Entrada y verificación de profesionales',
      tag: 'Directorio Clínico',
      descripcion: 'Postulación y revisión de profesionales de la salud mental. La tarjeta profesional (TP) y el RETHUS garantizan la seguridad del modelo.',
      diagrama: <DiagramaProfesionales />,
      pasos: [
        {
          quien: 'Quien se postula',
          rolTag: 'profesional',
          titulo: 'Llena «Quiero dar apoyo psicológico»',
          detalle: 'Registra su formación, enfoque, experiencia clínica, ciudad y franjas de disponibilidad semanal.',
        },
        {
          quien: 'Coordinación',
          rolTag: 'coordinacion',
          titulo: 'Revisa y aprueba la postulación',
          // Decía «y acceso al portal». No lo hay: aprobar crea la ficha del
          // profesional, no una cuenta, y ninguna pantalla enlaza las dos. El
          // correo que sí sale es el de bienvenida, sin credenciales.
          detalle: 'Al aprobar, el profesional queda ACTIVO en la red y recibe su correo de bienvenida. La agenda la mantiene coordinación desde su ficha.',
        },
        {
          quien: 'El profesional',
          rolTag: 'profesional',
          titulo: 'Sube su tarjeta profesional y certificaciones',
          detalle: 'Sube sus archivos a través de un enlace seguro. Los documentos se almacenan de forma privada con enlaces temporales de 1 minuto.',
          desvios: [
            { tono: 'reloj', titulo: 'TP en verificación:', texto: 'coordinación revisa y aprueba el documento en el módulo de Verificaciones.' },
            { tono: 'logro', titulo: 'Resultado:', texto: 'Profesional verificado y elegible para emparejamiento con cupo activo.' },
          ],
        },
      ],
    },
    {
      id: '3',
      categoria: 'casos',
      numero: 'Etapa 3',
      titulo: 'Asignación y elección de hora',
      tag: 'Emparejamiento',
      descripcion:
        // «Se le avisa» en pasiva sonaba a automático y no lo es: el aviso lo
        // manda quien coordina, desde la ficha, con el mensaje del paso 3.
        // Escribirlo sin sujeto era justo lo que hacía que nadie lo mandara.
        'Al profesional se le asigna el caso y coordinación le avisa por WhatsApp desde la ficha, en vez de pedirle permiso y esperar. Luego la persona elige su hora directamente de la agenda de él.',
      diagrama: <DiagramaAsignacion />,
      estados: [
        { estado: 'ACEPTADA', texto: 'Asignado, falta que elija hora' },
        { estado: 'ACTIVA', texto: 'En acompañamiento' },
        { estado: 'RECHAZADA', texto: 'El profesional no pudo' },
        { estado: 'CERRADA', texto: 'Cerrada' },
      ],
      pasos: [
        {
          quien: 'Coordinación',
          rolTag: 'coordinacion',
          titulo: 'Elige del Top 10 y le asigna el caso',
          detalle:
            'El algoritmo calcula compatibilidad por enfoque, modalidad, cercanía y cupo libre. El mensaje le avisa de que el caso ya es suyo y de que la persona elegirá hora de su agenda.',
          desvios: [
            {
              tono: 'alerta',
              titulo: 'Por qué ya no se le pregunta:',
              texto:
                'de ocho asignaciones hechas para una persona con prioridad ALTA, siete murieron con el motivo «el profesional no respondió». Esperar un sí no le daba margen a él: dejaba el caso parado.',
            },
          ],
        },
        {
          quien: 'El profesional',
          rolTag: 'profesional',
          titulo: 'Confirma, corrige su agenda, o dice que no puede',
          detalle:
            'Desde su enlace seguro. Confirmar no es obligatorio —el caso avanza igual— pero queda registrado. No se le piden días ni horas: ya están en su perfil, y desde ese mismo enlace puede corregirlas si cambiaron, que es de donde la persona va a escoger.',
          desvios: [
            {
              tono: 'alerta',
              titulo: '«Ahora no puedo tomarlo»:',
              texto:
                'el caso se libera al instante, la persona vuelve a «Por asignar» y se le asigna a otro el mismo día. Decir por qué es opcional: exigir un motivo para decir que no es cobrarle a alguien por avisar a tiempo, que es justo lo que queremos que haga.',
            },
          ],
        },
        {
          quien: 'La persona acompañada',
          rolTag: 'persona',
          titulo: 'Elige su hora en su enlace de agenda',
          detalle:
            'Ve los espacios libres reales del profesional, agrupados por día, y escoge. El enlace le sirve para todas sus sesiones y sigue funcionando si más adelante la acompaña otra persona.',
          desvios: [
            {
              tono: 'reloj',
              titulo: '3 días sin elegir hora:',
              texto:
                'se libera el profesional y el caso vuelve a la cola. El plazo es más largo que el de él a propósito: quien pide ayuda puede estar sin batería, sin datos o sin cabeza.',
            },
            { tono: 'logro', titulo: 'Resultado:', texto: 'Asignación activa y cita programada.' },
          ],
        },
      ],
      notaFinal:
        'Una asignación reserva cupo preventivo para no sobrecargar profesionales. Al liberarse o reasignarse, el cupo se devuelve de inmediato.',
    },
    {
      id: '4',
      categoria: 'casos',
      numero: 'Etapa 4',
      titulo: 'La cita queda agendada',
      tag: 'Agenda y Horarios',
      descripcion:
        'La elige ella desde su enlace, sobre los espacios libres reales del profesional, y en esa misma pantalla acepta el consentimiento. Son un solo acto: sin la firma no se crea nada. La cita nace CONFIRMADA porque ya no le falta nada. PROGRAMADA queda solo para las horas que pone coordinación a mano, que sí llegan sin firma.',
      estados: [
        { estado: 'CONFIRMADA', texto: 'Elegida y firmada por ella' },
        { estado: 'PROGRAMADA', texto: 'Puesta a mano, falta la firma' },
      ],
      pasos: [
        {
          quien: 'La persona acompañada',
          rolTag: 'persona',
          titulo: 'Escoge de los huecos libres, agrupados por día',
          detalle:
            'El sistema resta lo que ya está ocupado, respeta los bloqueos que el profesional marcó —descanso, vacaciones— y esconde las horas que chocan con otra cita suya. Lo que ve son huecos reales, no propuestas.',
        },
        {
          quien: 'La persona acompañada',
          rolTag: 'persona',
          titulo: 'Lee el consentimiento y lo acepta, ahí mismo',
          detalle:
            'La lista de horas se sustituye por la confirmación: la hora que escogió, el consentimiento debajo, y un solo botón que hace las dos cosas. El texto completo vive además en su propia página, /consentimiento-informado, para leerlo con calma o enseñárselo a alguien.',
          desvios: [
            {
              tono: 'alerta',
              titulo: 'Por qué no se aparta la hora mientras lee:',
              texto:
                'se apartaba, y quien cerraba sin firmar dejaba ocupado un espacio que no servía para nada —sin consentimiento no se empieza la sesión—. La hora bloqueada era real; la sesión, no. Ahora, si falta la firma, no se crea nada.',
            },
            {
              tono: 'logro',
              titulo: 'Al confirmar:',
              texto:
                'la cita nace CONFIRMADA, la asignación pasa a ACTIVA, y a los dos les sale solo un correo con el día, la hora y su propio enlace de sala. Quien ya firmó en una sesión anterior no lo vuelve a ver: la firma es de la persona, no de la cita.',
            },
          ],
        },
        {
          quien: 'Coordinación',
          rolTag: 'coordinacion',
          titulo: 'Solo si hace falta: agendar a mano',
          detalle:
            'Si la persona prefiere escribir a entrar a una pantalla —hay quien lo prefiere, y a quien está mal no se le pone una barrera— coordinación puede agendarle desde su ficha. El enlace se conserva para las siguientes. Estas son las citas que sí nacen PROGRAMADA: la firma se pide después, por su enlace.',
          desvios: [
            {
              tono: 'reloj',
              titulo: '3 días sin elegir hora:',
              texto:
                'el barrido libera al profesional y el caso vuelve a la cola. El tablero avisa cuáles se liberan mañana, que es la ventana para escribirle antes.',
            },
          ],
        },
      ],
    },
    {
      id: '5',
      categoria: 'casos',
      numero: 'Etapa 5',
      titulo: 'La sesión: lo que sale solo y lo que no',
      tag: 'Sesión y Consentimiento',
      descripcion:
        'La sesión dura 45 minutos. Preparar no es un instante: tiene momentos, y la ficha de la cita enseña uno a la vez, el que toca. Los correos salen solos a los dos; los WhatsApp siguen siendo manuales, y por eso la ficha dice cuál escribir ahora.',
      diagrama: <DiagramaCita />,
      estados: [
        { estado: 'CONFIRMADA', texto: 'Confirmada' },
        { estado: 'REALIZADA', texto: 'Realizada' },
      ],
      pasos: [
        {
          quien: 'El sistema',
          rolTag: 'sistema',
          titulo: 'Al agendarse, los dos correos salen solos',
          detalle: 'Al profesional, con la fecha y el enlace de su sala. A la persona, con la hora, la modalidad y su propio enlace de entrada —dos llaves firmadas distintas, no la misma—. Ninguno depende de que alguien se acuerde de despacharlo.',
          desvios: [
            { tono: 'alerta', titulo: 'Si no dejó correo:', texto: 'dar correo es opcional al pedir ayuda, y quien no lo dio no recibe nada. La ficha de la cita lo dice y pide el WhatsApp, en vez de dar por hecho que le llegó.' },
          ],
        },
        {
          quien: 'Coordinación',
          rolTag: 'coordinacion',
          titulo: 'Primero confirmar, después recordar',
          detalle: 'Recién agendada, la ficha ofrece confirmársela a los dos por WhatsApp. Cuando se acerca la hora, ofrece los recordatorios. Son dos actos con dos textos distintos —«quedó agendada, aquí tienes tu enlace» contra «es hoy, nos vemos»— y entre uno y otro pueden pasar dos semanas.',
          desvios: [
            { tono: 'alerta', titulo: 'Por qué importa el orden:', texto: 'la ficha solo sabía preguntar «¿es hoy?», así que a una cita recién agendada para esa noche le pedía recordar. Recordarle a alguien algo que todavía no se le ha contado no es un recordatorio.' },
          ],
        },
        {
          quien: 'La persona',
          rolTag: 'persona',
          titulo: 'El consentimiento ya está firmado',
          detalle: 'Lo firmó al elegir su hora: sin eso la cita no existiría. Si vuelve a agendar, la hereda y no se le pide otra vez. Solo hay que pedírselo aparte cuando la cita la puso coordinación a mano — y ahí la ficha lo pone de primero, porque sin firma no se empieza la sesión.',
          desvios: [
            { tono: 'logro', titulo: 'Firma inmutable:', texto: 'el nombre tecleado es la firma; queda en auditoría con la versión exacta del texto que aceptó y la marca de tiempo.' },
          ],
        },
        {
          quien: 'El día de la sesión',
          rolTag: 'profesional',
          titulo: 'La cita se cierra sola cuando hay prueba',
          detalle: 'Ya no hay que marcarla a mano. Si el profesional reporta la sesión, o si las dos personas entraron a la sala, la cita pasa a Realizada sola; si él reporta que no se presentó, a No asistió. Sin ninguna de las dos pruebas se queda abierta y sale en «Lo que está esperando», en Métricas.',
        },
      ],
    },
    {
      id: '6',
      categoria: 'casos',
      numero: 'Etapa 6',
      titulo: 'Seguimiento, reporte clínico, feedback y cierre',
      tag: 'Cierre y Métricas',
      descripcion: 'El profesional reporta qué sigue, la persona evalúa su experiencia y coordinación cierra el caso con motivo formal.',
      diagrama: <DiagramaCierre />,
      pasos: [
        {
          quien: 'El profesional',
          rolTag: 'profesional',
          titulo: 'Diligencia el reporte de sesión desde su enlace',
          detalle: 'Indica si la sesión se llevó a cabo y si la persona requiere más sesiones, si con esta fue suficiente o si se remite a otra institución.',
          desvios: [
            { tono: 'alerta', titulo: '«No asistió»:', texto: 'coordinación puede reprogramar o comunicarse con la persona.' },
          ],
        },
        {
          quien: 'La persona',
          rolTag: 'persona',
          titulo: 'Responde la encuesta de experiencia (Feedback)',
          detalle: 'Evalúa de forma 100% anónima el trato recibido, cómo se siente y la utilidad de las herramientas brindadas.',
        },
        {
          quien: 'Coordinación',
          rolTag: 'coordinacion',
          titulo: 'Lee el reporte y cierra el caso con motivo',
          detalle: 'El cierre libera el cupo del profesional y traslada el caso a «Cerrados recientes» en métricas. No se puede cerrar sin haber leído el reporte.',
        },
        {
          quien: 'El sistema',
          rolTag: 'sistema',
          titulo: 'Si la sesión se cae, el caso retrocede a «elige su hora»',
          detalle: 'Una cita cancelada no es una sesión que ocurrió: el caso vuelve al paso 4 y la ficha pide agendar otra, con la hora que se cayó a la vista. No asistir sí cuenta como sesión —la hora llegó y se gastó—, así que eso sí avanza a seguimiento.',
          desvios: [
            { tono: 'alerta', titulo: 'Lo que hacía antes:', texto: 'se quedaba en «Preparar la sesión» sin ninguna sesión que preparar, con «nada pendiente» y el tablero pidiendo un reporte de algo que no pasó.' },
          ],
        },
      ],
    },

    // --- VOLUNTARIADO ---
    {
      id: 'vol-1',
      categoria: 'voluntariado',
      numero: 'Voluntariado',
      titulo: 'Voluntariado de apoyo interdisciplinario y tareas internas',
      tag: 'Operación y Logística',
      descripcion: 'Gestión de voluntarios de diversas disciplinas (Social, Legal, Operación, Comunicaciones, Tecnología) para tareas operativas internas.',
      diagrama: <DiagramaVoluntariadoTareas />,
      estados: [
        { estado: 'BORRADOR', texto: 'Borrador' },
        { estado: 'ABIERTA', texto: 'Abierta' },
        { estado: 'EN_PROGRESO', texto: 'En progreso' },
        { estado: 'COMPLETADA', texto: 'Completada' },
      ],
      pasos: [
        {
          quien: 'El voluntario',
          rolTag: 'voluntario',
          titulo: 'Se registra en «Quiero apoyar»',
          detalle: 'Indica su profesión, área de interés, ciudad, modalidad (presencial/virtual) y horas disponibles a la semana.',
        },
        {
          quien: 'Coordinación',
          rolTag: 'coordinacion',
          titulo: 'Crea una tarea interna y asigna al voluntario',
          detalle: 'Define la labor (ej. Verificación de TP, llamadas de seguimiento, diseño, desarrollo) y selecciona al voluntario compatible.',
        },
        {
          quien: 'El voluntario',
          rolTag: 'voluntario',
          titulo: 'Recibe correo con enlace seguro y confirma turno',
          detalle: 'A través de un enlace HMAC seguro (/turno/[token]), ve los detalles de la labor y confirma o declina su participación con un clic.',
          desvios: [
            { tono: 'logro', titulo: 'Al aceptar:', texto: 'la asignación pasa a ACEPTADA y la tarea entra en EN_PROGRESO.' },
            { tono: 'alerta', titulo: 'Al declinar:', texto: 'coordinación recibe el aviso con el motivo para reasignar la tarea.' },
          ],
        },
        {
          quien: 'Coordinación',
          rolTag: 'coordinacion',
          titulo: 'Supervisa y marca la tarea como COMPLETADA',
          detalle: 'Una vez finalizada la labor, se registra el cumplimiento y queda el rastro en auditoría.',
        },
      ],
    },

    // --- TERRITORIO ---
    {
      id: 'lid-1',
      categoria: 'territorio',
      numero: 'Territorio',
      titulo: 'Líderes comunitarios y articulación territorial',
      tag: 'Comunidad',
      descripcion: 'Módulo exclusivo para Administradores y Líderes Comunitarios para mapear necesidades y articular apoyo psicosocial en barrios y veredas.',
      diagrama: <DiagramaLideresComunitarios />,
      pasos: [
        {
          quien: 'Coordinación / Líder',
          rolTag: 'lider',
          titulo: 'Identifica la comunidad y registra la ficha territorial',
          detalle: 'Registra el nombre del líder, ubicación (municipio, barrio, vereda), datos de contacto y enfoque comunitario.',
        },
        {
          quien: 'Coordinación',
          rolTag: 'coordinacion',
          titulo: 'Diagnostica necesidades prioritarias',
          detalle: 'Asocia las necesidades identificadas en las familias (apoyo alimentario, duelo, violencia, primeros auxilios psicológicos).',
        },
        {
          quien: 'Equipo Territorial',
          rolTag: 'lider',
          titulo: 'Articulación directa y notas de seguimiento',
          detalle: 'Genera mensajes institucionales de WhatsApp personalizados y registra notas de campo en la ficha comunitaria.',
          desvios: [
            { tono: 'logro', titulo: 'Seguridad y roles:', texto: 'este módulo solo es accesible para roles ADMIN y LIDERES_COMUNITARIOS.' },
          ],
        },
      ],
    },

    // --- AUTOMATIZACIONES ---
    {
      id: 'auto-1',
      categoria: 'automatizaciones',
      numero: 'Automatizaciones',
      titulo: 'Relojes del sistema, liberaciones automáticas y auditoría',
      tag: 'Reglas del Sistema',
      descripcion: 'Procesos de fondo que mantienen la red en movimiento continuo sin depender de intervenciones manuales.',
      pasos: [
        {
          quien: 'Reloj de Tamizaje',
          rolTag: 'sistema',
          titulo: 'Admisión por silencio a los 2 días',
          detalle: 'Si una persona no responde el tamizaje en 48 horas, el sistema la admite automáticamente con prioridad preventiva para no dejarla esperando.',
        },
        {
          quien: 'Reloj de asignaciones antiguas',
          rolTag: 'sistema',
          titulo: 'Liberación de propuestas viejas a los 2 días',
          detalle:
            'Solo aplica a las asignaciones anteriores al cambio, que quedaron esperando un «sí» que ya nadie va a dar: el enlace donde se respondía dejó de ser parte del camino. Ninguna asignación nueva pasa por ahí — nacen asignadas.',
        },
        {
          quien: 'Reloj de Disponibilidad',
          rolTag: 'sistema',
          titulo: 'Confirmación de agenda cada mes',
          detalle:
            'Se le pregunta al profesional si su agenda sigue al día. Es lo que sostiene que se le asigne sin consultarle: la persona elige su hora de esa agenda, y una vieja la manda a una hora en la que él ya no está. No responder no tiene castigo — se le vuelve a preguntar al mes siguiente y sigue recibiendo casos. Guardar sus horarios cuenta como respuesta.',
        },
        {
          quien: 'Reloj de Cita',
          rolTag: 'sistema',
          titulo: 'Liberación de horario a los 3 días',
          detalle: 'Si la persona acompañada no confirma el horario en 72 horas, se libera el horario del profesional para que pueda recibir otro caso.',
        },
        {
          quien: 'Momentos de la cita',
          rolTag: 'sistema',
          titulo: 'La ficha decide qué WhatsApp toca ahora',
          detalle:
            'No es un reloj de fondo: es la ficha de la cita mirando en qué momento está. Falta la firma → pedirla. Recién agendada (12 h) → confirmársela a los dos. Se acerca la hora (24 h) → recordársela. Sin correo → confirmársela a mano. Uno a la vez, y los demás mensajes quedan plegados debajo.',
        },
        {
          quien: 'Correos de la cita',
          rolTag: 'sistema',
          titulo: 'Confirmación al agendar y recordatorio antes de la sesión',
          detalle:
            'Al agendarse salen dos correos, uno a cada uno, con su propio enlace de sala. Horas antes de la sesión salen los recordatorios. Los cuatro textos se editan en Parametrización.',
        },
        {
          quien: 'Auditoría Granular',
          rolTag: 'sistema',
          titulo: 'Trazabilidad de datos de salud y accesos',
          detalle: 'Registra quién consulta, edita o elimina información con IP, fecha exacta y rango de fechas consultables.',
        },
      ],
    },
  ]

  const seccionesFiltradas = useMemo(() => {
    return SECCIONES.filter((s) => {
      // Filtro de categoría
      if (categoriaActiva !== 'todas' && s.categoria !== categoriaActiva) {
        return false
      }

      // Filtro de búsqueda
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim()
        const matchTitulo = s.titulo.toLowerCase().includes(q)
        const matchDesc = s.descripcion.toLowerCase().includes(q)
        const matchTag = s.tag.toLowerCase().includes(q)
        const matchPasos = s.pasos.some((p) => p.titulo.toLowerCase().includes(q) || p.detalle.toLowerCase().includes(q) || p.quien.toLowerCase().includes(q))
        if (!matchTitulo && !matchDesc && !matchTag && !matchPasos) return false
      }

      return true
    })
  }, [categoriaActiva, busqueda])

  return (
    <>
      {/* Hero Banner Visual */}
      <div className="proc-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Sparkles size={22} style={{ color: '#34d399' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a7f3d0' }}>
            Guía Operativa y Arquitectura de Procesos
          </span>
        </div>
        <h1 className="proc-hero__title">Cómo funciona la Red Aquí Estamos</h1>
        <p className="proc-hero__desc">
          Conoce el ciclo de vida completo de la red: desde la solicitud de ayuda y el emparejamiento clínico,
          hasta el voluntariado interdisciplinario, la articulación territorial y las reglas automáticas del sistema.
        </p>
      </div>

      {/* Selector de Categorías / Pestañas */}
      <div className="proc-tabs">
        <button
          type="button"
          onClick={() => setCategoriaActiva('casos')}
          className={`proc-tab-btn ${categoriaActiva === 'casos' ? 'activo' : ''}`}
        >
          <HeartHandshake size={16} />
          <span>Acompañamiento Psicológico</span>
          <span className="proc-tab-btn__badge">7 pasos</span>
        </button>

        <button
          type="button"
          onClick={() => setCategoriaActiva('voluntariado')}
          className={`proc-tab-btn ${categoriaActiva === 'voluntariado' ? 'activo' : ''}`}
        >
          <Users size={16} />
          <span>Voluntariado y Tareas</span>
          <span className="proc-tab-btn__badge">Turnos</span>
        </button>

        <button
          type="button"
          onClick={() => setCategoriaActiva('territorio')}
          className={`proc-tab-btn ${categoriaActiva === 'territorio' ? 'activo' : ''}`}
        >
          <MapPin size={16} />
          <span>Líderes Comunitarios</span>
          <span className="proc-tab-btn__badge">Territorio</span>
        </button>

        <button
          type="button"
          onClick={() => setCategoriaActiva('automatizaciones')}
          className={`proc-tab-btn ${categoriaActiva === 'automatizaciones' ? 'activo' : ''}`}
        >
          <Cpu size={16} />
          <span>Automatizaciones</span>
          <span className="proc-tab-btn__badge">Relojes</span>
        </button>

        <button
          type="button"
          onClick={() => setCategoriaActiva('todas')}
          className={`proc-tab-btn ${categoriaActiva === 'todas' ? 'activo' : ''}`}
        >
          <span>Ver todo</span>
        </button>
      </div>

      {/* Cinta del Viaje Completo (cuando está en Casos o Todas) */}
      {(categoriaActiva === 'casos' || categoriaActiva === 'todas') && !busqueda.trim() && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <HeartHandshake size={18} style={{ color: 'var(--color-primary, #059669)' }} />
            <h2 style={{ margin: 0, fontSize: '1.15rem' }}>El viaje del caso (Punta a Punta)</h2>
          </div>
          {/*
            Los mismos siete de `lib/pasosDelCaso.ts`, con sus mismos nombres.

            Esta tira contaba seis: fundía «llega la solicitud» con «admisión» y
            «la sesión» con «seguimiento y cierre». Quien aprendía el proceso
            aquí y luego miraba una ficha veía dos numeraciones distintas para lo
            mismo, y ninguna pantalla decía cuál mandaba. La secuencia viva es la
            del código, así que es la que se enseña.
          */}
          <p className="proc-intro">
            Siete pasos coordinados. Las esperas tienen reloj: si nadie agenda, el sistema libera automáticamente
            y el caso regresa a la cola en vez de quedarse detenido.
          </p>
          <div className="proc-viaje">
            <span className="proc-viaje__etapa"><span>1</span>Llega la solicitud</span>
            <span className="proc-viaje__flecha">→</span>
            <span className="proc-viaje__etapa"><span>2</span>Admisión</span>
            <span className="proc-viaje__flecha">→</span>
            <span className="proc-viaje__etapa"><span>3</span>Asignar profesional</span>
            <span className="proc-viaje__flecha">→</span>
            <span className="proc-viaje__etapa"><span>4</span>Elige su hora</span>
            <span className="proc-viaje__flecha">→</span>
            <span className="proc-viaje__etapa"><span>5</span>Preparar la sesión</span>
            <span className="proc-viaje__flecha">→</span>
            <span className="proc-viaje__etapa"><span>6</span>La sesión</span>
            <span className="proc-viaje__flecha">→</span>
            <span className="proc-viaje__etapa"><span>7</span>Seguimiento y cierre</span>
          </div>

          <div style={{ marginTop: 14 }}>
            <DiagramaDelFlujo />
          </div>
        </div>
      )}

      {/* Toolbar con buscador y acciones */}
      <div className="proc-toolbar">
        <div className="proc-search-box">
          <Search size={16} className="proc-search-icon" />
          <input
            type="text"
            placeholder="Buscar por proceso, rol, reloj, palabra clave..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="proc-search-input"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className="boton-mini"
            onClick={() => expandirTodo(true)}
            style={{ fontSize: '0.78rem' }}
          >
            Expandir todo
          </button>
          <button
            type="button"
            className="boton-mini"
            onClick={() => expandirTodo(false)}
            style={{ fontSize: '0.78rem' }}
          >
            Colapsar todo
          </button>
        </div>
      </div>

      {/* Lista de Secciones de Procesos */}
      {seccionesFiltradas.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <p style={{ color: '#64748b', margin: '0 0 12px', fontSize: '0.95rem' }}>
            No encontramos ningún proceso que coincida con «<strong>{busqueda}</strong>».
          </p>
          <button
            type="button"
            className="boton-mini"
            onClick={() => setBusqueda('')}
          >
            Restablecer búsqueda
          </button>
        </div>
      ) : (
        seccionesFiltradas.map((sec) => {
          const estaAbierta = abiertas[sec.id] ?? false

          return (
            <details
              key={sec.id}
              className="proc-etapa"
              open={estaAbierta}
              onToggle={(e) => {
                const target = e.currentTarget
                setAbiertas((prev) => ({ ...prev, [sec.id]: target.open }))
              }}
            >
              <summary>
                <div className="proc-etapa__header-left">
                  <span className="proc-etapa__tag">{sec.numero}</span>
                  <span>{sec.titulo}</span>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    • {sec.tag}
                  </span>
                </div>
                <span className="proc-etapa__chevron">›</span>
              </summary>

              <div className="proc-etapa__contenido">
                <p className="proc-intro">{sec.descripcion}</p>

                {sec.diagrama ? (
                  <div style={{ margin: '14px 0 16px' }}>
                    {sec.diagrama}
                  </div>
                ) : null}

                {sec.estados ? (
                  <Estados cadena={sec.estados} />
                ) : null}

                <Flujo pasos={sec.pasos} />

                {sec.notaFinal ? (
                  <p className="proc-intro" style={{ marginTop: 16, fontSize: '0.86rem', background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    💡 <strong>Nota operativa:</strong> {sec.notaFinal}
                  </p>
                ) : null}
              </div>
            </details>
          )
        })
      )}
    </>
  )
}
