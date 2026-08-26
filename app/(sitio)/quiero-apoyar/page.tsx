import type { Metadata } from 'next'
import { MessageCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Callout } from '@/components/ui/Callout'
import { ButtonLink } from '@/components/ui/Button'
import { CollaboratorForm } from '@/components/forms/CollaboratorForm'
import { site, whatsappHref } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Quiero ser voluntario general · Red Aquí Estamos',
  description:
    'Súmate al voluntariado de la red desde tu disciplina: salud, logística, derecho, comunicación, tecnología, gestión y más.',
}

export default function QuieroApoyarPage() {
  return (
    <>
      <PageHeader
        cover="/images/cover-ser-parte.png"
        icon="sun"
        title="Quiero ser voluntario general"
        crumbs={[{ href: '/quiero-apoyar', label: 'Quiero ser voluntario general' }]}
      >
        <p>
          Una emergencia no se atiende solo desde la psicología. Súmate desde lo que
          sabes hacer.
        </p>
      </PageHeader>

      <section className="content section">
        <div style={{ marginTop: 24, marginBottom: 20 }}>
          <Callout icon="arrow-right-orange">
            <p style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.5 }}>
              <strong>Directorio de Voluntariado Multidisciplinario.</strong> Si quieres aportar desde
              salud y primeros auxilios, logística, derecho, trabajo social, comunicación, tecnología
              o gestión de proyectos, déjanos tus datos. Cuando surja una brigada o necesidad concreta,
              el equipo de coordinación te contactará. Registrarte toma 2 minutos y no te compromete a nada.
            </p>
          </Callout>
        </div>

        <div className="button-row" style={{ margin: '16px 0 28px' }}>
          <ButtonLink href={whatsappHref} external icon={<MessageCircle size={16} />}>
            ¿Tienes dudas? Escríbenos al WhatsApp {site.whatsappDisplay}
          </ButtonLink>
        </div>

        <CollaboratorForm />
      </section>
    </>
  )
}
