import { SitioShell } from '@/components/sitio/SitioShell'
import { NoEncontrada } from '@/components/sitio/NoEncontrada'
import { diccionario } from '@/lib/i18n/diccionario'

export default function NotFound() {
  // El 404 global vive fuera del grupo (sitio), porque tiene que atrapar
  // también las rutas que no existen. Por eso dibuja su propia envoltura.
  //
  // Va en español: aquí llega lo que no es de ningún idioma —una dirección
  // mal escrita, un enlace viejo—. Lo que falla bajo `/en` o `/pt` tiene su
  // propio 404, en `app/[lang]/not-found.tsx`.
  return (
    <SitioShell idioma="es">
      <NoEncontrada idioma="es" t={diccionario('es').noEncontrada} />
    </SitioShell>
  )
}
