import { TextoRico } from '@/components/sitio/TextoRico'
import { CONSENTIMIENTO_SESION, LINEAS_EMERGENCIA, RESPONSABLE } from '@/lib/consentimiento'
import { rellenar, type Idioma } from '@/lib/i18n/idiomas'
import { diccionario } from '@/lib/i18n/diccionario'
import { AvisoDeTraduccion } from './comun'

/**
 * El consentimiento, leíble sin tener una cita delante.
 *
 * Vivía solo dentro del formulario de firma: para leerlo hacía falta un
 * enlace con token, y para tenerlo había que estar a punto de firmar. Quien
 * quería pensárselo antes, o enseñárselo a alguien, o volver a leerlo meses
 * después, no tenía dónde. Aquí está entero y con URL propia, como la
 * política de datos — y desde el momento de firmar se enlaza aquí.
 *
 * En español, los puntos son los de `lib/consentimiento.ts`: el mismo texto
 * que se firma, no una copia. En inglés y portugués son su traducción, y se
 * dice arriba: lo que la persona firma al agendar es el texto en español.
 */
export function ConsentimientoVista({ idioma }: { idioma: Idioma }) {
  const t = diccionario(idioma)
  const c = t.consentimiento
  const nombresDeLinea = c.lineas as Record<string, string>

  return (
    <section className="content section">
      <AvisoDeTraduccion
        aviso={t.avisos.traduccion}
        verOriginal={t.avisos.verOriginal}
        rutaSinPrefijo="/consentimiento-informado"
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
        {rellenar(c.version, { version: CONSENTIMIENTO_SESION.version })}
      </p>
      <h1>{c.titulo}</h1>
      <p className="text-muted" style={{ marginBottom: 32 }}>
        {c.intro}
      </p>

      {c.puntos.map((punto, i) => (
        <div key={punto.titulo}>
          <h2>
            {i + 1}. {punto.titulo}
          </h2>
          <p>{punto.texto}</p>
        </div>
      ))}

      <h2>{c.riesgoTitulo}</h2>
      <p>{c.riesgoTexto}</p>
      <ul>
        {LINEAS_EMERGENCIA.map((linea) => (
          <li key={linea.numero}>
            {/* El nombre sale del diccionario; el número, de donde vive. */}
            <strong>{nombresDeLinea[linea.numero] ?? linea.nombre}:</strong>{' '}
            <a href={linea.href}>{linea.numero}</a>
          </li>
        ))}
      </ul>
      {/* Las líneas son colombianas. Solo las traducciones lo aclaran. */}
      {t.avisos.fueraDeColombia ? <p className="text-muted">{t.avisos.fueraDeColombia}</p> : null}

      <h2>{c.dudasTitulo}</h2>
      <p>
        <TextoRico
          texto={rellenar(c.dudasTexto, {
            canal: RESPONSABLE.canal,
            canalHref: RESPONSABLE.canalHref,
          })}
          idioma={idioma}
        />
      </p>
    </section>
  )
}
