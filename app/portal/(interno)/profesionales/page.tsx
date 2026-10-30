import { portalFetch, puede, traerPlantillas, usuarioActual } from '@/lib/portal'
import { site } from '@/lib/site'
import { RUTA_DEL_MANUAL } from '@/lib/manualProfesionales'
import { Cabecera, Vacio } from '../componentes'
import { TablaProfesionales, type Profesional } from './TablaProfesionales'
import { PanelManual, type EstadoDelManual } from './PanelManual'

export const metadata = { title: 'Profesionales' }

export default async function ProfesionalesPage() {
  const [respuesta, usuario, plantillas] = await Promise.all([
    portalFetch<Profesional[]>('/professionals'),
    usuarioActual(),
    traerPlantillas(),
  ])
  const profesionales = respuesta.data ?? []

  // Quién tiene el manual y quién atiende hoy: solo para quien puede mandarlo.
  const manual = puede(usuario, 'profesional:enviar-manual')
    ? await portalFetch<EstadoDelManual>('/professionals/manual')
    : null

  return (
    <>
      <Cabecera
        titulo="Profesionales de la red"
        descripcion="Voluntarios habilitados para acompañamiento psicológico, modalidad de atención y estado de validación legal de su tarjeta profesional."
      />

      <PanelManual
        enlace={`${site.url}${RUTA_DEL_MANUAL}`}
        estado={manual?.success ? (manual.data ?? null) : null}
        plantilla={plantillas.WHATSAPP_MANUAL_PROFESIONAL}
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
