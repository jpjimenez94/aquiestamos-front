/**
 * EL MANUAL OPERATIVO: qué toca hacer, dónde, y en qué orden.
 *
 * Distinto del manual técnico, que explica cómo está hecha la red. Este
 * explica cómo se usa: el manual que se le pasa a alguien que entra a
 * coordinación el lunes.
 *
 * Las pantallas están DIBUJADAS, no fotografiadas, y es a propósito:
 *
 *   · El portal enseña nombres, teléfonos y estado de salud de personas
 *     reales. Un manual con capturas de esas pantallas circula por WhatsApp,
 *     se reenvía y se queda en el teléfono de quien ya no está en el equipo.
 *     Los datos de salud son sensibles según la Ley 1581, y este documento no
 *     es sitio para ellos.
 *   · Dibujadas salen del mismo código que la pantalla real —los mismos
 *     textos de botón, los mismos avisos—, así que se corrigen cuando el
 *     portal cambia en vez de quedarse describiendo una versión vieja.
 *
 * Las personas que aparecen son inventadas. Si alguna vez se quieren fotos de
 * verdad, cada bloque `.pantalla` es el hueco donde entra la imagen.
 */
export const MANUAL_OPERATIVO_HTML = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Manual operativo · Red Aquí Estamos</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Montserrat:wght@400;500;600;700;800&display=swap">
<style>
  :root {
    --tinta: #23254c;
    --tinta-suave: #5a5c7d;
    --crema: #efe5d9;
    --papel: #fffdf8;
    --borde: #e4dfd3;
    --verde: #2e7d5b;
    --verde-suave: #e4efe8;
    --ambar: #a8731e;
    --ambar-suave: #f7ecd8;
    --rojo: #b13a3a;
    --rojo-suave: #f6e3e0;
    --azul: #2b5f97;
    --azul-suave: #e6eef7;
    --noche: #15162e;
    --display: 'Cormorant Garamond', Georgia, serif;
    --cuerpo: 'Montserrat', system-ui, sans-serif;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--crema);
    color: var(--tinta);
    font-family: var(--cuerpo);
    font-size: 15px;
    line-height: 1.65;
  }
  .pagina { max-width: 1000px; margin: 0 auto; padding: 44px 20px 96px; }

  header.portada {
    padding: 34px 36px;
    background: linear-gradient(135deg, #23254c 0%, #15162e 100%);
    color: #fff6eb;
    border-radius: 16px;
    margin-bottom: 34px;
  }
  .portada .red {
    font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase;
    font-weight: 800; color: #9ccbb2;
  }
  .portada h1 {
    font-family: var(--display); font-weight: 700;
    font-size: clamp(2.2rem, 6vw, 3.4rem); line-height: 1.05;
    margin: 10px 0 14px; color: #fff6eb;
  }
  .portada p { max-width: 68ch; margin: 0; color: #cfc9dd; font-size: 0.95rem; }

  nav.indice {
    background: var(--papel); border: 1px solid var(--borde);
    border-radius: 14px; padding: 20px 24px; margin-bottom: 34px;
  }
  nav.indice h2 { font-family: var(--display); font-size: 1.5rem; margin: 0 0 12px; }
  nav.indice ol { margin: 0; padding-left: 20px; }
  nav.indice li { margin-bottom: 4px; }
  nav.indice a { color: var(--tinta); text-decoration: none; border-bottom: 1px solid var(--borde); }
  nav.indice a:hover { border-bottom-color: var(--verde); }

  .capitulo {
    background: var(--papel); border: 1px solid var(--borde);
    border-radius: 16px; padding: 28px 30px; margin-bottom: 26px;
  }
  h2 {
    font-family: var(--display); font-weight: 700;
    font-size: clamp(1.7rem, 4vw, 2.3rem); line-height: 1.15;
    margin: 0 0 6px; scroll-margin-top: 20px;
  }
  h3 {
    font-size: 1.02rem; font-weight: 800; margin: 30px 0 8px;
    padding-top: 18px; border-top: 1px solid var(--borde);
  }
  h3:first-of-type { border-top: none; padding-top: 0; margin-top: 18px; }
  h4 { font-size: 0.9rem; font-weight: 800; margin: 16px 0 4px; color: var(--tinta-suave); }
  p { margin: 0 0 12px; }
  .quien {
    font-size: 0.78rem; letter-spacing: 0.05em; text-transform: uppercase;
    font-weight: 700; color: var(--tinta-suave); margin: 0 0 16px;
  }
  ul, ol { margin: 0 0 12px; padding-left: 22px; }
  li { margin-bottom: 5px; }
  code, .mono { font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; font-size: 0.86em; }

  /* --- la pantalla dibujada --- */
  figure.pantalla { margin: 18px 0 20px; }
  .marco {
    border: 1px solid var(--borde); border-radius: 12px; overflow: hidden;
    background: #ffffff; box-shadow: 0 6px 18px -10px rgba(35,37,76,0.35);
  }
  .barra {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px; background: #f4f1ea; border-bottom: 1px solid var(--borde);
  }
  .semaforo { display: flex; gap: 5px; }
  .semaforo i { width: 10px; height: 10px; border-radius: 50%; display: block; }
  .url {
    flex: 1; background: #ffffff; border: 1px solid var(--borde); border-radius: 6px;
    padding: 3px 10px; font-size: 0.76rem; color: var(--tinta-suave);
    font-family: ui-monospace, Menlo, Consolas, monospace;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .lienzo { padding: 18px 20px; background: var(--crema); }
  figcaption {
    font-size: 0.82rem; color: var(--tinta-suave); margin-top: 8px; line-height: 1.55;
  }
  figcaption b { color: var(--tinta); }

  /* piezas del portal, reproducidas */
  .tarjeta {
    background: #ffffff; border: 1px solid var(--borde); border-radius: 12px;
    padding: 14px 16px; margin-bottom: 10px;
  }
  .tarjeta:last-child { margin-bottom: 0; }
  .titulillo {
    font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase;
    font-weight: 800; color: var(--tinta-suave); margin-bottom: 4px;
  }
  .fuerte { font-weight: 700; }
  .apagado { color: var(--tinta-suave); font-size: 0.85rem; }
  .fila { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .fila.entre { justify-content: space-between; }
  .btn {
    display: inline-flex; align-items: center; gap: 5px;
    border: 1px solid var(--borde); background: #ffffff; color: var(--tinta);
    border-radius: 8px; padding: 6px 11px; font-size: 0.8rem; font-weight: 600;
    font-family: var(--cuerpo);
  }
  .btn.principal { background: var(--noche); color: #fff6eb; border-color: var(--noche); }
  .btn.peligro { background: var(--rojo); color: #ffffff; border-color: var(--rojo); }
  .btn.apagado { background: #f4f1ea; color: #9a97ad; border-color: var(--borde); }
  .campo {
    border: 1px solid var(--borde); border-radius: 8px; background: #ffffff;
    padding: 6px 11px; font-size: 0.8rem; color: #9a97ad; min-width: 190px;
  }
  .chip {
    display: inline-block; border-radius: 999px; padding: 2px 10px;
    font-size: 0.72rem; font-weight: 700; border: 1px solid;
  }
  .chip.verde { background: var(--verde-suave); color: var(--verde); border-color: var(--verde); }
  .chip.ambar { background: var(--ambar-suave); color: var(--ambar); border-color: var(--ambar); }
  .chip.rojo { background: var(--rojo-suave); color: var(--rojo); border-color: var(--rojo); }
  .chip.azul { background: var(--azul-suave); color: var(--azul); border-color: var(--azul); }
  .chip.gris { background: #f4f1ea; color: var(--tinta-suave); border-color: var(--borde); }
  .doc {
    width: 96px; height: 68px; border-radius: 8px; border: 1px solid var(--borde);
    background: repeating-linear-gradient(45deg, #f4f1ea, #f4f1ea 8px, #eae5da 8px, #eae5da 16px);
    display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px;
    font-size: 0.62rem; color: var(--tinta-suave); text-align: center;
  }
  .tira { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
  .tira .p {
    display: inline-flex; align-items: center; gap: 5px;
    border: 1px solid var(--borde); background: #ffffff; border-radius: 999px;
    padding: 3px 11px; font-size: 0.75rem; color: var(--tinta-suave);
  }
  .tira .p b {
    display: inline-flex; align-items: center; justify-content: center;
    width: 17px; height: 17px; border-radius: 50%; background: #f4f1ea;
    font-size: 0.68rem; color: var(--tinta-suave);
  }
  .tira .p.hecho { color: var(--verde); border-color: var(--verde); }
  .tira .p.hecho b { background: var(--verde); color: #ffffff; }
  .tira .p.ahora { background: var(--noche); color: #fff6eb; border-color: var(--noche); font-weight: 700; }
  .tira .p.ahora b { background: #fff6eb; color: var(--noche); }

  /* --- avisos --- */
  .aviso {
    border-left: 4px solid; border-radius: 8px; padding: 12px 15px;
    margin: 14px 0; font-size: 0.9rem;
  }
  .aviso b { display: block; margin-bottom: 2px; }
  .aviso.ojo { background: var(--ambar-suave); border-color: var(--ambar); }
  .aviso.stop { background: var(--rojo-suave); border-color: var(--rojo); }
  .aviso.bien { background: var(--verde-suave); border-color: var(--verde); }
  .aviso.dato { background: var(--azul-suave); border-color: var(--azul); }

  /* --- pasos numerados --- */
  .paso { display: flex; gap: 14px; margin: 16px 0; }
  .paso__n {
    flex-shrink: 0; width: 30px; height: 30px; border-radius: 50%;
    background: var(--noche); color: #fff6eb; font-weight: 800; font-size: 0.86rem;
    display: flex; align-items: center; justify-content: center;
  }
  .paso__c { flex: 1; min-width: 0; }
  .paso__c p:last-child { margin-bottom: 0; }

  table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 0.86rem; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--borde); vertical-align: top; }
  th { font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--tinta-suave); }

  footer {
    text-align: center; font-size: 0.8rem; color: var(--tinta-suave);
    padding: 26px 10px 0; line-height: 1.6;
  }

  @media print {
    body { background: #ffffff; }
    .capitulo, nav.indice { break-inside: auto; border-color: #d8d3c6; }
    h2, h3 { break-after: avoid; }
    figure.pantalla { break-inside: avoid; }
    header.portada { background: #23254c !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .chip, .btn, .aviso, .lienzo, .barra { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<div class="pagina">

<header class="portada">
  <div class="red">Red Aquí Estamos · Documento interno</div>
  <h1>Manual operativo</h1>
  <p>
    Qué toca hacer, en qué pantalla y en qué orden. Está escrito para quien entra a
    coordinación y tiene que empezar a trabajar hoy: cada paso dice dónde estás, qué vas a
    ver, qué haces y qué pasa después. Esta primera entrega cubre <b>verificaciones</b> y
    <b>agendamiento</b>.
  </p>
</header>

<nav class="indice">
  <h2>Qué hay aquí</h2>
  <ol>
    <li><a href="#leeme">Antes de empezar: cómo leer este manual</a></li>
    <li><a href="#verificaciones">Verificaciones: aprobar a un profesional</a></li>
    <li><a href="#agendamiento">Agendamiento: los 7 pasos de un acompañamiento</a></li>
    <li><a href="#cuando-falla">Cuando algo se sale del carril</a></li>
  </ol>
</nav>

<!-- ==================================================================== -->
<section class="capitulo" id="leeme">
  <h2>Antes de empezar</h2>
  <p class="quien">Léelo una vez · dos minutos</p>

  <h3>Las pantallas de este manual están dibujadas, no fotografiadas</h3>
  <p>
    Y es a propósito, por dos razones. La primera es que el portal enseña nombres,
    teléfonos y estado de salud de personas reales: un manual con esas capturas circula por
    WhatsApp, se reenvía y se queda en el teléfono de quien ya no está en el equipo. Los
    datos de salud son sensibles según la ley, y este documento no es sitio para ellos.
  </p>
  <p>
    La segunda es que los dibujos salen del mismo código que la pantalla de verdad —los
    mismos textos de botón, los mismos avisos—, así que se corrigen cuando el portal cambia
    en lugar de quedarse describiendo una versión vieja. <b>Las personas que aparecen son
    inventadas.</b>
  </p>

  <h3>Tres reglas que valen para todo el portal</h3>
  <div class="aviso dato">
    <b>El WhatsApp nunca se manda solo.</b>
    Todos los botones de WhatsApp abren la aplicación con el texto ya escrito. Alguien tiene
    que darle enviar. Lo único que sale automático son los correos.
  </div>
  <div class="aviso dato">
    <b>Los textos se editan en Parametrización.</b>
    Si un mensaje dice algo que ya no aplica, no hay que pedirle nada a nadie: se cambia en
    <span class="mono">Administración → Parametrización</span> y desde ese momento sale así.
  </div>
  <div class="aviso dato">
    <b>Todo queda en Auditoría.</b>
    Quién consultó, quién editó, quién aprobó y cuándo. No es para vigilar a nadie: es lo que
    permite responder «¿por qué apareció esta cita?» sin que la respuesta sea «no se sabe».
  </div>
</section>

<!-- ==================================================================== -->
<section class="capitulo" id="verificaciones">
  <h2>Verificaciones</h2>
  <p class="quien">Lo hace: coordinación · Lo espera: quien se postuló</p>
  <p>
    Verificar es comprobar que quien va a acompañar a alguien es de verdad psicólogo y puede
    ejercer. Es el único trámite de la red que <b>no se puede saltar</b>: sin tarjeta
    verificada, esa persona no debería recibir un caso.
  </p>
  <p>
    Se hace <b>una vez por profesional</b>, no una vez por caso. Una vez aprobada, la tarjeta
    queda verificada para siempre y no vuelve a pedirse.
  </p>

  <h3>1 · De dónde sale la gente que aparece en esta pantalla</h3>
  <p>
    De <span class="mono">Postulaciones</span>. Alguien llena «Quiero dar apoyo psicológico»
    en el sitio, coordinación revisa la postulación y la aprueba: ahí queda ACTIVO en la red
    y aparece en Verificaciones. Aprobar la postulación <b>no</b> verifica la tarjeta — son
    dos cosas distintas y esta es la segunda.
  </p>

  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/portal/verificaciones</span>
      </div>
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
        <div class="tarjeta">
          <div class="fuerte">Pendientes de aprobación <span class="apagado">· 2</span></div>
          <div class="apagado" style="margin-bottom:10px">Subieron sus documentos por su enlace. Revisa y aprueba aquí mismo.</div>
          <div class="fila" style="align-items:flex-start;gap:14px">
            <div class="fila" style="gap:6px">
              <span class="doc">Tarjeta / certificado</span>
              <span class="doc">Identidad</span>
            </div>
            <div style="flex:1;min-width:200px">
              <div class="fuerte">Mariana Restrepo Ortiz</div>
              <div class="apagado">Psicología · Pereira · 300 000 0000</div>
              <div class="apagado">Experiencia: 6 años · Subió sus documentos el 2 de septiembre</div>
              <div class="fila" style="margin-top:8px">
                <span class="campo">Nº de tarjeta profesional</span>
                <span class="btn principal">Aprobar verificación</span>
                <span class="btn">Mover a Voluntariado</span>
                <span class="btn">Rechazar</span>
              </div>
            </div>
          </div>
        </div>
        <div class="tarjeta">
          <div class="fuerte">Falta pedirles los documentos <span class="apagado">· 5</span></div>
          <div class="fila" style="margin-top:8px">
            <span>Andrés Felipe Gómez</span>
            <span class="btn">Pedir por WhatsApp</span>
          </div>
        </div>
      </div>
    </div>
    <figcaption>
      <b>Verificaciones</b> tiene dos listas y las dos importan. Arriba, quien ya subió sus
      documentos y espera que alguien los mire. Abajo, a quien todavía no se los hemos
      pedido — esa segunda lista es la que se olvida.
    </figcaption>
  </figure>

  <h3>2 · Pedirle los documentos</h3>
  <div class="paso">
    <div class="paso__n">1</div>
    <div class="paso__c">
      <p>Baja a <b>«Falta pedirles los documentos»</b> y busca a la persona.</p>
    </div>
  </div>
  <div class="paso">
    <div class="paso__n">2</div>
    <div class="paso__c">
      <p>
        Toca <b>«Pedir por WhatsApp»</b>. Se abre WhatsApp con el mensaje escrito y su
        enlace personal dentro. <b>Dale enviar</b>: el botón solo lo prepara.
      </p>
    </div>
  </div>
  <div class="paso">
    <div class="paso__n">3</div>
    <div class="paso__c">
      <p>
        Ese enlace le sirve <b>30 días</b>. Si se le vence, vuelve a esta pantalla y toca el
        botón otra vez: sale uno nuevo.
      </p>
    </div>
  </div>
  <p>
    Desde <span class="mono">Postulaciones</span> también se puede pedir por correo, que sirve
    para quien no contesta WhatsApp.
  </p>

  <h3>3 · Lo que él ve, y lo que sube</h3>
  <p>
    Abre su enlace en el celular y sube tres archivos. Los dos primeros son obligatorios:
  </p>
  <ul>
    <li><b>Tarjeta profesional o certificado de estudios</b></li>
    <li><b>Documento de identidad — cara de adelante</b></li>
    <li>Documento de identidad — respaldo <span class="apagado">(si aplica)</span></li>
  </ul>
  <p>
    Al darle a <b>«Enviar mis documentos»</b> pasa de la lista de abajo a la de arriba, y ahí
    te aparece a ti. <b>Nadie te avisa</b> de que llegaron: hay que entrar a mirar. Vale la
    pena hacerlo una vez al día.
  </p>
  <div class="aviso ojo">
    <b>Los archivos no se guardan en el portal.</b>
    Están en un depósito privado y se abren con enlaces que caducan en un minuto. Si dejas la
    pantalla abierta un rato y la miniatura deja de cargar, recarga: no se perdió nada.
  </div>

  <h3>4 · Comprobar que la tarjeta existe</h3>
  <p>
    Este es el paso que de verdad importa, y es el único que no hace el sistema. Arriba de la
    pantalla están los cuatro sitios oficiales, cada uno abre en otra pestaña:
  </p>
  <table>
    <tr><th>Sitio</th><th>Para qué</th></tr>
    <tr><td><b>Colpsic</b> 🇨🇴</td><td>Verificación de tarjeta profesional del Colegio Colombiano de Psicólogos. Es la principal.</td></tr>
    <tr><td><b>ReTHUS</b> 🇨🇴</td><td>Registro de Talento Humano en Salud (MinSalud). Sirve cuando en Colpsic no aparece.</td></tr>
    <tr><td><b>CPSP</b> 🇵🇪</td><td>Colegio de Psicólogos del Perú, para quien se colegió allá.</td></tr>
    <tr><td><b>SUNEDU</b> 🇵🇪</td><td>Registro de grados y títulos del Perú.</td></tr>
  </table>
  <p>
    Busca con el número de cédula que aparece en el documento de identidad que subió, y
    compara: <b>el nombre del registro tiene que ser el mismo</b> que el del documento.
  </p>

  <h3>5 · Aprobar</h3>
  <div class="paso">
    <div class="paso__n">1</div>
    <div class="paso__c"><p>Escribe el <b>número de tarjeta profesional</b> en el campo. No es obligatorio, pero sin él nadie puede volver a comprobarlo después sin repetir toda la búsqueda.</p></div>
  </div>
  <div class="paso">
    <div class="paso__n">2</div>
    <div class="paso__c"><p>Toca <b>«Aprobar verificación»</b>. La tarjeta desaparece de la lista.</p></div>
  </div>
  <div class="aviso bien">
    <b>Qué cambia al aprobar</b>
    Deja de salir el aviso rojo «TP sin verificar» en las tarjetas del tablero, y ya puede
    recibir casos con tranquilidad. Queda en Auditoría quién aprobó y cuándo.
  </div>
  <div class="aviso ojo">
    <b>Aprobar no le avisa a él.</b>
    No sale ningún correo ni ningún WhatsApp. Si quieres que lo sepa —y suele estar
    esperando—, escríbele tú.
  </div>

  <h3>6 · Rechazar</h3>
  <p>
    Cuando el registro no aparece, los documentos están ilegibles después de habérselos
    pedido otra vez, o no es el perfil. Toca <b>«Rechazar»</b> y sale un cuadro con:
  </p>
  <ul>
    <li>
      <b>Motivo principal</b>, de una lista fija: tarjeta no verificable en Colpsic/ReTHUS ·
      documentos ilegibles o incompletos tras solicitud previa · no cumple el perfil de
      atención psicológica · no se logró contacto tras varios intentos · otro motivo.
    </li>
    <li>
      <b>Detalles adicionales</b>, para el equipo. Escribe lo concreto: <i>«No registra en
      Colpsic con la cédula suministrada»</i> le ahorra a quien lo lea dentro de seis meses
      tener que repetir la búsqueda.
    </li>
  </ul>
  <p>La postulación queda archivada como inactiva y sale de la lista.</p>

  <h3>7 · Cuando no es psicólogo, pero sirve</h3>
  <p>
    Pasa seguido: se postula alguien de Trabajo Social, Derecho, Enfermería, Diseño o
    Sistemas. No puede acompañar psicológicamente, pero la red lo necesita. En vez de
    rechazarlo, <b>«Mover a Voluntariado»</b>, eligiendo su área:
  </p>
  <div class="fila" style="margin-bottom:12px">
    <span class="chip gris">📘 Social, legal y educativo</span>
    <span class="chip gris">🩺 Salud y primeros auxilios</span>
    <span class="chip gris">📦 Operación y logística</span>
    <span class="chip gris">💻 Comunicación y tecnología</span>
    <span class="chip gris">📊 Gestión y proyectos</span>
    <span class="chip gris">✨ Otra área</span>
  </div>
  <p>
    Pasa a <span class="mono">Voluntariado de apoyo</span> y desde ahí se le pueden asignar
    tareas internas. No se pierde a nadie que quiso ayudar.
  </p>
</section>

<!-- ==================================================================== -->
<section class="capitulo" id="agendamiento">
  <h2>Agendamiento: los 7 pasos</h2>
  <p class="quien">Lo hacen: la persona · coordinación · el profesional · el sistema</p>
  <p>
    Todo acompañamiento recorre los mismos siete pasos, y el portal los enseña siempre con
    los mismos números. La tira aparece arriba de la ficha de cada persona, con el paso
    actual encendido:
  </p>

  <div class="tira">
    <span class="p hecho"><b>1</b> Llega la solicitud</span>
    <span class="p hecho"><b>2</b> Admisión</span>
    <span class="p hecho"><b>3</b> Asignar profesional</span>
    <span class="p ahora"><b>4</b> Elige su hora</span>
    <span class="p"><b>5</b> Preparar la sesión</span>
    <span class="p"><b>6</b> La sesión</span>
    <span class="p"><b>7</b> Seguimiento y cierre</span>
  </div>

  <div class="aviso dato">
    <b>Los pasos 4, 5 y 6 se repiten en cada sesión.</b>
    Un acompañamiento de seis sesiones pasa seis veces por ahí. Que el caso vuelva al 4 no
    es un retroceso: es que toca agendar la siguiente.
  </div>

  <h3>Paso 1 · Llega la solicitud</h3>
  <h4>Quién · La persona, sola, desde el sitio</h4>
  <p>
    Llena «Necesito ayuda» en <span class="mono">redaquiestamos.org</span>. Queda registrada
    en <span class="mono">Solicitudes</span> y a coordinación le llega un correo.
  </p>
  <h4>Qué haces tú</h4>
  <p>
    Entrar a <span class="mono">Solicitudes</span> y mandarle el <b>enlace de tamizaje</b> por
    WhatsApp: son 7 preguntas cortas que se responden en un minuto desde el celular.
  </p>

  <h3>Paso 2 · Admisión</h3>
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
  </div>
  <div class="aviso stop">
    <b>Si el tamizaje detecta riesgo</b>
    La pantalla le enseña de inmediato las líneas de emergencia (123 y 106) y a coordinación
    le entra un aviso prioritario. Eso se atiende ese mismo día, no mañana.
  </div>

  <h3>Paso 3 · Asignar profesional</h3>
  <h4>Quién · Coordinación</h4>
  <p>
    Desde la ficha de la persona. El sistema calcula un <b>Top 10</b> por enfoque, modalidad,
    cercanía y cupo libre; tú eliges de esa lista.
  </p>
  <div class="aviso dato">
    <b>Ya no se le pide permiso: se le asigna y se le avisa.</b>
    De ocho asignaciones hechas para una persona con prioridad alta, siete murieron con el
    motivo «el profesional no respondió». Esperar un sí no le daba margen a él — dejaba el
    caso parado.
  </div>
  <h4>Qué haces tú</h4>
  <p>
    Eliges al profesional y mandas el mensaje del <b>paso 3</b> que aparece en la ficha:
    le dice que el caso ya es suyo y que la persona elegirá hora de su agenda.
  </p>
  <h4>Qué puede hacer él</h4>
  <p>Desde su enlace, tres cosas:</p>
  <ul>
    <li><b>Confirmar</b> que se queda con el caso. No es obligatorio —el caso avanza igual— pero queda registrado.</li>
    <li><b>Corregir su agenda</b>, si sus horarios cambiaron. Importa: es de ahí de donde la persona va a escoger.</li>
    <li><b>Decir que no puede.</b> El caso se libera al instante y vuelve a «Por Asignar» el mismo día. El motivo es opcional a propósito: exigirlo para decir que no es cobrarle a alguien por avisar a tiempo.</li>
  </ul>

  <h3>Paso 4 · Elige su hora</h3>
  <h4>Quién · La persona, sola, desde su enlace</h4>
  <p>
    Abre su enlace de agenda y ve los espacios <b>libres de verdad</b> del profesional,
    agrupados por día y por momento. Escoge uno, y en esa misma pantalla lee y acepta el
    consentimiento.
  </p>

  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/agenda/&lt;su enlace&gt;</span>
      </div>
      <div class="lienzo">
        <div class="tarjeta" style="max-width:460px;margin:0 auto">
          <div class="apagado" style="font-size:0.78rem">← Elegir otra hora</div>
          <div style="background:var(--verde-suave);border:1px solid var(--borde);border-radius:10px;padding:11px 13px;margin:10px 0 16px">
            <div class="titulillo">Tu sesión</div>
            <div class="fuerte">viernes, 12 de septiembre, 4:00 p. m.</div>
            <div class="apagado">con Mariana Restrepo · 45 minutos</div>
          </div>
          <div class="fuerte" style="font-size:0.95rem">Léelo y acéptalo para agendar</div>
          <div class="apagado" style="margin-bottom:10px">Es lo único que falta, y solo se hace la primera vez.</div>
          <div class="apagado" style="font-size:0.8rem">
            <b style="color:var(--tinta)">Qué es esto</b> · <b style="color:var(--tinta)">Confidencialidad</b> ·
            <b style="color:var(--tinta)">Es voluntario</b> · <b style="color:var(--tinta)">Tus datos</b> ·
            <b style="color:var(--tinta)">Tu firma</b>
          </div>
          <div style="color:var(--verde);font-size:0.8rem;margin:10px 0">Ver el texto completo en una página aparte</div>
          <div class="fila" style="margin-bottom:10px">
            <span style="width:16px;height:16px;border:1.5px solid var(--borde);border-radius:4px;display:inline-block"></span>
            <span style="font-size:0.82rem;flex:1">Leí y acepto este consentimiento para recibir el acompañamiento.</span>
          </div>
          <div class="apagado" style="font-size:0.8rem">Tu nombre completo <i>— escribirlo aquí es tu firma</i></div>
          <div class="campo" style="width:100%;margin:4px 0 12px">&nbsp;</div>
          <div class="btn principal" style="width:100%;justify-content:center;padding:11px">Confirmar mi sesión</div>
        </div>
      </div>
    </div>
    <figcaption>
      Lo que ve la persona al tocar una hora. La hora y el consentimiento son
      <b>una sola decisión</b>: un botón hace las dos cosas. Si no firma, no se crea nada y
      esa hora sigue libre para alguien más.
    </figcaption>
  </figure>

  <div class="aviso bien">
    <b>Al confirmar, pasan cuatro cosas solas</b>
    La cita nace <span class="chip verde">Confirmada</span> · la asignación pasa a ACTIVA ·
    le sale un correo a ella con su enlace de entrada · y otro a él con la sala y el caso.
  </div>
  <div class="aviso ojo">
    <b>Si pasan 3 días sin que elija hora, el caso vuelve a la cola.</b>
    El tablero avisa cuáles se liberan mañana: esa es la ventana para escribirle antes de
    perder al profesional. El plazo es más largo que el de él a propósito — quien pide ayuda
    puede estar sin batería, sin datos o sin cabeza.
  </div>
  <h4>Si ella prefiere que le agendes tú</h4>
  <p>
    Hay quien prefiere escribir a entrar a una pantalla, y a quien está mal no se le pone una
    barrera. Desde la ficha puedes agendarle. <b>Esas citas nacen sin firma</b>
    (<span class="chip ambar">Programada</span>) y hay que pedirle el consentimiento aparte:
    la ficha de la cita te lo va a pedir de primero.
  </p>

  <h3>Paso 5 · Preparar la sesión</h3>
  <h4>Quién · Coordinación, desde la ficha de la cita</h4>
  <p>
    Preparar no es un instante: tiene momentos. La tarjeta <b>«Qué toca con esta cita»</b> te
    enseña <b>uno a la vez</b>, el que toca ahora, y deja el resto plegado abajo.
  </p>

  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/portal/agenda/&lt;id de la cita&gt;</span>
      </div>
      <div class="lienzo">
        <div class="tarjeta" style="border-left:4px solid var(--azul)">
          <div class="titulillo">Qué toca con esta cita</div>
          <div class="fuerte" style="font-size:1rem">Recién agendada: confírmasela a los dos</div>
          <div class="apagado" style="margin-bottom:10px">
            Los dos correos ya salieron solos. El WhatsApp es lo que de verdad leen, y por
            ahora se manda desde aquí.
          </div>
          <div style="font-size:0.82rem;font-weight:700;margin-bottom:4px">Confirmarle la cita a la persona</div>
          <div class="fila" style="margin-bottom:10px">
            <span class="btn principal">Abrir WhatsApp</span>
            <span class="btn">Copiar mensaje</span>
            <span class="apagado" style="font-size:0.78rem">Ver el mensaje</span>
          </div>
          <div style="font-size:0.82rem;font-weight:700;margin-bottom:4px">Confirmarle la cita al profesional</div>
          <div class="fila">
            <span class="btn principal">Abrir WhatsApp</span>
            <span class="btn">Copiar mensaje</span>
            <span class="apagado" style="font-size:0.78rem">Ver el mensaje</span>
          </div>
        </div>
        <div class="apagado" style="font-size:0.82rem">Todos los mensajes de esta cita</div>
      </div>
    </div>
    <figcaption>
      La tarjeta cambia de contenido según el momento. Esta es la primera:
      <b>recién agendada</b>. Debajo, el enlace gris abre los diez mensajes de la cita, que
      siguen todos disponibles.
    </figcaption>
  </figure>

  <h4>Los momentos, en orden</h4>
  <table>
    <tr><th>Cuando…</th><th>La tarjeta pide</th></tr>
    <tr><td>Falta la firma del consentimiento</td><td>Pedirle la firma. Va de primero siempre: <b>sin consentimiento no se empieza la sesión</b>.</td></tr>
    <tr><td>Recién agendada (12 h)</td><td>Confirmársela a los dos.</td></tr>
    <tr><td>Se acerca la hora (24 h)</td><td>Recordársela a los dos.</td></tr>
    <tr><td>Ella no dejó correo</td><td>Confirmársela tú: no le llegó nada y no le va a llegar.</td></tr>
    <tr><td>La cita está cancelada</td><td>Avisarles a los dos. <b>Cancelar no le avisa a nadie solo.</b></td></tr>
  </table>
  <div class="aviso dato">
    <b>Confirmar y recordar no son lo mismo.</b>
    «Quedó agendada, aquí tienes tu enlace» y «es hoy, nos vemos» son dos mensajes distintos,
    y entre uno y otro pueden pasar dos semanas. Por eso la tarjeta no te ofrece recordar una
    cita que se agendó hace diez minutos.
  </div>

  <h3>Paso 6 · La sesión</h3>
  <h4>Quién · Las dos personas. Tú no tienes que hacer nada.</h4>
  <p>
    Dura 45 minutos. Si es virtual, cada uno entra por <b>su</b> enlace de sala —son dos
    llaves distintas, una por rol— y la pantalla de la cita enseña en vivo quién ya entró y
    cuánto llevan.
  </p>
  <div class="aviso bien">
    <b>La cita se cierra sola cuando hay prueba.</b>
    Si el profesional reporta la sesión, o si los dos entraron a la sala, pasa a
    <span class="chip verde">Realizada</span> sin que nadie marque nada. Si él reporta que no
    se presentó, a <span class="chip rojo">No asistió</span>.
  </div>
  <p>
    Sin ninguna de las dos pruebas se queda abierta, y sale en <b>«Lo que está esperando»</b>
    dentro de Métricas. Eso no es un error del sistema: es trabajo pendiente que alguien tiene
    que cerrar a mano.
  </p>

  <h3>Paso 7 · Seguimiento y cierre</h3>
  <h4>Quién · El profesional reporta · la persona evalúa · coordinación cierra</h4>
  <div class="paso">
    <div class="paso__n">1</div>
    <div class="paso__c">
      <p>
        <b>Él reporta</b> desde su mismo enlace: si la sesión se hizo y qué sigue —necesita
        más, con esta fue suficiente, o se remite a otra institución—.
      </p>
    </div>
  </div>
  <div class="paso">
    <div class="paso__n">2</div>
    <div class="paso__c">
      <p>
        <b>Tú lees el reporte</b> en la ficha. Si dice que necesita más, le mandas su enlace
        para que elija la siguiente hora: <b>vuelve al paso 4</b>. La hora no la escoges tú —
        depende de su disponibilidad y de cómo esté, y eso solo lo sabe ella.
      </p>
    </div>
  </div>
  <div class="paso">
    <div class="paso__n">3</div>
    <div class="paso__c">
      <p>
        <b>Ella responde la encuesta</b> de experiencia, que es anónima. Se le manda desde
        la ficha.
      </p>
    </div>
  </div>
  <div class="paso">
    <div class="paso__n">4</div>
    <div class="paso__c">
      <p>
        <b>Cierras el caso con motivo.</b> Libera el cupo del profesional y el caso pasa a
        «Cerrados recientes». No se puede cerrar sin haber leído el reporte.
      </p>
    </div>
  </div>
</section>

<!-- ==================================================================== -->
<section class="capitulo" id="cuando-falla">
  <h2>Cuando algo se sale del carril</h2>
  <p class="quien">Los casos que de verdad pasan</p>

  <table>
    <tr><th>Pasa esto</th><th>Haces esto</th></tr>
    <tr>
      <td><b>La sesión se canceló</b></td>
      <td>
        El caso vuelve solo al paso 4 y la ficha te pide «Agendar otra sesión». Ojo: cancelar
        <b>no le avisa a nadie</b>. Los dos mensajes están en la ficha de la cita cancelada.
      </td>
    </tr>
    <tr>
      <td><b>No se presentó</b></td>
      <td>
        Eso sí cuenta como sesión — la hora llegó y se gastó —, así que el caso avanza a
        seguimiento y desde ahí se agenda otra.
      </td>
    </tr>
    <tr>
      <td><b>Hay que cambiar de profesional</b></td>
      <td>
        Botón <b>«Reasignar»</b> en la ficha. El enlace de agenda de la persona
        <b>no cambia</b>: el mismo enlace pasa a mostrar la agenda del nuevo. No hay que
        mandarle nada nuevo.
      </td>
    </tr>
    <tr>
      <td><b>Hay que mover la hora</b></td>
      <td>
        <b>«Reprogramar Cita»</b> en la ficha de la cita. El consentimiento firmado se
        conserva: no se le pide de nuevo.
      </td>
    </tr>
    <tr>
      <td><b>Ella no dejó correo</b></td>
      <td>
        No recibe nada automático — ni la confirmación ni el recordatorio. La ficha de la cita
        te lo dice y te pide el WhatsApp. Es su único aviso.
      </td>
    </tr>
    <tr>
      <td><b>El profesional no responde nada</b></td>
      <td>
        No pasa nada: el caso avanza igual, porque no se le está pidiendo permiso. Lo que sí
        conviene revisar es que su agenda esté al día — de ahí escoge la persona.
      </td>
    </tr>
    <tr>
      <td><b>Alguien lleva días sin que nadie lo mire</b></td>
      <td>
        La lista de <span class="mono">Acompañadas</span> tiene la columna «Qué toca ahora»
        con lo más urgente de cada caso, y se puede ordenar por eso.
      </td>
    </tr>
  </table>
</section>

<footer>
  Red Aquí Estamos · Manual operativo, primera entrega: verificaciones y agendamiento.<br>
  Las pantallas son reproducciones y las personas que aparecen son inventadas: este documento
  no contiene datos de nadie.
</footer>

</div>
</body>
</html>`
