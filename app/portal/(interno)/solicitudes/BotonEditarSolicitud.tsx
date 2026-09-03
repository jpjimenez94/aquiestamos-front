'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X } from 'lucide-react'
import type { Solicitud } from './TablaSolicitudes'

/**
 * Corregir los datos de una solicitud.
 *
 * Llegan con el teléfono mal digitado, el nombre a medias o la ciudad en
 * blanco, y hasta ahora la única salida era borrar la solicitud y pedirle a la
 * persona que volviera a llenar el formulario — a alguien que ya pidió ayuda
 * una vez.
 *
 * Lo que no aparece aquí, a propósito: las autorizaciones que la persona
 * marcó. No son campos, son el registro de lo que aceptó, con su versión y su
 * fecha; editarlas sería reescribir un consentimiento en nombre de quien lo
 * dio. El servidor las rechaza aunque alguien las mande a mano.
 */

const DIAS = [
  ['LUNES', 'Lunes'],
  ['MARTES', 'Martes'],
  ['MIERCOLES', 'Miércoles'],
  ['JUEVES', 'Jueves'],
  ['VIERNES', 'Viernes'],
  ['SABADO', 'Sábado'],
  ['DOMINGO', 'Domingo'],
] as const

const FRANJAS = [
  ['MANANA', 'Mañana'],
  ['TARDE', 'Tarde'],
  ['NOCHE', 'Noche'],
] as const

type Campos = {
  name: string
  phone: string
  email: string
  city: string
  preferredContact: string
  preferredModality: string
  forWhom: string
  isMinor: boolean
  contactName: string
  relationship: string
  availableDays: string[]
  availableSlots: string[]
}

function desdeLaSolicitud(s: Solicitud): Campos {
  return {
    name: s.name ?? '',
    phone: s.phone ?? '',
    email: s.email ?? '',
    city: s.city ?? '',
    preferredContact: s.preferredContact ?? '',
    preferredModality: s.preferredModality ?? '',
    forWhom: s.forWhom ?? '',
    isMinor: s.isMinor === true,
    contactName: s.contactName ?? '',
    relationship: s.relationship ?? '',
    availableDays: s.availableDays ?? [],
    availableSlots: s.availableSlots ?? [],
  }
}

export function BotonEditarSolicitud({ solicitud }: { solicitud: Solicitud }) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [campos, setCampos] = useState<Campos>(() => desdeLaSolicitud(solicitud))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function abrir() {
    // Se recarga desde la fila cada vez: si alguien más la corrigió mientras
    // esta pestaña estaba abierta, no se pisa con lo que había al montar.
    setCampos(desdeLaSolicitud(solicitud))
    setError(null)
    setAbierto(true)
  }

  const alternar = (lista: string[], valor: string) =>
    lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor]

  async function guardar() {
    setGuardando(true)
    setError(null)

    /**
     * Solo lo que cambió. Mandar el formulario entero haría que cada edición
     * pisara campos que nadie tocó, y que la auditoría dijera que cambiaron
     * doce cosas cuando cambió una.
     */
    const original = desdeLaSolicitud(solicitud)
    const cambios: Record<string, unknown> = {}
    for (const clave of Object.keys(campos) as (keyof Campos)[]) {
      const antes = original[clave]
      const ahora = campos[clave]
      const igual = Array.isArray(antes)
        ? antes.length === (ahora as string[]).length &&
          antes.every((x) => (ahora as string[]).includes(x))
        : antes === ahora
      if (!igual) cambios[clave] = ahora
    }

    if (Object.keys(cambios).length === 0) {
      setAbierto(false)
      setGuardando(false)
      return
    }

    try {
      const res = await fetch(`/api/portal/support-requests/${solicitud.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cambios),
      })
      const datos = await res.json()
      if (!res.ok || !datos.success) {
        setError(datos.message ?? 'No se pudieron guardar los cambios')
        setGuardando(false)
        return
      }
      if (datos.meta?.personaCorregida) {
        // No es un detalle: significa que se tocaron dos registros.
        window.alert('Datos corregidos, también en la ficha de la persona ya admitida.')
      }
      setAbierto(false)
      setGuardando(false)
      router.refresh()
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
      setGuardando(false)
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        className="boton-mini"
        onClick={abrir}
        title="Corregir los datos de esta solicitud"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
      >
        <Pencil size={13} />
        Editar
      </button>
    )
  }

  return (
    <div className="modal-eliminar-overlay" onClick={() => setAbierto(false)}>
      <div
        className="modal-eliminar"
        style={{ maxWidth: 620, textAlign: 'left', padding: '24px 26px', alignItems: 'stretch' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            borderBottom: '1px solid var(--color-border-default, #e2e8f0)',
            paddingBottom: 12,
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Corregir los datos</h2>
          <button
            type="button"
            className="boton-icono"
            onClick={() => setAbierto(false)}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <p className="panel__nota" style={{ margin: '10px 0 0' }}>
          Si esta solicitud ya fue admitida, la corrección se aplica también a la ficha de la
          persona: es el mismo dato en dos sitios.
        </p>

        {error ? (
          <div className="aviso-portal" data-tono="rojo" style={{ margin: '12px 0 0' }}>
            {error}
          </div>
        ) : null}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            marginTop: 14,
          }}
        >
          <Campo etiqueta="Nombre de quien recibe el acompañamiento *">
            <input
              className="input"
              value={campos.name}
              onChange={(e) => setCampos({ ...campos, name: e.target.value })}
            />
          </Campo>

          <Campo etiqueta="Teléfono *">
            <input
              className="input"
              value={campos.phone}
              onChange={(e) => setCampos({ ...campos, phone: e.target.value })}
            />
          </Campo>

          <Campo etiqueta="Correo" nota="Puede quedar vacío: la red trabaja por WhatsApp.">
            <input
              className="input"
              type="email"
              value={campos.email}
              onChange={(e) => setCampos({ ...campos, email: e.target.value })}
            />
          </Campo>

          <Campo etiqueta="Ciudad *">
            <input
              className="input"
              value={campos.city}
              onChange={(e) => setCampos({ ...campos, city: e.target.value })}
            />
          </Campo>

          <Campo etiqueta="Por dónde contactarla">
            <select
              className="input"
              value={campos.preferredContact}
              onChange={(e) => setCampos({ ...campos, preferredContact: e.target.value })}
            >
              <option value="">Sin especificar</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="LLAMADA">Llamada</option>
              <option value="CORREO">Correo</option>
            </select>
          </Campo>

          <Campo etiqueta="Modalidad que prefiere">
            <select
              className="input"
              value={campos.preferredModality}
              onChange={(e) => setCampos({ ...campos, preferredModality: e.target.value })}
            >
              <option value="">Sin especificar</option>
              <option value="VIRTUAL">Virtual</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="INDIFERENTE">Le da igual</option>
            </select>
          </Campo>

          <Campo etiqueta="Para quién es">
            <select
              className="input"
              value={campos.forWhom}
              onChange={(e) => setCampos({ ...campos, forWhom: e.target.value })}
            >
              <option value="">Sin especificar</option>
              <option value="PARA_MI">Para sí misma</option>
              <option value="PARA_OTRA_PERSONA">Para otra persona</option>
            </select>
          </Campo>

          <Campo etiqueta="Es menor de edad">
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={campos.isMinor}
                onChange={(e) => setCampos({ ...campos, isMinor: e.target.checked })}
              />
              Sí, es menor de edad
            </label>
          </Campo>

          {campos.forWhom === 'PARA_OTRA_PERSONA' ? (
            <>
              <Campo etiqueta="Quién llenó el formulario">
                <input
                  className="input"
                  value={campos.contactName}
                  onChange={(e) => setCampos({ ...campos, contactName: e.target.value })}
                />
              </Campo>
              <Campo etiqueta="Qué relación tiene con ella">
                <input
                  className="input"
                  value={campos.relationship}
                  onChange={(e) => setCampos({ ...campos, relationship: e.target.value })}
                />
              </Campo>
            </>
          ) : null}
        </div>

        <div style={{ marginTop: 14 }}>
          <Campo etiqueta="Días que puede">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DIAS.map(([valor, texto]) => (
                <label key={valor} style={casilla}>
                  <input
                    type="checkbox"
                    checked={campos.availableDays.includes(valor)}
                    onChange={() =>
                      setCampos({ ...campos, availableDays: alternar(campos.availableDays, valor) })
                    }
                  />
                  {texto}
                </label>
              ))}
            </div>
          </Campo>
        </div>

        <div style={{ marginTop: 12 }}>
          <Campo etiqueta="Franjas">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {FRANJAS.map(([valor, texto]) => (
                <label key={valor} style={casilla}>
                  <input
                    type="checkbox"
                    checked={campos.availableSlots.includes(valor)}
                    onChange={() =>
                      setCampos({
                        ...campos,
                        availableSlots: alternar(campos.availableSlots, valor),
                      })
                    }
                  />
                  {texto}
                </label>
              ))}
            </div>
          </Campo>
        </div>

        <div
          style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18, flexWrap: 'wrap' }}
        >
          <button type="button" className="boton-mini" onClick={() => setAbierto(false)}>
            Cancelar
          </button>
          <button
            type="button"
            className="boton-mini"
            data-tono="principal"
            onClick={guardar}
            disabled={guardando}
          >
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Campo({
  etiqueta,
  nota,
  children,
}: {
  etiqueta: string
  nota?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <span className="field__label">{etiqueta}</span>
      {children}
      {nota ? (
        <span className="tabla__secundario" style={{ fontSize: '0.76rem' }}>
          {nota}
        </span>
      ) : null}
    </div>
  )
}

const casilla: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  fontSize: '0.84rem',
  border: '1px solid var(--color-border-default, #e2e8f0)',
  borderRadius: 7,
  padding: '4px 9px',
  cursor: 'pointer',
}
