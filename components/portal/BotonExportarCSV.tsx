'use client'

import { Download } from 'lucide-react'

type CitaCSV = {
  id: string
  inicioLocal: string
  finLocal: string
  pacienteNombre?: string
  profesionalNombre?: string
  modalidad: string
  estado: string
  estadoLegible: string
  consentSigned?: boolean
  motivoCancelacion?: string | null
}

export function BotonExportarCSV({ citas, filename = 'historial-agenda.csv' }: { citas: CitaCSV[]; filename?: string }) {
  function exportar() {
    if (!citas.length) return

    const encabezados = [
      'ID Cita',
      'Fecha y Hora Inicio',
      'Fecha y Hora Fin',
      'Persona Acompañada (Paciente)',
      'Profesional / Psicólogo',
      'Modalidad',
      'Estado',
      'Consentimiento Firmado',
      'Motivo de Cancelación',
    ]

    const filas = citas.map((c) => [
      c.id,
      `"${c.inicioLocal}"`,
      `"${c.finLocal}"`,
      `"${c.pacienteNombre ?? '—'}"`,
      `"${c.profesionalNombre ?? '—'}"`,
      c.modalidad,
      c.estadoLegible,
      c.consentSigned ? 'SÍ' : 'NO',
      `"${c.motivoCancelacion ?? ''}"`,
    ])

    const contenido = [encabezados.join(','), ...filas.map((f) => f.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button
      type="button"
      className="boton-mini"
      onClick={exportar}
      disabled={!citas.length}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
    >
      <Download size={14} />
      Exportar CSV
    </button>
  )
}
