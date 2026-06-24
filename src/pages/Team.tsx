import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Linkedin, X } from "lucide-react";

import { CornerTicks, Reveal } from "@/components/portal/technical";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { SectionHeader } from "@/components/sections/shared";
import { team, type TeamMember } from "@/data/team";
import { usePageMeta } from "@/hooks/use-page-meta";

const Team = () => {
  usePageMeta({
    title: "Equipo",
    description:
      "Conoce al equipo de Methodical: cofundadores e ingenieros detrás de cada proyecto.",
    canonical: "https://methodical.cl/equipo",
  });

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState<"Todos" | "Cofounders" | "Equipo">("Todos");

  const cofounders = useMemo(() => team.filter((member) => member.tag === "Cofounder"), []);
  const others = useMemo(() => team.filter((member) => member.tag !== "Cofounder"), []);

  const showCofounders = activeTab === "Todos" || activeTab === "Cofounders";
  const showOthers = activeTab === "Todos" || activeTab === "Equipo";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header />
      <section className="relative overflow-hidden bg-[#03060f] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#03060f_0%,#071330_55%,#0c2a78_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_30%,rgba(96,150,255,0.18),transparent_65%)]" />

        <div className="container-tight relative pb-16 pt-32 md:pb-24 md:pt-40">
          <SectionHeader
            index="01"
            eyebrow="Equipo"
            title="Las personas detrás de Methodical"
            lead="Somos un equipo joven con formación de alto nivel y experiencia real en empresas y organizaciones del sector público y privado. Conoce a quienes lideramos cada proyecto."
            tone="dark"
          />
        </div>
      </section>

      <main className="container-tight space-y-20 py-12 md:space-y-24 md:py-16">
        <Reveal>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-slate-200 pb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">
              Filtrar
            </span>
            {(["Todos", "Cofounders", "Equipo"] as const).map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                    active ? "text-blue-700" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab}
                  {active && (
                    <motion.span
                      layoutId="team-filter-underline"
                      className="absolute -bottom-4 left-0 right-0 h-px bg-blue-600"
                    />
                  )}
                </button>
              );
            })}
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
              {team.length.toString().padStart(2, "0")} personas
            </span>
          </div>
        </Reveal>

        {showCofounders && (
          <section className="pt-12">
            <SubsectionHeader
              index="02"
              eyebrow="Cofounders"
              title="Los fundadores"
              lead="Tres perfiles complementarios: tecnología, gestión de proyectos y procesos."
              count={`${cofounders.length.toString().padStart(2, "0")} / ${team.length.toString().padStart(2, "0")}`}
            />

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cofounders.map((member, index) => (
                <Reveal key={member.id} delay={index * 0.08}>
                  <MemberCard member={member} onClick={() => setSelectedMember(member)} />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {showOthers && others.length > 0 && (
          <section>
            <SubsectionHeader
              index="03"
              eyebrow="Equipo"
              title="Quienes hacen las cosas posibles"
              lead="Ingeniería, desarrollo y operación. El equipo técnico que ejecuta cada proyecto."
              count={`${others.length.toString().padStart(2, "0")} / ${team.length.toString().padStart(2, "0")}`}
            />

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((member, index) => (
                <Reveal key={member.id} delay={index * 0.08}>
                  <MemberCard member={member} onClick={() => setSelectedMember(member)} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#03060f]/70 p-4 backdrop-blur-sm"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 18 }}
              transition={{ duration: 0.3 }}
              onClick={(event) => event.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-sm border border-slate-200 bg-white"
            >
              <CornerTicks className="z-10 text-slate-200" />

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                aria-label="Cerrar"
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-sm border border-white/30 bg-black/30 text-white transition-colors hover:bg-black/50"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col md:flex-row">
                <div className="aspect-[4/5] w-full md:w-5/12 md:aspect-auto md:min-h-[520px]">
                  <img
                    src={selectedMember.photo}
                    alt={selectedMember.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="flex flex-col p-6 sm:p-8 md:w-7/12">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue-600">
                    {String(selectedMember.id).padStart(2, "0")} — {selectedMember.tag}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                    {selectedMember.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">{selectedMember.role}</p>

                  <div className="mt-7 space-y-6">
                    <ModalBlock label="Especialidad" body={selectedMember.specialty} />
                    <ModalBlock label="Sobre" body={selectedMember.bio} />

                    <div className="border-t border-slate-100 pt-6">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">
                        Experiencia
                      </p>
                      <ul className="mt-3 space-y-2">
                        {selectedMember.experience.map((exp) => (
                          <li key={exp} className="flex items-start gap-2.5 text-sm text-slate-600">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
                            {exp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedMember.linkedin && (
                      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-6">
                        <a
                          href={selectedMember.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-sm border border-slate-200 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-700 transition-colors hover:border-blue-600 hover:text-blue-700"
                        >
                          <Linkedin size={14} strokeWidth={1.6} /> LinkedIn
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SubsectionHeader = ({
  index,
  eyebrow,
  title,
  lead,
  count,
}: {
  index: string;
  eyebrow: string;
  title: string;
  lead: string;
  count: string;
}) => (
  <Reveal>
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-4">
        <p className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.3em] text-slate-400">
          <span className="h-1 w-1 rounded-full bg-blue-500" />
          {index} — {eyebrow}
        </p>
        <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-[1.05] tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">{lead}</p>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
        {count}
      </span>
    </div>
  </Reveal>
);

const MemberCard = ({ member, onClick }: { member: TeamMember; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="group relative block h-full w-full overflow-hidden rounded-sm border border-slate-200 bg-white text-left transition-colors hover:border-blue-600"
  >
    <CornerTicks className="z-10 text-slate-200 transition-colors group-hover:text-blue-500" />

    <div className="relative aspect-[4/5] overflow-hidden bg-slate-200">
      <img
        src={member.photo}
        alt={member.name}
        loading="lazy"
        className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
      />
      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-sm bg-white/90 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-700 backdrop-blur-sm">
        <span className="h-1 w-1 rounded-full bg-blue-500" />
        {String(member.id).padStart(2, "0")} · {member.tag}
      </span>
    </div>

    <div className="relative border-t border-slate-200 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
        {member.role}
      </p>
      <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-slate-950">
        {member.name}
      </h3>

      <div className="relative mt-3 min-h-[3.25rem]">
        <p className="absolute inset-0 line-clamp-2 text-xs leading-relaxed text-slate-500 transition-opacity duration-300 group-hover:opacity-0">
          {member.specialty}
        </p>
        <ul className="absolute inset-0 space-y-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {member.experience.slice(0, 2).map((exp) => (
            <li key={exp} className="flex items-start gap-2 text-xs leading-snug text-slate-600">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
              <span className="line-clamp-1">{exp}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </button>
);

const ModalBlock = ({ label, body }: { label: string; body: string }) => (
  <div className="border-t border-slate-100 pt-6 first:border-t-0 first:pt-0">
    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">{label}</p>
    <p className="mt-3 text-sm leading-relaxed text-slate-600">{body}</p>
  </div>
);

export default Team;
