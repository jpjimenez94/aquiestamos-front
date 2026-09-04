import type { Metadata } from 'next'
import Link from 'next/link'
import { CONSENTIMIENTO_SESION, RESPONSABLE, LINEAS_EMERGENCIA } from '@/lib/consentimiento'

export const metadata: Metadata = {
  title: 'Consentimiento informado',
  description:
    'Qué aceptas cuando agendas una sesión con la Red Aquí Estamos: en qué consiste el acompañamiento, hasta dónde llega la confidencialidad y qué hacemos con tus datos.',
}

/**
 * El consentimiento, leíble sin tener una cita delante.
 *
 * Vivía solo dentro del formulario de firma: para leerlo hacía falta un
 * enlace con token, y para tenerlo había que estar a punto de firmar. Quien
 * quería pensárselo antes, o enseñárselo a alguien, o volver a leerlo meses
 * después, no tenía dónde. Aquí está entero y con URL propia, como la
 * política de datos — y desde el momento de firmar se enlaza aquí.
 *
 * El texto sale de `lib/consentimiento.ts`, el mismo que se firma. Copiarlo
 * aquí sería publicar una versión que puede dejar de coincidir con la que la
 * gente acepta, que es la peor forma posible de tener este texto.
 */
export default function ConsentimientoInformadoPage() {
  return (
    <section className="content section">
      <p
        className="text-muted"
        style={{
          fontSize: '0.82rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        Versión {CONSENTIMIENTO_SESION.version}
      </p>
      <h1>Consentimiento informado</h1>
      <p className="text-muted" style={{ marginBottom: 32 }}>
        Esto es lo que aceptas cuando agendas una sesión con la red. Lo verás otra vez al
        elegir tu hora, y ahí lo firmas escribiendo tu nombre. Si algo no te queda claro,
        pregúntanos antes: preferimos explicarlo.
      </p>

      {CONSENTIMIENTO_SESION.puntos.map((punto, i) => (
        <div key={punto.titulo}>
          <h2>
            {i + 1}. {punto.titulo}
          </h2>
          <p>{punto.texto}</p>
        </div>
      ))}

      <h2>Si estás en riesgo ahora mismo</h2>
      <p>
        Este acompañamiento no es un servicio de emergencias y no atiende crisis en el
        momento. Si tú o alguien más está en peligro, llama:
      </p>
      <ul>
        {LINEAS_EMERGENCIA.map((linea) => (
          <li key={linea.numero}>
            <strong>{linea.nombre}:</strong>{' '}
            <a href={linea.href}>{linea.numero}</a>
          </li>
        ))}
      </ul>

      <h2>Preguntas sobre este texto</h2>
      <p>
        Escríbenos por{' '}
        <a href={RESPONSABLE.canalHref} target="_blank" rel="noopener noreferrer">
          {RESPONSABLE.canal}
        </a>
        . Para lo que tiene que ver con tus datos —verlos, corregirlos, borrarlos o retirar
        tu autorización— está la{' '}
        <Link href="/politica-de-datos">política de tratamiento de datos</Link>, que es el
        documento que lo desarrolla en detalle.
      </p>
    </section>
  )
}
