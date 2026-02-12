import { motion } from "framer-motion";
import { Building2, Lightbulb, Briefcase, Users, Brain } from "lucide-react";

const reasons = [
  {
    icon: Building2,
    title: "Enfoque en PYMEs",
    description:
      "Entendemos los desafíos de empresas en crecimiento. Soluciones a tu medida, no paquetes genéricos.",
  },
  {
    icon: Lightbulb,
    title: "Soluciones simples",
    description:
      "Tecnología que resuelve problemas reales sin agregar complejidad innecesaria a tu operación.",
  },
  {
    icon: Briefcase,
    title: "Criterio de negocio",
    description:
      "No solo implementamos herramientas. Pensamos en el impacto real que tendrán en tu empresa.",
  },
  {
    icon: Users,
    title: "Acompañamiento cercano",
    description:
      "Trabajamos contigo, no para ti. Comunicación clara y directa en todo momento.",
  },
];

export const WhyUsSection = () => {
  return (
    <section id="porque" className="section-padding">
      <div className="container-tight">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="heading-section text-foreground mb-6">
              ¿Por qué elegir Methodical?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              No somos una agencia más. Somos un equipo que entiende que cada
              peso invertido en tecnología debe generar retorno real. Por eso,
              antes de proponer cualquier solución, nos tomamos el tiempo de
              entender tu negocio.
            </p>
            <div className="flex items-center gap-4 p-6 bg-secondary rounded-xl">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-10 h-10 text-primary" />
              </div>

              <div>
                <p className="font-semibold text-foreground">
                  Somos un equipo joven que combina innovación

                </p>
                <p className="text-base font-medium text-foreground">
                  con conocimiento sólido y formación de alto nivel
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid sm:grid-cols-2 gap-6"
          >
            {reasons.map((reason, index) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 bg-card rounded-xl border border-border hover:border-primary/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <reason.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {reason.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {reason.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
