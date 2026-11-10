'use client'

import { useId } from 'react'
import { Globe } from 'lucide-react'
import { MunicipioSelector } from './MunicipioSelector'
import { TextField } from './fields'
import { COLOMBIA, esDeFuera, type OpcionDePais } from '@/lib/paises'
import type { Diccionario } from '@/lib/i18n/diccionarios/es'

type Comun = Diccionario['formularios']['comun']

/**
 * País y ciudad, juntos: la ciudad depende del país.
 *
 * Colombia viene elegida, porque es de donde escribe casi todo el mundo, y con
 * ella el buscador de municipios de siempre. Si la persona elige otro país, el
 * buscador de municipios colombianos ya no le sirve: la ciudad se escribe a
 * mano. Al cambiar de país se borra la ciudad, para que no se guarde «Bogotá»
 * con «España».
 *
 * Fuera de Colombia aparece un aviso, que pasa cada formulario: la cita será
 * virtual y los horarios van en hora de Colombia. Es lo que la persona tiene
 * que saber antes de seguir, no después.
 */
export function CampoUbicacion({
  paises,
  pais,
  ciudad,
  onPais,
  onCiudad,
  errorCiudad,
  preguntaCiudad,
  avisoFuera,
  comun,
}: {
  paises: OpcionDePais[]
  pais: string
  ciudad: string
  onPais: (codigo: string) => void
  onCiudad: (valor: string) => void
  errorCiudad?: string
  /** La pregunta por la ciudad que ya hacía cada formulario, para Colombia. */
  preguntaCiudad: { etiqueta: string; ejemplo: string; pista?: string }
  /** Lo que se le dice a quien está fuera de Colombia. */
  avisoFuera: string
  comun: Comun
}) {
  const idPais = useId()
  const fuera = esDeFuera(pais)

  return (
    <>
      <div className="field">
        <label className="field__label" htmlFor={idPais}>
          {comun.pais.etiqueta}
          <span className="field__required" aria-hidden>
            *
          </span>
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            id={idPais}
            name="country"
            className="input"
            value={pais || COLOMBIA}
            onChange={(e) => {
              const nuevo = e.target.value
              if (nuevo === pais) return
              onPais(nuevo)
              onCiudad('')
            }}
            style={{ paddingLeft: 34, appearance: 'auto' }}
          >
            {paises.map((p) => (
              <option key={p.codigo} value={p.codigo}>
                {p.nombre}
              </option>
            ))}
          </select>
          <Globe
            size={16}
            aria-hidden
            style={{ position: 'absolute', left: 10, color: 'var(--color-text-light)', pointerEvents: 'none' }}
          />
        </div>
      </div>

      {fuera ? (
        <>
          <TextField
            label={comun.pais.ciudadFuera.etiqueta}
            name="city"
            required
            placeholder={comun.pais.ciudadFuera.ejemplo}
            autoComplete="address-level2"
            value={ciudad}
            error={errorCiudad}
            onChange={onCiudad}
          />
          <p
            role="note"
            style={{
              margin: '-4px 0 0',
              padding: '12px 14px',
              borderRadius: 10,
              background: 'rgba(50, 125, 169, 0.08)',
              border: '1px solid rgba(50, 125, 169, 0.25)',
              fontSize: '0.88rem',
              lineHeight: 1.5,
            }}
          >
            {avisoFuera}
          </p>
        </>
      ) : (
        <MunicipioSelector
          label={preguntaCiudad.etiqueta}
          name="city"
          required
          placeholder={preguntaCiudad.ejemplo}
          hint={preguntaCiudad.pista}
          textos={comun.municipio}
          value={ciudad}
          error={errorCiudad}
          onChange={onCiudad}
        />
      )}
    </>
  )
}
