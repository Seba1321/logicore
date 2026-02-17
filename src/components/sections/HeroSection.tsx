import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ParticleNetwork } from "../ui/ParticleNetwork";

export const HeroSection = () => {
  const scrollToContact = () => {
    const element = document.querySelector("#contacto");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToServices = () => {
    const element = document.querySelector("#servicios");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center pt-20 pb-16 bg-gradient-to-br from-slate-900 via-blue-950 to-black text-white overflow-hidden"
    >
      <ParticleNetwork className="opacity-70" particleCount={120} speed={0.4} />
      
      <div className="container-tight relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium text-white/90 mb-6 backdrop-blur-sm border border-white/10">
              Automatización & Soluciones Digitales
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="heading-display mb-6"
          >
            Impulsa tu productividad con tecnología
            <span className="text-blue-200"> inteligente</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-blue-50/80 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Ayudamos a pequeñas y medianas empresas a ordenar, automatizar y
            escalar su operación con soluciones digitales simples y efectivas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button 
              onClick={scrollToContact} 
              className="bg-white text-primary hover:bg-blue-50 px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 inline-flex items-center justify-center gap-2 group"
            >
              Contáctanos
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button
              onClick={scrollToServices}
              className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-lg font-medium transition-all duration-300"
            >
              Conoce nuestros servicios
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
