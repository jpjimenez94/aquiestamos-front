'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ModalConsentimiento } from '@/components/portal/ModalConsentimiento'
import { ModalReprogramar } from '@/components/portal/ModalReprogramar'
import { ModalTarjetaProfesional } from '@/components/portal/ModalTarjetaProfesional'
import { CalendarClock, FileCheck2, ShieldCheck } from 'lucide-react'

const ETIQUETA: Record<string, string> = {
  CONFIRMADA: 'Confirmar Cita',
  REALIZADA: 'Marcar como Realizada',
  NO_ASISTIO: 'Marcar que No Asistió',
  CANCELADA: 'Cancelar Cita',
  REPROGRAMADA: 'Reprogramar',
}

export function AccionesCita({
  citaId,
  estado,
  siguientesEstados,
  profesionalId,
  profesionalNombre,
  profesionalVerificado,
  profesionalTarjetaNumero,
  profesionalDocumentoUrl,
  pacienteNombre,
  modalidad,
  consentSigned,
  consentSignedDocumentUrl,
  consentSignedAt,
}: {
  citaId: string
  estado: string
  siguientesEstados: string[]
  profesionalId: string
  profesionalNombre: string
  profesionalVerificado: boolean
  profesionalTarjetaNumero?: string
  profesionalDocumentoUrl?: string
  pacienteNombre: string
  modalidad: string
  consentSigned: boolean
  consentSignedDocumentUrl?: string
  consentSignedAt?: string | null
}) {
  const router = useRouter()
  const [cargando, setCargando] = useState<string | null>(null)
  const [motivo, setMotivo] = useState('')
  const [pidiendoMotivo, setPidiendoMotivo] = useState(false)
  const [aviso, setAviso] = useState<{ tono: string; texto: string } | null>(null)

  // Modales
  const [modalConsentimientoAbierto, setModalConsentimientoAbierto] = useState(false)
  const [modalReprogramarAbierto, setModalReprogramarAbierto] = useState(false)
  const [modalTarjetaAbierto, setModalTarjetaAbierto] = useState(false)

  async function cambiar(nuevo: string, motivoTexto?: string) {
    setCargando(nuevo)
    setAviso(null)
    try {
      const respuesta = await fetch(`/api/portal/appointments/${citaId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevo, motivo: motivoTexto }),
      })
      const datos = await respuesta.json()

      if (!respuesta.ok || !datos.success) {
        setAviso({ tono: 'rojo', texto: datos.message ?? 'No se pudo cambiar el estado' })
        return
      }

      setPidiendoMotivo(false)
      setMotivo('')
      router.refresh()
    } catch {
      setAviso({ tono: 'rojo', texto: 'No pudimos conectarnos con el servidor' })
    } finally {
      setCargando(null)
    }
  }

  const posibles = siguientesEstados.filter((e) => e !== 'REPROGRAMADA')

  return (
    <>
      <div className="panel">
        <h2>Acciones y Gestión de la Cita</h2>
        <p className="panel__nota">
          Gestiona el estado de la cita, registra requisitos legales o reprograma la sesión.
        </p>

        {aviso ? (
          <div className="aviso-portal" data-tono={aviso.tono}>
            {aviso.texto}
          </div>
        ) : null}

        {/* Botones de Gestión Especiales */}
        <div className="button-row" style={{ marginBottom: 16, borderBottom: '1px solid var(--color-border-default, #e2e8f0)', paddingBottom: 16 }}>
          <button
            type="button"
            className="boton-mini"
            data-tono="principal"
            onClick={() => setModalConsentimientoAbierto(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <FileCheck2 size={15} />
            {consentSigned ? 'Ver Consentimiento' : 'Registrar Consentimiento Firmado'}
          </button>

          <button
            type="button"
            className="boton-mini"
            onClick={() => setModalTarjetaAbierto(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ShieldCheck size={15} />
            {profesionalVerificado ? 'Ver Tarjeta Profesional' : 'Verificar Tarjeta Profesional'}
          </button>

          {estado !== 'CANCELADA' && estado !== 'REALIZADA' && (
            <button
              type="button"
              className="boton-mini"
              onClick={() => setModalReprogramarAbierto(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <CalendarClock size={15} />
              Reprogramar Cita
            </button>
          )}
        </div>

        {/* Transiciones de Estado */}
        {posibles.length === 0 ? (
          <p className="panel__nota" style={{ margin: 0 }}>
            Esta cita está en estado <strong>{estado.toLowerCase()}</strong> y ya no se pueden aplicar cambios de estado adicionales.
          </p>
        ) : pidiendoMotivo ? (
          <div style={{ marginBottom: 14 }}>
            <label className="field__label" htmlFor="motivo-cancelacion">
              ¿Por qué se cancela la cita?
            </label>
            <input
              id="motivo-cancelacion"
              className="input"
              value={motivo}
              placeholder="Ej. La persona solicitó cancelación o no puede asistir"
              onChange={(e) => setMotivo(e.target.value)}
            />
            <div className="button-row" style={{ marginTop: 10 }}>
              <button
                className="boton-mini"
                data-tono="peligro"
                disabled={!motivo.trim() || cargando !== null}
                onClick={() => cambiar('CANCELADA', motivo.trim())}
                type="button"
              >
                {cargando ? 'Cancelando…' : 'Confirmar cancelación'}
              </button>
              <button className="boton-mini" onClick={() => setPidiendoMotivo(false)} type="button">
                Volver
              </button>
            </div>
          </div>
        ) : (
          <div className="button-row">
            {posibles.map((siguiente) =>
              siguiente === 'CANCELADA' ? (
                <button
                  className="boton-mini"
                  data-tono="peligro"
                  key={siguiente}
                  onClick={() => setPidiendoMotivo(true)}
                  type="button"
                >
                  Cancelar Cita
                </button>
              ) : (
                <button
                  className="boton-mini"
                  data-tono={siguiente === 'CONFIRMADA' ? 'principal' : undefined}
                  key={siguiente}
                  disabled={cargando !== null}
                  onClick={() => cambiar(siguiente)}
                  type="button"
                >
                  {cargando === siguiente ? 'Guardando…' : (ETIQUETA[siguiente] ?? siguiente)}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      <ModalConsentimiento
        citaId={citaId}
        pacienteNombre={pacienteNombre}
        consentSignedActual={consentSigned}
        consentSignedDocumentUrlActual={consentSignedDocumentUrl}
        consentSignedAtActual={consentSignedAt}
        abierto={modalConsentimientoAbierto}
        onCerrar={() => setModalConsentimientoAbierto(false)}
      />

      <ModalReprogramar
        citaId={citaId}
        profesionalId={profesionalId}
        profesionalNombre={profesionalNombre}
        pacienteNombre={pacienteNombre}
        modalidadActual={modalidad}
        abierto={modalReprogramarAbierto}
        onCerrar={() => setModalReprogramarAbierto(false)}
      />

      <ModalTarjetaProfesional
        profesionalId={profesionalId}
        profesionalNombre={profesionalNombre}
        numeroActual={profesionalTarjetaNumero}
        documentoUrlActual={profesionalDocumentoUrl}
        verificadaActual={profesionalVerificado}
        abierto={modalTarjetaAbierto}
        onCerrar={() => setModalTarjetaAbierto(false)}
      />
    </>
  )
}
