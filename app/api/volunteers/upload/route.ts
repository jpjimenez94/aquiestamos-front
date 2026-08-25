import { NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/api'

export const dynamic = 'force-dynamic'

const TIPOS = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const MAXIMO = 10 * 1024 * 1024

export async function POST(request: Request) {
  let formulario: FormData
  try {
    formulario = await request.formData()
  } catch {
    return NextResponse.json({ success: false, message: 'Petición no válida' }, { status: 400 })
  }

  const archivo = formulario.get('archivo')
  if (!(archivo instanceof File) || archivo.size === 0) {
    return NextResponse.json(
      { success: false, message: 'No se recibió ningún archivo' },
      { status: 400 },
    )
  }

  if (!TIPOS.includes(archivo.type)) {
    return NextResponse.json(
      { success: false, message: 'Solo se aceptan archivos PDF o imágenes (JPG, PNG, WEBP)' },
      { status: 400 },
    )
  }

  if (archivo.size > MAXIMO) {
    return NextResponse.json(
      { success: false, message: 'El archivo pesa más de 10 MB. Prueba con una foto más liviana.' },
      { status: 400 },
    )
  }

  try {
    const bytes = Buffer.from(await archivo.arrayBuffer())
    const respuesta = await fetch(`${BACKEND_URL}/api/volunteers/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': archivo.type || 'application/octet-stream',
        'x-tipo-archivo': archivo.type,
      },
      body: bytes,
      cache: 'no-store',
    })

    const datos = await respuesta.json()
    return NextResponse.json(datos, { status: respuesta.status })
  } catch (error) {
    console.error('[api/volunteers/upload] error al subir:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'No pudimos subir el archivo en este momento. Intenta de nuevo o continúa sin adjuntar.',
      },
      { status: 502 },
    )
  }
}
