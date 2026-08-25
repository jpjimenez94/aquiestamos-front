'use server'

import { revalidatePath } from 'next/cache'
import { portalFetch } from '@/lib/portal'

export type LiderInput = {
  name: string
  phone: string
  email?: string | null
  territory: string
  beneficiariesCount: number
  status?: 'ACTIVO' | 'EN_SEGUIMIENTO' | 'ATENDIDO' | 'INACTIVO'
  nextAction?: string | null
  nextActionDate?: string | null
  notes?: string | null
  needIds?: string[]
}

export type ContactoInput = {
  notes: string
  nextActionDefined?: string | null
  nextActionDate?: string | null
  status?: 'ACTIVO' | 'EN_SEGUIMIENTO' | 'ATENDIDO' | 'INACTIVO'
}

export type NeedCategoryInput = {
  type: 'PSICOLOGICA' | 'RECURSO'
  name: string
  description?: string | null
  active?: boolean
  order?: number
}

export async function crearLiderAction(datos: LiderInput) {
  const respuesta = await portalFetch('/leaders', {
    method: 'POST',
    body: JSON.stringify(datos),
  })

  if (respuesta.success) {
    revalidatePath('/portal/lideres')
  }

  return respuesta
}

export async function editarLiderAction(id: string, datos: Partial<LiderInput>) {
  const respuesta = await portalFetch(`/leaders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  })

  if (respuesta.success) {
    revalidatePath('/portal/lideres')
    revalidatePath(`/portal/lideres/${id}`)
  }

  return respuesta
}

export async function agregarContactoAction(id: string, datos: ContactoInput) {
  const respuesta = await portalFetch(`/leaders/${id}/contacts`, {
    method: 'POST',
    body: JSON.stringify(datos),
  })

  if (respuesta.success) {
    revalidatePath('/portal/lideres')
    revalidatePath(`/portal/lideres/${id}`)
  }

  return respuesta
}

export async function inactivarLiderAction(id: string) {
  const respuesta = await portalFetch(`/leaders/${id}`, {
    method: 'DELETE',
  })

  if (respuesta.success) {
    revalidatePath('/portal/lideres')
    revalidatePath(`/portal/lideres/${id}`)
  }

  return respuesta
}

export async function crearCategoriaNecesidadAction(datos: NeedCategoryInput) {
  const respuesta = await portalFetch('/needs-catalog', {
    method: 'POST',
    body: JSON.stringify(datos),
  })

  if (respuesta.success) {
    revalidatePath('/portal/lideres')
  }

  return respuesta
}

export async function editarCategoriaNecesidadAction(id: string, datos: Partial<NeedCategoryInput>) {
  const respuesta = await portalFetch(`/needs-catalog/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  })

  if (respuesta.success) {
    revalidatePath('/portal/lideres')
  }

  return respuesta
}

export async function eliminarCategoriaNecesidadAction(id: string) {
  const respuesta = await portalFetch(`/needs-catalog/${id}`, {
    method: 'DELETE',
  })

  if (respuesta.success) {
    revalidatePath('/portal/lideres')
  }

  return respuesta
}
