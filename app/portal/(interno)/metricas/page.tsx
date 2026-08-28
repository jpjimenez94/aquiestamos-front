import { portalFetch } from '@/lib/portal'
import { Cabecera, Vacio } from '../componentes'
import { MetricasView } from './MetricasView'

export const metadata = { title: 'Métricas de impacto' }

type Metricas = {
  personas: {
    total: number
    porEstado: Record<string, number>
    porPrioridad: Record<string, number>
  }
  embudo: {
    diasPromedioHastaPrimeraPropuesta: number | null
    diasPromedioHastaElegirHora: number | null
  }
  asignaciones: {
    total: number
    aceptadas: number
    rechazadas: number
    vencidasSinRespuesta: number
    canceladasOtras: number
    tasaDeclinada: number | null
  }
  motivosDeCierre: Record<string, number>
  casosPorProfesional: { nombre: string; casos: number }[]
  citas: { porEstado: Record<string, number>; tasaAsistencia: number | null }
  telemetriaVirtual?: {
    totalSesionesVirtuales: number
    sesionesConIngreso: number
    sesionesCompletasConAmbos: number
    tasaConexionAmbos: number | null
    tasaIngresoPaciente: number | null
    tasaIngresoProfesional: number | null
    duracionPromedioMinutos: number | null
  }
  encuesta: {
    respondidas: number
    leSirvio: number
    algoLeSirvio: number
    noLeSirvio: number
    recomendaria: number
  }
}

export default async function MetricasPage() {
  const respuesta = await portalFetch<Metricas>('/dashboard/metricas')

  if (!respuesta.success || !respuesta.data) {
    return (
      <>
        <Cabecera titulo="Métricas de impacto" descripcion="" />
        <Vacio>{respuesta.message ?? 'No pudimos cargar las métricas.'}</Vacio>
      </>
    )
  }

  return (
    <>
      <Cabecera
        titulo="Métricas de impacto"
        descripcion="Los números de la red para el informe mensual: el embudo, las respuestas de los profesionales, en qué terminan los casos y telemetría de videollamadas."
      />
      <MetricasView m={respuesta.data} />
    </>
  )
}
