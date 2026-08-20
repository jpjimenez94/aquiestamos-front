/**
 * Formato de fechas en hora de Bogotá.
 *
 * Vive aparte de `portal.ts` a propósito: aquel importa `next/headers` y solo
 * corre en servidor, mientras que estas funciones las necesitan también los
 * componentes de cliente.
 */

export const ZONA = 'America/Bogota'

export function enBogota(iso: string | Date, conHora = true): string {
  const fecha = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: ZONA,
    dateStyle: 'medium',
    ...(conHora ? { timeStyle: 'short' } : {}),
  }).format(fecha)
}

export function soloHora(iso: string | Date): string {
  const fecha = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: ZONA,
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha)
}

export function diaLargo(iso: string | Date): string {
  const fecha = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: ZONA,
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(fecha)
}
