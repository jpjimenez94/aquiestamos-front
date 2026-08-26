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
      <Caja x={276} y={30} w={200} titulo="Coordinación aprueba" detalle="correo de bienvenida" />
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

export function DiagramaAsignacion() {
  return (
    <Lienzo
      ancho={760}
      alto={380}
      etiqueta="La máquina de estados de la asignación: propuesta, aceptada, activa y cerrada, con las liberaciones por rechazo o silencio que devuelven el caso a la cola."
    >
      <Caja x={30} y={30} w={200} titulo="Emparejamiento" detalle="top 10 por afinidad y cupo" />
      <Flecha d="M 230 57 H 274" />
      <Caja x={276} y={30} w={210} titulo="PROPUESTA" detalle="WhatsApp con su enlace" tono="espera" />

      <Flecha d="M 381 84 V 128" />
      <Nota x={478} y={110} texto="«sí puedo» + sus días y franjas" />
      <Caja x={276} y={130} w={210} titulo="ACEPTADA" detalle="falta cuadrar horario" tono="espera" />

      <Flecha d="M 381 184 V 228" />
      <Nota x={462} y={210} texto="la persona confirma" />
      <Caja x={276} y={230} w={210} titulo="ACTIVA" detalle="en acompañamiento" tono="logro" />

      <Flecha d="M 381 284 V 318" />
      <Caja x={276} y={320} w={210} h={44} titulo="CERRADA" tono="final" />

      {/* la cola, a la derecha, recibe las liberaciones */}
      <Caja x={560} y={130} w={170} titulo="Vuelve a la cola" detalle="Por Asignar · cupo libre" tono="alerta" />
      <Flecha d="M 486 57 H 645 V 128" tono="alerta" />
      <Nota x={651} y={78} texto="rechaza · 2 días en silencio" tono="alerta" />
      <Flecha d="M 486 157 H 558" tono="alerta" />
      <Nota x={522} y={148} texto="3 días" tono="alerta" />

      <Nota x={645} y={210} texto="se le propone a otro profesional" />
    </Lienzo>
  )
}

export function DiagramaCita() {
  return (
    <Lienzo
      ancho={760}
      alto={390}
      etiqueta="Flujo de la cita: validación del horario contra la oferta del caso y la agenda, confirmaciones por WhatsApp, firma del consentimiento por enlace, y los cuatro finales de la cita."
    >
      <Caja x={30} y={30} w={200} titulo="Coordinación agenda" detalle="fecha + modalidad" />
      <Flecha d="M 230 57 H 274" />
      <Caja x={276} y={30} w={230} titulo="¿El horario cabe?" detalle="oferta del caso · agenda general" tono="espera" />
      <Nota x={392} y={100} texto="fuera de ambas: casilla auditada · bloqueo: nunca" tono="alerta" />

      <Flecha d="M 506 57 H 550" />
      <Caja x={552} y={30} w={180} titulo="PROGRAMADA" detalle="cita sobre la mesa" tono="logro" />

      <Flecha d="M 642 84 V 128" />
      <Caja x={552} y={130} w={180} titulo="Confirmar a los dos" detalle="WhatsApp · pasos 8 y 9" />

      <Flecha d="M 552 157 H 508" />
      <Caja x={276} y={130} w={230} titulo="Consentimiento firmado" detalle="su nombre tecleado es la firma" tono="logro" />
      <Nota x={392} y={200} texto="menor: firma su acudiente · papel: se sube el escaneo" />

      <Flecha d="M 642 184 V 228" />
      <Caja x={552} y={230} w={180} titulo="CONFIRMADA" detalle="la persona confirmó" tono="logro" />

      <Flecha d="M 642 284 V 318" />
      <Caja x={432} y={320} w={300} h={54} titulo="El día de la sesión" detalle="realizada · no asistió · cancelada · reprogramada" />
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

