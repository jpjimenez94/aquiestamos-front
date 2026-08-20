import type { ApiResponse, Resource, ResourceGroup } from './types'

/**
 * Cliente del backend (Express + Prisma en Railway).
 * Se usa solo desde el servidor: BACKEND_URL nunca llega al navegador.
 */
export const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:4000').replace(
  /\/$/,
  '',
)

export async function backendFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const response = await fetch(`${BACKEND_URL}/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const payload = (await response.json().catch(() => ({
    success: false,
    message: 'Respuesta no válida del servidor',
  }))) as ApiResponse<T>

  return payload
}

/** Biblioteca "Recursos para todos", agrupada por categoría. */
export async function getResourceGroups(): Promise<ResourceGroup[]> {
  try {
    const payload = await backendFetch<ResourceGroup[]>('/resources', {
      // La biblioteca cambia poco: revalidamos cada 5 minutos.
      next: { revalidate: 300 },
    })
    return payload.success && payload.data ? payload.data : []
  } catch (error) {
    console.error('[api] No se pudieron cargar los recursos:', error)
    return []
  }
}

export async function getResource(slug: string): Promise<Resource | null> {
  try {
    const payload = await backendFetch<Resource>(`/resources/${slug}`, {
      next: { revalidate: 300 },
    })
    return payload.success && payload.data ? payload.data : null
  } catch (error) {
    console.error('[api] No se pudo cargar el recurso:', error)
    return null
  }
}
