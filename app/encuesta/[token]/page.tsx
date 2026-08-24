import Image from 'next/image'
import { BACKEND_URL } from '@/lib/api'
import { LINEAS_EMERGENCIA } from '@/lib/consentimiento'
import { FormularioEncuesta } from './FormularioEncuesta'

// El vestido del tamizaje, como todas las puertas públicas: alguien
// respondiendo algo desde el teléfono.
import '../../tamizaje/[token]/tamizaje.css'

export const metadata = { title: 'Cuéntanos cómo te fue' }

type Estado = {
  persona: string | null
  profesional: string | null
  yaRespondida: boolean
}

async function leerEstado(token: string): Promise<Estado | null> {
  try {
    const respuesta = await fetch(`${BACKEND_URL}/api/encuesta/${token}`, { cache: 'no-store' })
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

export default async function EncuestaPage({
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
          Y no pasa nada: la encuesta era opcional. Si quieres contarnos algo, escríbenos por
          WhatsApp. Y si vuelves a necesitar acompañamiento, aquí estamos.
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
      <h1>{estado.persona ? `Hola, ${estado.persona}` : 'Hola'}</h1>
      <p className="tamizaje__intro">
        Tu acompañamiento quedó cerrado. Si quieres, cuéntanos cómo te fue: son dos preguntas y
        nos ayudan a acompañar mejor a quien viene después.
      </p>
      <p className="tamizaje__aclaracion">
        Es opcional. Lo que respondas no llega a quien te acompañó: lo lee solo el equipo de la red.
      </p>

      <FormularioEncuesta token={token} yaRespondida={estado.yaRespondida} />
    </Envoltura>
  )
}
