/**
 * Saca las ilustraciones de las dos infografías originales.
 *
 *   node scripts/recortar-infografias.cjs
 *
 * `contacto.png` y `ser-parte-body.png` eran dos carteles de 1024×1536 con
 * TODO su texto dibujado dentro. El texto vive ahora en el diccionario —y por
 * eso se puede traducir, leer en un teléfono y encontrar en Google—, pero el
 * dibujo es lo que les daba su carácter, y no hay más fuente que esas dos
 * imágenes. Este guion recorta de ellas cada ilustración suelta, sin letras.
 *
 * Los originales están en `scripts/fuentes/` y no en `public/`: ya no los
 * enseña ninguna página, y dejarlos servidos serían cuatro megas que nadie
 * pide. Aquí se guardan porque son el único original que existe.
 *
 * Dos cosas se le hacen a cada recorte:
 *
 * · Una MÁSCARA. Las viñetas son círculos sobre un fondo por el que pasa la
 *   línea morada que unía los pasos; recortadas en rectángulo, se llevarían
 *   trozos de esa línea —y de las letras de al lado—. La máscara deja el
 *   círculo, más el de su número, que monta encima.
 *
 * · Quitarle el PAPEL. Las piezas que no son redondas (la colina, el faro, las
 *   ramas) venían sobre el crema del cartel. Dejarlo opaco obliga a que la
 *   página tenga exactamente ese crema, y con un tono de diferencia se ve el
 *   rectángulo. Así que el crema se vuelve transparencia: cuanto más se parece
 *   un píxel al papel, más transparente queda.
 *
 * Las coordenadas se midieron sobre la imagen con una rejilla. Si alguien
 * cambia un recorte, que abra el resultado y lo mire sobre un fondo chillón:
 * un píxel de más aquí es media letra asomando por el borde.
 */
const fs = require('node:fs')
const path = require('node:path')
const sharp = require('sharp')

const FUENTES = path.join(__dirname, 'fuentes')
const SALIDA = path.join(__dirname, '..', 'public', 'images', 'infografias')

const A = path.join(FUENTES, 'contacto.png')
const B = path.join(FUENTES, 'ser-parte-body.png')

const svg = (ancho, alto, dentro) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}">${dentro}</svg>`,
  )

/** Lo blanco se queda, lo negro se va. */
function mascara(ancho, alto, figuras, { desenfoque = 0 } = {}) {
  const filtro = desenfoque
    ? `<defs><filter id="f" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${desenfoque}"/></filter></defs>`
    : ''
  return svg(
    ancho,
    alto,
    `${filtro}<rect width="100%" height="100%" fill="black"/>` +
      `<g ${desenfoque ? 'filter="url(#f)"' : ''}>${figuras}</g>`,
  )
}

const circulo = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="white"/>`
const todo = `<rect width="100%" height="100%" fill="white"/>`
const fuera = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="black"/>`

/** El color del papel: el que más se repite en el recorte. */
function colorDelPapel(data, canales) {
  const cuenta = new Map()
  for (let i = 0; i < data.length; i += canales) {
    // Se agrupa de dos en dos niveles: el papel tiene grano.
    const clave = ((data[i] >> 1) << 16) | ((data[i + 1] >> 1) << 8) | (data[i + 2] >> 1)
    cuenta.set(clave, (cuenta.get(clave) ?? 0) + 1)
  }
  let mejor = 0
  let veces = 0
  for (const [clave, n] of cuenta) if (n > veces) [mejor, veces] = [clave, n]
  return [((mejor >> 16) & 0xff) << 1, ((mejor >> 8) & 0xff) << 1, (mejor & 0xff) << 1]
}

/**
 * Vuelve transparente el papel.
 *
 * La transparencia de cada píxel es cuánto se aleja del papel hacia lo oscuro,
 * y su color se recalcula para que, puesto otra vez sobre ese papel, dé
 * exactamente el píxel original. Lo que es MÁS claro que el papel —su grano—
 * se da por papel: si contara, un fondo casi blanco convertiría cada mota en
 * un punto opaco.
 */
function quitarPapel(data, papel) {
  const UMBRAL = 0.03 // por debajo de esto es grano del papel, no dibujo
  for (let i = 0; i < data.length; i += 4) {
    let a = 0
    for (let c = 0; c < 3; c++) {
      if (data[i + c] < papel[c]) a = Math.max(a, (papel[c] - data[i + c]) / papel[c])
    }
    a = a <= UMBRAL ? 0 : (a - UMBRAL) / (1 - UMBRAL)
    if (a === 0) {
      data[i + 3] = 0
      continue
    }
    for (let c = 0; c < 3; c++) {
      const v = papel[c] + (data[i + c] - papel[c]) / a
      data[i + c] = Math.max(0, Math.min(255, Math.round(v)))
    }
    data[i + 3] = Math.round((data[i + 3] / 255) * a * 255)
  }
}

async function recortar(nombre, fuente, zona, { mascara: svgMascara, sinPapel = false } = {}) {
  const { data, info } = await sharp(fuente)
    .extract(zona)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  if (sinPapel) quitarPapel(data, colorDelPapel(data, 4))

  if (svgMascara) {
    const alfa = await sharp(svgMascara).greyscale().raw().toBuffer()
    for (let i = 0; i < info.width * info.height; i++) {
      data[i * 4 + 3] = Math.round((data[i * 4 + 3] * alfa[i]) / 255)
    }
  }

  const destino = path.join(SALIDA, `${nombre}.webp`)
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: 92, alphaQuality: 100, effort: 6 })
    .toFile(destino)
  const kb = (fs.statSync(destino).size / 1024).toFixed(0)
  console.log(`${nombre.padEnd(24)} ${zona.width}x${zona.height}  ${kb} KB`)
}

/** Una viñeta redonda con su número encima: la unión de los dos círculos. */
function vineta(zona, [vx, vy, vr], insignia) {
  const figuras = [circulo(vx - zona.left, vy - zona.top, vr)]
  if (insignia) {
    const [ix, iy, ir] = insignia
    figuras.push(circulo(ix - zona.left, iy - zona.top, ir))
  }
  return mascara(zona.width, zona.height, figuras.join(''), { desenfoque: 0.6 })
}

async function main() {
  fs.mkdirSync(SALIDA, { recursive: true })

  // ------------- «Cuando una emergencia termina…» (contacto.png) -------------

  // La colina con las cinco personas, el sol y las nubes. Por la izquierda se
  // metían las últimas letras del título («…mina,» y «…zan.»): esa esquina se
  // quita. La figura de más a la izquierda empieza en x≈560, así que el corte
  // se queda justo antes.
  {
    const zona = { left: 455, top: 30, width: 569, height: 405 }
    await recortar('emergencia-colina', A, zona, {
      sinPapel: true,
      mascara: mascara(
        zona.width,
        zona.height,
        todo + fuera(-20, -20, 118, 352) + fuera(90, 122, 42, 68),
        { desenfoque: 5 },
      ),
    })
  }

  // Las cuatro viñetas. El radio de cada máscara va un par de píxeles por
  // dentro del círculo dibujado: justo por fuera pasaba la línea morada, y con
  // el radio exacto se quedaba una rayita pegada al borde.
  {
    const zona = { left: 64, top: 385, width: 229, height: 202 }
    await recortar('emergencia-1', A, zona, {
      mascara: vineta(zona, [165, 486, 93], [255, 448, 32]),
    })
  }
  {
    const zona = { left: 678, top: 587, width: 250, height: 236 }
    await recortar('emergencia-2', A, zona, {
      mascara: vineta(zona, [810, 705, 109], [716, 648, 32]),
    })
  }
  {
    const zona = { left: 49, top: 858, width: 240, height: 204 }
    await recortar('emergencia-3', A, zona, {
      mascara: vineta(zona, [151, 960, 95], [251, 928, 32]),
    })
  }
  {
    const zona = { left: 572, top: 1052, width: 133, height: 185 }
    await recortar('emergencia-4', A, zona, {
      mascara: vineta(zona, [638, 1171, 60], [668, 1089, 31]),
    })
  }
  {
    const zona = { left: 306, top: 1071, width: 78, height: 78 }
    await recortar('emergencia-calendario', A, zona, { mascara: vineta(zona, [345, 1110, 36]) })
  }
  {
    const zona = { left: 617, top: 1234, width: 86, height: 86 }
    await recortar('emergencia-birrete', A, zona, { mascara: vineta(zona, [660, 1277, 40]) })
  }

  // El faro sobre su colina. A la derecha se funde: arriba porque el haz de
  // luz seguía más allá del corte, abajo porque la colina se metía bajo la
  // mancha azul del cierre —que en la página va encima, hecha con CSS—. En
  // medio queda la esquina por donde pasaba la línea morada.
  {
    const zona = { left: 0, top: 1160, width: 368, height: 376 }
    await recortar('emergencia-faro', A, zona, {
      sinPapel: true,
      mascara: svg(
        zona.width,
        zona.height,
        `<defs>` +
          `<linearGradient id="haz" x1="0" x2="1" y1="0" y2="0">` +
          `<stop offset="0.80" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient>` +
          `<linearGradient id="colina" x1="0" x2="1" y1="0" y2="0">` +
          `<stop offset="0.84" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient>` +
          `<filter id="f"><feGaussianBlur stdDeviation="3"/></filter>` +
          `</defs>` +
          `<rect width="100%" height="100%" fill="black"/>` +
          `<g filter="url(#f)">` +
          `<rect x="0" y="0" width="${zona.width}" height="118" fill="url(#haz)"/>` +
          `<rect x="0" y="118" width="350" height="146" fill="white"/>` +
          `<rect x="0" y="264" width="${zona.width}" height="${zona.height - 264}" fill="url(#colina)"/>` +
          `</g>`,
      ),
    })
  }

  // La planta verde del cierre, con su loma lila. Por la izquierda le montaba
  // la mancha azul —se funde— y por arriba asomaban dos finales de renglón
  // («…ogía,» y «…én»), que se quitan.
  {
    const zona = { left: 850, top: 1250, width: 174, height: 286 }
    await recortar('emergencia-planta', A, zona, {
      sinPapel: true,
      mascara: svg(
        zona.width,
        zona.height,
        `<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="0">` +
          `<stop offset="0.12" stop-color="black"/><stop offset="0.42" stop-color="white"/></linearGradient>` +
          `<filter id="f"><feGaussianBlur stdDeviation="3"/></filter></defs>` +
          `<rect width="100%" height="100%" fill="url(#g)"/>` +
          `<g filter="url(#f)">${fuera(-10, -10, 84, 62)}</g>`,
      ),
    })
  }

  // ------------- «¿Cómo puedes hacer parte?» (ser-parte-body.png) -------------

  // El logo con su rama, tal como abre el cartel.
  await recortar('camino-logo', B, { left: 48, top: 88, width: 400, height: 190 }, { sinPapel: true })
  // La rama de la esquina superior derecha.
  await recortar('camino-rama', B, { left: 890, top: 95, width: 122, height: 222 }, { sinPapel: true })
  // Las manos que sostienen la planta. El círculo melocotón está centrado en
  // (167,5 · 1092,5) y mide 100 de radio —medido sobre el cartel, no a ojo—.
  // La máscara va un píxel por dentro: con el centro más abajo se colaba, bajo
  // el círculo, una media luna del papel de la tarjeta.
  {
    const zona = { left: 64, top: 989, width: 208, height: 208 }
    await recortar('camino-manos', B, zona, { mascara: vineta(zona, [167.5, 1092.5, 99]) })
  }
  // El abrazo del cierre. La cabeza de la figura naranja empieza en y≈1247 y
  // la tarjeta que lo contiene acaba en y≈1434: el recorte va entre medias,
  // porque más abajo ya asoma el corazón del pie del cartel.
  await recortar('camino-abrazo', B, { left: 742, top: 1238, width: 232, height: 190 }, { sinPapel: true })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
