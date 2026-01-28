import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Linkedin, Mail } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  photo: string;
  specialty: string;
  bio: string;
  experience: string[];
}

const team: TeamMember[] = [
  {
    id: 1,
    name: "Sebastián Morales",
    role: "Fundador & Director de Tecnología",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    specialty: "Arquitectura de sistemas y automatización",
    bio: "Ingeniero informático con más de 10 años optimizando operaciones en empresas de distintos rubros. Cree firmemente que la tecnología debe simplificar, no complicar.",
    experience: [
      "Ex-Lead Engineer en empresa de retail",
      "Especialista en integraciones empresariales",
      "Consultor de transformación digital",
    ],
  },
  {
    id: 2,
    name: "Catalina Fernández",
    role: "Directora de Proyectos",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    specialty: "Gestión de proyectos y análisis de procesos",
    bio: "Experta en entender lo que las empresas realmente necesitan y traducirlo en soluciones que funcionan. Su foco está en que cada proyecto entregue valor real.",
    experience: [
      "PMP Certificada",
      "10+ años en consultoría de procesos",
      "Especialista en metodologías ágiles",
    ],
  },
  {
    id: 3,
    name: "Diego Soto",
    role: "Desarrollador Senior",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    specialty: "Desarrollo web y aplicaciones",
    bio: "Full-stack developer con pasión por crear interfaces limpias y código mantenible. Siempre buscando la solución más elegante para cada problema.",
    experience: [
      "5+ años en desarrollo web",
      "Especialista en React y Node.js",
      "Experiencia en startups y corporaciones",
    ],
  },
  {
    id: 4,
    name: "Andrea Muñoz",
    role: "Analista de Datos",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    specialty: "Business Intelligence y visualización",
    bio: "Transforma datos caóticos en información clara y accionable. Especialista en encontrar las historias que los números cuentan.",
    experience: [
      "Magíster en Data Science",
      "Certificada en Power BI y Tableau",
      "Ex-analista en banca",
    ],
  },
];

export const TeamSection = () => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <section id="equipo" className="section-padding bg-secondary">
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="heading-section text-foreground mb-4">
            Quiénes somos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un equipo cercano, con experiencia real en empresas como la tuya.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setSelectedMember(member)}
              className="group cursor-pointer"
            >
              <div className="bg-card rounded-xl overflow-hidden card-hover">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 text-center">
                  <h3 className="font-semibold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team Member Modal */}
        <AnimatePresence>
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedMember(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-2xl max-w-lg w-full overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-2/5">
                    <img
                      src={selectedMember.photo}
                      alt={selectedMember.name}
                      className="w-full h-full object-cover aspect-square sm:aspect-auto"
                    />
                  </div>
                  <div className="sm:w-3/5 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {selectedMember.name}
                        </h3>
                        <p className="text-primary font-medium">
                          {selectedMember.role}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedMember(null)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <X size={20} className="text-muted-foreground" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                          Especialidad
                        </p>
                        <p className="text-foreground">
                          {selectedMember.specialty}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                          Sobre mí
                        </p>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {selectedMember.bio}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Experiencia
                        </p>
                        <ul className="space-y-1">
                          {selectedMember.experience.map((exp, i) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                              {exp}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button className="p-2 bg-secondary rounded-lg hover:bg-primary/10 transition-colors">
                          <Linkedin size={18} className="text-primary" />
                        </button>
                        <button className="p-2 bg-secondary rounded-lg hover:bg-primary/10 transition-colors">
                          <Mail size={18} className="text-primary" />
                        </button>
                      </div>
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
