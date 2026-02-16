import { motion } from "framer-motion";
import { Workflow, Globe, BarChart3, Puzzle } from "lucide-react";

const services = [
  {
    icon: Workflow,
    title: "Automatización de procesos",
    description:
      "Eliminamos tareas repetitivas y conectamos tus sistemas para que tu equipo se enfoque en lo importante.",
  },
  {
    icon: Globe,
    title: "Soluciones Web para tu empresa",
    description:
      "Sitios web modernos, rápidos y optimizados que representan la profesionalidad de tu empresa.",
  },
  {
    icon: BarChart3,
    title: "Análisis de datos",
    description:
      "Transformamos tus datos en información útil para tomar mejores decisiones de negocio.",
  },
  {
    icon: Puzzle,
    title: "Integraciones a medida",
    description:
      "Conectamos las herramientas que ya usas para crear flujos de trabajo eficientes y sin fricciones.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const ServicesSection = () => {
  return (
    <section id="servicios" className="section-padding bg-secondary">
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="heading-section text-foreground mb-4">Qué hacemos</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Soluciones digitales enfocadas en resolver problemas reales de tu
            negocio.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              className="bg-card p-8 rounded-xl card-hover"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
