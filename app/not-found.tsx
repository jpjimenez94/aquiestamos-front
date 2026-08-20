import { ButtonLink } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <section className="content section" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <h1>No encontramos esta página</h1>
      <p className="text-muted">
        Puede que el enlace haya cambiado. Desde el inicio puedes llegar a todo lo que
        tenemos disponible.
      </p>
      <div className="button-row" style={{ marginTop: 20 }}>
        <ButtonLink href="/" variant="primary">
          Volver al inicio
        </ButtonLink>
        <ButtonLink href="/recursos">Ver los recursos</ButtonLink>
      </div>
    </section>
  )
}
