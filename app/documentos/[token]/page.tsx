import Image from 'next/image'
import { BACKEND_URL } from '@/lib/api'
import { FormularioDocumentos } from './FormularioDocumentos'

// El vestido del tamizaje, como todas las puertas públicas.
import '../../tamizaje/[token]/tamizaje.css'

export const metadata = { title: 'Tus documentos' }

type Estado = {
  nombre: string | null
  verificado: boolean
  yaEnviado: boolean
  numeroActual: string | null
}

async function leerEstado(token: string): Promise<Estado | null> {
  try {
    const respuesta = await fetch(`${BACKEND_URL}/api/documentos-profesional/${token}`, {
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

export default async function DocumentosPage({
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
          Puede que haya vencido. Escríbenos por WhatsApp y te mandamos uno nuevo: tus documentos
          se pueden subir cuando quieras.
        </p>
      </Envoltura>
    )
  }

  if (estado.verificado) {
    return (
      <Envoltura>
        <h1>{estado.nombre ? `${estado.nombre}, todo en orden` : 'Todo en orden'}</h1>
        <p className="tamizaje__intro">
          Tu perfil ya está verificado: no hace falta subir nada más. Gracias por acompañar.
        </p>
      </Envoltura>
    )
  }

  return (
    <Envoltura>
      <h1>{estado.nombre ? `Hola, ${estado.nombre}` : 'Hola'}</h1>
      <p className="tamizaje__intro">
        Para poder asignarte acompañamientos necesitamos dos documentos. Es un requisito legal del
        acompañamiento psicológico: cuida a quienes acompañamos y también a ti.
      </p>
      <p className="tamizaje__nota">
        Van directo a un almacenamiento privado y cifrado. Solo los ve el equipo de la red, y cada
        vez que alguien los consulta queda registrado.
      </p>

      <FormularioDocumentos
        token={token}
        yaEnviado={estado.yaEnviado}
        numeroActual={estado.numeroActual}
      />
    </Envoltura>
  )
}
