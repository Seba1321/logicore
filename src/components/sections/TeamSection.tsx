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
    name: "José Tomás Robert",
    role: "Fundador & Director de Tecnología",
    photo: "/team/Robert.jpeg",
    specialty: "Automatización de procesos organizacionales - Análisis estratégico de datos - Diseño de soluciones tecnológicas para optimización operativa",
    bio: "Profesional con formación interdisciplinaria en Filosofía, Política y Economía (PPE), especializado en la intersección entre tecnología, ciencias sociales y economía aplicada",
    experience: [
      "Ex-Lead Engineer en empresa de retail",
      "Especialista en integraciones empresariales",
      "Consultor de transformación digital",
    ],
  },
  {
    id: 2,
    name: "Benjamín Castro",
    role: "Especialista en Proyectos y Tecnología",
    photo: "/team/Benja.jpeg",
    specialty: "Gestión de proyectos, optimización de procesos y transformación digital",
    bio: "Ingeniero Civil Industrial con diploma en Tecnologías de la Información de la Pontificia Universidad Católica de Chile. Combina visión estratégica de negocios con capacidades técnicas para transformar datos y procesos en decisiones inteligentes. Su enfoque está en diseñar soluciones eficientes, escalables y orientadas a generar impacto real en las organizaciones.",
    experience: [
      "Formación en Gestión y Evaluación de Proyectos",
      "Optimización y modelamiento de procesos",
      "Análisis de datos y automatización",
      "Desarrollo de soluciones tecnológicas y Web",
    ],
  },
  {
    id: 3,
    name: "Sebastián Azocar",
    role: "Especialista en Procesos y Finanzas",
    photo: "/team/Azocar.jpeg",
    specialty: "Transformación digital, desarrollo de soluciones tecnológicas y optimización de procesos basada en datos.",
    bio: "Ingeniero Civil Industrial con diplomado en Tecnologías de la Información y Magíster en Ingeniería Industrial de la pontificia universidad católica de Chile . Especializado en el desarrollo de soluciones tecnológicas orientadas al negocio, combinando conocimientos en ingeniería, análisis de datos y desarrollo de software",
    experience: [
      "Desarrollo de aplicaciones y plataformas web",
      "Análisis de datos y modelamiento avanzado",
      "Levantamiento, rediseño y optimización de procesos",
      "Process Mining",
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
