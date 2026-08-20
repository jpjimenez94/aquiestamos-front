import { AlertTriangle } from 'lucide-react'
import { LINEAS_EMERGENCIA } from '@/lib/consentimiento'

/**
 * Va antes de la primera pregunta, no después del formulario.
 * Quien está en riesgo inmediato no llega hasta el final de la página.
 */
export function AvisoEmergencia() {
  return (
    <aside className="emergencia" role="note" aria-labelledby="aviso-emergencia">
      <span className="emergencia__icono" aria-hidden>
        <AlertTriangle size={22} />
      </span>
      <div>
        <h2 id="aviso-emergencia">Si necesitas ayuda ahora mismo</h2>
        <p>
          Si estás en peligro inmediato o pensando en hacerte daño, llama a estas líneas.
          Están disponibles las 24 horas. Aquí Estamos acompaña, pero no es un servicio
          de urgencias.
        </p>
        <div className="emergencia__lineas">
          {LINEAS_EMERGENCIA.map((linea) => (
            <a className="emergencia__linea" href={linea.href} key={linea.numero}>
              {linea.nombre} <span>{linea.numero}</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}
