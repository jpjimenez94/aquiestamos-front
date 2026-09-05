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
    margin: 0 0 6px;
  }
  /* Cada capítulo se pliega desde su título. */
  details.capitulo { scroll-margin-top: 20px; }
  details.capitulo > summary {
    cursor: pointer; list-style: none; position: relative; padding-right: 40px;
    -webkit-user-select: none; user-select: none;
  }
  details.capitulo > summary::-webkit-details-marker { display: none; }
  details.capitulo > summary::after {
    content: ''; position: absolute; right: 6px; top: 12px;
    width: 12px; height: 12px;
    border-right: 2.5px solid var(--tinta-suave); border-bottom: 2.5px solid var(--tinta-suave);
    transform: rotate(45deg); transition: transform 0.18s ease;
  }
  details.capitulo:not([open]) > summary::after { transform: rotate(-45deg); }
  details.capitulo:not([open]) > summary .quien { margin-bottom: 0; }
  details.capitulo > summary:hover h2 { color: var(--verde); }
  /* Plegado, el capítulo se ve como una fila del índice, no como una caja vacía. */
  details.capitulo:not([open]) { padding: 18px 30px; }
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
    details.capitulo > summary::after { display: none; }
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
<details class="capitulo" id="leeme">
  <summary>
    <h2>Antes de empezar</h2>
    <p class="quien">Léelo una vez · dos minutos</p>
  </summary>

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
</details>

<!-- ==================================================================== -->
<details class="capitulo" id="verificaciones">
  <summary>
    <h2>Verificaciones</h2>
    <p class="quien">Lo hace: coordinación · Lo espera: quien se postuló</p>
  </summary>
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

  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/documentos/&lt;su enlace&gt;</span>
      </div>
      <div class="lienzo">
        <div class="tarjeta" style="max-width:480px;margin:0 auto">
          <div class="fuerte" style="font-size:1rem;margin-bottom:2px">Tus documentos</div>
          <div class="apagado" style="margin-bottom:12px">Se guardan en privado. Solo los ve coordinación para verificar tu tarjeta.</div>
          <div style="font-size:0.82rem;font-weight:700">Tarjeta profesional o certificado de estudios *</div>
          <div class="campo" style="width:100%;margin:4px 0 10px">Elegir archivo…</div>
          <div style="font-size:0.82rem;font-weight:700">Documento de identidad — cara de adelante *</div>
          <div class="campo" style="width:100%;margin:4px 0 10px">Elegir archivo…</div>
          <div style="font-size:0.82rem;font-weight:700">Documento de identidad — respaldo <span class="apagado">(si aplica)</span></div>
          <div class="campo" style="width:100%;margin:4px 0 14px">Elegir archivo…</div>
          <div class="btn principal" style="width:100%;justify-content:center;padding:11px">Enviar mis documentos</div>
        </div>
      </div>
    </div>
    <figcaption>
      Lo que ve él en el celular al abrir su enlace. Tres archivos, dos obligatorios. Al enviar,
      pasa a tu lista de «Pendientes de aprobación» — y ahí se queda hasta que alguien entre.
    </figcaption>
  </figure>
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
  <p class="apagado">
    ¿Los documentos no son de Colombia ni de Perú? Ninguno de los cuatro sitios sirve. Está
    resuelto en <a href="#cuando-falla">«Cuando algo se sale del carril»</a>.
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

  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/portal/verificaciones</span>
      </div>
      <div class="lienzo">
        <div class="tarjeta" style="max-width:520px;margin:0 auto;border-left:4px solid var(--rojo)">
          <div class="fuerte" style="font-size:1rem">Rechazar Postulación</div>
          <div class="apagado" style="margin-bottom:10px">Mariana Restrepo Ortiz</div>
          <div class="apagado" style="margin-bottom:12px">Al rechazar esta postulación, el registro quedará archivado como inactivo y se retirará de las verificaciones pendientes.</div>
          <div style="font-size:0.78rem;font-weight:700">Motivo Principal:</div>
          <div class="campo" style="width:100%;margin:4px 0 10px;color:var(--tinta)">Tarjeta profesional no verificable o inválida en Colpsic / ReTHUS ▾</div>
          <div style="font-size:0.78rem;font-weight:700">Detalles Adicionales (Interno):</div>
          <div class="campo" style="width:100%;margin:4px 0 14px;min-height:44px">Ej. No registra en Colpsic con cédula suministrada.</div>
          <div class="fila">
            <span class="btn peligro">Rechazar y archivar postulación</span>
            <span class="btn">Cancelar</span>
          </div>
        </div>
      </div>
    </div>
    <figcaption>
      El cuadro de rechazo. El motivo es de lista cerrada para poder contarlos después; los
      detalles son texto libre y <b>solo los ve el equipo</b>. Ahí va lo concreto.
    </figcaption>
  </figure>

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

  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/portal/verificaciones</span>
      </div>
      <div class="lienzo">
        <div class="tarjeta" style="max-width:520px;margin:0 auto;border-left:4px solid var(--azul)">
          <div class="titulillo">Voluntariado de Apoyo</div>
          <div class="fuerte" style="font-size:1rem">Mover a Voluntariado</div>
          <div class="apagado" style="margin-bottom:10px">Andrés Felipe Gómez · Trabajo Social</div>
          <div class="apagado" style="margin-bottom:12px">No puede acompañar psicológicamente, pero la red lo necesita. Elige el área en la que puede aportar y pasa al directorio de voluntariado.</div>
          <div style="font-size:0.78rem;font-weight:700">Área de apoyo:</div>
          <div class="campo" style="width:100%;margin:4px 0 6px;color:var(--tinta)">📘 Social, legal y educativo (Trabajo Social, Derecho, Pedagogía) ▾</div>
          <div class="apagado" style="font-size:0.76rem;line-height:1.7;margin-bottom:14px">
            🩺 Salud y primeros auxilios · 📦 Operación y logística · 💻 Comunicación y tecnología · 📊 Gestión y proyectos · ✨ Otra área
          </div>
          <div class="fila">
            <span class="btn principal">Confirmar y Mover a Colaboradores</span>
            <span class="btn">Cancelar</span>
          </div>
        </div>
      </div>
    </div>
    <figcaption>
      El cuadro de mover. Una sola decisión —el área— y confirmar. Sale de Verificaciones y
      aparece en <span class="mono">Voluntariado de apoyo</span> listo para recibir tareas.
    </figcaption>
  </figure>
</details>

<!-- ==================================================================== -->
<details class="capitulo" id="agendamiento">
  <summary>
    <h2>Agendamiento: los 7 pasos</h2>
    <p class="quien">Lo hacen: la persona · coordinación · el profesional · el sistema</p>
  </summary>
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

  <h3>El mapa: el tablero de casos</h3>
  <p>
    Antes de entrar paso por paso, la vista que lo resume todo. Cada columna del tablero es
    un tramo del camino, y cada tarjeta es una persona. Se abre desde
    <span class="mono">Agenda de la red → Tablero de Casos</span>.
  </p>
  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/portal/agenda</span>
      </div>
      <div class="lienzo" style="overflow-x:auto">
        <div style="display:grid;grid-template-columns:repeat(5,minmax(150px,1fr));gap:8px;min-width:780px">
          <div class="tarjeta" style="padding:10px"><div class="titulillo">1. Por Asignar</div><div class="tarjeta" style="padding:8px;border-left:3px solid var(--rojo);background:var(--rojo-suave)"><div class="fuerte" style="font-size:0.8rem">Elena Cardona <span class="chip rojo">Alta</span></div><div class="apagado" style="font-size:0.72rem">Pereira · 3d en espera</div></div></div>
          <div class="tarjeta" style="padding:10px"><div class="titulillo">2. Asignadas · falta que elija hora</div><div class="tarjeta" style="padding:8px;border-left:3px solid var(--azul)"><div class="fuerte" style="font-size:0.8rem">Sara Múnera</div><div class="apagado" style="font-size:0.72rem">Aceptó: Mariana Restrepo</div><div style="font-size:0.7rem;color:var(--ambar);font-weight:700">Se libera en 1 día si no hay respuesta</div></div></div>
          <div class="tarjeta" style="padding:10px"><div class="titulillo">3. Agendada · falta confirmar</div><div class="apagado" style="font-size:0.75rem">Sin citas por confirmar</div></div>
          <div class="tarjeta" style="padding:10px"><div class="titulillo">4. Citas confirmadas</div><div class="tarjeta" style="padding:8px;border-left:3px solid var(--verde)"><div class="fuerte" style="font-size:0.8rem">Sara Múnera <span class="chip verde">Confirmada</span></div><div class="apagado" style="font-size:0.72rem">12/09, 4:00 p. m. · Mariana Restrepo</div><div style="font-size:0.7rem;color:var(--verde);font-weight:700">✓ Consentimiento firmado</div></div></div>
          <div class="tarjeta" style="padding:10px"><div class="titulillo">5. En acompañamiento / seguimiento</div><div class="tarjeta" style="padding:8px;border-left:3px solid var(--azul)"><div class="fuerte" style="font-size:0.8rem">Julián Ospina</div><div style="font-size:0.7rem;color:var(--ambar);font-weight:700">Esperando reporte</div><div class="apagado" style="font-size:0.72rem">Sesión: 4/09, 6:00 p. m. (Virtual)</div></div></div>
        </div>
      </div>
    </div>
    <figcaption>
      <b>Las columnas siguen los pasos:</b> «Por Asignar» es el paso 3 pendiente ·
      «Asignadas · falta que elija hora» es el 4 · «Agendada» y «Citas confirmadas» son el 5 ·
      «En acompañamiento» es el 7. Si hay asignaciones viejas en PROPUESTA aparece una columna
      más, «Propuestas antiguas», y las demás se renumeran. Toca cualquier tarjeta para ir a la
      ficha.
    </figcaption>
  </figure>

  <h3>Paso 1 · Llega la solicitud</h3>
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
  </div>

  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/portal/solicitudes</span>
      </div>
      <div class="lienzo">
        <div class="tarjeta" style="padding:0;overflow:hidden">
          <div class="fila entre" style="padding:8px 14px;background:#f4f1ea;font-size:0.7rem;letter-spacing:0.06em;text-transform:uppercase;font-weight:800;color:var(--tinta-suave)">
            <span style="flex:2">Persona</span><span style="flex:1">Tamizaje</span><span style="flex:1">Estado</span><span style="flex:1.4">Acciones</span>
          </div>
          <div class="fila entre" style="padding:10px 14px;border-top:1px solid var(--borde)">
            <span style="flex:2"><span class="fuerte">Elena Cardona</span><br><span class="apagado" style="font-size:0.76rem">Pereira · hace 2 horas</span></span>
            <span style="flex:1"><span class="chip ambar">Pendiente</span></span>
            <span style="flex:1"><span class="chip gris">Nuevo</span></span>
            <span style="flex:1.4" class="fila"><span class="btn principal">Preguntar</span><span class="btn">Copiar mensaje</span></span>
          </div>
          <div class="fila entre" style="padding:10px 14px;border-top:1px solid var(--borde)">
            <span style="flex:2"><span class="fuerte">Tomás Aristizábal</span><br><span class="apagado" style="font-size:0.76rem">Dosquebradas · ayer</span></span>
            <span style="flex:1"><span class="chip verde">Respondido</span></span>
            <span style="flex:1"><span class="chip verde">Admitida</span></span>
            <span style="flex:1.4"><span class="chip rojo">Prioridad Alta</span></span>
          </div>
        </div>
      </div>
    </div>
    <figcaption>
      Cada solicitud es una fila. La de abajo es <b>el caso normal</b>: llegó por el
      formulario con el tamizaje respondido, el sistema le puso prioridad y la admitió solo —
      de ahí en adelante vive en <span class="mono">Acompañadas</span>. La de arriba es la
      excepción: llegó sin respuestas y sale «Pendiente» con el botón <b>«Preguntar»</b>, que
      arma el WhatsApp con el enlace (y pasa a decir «Reenviar» si ya se mandó).
    </figcaption>
  </figure>

  <h3>Paso 2 · Admisión</h3>
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

  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/portal/personas/&lt;id de la persona&gt;</span>
      </div>
      <div class="lienzo">
        <div class="tira" style="margin-bottom:10px">
          <span class="p hecho"><b>1</b></span><span class="p hecho"><b>2</b></span>
          <span class="p ahora"><b>3</b> Asignar profesional</span>
          <span class="p"><b>4</b></span><span class="p"><b>5</b></span><span class="p"><b>6</b></span><span class="p"><b>7</b></span>
        </div>
        <div class="tarjeta">
          <div class="fuerte" style="font-size:1rem">¿Quién puede acompañarla?</div>
          <div class="apagado" style="margin-bottom:10px">Top 10 ordenado por trayectoria clínica (+5 años primero), modalidad solicitada y disponibilidad. Asignar le entrega el caso de una vez: después le avisas por WhatsApp desde la ficha, y si no puede lo dice desde su enlace.</div>
          <div class="fila entre" style="padding:8px 0;border-top:1px solid var(--borde)">
            <span><span class="fuerte">Mariana Restrepo Ortiz</span><br><span class="apagado" style="font-size:0.78rem">Psicología · 6 años · Virtual · Pereira · cupo 2/4</span></span>
            <span class="btn principal">Asignar</span>
          </div>
          <div class="fila entre" style="padding:8px 0;border-top:1px solid var(--borde)">
            <span><span class="fuerte">Camilo Betancur</span><br><span class="apagado" style="font-size:0.78rem">Psicología · 3 años · Presencial · Pereira · cupo 4/4</span></span>
            <span class="btn apagado">Sin cupo</span>
          </div>
        </div>
        <div class="tarjeta" style="border-left:4px solid var(--azul)">
          <div class="fuerte">3 · Avísale al profesional que tiene el caso</div>
          <div class="apagado" style="margin-bottom:8px">Con su enlace para confirmar, corregir su agenda o decir que no puede.</div>
          <div class="fila"><span class="btn principal">Abrir WhatsApp</span><span class="btn">Copiar mensaje</span><span class="apagado" style="font-size:0.78rem">Ver el mensaje</span></div>
        </div>
      </div>
    </div>
    <figcaption>
      La ficha en el paso 3. Arriba, el Top 10 con <b>«Asignar»</b> — quien está sin cupo sale
      apagado. Abajo, en cuanto asignas, aparece el mensaje del paso 3 para mandárselo. La
      tira de arriba marca en qué paso está el caso, y se abre paso por paso para ver qué
      pasó en cada uno.
    </figcaption>
  </figure>
  <h4>Qué puede hacer él</h4>
  <p>Desde su enlace, tres cosas:</p>
  <ul>
    <li><b>Confirmar</b> que se queda con el caso. No es obligatorio —el caso avanza igual— pero queda registrado.</li>
    <li><b>Corregir su agenda</b>, si sus horarios cambiaron. Importa: es de ahí de donde la persona va a escoger.</li>
    <li><b>Decir que no puede.</b> El caso se libera al instante y vuelve a «Por Asignar» el mismo día. El motivo es opcional a propósito: exigirlo para decir que no es cobrarle a alguien por avisar a tiempo.</li>
  </ul>

  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/portal/caso/&lt;id del caso&gt;</span>
      </div>
      <div class="lienzo">
        <div class="tarjeta" style="max-width:520px;margin:0 auto">
          <div class="titulillo">Te proponemos un acompañamiento</div>
          <div class="fuerte" style="font-size:1rem;margin-bottom:4px">¿Puedes acompañar este caso?</div>
          <div class="apagado" style="margin-bottom:12px">Mira si puedes tomarlo y dinos. No estás comprometido a nada.</div>
          <div style="font-size:0.82rem;font-weight:700;margin-bottom:4px">Estos son los espacios que vamos a ofrecerle:</div>
          <div class="apagado" style="font-size:0.82rem;line-height:1.7;margin-bottom:12px">
            Lunes · 2:00 a 6:00 p. m.<br>Miércoles · 8:00 a. m. a 12:00 m.<br>Viernes · 2:00 a 6:00 p. m.
          </div>
          <div class="fila" style="margin-bottom:8px"><span class="btn principal">Sí puedo, sigo con el caso</span><span class="btn">Cambiar mis horarios</span></div>
          <div class="apagado" style="font-size:0.78rem;margin-bottom:6px">¿No puedes tomarlo? Dinos y lo liberamos <span class="apagado">(el motivo es opcional)</span></div>
          <div class="fila"><span class="btn">Enviar y liberar el caso</span></div>
        </div>
      </div>
    </div>
    <figcaption>
      Lo que ve él al abrir su enlace: <b>sus propios horarios</b> —los que la persona va a
      ver— y tres salidas. Confirmar, corregir los horarios («Guardar mis horarios»), o
      liberar el caso. Si no toca nada, el caso avanza igual.
    </figcaption>
  </figure>

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

  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/portal/agenda/&lt;id de la cita&gt;</span>
      </div>
      <div class="lienzo">
        <div class="tarjeta">
          <div class="fila entre" style="margin-bottom:10px">
            <span><span class="fuerte">Telemetría y Asistencia a la Sala Virtual</span><br><span class="apagado" style="font-size:0.78rem">Rastreo en tiempo real de conexión a la videollamada, ingresos a la sala y tiempo efectivo en sesión.</span></span>
            <span class="btn principal">Entrar a la sala</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px">
            <div class="tarjeta" style="margin:0"><div class="titulillo">Persona acompañada</div><div class="fuerte" style="color:var(--verde)">En la sala</div><div class="apagado" style="font-size:0.75rem">entró hace 3 min</div></div>
            <div class="tarjeta" style="margin:0"><div class="titulillo">Psicólogo(a)</div><div class="fuerte">Sin conexión aún</div><div class="apagado" style="font-size:0.75rem">Aún no abre el enlace</div></div>
            <div class="tarjeta" style="margin:0"><div class="titulillo">Tiempo en videollamada</div><div class="fuerte">0 min</div><div class="apagado" style="font-size:0.75rem">Esperando inicio</div></div>
          </div>
        </div>
      </div>
    </div>
    <figcaption>
      La ficha de la cita durante la sesión. Aquí ella ya entró y él todavía no: es el momento
      de escribirle a él. <b>«Entrar a la sala»</b> es para supervisar, no para participar. El
      contador arranca cuando están los dos.
    </figcaption>
  </figure>
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

  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/portal/personas/&lt;id de la persona&gt;</span>
      </div>
      <div class="lienzo">
        <div class="tira" style="margin-bottom:10px">
          <span class="p hecho"><b>1</b></span><span class="p hecho"><b>2</b></span><span class="p hecho"><b>3</b></span>
          <span class="p hecho"><b>4</b></span><span class="p hecho"><b>5</b></span>
          <span class="p ahora"><b>6</b> La sesión</span>
          <span class="p"><b>7</b> Seguimiento y cierre</span>
        </div>
        <div class="tarjeta" style="border-left:4px solid var(--verde);background:var(--verde-suave)">
          <div class="fila entre">
            <span><div class="titulillo">Qué toca ahora</div><span class="fuerte" style="font-size:1rem">Preguntar cómo le fue</span><br><span class="apagado">la sesión fue hace 1 día</span></span>
            <span class="btn principal">Seguimiento</span>
          </div>
        </div>
        <div class="apagado" style="font-size:0.82rem;margin-bottom:10px">Más acciones</div>
        <div class="tarjeta">
          <div class="fuerte">Qué ha reportado quien acompaña</div>
          <div class="apagado" style="margin-bottom:8px">Lo que respondió desde su enlace de acceso. Se va sumando: la entrada de arriba es la más reciente.</div>
          <div style="border-left:3px solid var(--borde);padding-left:12px">
            <div class="fuerte" style="font-size:0.9rem">Quedamos en una cita</div>
            <div class="apagado" style="font-size:0.8rem">Sobre la sesión del 4/09, 6:00 p. m. · virtual · próxima: 11/09, 6:00 p. m.</div>
            <div class="apagado" style="font-size:0.8rem">Lo reportó: Mariana Restrepo Ortiz</div>
          </div>
        </div>
      </div>
    </div>
    <figcaption>
      La ficha después de una sesión. «Qué toca ahora» pide preguntar cómo le fue, y
      <b>«Seguimiento»</b> abre los dos WhatsApp: a ella y a él. Abajo, lo que él ya reportó
      desde su enlace; cuando dice «necesita más», el caso vuelve al paso 4 y la tarjeta pasa
      a ofrecerte su enlace para que elija la siguiente hora.
    </figcaption>
  </figure>
</details>

<!-- ==================================================================== -->
<details class="capitulo" id="cuando-falla">
  <summary>
    <h2>Cuando algo se sale del carril</h2>
    <p class="quien">Los casos que de verdad pasan</p>
  </summary>

  <h3>La sesión se canceló</h3>
  <p>El caso vuelve solo al paso 4 y la ficha te pide <b>«Agendar otra sesión»</b>. Ojo: cancelar <b>no le avisa a nadie</b>. Los dos mensajes están en la ficha de la cita cancelada.</p>
  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/portal/personas/&lt;id de la persona&gt;</span>
      </div>
      <div class="lienzo">
        <div class="tira" style="margin-bottom:10px"><span class="p hecho"><b>1</b></span><span class="p hecho"><b>2</b></span><span class="p hecho"><b>3</b></span><span class="p ahora"><b>4</b> Elige su hora</span><span class="p"><b>5</b></span><span class="p"><b>6</b></span><span class="p"><b>7</b></span></div>
        <div class="tarjeta" style="border-left:4px solid var(--ambar);background:var(--ambar-suave)">
          <div class="fila entre">
            <span><div class="titulillo">Qué toca ahora</div><span class="fuerte" style="font-size:1rem">Agendar otra sesión</span><br><span class="apagado">la última se canceló</span></span>
            <span class="fila"><span class="btn principal">Agendar otra sesión</span><span class="btn">Reasignar</span></span>
          </div>
        </div>
        <div class="tarjeta" style="padding:10px 14px">
          <div class="apagado" style="font-size:0.8rem">Citas · 4/09/2026, 6:30 p. m. · Virtual · <span class="chip rojo">Cancelada</span> · <span style="color:var(--verde)">Ver la última cita →</span></div>
        </div>
      </div>
    </div>
    <figcaption>La ficha después de cancelar: la tira vuelve al 4 y «Qué toca ahora» pide agendar otra. La fila de la cita cancelada sigue ahí; al abrirla, su tarjeta dice «Esta cita está cancelada» y ofrece <b>Avisarle a la persona</b> y <b>Avisarle al profesional</b>. Mándalos: nadie más lo hace.</figcaption>
  </figure>
  <h3>No se presentó</h3>
  <p>Eso sí cuenta como sesión — la hora llegó y se gastó —, así que el caso avanza a seguimiento y desde ahí se agenda otra. Se marca desde la ficha de la cita.</p>
  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/portal/agenda/&lt;id de la cita&gt;</span>
      </div>
      <div class="lienzo">
        <div class="tarjeta">
          <div class="fuerte">Acciones y Gestión de la Cita</div>
          <div class="apagado" style="margin-bottom:10px">Gestiona el estado de la cita, registra requisitos legales o reprograma la sesión.</div>
          <div class="fila" style="margin-bottom:10px"><span class="btn">Ver Consentimiento</span><span class="btn">Ver Tarjeta Profesional</span><span class="btn">Reprogramar Cita</span></div>
          <div class="fila" style="padding-top:10px;border-top:1px solid var(--borde)"><span class="btn">Marcar como Realizada</span><span class="btn principal">Marcar que No Asistió</span><span class="btn peligro">Cancelar Cita</span></div>
        </div>
      </div>
    </div>
    <figcaption><b>«Marcar que No Asistió»</b> cierra la cita. Si el profesional ya lo reportó desde su enlace, la cita se marcó sola y este botón ya no hace falta. Después, en la ficha de la persona, «Qué toca ahora» pasa a pedir agendar otra sesión.</figcaption>
  </figure>
  <h3>Hay que cambiar de profesional</h3>
  <p>Botón <b>«Reasignar»</b> en la ficha. El enlace de agenda de la persona <b>no cambia</b>: el mismo enlace pasa a mostrar la agenda del nuevo. No hay que mandarle nada nuevo.</p>
  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/portal/personas/&lt;id de la persona&gt;</span>
      </div>
      <div class="lienzo">
        <div class="tarjeta" style="max-width:520px;margin:0 auto;border-left:4px solid var(--ambar)">
          <div class="fuerte" style="font-size:1rem">Reasignar a otro profesional</div>
          <div class="apagado" style="margin-bottom:12px">Sara Múnera · hoy con Mariana Restrepo Ortiz</div>
          <div style="font-size:0.78rem;font-weight:700">Elige el motivo de la reasignación.</div>
          <div class="campo" style="width:100%;margin:4px 0 6px;color:var(--tinta)">La persona solicitó cambio de profesional ▾</div>
          <div class="apagado" style="font-size:0.76rem;line-height:1.7;margin-bottom:10px">El profesional no respondió · El profesional tuvo un imprevisto / no puede continuar · Incompatibilidad de horarios / fechas · Otro motivo</div>
          <div style="font-size:0.78rem;font-weight:700">Detalle o nota adicional (opcional)</div>
          <div class="campo" style="width:100%;margin:4px 0 14px;min-height:40px">&nbsp;</div>
          <div class="fila"><span class="btn principal">Reasignar</span><span class="btn">Cancelar</span></div>
        </div>
      </div>
    </div>
    <figcaption>El cuadro de reasignar, con motivo de lista y nota opcional. Al confirmar, el caso vuelve a «Por Asignar» con el cupo del anterior liberado, eliges del Top 10 otra vez, y la persona abre <b>el mismo enlace de siempre</b> y ve la agenda del nuevo.</figcaption>
  </figure>
  <h3>Hay que mover la hora</h3>
  <p><b>«Reprogramar Cita»</b> en la ficha de la cita. El consentimiento firmado se conserva: no se le pide de nuevo.</p>
  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/portal/agenda/&lt;id de la cita&gt;</span>
      </div>
      <div class="lienzo">
        <div class="tarjeta">
          <div class="fuerte">Acciones y Gestión de la Cita</div>
          <div class="apagado" style="margin-bottom:10px">Gestiona el estado de la cita, registra requisitos legales o reprograma la sesión.</div>
          <div class="fila" style="margin-bottom:10px"><span class="btn">Ver Consentimiento</span><span class="btn">Ver Tarjeta Profesional</span><span class="btn principal">Reprogramar Cita</span></div>
          <div class="fila" style="padding-top:10px;border-top:1px solid var(--borde)"><span class="btn">Marcar como Realizada</span><span class="btn">Marcar que No Asistió</span><span class="btn peligro">Cancelar Cita</span></div>
        </div>
      </div>
    </div>
    <figcaption><b>«Reprogramar Cita»</b> abre el cuadro de la nueva fecha. La cita vieja no se borra: queda en el historial como <span class="chip gris">Reprogramada</span> apuntando a la nueva, y la nueva hereda la firma. A los dos les sale el correo de la cita nueva.</figcaption>
  </figure>
  <h3>Ella no dejó correo</h3>
  <p>No recibe nada automático — ni la confirmación ni el recordatorio. La ficha de la cita te lo dice y te pide el WhatsApp. Es su único aviso.</p>
  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/portal/agenda/&lt;id de la cita&gt;</span>
      </div>
      <div class="lienzo">
        <div class="tarjeta" style="border-left:4px solid var(--ambar)">
          <div class="titulillo">Qué toca con esta cita</div>
          <div class="fuerte" style="font-size:1rem">Ella no tiene correo: confírmasela tú</div>
          <div class="apagado" style="margin-bottom:10px">Al profesional le llegó su correo con la sala, y a ella no le llegó nada: no dejó correo al pedir ayuda, y darlo es opcional. Este WhatsApp es el único registro que va a tener de su cita hasta el día de la sesión.</div>
          <div style="font-size:0.82rem;font-weight:700;margin-bottom:4px">Confirmarle la sesión</div>
          <div class="fila"><span class="btn principal">Abrir WhatsApp</span><span class="btn">Copiar mensaje</span><span class="apagado" style="font-size:0.78rem">Ver el mensaje</span></div>
        </div>
      </div>
    </div>
    <figcaption>La tarjeta lo dice sin rodeos y con el borde ámbar. Dar correo es opcional al pedir ayuda, así que esto pasa seguido: no es un error, es una persona a la que hay que escribirle.</figcaption>
  </figure>
  <h3>El profesional no responde nada</h3>
  <p>No pasa nada: el caso avanza igual, porque no se le está pidiendo permiso. Lo que sí conviene revisar es que <b>su agenda esté al día</b> — de ahí escoge la persona. Se mira en su ficha.</p>
  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/portal/profesionales/&lt;id del profesional&gt;</span>
      </div>
      <div class="lienzo">
        <div class="tarjeta">
          <div class="fuerte">Mariana Restrepo Ortiz</div>
          <div class="apagado" style="margin-bottom:12px">Psicología · Pereira · Virtual · cupo 2/4 · <span class="chip verde">Tarjeta verificada</span></div>
          <div class="titulillo">Disponibilidad</div>
          <div class="apagado" style="line-height:1.8">Lunes · 2:00 a 6:00 p. m.<br>Miércoles · 8:00 a. m. a 12:00 m.<br>Viernes · 2:00 a 6:00 p. m.</div>
        </div>
        <div class="tarjeta" style="border-left:4px solid var(--rojo)">
          <div class="titulillo">Disponibilidad</div>
          <div style="color:var(--rojo);font-weight:700;font-size:0.9rem">Sin franjas cargadas. Sin ellas no se le puede agendar nada.</div>
        </div>
      </div>
    </div>
    <figcaption>Arriba, una ficha sana: la persona va a escoger entre esas franjas. Abajo, la que hay que atender: <b>sin franjas, su enlace no le enseña ninguna hora</b> y el caso se libera a los tres días sin que ella haya podido elegir. Él puede corregirlas desde su enlace; tú, desde aquí.</figcaption>
  </figure>
  <h3>Alguien lleva días sin que nadie lo mire</h3>
  <p>La lista de <span class="mono">Acompañadas</span> tiene la columna <b>«Qué toca ahora»</b> con lo más urgente de cada caso, y se puede ordenar por eso.</p>
  <figure class="pantalla">
    <div class="marco">
      <div class="barra">
        <span class="semaforo"><i style="background:#e0685f"></i><i style="background:#e5b04b"></i><i style="background:#68b96a"></i></span>
        <span class="url">redaquiestamos.org/portal/personas</span>
      </div>
      <div class="lienzo">
        <div class="tarjeta" style="padding:0;overflow:hidden">
          <div class="fila entre" style="padding:8px 14px;background:#f4f1ea;font-size:0.7rem;letter-spacing:0.06em;text-transform:uppercase;font-weight:800;color:var(--tinta-suave)">
            <span style="flex:1.6">Persona</span><span style="flex:1.2">Profesional</span><span style="flex:2">Qué toca ahora ▾</span>
          </div>
          <div class="fila entre" style="padding:10px 14px;border-top:1px solid var(--borde)">
            <span style="flex:1.6" class="fuerte">Julián Ospina</span><span style="flex:1.2" class="apagado">Camilo Betancur</span>
            <span style="flex:2"><span class="chip rojo">Preguntar cómo le fue</span> <span class="apagado" style="font-size:0.76rem">la sesión fue hace 3 días</span></span>
          </div>
          <div class="fila entre" style="padding:10px 14px;border-top:1px solid var(--borde)">
            <span style="flex:1.6" class="fuerte">Sara Múnera</span><span style="flex:1.2" class="apagado">Mariana Restrepo</span>
            <span style="flex:2"><span class="chip ambar">No ha elegido hora</span> <span class="apagado" style="font-size:0.76rem">el caso se libera mañana</span></span>
          </div>
          <div class="fila entre" style="padding:10px 14px;border-top:1px solid var(--borde)">
            <span style="flex:1.6" class="fuerte">Elena Cardona</span><span style="flex:1.2" class="apagado">—</span>
            <span style="flex:2"><span class="chip gris">Asignarle profesional</span> <span class="apagado" style="font-size:0.76rem">lleva 3 días</span></span>
          </div>
        </div>
      </div>
    </div>
    <figcaption>La lista ordenada por «Qué toca ahora»: lo rojo es para hoy, lo ámbar para pronto, lo gris cuando se pueda. Es la misma regla que enciende la tarjeta de cada ficha, así que la lista y la ficha nunca dicen cosas distintas. Empezar el día por aquí es la forma de que nadie se quede sin mirar.</figcaption>
  </figure>

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
  </figure>
</details>

<footer>
  Red Aquí Estamos · Manual operativo, primera entrega: verificaciones y agendamiento.<br>
  Las pantallas son reproducciones y las personas que aparecen son inventadas: este documento
  no contiene datos de nadie.
</footer>

</div>
<script>
  // Un capítulo plegado no se lee, ni en papel ni desde el índice.
  // Al saltar a un ancla se abre el capítulo que la contiene; al imprimir se
  // abren todos. Sin esto, el índice llevaría a una caja cerrada y la
  // impresión saldría con los títulos y nada más.
  (function () {
    var capitulos = Array.prototype.slice.call(document.querySelectorAll('details.capitulo'));
    var imprimiendo = false;
    var abiertosAntesDeImprimir = [];

    // Acordeón: cargan todos plegados y solo uno está abierto a la vez. Un
    // manual con cuatro capítulos largos desplegados es una pared; con uno
    // solo abierto, el índice y los títulos hacen de mapa.
    capitulos.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open || imprimiendo) return;
        capitulos.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });

    function abrirDestino() {
      var id = location.hash.replace('#', '');
      if (!id) return;
      var el = document.getElementById(id);
      if (!el) return;
      var det = el.closest('details');
      if (det) det.open = true;
      el.scrollIntoView({ block: 'start' });
    }
    window.addEventListener('hashchange', abrirDestino);
    window.addEventListener('load', abrirDestino);

    // Impreso, todo abierto —y al volver, como estaba—.
    window.addEventListener('beforeprint', function () {
      imprimiendo = true;
      abiertosAntesDeImprimir = capitulos.filter(function (d) { return d.open; });
      capitulos.forEach(function (d) { d.open = true; });
    });
    window.addEventListener('afterprint', function () {
      capitulos.forEach(function (d) { d.open = abiertosAntesDeImprimir.indexOf(d) >= 0; });
      imprimiendo = false;
    });
  })();
</script>
</body>
</html>`
