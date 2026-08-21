import type { Metadata } from 'next'
import { MessageCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Callout } from '@/components/ui/Callout'
import { ButtonLink } from '@/components/ui/Button'
import { CollaboratorForm } from '@/components/forms/CollaboratorForm'
import { whatsappHref } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Quiero ser voluntario general',
  description:
    'Súmate al voluntariado de la red desde tu disciplina: salud, logística, derecho, comunicación, gestión y más.',
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
        <Callout icon="arrow-right-orange">
          <p>
            Este formulario es para quienes quieren aportar desde una disciplina distinta
            al acompañamiento psicológico: salud y primeros auxilios, trabajo social y
            derecho, logística y transporte, comunicación y tecnología, gestión de
            proyectos, y cualquier otro oficio que pueda hacer falta.
          </p>
          <p>
            Con lo que registres armamos un directorio del voluntariado de la red. Cuando
            aparezca una necesidad que encaje con lo que sabes hacer, te buscamos y te
            escribimos. Registrarte no te compromete a nada.
          </p>
          <p>
            Si eres profesional de psicología, psiquiatría o trabajo social y quieres
            acompañar a personas en crisis, el formulario que te corresponde es{' '}
            <a href="/quiero-ser-parte">Quiero dar apoyo psicológico</a>.
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

        <CollaboratorForm />
      </section>
    </>
  )
}
