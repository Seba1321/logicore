export type LogoNode = [number, number];
export type LogoEdge = [number, number];

export type ResearchLine = {
  code: string;
  field: string;
  title: string;
  accent: string;
  thesis: string;
  deepDive: string;
  questions: string[];
  logo: {
    nodes: LogoNode[];
    edges: LogoEdge[];
    core: number[];
  };
};

export const researchLines: ResearchLine[] = [
  {
    code: "RI",
    field: "Interface agents",
    title: "Leyendo interfaces",
    accent: "#60a5fa",
    thesis:
      "La interfaz gráfica es el medio donde ocurre el trabajo digital. Estudiamos cómo agentes —modelos visión-lenguaje, RPA, IA— pueden leer, entender y operar una GUI como lo hace una persona, anclados en los procesos internos reales de cada organización.",
    deepDive:
      "Las interfaces gráficas concentran años de decisiones de proceso, criterio y excepciones. Esta línea estudia cómo un agente —un modelo visión-lenguaje, un RPA o un sistema de IA— puede percibir una pantalla, entender su estructura y operar dentro de ella sin romper la operación. A diferencia de los benchmarks genéricos de agentes web, nos interesa anclar esa capacidad en los procesos internos reales de una organización: las herramientas que ya usa, el conocimiento tácito de quienes las operan y la deuda acumulada en cada formulario.",
    questions: [
      "¿Percibe un agente una pantalla como píxeles, como estructura o como proceso?",
      "¿Qué necesita un modelo visión-lenguaje para operar una interfaz sin romper la operación?",
      "¿Cómo se captura el conocimiento tácito que aplica un trabajador al usar una herramienta interna?",
    ],
    logo: {
      nodes: [
        [16, 18],
        [78, 18],
        [78, 39],
        [43, 39],
        [43, 68],
        [97, 68],
        [20, 76],
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [4, 6],
      ],
      core: [1, 4],
    },
  },
  {
    code: "PM",
    field: "Process mining · NLP",
    title: "Minería de procesos",
    accent: "#22d3ee",
    thesis:
      "El proceso real vive en las trazas, las notaciones y el lenguaje de quienes lo ejecutan. Combinamos minería de procesos con procesamiento de lenguaje natural para reconstruir cómo trabaja una organización desde sus eventos, sus documentos y la voz de sus trabajadores.",
    deepDive:
      "El proceso real rara vez coincide con el proceso documentado. Esta línea combina la minería de procesos —reconstrucción de modelos desde event logs— con procesamiento de lenguaje natural para incorporar lo que vive fuera de los sistemas: documentos, instructivos y la voz de los trabajadores. El objetivo es traducir descripciones informales y notaciones formales (BPMN) a modelos verificables, y medir dónde la práctica diverge del procedimiento esperado.",
    questions: [
      "¿Cómo se traduce el lenguaje natural de un trabajador a un modelo de proceso verificable?",
      "¿Qué relación hay entre la notación formal (BPMN, event logs) y la práctica cotidiana?",
      "¿Dónde diverge el proceso descubierto desde los datos del proceso que se esperaba?",
    ],
    logo: {
      nodes: [
        [14, 24],
        [42, 24],
        [42, 55],
        [68, 55],
        [68, 29],
        [96, 29],
        [96, 70],
        [24, 70],
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 6],
        [6, 7],
      ],
      core: [2, 3, 6],
    },
  },
  {
    code: "SAI",
    field: "World models · agents",
    title: "IA situada",
    accent: "#a78bfa",
    thesis:
      "Una IA situada no responde en abstracto: actúa dentro de un mundo. Exploramos world models, JEPA, aprendizaje por refuerzo y LLMs integrados en entornos —desde videojuegos hasta los medios digitales que median los procesos de una empresa— para que el sistema entienda dónde está y qué implica actuar.",
    deepDive:
      "Una IA situada actúa dentro de un mundo y entiende las consecuencias de hacerlo. Esta línea explora world models, arquitecturas predictivas como JEPA, aprendizaje por refuerzo y LLMs integrados en entornos —desde videojuegos hasta los medios digitales que median los procesos de una empresa—. Nos interesa qué modelo del mundo necesita un agente para operar en un contexto organizacional, cómo se transfiere lo aprendido en simulación a sistemas reales y dónde debe ceder el control a una persona.",
    questions: [
      "¿Qué modelo del mundo necesita un agente para operar dentro de un sistema organizacional?",
      "¿Cómo se transfiere lo aprendido en entornos simulados a medios digitales reales?",
      "¿Dónde decide el agente y dónde debe pedir criterio humano?",
    ],
    logo: {
      nodes: [
        [56, 13],
        [88, 30],
        [88, 62],
        [56, 79],
        [24, 62],
        [24, 30],
        [56, 46],
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 0],
        [0, 6],
        [2, 6],
        [4, 6],
      ],
      core: [0, 2, 6],
    },
  },
  {
    code: "OR",
    field: "Cybernetics · ABM",
    title: "Operaciones",
    accent: "#34d399",
    thesis:
      "Toda organización es un sistema que se regula a sí mismo. Desde la cibernética, el modelado basado en agentes (ABM) y la investigación de operaciones, modelamos cómo se asignan recursos, circula la información y se toman decisiones, para comparar escenarios antes de intervenir la operación real.",
    deepDive:
      "Toda organización es un sistema que se regula a sí mismo mediante flujos de información y decisiones. Desde la cibernética (Wiener, Beer), el modelado basado en agentes y la investigación de operaciones, esta línea modela cómo se asignan recursos, circula la información y emergen comportamientos colectivos. El propósito es hacer explícitas las restricciones y los bucles de retroalimentación, para simular y comparar escenarios antes de intervenir la operación real.",
    questions: [
      "¿Qué bucles de retroalimentación gobiernan una operación y dónde se rompen?",
      "¿Qué comportamiento emerge cuando modelamos la organización como agentes que interactúan?",
      "¿Cómo comparar escenarios de decisión antes de ejecutarlos en el mundo real?",
    ],
    logo: {
      nodes: [
        [18, 74],
        [18, 27],
        [43, 27],
        [43, 53],
        [67, 53],
        [67, 18],
        [95, 18],
        [95, 74],
        [47, 74],
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 8],
        [8, 0],
      ],
      core: [3, 5, 8],
    },
  },
];

export const collaborationPaths = [
  {
    label: "Un sistema vivo",
    body: "Un proceso, una interfaz, un modelo o una decisión que ya exista y tenga fricción real.",
  },
  {
    label: "Evidencia mínima",
    body: "Capturas, logs, planillas, reglas o tiempos. No hace falta tenerlo todo ordenado para empezar.",
  },
  {
    label: "Una pregunta difícil",
    body: "Algo que el equipo no ha podido resolver solo con intuición, reuniones o mejoras incrementales.",
  },
];
