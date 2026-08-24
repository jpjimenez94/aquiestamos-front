import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      /**
       * Los documentos del profesional (tarjeta, cédula) suben por server
       * action y pesan hasta 10 MB. El límite por defecto es 1 MB y Next
       * rechaza el cuerpo ANTES de llegar a nuestro código: una foto normal
       * fallaba en silencio mientras un PDF pequeño sí pasaba.
       */
      bodySizeLimit: '11mb',
    },
  },
  poweredByHeader: false,
  turbopack: { root: join(here, '..') },
  images: {
    // Solo WebP: la codificación AVIF de algunos PNG con paleta se cuelga
    // en el optimizador y deja la imagen sin cargar.
    formats: ['image/webp'],
  },
}

export default nextConfig
