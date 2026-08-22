'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, Check, ChevronDown, Search } from 'lucide-react'
import { MUNICIPIOS_COLOMBIA } from '@/lib/municipiosColombia'

type MunicipioSelectorProps = {
  label: string
  name: string
  value: string
  required?: boolean
  error?: string
  placeholder?: string
  hint?: string
  onChange: (valor: string) => void
}

export function MunicipioSelector({
  label,
  name,
  value,
  required = false,
  error,
  placeholder = 'Busca o escribe tu ciudad o municipio...',
  hint,
  onChange,
}: MunicipioSelectorProps) {
  const [abierto, setAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState(value || '')
  const contenedorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setBusqueda(value || '')
  }, [value])

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function clickAfuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', clickAfuera)
    return () => document.removeEventListener('mousedown', clickAfuera)
  }, [])

  const filtrados = busqueda.trim()
    ? MUNICIPIOS_COLOMBIA.filter((m) =>
        m.toLowerCase().includes(busqueda.trim().toLowerCase()),
      ).slice(0, 30)
    : MUNICIPIOS_COLOMBIA.slice(0, 30)

  function seleccionar(municipio: string) {
    // Si viene en formato "Medellín (Antioquia)", guardamos el nombre limpio de la ciudad o completo
    setBusqueda(municipio)
    onChange(municipio)
    setAbierto(false)
  }

  function manejarCambioTexto(e: React.ChangeEvent<HTMLInputElement>) {
    const texto = e.target.value
    setBusqueda(texto)
    onChange(texto)
    if (!abierto) setAbierto(true)
  }

  return (
    <div className="field" ref={contenedorRef} style={{ position: 'relative' }}>
      <label className="field__label" htmlFor={name}>
        {label} {required && <span style={{ color: 'var(--color-red, #dc2626)' }}>*</span>}
      </label>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          id={name}
          name={name}
          className={`input ${error ? 'input--error' : ''}`}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={busqueda}
          onChange={manejarCambioTexto}
          onFocus={() => setAbierto(true)}
          style={{ paddingLeft: 34, paddingRight: 34 }}
        />
        <MapPin
          size={16}
          style={{
            position: 'absolute',
            left: 10,
            color: 'var(--color-text-secondary, #64748b)',
            pointerEvents: 'none',
          }}
        />
        <button
          type="button"
          onClick={() => setAbierto(!abierto)}
          style={{
            position: 'absolute',
            right: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            color: 'var(--color-text-secondary, #64748b)',
          }}
          tabIndex={-1}
          aria-label="Desplegar lista de municipios"
        >
          <ChevronDown size={16} style={{ transform: abierto ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
      </div>

      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}

      {/* Menú Desplegable con Autocompletado */}
      {abierto && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            background: '#ffffff',
            border: '1px solid var(--color-border-default, #cbd5e1)',
            borderRadius: 8,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            maxHeight: 230,
            overflowY: 'auto',
            marginTop: 4,
          }}
        >
          <div style={{ padding: '6px 10px', fontSize: '0.74rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Search size={12} />
            {busqueda.trim()
              ? `Coincidencias para "${busqueda}" (o escribe libremente):`
              : 'Ciudades y municipios principales de Colombia:'}
          </div>

          {filtrados.length > 0 ? (
            filtrados.map((m) => {
              const seleccionado = value.toLowerCase() === m.toLowerCase()
              return (
                <div
                  key={m}
                  onClick={() => seleccionar(m)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: seleccionado ? '#f0fdf4' : 'transparent',
                    color: seleccionado ? '#166534' : '#1e293b',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                  onMouseEnter={(e) => {
                    if (!seleccionado) e.currentTarget.style.background = '#f8fafc'
                  }}
                  onMouseLeave={(e) => {
                    if (!seleccionado) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span>{m}</span>
                  {seleccionado && <Check size={14} style={{ color: '#059669' }} />}
                </div>
              )
            })
          ) : (
            <div style={{ padding: '10px 12px', fontSize: '0.84rem', color: '#64748b' }}>
              No encontramos &ldquo;{busqueda}&rdquo; en la lista, pero <strong>se guardará tal como lo escribiste</strong>.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
