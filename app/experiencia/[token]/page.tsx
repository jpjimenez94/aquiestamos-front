import Image from 'next/image'
import { BACKEND_URL } from '@/lib/api'
import { LINEAS_EMERGENCIA } from '@/lib/consentimiento'
import { FormularioExperiencia } from './FormularioExperiencia'

import '../../tamizaje/[token]/tamizaje.css'

export const metadata = { title: 'Cuéntanos tu experiencia · Red Aquí Estamos' }

type Estado = {
  persona: string | null
  profesional: string | null
}

async function leerEstado(token: string): Promise<Estado | null> {
  try {
    const respuesta = await fetch(`${BACKEND_URL}/api/experiencia/${encodeURIComponent(token)}`, {
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Image
            src="/images/logo.png"
            alt="Red Aquí Estamos"
            width={170}
            height={62}
            style={{ width: 'auto', height: 'auto', maxWidth: 170 }}
            priority
          />
        </div>
        {children}
      </div>
    </main>
  )
}

export default async function ExperienciaPage({
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
          Y no pasa nada: este formulario es opcional. Si quieres contarnos algo o necesitas apoyo, escríbenos por
          WhatsApp. Y si vuelves a requerir acompañamiento, aquí estamos.
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
        Esperamos que tu espacio{estado.profesional ? ` con ${estado.profesional}` : ''} haya sido seguro y útil.
        Cuéntanos brevemente cómo te fue: son solo dos preguntas y nos ayudan a cuidarte y acompañarte mejor.
      </p>
      <p className="tamizaje__aclaracion">
        Es totalmente confidencial. Lo que respondas aquí lo lee solo el equipo de coordinación de la red, no el profesional que te acompañó.
      </p>

      <FormularioExperiencia token={token} profesional={estado.profesional} />
    </Envoltura>
  )
}
