import { redirect } from 'next/navigation'

/**
 * La capacitación se mudó dentro de «Cómo funciona la red».
 *
 * Tuvo página propia un rato y era un sitio de más: quien busca cómo se hace
 * algo no tiene por qué saber que está repartido en dos puntos del menú. Esta
 * ruta se queda para que no se rompan los enlaces que ya se mandaron por
 * WhatsApp ni los botones que apuntaban aquí.
 */
export default function CapacitacionPage() {
  redirect('/portal/procesos#capacitacion')
}
