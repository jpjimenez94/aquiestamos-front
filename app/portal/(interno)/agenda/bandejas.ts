/**
 * Las bandejas del tablero de casos, en el orden del camino de cada caso.
 *
 * La operación pidió tenerlas en el menú de Agenda, una por una, y que al
 * pulsar una se vea solo lo de ese paso: quien está llamando a los que no
 * contestan no necesita las otras seis columnas delante.
 *
 * Es un módulo sin servidor ni cliente a propósito: lo leen el menú lateral
 * (cliente) y la página de la agenda (servidor).
 */

export const BANDEJAS = [
  {
    id: 'por-asignar',
    menu: '1. Por asignar',
    titulo: 'Por asignar',
    descripcion: 'Personas admitidas que esperan que se les asigne profesional.',
  },
  {
    id: 'falta-hora',
    menu: '2. Falta que elija hora',
    titulo: 'Asignadas · falta que elija hora',
    descripcion: 'Ya tienen profesional; falta que la persona elija su hora con el enlace.',
  },
  {
    id: 'falta-confirmar',
    menu: '3. Falta confirmar',
    titulo: 'Agendadas · falta confirmar',
    descripcion: 'Hay hora; falta el sí de la persona.',
  },
  {
    id: 'confirmadas',
    menu: '4. Citas confirmadas',
    titulo: 'Citas confirmadas',
    descripcion: 'Citas confirmadas que todavía están por delante.',
  },
  {
    id: 'acompanamiento',
    menu: '5. En acompañamiento',
    titulo: 'En acompañamiento / seguimiento',
    descripcion: 'Personas que ya están en acompañamiento con su profesional.',
  },
  {
    id: 'no-contestan',
    menu: 'No contestan',
    titulo: 'No contestan',
    descripcion: 'Personas a las que no se ha logrado contactar: hay que volver a llamar o conseguir otro teléfono.',
  },
  {
    id: 'cerrados',
    menu: 'Cerrados recientes',
    titulo: 'Cerrados recientes',
    descripcion: 'Los últimos casos cerrados.',
  },
] as const

export type Bandeja = (typeof BANDEJAS)[number]
export type IdBandeja = Bandeja['id']

export function buscarBandeja(id: string | undefined): Bandeja | null {
  return BANDEJAS.find((b) => b.id === id) ?? null
}

/** La dirección de cada bandeja: una página propia, para poder guardarla y para que el menú la marque. */
export const rutaDeBandeja = (id: IdBandeja) => `/portal/agenda/bandeja/${id}`
