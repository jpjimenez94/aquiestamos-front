'use client'

import { useState } from 'react'
import { aceptarDesistimientoAction } from './actions'
import { LINEAS_EMERGENCIA } from '@/lib/consentimiento'

/**
 * El formulario con el que alguien deja dicho que no quiere continuar.
 *
 * Dos cosas deliberadas, porque es una pantalla delicada:
 *
 * El texto NO se escribe aquí: llega del backend, que es quien lo guarda
 * entero con la constancia. Si viviera en este archivo, lo que la persona ve
 * y lo que queda archivado podrían dejar de coincidir —y lo archivado es lo
 * único que después se puede mostrar—.
 *
 * El motivo es opcional y se dice así. A quien desiste no se le pide que se
 * explique: desistir es su derecho, no una falta que haya que justificar.
 */

function Lineas() {
  return (
    <div className="tamizaje__lineas">
      {LINEAS_EMERGENCIA.map((linea) => (
        <a className="tamizaje__linea" href={linea.href} key={linea.numero}>
          {linea.nombre} <span>{linea.numero}</span>
        </a>
      ))}
    </div>
  )
}

export function FormularioDesistimiento({
  token,
  texto,
  yaCerrado,
  constancia,
}: {
  token: string
  texto: string
  yaCerrado: boolean
  constancia: { firmadaEl: string; nombre: string } | null
}) {
  const [listo, setListo] = useState(yaCerrado)
  const [acepta, setAcepta] = useState(false)
  const [nombre, setNombre] = useState('')
  const [firmo, setFirmo] = useState<string | null>(constancia?.nombre ?? null)
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (listo) {
    return (
      <div className="tamizaje__gracias" role="status">
        <svg
          className="tamizaje__gracias-icono"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2>Quedó registrado</h2>
        <p>
          Tu caso está cerrado y no te vamos a seguir escribiendo.
          {firmo ? ` Lo aceptaste como ${firmo}.` : ''}
        </p>
        <p style={{ marginTop: 10 }}>
          Si algún día quieres retomar, escríbenos: te atendemos igual que la primera vez. Y si
          en algún momento sientes que estás en peligro, estos teléfonos no dependen de
          nosotros y están siempre:
        </p>
        <Lineas />
      </div>
    )
  }

  async function aceptar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!acepta) {
      setError('Marca la casilla si quieres cerrar tu caso.')
      return
    }
    if (nombre.trim().length < 5) {
      setError('Escribe tu nombre completo: esa es tu firma.')
      return
    }

    setEnviando(true)
    try {
      const d = await aceptarDesistimientoAction(token, {
        nombre: nombre.trim(),
        motivo: motivo.trim() || undefined,
      })
      if (!d.success) {
        setError(d.message)
        return
      }
      setFirmo(nombre.trim())
      setListo(true)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <p className="tamizaje__intro">
        Nos dijiste que por ahora no quieres continuar con el acompañamiento. Está bien, y no
        tienes que dar explicaciones. Solo necesitamos que lo confirmes tú, aquí, para cerrar tu
        caso y dejar de escribirte.
      </p>

      <form className="tamizaje__form" onSubmit={aceptar} noValidate>
          {texto
          .split(/\n\s*\n/)
          .map((parrafo) => parrafo.trim())
          .filter(Boolean)
          .map((parrafo) => (
            <p className="tamizaje__aclaracion" style={{ margin: 0 }} key={parrafo.slice(0, 40)}>
              {parrafo}
            </p>
          ))}
  
        <Lineas />
  
        <label className="tamizaje__autorizacion">
          <input
            type="checkbox"
            checked={acepta}
            onChange={(e) => {
              setAcepta(e.target.checked)
              setError(null)
            }}
          />
          <span>Leí lo anterior y, por mi propia voluntad, decido no continuar.</span>
        </label>
  
        <div>
          <label className="field__label" htmlFor="firma">
            Tu nombre completo *
          </label>
          <p className="tamizaje__ayuda" style={{ marginLeft: 0 }}>
            Escribirlo aquí es tu firma.
          </p>
          <input
            id="firma"
            className="input"
            value={nombre}
            maxLength={160}
            onChange={(e) => {
              setNombre(e.target.value)
              setError(null)
            }}
          />
        </div>
  
        <div>
          <label className="field__label" htmlFor="motivo">
            ¿Quieres contarnos por qué? (opcional)
          </label>
          <p className="tamizaje__ayuda" style={{ marginLeft: 0 }}>
            No hace falta. Si lo escribes, nos sirve para hacerlo mejor con quien venga después.
          </p>
          <textarea
            id="motivo"
            className="input"
            rows={3}
            value={motivo}
            maxLength={600}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>
  
        {error ? (
          <p className="tamizaje__error" role="alert">
            {error}
          </p>
        ) : null}
  
        <button className="tamizaje__enviar" type="submit" disabled={enviando}>
          {enviando ? 'Registrando…' : 'Aceptar y cerrar mi caso'}
        </button>
  
        <p className="tamizaje__nota">
          Si abriste esto por error, cierra la página sin más: no se cierra nada hasta que toques
          el botón.
        </p>
      </form>
    </>
  )
}
