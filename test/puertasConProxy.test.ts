import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Cada `fetch('/api/…')` del navegador tiene su ruta en `app/api/`.
 *
 * El front no habla con el backend directamente: las páginas públicas —el
 * tamizaje, la agenda de la persona, «¿Cómo estás tú?»— piden a una ruta del
 * propio Next que reenvía y, de paso, pasa la IP real para que el límite de
 * peticiones del backend no se reparta entre todos.
 *
 * Se escribió la puerta del backend y la pantalla, y faltó el puente: la
 * página cargaba y el fetch daba 404 contra el propio Next. No lo vio ni el
 * typecheck ni el build —una URL es una cadena— y salió a producción; lo cazó
 * Byron abriendo su enlace.
 */

const RAIZ = join(process.cwd(), 'app')

function archivos(dir: string, acc: string[] = []): string[] {
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada)
    if (statSync(ruta).isDirectory()) archivos(ruta, acc)
    else if (/\.(tsx|ts)$/.test(entrada)) acc.push(ruta)
  }
  return acc
}

/** El primer segmento de cada `/api/<segmento>/…` que se pide desde el navegador. */
function segmentosPedidos(): Map<string, string[]> {
  const porSegmento = new Map<string, string[]>()
  for (const archivo of archivos(RAIZ)) {
    // Solo el código que corre en el navegador: lo del servidor llama al
    // backend por su URL absoluta, no por una ruta relativa.
    const codigo = readFileSync(archivo, 'utf8')
    if (!codigo.includes("'use client'") && !codigo.includes('"use client"')) continue
    for (const m of codigo.matchAll(/fetch\(\s*[`'"]\/api\/([a-zA-Z0-9._-]+)/g)) {
      const segmento = m[1]
      porSegmento.set(segmento, [...(porSegmento.get(segmento) ?? []), archivo])
    }
  }
  return porSegmento
}

describe('las páginas piden a rutas que existen', () => {
  const pedidos = segmentosPedidos()

  it('encuentra las llamadas del navegador', () => {
    // Si esto baja a cero, el escáner dejó de ver lo que debía mirar.
    expect(pedidos.size).toBeGreaterThan(0)
  })

  it.each([...pedidos.keys()])('/api/%s tiene su ruta en app/api', (segmento) => {
    const carpeta = join(RAIZ, 'api', segmento)
    expect(
      existsSync(carpeta),
      `Ninguna página puede pedir a /api/${segmento} sin que exista app/api/${segmento}. ` +
        `Lo piden: ${(pedidos.get(segmento) ?? []).map((f) => f.replace(process.cwd(), '')).join(', ')}`,
    ).toBe(true)

    // Y que la carpeta lleve de verdad a un route.ts, no a una carpeta vacía.
    const tieneRuta = archivos(carpeta).some((f) => f.endsWith('route.ts'))
    expect(tieneRuta, `app/api/${segmento} existe pero no tiene ningún route.ts`).toBe(true)
  })
})
