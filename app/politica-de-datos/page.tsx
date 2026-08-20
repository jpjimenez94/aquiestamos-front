import type { Metadata } from 'next'
import { Callout } from '@/components/ui/Callout'
import { ButtonLink } from '@/components/ui/Button'
import { RESPONSABLE, VERSION_CONSENTIMIENTO } from '@/lib/consentimiento'

export const metadata: Metadata = {
  title: 'Política de Tratamiento de Datos',
  description:
    'Cómo Red Aquí Estamos recoge, usa, guarda y elimina los datos personales de quienes solicitan acompañamiento y de los profesionales voluntarios.',
}

/**
 * Borrador de trabajo. Falta el NIT (en gestión), la dirección física y un
 * correo dedicado de habeas data; mientras tanto el canal es el WhatsApp de la
 * red, que es un medio válido para ejercer derechos.
 *
 * Este texto debe revisarse con asesoría jurídica antes de darlo por definitivo.
 */
export default function PoliticaDeDatosPage() {
  return (
    <section className="content section">
      <p className="text-muted" style={{ fontSize: '0.82rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
        Versión {VERSION_CONSENTIMIENTO}
      </p>
      <h1>Política de Tratamiento de Datos</h1>
      <p className="text-muted" style={{ marginBottom: 32 }}>
        Esta política explica qué datos recogemos, para qué los usamos, con quién los
        compartimos, cuánto tiempo los guardamos y cómo puedes pedirnos que los
        cambiemos o los borremos.
      </p>

      <h2>1. Quién responde por tus datos</h2>
      <p>
        <strong>{RESPONSABLE.nombre}</strong> es responsable del tratamiento de los datos
        personales que recogemos a través de este sitio.
      </p>
      <p>
        Puedes contactarnos por{' '}
        <a href={RESPONSABLE.canalHref} target="_blank" rel="noopener noreferrer">
          {RESPONSABLE.canal}
        </a>
        {'. '}
        Ese es también el canal para ejercer cualquiera de los derechos que se describen
        más abajo.
      </p>

      <h2>2. Qué datos recogemos</h2>
      <p>
        <strong>Si solicitas acompañamiento:</strong> tu nombre, tu celular, tu correo si
        decides dárnoslo, la ciudad desde donde nos escribes, los días y las franjas en
        que puedes, si prefieres presencial o virtual, y lo que quieras contarnos en el
        campo libre. Si la solicitud es para otra persona, también su nombre, tu relación
        con ella y si es menor de edad.
      </p>
      <p>
        <strong>Si te postulas como profesional:</strong> tu nombre, tu celular, tu
        correo, tu ciudad, tu profesión y formación, tus años de experiencia, tu tarjeta
        profesional, las poblaciones con las que trabajas, tu disponibilidad y, si puedes
        acompañar de forma presencial, tu estado de vacunación contra la fiebre amarilla.
      </p>

      <Callout icon="arrow-right-red">
        <p style={{ margin: 0 }}>
          <strong>Datos sensibles.</strong> El hecho de solicitar acompañamiento
          psicológico y el estado de vacunación son datos de salud, que la ley considera
          sensibles. No estás obligado ni obligada a entregarlos. Solo los tratamos si nos
          das una autorización expresa y separada, marcando la casilla correspondiente en
          el formulario.
        </p>
      </Callout>

      <h2>3. Para qué los usamos</h2>
      <ul className="plain">
        <li>Contactarte y coordinar tu acompañamiento, o evaluar tu postulación.</li>
        <li>Asignar un profesional y agendar las sesiones.</li>
        <li>Llevar el registro interno de la red y sus estadísticas de operación.</li>
        <li>Enviarte información sobre otras actividades, solo si lo autorizaste aparte.</li>
      </ul>
      <p>
        No usamos tus datos para ninguna otra finalidad, y no tomamos decisiones
        automatizadas sobre ti.
      </p>

      <h2>4. Con quién los compartimos</h2>
      <p>
        Con el profesional de la red que te acompañe y con el equipo de coordinación, y
        solo en la medida necesaria para prestar el servicio.{' '}
        <strong>No vendemos tus datos ni los entregamos a terceros</strong> ajenos a la
        red, salvo que una autoridad competente nos lo exija por ley.
      </p>
      <p>
        La información se guarda en servidores de nuestros proveedores de infraestructura
        tecnológica, que la procesan únicamente por nuestra instrucción.
      </p>

      <h2>5. Cuánto tiempo los guardamos</h2>
      <p>
        Conservamos tus datos durante{' '}
        <strong>{RESPONSABLE.retencionMeses / 12} años</strong> contados desde el cierre
        de tu acompañamiento o desde el fin de tu participación en la red. Cumplido ese
        plazo, se eliminan.
      </p>

      <h2>6. Tus derechos</h2>
      <p>En cualquier momento puedes pedirnos:</p>
      <ul className="plain">
        <li>Conocer qué datos tuyos tenemos y cómo los estamos usando.</li>
        <li>Actualizarlos o corregirlos si están mal o incompletos.</li>
        <li>Eliminarlos, cuando no exista un deber legal de conservarlos.</li>
        <li>Retirar la autorización que nos diste, en cualquier momento.</li>
        <li>Presentar una queja ante la Superintendencia de Industria y Comercio.</li>
      </ul>
      <p>
        Para ejercer cualquiera de estos derechos escríbenos por{' '}
        <a href={RESPONSABLE.canalHref} target="_blank" rel="noopener noreferrer">
          {RESPONSABLE.canal}
        </a>
        . Responderemos en los plazos que establece la ley: hasta diez días hábiles para
        una consulta y hasta quince días hábiles para un reclamo.
      </p>
      <p>
        Retirar la autorización significa que no podremos seguir prestándote el
        acompañamiento, porque los datos son necesarios para coordinarlo.
      </p>

      <h2>7. Niñas, niños y adolescentes</h2>
      <p>
        Cuando el acompañamiento es para una persona menor de 18 años, la autorización la
        debe dar su padre, su madre o su representante legal, y siempre se atiende al
        interés superior de la niña, el niño o el adolescente.
      </p>

      <h2>8. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas razonables para proteger tus datos:
        el acceso al sistema interno es nominal y con contraseña, cada consulta a datos
        de salud queda registrada, y la información viaja cifrada.
      </p>

      <h2>9. Cambios en esta política</h2>
      <p>
        Si cambiamos este texto, publicamos una versión nueva con su fecha. Las
        autorizaciones que ya nos diste quedan asociadas a la versión que aceptaste en su
        momento, y se conserva el registro de cuál fue.
      </p>

      <Callout variant="tip" emoji="💡">
        <p style={{ margin: 0 }}>
          <strong>Información pendiente.</strong> El NIT de la organización está en
          trámite y todavía no hay una sede física ni un correo exclusivo para solicitudes
          de datos. En cuanto existan, se incorporan aquí y se publica una versión nueva.
        </p>
      </Callout>

      <div className="button-row" style={{ marginTop: 32 }}>
        <ButtonLink href="/" variant="primary">
          Volver al inicio
        </ButtonLink>
      </div>
    </section>
  )
}
