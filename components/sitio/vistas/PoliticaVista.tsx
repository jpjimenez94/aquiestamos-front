import { Callout } from '@/components/ui/Callout'
import { ButtonLink } from '@/components/ui/Button'
import { TextoRico } from '@/components/sitio/TextoRico'
import { RESPONSABLE, VERSION_CONSENTIMIENTO } from '@/lib/consentimiento'
import { rellenar, ruta, type Idioma } from '@/lib/i18n/idiomas'
import { diccionario } from '@/lib/i18n/diccionario'
import type { Bloque } from '@/lib/i18n/diccionarios/es'
import { AvisoDeTraduccion, Bloques } from './comun'

/**
 * La política de tratamiento de datos.
 *
 * Borrador de trabajo. Falta el NIT (en gestión), la dirección física y un
 * correo dedicado de habeas data; mientras tanto el canal es el WhatsApp de la
 * red, que es un medio válido para ejercer derechos.
 *
 * Este texto debe revisarse con asesoría jurídica antes de darlo por
 * definitivo — y eso vale el doble para las traducciones, que por eso se
 * anuncian como lo que son: una ayuda para entender el texto en español, que
 * es el que rige.
 */
export function PoliticaVista({ idioma }: { idioma: Idioma }) {
  const t = diccionario(idioma)
  const p = t.politica

  // Lo que el texto necesita y no es texto: quién responde, por dónde se le
  // escribe y cuánto se guardan los datos. Sale de `lib/consentimiento.ts`
  // para los tres idiomas, así que no puede decir una cosa en uno y otra en otro.
  const variables = {
    responsable: RESPONSABLE.nombre,
    canal: RESPONSABLE.canal,
    canalHref: RESPONSABLE.canalHref,
    anos: RESPONSABLE.retencionMeses / 12,
  }

  return (
    <section className="content section">
      <AvisoDeTraduccion
        aviso={t.avisos.traduccion}
        verOriginal={t.avisos.verOriginal}
        rutaSinPrefijo="/politica-de-datos"
      />

      <p
        className="text-muted"
        style={{
          fontSize: '0.82rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {rellenar(p.version, { version: VERSION_CONSENTIMIENTO })}
      </p>
      <h1>{p.titulo}</h1>
      <p className="text-muted" style={{ marginBottom: 32 }}>
        {p.intro}
      </p>

      {p.secciones.map((seccion) => (
        <div key={seccion.titulo}>
          <h2>{seccion.titulo}</h2>
          <Bloques
            bloques={seccion.bloques as readonly Bloque[]}
            idioma={idioma}
            variables={variables}
          />
        </div>
      ))}

      <Callout variant="tip" emoji="💡">
        <p style={{ margin: 0 }}>
          <TextoRico texto={p.pendiente} idioma={idioma} />
        </p>
      </Callout>

      <div className="button-row" style={{ marginTop: 32 }}>
        <ButtonLink href={ruta(idioma, '/')} variant="primary">
          {p.volver}
        </ButtonLink>
      </div>
    </section>
  )
}
