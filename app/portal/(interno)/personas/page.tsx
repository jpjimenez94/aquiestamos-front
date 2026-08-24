import Link from 'next/link'
import { portalFetch, enBogota } from '@/lib/portal'
import { Cabecera, Etiqueta, Vacio } from '../componentes'
import { BotonSeguimientoWhatsApp } from './BotonSeguimientoWhatsApp'
import { ModalSeguimientoGeneral } from './ModalSeguimientoGeneral'
import { UserCheck } from 'lucide-react'
import { nombrePropio } from '@/lib/nombre'

export const metadata = { title: 'Personas acompañadas' }

type Persona = {
  id: string
  fullName: string
  phone: string
  city: string
  isMinor: boolean
  preferredModality: string | null
  availableDays: string[]
  availableSlots: string[]
  status: string
  estadoLegible: string
  priority: string
  prioridadLegible: string
  createdAt: string
  diasEsperando: number
  asignacion: {
    id: string
    desde: string
    profesional: {
      id: string
      nombre: string
      telefono?: string
      email?: string
    }
  } | null
}

const DIA_CORTO: Record<string, string> = {
  LUNES: 'Lu',
  MARTES: 'Ma',
  MIERCOLES: 'Mi',
  JUEVES: 'Ju',
  VIERNES: 'Vi',
  SABADO: 'Sa',
  DOMINGO: 'Do',
}

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<{ sinAsignar?: string }>
}) {
  // El enlace del caso sale de la configuración del sitio, no del navegador:
  // misma cicatriz que el tamizaje y la ficha.
  const enlaceDelSitio = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
  const { sinAsignar } = await searchParams
  const filtro = sinAsignar === 'true'

  const respuesta = await portalFetch<Persona[]>(
    filtro ? '/patients?sinAsignar=true' : '/patients',
  )
  const personas = respuesta.data ?? []

  const casosAsignados = personas
    .filter((p) => p.asignacion && p.asignacion.profesional)
    .map((p) => ({
      pacienteNombre: p.fullName,
      pacienteTelefono: p.phone,
      profesionalNombre: p.asignacion!.profesional.nombre,
      profesionalTelefono: p.asignacion!.profesional.telefono,
    }))

  return (
    <>
      <Cabecera
        titulo="Personas acompañadas"
        descripcion={
          filtro
            ? 'Admitidas que todavía no tienen profesional asignado. Las que llevan más tiempo esperando, primero.'
            : 'Todas las personas admitidas en la red y su asignación profesional.'
        }
        acciones={
          <>
            <ModalSeguimientoGeneral casos={casosAsignados} />
            <Link
              className="boton-mini"
              data-tono={filtro ? undefined : 'principal'}
              href="/portal/personas"
            >
              Todas
            </Link>
            <Link
              className="boton-mini"
              data-tono={filtro ? 'principal' : undefined}
              href="/portal/personas?sinAsignar=true"
            >
              Sin asignar
            </Link>
          </>
        }
      />

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar las personas.'}</Vacio>
      ) : personas.length === 0 ? (
        <Vacio>
          {filtro ? 'Nadie está esperando asignación. ' : 'Todavía no hay personas admitidas. '}
          {filtro ? 'Buen momento.' : 'Admite una solicitud para empezar.'}
        </Vacio>
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Persona Acompañada</th>
                <th>Profesional Asignado</th>
                <th>Ciudad</th>
                <th>Disponibilidad</th>
                <th>Esperando</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {personas.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/portal/personas/${p.id}`} className="tabla__principal">
                      {nombrePropio(p.fullName)}
                    </Link>
                    <span className="tabla__secundario">
                      {p.phone}
                      {p.isMinor ? ' · menor de edad' : ''}
                      {p.preferredModality ? ` · ${p.preferredModality.toLowerCase()}` : ''}
                    </span>
                  </td>

                  {/* Profesional Asignado */}
                  <td>
                    {p.asignacion?.profesional ? (
                      <div>
                        <Link
                          href={`/portal/profesionales/${p.asignacion.profesional.id}`}
                          style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <UserCheck size={14} style={{ color: '#059669' }} />
                          {p.asignacion.profesional.nombre}
                        </Link>
                        {p.asignacion.profesional.telefono && (
                          <span className="tabla__secundario">
                            Tel: {p.asignacion.profesional.telefono}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="tabla__secundario" style={{ color: '#d97706' }}>
                        — Sin asignar —
                      </span>
                    )}
                  </td>

                  <td>{p.city}</td>

                  <td className="tabla__secundario" style={{ marginTop: 0 }}>
                    {p.availableDays?.length
                      ? p.availableDays.map((d) => DIA_CORTO[d] ?? d).join(' ')
                      : '—'}
                  </td>

                  <td className="tabla__numero">
                    {p.diasEsperando} {p.diasEsperando === 1 ? 'día' : 'días'}
                    <span className="tabla__secundario">{enBogota(p.createdAt, false)}</span>
                  </td>

                  <td>
                    <Etiqueta estado={p.priority} texto={p.prioridadLegible} />
                  </td>

                  <td>
                    <Etiqueta estado={p.status} texto={p.estadoLegible} />
                  </td>

                  <td className="tabla__acciones">
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
                      {p.asignacion?.profesional && (
                        <BotonSeguimientoWhatsApp
                          pacienteNombre={p.fullName}
                          pacienteTelefono={p.phone}
                          profesionalNombre={p.asignacion.profesional.nombre}
                          profesionalTelefono={p.asignacion.profesional.telefono}
                          enlaceCaso={`${enlaceDelSitio}/portal/caso/${p.id}`}
                        />
                      )}
                      <Link className="boton-mini" href={`/portal/personas/${p.id}`}>
                        Abrir
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
