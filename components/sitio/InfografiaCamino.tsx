import Image from 'next/image'
import {
  BookOpen,
  ClipboardCheck,
  HandHeart,
  Heart,
  Instagram,
  MailCheck,
  Megaphone,
  MessageCircle,
  Sparkle,
  UserSearch,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { site, whatsappHref } from '@/lib/site'
import type { Diccionario } from '@/lib/i18n/diccionarios/es'
import '@/app/infografias.css'

/**
 * «¿Cómo puedes hacer parte de Aquí Estamos?»
 *
 * Esto era `ser-parte-body.png`, el otro cartel con todo el texto dibujado
 * dentro —y con los mismos problemas: ilegible en un teléfono, invisible para
 * un lector de pantalla y para Google, imposible de traducir—.
 *
 * Dos cosas cambian respecto a la imagen, y las dos eran errores de la imagen:
 *
 * · Llevaba dibujado un número de WhatsApp que ya no es el de la red. Aquí
 *   sale de `lib/site.ts`, como en el resto del sitio: el día que cambie,
 *   cambia en un solo sitio y no hay cartel que rehacer.
 *
 * · Decía «escríbenos y te compartimos el formulario» estando el formulario en
 *   esta misma página. Ahora lleva a él.
 *
 * Los iconos de los pasos son de línea, como los del cartel. Las tres
 * ilustraciones —el logo con su rama, las manos y el abrazo— son las suyas,
 * recortadas (`scripts/recortar-infografias.cjs`).
 */

const I = '/images/infografias'

const ICONOS_PASO: LucideIcon[] = [ClipboardCheck, UserSearch, MailCheck, UsersRound, HandHeart]
const ICONOS_BENEFICIO: LucideIcon[] = [Users, BookOpen, Megaphone, Heart]

export function InfografiaCamino({
  t,
  whatsapp,
  formulario = '#formulario',
}: {
  t: Diccionario['camino']
  /** El número como hay que enseñarlo en este idioma (con o sin indicativo). */
  whatsapp: string
  /** A dónde lleva «Ir al formulario». */
  formulario?: string
}) {
  return (
    <section className="cartel cartel--camino" aria-labelledby="cartel-camino-titulo">
      <header className="cartel-camino__cabecera">
        <Image
          className="cartel-camino__logo"
          src={`${I}/camino-logo.webp`}
          alt={site.name}
          width={400}
          height={190}
        />
        <div className="cartel-camino__presentacion">
          <h2 className="cartel__titulo" id="cartel-camino-titulo">
            {t.titulo}
          </h2>
          <p>{t.bajada}</p>
        </div>
        <Image
          className="cartel-camino__rama"
          src={`${I}/camino-rama.webp`}
          alt=""
          width={122}
          height={222}
        />
      </header>

      <div className="cartel-camino__mision">
        <span className="cartel-camino__mision-icono" aria-hidden>
          <Heart size={30} strokeWidth={1.6} />
        </span>
        <div>
          <h3>{t.misionTitulo}</h3>
          <p>{t.mision}</p>
        </div>
      </div>

      <h3 className="cartel-camino__rotulo">{t.pasosTitulo}</h3>

      <ol className="cartel-camino__pasos">
        {t.pasos.map((paso, i) => {
          const Icono = ICONOS_PASO[i] ?? ClipboardCheck
          return (
            <li className="cartel-camino__paso" key={paso.titulo}>
              <span className="cartel-camino__numero" aria-hidden>
                {i + 1}
              </span>
              <div className="cartel-camino__tarjeta">
                <Icono className="cartel-camino__icono" size={46} strokeWidth={1.3} aria-hidden />
                <h4>{paso.titulo}</h4>
                <p>{paso.texto}</p>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="cartel-camino__beneficios">
        <Image
          className="cartel-camino__manos"
          src={`${I}/camino-manos.webp`}
          alt=""
          width={208}
          height={208}
        />
        <div>
          <h3>{t.beneficiosTitulo}</h3>
          <ul>
            {t.beneficios.map((beneficio, i) => {
              const Icono = ICONOS_BENEFICIO[i] ?? Heart
              return (
                <li key={beneficio}>
                  <Icono size={34} strokeWidth={1.4} aria-hidden />
                  <span>{beneficio}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="cartel-camino__llamada">
        <div className="cartel-camino__lista">
          <Sparkle className="cartel-camino__destello" size={20} aria-hidden />
          <h3>{t.listaTitulo}</h3>
          <p>{t.listaTexto}</p>
          <a className="button button--primary" href={formulario}>
            <span>{t.irAlFormulario}</span>
          </a>
        </div>

        <div className="cartel-camino__contactos">
          <a
            className="cartel-camino__contacto"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="cartel-camino__contacto-icono" aria-hidden>
              <MessageCircle size={26} strokeWidth={1.8} />
            </span>
            <span>
              <span className="cartel-camino__contacto-rotulo">{t.whatsapp}</span>
              <strong>{whatsapp}</strong>
            </span>
          </a>
          <a
            className="cartel-camino__contacto"
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="cartel-camino__contacto-icono" aria-hidden>
              <Instagram size={26} strokeWidth={1.8} />
            </span>
            <span>
              <span className="cartel-camino__contacto-rotulo">{t.instagram}</span>
              <strong>{site.instagramHandle}</strong>
            </span>
          </a>
        </div>

        <div className="cartel-camino__abrazo">
          <Image src={`${I}/camino-abrazo.webp`} alt="" width={232} height={190} />
        </div>
      </div>

      <p className="cartel-camino__cierre">
        <Sparkle size={20} aria-hidden />
        <span>{t.cierre}</span>
        <Heart size={30} strokeWidth={1.6} aria-hidden />
      </p>
    </section>
  )
}
