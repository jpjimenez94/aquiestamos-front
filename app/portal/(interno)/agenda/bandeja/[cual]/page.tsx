import { notFound } from 'next/navigation'
import AgendaPage from '../../page'
import { buscarBandeja } from '../../bandejas'

/**
 * Una bandeja del tablero de casos, sola: /portal/agenda/bandeja/por-asignar.
 *
 * Es el mismo tablero de la agenda —mismos datos, mismas tarjetas— con una sola
 * columna a la vista. Así no hay dos tableros que mantener iguales: el día que
 * una tarjeta cambie, cambia en los dos sitios.
 */
export async function generateMetadata({ params }: { params: Promise<{ cual: string }> }) {
  const bandeja = buscarBandeja((await params).cual)
  return { title: bandeja ? `${bandeja.titulo} · Agenda` : 'Agenda' }
}

export default async function BandejaPage({ params }: { params: Promise<{ cual: string }> }) {
  const { cual } = await params
  if (!buscarBandeja(cual)) notFound()
  return <AgendaPage searchParams={Promise.resolve({ vista: 'tablero', bandeja: cual })} />
}
