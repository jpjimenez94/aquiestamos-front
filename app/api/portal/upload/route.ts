import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { BACKEND_URL } from '@/lib/api'
import { COOKIE_SESION } from '@/lib/portal'

export const dynamic = 'force-dynamic'

/**
 * Sube un documento del portal: tarjeta profesional, certificado o
 * consentimiento firmado.
 *
 * Esta ruta escribía el archivo en `public/uploads/` y devolvía su URL. Eso
 * tenía tres problemas a la vez: no pedía sesión —cualquiera podía escribir
 * en el servidor—, `public/` es la carpeta que Next sirve al mundo sin
 * autenticación, y en Vercel el disco es efímero, así que los documentos
 * desaparecían en cada despliegue.
 *
 * Ahora no toca el disco. Deshace el formulario, comprueba que haya sesión y
 * reenvía los bytes al backend, que es quien decide permisos, guarda en un
 * bucket privado y deja el rastro de quién subió qué.
 */

const TIPOS = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const MAXIMO = 10 * 1024 * 1024

export async function POST(request: Request) {
  const almacen = await cookies()
  const token = almacen.get(COOKIE_SESION)?.value

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Necesitas iniciar sesión' },
      { status: 401 },
    )
  }

  let formulario: FormData
  try {
    formulario = await request.formData()
  } catch {
    return NextResponse.json({ success: false, message: 'Petición no válida' }, { status: 400 })
  }

  const archivo = formulario.get('file')
  if (!(archivo instanceof File)) {
    return NextResponse.json(
      { success: false, message: 'No se recibió ningún archivo' },
      { status: 400 },
    )
  }

  // Se valida aquí además de en el backend: es lo que permite decírselo a la
  // persona sin gastar una subida de 10 MB para que la rechacen al final.
  if (!TIPOS.includes(archivo.type)) {
    return NextResponse.json(
      { success: false, message: 'Solo se aceptan archivos PDF o imágenes (JPG, PNG, WEBP)' },
      { status: 400 },
    )
  }
  if (archivo.size > MAXIMO) {
    return NextResponse.json(
      { success: false, message: 'El archivo excede el tamaño máximo permitido de 10 MB' },
      { status: 400 },
    )
  }

  const carpeta = String(formulario.get('tipo') ?? 'documentos')

  try {
    const respuesta = await fetch(
      `${BACKEND_URL}/api/documentos?carpeta=${encodeURIComponent(carpeta)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': archivo.type,
          // El nombre original no viaja: trae acentos, espacios y a veces el
          // nombre completo de alguien. El backend le pone uno nuevo.
          'x-tipo-archivo': archivo.type,
        },
        body: await archivo.arrayBuffer(),
        cache: 'no-store',
      },
    )

    const datos = await respuesta.json().catch(() => ({
      success: false,
      message: 'Respuesta no válida del servidor',
    }))

    if (!respuesta.ok || !datos.success) {
      return NextResponse.json(datos, { status: respuesta.status })
    }

    // `clave` y no `url`: lo que se guarda en la base es la clave, y para ver
    // el documento se pide una URL firmada que dura un minuto.
    return NextResponse.json({
      success: true,
      clave: datos.data.clave,
      nombreOriginal: archivo.name,
      tamano: archivo.size,
    })
  } catch (error) {
    console.error('[upload] backend inalcanzable:', error)
    return NextResponse.json(
      { success: false, message: 'No pudimos conectarnos con el servidor' },
      { status: 502 },
    )
  }
}
