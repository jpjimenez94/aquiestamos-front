import Link from 'next/link'
import { Cabecera } from '../componentes'
import { ProcesosClient } from './ProcesosClient'
import { SeccionCapacitacion } from './SeccionCapacitacion'
import './procesos.css'
import './capacitacion.css'

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
            {/*
              Dos manuales, y no son el mismo documento. El técnico explica cómo
              está hecha la red; el operativo, cómo se usa —el que se le pasa a
              quien entra a coordinación el lunes—. Va primero porque es el que
              más gente necesita.
            */}
            {/*
              Lo primero de la fila: el título de la página no dice «vídeo», y
              a quien entra el lunes se le manda a ver la capacitación.
            */}
            <a className="boton-mini" href="#capacitacion" title="Las sesiones grabadas del equipo">
              ▶ Vídeos
            </a>
            <a
              className="boton-mini"
              data-tono="principal"
              href="/api/portal/manual-operativo"
              target="_blank"
              rel="noopener noreferrer"
              title="Paso a paso con pantallas: verificaciones y agendamiento"
            >
              Manual operativo
            </a>
            <a
              className="boton-mini"
              href="/api/portal/manual-procesos"
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir el documento técnico formal"
            >
              Manual técnico
            </a>
            {/* Cada manual con su descarga: «Descargar manual» a secas no decía cuál. */}
            <a
              className="boton-mini"
              href="/api/portal/manual-operativo?descargar=1"
              title="Guardar el manual operativo para imprimirlo o repartirlo"
            >
              ↓ Operativo
            </a>
            <a
              className="boton-mini"
              href="/api/portal/manual-procesos?descargar=1"
              title="Guardar el manual técnico"
            >
              ↓ Técnico
            </a>
          </span>
        }
      />

      {/*
        Primero se ve contado y después se lee. Es el orden en que alguien
        aprende algo nuevo: la sesión grabada da el recorrido completo, y el
        mapa de etapas de abajo es a donde se vuelve cuando hay una duda
        concreta con un caso delante.
      */}
      <SeccionCapacitacion />

      <ProcesosClient />
    </>
  )
}
