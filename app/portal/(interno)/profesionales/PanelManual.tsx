'use client'

import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { mensajeDelManual } from '@/lib/mensajes'
import { paraWhatsapp } from '@/lib/telefono'

/** Lo que devuelve GET /api/professionals/manual. */
export type EstadoDelManual = {
  ruta: string
  habilitados: number
  yaLoRecibieron: number
  porEnviar: number
  atendiendo: { id: string; nombre: string; telefono: string | null; recibioCorreo: boolean }[]
}

/**
 * El manual de los profesionales, desde Profesionales.
 *
 * La operación pidió «una forma de enviarlo a los que ya están en la red,
 * especialmente a los que ya están atendiendo casos». A los que se aprueban
 * desde ahora les llega solo, en el correo de bienvenida; esto es para los
 * demás:
 *
 * · Un botón que lo manda por correo a todos los habilitados que aún no lo
 *   tienen. El backend no repite: pulsarlo otra vez solo le escribe a quien
 *   falte.
 * · Y a quienes atienden hoy, también por WhatsApp, que es por donde trabajan.
 *   El texto sale de Parametrización (WHATSAPP_MANUAL_PROFESIONAL).
 *
 * Sin el permiso de enviar, `estado` llega en null y queda solo abrirlo y
 * copiar el enlace.
 */
export function PanelManual({
  enlace,
  estado,
  plantilla,
}: {
  enlace: string
  estado: EstadoDelManual | null
  plantilla?: string
}) {
  const [porEnviar, setPorEnviar] = useState(estado?.porEnviar ?? 0)
  const [confirmando, setConfirmando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      setResultado({ ok: false, texto: `No se pudo copiar. El enlace es ${enlace}` })
    }
  }

  async function enviar() {
    setEnviando(true)
    setResultado(null)
    try {
      const respuesta = await fetch('/api/portal/professionals/manual/enviar', { method: 'POST' })
      const cuerpo = await respuesta.json()
      if (!respuesta.ok || !cuerpo.success) throw new Error(cuerpo.message || 'No se pudo enviar el manual.')
      // La frase se arma aquí con la cifra: el backend manda los datos, no el texto.
      const n: number = cuerpo.data?.encolados ?? 0
      setResultado({
        ok: true,
        texto:
          n === 0
            ? 'Todos los profesionales habilitados ya lo tenían.'
            : `Listo: el manual sale por correo a ${n} ${n === 1 ? 'profesional' : 'profesionales'}.`,
      })
      setPorEnviar(0)
    } catch (error) {
      setResultado({ ok: false, texto: error instanceof Error ? error.message : 'No se pudo enviar el manual.' })
    } finally {
      setEnviando(false)
      setConfirmando(false)
    }
  }

  return (
    <section className="panel" style={{ marginBottom: 18 }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0 }}>
        <BookOpen size={18} />
        Manual para profesionales
      </h2>
      <p className="panel__nota" style={{ marginTop: 0 }}>
        El manual operativo de la red, en web. A quien se aprueba desde ahora le llega solo, en el
        correo de bienvenida.
        {estado
          ? ` ${estado.yaLoRecibieron} de ${estado.habilitados} profesionales habilitados ya lo recibieron por correo.`
          : ''}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <a className="boton-mini" data-tono="principal" href={enlace} target="_blank" rel="noopener noreferrer">
          Abrir el manual
        </a>
        <button className="boton-mini" type="button" onClick={copiar}>
          {copiado ? 'Enlace copiado' : 'Copiar enlace'}
        </button>

        {estado && porEnviar > 0 && !confirmando ? (
          <button className="boton-mini" type="button" onClick={() => setConfirmando(true)}>
            Enviar por correo a {porEnviar} {porEnviar === 1 ? 'profesional' : 'profesionales'}
          </button>
        ) : null}

        {confirmando ? (
          <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span className="tabla__secundario">
              Le llega una sola vez a cada habilitado que todavía no lo tiene.
            </span>
            <button className="boton-mini" data-tono="principal" type="button" onClick={enviar} disabled={enviando}>
              {enviando ? 'Enviando…' : 'Sí, enviar'}
            </button>
            <button className="boton-mini" type="button" onClick={() => setConfirmando(false)} disabled={enviando}>
              Cancelar
            </button>
          </span>
        ) : null}
      </div>

      {resultado ? (
        <p role="status" style={{ margin: '10px 0 0', color: resultado.ok ? '#065f46' : '#b91c1c' }}>
          {resultado.texto}
        </p>
      ) : null}

      {estado && estado.atendiendo.length > 0 ? (
        <details style={{ marginTop: 14 }}>
          <summary style={{ cursor: 'pointer' }}>
            <strong>Están atendiendo hoy · {estado.atendiendo.length}</strong>
            <span className="tabla__secundario"> — mándaselo también por WhatsApp</span>
          </summary>
          <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'grid', gap: 6 }}>
            {estado.atendiendo.map((p) => {
              const numero = paraWhatsapp(p.telefono)
              const texto = mensajeDelManual({ profesional: p.nombre, enlace, plantilla })
              return (
                <li key={p.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <span>{p.nombre}</span>
                  {p.recibioCorreo ? <span className="tabla__secundario">· ya tiene el correo</span> : null}
                  {numero ? (
                    <a
                      className="boton-mini"
                      href={`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  ) : (
                    <span className="tabla__secundario">· sin teléfono</span>
                  )}
                </li>
              )
            })}
          </ul>
        </details>
      ) : null}
    </section>
  )
}
