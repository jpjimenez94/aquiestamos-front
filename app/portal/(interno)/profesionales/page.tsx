import { portalFetch } from '@/lib/portal'
import { Cabecera, Vacio } from '../componentes'
import { TablaProfesionales, type Profesional } from './TablaProfesionales'

export const metadata = { title: 'Profesionales' }

export default async function ProfesionalesPage() {
  const respuesta = await portalFetch<Profesional[]>('/professionals')
  const profesionales = respuesta.data ?? []

  return (
    <>
      <Cabecera
        titulo="Profesionales de la red"
        descripcion="Voluntarios habilitados para acompañamiento psicológico, modalidad de atención y estado de validación legal de su tarjeta profesional."
      />

      {!respuesta.success ? (
        <Vacio>{respuesta.message ?? 'No pudimos cargar los profesionales.'}</Vacio>
      ) : profesionales.length === 0 ? (
        <Vacio>Todavía no hay profesionales registrados.</Vacio>
      ) : (
        <TablaProfesionales profesionales={profesionales} />
      )}
    </>
  )
}
