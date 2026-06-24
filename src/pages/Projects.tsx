import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";

import { CornerTicks, Reveal } from "@/components/portal/technical";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { SectionHeader } from "@/components/sections/shared";
import { projectCategories, projects, type Project } from "@/data/projects";
import { usePageMeta } from "@/hooks/use-page-meta";
import { optimizedImage } from "@/lib/image";

const Projects = () => {
  usePageMeta({
    title: "Proyectos",
    description:
      "Casos reales de automatización, análisis de datos e integraciones. Cómo Methodical resuelve problemas operativos en empresas y organizaciones.",
    canonical: "https://methodical.cl/proyectos",
  });

  const [activeFilter, setActiveFilter] = useState("Todos");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filtered =
    activeFilter === "Todos"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header />
      <section className="relative overflow-hidden bg-[#03060f] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#03060f_0%,#071330_55%,#0c2a78_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_30%,rgba(96,150,255,0.18),transparent_65%)]" />

        <div className="container-tight relative pb-16 pt-32 md:pb-24 md:pt-40">
          <SectionHeader
            index="02"
            eyebrow="Casos"
            title="Proyectos que generan resultados"
            lead="Cada caso parte de un problema concreto en una organización y termina con una solución medible. Selecciona una categoría para filtrar."
            tone="dark"
          />
        </div>
      </section>

      <main className="container-tight py-20 md:py-24">
        <Reveal>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-slate-200 pb-4">
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
                      layoutId="projects-page-filter-underline"
                      className="absolute -bottom-4 left-0 right-0 h-px bg-blue-600"
                    />
                  )}
                </button>
              );
            })}
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
              {filtered.length.toString().padStart(2, "0")} / {projects.length.toString().padStart(2, "0")}
            </span>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-500">
                    {project.problem}
                  </p>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </main>

      <Footer />

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
  );
};

const ModalBlock = ({ label, body }: { label: string; body: string }) => (
  <div className="border-t border-slate-100 pt-6 first:border-t-0 first:pt-0">
    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">{label}</p>
    <p className="mt-3 text-sm leading-relaxed text-slate-600">{body}</p>
  </div>
);

export default Projects;
