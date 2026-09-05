import fs from 'node:fs'

function abrir(p) {
  const bruto = fs.readFileSync(p, 'utf8')
  return { p, crlf: bruto.includes('\r\n'), s: bruto.replace(/\r\n/g, '\n') }
}
function guardar(f) {
  fs.writeFileSync(f.p, f.crlf ? f.s.replace(/\n/g, '\r\n') : f.s)
}
function sustituir(f, viejo, nuevo, nombre) {
  if (!f.s.includes(viejo)) throw new Error(`ancla no encontrada (${nombre}): ${viejo.slice(0, 110)}`)
  f.s = f.s.replace(viejo, nuevo)
  console.log('  ·', nombre)
}
const resultados = []
function tarea(nombre, fn) {
  try { fn(); resultados.push(`OK  ${nombre}`) } catch (e) { resultados.push(`ERR ${nombre}: ${e.message}`) }
}

// ── el manual operativo ──────────────────────────────────────────────────
tarea('manual operativo', () => {
  const f = abrir('app/api/portal/manual-operativo/manualOperativo.ts')
  sustituir(
    f,
    `  <h3>1 · Él pide el espacio: «¿Cómo estás tú?»</h3>
  <h4>Dónde · Al final de su enlace del caso, después de reportar</h4>
  <p>
    Es la única puerta que tiene —no hay cuenta de portal, a propósito— y el momento en que
    tiene sentido preguntarle cómo está es cuando acaba de contar cómo fue la sesión. El bloque
    le dice cuántas sesiones lleva <b>en toda la red, con cualquier persona</b>, y desde cuántas
    se abre el espacio. El umbral se cambia en Parametrización
    (<span class="mono">SESIONES_PARA_CHECKIN</span>, hoy 3): es la carga acumulada la que quema.
    <b>Antes de ese número no se le pregunta nada</b>: el bloque no aparece.
  </p>`,
    `  <h3>1 · Él pide el espacio: «¿Cómo estás tú?»</h3>
  <h4>Dónde · En su propio enlace, que se lo mandas tú</h4>
  <p>
    Es un enlace suyo —no de ninguno de sus casos—, así que le sirve aunque los cierre todos, y
    le vale siempre: puede volver cuantas veces quiera. No hay cuenta de portal, a propósito.
  </p>
  <p>
    La pantalla le dice cuántas sesiones lleva <b>en toda la red, con cualquier persona</b>, y
    desde cuántas se abre el espacio. El umbral se cambia en Parametrización
    (<span class="mono">SESIONES_PARA_CHECKIN</span>, hoy 3): es la carga acumulada la que quema.
    <b>Antes de ese número no se le pregunta nada</b>: el formulario no aparece.
  </p>
  <div class="aviso dato">
    <b>Estuvo dentro del enlace del caso, y se sacó.</b>
    Ahí lo ataba a una persona acompañada —para ofrecérselo hacía falta que tuviera un caso
    abierto— y, peor, le pedía hablar de sí mismo debajo del seguimiento de alguien a quien
    acompaña. Son dos conversaciones distintas y ahora son dos enlaces distintos.
  </div>`,
    '§1 · su propio enlace',
  )
  sustituir(
    f,
    `${'`'}redaquiestamos.org/portal/caso/&lt;id del caso&gt;${'`'}`,
    `${'`'}redaquiestamos.org/cuidado/&lt;su enlace&gt;${'`'}`,
    '§1 · url de la pantalla',
  )
  sustituir(
    f,
    `      Lo que ve él al final de su enlace, ya con las sesiones que hacen falta. Tres opciones
      en su idioma y dos campos opcionales — el segundo es <b>lo que arma la agenda</b> de la
      sesión. Antes del umbral no ve nada de esto: no se le pregunta.`,
    `      Lo que ve al abrir su enlace, ya con las sesiones que hacen falta. Tres opciones en su
      idioma y dos campos opcionales — el segundo es <b>lo que arma la agenda</b> de la sesión.
      Antes del umbral no ve el formulario: la pantalla le dice cuánto le falta y le pide que
      guarde el enlace.`,
    '§1 · pie',
  )
  sustituir(
    f,
    `    Ya llevan {umbral} sesiones`,
    `    Ya llevan {umbral} sesiones`,
    'no-op',
  )
  guardar(f)
})

// ── el manual técnico: la tabla de puertas públicas ─────────────────────
tarea('manual técnico', () => {
  const p = 'app/api/portal/manual-procesos/manualHtml.ts'
  const mod = fs.readFileSync(p, 'utf8')
  let m = JSON.parse(mod.replace(/^export const MANUAL_HTML = /, '').replace(/\n$/, ''))
  const viejo = `<tr><td>/sala/[token]</td>`
  if (!m.includes(viejo)) throw new Error('ancla de la tabla de puertas')
  m = m.replace(
    viejo,
    `<tr><td>/cuidado/[token]</td><td>Profesional voluntario</td><td class="mono">90 días</td><td>«¿Cómo estás tú?»: pedir apoyo, ayuda con un caso, o descargarse. Apunta al PROFESIONAL, no a un caso: le sirve aunque los cierre todos. Lo firma el portal cada vez que se le ofrece.</td></tr>\n    ` + viejo,
  )
  fs.writeFileSync(p, `export const MANUAL_HTML = ${JSON.stringify(m)}\n`)
  console.log('  ·', 'puerta /cuidado/[token]')
})

console.log('\n' + resultados.join('\n'))
if (resultados.some((r) => r.startsWith('ERR'))) process.exit(1)
