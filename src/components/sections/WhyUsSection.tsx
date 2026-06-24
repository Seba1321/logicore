import { Briefcase, Building2, Lightbulb, Users } from "lucide-react";

import { CornerTicks, Reveal } from "@/components/portal/technical";
import { SectionHeader } from "./shared";

const reasons = [
  {
    number: "01",
    icon: Building2,
    title: "Enfoque en PYMEs",
    description:
      "Entendemos los desafíos de empresas en crecimiento. Soluciones a tu medida, no paquetes genéricos.",
  },
  {
    number: "02",
    icon: Lightbulb,
    title: "Soluciones simples",
    description:
      "Tecnología que resuelve problemas reales sin agregar complejidad innecesaria a tu operación.",
  },
  {
    number: "03",
    icon: Briefcase,
    title: "Criterio de negocio",
    description:
      "No solo implementamos herramientas. Pensamos en el impacto real que tendrán en tu empresa.",
  },
  {
    number: "04",
    icon: Users,
    title: "Acompañamiento cercano",
    description:
      "Trabajamos contigo, no para ti. Comunicación clara y directa en todo momento.",
  },
];

export const WhyUsSection = () => {
  return (
    <section
      id="porque"
      className="relative overflow-hidden bg-[#03060f] py-24 text-white md:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#03060f_0%,#071330_55%,#0c2a78_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_30%,rgba(96,150,255,0.18),transparent_65%)]" />

      <div className="container-tight relative">
        <SectionHeader
          index="04"
          eyebrow="Por qué Methodical"
          title="Tecnología con criterio de negocio"
          lead="No somos una agencia más. Antes de proponer cualquier solución nos tomamos el tiempo de entender tu operación, tus objetivos y los recursos con los que cuentas."
          tone="dark"
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {reasons.map((reason, index) => (
            <Reveal key={reason.title} delay={index * 0.06}>
              <article className="group relative h-full rounded-sm border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-colors hover:border-blue-400/50">
                <CornerTicks className="text-white/15 transition-colors group-hover:text-blue-300/60" />

                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-blue-200/70">
                  {reason.number}
                </span>

                <div className="mt-6 inline-flex h-11 w-11 items-center justify-center rounded-sm border border-white/15 text-blue-100 transition-colors group-hover:border-blue-300/60 group-hover:text-white">
                  <reason.icon size={20} strokeWidth={1.6} />
                </div>

                <h3 className="mt-6 font-display text-lg font-semibold tracking-tight text-white">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-blue-50/65">
                  {reason.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
};
