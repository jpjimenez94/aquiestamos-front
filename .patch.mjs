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
function despues(f, ancla, html, nombre) {
  const i = f.s.indexOf(ancla)
  if (i < 0) throw new Error(`ancla no encontrada (${nombre}): ${ancla.slice(0, 110)}`)
  const corte = i + ancla.length
  f.s = f.s.slice(0, corte) + '\n' + html + f.s.slice(corte)
  console.log('  +', nombre)
}
const chrome = (url) => `    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">${url}</span>
      </div>`

const resultados = []
function tarea(nombre, fn) {
  try { fn(); resultados.push(`OK  ${nombre}`) } catch (e) { resultados.push(`ERR ${nombre}: ${e.message}`) }
}

// ════════════════════════════════════════════════════════════════════════
// 1. MANUAL OPERATIVO (todo de nuevo: la vuelta anterior no se guardó)
// ════════════════════════════════════════════════════════════════════════
tarea('manual operativo', () => {
  const f = abrir('app/api/portal/manual-operativo/manualOperativo.ts')

  sustituir(
    f,
    `  <h3>Paso 1 · Llega la solicitud</h3>
  <h4>Quién · La persona, sola, desde el sitio</h4>
  <p>
    Llena «Necesito ayuda» en <span class="mono">redaquiestamos.org</span>. Queda registrada
    en <span class="mono">Solicitudes</span> y a coordinación le llega un correo.
  </p>
  <h4>Qué haces tú</h4>
  <p>
    Entrar a <span class="mono">Solicitudes</span> y mandarle el <b>enlace de tamizaje</b> por
    WhatsApp: son 7 preguntas cortas que se responden en un minuto desde el celular.
  </p>`,
    `  <h3>Paso 1 · Llega la solicitud</h3>
  <h4>Quién · La persona, sola, desde el sitio</h4>
  <p>
    Llena «Necesito ayuda» en <span class="mono">redaquiestamos.org</span>. Ese formulario
    <b>ya trae el tamizaje</b> —son obligatorias— : cómo se siente hoy del 1 al 5, si ha
    pensado en hacerse daño, qué tan pronto necesita hablar con alguien y si está en un lugar
    seguro. Con eso llega todo lo que hace falta para decidir la prioridad.
  </p>
  <h4>Qué haces tú</h4>
  <p>
    <b>Nada obligatorio.</b> No hay que mandarle ningún enlace: con las respuestas del
    formulario el sistema calcula la prioridad y la admite en el mismo instante. Lo que sí
    conviene es entrar a <span class="mono">Solicitudes</span> y mirar con qué prioridad
    llegó — y si llegó con riesgo, atenderla hoy.
  </p>
  <div class="aviso ojo">
    <b>«Preguntar» es la excepción, no el paso.</b>
    Ese botón solo aparece en las filas que llegaron <b>sin</b> las respuestas del tamizaje
    —registros viejos, o cargados por otra vía— y salen como <span class="chip ambar">Pendiente</span>.
    Solo a esas se les manda el enlace. Si tampoco responden, a los 2 días el sistema las
    admite igual con prioridad preventiva.
  </div>`,
    'paso 1 · el formulario ya trae el tamizaje',
  )

  sustituir(
    f,
    `      Cada solicitud es una fila. <b>«Preguntar»</b> arma el WhatsApp con el enlace del
      tamizaje; si ya se mandó, el botón pasa a decir «Reenviar». La segunda fila ya
      respondió: el sistema la admitió solo y le puso prioridad — de ahí en adelante vive en
      <span class="mono">Acompañadas</span>, no aquí.`,
    `      Cada solicitud es una fila. La de abajo es <b>el caso normal</b>: llegó por el
      formulario con el tamizaje respondido, el sistema le puso prioridad y la admitió solo —
      de ahí en adelante vive en <span class="mono">Acompañadas</span>. La de arriba es la
      excepción: llegó sin respuestas y sale «Pendiente» con el botón <b>«Preguntar»</b>, que
      arma el WhatsApp con el enlace (y pasa a decir «Reenviar» si ya se mandó).`,
    'paso 1 · pie de la pantalla de solicitudes',
  )

  sustituir(
    f,
    `  <h3>Paso 2 · Admisión</h3>
  <h4>Quién · El sistema</h4>
  <p>
    Con las respuestas calcula la prioridad —<span class="chip rojo">Alta</span>
    <span class="chip ambar">Media</span> <span class="chip gris">Baja</span>— y la admite
    sola. Pasa a la columna <b>«Por Asignar»</b> del tablero y ya existe como persona
    acompañada.
  </p>
  <div class="aviso ojo">
    <b>Si no responde el tamizaje, no se queda esperando.</b>
    A los 2 días el sistema la admite igual, con prioridad preventiva. Nadie se queda fuera
    por no contestar un formulario.
  </div>`,
    `  <h3>Paso 2 · Admisión</h3>
  <h4>Quién · El sistema, en el mismo instante en que ella envía el formulario</h4>
  <p>
    Con las respuestas calcula la prioridad —<span class="chip rojo">Alta</span>
    <span class="chip ambar">Media</span> <span class="chip gris">Baja</span>— y la admite
    sola. Pasa a la columna <b>«Por Asignar»</b> del tablero y ya existe como persona
    acompañada. Para quien llega por el sitio, los pasos 1 y 2 ocurren juntos y sin que
    nadie toque nada: lo primero que ve coordinación es una persona admitida con su
    prioridad puesta.
  </p>
  <div class="aviso ojo">
    <b>Y si llegó sin tamizaje, tampoco se queda esperando.</b>
    A los 2 días de mandarle el enlace sin respuesta, el sistema la admite igual con
    prioridad preventiva. Nadie se queda fuera por no contestar un formulario.
  </div>`,
    'paso 2 · admisión en el mismo envío',
  )

  sustituir(
    f,
    `  <p>
    Busca con el número de cédula que aparece en el documento de identidad que subió, y
    compara: <b>el nombre del registro tiene que ser el mismo</b> que el del documento.
  </p>`,
    `  <p>
    Busca con el número de cédula que aparece en el documento de identidad que subió, y
    compara: <b>el nombre del registro tiene que ser el mismo</b> que el del documento.
  </p>
  <p class="apagado">
    ¿Los documentos no son de Colombia ni de Perú? Ninguno de los cuatro sitios sirve. Está
    resuelto en <a href="#cuando-falla">«Cuando algo se sale del carril»</a>.
  </p>`,
    'verificaciones §4 · enlace al caso de otro país',
  )

  // El ancla es el HTML final del último caso, no su forma en el código.
  despues(
    f,
    `Empezar el día por aquí es la forma de que nadie se quede sin mirar.</figcaption>
  </figure>`,
    `
  <h3>El profesional no tiene documentos de Colombia ni de Perú</h3>
  <p>
    Los cuatro sitios de Verificaciones cubren dos países. Cuando se postula alguien de otro
    —Ecuador, Venezuela, Argentina, España…— <b>ninguno sirve</b>, y la tarjeta no se puede
    aprobar por descarte. En ese orden:
  </p>
  <div class="paso">
    <div class="paso__n">1</div>
    <div class="paso__c"><p><b>Busca en la web el registro oficial de ese país.</b> Casi todos tienen uno: el colegio de psicólogos, el ministerio de salud o el registro de títulos. Busca «verificar tarjeta profesional psicólogo» o «registro de profesionales de la salud» con el nombre del país.</p></div>
  </div>
  <div class="paso">
    <div class="paso__n">2</div>
    <div class="paso__c"><p><b>Si lo encuentras</b>, verifica ahí igual que con Colpsic —cédula o número de registro, y el nombre tiene que coincidir— y <b>pásalo por el grupo de WhatsApp de Aquí Estamos</b> con el enlace, para que se agregue a la lista de sitios del portal. Así la próxima persona de ese país ya lo tiene a un clic. Hoy esa lista vive en el portal y la agrega el equipo; no se puede añadir desde la pantalla.</p></div>
  </div>
  <div class="paso">
    <div class="paso__n">3</div>
    <div class="paso__c"><p><b>Si no lo encuentras</b>, escríbelo en el mismo grupo: nombre, país, qué documentos subió y qué sitios probaste. Que lo resuelva el equipo, no uno solo.</p></div>
  </div>
  <div class="aviso stop">
    <b>Mientras tanto, no se aprueba.</b>
    La tarjeta se queda en «Pendientes de aprobación» y él no recibe casos. Es preferible una
    semana de espera a un acompañamiento con alguien que no sabemos si puede ejercer.
  </div>
  <figure class="pantalla">
${chrome('redaquiestamos.org/portal/verificaciones')}
      <div class="lienzo">
        <div class="tarjeta">
          <div class="fuerte" style="margin-bottom:6px">Sitios Oficiales para Verificación</div>
          <div class="fila">
            <span class="chip verde">🇨🇴 Colpsic</span>
            <span class="chip azul">🇨🇴 ReTHUS</span>
            <span class="chip rojo">🇵🇪 CPSP</span>
            <span class="chip gris">🇵🇪 SUNEDU</span>
          </div>
        </div>
        <div class="tarjeta" style="border-left:4px solid var(--ambar)">
          <div class="fila" style="align-items:flex-start;gap:14px">
            <div class="fila" style="gap:6px">
              <span class="doc">Título / registro (Ecuador)</span>
              <span class="doc">Cédula (Ecuador)</span>
            </div>
            <div style="flex:1;min-width:200px">
              <div class="fuerte">Valentina Rojas Peña</div>
              <div class="apagado">Psicología · Cuenca, Ecuador · +593 99 000 0000</div>
              <div class="apagado">Experiencia: 4 años · Subió sus documentos el 3 de septiembre</div>
              <div class="fila" style="margin-top:8px">
                <span class="campo">Nº de tarjeta profesional</span>
                <span class="btn apagado">Aprobar verificación</span>
                <span class="btn">Mover a Voluntariado</span>
                <span class="btn">Rechazar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <figcaption>
      Una tarjeta pendiente con documentos de Ecuador: <b>ninguno de los cuatro sitios de
      arriba aplica</b>. No se aprueba por descarte ni se rechaza por no saber: se busca el
      registro de ese país, y si no aparece, se lleva al grupo. Aprobar queda para cuando
      alguien lo haya comprobado.
    </figcaption>
  </figure>`,
    'caso 8 · documentos de otro país',
  )

  guardar(f)
})

// ════════════════════════════════════════════════════════════════════════
// 2. MANUAL TÉCNICO · la prosa de «Solicitud y tamizaje» (lo del mapa ya quedó)
// ════════════════════════════════════════════════════════════════════════
tarea('manual técnico · prosa', () => {
  const p = 'app/api/portal/manual-procesos/manualHtml.ts'
  const mod = fs.readFileSync(p, 'utf8')
  const f = { p, s: JSON.parse(mod.replace(/^export const MANUAL_HTML = /, '').replace(/\n$/, '')) }
  sustituir(
    f,
    `El tamizaje evalúa la prioridad con el estado presente de la persona. Si no responde el enlace en 48 horas, el sistema la admite automáticamente para que coordinación la contacte de inmediato.`,
    `El tamizaje —cómo se siente hoy, si ha pensado en hacerse daño, qué tan pronto necesita hablar y si está en un lugar seguro— va dentro del formulario y es obligatorio: con él el sistema calcula la prioridad y admite a la persona en el mismo envío. El enlace de tamizaje aparte queda solo para lo que llegó sin esas respuestas; si no lo responde en 48 horas, el sistema la admite igual con prioridad preventiva.`,
    'solicitud y tamizaje · prosa',
  )
  fs.writeFileSync(p, `export const MANUAL_HTML = ${JSON.stringify(f.s)}\n`)
})

console.log('\n' + resultados.join('\n'))
if (resultados.some((r) => r.startsWith('ERR'))) process.exit(1)
