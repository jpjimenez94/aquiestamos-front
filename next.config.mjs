import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: { root: join(here, '..') },
  images: {
    // Solo WebP: la codificación AVIF de algunos PNG con paleta se cuelga
    // en el optimizador y deja la imagen sin cargar.
    formats: ['image/webp'],
  },
}

export default nextConfig
