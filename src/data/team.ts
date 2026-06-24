export interface TeamMember {
  id: number;
  name: string;
  role: string;
  tag: string;
  photo: string;
  email: string;
  specialty: string;
  bio: string;
  experience: string[];
  linkedin?: string;
}

export const team: TeamMember[] = [
  {
    id: 1,
    name: "José Tomás Robert",
    role: "Cofounder & Director de Tecnología",
    tag: "Cofounder",
    email: "jt@methodical.cl",
    photo: "/team/Robert.jpeg",
    specialty:
      "Automatización de procesos organizacionales - Análisis estratégico de datos - Diseño de soluciones tecnológicas para optimización operativa",
    bio: "Titulado en Filosofía, Política y Economía (PPE) por la Universidad de Navarra, especializado en la intersección entre tecnología, ciencias sociales y economía aplicada. Me enfoco en diseñar soluciones tecnológicas para comprender y optimizar sistemas complejos, integrando modelización computacional, simulación estratégica y automatización para mejorar procesos y apoyar la toma de decisiones basada en datos.",
    experience: [
      "Automatización y optimización de procesos organizacionales",
      "Integración de herramientas tecnológicas para análisis y toma de decisiones",
      "Diseño de soluciones digitales orientadas a eficiencia operativa y coordinación estratégica",
    ],
    linkedin: "https://www.linkedin.com/in/joserobertpalma",
  },
  {
    id: 2,
    name: "Benjamín Castro",
    role: "Cofounder Especialista en Proyectos y Tecnología",
    tag: "Cofounder",
    email: "benja@methodical.cl",
    photo: "/team/Benja.png",
    specialty: "Gestión de proyectos - Optimización de procesos - Transformación digital",
    bio: "Ingeniero Civil Industrial con diploma en Tecnologías de la Información de la Pontificia Universidad Católica de Chile. Combina visión estratégica de negocios con capacidades técnicas para transformar datos y procesos en decisiones inteligentes. Su enfoque está en diseñar soluciones eficientes, escalables y orientadas a generar impacto real en las organizaciones.",
    experience: [
      "Formación en Gestión y Evaluación de Proyectos",
      "Optimización y modelamiento de procesos",
      "Análisis de datos y automatización",
      "Desarrollo de soluciones tecnológicas y Web",
    ],
    linkedin: "https://www.linkedin.com/in/benjamíncastrom",
  },
  {
    id: 3,
    name: "Sebastián Azócar",
    role: "Cofounder Especialista en Procesos y Finanzas",
    tag: "Cofounder",
    email: "seba@methodical.cl",
    photo: "/team/Azocar.jpeg",
    specialty:
      "Transformación digital - Desarrollo de soluciones tecnológicas - Optimización de procesos basada en datos.",
    bio: "Ingeniero Civil Industrial con diplomado en Tecnologías de la Información y Magíster en Ingeniería Industrial de la Pontificia Universidad Católica de Chile. Especializado en el desarrollo de soluciones tecnológicas orientadas al negocio, combinando conocimientos en ingeniería, análisis de datos y desarrollo de software.",
    experience: [
      "Desarrollo de aplicaciones y plataformas web",
      "Análisis de datos y modelamiento avanzado",
      "Levantamiento, rediseño y optimización de procesos",
      "Process Mining",
    ],
    linkedin:
      "https://www.linkedin.com/in/sebastian-azocar-24207b20b?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
  },
  {
    id: 4,
    name: "Jimmy Gallardo",
    role: "Ingeniero Principal de Software",
    tag: "Equipo",
    email: "jimmy@methodical.cl",
    photo: "/team/Jimmy.jpeg",
    specialty:
      "Desarrollo de software - Integración de sistemas - Automatización de procesos - Cloud e inteligencia artificial",
    bio: "Ingeniero de Software especializado en el desarrollo de soluciones tecnológicas para la automatización de procesos, integración de sistemas y transformación digital. Cuenta con experiencia en desarrollo de software, APIs, microservicios, inteligencia artificial, análisis de datos e infraestructura cloud. Su enfoque se basa en comprender las necesidades del negocio y transformarlas en herramientas tecnológicas con impacto real.",
    experience: [
      "Desarrollo de software y arquitectura de microservicios",
      "Integración de sistemas mediante APIs",
      "Inteligencia artificial y análisis de datos aplicado al negocio",
      "Infraestructura cloud y automatización",
    ],
  },
];
