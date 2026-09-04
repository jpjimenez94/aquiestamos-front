import { Caja, Flecha, Nota, Lienzo } from './piezas'

/**
 * El flujograma propio de cada etapa. Mismo lenguaje visual que el diagrama
 * maestro: ámbar = espera con reloj, verde = avanzó, rojo punteado = vuelve
 * a la cola. Se dibujan en el servidor: cero JavaScript en el navegador.
 */

export function DiagramaSolicitud() {
  return (
    <Lienzo
      ancho={720}
      alto={330}
      etiqueta="Flujo de la solicitud: formulario, tamizaje por enlace, y admisión automática con prioridad — por respuesta o por silencio de 2 días. Una respuesta de riesgo dispara el aviso urgente."
    >
      <Caja x={30} y={30} w={200} titulo="«Necesito ayuda»" detalle="formulario del sitio" />
      <Flecha d="M 230 57 H 274" />
      <Caja x={276} y={30} w={200} titulo="Tamizaje por enlace" detalle="7 preguntas · WhatsApp" tono="espera" />

      {/* responde */}
      <Flecha d="M 376 84 V 128" />
      <Nota x={462} y={110} texto="responde en un minuto" />
      <Caja x={276} y={130} w={200} titulo="Prioridad calculada" detalle="alta · media · baja" />

      {/* riesgo */}
      <Flecha d="M 476 157 H 518" tono="alerta" />
      <Caja x={520} y={130} w={180} titulo="Riesgo detectado" detalle="líneas 123/106 + aviso urgente" tono="alerta" />

      {/* silencio: baja por la izquierda directo a la admisión */}
      <Flecha d="M 276 57 H 240 V 257 H 274" tono="alerta" />
      <Nota x={157} y={160} texto="2 días sin responder" tono="alerta" />
      <Nota x={157} y={173} texto="el barrido la admite igual" tono="alerta" />

      {/* admisión */}
      <Flecha d="M 376 184 V 228" />
      <Caja x={276} y={230} w={200} titulo="Admitida sola" detalle="sin que nadie haga clic" tono="logro" />
      <Flecha d="M 476 257 H 518" />
      <Caja x={520} y={230} w={180} titulo="Por Asignar" detalle="columna 1 del tablero" tono="final" />
    </Lienzo>
  )
}

export function DiagramaProfesionales() {
  return (
    <Lienzo
      ancho={720}
      alto={230}
      etiqueta="Flujo del profesional: postulación, aprobación, subida y verificación de la tarjeta profesional, y elegibilidad con cupo."
    >
      <Caja x={30} y={30} w={200} titulo="Se postula" detalle="«Quiero dar apoyo»" />
      <Flecha d="M 230 57 H 274" />
      <Caja x={276} y={30} w={200} titulo="Coordinación aprueba" detalle="correo de bienvenida (sin portal)" />
      <Flecha d="M 476 57 H 520" />
      <Caja x={522} y={30} w={170} titulo="Activo" detalle="en la red" tono="logro" />

      <Flecha d="M 607 84 V 128" />
      <Caja x={522} y={130} w={170} titulo="Sube su tarjeta" detalle="bucket privado" />
      <Flecha d="M 522 157 H 478" />
      <Caja x={276} y={130} w={200} titulo="Coordinación verifica" detalle="desde Postulaciones" tono="espera" />
      <Flecha d="M 276 157 H 232" />
      <Caja x={30} y={130} w={200} titulo="Elegible con cupo" detalle="TP sin verificar = aviso rojo" tono="final" />
    </Lienzo>
  )
}

/**
 * Esta pantalla le enseña el proceso a quien acaba de entrar a coordinar, así
 * que un diagrama viejo no es un dibujo desactualizado: es alguien aprendiendo
 * un flujo que ya no existe y esperando un paso que nunca va a llegar.
 *
 * Lo que cambió: la asignación ya no nace en PROPUESTA esperando un «sí». Nace
 * ACEPTADA —se le asigna al profesional y se le avisa— y la persona elige su
 * hora sola desde su enlace. El profesional puede declinar, y esa puerta sigue
 * abierta hasta que ella agenda.
 */
export function DiagramaAsignacion() {
  return (
    <Lienzo
      ancho={760}
      alto={330}
      etiqueta="La máquina de estados de la asignación: se asigna y se avisa, la persona elige su hora y el acompañamiento arranca. Si el profesional declina o ella no elige hora a tiempo, el caso vuelve a la cola."
    >
      <Caja x={30} y={30} w={200} titulo="Emparejamiento" detalle="top 10 por afinidad y cupo" />
      <Flecha d="M 230 57 H 274" />
      <Caja
        x={276}
        y={30}
        w={210}
        titulo="ACEPTADA"
        detalle="se le asigna · coordinación avisa"
        tono="espera"
      />

      <Flecha d="M 381 84 V 128" />
      <Nota x={462} y={110} texto="elige su hora en su enlace" />
      <Caja x={276} y={130} w={210} titulo="ACTIVA" detalle="en acompañamiento" tono="logro" />

      <Flecha d="M 381 184 V 218" />
      <Caja x={276} y={220} w={210} h={44} titulo="CERRADA" tono="final" />

      {/* la cola, a la derecha, recibe las liberaciones */}
      <Caja x={560} y={30} w={170} titulo="Vuelve a la cola" detalle="Por Asignar · cupo libre" tono="alerta" />
      <Flecha d="M 486 57 H 558" tono="alerta" />
      <Nota x={528} y={78} texto="declina · 3 días sin elegir hora" tono="alerta" />

      <Nota x={560} y={110} texto="se le asigna a otro profesional" />
    </Lienzo>
  )
}

export function DiagramaCita() {
  return (
    <Lienzo
      ancho={760}
      alto={430}
      etiqueta="Flujo de la cita. Arriba, el camino normal: ella escoge una hora libre y acepta el consentimiento en el mismo acto, así que la cita nace CONFIRMADA. Abajo, el camino de coordinación, que sí crea la cita antes de la firma. Después, los momentos de prepararla y los cuatro finales."
    >
      {/* el camino normal: la persona, en un solo acto */}
      <Caja x={30} y={26} w={210} titulo="Ella abre su enlace" detalle="huecos libres reales" />
      <Flecha d="M 240 53 H 284" />
      <Caja
        x={286}
        y={26}
        w={230}
        titulo="Escoge hora + acepta"
        detalle="una sola decisión"
        tono="espera"
      />
      <Nota x={401} y={96} texto="sin la firma no se crea nada: la hora sigue libre" tono="alerta" />

      <Flecha d="M 516 53 H 560" />
      <Caja x={562} y={26} w={170} titulo="CONFIRMADA" detalle="no le falta nada" tono="logro" />

      {/* el camino de coordinación, que sí necesita la firma después */}
      <Caja x={30} y={140} w={210} titulo="O la pone coordinación" detalle="si ella prefiere escribir" />
      <Flecha d="M 240 167 H 284" />
      <Caja x={286} y={140} w={230} titulo="PROGRAMADA" detalle="falta que ella firme" tono="alerta" />
      <Flecha d="M 401 194 V 218" />
      <Caja x={286} y={220} w={230} titulo="Firma por su enlace" detalle="su nombre tecleado es la firma" tono="logro" />
      {/* rodea por fuera para no cruzar las cajas de la derecha */}
      <Flecha d="M 516 247 H 540 V 157 H 560" />

      {/* preparar la sesión: primero confirmar, después recordar */}
      <Flecha d="M 647 80 V 128" />
      <Caja x={562} y={130} w={170} titulo="Confirmar a los dos" detalle="correo solo · WhatsApp a mano" />
      <Flecha d="M 647 184 V 228" />
      <Caja x={562} y={230} w={170} titulo="Recordar a los dos" detalle="cuando se acerca la hora" />

      <Flecha d="M 647 284 V 358" />
      <Caja
        x={432}
        y={360}
        w={300}
        h={54}
        titulo="El día de la sesión"
        detalle="realizada · no asistió · cancelada · reprogramada"
      />
      <Nota x={230} y={380} texto="cancelada: el caso vuelve a «elige su hora»" tono="alerta" />
    </Lienzo>
  )
}

export function DiagramaCierre() {
  return (
    <Lienzo
      ancho={760}
      alto={330}
      etiqueta="Flujo del seguimiento: pasa la sesión, el profesional reporta qué pasó y qué sigue, y coordinación agenda otra cita o cierra el caso con motivo."
    >
      <Caja x={30} y={30} w={190} titulo="Pasa la sesión" />
      <Flecha d="M 220 57 H 264" />
      <Caja x={266} y={30} w={220} titulo="El profesional reporta" detalle="desde su mismo enlace" tono="espera" />
      <Flecha d="M 486 57 H 530" />
      <Caja x={532} y={30} w={200} titulo="«¿Qué sigue?»" detalle="obligatoria si la sesión se hizo" />

      {/* necesita mas */}
      <Flecha d="M 632 84 V 128" />
      <Nota x={548} y={110} texto="«necesita más sesiones»" />
      <Caja x={532} y={130} w={200} titulo="Nueva cita" detalle="el ciclo se repite" tono="logro" />

      {/* suficiente */}
      <Flecha d="M 532 57 H 500 V 230 H 490" />
      <Nota x={420} y={218} texto="«con esta fue suficiente»" />
      <Caja x={266} y={203} w={220} titulo="Cerrar caso" detalle="motivo + confirmación" tono="final" />

      {/* no se presento */}
      <Flecha d="M 376 84 V 128" tono="alerta" />
      <Nota x={300} y={110} texto="«no se presentó»" tono="alerta" />
      <Caja x={266} y={130} w={220} h={44} titulo="No asistió → reagendar" tono="alerta" />

      <Flecha d="M 376 257 V 288" />
      <Nota x={590} y={302} texto="cerrar exige al menos un reporte leído" />
      <Caja x={266} y={290} w={220} h={36} titulo="Cerrados recientes" tono="logro" />
    </Lienzo>
  )
}

export function DiagramaVoluntariadoTareas() {
  return (
    <Lienzo
      ancho={760}
      alto={320}
      etiqueta="Flujo de voluntariado de apoyo y gestión de tareas: postulación multidisciplinaria, creación de tareas, invitación por correo con enlace seguro, confirmación de turno y ejecución."
    >
      <Caja x={30} y={30} w={200} titulo="«Quiero apoyar»" detalle="registro multidisciplinario" />
      <Flecha d="M 230 57 H 274" />
      <Caja x={276} y={30} w={200} titulo="Directorio de Apoyo" detalle="salud, legal, logística, tech" tono="logro" />
      <Flecha d="M 476 57 H 520" />
      <Caja x={522} y={30} w={200} titulo="Coordinación crea tarea" detalle="área, prioridad y fecha límite" />

      <Flecha d="M 622 84 V 128" />
      <Caja x={522} y={130} w={200} titulo="Asigna voluntario" detalle="invitación por email con link" tono="espera" />

      <Flecha d="M 522 157 H 478" />
      <Caja x={276} y={130} w={200} titulo="Voluntario responde" detalle="acepta o declina por link seguro" tono="espera" />

      {/* Acepta */}
      <Flecha d="M 376 184 V 228" />
      <Nota x={460} y={210} texto="«Acepta apoyar»" />
      <Caja x={276} y={230} w={200} titulo="En progreso" detalle="trabajando en la labor" tono="logro" />

      {/* Declina */}
      <Flecha d="M 276 157 H 232" tono="alerta" />
      <Nota x={145} y={148} texto="«No puede»" tono="alerta" />
      <Caja x={30} y={130} w={200} titulo="Reasignar tarea" detalle="se invita a otro voluntario" tono="alerta" />

      {/* Completada */}
      <Flecha d="M 476 257 H 520" />
      <Caja x={522} y={230} w={200} titulo="COMPLETADA" detalle="tarea cerrada con éxito" tono="final" />
    </Lienzo>
  )
}

export function DiagramaLideresComunitarios() {
  return (
    <Lienzo
      ancho={760}
      alto={260}
      etiqueta="Flujo de articulación territorial y líderes comunitarios: diagnóstico barrial, registro de líder, mapeo de necesidades de familias y articulación psicosocial directa."
    >
      <Caja x={30} y={30} w={200} titulo="Identificación en territorio" detalle="comunidad, barrio o vereda" />
      <Flecha d="M 230 57 H 274" />
      <Caja x={276} y={30} w={220} titulo="Ficha del líder" detalle="contacto + necesidades prioritarias" tono="espera" />
      <Flecha d="M 496 57 H 540" />
      <Caja x={542} y={30} w={190} titulo="Mensaje de articulación" detalle="WhatsApp personalizado" tono="logro" />

      <Flecha d="M 637 84 V 128" />
      <Caja x={542} y={130} w={190} titulo="Notas de seguimiento" detalle="rastro de visitas y acuerdos" />

      <Flecha d="M 542 157 H 498" />
      <Caja x={276} y={130} w={220} titulo="Articulación activa" detalle="apoyo psicológico y social" tono="final" />
    </Lienzo>
  )
}

