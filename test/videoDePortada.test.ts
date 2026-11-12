import { describe, it, expect } from 'vitest'
import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { VIDEO_PORTADA } from '../lib/site'

/**
 * El video institucional de la portada.
 *
 * Un video que no está en `public/` deja en la portada un reproductor negro
 * que no hace nada, y nadie lo nota hasta que alguien le da a reproducir.
 */

const PUBLICO = join(process.cwd(), 'public')

describe('el video de la portada', () => {
  it('por ahora solo está en inglés, que es el idioma del video', () => {
    expect(Object.keys(VIDEO_PORTADA)).toEqual(['en'])
  })

  it.each(Object.entries(VIDEO_PORTADA))('en %s, el video y su imagen existen y pesan poco', (_idioma, video) => {
    for (const archivo of [video!.src, video!.poster]) {
      const ruta = join(PUBLICO, archivo)
      expect(existsSync(ruta), archivo).toBe(true)
    }
    // Quien llega desde el celular no debería pagar un video pesado.
    expect(statSync(join(PUBLICO, video!.src)).size).toBeLessThan(8 * 1024 * 1024)
  })

  it.each(Object.entries(VIDEO_PORTADA))('en %s, el texto del video va escrito', (_idioma, video) => {
    expect(video!.transcripcion.length).toBeGreaterThan(0)
    expect(video!.titulo.trim()).not.toBe('')
  })
})
