import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  MessageCircle,
  Mail,
  CalendarCheck,
  Globe,
  Layers,
  Briefcase,
  Linkedin,
  Instagram,
} from "lucide-react";

/**
 * methodical.cl/visit
 *
 * Hub de enlaces con la identidad de los reels de marca: azul tinta,
 * Space Grotesk + JetBrains Mono, nodos color hueso y un recorrido teal
 * (eco del reel "El problema del viajante"). Página independiente: no se
 * enlaza desde el home ni el menú, sólo accesible escribiendo la URL.
 */

const WHATSAPP_NUMBER = "56961950578";
const wa = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
const WHATSAPP_REUNION = wa(
  "Hola Methodical, me gustaría agendar una reunión."
);
const WHATSAPP_DIRECTO = wa("Hola Methodical 👋");
const EMAIL = "mailto:contacto@methodical.cl";

type LinkItem = {
  label: string;
  description: string;
  href: string;
  icon: typeof MessageCircle;
  external?: boolean;
  featured?: boolean;
};

type LinkGroup = {
  kicker: string;
  items: LinkItem[];
};

const groups: LinkGroup[] = [
  {
    kicker: "Conversemos",
    items: [
      {
        label: "Agenda una reunión",
        description: "Coordinemos por WhatsApp",
        href: WHATSAPP_REUNION,
        icon: CalendarCheck,
        external: true,
        featured: true,
      },
      {
        label: "WhatsApp",
        description: "+56 9 6195 0578",
        href: WHATSAPP_DIRECTO,
        icon: MessageCircle,
        external: true,
      },
      {
        label: "Escríbenos",
        description: "contacto@methodical.cl",
        href: EMAIL,
        icon: Mail,
      },
    ],
  },
  {
    kicker: "Explora",
    items: [
      {
        label: "Sitio web",
        description: "methodical.cl",
        href: "https://methodical.cl",
        icon: Globe,
      },
      {
        label: "Servicios",
        description: "Automatización, datos e integraciones",
        href: "https://methodical.cl/#servicios",
        icon: Layers,
      },
      {
        label: "Proyectos",
        description: "Lo que hemos construido",
        href: "https://methodical.cl/#proyectos",
        icon: Briefcase,
      },
    ],
  },
  {
    kicker: "Síguenos",
    items: [
      {
        label: "LinkedIn",
        description: "Methodical Chile",
        href: "https://www.linkedin.com/company/methodicalchile/",
        icon: Linkedin,
        external: true,
      },
      {
        label: "Instagram",
        description: "@methodicalchile",
        href: "https://www.instagram.com/methodicalchile",
        icon: Instagram,
        external: true,
      },
    ],
  },
];

const Visit = () => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Methodical — Del caos al método";
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-hidden font-['Space_Grotesk',sans-serif]"
      style={{ backgroundColor: "#0B1A2B", color: "rgb(237,234,226)" }}
    >
      <NodeNetwork />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 0%, rgba(38,226,206,0.10) 0%, rgba(11,26,43,0) 65%)",
        }}
      />

      <main className="relative z-10 mx-auto flex max-w-xl flex-col px-5 py-16 sm:py-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          <img
            src="/logo-transparente.png"
            alt="Methodical"
            className="h-20 w-auto object-contain brightness-0 invert"
          />
        </motion.div>

        {/* Grupos de enlaces */}
        <div className="mt-12 space-y-10">
          {groups.map((group, gi) => (
            <section key={group.kicker}>
              <p className="mb-4 font-['JetBrains_Mono',monospace] text-[11px] uppercase tracking-[0.22em] text-white/35">
                {group.kicker}
              </p>
              <div>
                {group.items.map((item, ii) => (
                  <LinkNode
                    key={item.label}
                    item={item}
                    delay={0.15 + gi * 0.08 + ii * 0.05}
                    isFirst={ii === 0}
                    isLast={ii === group.items.length - 1}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="font-['JetBrains_Mono',monospace] text-[10px] uppercase tracking-[0.2em] text-white/30">
            Santiago, Chile · © {new Date().getFullYear()} Methodical
          </p>
        </footer>
      </main>
    </div>
  );
};

const LinkNode = ({
  item,
  delay,
  isFirst,
  isLast,
}: {
  item: LinkItem;
  delay: number;
  isFirst: boolean;
  isLast: boolean;
}) => {
  return (
    <motion.a
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative flex items-center gap-3 py-3"
    >
      {/* Nodo + conectores verticales del grafo */}
      <span className="relative flex w-4 flex-shrink-0 items-center justify-center self-stretch">
        {!isFirst && (
          <span className="absolute left-1/2 top-0 h-1/2 w-px -translate-x-1/2 bg-white/15" />
        )}
        {!isLast && (
          <span className="absolute bottom-0 left-1/2 h-1/2 w-px -translate-x-1/2 bg-white/15" />
        )}
        <span
          className={`relative z-10 rounded-full transition-all duration-300 ${
            item.featured
              ? "h-3 w-3 bg-[rgb(38,226,206)] shadow-[0_0_12px_rgba(38,226,206,0.7)]"
              : "h-2 w-2 bg-[rgb(38,226,206)]/60 group-hover:h-3 group-hover:w-3 group-hover:bg-[rgb(38,226,206)]"
          }`}
        />
      </span>

      {/* Arista horizontal hacia la etiqueta */}
      <span className="h-px w-6 flex-shrink-0 bg-white/15 transition-colors duration-300 group-hover:bg-[rgb(38,226,206)]/50" />

      {/* Contenido */}
      <span className="min-w-0 flex-1">
        <span
          className={`block font-medium transition-colors duration-300 ${
            item.featured
              ? "text-[rgb(38,226,206)]"
              : "text-[rgb(237,234,226)]"
          }`}
        >
          {item.label}
        </span>
        <span className="block truncate text-sm text-white/40">
          {item.description}
        </span>
      </span>

      <ArrowUpRight className="h-4 w-4 flex-shrink-0 -translate-x-1 text-white/25 transition-all duration-300 group-hover:translate-x-0 group-hover:text-[rgb(38,226,206)]" />
    </motion.a>
  );
};

/**
 * Red de nodos sobre azul tinta, con un recorrido teal que viaja de nodo
 * en nodo — guiño al reel "El problema del viajante" de Methodical.
 */
const NodeNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const BONE = "237,234,226";
    const TEAL = "38,226,206";
    const LINK = 120; // distancia máx. para dibujar aristas
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    let nodes: { x: number; y: number; vx: number; vy: number; r: number }[] =
      [];
    let tour: number[] = []; // subconjunto de nodos que recorre el "viajante"
    let raf = 0;
    let prev = performance.now();
    let travel = 0; // posición a lo largo del recorrido

    const init = () => {
      const count = Math.max(18, Math.min(46, Math.round((w * h) / 26000)));
      nodes = Array.from({ length: count }, () => {
        const ang = Math.random() * Math.PI * 2;
        const sp = 0.18 + Math.random() * 0.32; // velocidad perceptible
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          r: Math.random() * 1.4 + 1.4,
        };
      });
      // recorrido: ~9 nodos repartidos, en orden de índice
      const step = Math.max(1, Math.floor(count / 9));
      tour = [];
      for (let i = 0; i < count && tour.length < 9; i += step) tour.push(i);
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      init();
    };

    const frame = (now: number) => {
      const dt = Math.min(50, now - prev) / 16.67;
      prev = now;
      ctx.clearRect(0, 0, w, h);

      // mover nodos (deriva lenta, rebotan en los bordes)
      for (const n of nodes) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.x = Math.max(0, Math.min(w, n.x));
        n.y = Math.max(0, Math.min(h, n.y));
      }

      // aristas de proximidad (hueso, muy tenue)
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const a = (1 - Math.sqrt(d2) / LINK) * 0.1;
            ctx.strokeStyle = `rgba(${BONE},${a.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // recorrido del "viajante" (línea teal entre nodos del tour)
      if (tour.length > 1) {
        ctx.strokeStyle = `rgba(${TEAL},0.28)`;
        ctx.lineWidth = 1.4;
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(nodes[tour[0]].x, nodes[tour[0]].y);
        for (let i = 1; i < tour.length; i++)
          ctx.lineTo(nodes[tour[i]].x, nodes[tour[i]].y);
        ctx.stroke();

        // punto que viaja a lo largo del recorrido
        const segs = tour.length - 1;
        travel += 0.0022 * dt;
        if (travel >= 1) travel -= 1;
        const f = travel * segs;
        const si = Math.min(segs - 1, Math.floor(f));
        const fr = f - si;
        const a = nodes[tour[si]];
        const b = nodes[tour[si + 1]];
        const px = a.x + (b.x - a.x) * fr;
        const py = a.y + (b.y - a.y) * fr;
        ctx.fillStyle = `rgba(${TEAL},0.9)`;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${TEAL},0.18)`;
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // nodos (hueso; los del recorrido en teal)
      const tourSet = new Set(tour);
      nodes.forEach((n, i) => {
        const isTour = tourSet.has(i);
        ctx.fillStyle = isTour
          ? `rgba(${TEAL},0.85)`
          : `rgba(${BONE},0.6)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, isTour ? n.r + 1.2 : n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
};

export default Visit;
