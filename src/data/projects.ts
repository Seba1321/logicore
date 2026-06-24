export interface Project {
  id: number;
  name: string;
  client: string;
  category: string;
  problem: string;
  solution: string;
  technologies: string[];
  result: string;
  image: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    id: 1,
    name: "Diagnóstico y rediseño de procesos operacionales",
    client: "Organización del sector público",
    category: "Sector Público",
    problem:
      "La organización presentaba procesos operativos con baja estandarización, tiempos de ejecución elevados y limitada visibilidad sobre el desempeño de las operaciones, dificultando la toma de decisiones y la eficiencia en la gestión.",
    solution:
      "Se realizó el levantamiento y modelamiento de procesos críticos mediante BPMN, análisis de flujos operacionales y evaluación de métricas de desempeño. Se identificaron cuellos de botella, se analizaron rutas operacionales y se propuso el rediseño de procesos orientado a mejorar eficiencia, trazabilidad y gestión institucional.",
    technologies: ["BPMN", "Modelamiento de Procesos", "Análisis Operacional", "Optimización de Procesos"],
    result: "Diagnóstico completo de procesos clave y propuesta de mejoras orientadas a eficiencia operativa y toma de decisiones basada en datos.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=720&fit=crop",
    featured: true,
  },
  {
    id: 2,
    name: "Plataforma inteligente de gestión",
    client: "Cliente sector Food Service",
    category: "IA",
    problem:
      "Empresas del sector gastronómico enfrentaban baja visibilidad en su cadena de abastecimiento, dificultades en la gestión de inventarios y procesos manuales en compras y producción, generando pérdidas operativas y falta de trazabilidad.",
    solution:
      "Se desarrolló una plataforma SaaS que centraliza la gestión de compras, inventarios y producción, conectando proveedores con restaurantes en un entorno digital integrado. La solución incorpora inteligencia artificial para predicción de demanda de insumos, detección de anomalías y asistencia mediante chatbot, además de control en tiempo real de stock, gestión de recetas y administración de roles jerárquicos.",
    technologies: ["Inteligencia Artificial", "Integración ERP", "Base de Datos", "Desarrollo Web"],
    result: "Optimización del proceso de abastecimiento, mayor trazabilidad operacional y reducción de pérdidas mediante automatización y analítica predictiva.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=720&fit=crop",
  },
  {
    id: 3,
    name: "Sistema de IA para vinculación académica",
    client: "Sector educativo",
    category: "IA",
    problem:
      "Instituciones académicas presentaban baja visibilidad sobre líneas de investigación y dificultades para conectar estudiantes de postgrado con profesores afines a sus intereses. La información se encontraba dispersa en múltiples fuentes y los procesos de vinculación eran manuales, lentos y poco eficientes.",
    solution:
      "Se desarrolló una plataforma digital que centraliza información académica mediante técnicas de web scraping para recopilar publicaciones científicas y áreas de investigación. La solución utiliza analítica de datos e inteligencia artificial para facilitar la identificación de afinidad entre estudiantes y profesores según intereses de investigación. Además, incorpora mensajería en tiempo real y herramientas de seguimiento del progreso de tesis.",
    technologies: ["Inteligencia Artificial", "APIs", "Python", "Chat en Tiempo Real", "Web Scraping"],
    result: "Más de 500 nuevas conexiones generadas entre estudiantes y académicos, optimizando el proceso de vinculación y mejorando la eficiencia en la gestión de proyectos de investigación.",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=720&fit=crop",
  },
  {
    id: 4,
    name: "Plataforma de tecnología jurídica",
    client: "Empresa de consultoría legal",
    category: "Automatización",
    problem:
      "Profesionales enfrentaban procesos fragmentados para la gestión documental, certificación y validación de información. La trazabilidad era limitada, los flujos eran manuales y existía baja integración entre sistemas, lo que generaba ineficiencias, riesgo operativo y dificultades para garantizar cumplimiento normativo.",
    solution:
      "Desarrollamos una plataforma inteligente que centraliza la gestión, validación y certificación digital de información y documentos. La solución integra automatización de procesos, analítica avanzada e inteligencia artificial para estructurar datos, optimizar flujos de trabajo y asegurar trazabilidad en tiempo real.",
    technologies: ["JavaScript", "n8n", "Automatización de procesos", "Modelamiento de procesos"],
    result: "Optimización significativa de tiempos operativos, mejora en la trazabilidad documental y fortalecimiento del control y la transparencia en los procesos digitales.",
    image: "https://images.unsplash.com/photo-1731955418581-5ba6827ca5ff?w=1200&h=720&fit=crop",
  },
  {
    id: 5,
    name: "Dashboard de gestión multi-tienda",
    client: "Cadena de retail",
    category: "Automatización",
    problem:
      "La gerencia no contaba con visibilidad en tiempo real del desempeño de sus 12 tiendas. Los reportes se generaban de forma manual en planillas Excel con hasta 48 horas de retraso, dificultando la toma de decisiones oportuna y la detección temprana de quiebres de inventario o caídas de ventas.",
    solution:
      "Implementamos un pipeline de datos automatizado que consolida información de ventas, inventario y dotación desde múltiples sistemas de punto de venta. Los datos se transforman mediante procesos ETL y se visualizan en un dashboard centralizado con KPIs actualizados en tiempo real, alertas automáticas y drill-down por tienda, categoría y período.",
    technologies: ["Tableau", "SQL", "ETL", "Python", "Automatización de reportes"],
    result: "Reducción del tiempo de reporte de 48 horas a menos de 10 minutos. Visibilidad completa del negocio en tiempo real, permitiendo decisiones basadas en datos y detección proactiva de problemas operativos.",
    image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=720&fit=crop",
  },
  {
    id: 6,
    name: "Modelización computacional aplicada a entornos económicos",
    client: "Sector público",
    category: "Sector Público",
    problem:
      "Los modelos económicos tradicionales no capturan adecuadamente la complejidad real de organizaciones y sistemas descentralizados. Esto limita la capacidad de anticipar comportamientos estratégicos, dinámicas emergentes y mecanismos eficientes de coordinación.",
    solution:
      "Se desarrollaron modelos basados en agentes para simular interacciones económicas y organizacionales en entornos complejos. Las simulaciones permitieron representar actores heterogéneos, analizar dinámicas estratégicas mediante teoría de juegos y evaluar distintos mecanismos de coordinación bajo escenarios alternativos.",
    technologies: ["Julia", "Teoría de Juegos", "Modelización basada en agentes (ABM)", "Simulación"],
    result: "Desarrollo de entornos de simulación que permiten evaluar estructuras económicas y organizacionales antes de su implementación, apoyando la toma de decisiones basada en evidencia cuantitativa.",
    image: "https://images.unsplash.com/photo-1645684922842-87793d0b25df?w=1200&h=720&fit=crop",
  },
];

export const projectCategories = ["Todos", "IA", "Automatización", "Sector Público"];
