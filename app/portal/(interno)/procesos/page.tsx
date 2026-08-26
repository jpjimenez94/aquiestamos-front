import Link from 'next/link'
import { Cabecera } from '../componentes'
import { ProcesosClient } from './ProcesosClient'
import './procesos.css'

export const metadata = { title: 'Cómo funciona la red' }

/**
 * La guía y manual de procesos dentro del portal.
 * Accesible por cualquier rol autenticado (incluido LECTURA).
 */
export default function ProcesosPage() {
  return (
    <>
      <Cabecera
        titulo="Cómo funciona la red"
        descripcion="Arquitectura de procesos y flujos operativos de la Red Aquí Estamos: quién hace qué, qué corre de forma automática y qué se espera en cada tramo."
        acciones={
          <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
            <a
              className="boton-mini"
              href="/api/portal/manual-procesos"
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir el documento técnico formal"
            >
              Manual técnico
            </a>
            <a
              className="boton-mini"
              href="/api/portal/manual-procesos?descargar=1"
              title="Descargar archivo en PDF / HTML"
            >
              Descargar manual
            </a>
          </span>
        }
      />

      <ProcesosClient />
    </>
  )
}
