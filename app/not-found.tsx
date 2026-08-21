import { ButtonLink } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  // El 404 global vive fuera del grupo (sitio), porque tiene que atrapar
  // también las rutas que no existen. Por eso dibuja su propia envoltura.
  return (
    <div className="page">
      <Navbar />
      <main className="page__main">
        <section
          className="content section"
          style={{ paddingTop: 80, paddingBottom: 80 }}
        >
          <h1>No encontramos esta página</h1>
          <p className="text-muted">
            Puede que el enlace haya cambiado. Desde el inicio puedes llegar a
            todo lo que tenemos disponible.
          </p>
          <div className="button-row" style={{ marginTop: 20 }}>
            <ButtonLink href="/" variant="primary">
              Volver al inicio
            </ButtonLink>
            <ButtonLink href="/recursos">Ver los recursos</ButtonLink>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
