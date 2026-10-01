/**
 * El informe semanal del área: tipos y el documento que se descarga.
 *
 * Las cifras las calcula el backend; aquí solo se visten. El documento sale en
 * HTML y se abre en Word: es lo mismo que hacen los dos manuales, y evita
 * arrastrar una librería de .docx para un archivo que se va a copiar y pegar
 * dentro de la plantilla de la fundación.
 *
 * Lo que NO escribe: logros, obstáculos, estado general y prioridades. Eso es
 * criterio de quien dirige el área, y un documento que los rellenara solo
 * estaría inventando.
 */

export type ListaPendiente = {
  id: string
  nombre: string
  prioridad: string
  diasEsperando?: number
  diasSinContacto?: number
  intentos?: number
  motivo?: string | null
  profesional?: string | null
}

export type InformeSemanal = {
  periodo: { desde: string; hasta: string }
  voluntariado: {
    registrados: number
    nuevosEnLaSemana: number
    activosEnLaSemana: number
    porcentajeActivos: number
    porArea: { area: string; cuantos: number }[]
  }
  atenciones: {
    solicitudesRecibidas: number
    enAcompanamiento: number
    enAdmision: number
    nuevas: number
    asignadas: number
    cerradas: number
    citasHistorico: number
    citasCanceladasHistorico: number
    citasDeLaSemana: number
    citasRealizadasEnLaSemana: number
    citasCanceladasEnLaSemana: number
    citasSinAsistirEnLaSemana: number
    citasPorDelante: number
  }
  casos: {
    nuevosEnLaSemana: number
    cerradosEnLaSemana: number
    derivadosRedExterna: number | null
  }
  profesionales: {
    activos: number
    pausados: number
    inactivos: number
    pendientesDeValidar: number
    conCasosAsignados: number
    nuevosEnLaSemana: number
    pidieronApoyoEnLaSemana: number
  }
  pendientes: {
    noContestan: ListaPendiente[]
    sinElegirHora: ListaPendiente[]
    sinProfesional: ListaPendiente[]
  }
}

/** Los nombres de área como se escriben en el informe, no como los guarda la base. */
export const AREA_LEGIBLE: Record<string, string> = {
  SALUD: 'Salud y primeros auxilios',
  SOCIAL_LEGAL_EDUCATIVO: 'Social, legal y educativo',
  OPERACION_LOGISTICA: 'Operación y logística',
  COMUNICACION_TECNOLOGIA: 'Comunicación y tecnología',
  GESTION_PROYECTOS: 'Gestión y proyectos',
  OTRA: 'Otras disciplinas',
}

export const PRIORIDAD_LEGIBLE: Record<string, string> = {
  ALTA: 'alta',
  MEDIA: 'media',
  BAJA: 'baja',
}

const dia = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

/** «3 casos — 2 de prioridad alta y 1 media», que es como se escribe a mano. */
export function resumenPorPrioridad(lista: ListaPendiente[]): string {
  if (lista.length === 0) return 'ninguno'
  const cuenta = lista.reduce<Record<string, number>>((acc, p) => {
    acc[p.prioridad] = (acc[p.prioridad] ?? 0) + 1
    return acc
  }, {})
  const partes = ['ALTA', 'MEDIA', 'BAJA']
    .filter((p) => cuenta[p])
    .map((p) => `${cuenta[p]} de prioridad ${PRIORIDAD_LEGIBLE[p] ?? p.toLowerCase()}`)
  return `${lista.length} ${lista.length === 1 ? 'caso' : 'casos'} — ${partes.join(' y ')}`
}

const escapar = (t: string) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const fila = (campo: string, valor: string | number | null, nota?: string) => `
    <tr>
      <th>${escapar(campo)}</th>
      <td>${valor === null ? '<em>no se registra todavía</em>' : escapar(String(valor))}${
        nota ? `<span class="nota">${escapar(nota)}</span>` : ''
      }</td>
    </tr>`

/**
 * El documento que se descarga.
 *
 * Se abre en Word con sus tablas y sus títulos, listo para copiar dentro de la
 * plantilla de la fundación o para entregarlo tal cual. Los campos de criterio
 * van vacíos y señalados: son los que hay que escribir.
 */
export function documentoDelInforme(d: InformeSemanal): string {
  const v = d.voluntariado
  const a = d.atenciones
  const c = d.casos
  const p = d.profesionales

  const listaHtml = (titulo: string, lista: ListaPendiente[], linea: (x: ListaPendiente) => string) => `
  <h3>${escapar(titulo)} · ${escapar(resumenPorPrioridad(lista))}</h3>
  ${
    lista.length === 0
      ? '<p class="vacio">Ninguno esta semana.</p>'
      : `<ul>${lista.map((x) => `<li>${escapar(linea(x))}</li>`).join('')}</ul>`
  }`

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Informe semanal · ${dia(d.periodo.desde)} al ${dia(d.periodo.hasta)}</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; color: #1f2430; max-width: 820px; margin: 28px auto; padding: 0 20px; line-height: 1.5; }
  h1 { font-size: 1.5rem; margin: 0 0 2px; }
  .cabecera { color: #5b6070; margin: 0 0 22px; }
  h2 { font-size: 1.1rem; margin: 26px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #15162e; }
  h3 { font-size: 0.98rem; margin: 16px 0 6px; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 10px; }
  th, td { border: 1px solid #d8d8e0; padding: 7px 10px; text-align: left; vertical-align: top; }
  th { width: 48%; background: #f4f4f7; font-weight: 600; }
  .nota { display: block; color: #6b7080; font-size: 0.82rem; }
  .vacio { color: #6b7080; }
  .escribir { border: 1px dashed #b9743a; background: #fdf6ef; padding: 10px 12px; border-radius: 6px; color: #8a5524; }
  ul { margin: 6px 0 12px; padding-left: 20px; }
  li { margin-bottom: 3px; }
  footer { margin-top: 30px; color: #6b7080; font-size: 0.85rem; border-top: 1px solid #d8d8e0; padding-top: 10px; }
</style>
</head>
<body>

<h1>Informe semanal · Operaciones y Atención</h1>
<p class="cabecera">
  Red Aquí Estamos · del <strong>${dia(d.periodo.desde)}</strong> al <strong>${dia(d.periodo.hasta)}</strong><br>
  Cifras tomadas del portal. Lo que pide criterio va marcado para escribirlo.
</p>

<h2>1 · Resumen de la semana</h2>
<p class="escribir">
  <strong>Para escribir:</strong> logros de la semana, obstáculos y desafíos, y estado general
  del área (verde / amarillo / rojo). Las cifras de abajo son el material.
</p>

<h2>2 · Voluntariado</h2>
<table>
  ${fila('Voluntarios generales registrados', v.registrados)}
  ${fila('Nuevos esta semana', v.nuevosEnLaSemana)}
  ${fila('Activos esta semana', v.activosEnLaSemana, 'Con al menos una tarea asignada entre lunes y domingo.')}
  ${fila('% de activos', `${v.porcentajeActivos}%`)}
</table>
<h3>Modalidades</h3>
<ul>
  ${v.porArea
    .map(
      (x) =>
        `<li>${escapar(AREA_LEGIBLE[x.area] ?? x.area)}: ${x.cuantos} ${
          x.cuantos === 1 ? 'voluntaria/o' : 'voluntarias/os'
        }.</li>`,
    )
    .join('')}
</ul>

<h2>3 · Actividades, atenciones y territorio</h2>
<table>
  ${fila('Solicitudes recibidas', a.solicitudesRecibidas, 'Las que entraron esta semana.')}
  ${fila('Atenciones en acompañamiento', a.enAcompanamiento, 'Foto de hoy, no de la semana.')}
  ${fila('Personas en admisión', a.enAdmision, 'Foto de hoy.')}
  ${fila('Citas de la semana', a.citasDeLaSemana)}
  ${fila('— de ellas, realizadas', a.citasRealizadasEnLaSemana)}
  ${fila('— canceladas', a.citasCanceladasEnLaSemana)}
  ${fila('— sin asistir', a.citasSinAsistirEnLaSemana)}
  ${fila('— por delante (programadas o confirmadas)', a.citasPorDelante)}
  ${fila('Total de citas en el histórico', a.citasHistorico)}
  ${fila('Canceladas en el histórico', a.citasCanceladasHistorico)}
</table>
<p class="escribir"><strong>Para escribir:</strong> actividades desarrolladas y zonas territoriales beneficiadas.</p>

<h2>4 · Seguimiento de casos y profesionales</h2>
<table>
  ${fila('Casos nuevos (personas admitidas)', c.nuevosEnLaSemana)}
  ${fila('Casos cerrados', c.cerradosEnLaSemana)}
  ${fila('Derivados a red externa', c.derivadosRedExterna, 'El portal no tiene todavía dónde apuntarlas.')}
</table>

${listaHtml(
  'No contestan',
  d.pendientes.noContestan,
  (x) =>
    `${x.nombre} — ${PRIORIDAD_LEGIBLE[x.prioridad] ?? x.prioridad} — ${x.intentos ?? 0} ${
      (x.intentos ?? 0) === 1 ? 'intento' : 'intentos'
    }, ${x.diasSinContacto} días sin contacto${
      x.motivo === 'NUMERO_ERRADO' ? ' (el número está mal)' : ''
    }.`,
)}

${listaHtml(
  'Asignados, falta que elijan hora',
  d.pendientes.sinElegirHora,
  (x) =>
    `${x.nombre} — ${PRIORIDAD_LEGIBLE[x.prioridad] ?? x.prioridad} — con ${
      x.profesional ?? 'profesional asignado'
    }, esperando hace ${x.diasEsperando} días.`,
)}

${listaHtml(
  'Sin profesional asignado',
  d.pendientes.sinProfesional,
  (x) =>
    `${x.nombre} — ${PRIORIDAD_LEGIBLE[x.prioridad] ?? x.prioridad} — lleva ${x.diasEsperando} días en la red.`,
)}

<table>
  ${fila('Profesionales activos', p.activos)}
  ${fila('Con casos asignados', p.conCasosAsignados)}
  ${fila('Nuevos esta semana', p.nuevosEnLaSemana)}
  ${fila('Pendientes de validar', p.pendientesDeValidar)}
  ${fila('Pausados', p.pausados)}
  ${fila('Inactivos', p.inactivos)}
  ${fila('Pidieron apoyo al equipo esta semana', p.pidieronApoyoEnLaSemana, 'Cuidado del equipo: «¿Cómo estás tú?».')}
</table>
<p class="escribir"><strong>Para escribir:</strong> profesionales con novedad —quién, qué pasó y qué se hizo—.</p>

<h2>5 · Cierre</h2>
<p class="escribir">
  <strong>Para escribir:</strong> dificultades, necesidades o solicitudes, y prioridades de la
  semana siguiente.
</p>

<footer>
  Generado por el portal de la Red Aquí Estamos. Las cifras salen de la base de datos en el
  momento de la descarga; si alguien registra algo después, vuelve a descargarlo.
</footer>

</body>
</html>`
}
