import Image from 'next/image'
import { Heart } from 'lucide-react'
import { TextoRico } from '@/components/sitio/TextoRico'
import { site } from '@/lib/site'
import type { Idioma } from '@/lib/i18n/idiomas'
import type { Diccionario } from '@/lib/i18n/diccionarios/es'
import '@/app/infografias.css'

/**
 * «Cuando una emergencia termina, muchas cosas apenas comienzan.»
 *
 * Esto era `contacto.png`: un cartel de 1024×1536 con TODO su contenido
 * dibujado dentro. En un teléfono se mostraba a unos 350 px de ancho, así que
 * el texto no se leía; no se podía seleccionar, copiar ni traducir; un lector
 * de pantalla solo oía una línea de `alt`; y Google no indexaba una palabra de
 * lo mejor escrito que tiene el sitio.
 *
 * El texto es el del cartel, literal, y ahora es texto: escala con la letra
 * del sistema, se busca, se traduce —por eso existe en tres idiomas sin tres
 * imágenes— y pesa una fracción de los dos megas que pesaba.
 *
 * Las ilustraciones son las del cartel, recortadas de él una por una
 * (`scripts/recortar-infografias.cjs`). Los números de los pasos van dentro de
 * cada viñeta, como en el original; quien no los ve los oye igual, porque los
 * pasos son una lista ordenada.
 */

const I = '/images/infografias'

export function InfografiaEmergencia({
  idioma,
  t,
}: {
  idioma: Idioma
  t: Diccionario['emergencia']
}) {
  return (
    <section className="cartel cartel--emergencia" aria-labelledby="cartel-emergencia-titulo">
      <div className="cartel__cabecera">
        <h2 className="cartel__titulo" id="cartel-emergencia-titulo">
          {t.tituloInicio} <em>{t.tituloFin}</em>
        </h2>
        <Image
          className="cartel__colina"
          src={`${I}/emergencia-colina.webp`}
          alt=""
          width={569}
          height={405}
          sizes="(max-width: 700px) 92vw, 480px"
        />
      </div>

      <ol className="camino">
        <li className="camino__paso">
          <div className="camino__dibujo">
            <Image src={`${I}/emergencia-1.webp`} alt="" width={229} height={202} />
          </div>
          <div className="camino__texto">
            <h3 className="camino__titulo">{t.familias.titulo}</h3>
            <p>{t.familias.texto}</p>
          </div>
        </li>

        <li className="camino__paso">
          <div className="camino__dibujo">
            <Image src={`${I}/emergencia-2.webp`} alt="" width={250} height={236} />
          </div>
          <div className="camino__texto">
            <h3 className="camino__titulo">{t.espacio.titulo}</h3>
            <p className="camino__antes">{t.espacio.porEso}</p>
            <p className="camino__lema">
              <TextoRico texto={t.espacio.red} idioma={idioma} />
            </p>
          </div>
        </li>

        <li className="camino__paso">
          <div className="camino__dibujo">
            <Image src={`${I}/emergencia-3.webp`} alt="" width={240} height={204} />
          </div>
          <div className="camino__texto">
            <p className="camino__parrafo">
              <TextoRico texto={t.temporal.texto} idioma={idioma} />
            </p>
            <p className="camino__nota">
              <Image src={`${I}/emergencia-calendario.webp`} alt="" width={78} height={78} />
              <span>
                <TextoRico texto={t.temporal.vigencia} idioma={idioma} />
              </span>
            </p>
          </div>
        </li>

        <li className="camino__paso">
          <div className="camino__dibujo camino__dibujo--icono">
            <Image src={`${I}/emergencia-4.webp`} alt="" width={133} height={185} />
          </div>
          <div className="camino__texto">
            <p className="camino__parrafo">{t.personas.texto}</p>
            <p className="camino__nota">
              <Image src={`${I}/emergencia-birrete.webp`} alt="" width={86} height={86} />
              <span>
                <TextoRico texto={t.personas.paraTi} idioma={idioma} />
              </span>
            </p>
          </div>
        </li>
      </ol>

      <div className="cartel__cierre">
        <Image
          className="cartel__faro"
          src={`${I}/emergencia-faro.webp`}
          alt=""
          width={368}
          height={376}
          sizes="(max-width: 700px) 46vw, 260px"
        />
        <div className="cartel__mancha">
          <Heart className="cartel__corazon" size={44} strokeWidth={1.6} aria-hidden />
          <div>
            <p className="cartel__frase">{t.cierre}</p>
            <a
              className="cartel__pastilla"
              href={site.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {site.instagramHandle}
            </a>
          </div>
        </div>
        <Image
          className="cartel__planta"
          src={`${I}/emergencia-planta.webp`}
          alt=""
          width={174}
          height={286}
        />
      </div>
    </section>
  )
}
