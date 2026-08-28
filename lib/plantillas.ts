/**
 * Los textos de los mensajes salen de Parametrización, no del código.
 *
 * Hasta ahora había dos verdades sobre lo que se le dice a una persona: las 15
 * plantillas de WhatsApp que la coordinación edita en el portal, y 24
 * constructores con el texto escrito a mano en `lib/mensajes.ts`. Lo que se
 * enviaba salía SIEMPRE del código. Editar una plantilla en la pantalla, verla
 * guardada y no cambiar nada era el comportamiento normal.
 *
 * Eso convierte una pantalla en un adorno, y es peor que no tenerla: quien
 * edita cree que ajustó el tono de un mensaje que le llega a alguien en crisis,
 * y el mensaje sigue igual durante meses sin que nadie lo note.
 *
 * A partir de aquí la plantilla manda. El código sigue calculando las
 * VARIABLES —el nombre de pila, los días en palabras, la fecha en Bogotá—
 * porque eso es lógica y no texto; lo que se dice con ellas vive en la base.
 */

/**
 * Este archivo es PURO a propósito: sin `next/headers`, sin peticiones, sin
 * nada de servidor. Lo importa `lib/mensajes.ts`, que usan los componentes de
 * cliente; si arrastrara el cliente del portal, el build entero se cae con
 * «You're importing a module that depends on next/headers».
 *
 * Quien trae los textos es `traerPlantillas`, en `lib/portal.ts`, que ya es de
 * servidor. La página los pide y se los pasa a los componentes.
 */
export type Plantillas = Record<string, string>

/**
 * Rellena `{variables}` en el texto de una plantilla.
 *
 * Reglas, y cada una responde a una forma concreta de romper un mensaje:
 *
 * · Una variable sin valor deja la línea entera fuera, no un hueco. «La persona
 *   está en .» se lee como un error del sistema; no decir la ciudad se lee como
 *   que no la sabemos, que es la verdad.
 *
 * · Una variable que la plantilla usa pero nadie le pasó se queda tal cual,
 *   visible. Un `{profesional}` en mitad del mensaje es feo y se arregla; un
 *   hueco silencioso se manda cien veces sin que nadie lo vea.
 *
 * · Nunca lanza. Un mensaje mal formado no puede impedir que quien coordina
 *   siga trabajando.
 */
export function renderPlantilla(
  texto: string | undefined,
  variables: Record<string, string | null | undefined>,
  respaldo = '',
): string {
  const base = texto?.trim() ? texto : respaldo
  if (!base) return ''

  const vacia = (clave: string) => {
    const v = variables[clave]
    return v === null || v === undefined || String(v).trim() === ''
  }

  return base
    .split('\n')
    .filter((linea) => {
      // Fuera la línea que depende de algo que no sabemos.
      const usadas = [...linea.matchAll(/\{(\w+)\}/g)].map((m) => m[1])
      if (usadas.length === 0) return true
      return !usadas.every((c) => c in variables && vacia(c))
    })
    .map((linea) =>
      linea.replace(/\{(\w+)\}/g, (completo, clave) => {
        const v = variables[clave]
        // Lo que la plantilla pide y nadie mandó se queda a la vista.
        if (v === undefined) return completo
        return v === null ? '' : String(v)
      }),
    )
    .join('\n')
    // Tres saltos seguidos aparecen al caerse una línea; se dejan en dos.
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
