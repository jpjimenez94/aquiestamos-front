import { notFound } from 'next/navigation'
import { portalFetch, usuarioActual, puede } from '@/lib/portal'
import { Cabecera, Indicador } from '../componentes'
import { TablaLideres, type LiderFila } from './TablaLideres'
import { BotonAccionesCabecera } from './BotonAccionesCabecera'
import type { CategoriaNecesidad } from './ModalLider'

export const metadata = {
  title: 'Líderes Comunitarios · Centro de Mando Operativo',
}

type SummaryData = {
  totalLideres: number
  activos: number
  totalBeneficiarios: number
  conAccionPendiente: number
  conNecesidadesPsicologicas: number
  conNecesidadesRecursos: number
}

export default async function LideresPage() {
  const usuario = await usuarioActual()

  if (!usuario || !puede(usuario, 'lideres:leer')) {
    notFound()
  }

  const esAdmin = usuario.role === 'ADMIN'

  // Consultar métricas, líderes y catálogo de necesidades
  const [resSummary, resLideres, resCatalogo] = await Promise.all([
    portalFetch<SummaryData>('/leaders/summary'),
    portalFetch<LiderFila[]>('/leaders?limit=100'),
    portalFetch<CategoriaNecesidad[]>(`/needs-catalog${esAdmin ? '?includeInactive=true' : ''}`),
  ])

  const summary = resSummary.data || {
    totalLideres: 0,
    activos: 0,
    totalBeneficiarios: 0,
    conAccionPendiente: 0,
    conNecesidadesPsicologicas: 0,
    conNecesidadesRecursos: 0,
  }

  const lideres = resLideres.data || []
  const catalogo = resCatalogo.data || []

  return (
    <>
      <Cabecera
        titulo="Centro de Mando · Líderes Comunitarios"
        descripcion="Coordinación territorial, clasificación de necesidades y seguimiento activo de comunidades."
        acciones={<BotonAccionesCabecera catalogoNecesidades={catalogo} esAdmin={esAdmin} />}
      />

      {/* Indicadores de Impacto */}
      <div className="indicadores" style={{ marginBottom: 20 }}>
        <Indicador
          cifra={summary.activos}
          etiqueta="Líderes Activos"
        />
        <Indicador
          cifra={summary.totalBeneficiarios.toLocaleString('es-CO')}
          etiqueta="Personas Impactadas"
        />
        <Indicador
          cifra={summary.conAccionPendiente}
          etiqueta="Acciones Pendientes"
          alerta={summary.conAccionPendiente > 0}
        />
        <Indicador
          cifra={summary.conNecesidadesPsicologicas}
          etiqueta="Necesidad Psicológica"
        />
        <Indicador
          cifra={summary.conNecesidadesRecursos}
          etiqueta="Necesidad de Recursos"
        />
      </div>

      {/* Tabla Principal */}
      <TablaLideres
        lideresIniciales={lideres}
        catalogoNecesidades={catalogo}
        esAdmin={esAdmin}
      />
    </>
  )
}
