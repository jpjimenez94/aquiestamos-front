import type { Metadata } from 'next'
import { MessageCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Callout } from '@/components/ui/Callout'
import { ButtonLink } from '@/components/ui/Button'
import { AvisoEmergencia } from '@/components/ui/AvisoEmergencia'
import { SupportRequestForm } from '@/components/forms/SupportRequestForm'
import { site, whatsappHref } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Atención Psicológica',
  description: 'Déjanos tus datos y pronto te contactaremos.',
}

export default function AtencionPsicologicaPage() {
  return (
    <>
      <PageHeader
        cover="/images/cover-atencion.png"
        icon="arrow-right-blue"
        title="Atención Psicológica"
        crumbs={[{ href: '/atencion-psicologica', label: 'Atención Psicológica' }]}
      >
        <p>Déjanos tus datos y pronto te contactaremos</p>
      </PageHeader>

      <section className="content section">
        {/* Lo primero de la página: quien está en crisis no debe tener que leer nada más. */}
        {/* <AvisoEmergencia /> */}

        <div style={{ marginTop: 28 }}>
          <Callout icon="heart">
            <p style={{ margin: 0 }}>
              Déjanos tus datos para poder contactarte en el menor tiempo posible y que
              puedas recibir acompañamiento de nuestros profesionales. Son unas pocas
              preguntas y casi todas se responden marcando una opción.
            </p>
          </Callout>
        </div>

        <div className="button-row" style={{ margin: '24px 0 32px' }}>
          <ButtonLink href={whatsappHref} external icon={<MessageCircle size={16} />}>
            Prefiero escribir por WhatsApp {site.whatsappDisplay}
          </ButtonLink>
        </div>

        <h2 id="formulario">Déjanos tus datos</h2>
        <p className="text-muted" style={{ marginBottom: 24 }}>
          Los campos marcados con <span style={{ color: 'var(--color-red)' }}>*</span> son
          obligatorios.
        </p>

        <SupportRequestForm />
      </section>
    </>
  )
}
