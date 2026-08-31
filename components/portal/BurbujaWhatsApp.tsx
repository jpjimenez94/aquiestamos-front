import type { ReactNode } from 'react'

/**
 * El mensaje como lo va a ver quien lo recibe.
 *
 * Se veía como texto plano en una caja gris, con los asteriscos a la vista.
 * Quien copia y manda no está revisando un archivo de configuración: está a
 * punto de escribirle a alguien que pidió ayuda, y lo que necesita saber es
 * cómo va a llegar eso al otro lado.
 *
 * Vive aquí y no dentro de una pantalla porque son dos las que lo enseñan
 * —Parametrización, al editar la plantilla, y la ficha de la persona, al
 * mandarla— y ya sabemos cómo termina el mismo dibujo pintado en dos sitios.
 */

/**
 * WhatsApp pone en negrita lo que va entre asteriscos.
 *
 * Enseñarlos crudos no es un detalle estético: hace que quien revisa el texto
 * lea `*¿Cuál te sirve?*` y no vea lo que de verdad va a destacar. Se parte por
 * los pares de asteriscos y se convierte cada tramo.
 */
function conNegritas(texto: string): ReactNode[] {
  return texto.split(/(\*[^*\n]+\*)/g).map((trozo, i) =>
    trozo.startsWith('*') && trozo.endsWith('*') && trozo.length > 2 ? (
      <strong key={i}>{trozo.slice(1, -1)}</strong>
    ) : (
      <span key={i}>{trozo}</span>
    ),
  )
}

export function BurbujaWhatsApp({ texto }: { texto: string }) {
  return (
    <div
      style={{
        background: '#e5ddd5',
        backgroundImage: 'radial-gradient(#00000010 1px, transparent 1px)',
        backgroundSize: '16px 16px',
        padding: 16,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'flex-start',
      }}
    >
      <div
        style={{
          background: '#dcf8c6',
          borderRadius: '8px 8px 8px 0px',
          padding: '10px 14px',
          maxWidth: '85%',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          fontSize: '0.84rem',
          color: '#111827',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {conNegritas(texto)}
      </div>
    </div>
  )
}
