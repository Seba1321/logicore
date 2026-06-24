import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import { CornerTicks, Reveal } from "@/components/portal/technical";
import { team } from "@/data/team";
import { SectionHeader } from "./shared";

const previewSize = 4;

export const TeamSection = () => {
  const preview = team.slice(0, previewSize);

  return (
    <section id="equipo" className="relative bg-slate-50 py-24 md:py-32">
      <div className="container-tight">
        <SectionHeader
          index="03"
          eyebrow="Equipo"
          title="Quiénes somos"
          lead="Somos un equipo joven con formación de alto nivel y experiencia real resolviendo problemas en empresas y organizaciones. Combinamos energía, criterio técnico y mirada de negocio."
        />

        <div className="mt-14 grid items-stretch gap-8 lg:grid-cols-[1.05fr_1fr]">
          <Reveal>
            <div className="relative flex h-full flex-col justify-between rounded-sm border border-slate-200 bg-white p-8 md:p-10">
              <CornerTicks className="text-slate-200" />

              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-blue-600">
                  — Nuestro enfoque
                </p>
                <p className="mt-5 font-display text-2xl font-semibold leading-snug tracking-tight text-slate-950 md:text-3xl">
                  Equipo joven, formación sólida y obsesión por resolver problemas reales.
                </p>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-500">
                  Cada proyecto lo lideran personas con experiencia técnica y criterio de
                  negocio. Trabajamos contigo, no para ti.
                </p>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-6">
                <Link
                  to="/equipo"
                  className="group inline-flex items-center gap-2 rounded-sm bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  Conoce al equipo
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
                  {team.length.toString().padStart(2, "0")} personas · Santiago, Chile
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Link
              to="/equipo"
              className="group relative block h-full overflow-hidden rounded-sm border border-slate-200 bg-white"
            >
              <CornerTicks className="z-10 text-slate-200 transition-colors group-hover:text-blue-500" />

              <div className="grid h-full grid-cols-2 gap-px bg-slate-200">
                {preview.map((member) => (
                  <div key={member.id} className="relative aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={member.photo}
                      alt={member.name}
                      loading="lazy"
                      className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3">
                      <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-white/70">
                        {String(member.id).padStart(2, "0")} · {member.tag}
                      </span>
                      <span className="mt-1 block font-display text-sm font-semibold text-white">
                        {member.name}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
