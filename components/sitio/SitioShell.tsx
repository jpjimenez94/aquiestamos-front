import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BotonFlotanteAcciones } from '@/components/sitio/BotonFlotanteAcciones'
import { SelectorIdioma } from '@/components/sitio/SelectorIdioma'
import { IdiomaDelDocumento } from '@/components/sitio/IdiomaDelDocumento'
import { SugerenciaIdioma } from '@/components/sitio/SugerenciaIdioma'
import { ETIQUETA, IDIOMA_BASE, rellenar, type Idioma } from '@/lib/i18n/idiomas'
import { diccionario } from '@/lib/i18n/diccionario'
import '@/app/idiomas.css'

/**
 * Envoltura del sitio público: la franja de idioma, la barra de navegación, el
 * pie y los botones flotantes — en el idioma que se le diga.
 *
 * La usan los dos layouts del sitio: el del español (`app/(sitio)`) y el de
 * los demás idiomas (`app/[lang]`). Que sea una sola es lo que garantiza que
 * la versión en inglés no se quede con el menú de hace tres meses.
 *
 * El `lang` del `<div>` no es decoración: es lo que le dice a un lector de
 * pantalla —y a cualquiera que lea el HTML sin ejecutar JavaScript— en qué
 * idioma está todo lo de dentro. El del `<html>` lo corrige
 * `IdiomaDelDocumento`, que explica por qué no puede venir bien de entrada.
 */
export function SitioShell({
  idioma,
  children,
}: {
  idioma: Idioma
  children: React.ReactNode
}) {
  const t = diccionario(idioma)

  return (
    <div className="page" lang={idioma === IDIOMA_BASE ? undefined : ETIQUETA[idioma]}>
      <IdiomaDelDocumento etiqueta={ETIQUETA[idioma]} />

      {/*
        El idioma, arriba del todo y fuera de la barra.

        Dentro de la barra no cabe: con el logo y las cuatro puertas ya va
        justa, y en inglés los nombres son más largos. Aquí tiene su renglón,
        se ve nada más llegar y no le quita sitio a «Necesito ayuda», que es lo
        que esa barra tiene que dejar encontrar.

        No es pegajosa a propósito: al bajar se va, y la barra de siempre se
        queda del mismo alto. En el teléfono el selector también está al pie
        del menú, que es lo que queda a mano después.
      */}
      <div className="franja-idioma">
        <div className="franja-idioma__dentro">
          <SelectorIdioma idioma={idioma} etiqueta={t.idioma.etiqueta} />
        </div>
      </div>

      <Navbar
        idioma={idioma}
        t={t.nav}
        nombre={t.sitio.nombre}
        irAlInicio={rellenar(t.sitio.irAlInicio, { nombre: t.sitio.nombre })}
        etiquetaIdioma={t.idioma.etiqueta}
      />

      <main className="page__main">{children}</main>

      <BotonFlotanteAcciones idioma={idioma} t={t.flotante} />
      <Footer idioma={idioma} />

      <SugerenciaIdioma
        actual={idioma}
        textos={{
          es: diccionario('es').idioma,
          en: diccionario('en').idioma,
          pt: diccionario('pt').idioma,
        }}
      />
    </div>
  )
}
