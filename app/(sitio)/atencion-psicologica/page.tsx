import type { Metadata } from 'next'
import { MessageCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Callout } from '@/components/ui/Callout'
import { ButtonLink } from '@/components/ui/Button'
import { SupportRequestForm } from '@/components/forms/SupportRequestForm'
import { site, whatsappHref } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Necesito ayuda · Atención Psicológica',
  description: 'Solicita acompañamiento psicológico gratuito con profesionales voluntarios de la Red Aquí Estamos.',
}

export default function AtencionPsicologicaPage() {
  return (
    <>
      <PageHeader
        cover="/images/cover-atencion.png"
        icon="arrow-right-blue"
        title="Necesito ayuda"
        crumbs={[{ href: '/atencion-psicologica', label: 'Necesito ayuda' }]}
      >
        <p>Acompañamiento psicológico y apoyo emocional</p>
      </PageHeader>

      <section className="content section">
        <div style={{ marginTop: 24, marginBottom: 20 }}>
          <Callout icon="heart">
            <p style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.5 }}>
              <strong>Estamos contigo.</strong> Este formulario toma menos de 2 minutos y casi todas las
              preguntas se responden con un solo toque. Tus respuestas son estrictamente confidenciales y nos
              permiten conectarte con un profesional voluntario de acuerdo a tu urgencia.
            </p>
          </Callout>
        </div>

        <div className="button-row" style={{ margin: '16px 0 28px' }}>
          <ButtonLink href={whatsappHref} external icon={<MessageCircle size={16} />}>
            Prefiero escribir directamente por WhatsApp {site.whatsappDisplay}
          </ButtonLink>
        </div>

        <SupportRequestForm />
      </section>
    </>
  )
}
