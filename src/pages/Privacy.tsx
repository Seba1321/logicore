import { CornerTicks } from "@/components/portal/technical";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { SectionHeader } from "@/components/sections/shared";
import { usePageMeta } from "@/hooks/use-page-meta";

const Privacy = () => {
  usePageMeta({
    title: "Política de privacidad",
    description:
      "Política de privacidad de Methodical: qué datos recolectamos, cómo los usamos y cómo contactarnos.",
    canonical: "https://methodical.cl/privacidad",
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header />
      <section className="relative overflow-hidden bg-[#03060f] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#03060f_0%,#071330_55%,#0c2a78_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />

        <div className="container-tight relative pb-16 pt-32 md:pb-20 md:pt-40">
          <SectionHeader
            index="—"
            eyebrow="Legal"
            title="Política de privacidad"
            lead="Cómo recolectamos, usamos y protegemos la información que compartes con nosotros."
            tone="dark"
          />
        </div>
      </section>

      <main className="container-tight py-20 md:py-24">
        <article className="relative mx-auto max-w-3xl space-y-10 rounded-sm border border-slate-200 bg-white p-8 md:p-12">
          <CornerTicks className="text-slate-200" />

          <Block title="01 — Información que recolectamos">
            Cuando completas el formulario de contacto de nuestro sitio recolectamos los datos
            que tú mismo nos entregas: nombre, empresa (opcional), correo electrónico y el
            contenido del mensaje. Si accedes al portal de clientes, usamos las credenciales que
            te entrega nuestro equipo y un token de sesión temporal.
          </Block>

          <Block title="02 — Cómo usamos tu información">
            Usamos estos datos exclusivamente para responder a tu consulta, dar continuidad a la
            relación comercial y entregar acceso al portal cuando corresponde. No vendemos ni
            compartimos información con terceros con fines de marketing.
          </Block>

          <Block title="03 — Proveedores que usamos">
            Para operar el sitio y el portal trabajamos con proveedores que cumplen estándares
            internacionales de seguridad: Supabase para almacenamiento y autenticación, EmailJS
            para el envío del formulario de contacto, y servicios estándar de hosting estático.
          </Block>

          <Block title="04 — Tus derechos">
            Puedes solicitar en cualquier momento conocer, rectificar o eliminar la información
            que tenemos sobre ti escribiéndonos a{" "}
            <a href="mailto:contacto@methodical.cl" className="text-blue-700 hover:underline">
              contacto@methodical.cl
            </a>
            . Responderemos en un plazo máximo de 30 días.
          </Block>

          <Block title="05 — Contacto">
            Methodical · Santiago, Chile.
            <br />
            Email:{" "}
            <a href="mailto:contacto@methodical.cl" className="text-blue-700 hover:underline">
              contacto@methodical.cl
            </a>
          </Block>

          <p className="border-t border-slate-100 pt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
            Última actualización · {new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
};

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="border-t border-slate-100 pt-8 first:border-t-0 first:pt-0">
    <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-blue-600">{title}</h2>
    <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-base">{children}</p>
  </section>
);

export default Privacy;
