import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { ParticleNetwork } from "../ui/ParticleNetwork";

export const HeroSection = () => {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#03060f] text-white"
    >
      {/* Vertical gradient: near-black top -> vivid blue bottom (Sui-style) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#03060f_0%,#06112e_32%,#103183_70%,#1e50d6_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_40%,rgba(96,150,255,0.32),transparent_62%)]" />
      </div>

      {/* Crisp particle field */}
      <ParticleNetwork className="opacity-90" particleCount={120} speed={0.3} />

      <div className="container-tight relative z-10 w-full px-4 py-24 sm:py-28 lg:py-32">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-balance font-display text-[clamp(2.25rem,5.5vw,4.75rem)] font-semibold leading-[1.02] tracking-tight text-white [text-shadow:0_0_45px_rgba(130,175,255,0.3)]"
          >
            Impulsa tu productividad con tecnología inteligente
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-6 max-w-lg text-base leading-relaxed text-blue-100/70 sm:mt-8 sm:text-lg"
          >
            Ordena, automatiza y escala la operación de tu empresa con soluciones
            digitales simples y efectivas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:gap-0 sm:overflow-hidden sm:rounded-md"
          >
            <button
              onClick={() => scrollTo("#contacto")}
              className="w-full rounded-md bg-slate-900 px-8 py-3.5 font-medium text-white transition-colors duration-300 hover:bg-slate-800 sm:w-auto sm:rounded-none"
            >
              Contáctanos
            </button>
            <button
              onClick={() => scrollTo("#servicios")}
              className="w-full rounded-md bg-white px-8 py-3.5 font-medium text-slate-900 transition-colors duration-300 hover:bg-blue-50 sm:w-auto sm:rounded-none"
            >
              Conoce nuestros servicios
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        onClick={() => scrollTo("#servicios")}
        aria-label="Bajar a servicios"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center justify-center text-white/70 transition-colors hover:text-white"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30">
          <motion.span
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={16} />
          </motion.span>
        </span>
      </motion.button>
    </section>
  );
};
