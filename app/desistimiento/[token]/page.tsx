import Image from 'next/image'
import { BACKEND_URL } from '@/lib/api'
import { LINEAS_EMERGENCIA } from '@/lib/consentimiento'
import { FormularioDesistimiento } from './FormularioDesistimiento'

// Mismo vestido del tamizaje y del consentimiento: es la misma situación
// —alguien leyendo algo importante desde el teléfono— y no tiene sentido
// dibujarla tres veces.
import '../../tamizaje/[token]/tamizaje.css'

export const metadata = { title: 'Cerrar mi caso' }

/**
 * CERRAR EL CASO PORQUE LA PERSONA NO QUIERE CONTINUAR.
 *
 * Hasta ahora esto lo hacía coordinación desde el portal, con el motivo que
 * alguien escribiera: nuestra palabra sobre la decisión de otra persona. Aquí
 * lo dice ella, y queda qué texto leyó al decirlo.
 *
 * El tono no es un detalle: no se le reprocha, no se le pide que se explique,
 * y los teléfonos de emergencia están arriba y abajo. Alguien que desiste
 * puede estar mal, no solo ocupado.
 */

type Estado = {
  persona: string | null
  yaCerrado: boolean
  texto: string
  version: string
  constancia: { firmadaEl: string; nombre: string; version: string } | null
}

async function leerEstado(token: string): Promise<Estado | null> {
  try {
    const respuesta = await fetch(`${BACKEND_URL}/api/desistimiento/${token}`, {
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

export default async function DesistimientoPage({
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
          Puede que haya vencido o que el mensaje se haya cortado al copiarlo. Si quieres cerrar
          tu caso, escríbenos por WhatsApp y te mandamos uno nuevo.
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

      {/*
        La introducción va DENTRO del formulario y no aquí.

        Estaba aquí, y después de aceptar seguía diciéndole «solo necesitamos
        que lo confirmes tú, aquí» encima del mensaje de que ya estaba hecho:
        esta página es un servidor que no se entera de que ella tocó el botón,
        y quien sí se entera es el componente de abajo. Se vio al hacerlo, no
        al leerlo.
      */}
      <FormularioDesistimiento
        token={token}
        texto={estado.texto}
        yaCerrado={estado.yaCerrado}
        constancia={estado.constancia}
      />
    </Envoltura>
  )
}
