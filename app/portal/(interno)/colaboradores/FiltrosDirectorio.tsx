import { Search, X } from 'lucide-react'

/**
 * Filtros del directorio.
 *
 * Es un formulario GET de toda la vida, sin JavaScript: los valores acaban en
 * la URL, así que una búsqueda concreta ("fisioterapeutas en Ibagué que puedan
 * ir presencial") se puede guardar o pasar por WhatsApp a quien coordina.
 *
 * Al enviar no se arrastra `pagina`, con lo que la búsqueda siempre empieza
 * en la primera.
 */

const AREAS = [
  { value: 'SALUD', label: 'Salud y primeros auxilios' },
  { value: 'SOCIAL_LEGAL_EDUCATIVO', label: 'Social, legal y educativo' },
  { value: 'OPERACION_LOGISTICA', label: 'Operación y logística' },
  { value: 'COMUNICACION_TECNOLOGIA', label: 'Comunicación y tecnología' },
  { value: 'GESTION_PROYECTOS', label: 'Gestión y proyectos' },
  { value: 'OTRA', label: 'Otra área' },
]

const MODALIDADES = [
  { value: 'PRESENCIAL', label: 'Puede ir presencial' },
  { value: 'VIRTUAL', label: 'Solo virtual' },
]

export function FiltrosDirectorio({
  area,
  ciudad,
  modalidad,
}: {
  area: string
  ciudad: string
  modalidad: string
}) {
  const hayFiltro = Boolean(area || ciudad || modalidad)

  return (
    <form className="filtros" method="get" action="/portal/colaboradores">
      <label className="filtros__campo">
        <span>Área</span>
        <select name="area" defaultValue={area}>
          <option value="">Todas</option>
          {AREAS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </label>

      <label className="filtros__campo">
        <span>Ciudad</span>
        <input type="text" name="ciudad" defaultValue={ciudad} placeholder="Ibagué, Cali…" />
      </label>

      <label className="filtros__campo">
        <span>Modalidad</span>
        <select name="modalidad" defaultValue={modalidad}>
          <option value="">Cualquiera</option>
          {MODALIDADES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </label>

      <div className="filtros__acciones">
        <button type="submit" className="boton-mini" data-tono="principal">
          <Search size={14} />
          Buscar
        </button>
        {hayFiltro ? (
          <a className="boton-mini" href="/portal/colaboradores">
            <X size={14} />
            Limpiar
          </a>
        ) : null}
      </div>
    </form>
  )
}
