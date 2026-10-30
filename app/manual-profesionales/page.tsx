import type { Metadata } from 'next'
import Image from 'next/image'
import { TextoRico } from '@/components/sitio/TextoRico'
import { MANUAL, type BloqueDelManual, type SeccionDelManual } from '@/lib/manualProfesionales'
import './manual.css'

/**
 * El manual operativo de los profesionales, en web.
 *
 * No cuelga del sitio público —no va en el menú, no lleva la barra ni el pie,
 * no lo indexan los buscadores— porque es un documento de uso interno. Tampoco
 * pide usuario: casi ningún profesional tiene cuenta en el portal, y el
 * manual les llega por el correo de bienvenida y por WhatsApp. Quien tiene el
 * enlace lo lee; no contiene datos de nadie.
 *
 * El texto vive en `lib/manualProfesionales.ts`.
 */
export const metadata: Metadata = {
  // Absoluto: sin la plantilla «… | Aquí Estamos» de la raíz, que repetiría la marca.
  title: { absolute: 'Manual operativo para profesionales · Red Aquí Estamos' },
  description: 'Orientaciones para los profesionales de salud mental de la Red Aquí Estamos.',
  robots: { index: false, follow: false },
}

function Bloques({ bloques }: { bloques: readonly BloqueDelManual[] }) {
  return (
    <>
      {bloques.map((bloque, i) => {
        if (typeof bloque === 'string') {
          return (
            <p key={i}>
              <TextoRico texto={bloque} idioma="es" claseEnlace="manual__enlace" nuevaPestana />
            </p>
          )
        }
        if ('lista' in bloque) {
          return (
            <ul className="manual__lista" key={i}>
              {bloque.lista.map((linea) => (
                <li key={linea}>
                  <TextoRico texto={linea} idioma="es" claseEnlace="manual__enlace" nuevaPestana />
                </li>
              ))}
            </ul>
          )
        }
        if ('pasos' in bloque) {
          return (
            <ol className="manual__pasos" key={i}>
              {bloque.pasos.map((paso) => (
                <li key={paso.titulo}>
                  <strong>{paso.titulo}</strong>
                  <span>
                    <TextoRico texto={paso.texto} idioma="es" claseEnlace="manual__enlace" nuevaPestana />
                  </span>
                </li>
              ))}
            </ol>
          )
        }
        if ('subtitulo' in bloque) {
          return (
            <h3 className="manual__subtitulo" key={i}>
              {bloque.subtitulo}
            </h3>
          )
        }
        return (
          <p className="manual__destacado" key={i}>
            <TextoRico texto={bloque.destacado} idioma="es" claseEnlace="manual__enlace" nuevaPestana />
          </p>
        )
      })}
    </>
  )
}

function Seccion({ seccion }: { seccion: SeccionDelManual }) {
  return (
    <section className="manual__seccion" id={seccion.id} aria-labelledby={`${seccion.id}-titulo`}>
      <h2 id={`${seccion.id}-titulo`}>
        {seccion.numero ? <span className="manual__numero">{seccion.numero}</span> : null}
        <span>{seccion.titulo}</span>
      </h2>
      <Bloques bloques={seccion.bloques} />
    </section>
  )
}

function Indice({ secciones }: { secciones: readonly SeccionDelManual[] }) {
  return (
    <ol className="manual__indice-lista">
      {secciones.map((s) => (
        <li key={s.id}>
          <a href={`#${s.id}`}>
            {s.numero ? <span className="manual__indice-numero">{s.numero}.</span> : null}
            {s.titulo}
          </a>
        </li>
      ))}
    </ol>
  )
}

export default function ManualProfesionalesPage() {
  const todas: readonly SeccionDelManual[] = [...MANUAL.presentacion, ...MANUAL.secciones, MANUAL.cierre]

  return (
    <div className="manual">
      <header className="manual__cabecera">
        <div className="manual__cabecera-dentro">
          <Image src="/images/logo.png" alt="Aquí Estamos" width={143} height={55} priority />
          <p className="manual__institucion">{MANUAL.institucion}</p>
          <h1>{MANUAL.titulo}</h1>
          <p className="manual__lema">{MANUAL.lema}</p>
          <p className="manual__uso">{MANUAL.uso}</p>
        </div>
      </header>

      <div className="manual__cuerpo">
        {/* En pantalla ancha, el índice acompaña al lado; en el teléfono, se despliega arriba. */}
        <nav className="manual__indice" aria-label="Índice del manual">
          <p className="manual__indice-titulo">Índice</p>
          <Indice secciones={todas} />
        </nav>

        <main className="manual__contenido">
          <details className="manual__indice-movil">
            <summary>Índice del manual</summary>
            <Indice secciones={todas} />
          </details>

          {MANUAL.presentacion.map((s) => (
            <Seccion key={s.id} seccion={s} />
          ))}

          {MANUAL.secciones.map((s) => (
            <Seccion key={s.id} seccion={s} />
          ))}

          <aside className="manual__nota">
            <strong>Documentos complementarios.</strong>{' '}
            <TextoRico texto={MANUAL.documentosComplementarios} idioma="es" claseEnlace="manual__enlace" />
          </aside>

          <Seccion seccion={MANUAL.cierre} />

          <footer className="manual__pie">
            <p>
              <strong>Fundación Aquí Estamos</strong> · Organización sin ánimo de lucro (ESAL) — 100 % gratuito
            </p>
            <p>redaquiestamos.org · @aquiestamos.red</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
