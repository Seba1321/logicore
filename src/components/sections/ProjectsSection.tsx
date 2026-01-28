import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

interface Project {
  id: number;
  name: string;
  client: string;
  problem: string;
  solution: string;
  technologies: string[];
  result: string;
  image: string;
}

const projects: Project[] = [
  {
    id: 1,
    name: "Sistema de Reportes Automatizados",
    client: "Distribuidora Nacional",
    problem:
      "El equipo comercial perdía 10 horas semanales generando reportes manuales en Excel.",
    solution:
      "Implementamos un dashboard automático que extrae datos de su ERP y genera reportes diarios sin intervención manual.",
    technologies: ["Python", "Power BI", "API REST"],
    result: "Reducción del 90% en tiempo de reportería. Datos siempre actualizados.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    name: "Portal de Clientes",
    client: "Consultora de Seguros",
    problem:
      "Los clientes llamaban constantemente para consultar estado de sus pólizas y pagos.",
    solution:
      "Desarrollamos un portal web donde los clientes acceden a su información en tiempo real.",
    technologies: ["React", "Node.js", "PostgreSQL"],
    result: "Reducción del 60% en llamadas de consulta. Mayor satisfacción del cliente.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    name: "Integración CRM + Facturación",
    client: "Empresa de Servicios",
    problem:
      "Ventas y finanzas trabajaban con datos duplicados y desactualizados entre sistemas.",
    solution:
      "Creamos una integración bidireccional entre HubSpot y su sistema de facturación.",
    technologies: ["Zapier", "APIs", "Webhooks"],
    result: "Cero duplicación de datos. Procesos de venta 40% más rápidos.",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    name: "Dashboard de Gestión",
    client: "Cadena de Retail",
    problem:
      "Gerencia no tenía visibilidad en tiempo real del desempeño de las 12 tiendas.",
    solution:
      "Implementamos un dashboard centralizado con KPIs de ventas, inventario y personal.",
    technologies: ["Tableau", "SQL", "ETL"],
    result: "Visibilidad completa del negocio. Decisiones basadas en datos reales.",
    image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop",
  },
];

export const ProjectsSection = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <section id="proyectos" className="section-padding">
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="heading-section text-foreground mb-4">
            Proyectos que generan resultados
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cada proyecto comienza con un problema real y termina con una
            solución que funciona.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setSelectedProject(project)}
              className="group cursor-pointer bg-card rounded-xl overflow-hidden card-hover border border-border"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground mb-2">
                  {project.client}
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <p className="text-muted-foreground line-clamp-2 mb-4">
                  {project.problem}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-secondary rounded-full text-xs font-medium text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Project Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {selectedProject.client}
                      </p>
                      <h3 className="text-2xl font-bold text-foreground">
                        {selectedProject.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <X size={20} className="text-muted-foreground" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        El problema
                      </h4>
                      <p className="text-muted-foreground">
                        {selectedProject.problem}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        Nuestra solución
                      </h4>
                      <p className="text-muted-foreground">
                        {selectedProject.solution}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        Tecnologías
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-accent/10 rounded-lg p-4">
                      <h4 className="font-semibold text-accent mb-2 flex items-center gap-2">
                        <ExternalLink size={18} />
                        Resultado
                      </h4>
                      <p className="text-foreground font-medium">
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
