import { ArrowUpRight, BarChart3, Globe, Puzzle, Workflow } from "lucide-react";

import { CornerTicks, Reveal } from "@/components/portal/technical";
import { SectionHeader } from "./shared";

const services = [
  {
    number: "01",
    icon: BarChart3,
    title: "Análisis de datos",
    description:
      "Transformamos tus datos en información útil para tomar mejores decisiones de negocio.",
  },
  {
    number: "02",
    icon: Workflow,
    title: "Automatización de procesos",
    description:
      "Eliminamos tareas repetitivas y conectamos tus sistemas para que tu equipo se enfoque en lo importante.",
  },
  {
    number: "03",
    icon: Globe,
    title: "Soluciones web a medida",
    description:
      "Plataformas web modernas, rápidas y optimizadas que representan la profesionalidad de tu empresa.",
  },
  {
    number: "04",
    icon: Puzzle,
    title: "Integraciones a medida",
    description:
      "Conectamos las herramientas que ya usas para crear flujos de trabajo eficientes y sin fricciones.",
  },
];

export const ServicesSection = () => {
  return (
    <section id="servicios" className="relative overflow-hidden bg-slate-50 py-24 md:py-32">
      <div className="container-tight">
        <SectionHeader
          index="01"
          eyebrow="Servicios"
          title="Lo que hacemos"
          lead="Soluciones digitales enfocadas en resolver problemas reales de tu negocio, sin agregar complejidad innecesaria."
        />

        <div id="servicios-grid" className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => (
            <Reveal key={service.title} delay={index * 0.06}>
              <article className="group relative flex h-full flex-col rounded-sm border border-slate-200 bg-white p-6 transition-colors hover:border-blue-600">
                <CornerTicks className="text-slate-200 transition-colors group-hover:text-blue-500" />

                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-400">
                    {service.number}
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-600"
                  />
                </div>

                <div className="mt-7 inline-flex h-11 w-11 items-center justify-center rounded-sm border border-slate-200 text-slate-700 transition-colors group-hover:border-blue-200 group-hover:text-blue-700">
                  <service.icon size={20} strokeWidth={1.6} />
                </div>

                <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-slate-950">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {service.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-500">
              ¿No ves lo que necesitas?
            </p>
            <a
              href="#contacto"
              onClick={(event) => {
                event.preventDefault();
                document.querySelector("#contacto")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group inline-flex items-center gap-2 rounded-sm border border-slate-200 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-700 transition-colors hover:border-blue-600 hover:text-blue-700"
            >
              Conversemos
              <ArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
