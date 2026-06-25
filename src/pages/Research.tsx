import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import { CornerTicks, Reveal } from "@/components/portal/technical";
import { Footer } from "@/components/sections/Footer";
import { usePageMeta } from "@/hooks/use-page-meta";
import { FlowLines, ResearchGroupLogo, ResearchHeader } from "@/pages/research-shared";
import { collaborationPaths, researchLines, type ResearchLine } from "@/pages/research-data";

const Research = () => {
  usePageMeta({
    title: "Research",
    description:
      "Methodical Research: las preguntas que exploramos en interfaces, minería de procesos, IA situada e investigación de operaciones.",
    canonical: "https://methodical.cl/research",
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-slate-950">
      <FlowLines className="pointer-events-none absolute inset-0 h-full w-full opacity-70" />
      <ResearchHeader />

      <section
        id="inicio"
        className="relative z-10 flex min-h-screen items-center overflow-hidden text-slate-950"
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-slate-200" />

        <div className="container-tight relative z-10 w-full py-32 sm:py-36">
          <Reveal>
            <div className="max-w-4xl">
              <h1 className="flex w-[clamp(15rem,42vw,33rem)] max-w-full flex-col">
                <span className="sr-only">Methodical Research</span>
                <img aria-hidden src="/logo-transparente.png" alt="" className="h-auto w-full" />
                <span
                  aria-hidden
                  className="-mt-[5.5%] ml-[34.5%] font-display text-[clamp(0.85rem,1.9vw,1.45rem)] font-medium uppercase tracking-[0.35em] text-slate-500"
                >
                  Research
                </span>
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                Investigamos y construimos técnicas y objetos críticos para automatizar nuestras
                líneas de trabajo y desarrollarlas sobre sistemas reales.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#lineas"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-7 py-3.5 text-center font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Ver las líneas <ArrowDown size={16} />
                </a>
                <a
                  href="#postura"
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-7 py-3.5 text-center font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-white"
                >
                  Nuestra postura
                </a>
              </div>
            </div>
          </Reveal>

          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-slate-300 bg-slate-300 sm:grid-cols-4">
            {researchLines.map((line, index) => (
              <Reveal key={line.code} delay={0.12 + index * 0.06}>
                <a
                  href="#lineas"
                  className="group relative flex h-full flex-col items-start gap-5 bg-white/70 p-5 backdrop-blur-sm transition-colors hover:bg-white"
                >
                  <span
                    className="absolute inset-x-0 top-0 h-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ backgroundColor: line.accent }}
                  />
                  <ResearchGroupLogo
                    line={line}
                    className="h-14 w-20 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105"
                  />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-400">
                      {line.code}
                    </p>
                    <p className="mt-1.5 font-display text-sm font-semibold leading-tight tracking-tight text-slate-950">
                      {line.title}
                    </p>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <main>
        <section id="lineas" className="relative z-10 scroll-mt-24 py-16 md:py-24">
          <div className="container-tight">
            <Reveal>
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.3em] text-slate-400">
                    <span className="h-1 w-1 rounded-full bg-blue-500" />
                    01 — Líneas abiertas
                  </p>
                  <h2 className="mt-5 max-w-3xl font-display text-[clamp(2rem,4.5vw,3.4rem)] font-semibold leading-[1.02] tracking-tight text-slate-950">
                    Cuatro temas que nos importan.
                  </h2>
                </div>
                <p className="max-w-sm text-sm leading-relaxed text-slate-500 lg:text-right">
                  No prometemos publicaciones ni pilotos cerrados. Compartimos las preguntas abiertas
                  que guían cómo trabajamos.
                </p>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-slate-300 bg-slate-300 md:grid-cols-2">
              {researchLines.map((line, index) => (
                <ResearchLineCard key={line.code} line={line} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section id="postura" className="relative z-10 scroll-mt-24 py-16 md:py-24">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-slate-200" />
          <div className="container-tight relative">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <Reveal>
                <div>
                  <p className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.3em] text-slate-400">
                    <span className="h-1 w-1 rounded-full bg-blue-500" />
                    02 — Postura
                  </p>
                  <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.4rem)] font-semibold leading-[1.02] tracking-tight text-slate-950">
                    Investigamos sobre sistemas reales.
                  </h2>
                  <p className="mt-6 max-w-md text-sm leading-relaxed text-slate-600">
                    Nuestra investigación parte de trabajo que ya ocurre, datos que ya existen y
                    decisiones que necesitan volverse visibles. Si tienes algo así y quieres mirarlo
                    con nosotros, conversemos.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <a
                      href="mailto:contacto@methodical.cl?subject=Methodical%20Research"
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                    >
                      Escríbenos <ArrowUpRight size={15} />
                    </a>
                    <Link
                      to="/#contacto"
                      className="rounded-md border border-slate-300 px-6 py-3 text-center text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-white"
                    >
                      Contacto Methodical
                    </Link>
                  </div>
                </div>
              </Reveal>

              <div className="grid gap-px overflow-hidden rounded-sm border border-slate-300 bg-slate-300">
                {collaborationPaths.map((path, index) => (
                  <Reveal key={path.label} delay={index * 0.06}>
                    <article className="relative bg-white/80 p-6 backdrop-blur-sm transition-colors hover:bg-white md:p-7">
                      <CornerTicks className="text-slate-200" />
                      <div className="flex items-start justify-between gap-6">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-slate-400">
                            {String(index + 1).padStart(2, "0")}
                          </p>
                          <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-slate-950">
                            {path.label}
                          </h3>
                        </div>
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      </div>
                      <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
                        {path.body}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const ResearchLineCard = ({ line, index }: { line: ResearchLine; index: number }) => (
  <Reveal delay={index * 0.08}>
    <article className="group relative flex h-full flex-col bg-white/80 p-7 backdrop-blur-sm transition-colors hover:bg-white md:p-9">
      <CornerTicks className="text-slate-200 transition-colors group-hover:text-slate-300" />
      <span
        className="absolute inset-x-0 top-0 h-0.5 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ backgroundColor: line.accent }}
      />

      <ResearchGroupLogo
        line={line}
        className="h-20 w-28 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105"
      />

      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-400">
        {String(index + 1).padStart(2, "0")} / {line.code}
      </p>
      <h3 className="mt-3 font-display text-3xl font-semibold leading-[0.95] tracking-[-0.04em] text-slate-950 md:text-4xl">
        {line.title}
      </h3>
      <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{line.thesis}</p>

      <div className="mt-7 border-t border-slate-200 pt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-400">
          Preguntas abiertas
        </p>
        <ul className="mt-4 space-y-3">
          {line.questions.map((question, questionIndex) => (
            <li key={question} className="flex gap-3 text-sm leading-relaxed text-slate-600">
              <span className="mt-0.5 font-mono text-[10px] text-blue-600">
                {String(questionIndex + 1).padStart(2, "0")}
              </span>
              <span>{question}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  </Reveal>
);

export default Research;
