import type { Metadata } from 'next'
import Image from 'next/image'
import { BACKEND_URL } from '@/lib/api'
import { LINEAS_EMERGENCIA } from '@/lib/consentimiento'
import { FormularioTamizaje } from './FormularioTamizaje'
import './tamizaje.css'

/**
 * La página que abre quien pidió acompañamiento, desde el enlace que le llega
 * por WhatsApp. No es del portal: es para la persona.
 *
 * Vive fuera de `(sitio)` a propósito, sin barra de navegación ni pie: quien
 * llega aquí viene a responder siete preguntas, no a navegar. Cada enlace que
 * no lleva a eso es una oportunidad de abandonar el formulario.
 */
export const metadata: Metadata = {
  title: 'Cómo estás',
  // Un enlace con token no puede acabar en un buscador.
  robots: { index: false, follow: false },
}

// El token es distinto en cada solicitud: no hay nada que prerenderizar.
export const dynamic = 'force-dynamic'

type Estado = { nombre: string; yaRespondido: boolean; respondidoEn: string | null }

async function leerEstado(token: string): Promise<Estado | null> {
  try {
    const respuesta = await fetch(`${BACKEND_URL}/api/triage/${encodeURIComponent(token)}`, {
      cache: 'no-store',
    })
    const datos = await respuesta.json()
    return datos.success && datos.data ? (datos.data as Estado) : null
  } catch {
    return null
  }
}

function Envoltura({ children }: { children: React.ReactNode }) {
  return (
    <main className="tamizaje">
      <div className="tamizaje__caja">
        <Image
          className="tamizaje__logo"
          src="/images/logo.png"
          alt="Red Aquí Estamos"
          width={132}
          height={48}
          priority
        />
        {children}
      </div>
    </main>
  )
}

export default async function TamizajePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const estado = await leerEstado(token)

  if (!estado) {
    return (
      <Envoltura>
        <h1>Este enlace ya no sirve</h1>
        <p className="tamizaje__intro">
          Puede que haya vencido o que el mensaje se haya cortado al copiarlo. Escríbenos por
          WhatsApp y te mandamos uno nuevo: tu solicitud sigue en pie.
        </p>
        <div className="tamizaje__lineas">
          {LINEAS_EMERGENCIA.map((linea) => (
            <a className="tamizaje__linea" href={linea.href} key={linea.numero}>
              {linea.nombre} <span>{linea.numero}</span>
            </a>
          ))}
        </div>
      </Envoltura>
    )
  }

  return (
    <Envoltura>
      <h1>{estado.nombre ? `Hola, ${estado.nombre}` : 'Hola'}</h1>
      <p className="tamizaje__intro">
        Somos la Red Aquí Estamos. Estas preguntas son para saber qué tan pronto necesitas que
        te llamemos. Se responden en un minuto.
      </p>
      <p className="tamizaje__aclaracion">
        No es un diagnóstico y nadie te va a evaluar por lo que contestes. Es solo para saber en
        qué orden acompañar.
      </p>

      <FormularioTamizaje token={token} yaRespondido={estado.yaRespondido} />
    </Envoltura>
  )
}
