/**
 * Una frase con un hueco que se rellena con algo que no es texto llano —el
 * asterisco rojo de «los campos marcados con * son obligatorios»—.
 *
 * Existe para no partir la frase en dos claves («antes» y «después»): el orden
 * de las palabras cambia de un idioma a otro, y una frase partida obliga a
 * todos a seguir el orden del español.
 */
export function ConHueco({
  frase,
  hueco,
  children,
}: {
  frase: string
  /** El nombre de la variable, sin llaves. */
  hueco: string
  children: React.ReactNode
}) {
  const marca = `{${hueco}}`
  const corte = frase.indexOf(marca)
  if (corte === -1) return <>{frase}</>

  return (
    <>
      {frase.slice(0, corte)}
      {children}
      {frase.slice(corte + marca.length)}
    </>
  )
}
