import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * Lo mínimo: el alias `@/` del tsconfig, para que una prueba pueda importar
 * código que lo usa —las rutas de `app/api`, por ejemplo—. Sin esto, vitest
 * no sabe qué es `@/lib/portal` y la prueba ni arranca. Todo lo demás, con los
 * valores por defecto de vitest, como hasta ahora.
 */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
})
