import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { Link } from "react-router-dom";

import { CornerTicks, Reveal } from "@/components/portal/technical";
import { projectCategories, projects, type Project } from "@/data/projects";
import { optimizedImage } from "@/lib/image";
import { SectionHeader } from "./shared";

export const ProjectsSection = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState("Todos");

  const featured = projects.find((p) => p.featured);
  const rest = projects.filter((p) => p.id !== featured?.id);
  const filtered =
    activeFilter === "Todos"
      ? rest
      : rest.filter((p) => p.category === activeFilter);

  return (
    <section id="proyectos" className="relative bg-white py-24 md:py-32">
      <div className="container-tight">
        <SectionHeader
          index="02"
          eyebrow="Casos"
          title="Proyectos que generan resultados"
          lead="Cada proyecto comienza con un problema real y termina con una solución que funciona."
        />

        {featured && (
          <Reveal delay={0.05}>
            <button
              type="button"
              onClick={() => setSelectedProject(featured)}
              className="group relative mt-12 grid w-full overflow-hidden rounded-sm border border-slate-200 bg-white text-left transition-colors hover:border-blue-600 md:grid-cols-[1.1fr_1fr]"
            >
              <CornerTicks className="z-10 text-slate-200 transition-colors group-hover:text-blue-500" />

              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 md:aspect-auto md:min-h-[420px]">
                <img
                  src={optimizedImage(featured.image, 1200)}
                  alt={featured.name}
                  loading="lazy"
                  className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-[1.02] group-hover:grayscale-0"
                />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-sm bg-white/90 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-700 backdrop-blur-sm">
                  <span className="h-1 w-1 rounded-full bg-blue-500" />
                  Destacado · {featured.category}
                </span>
              </div>

              <div className="flex flex-col justify-between p-8 md:p-10">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue-600">
                    {String(featured.id).padStart(2, "0")} · {featured.client}
                  </p>
                  <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                    {featured.name}
                  </h3>
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-500 md:text-base">
                    {featured.problem}
                  </p>
                </div>
                <div className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-700 transition-colors group-hover:text-blue-700">
                  Ver caso
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </div>
              </div>
            </button>
          </Reveal>
        )}

        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-slate-200 pb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">
              Filtrar
            </span>
            {projectCategories.map((category) => {
              const active = activeFilter === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveFilter(category)}
                  className={`relative font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                    active ? "text-blue-700" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {category}
                  {active && (
                    <motion.span
                      layoutId="project-filter-underline"
                      className="absolute -bottom-4 left-0 right-0 h-px bg-blue-600"
                    />
                  )}
                </button>
              );
            })}
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
              {filtered.length.toString().padStart(2, "0")} / {rest.length.toString().padStart(2, "0")}
            </span>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, index) => (
              <motion.article
                key={project.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                onClick={() => setSelectedProject(project)}
                className="group relative cursor-pointer overflow-hidden rounded-sm border border-slate-200 bg-white transition-colors hover:border-blue-600"
              >
                <CornerTicks className="z-10 text-slate-200 transition-colors group-hover:text-blue-500" />

                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                  <img
                    src={optimizedImage(project.image, 720)}
                    alt={project.name}
                    loading="lazy"
                    className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-sm bg-white/90 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-700 backdrop-blur-sm">
                    <span className="h-1 w-1 rounded-full bg-blue-500" />
                    {project.category}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      {String(project.id).padStart(2, "0")} · {project.client}
                    </p>
                    <ArrowUpRight
                      size={16}
                      className="shrink-0 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-600"
                    />
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-slate-950">
                    {project.name}
                  </h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
                    {project.problem}
                  </p>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-500">
              ¿Quieres ver todos los proyectos?
            </p>
            <Link
              to="/proyectos"
              className="group inline-flex items-center gap-2 rounded-sm border border-slate-200 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-700 transition-colors hover:border-blue-600 hover:text-blue-700"
            >
              Ver todos
              <ArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </Reveal>

        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#03060f]/70 p-4 backdrop-blur-sm"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 18 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-sm border border-slate-200 bg-white"
              >
                <CornerTicks className="z-10 text-slate-200" />

                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  aria-label="Cerrar"
                  className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-sm border border-white/30 bg-black/30 text-white transition-colors hover:bg-black/50"
                >
                  <X size={16} />
                </button>

                <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                  <img
                    src={optimizedImage(selectedProject.image, 1200)}
                    alt={selectedProject.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-6 sm:p-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue-600">
                    {String(selectedProject.id).padStart(2, "0")} · {selectedProject.category}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                    {selectedProject.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">{selectedProject.client}</p>

                  <div className="mt-8 space-y-6">
                    <ModalBlock label="Problema" body={selectedProject.problem} />
                    <ModalBlock label="Solución" body={selectedProject.solution} />

                    <div className="border-t border-slate-100 pt-6">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">
                        Stack
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {selectedProject.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-sm border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-slate-600"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="relative rounded-sm border border-blue-900/30 bg-[#071330] p-5 text-white">
                      <CornerTicks className="text-white/15" />
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue-200/70">
                        Resultado
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-blue-50/90">
                        {selectedProject.result}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

const ModalBlock = ({ label, body }: { label: string; body: string }) => (
  <div className="border-t border-slate-100 pt-6 first:border-t-0 first:pt-0">
    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">{label}</p>
    <p className="mt-3 text-sm leading-relaxed text-slate-600">{body}</p>
  </div>
);
