import { Compass, HandHeart, Heart, ShieldCheck, Sunrise, type LucideIcon } from 'lucide-react'
import type { Diccionario } from '@/lib/i18n/diccionarios/es'
import '@/app/mision-vision-compromiso.css'

/**
 * Misión, visión y compromiso: para qué existe la red y cómo trabaja.
 *
 * Va en la portada, debajo de «Sobre Aquí Estamos», que dice en una frase qué
 * hace la red. Esto dice el resto.
 *
 * La visión y el compromiso vienen del diccionario (`inicio.vision`,
 * `inicio.compromiso`, `inicio.pilares`), copiados del manual operativo. La
 * misión llega aparte porque es una sola en todo el sitio: la de
 * `camino.mision`, la misma frase del cartel de «Quiero ser parte». Si un día
 * cambia, cambia en los dos sitios a la vez.
 */

const ICONOS_PILAR: LucideIcon[] = [Heart, ShieldCheck]

export function MisionVisionCompromiso({
  t,
  mision,
}: {
  t: Diccionario['inicio']
  mision: { titulo: string; texto: string }
}) {
  return (
    <div className="identidad">
      <div className="identidad__mision" id="mision">
        <h3 className="identidad__rotulo">
          <Compass size={26} strokeWidth={1.6} aria-hidden />
          {mision.titulo}
        </h3>
        <p className="identidad__lema">{mision.texto}</p>
      </div>

      <div className="identidad__par">
        <div className="identidad__tarjeta" id="vision">
          <h3 className="identidad__rotulo">
            <Sunrise size={26} strokeWidth={1.6} aria-hidden />
            {t.visionTitulo}
          </h3>
          {t.vision.map((parrafo) => (
            <p key={parrafo}>{parrafo}</p>
          ))}
        </div>

        <div className="identidad__tarjeta" id="compromiso">
          <h3 className="identidad__rotulo">
            <HandHeart size={26} strokeWidth={1.6} aria-hidden />
            {t.compromisoTitulo}
          </h3>
          {t.compromiso.map((parrafo) => (
            <p key={parrafo}>{parrafo}</p>
          ))}

          <ul className="identidad__pilares">
            {t.pilares.map((pilar, i) => {
              const Icono = ICONOS_PILAR[i] ?? Heart
              return (
                <li key={pilar.titulo}>
                  <Icono size={22} strokeWidth={1.8} aria-hidden />
                  <div>
                    <h4>{pilar.titulo}</h4>
                    <p>{pilar.texto}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/*
        El final del compromiso va fuera de su tarjeta, debajo de las dos: es
        el cierre de toda la sección, y dentro dejaba la tarjeta de la visión
        con medio espacio en blanco al lado.
      */}
      <div className="identidad__cierre">
        {t.compromisoCierre.map((parrafo) => (
          <p key={parrafo}>{parrafo}</p>
        ))}
      </div>
    </div>
  )
}
