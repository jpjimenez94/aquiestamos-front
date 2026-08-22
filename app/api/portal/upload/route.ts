import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const carpeta = (formData.get('tipo') as string) || 'documentos' // 'tarjetas' | 'consentimientos' | 'documentos'

    if (!file) {
      return NextResponse.json({ success: false, message: 'No se recibió ningún archivo' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Formato no permitido. Solo se aceptan archivos PDF o imágenes (JPG, PNG, WEBP)' },
        { status: 400 },
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: 'El archivo excede el tamaño máximo permitido de 10 MB' },
        { status: 400 },
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
    const nombreLimpio = `${randomUUID()}.${ext}`

    const uploadsDir = join(process.cwd(), 'public', 'uploads', carpeta)
    await mkdir(uploadsDir, { recursive: true })

    const filepath = join(uploadsDir, nombreLimpio)
    await writeFile(filepath, buffer)

    const url = `/uploads/${carpeta}/${nombreLimpio}`

    return NextResponse.json({
      success: true,
      url,
      nombreOriginal: file.name,
      tamano: file.size,
    })
  } catch (error) {
    console.error('[upload] Error guardando archivo:', error)
    return NextResponse.json({ success: false, message: 'Error al procesar y guardar el archivo' }, { status: 500 })
  }
}
