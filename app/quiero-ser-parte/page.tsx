import type { Metadata } from 'next'
import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Callout } from '@/components/ui/Callout'
import { ButtonLink } from '@/components/ui/Button'
import { VolunteerForm } from '@/components/forms/VolunteerForm'
import { whatsappHref } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Quiero ser parte',
  description:
    'Haz parte de nuestra red de profesionales y construyamos más posibilidades de acompañamiento.',
}

export default function QuieroSerPartePage() {
  return (
    <>
      <PageHeader
        cover="/images/cover-ser-parte.png"
        icon="sun"
        title="Quiero ser parte"
        crumbs={[{ href: '/quiero-ser-parte', label: 'Quiero ser parte' }]}
      >
        <p>
          Haz parte de nuestra red de profesionales y construyamos más posibilidades de
          acompañamiento.
        </p>
      </PageHeader>

      <section className="content section">
        <Callout icon="arrow-right-orange">
          <p>
            Estamos conformando una red de profesionales de psicología interesados en brindar
            acompañamiento psicológico y primeros auxilios psicológicos a familias afectadas
            por situaciones de emergencia y crisis durante los próximos cuatro meses.
          </p>
          <p>
            La información registrada será utilizada para identificar perfiles, experiencia y
            población de enfoque de los profesionales disponibles para participar en esta
            iniciativa.
          </p>
          <p>
            Gracias por poner tu conocimiento y experiencia al servicio de quienes hoy
            necesitan acompañamiento.
          </p>
        </Callout>

        <div className="button-row" style={{ margin: '24px 0 32px' }}>
          <ButtonLink href={whatsappHref} external icon={<MessageCircle size={16} />}>
            Enviar mensaje a Whatsapp
          </ButtonLink>
        </div>

        <h2 id="formulario">Diligencia el formulario</h2>
        <p className="text-muted" style={{ marginBottom: 24 }}>
          Los campos marcados con <span style={{ color: 'var(--color-red)' }}>*</span> son
          obligatorios.
        </p>

        <VolunteerForm />

        <div className="block-image" style={{ marginTop: 40 }}>
          <Image
            src="/images/ser-parte-body.png"
            alt="Ilustración de la red de profesionales"
            width={1408}
            height={768}
            sizes="(max-width: 780px) 100vw, 720px"
          />
        </div>
      </section>
    </>
  )
}
