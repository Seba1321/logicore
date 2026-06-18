import { useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

/**
 * methodical.cl/visit
 *
 * Hub de enlaces editorial: tipografía como protagonista, fondo negro
 * con textura grain, animaciones táctiles (transform + opacity only),
 * mobile-first. Página independiente, sólo accesible escribiendo la URL.
 */

/* ─── Data ─────────────────────────────────────────────────── */

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
        external: true,
        featured: true,
      },
      {
        label: "WhatsApp",
        description: "+56 9 6195 0578",
        href: WHATSAPP_DIRECTO,
        external: true,
      },
      {
        label: "Escríbenos",
        description: "contacto@methodical.cl",
        href: EMAIL,
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
      },
      {
        label: "Servicios",
        description: "Automatización, datos e integraciones",
        href: "https://methodical.cl/#servicios",
      },
      {
        label: "Proyectos",
        description: "Lo que hemos construido",
        href: "https://methodical.cl/#proyectos",
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
        external: true,
      },
      {
        label: "Instagram",
        description: "@methodicalchile",
        href: "https://www.instagram.com/methodicalchile",
        external: true,
      },
    ],
  },
];

/* ─── Colors ───────────────────────────────────────────────── */

const C = {
  bg: "#071226",
  blue: "rgb(96,165,250)",
  blueSoft: "rgba(96,165,250,0.26)",
  blueHover: "rgba(96,165,250,0.09)",
  blueBorderHover: "rgba(96,165,250,0.52)",
  white90: "rgba(255,255,255,0.90)",
  white50: "rgba(255,255,255,0.50)",
  white30: "rgba(255,255,255,0.30)",
  white20: "rgba(255,255,255,0.20)",
  white06: "rgba(255,255,255,0.06)",
  white04: "rgba(255,255,255,0.04)",
} as const;

/* ─── CSS injected once ────────────────────────────────────── */

const injectedCSS = `
@keyframes dotPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.4); opacity: 0.9; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

/* ─── Framer Motion Variants ───────────────────────────────── */

const smoothEase: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const sectionVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const linkVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: smoothEase },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: smoothEase },
  },
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

/* ─── Main Component ───────────────────────────────────────── */

const Visit = () => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Methodical — Enlaces";
    const styleEl = document.createElement("style");
    styleEl.textContent = injectedCSS;
    document.head.appendChild(styleEl);
    return () => {
      document.title = prevTitle;
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-hidden font-['Space_Grotesk',sans-serif]"
      style={{ backgroundColor: C.bg, color: C.white90 }}
    >
      {/* Noise texture */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Very subtle blue glow at top */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(50% 30% at 50% -2%, rgba(96,165,250,0.08) 0%, transparent 100%)",
        }}
      />

      <main className="relative z-10 mx-auto flex max-w-[480px] flex-col px-6 py-14 sm:py-20">
        {/* ─── Hero: Logo ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center"
        >
          <img
            src="/logo-transparente.png"
            alt="Methodical"
            className="h-14 w-auto object-contain brightness-0 invert sm:h-16"
          />
        </motion.div>

        {/* Decorative separator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mx-auto mt-6 mb-12 flex items-center gap-3"
        >
          <span
            className="h-px w-10"
            style={{
              background: `linear-gradient(90deg, transparent, ${C.white20})`,
            }}
          />
          <span
            className="block h-[5px] w-[5px] rounded-full"
            style={{
              backgroundColor: C.blue,
              animation: "dotPulse 4s ease-in-out infinite",
            }}
          />
          <span
            className="h-px w-10"
            style={{
              background: `linear-gradient(90deg, ${C.white20}, transparent)`,
            }}
          />
        </motion.div>

        {/* ─── Link Groups ─── */}
        <div className="space-y-10">
          {groups.map((group, gi) => (
            <motion.section
              key={group.kicker}
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
            >
              {/* Section Kicker — letter by letter */}
              <KickerText text={group.kicker} />

              {/* Links */}
              <div>
                {group.items.map((item, ii) =>
                  item.featured ? (
                    <motion.div key={item.label} variants={fadeUpVariants}>
                      <FeaturedLink item={item} />
                    </motion.div>
                  ) : (
                    <motion.div key={item.label} variants={linkVariants}>
                      <TextLink
                        item={item}
                        showSeparator={ii < group.items.length - 1}
                      />
                    </motion.div>
                  )
                )}
              </div>
            </motion.section>
          ))}
        </div>

        {/* ─── Footer ─── */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 flex flex-col items-center"
        >
          {/* Decorative separator (mirrors hero) */}
          <div className="mb-5 flex items-center gap-3">
            <span
              className="h-px w-8"
              style={{
                background: `linear-gradient(90deg, transparent, ${C.white06})`,
              }}
            />
            <span
              className="block h-[4px] w-[4px] rounded-full"
              style={{
                backgroundColor: C.blue,
                opacity: 0.4,
                animation: "dotPulse 4s ease-in-out 2s infinite",
              }}
            />
            <span
              className="h-px w-8"
              style={{
                background: `linear-gradient(90deg, ${C.white06}, transparent)`,
              }}
            />
          </div>
          <p
            className="font-['JetBrains_Mono',monospace] text-[10px] uppercase tracking-[0.2em]"
            style={{ color: C.white20 }}
          >
            Santiago, Chile · © {new Date().getFullYear()} Methodical
          </p>
        </motion.footer>
      </main>
    </div>
  );
};

/* ─── Kicker Text (letter-by-letter reveal) ────────────────── */

const KickerText = ({ text }: { text: string }) => {
  const letters = text.split("");
  return (
    <motion.p
      className="mb-5 flex font-['Space_Grotesk',sans-serif] text-[13px] font-semibold uppercase tracking-[0.3em]"
      style={{ color: C.white30 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.03 } },
      }}
    >
      {letters.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          variants={letterVariants}
          className="inline-block"
          style={{ minWidth: char === " " ? "0.35em" : undefined }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.p>
  );
};

/* ─── Featured Link (CTA with border) ─────────────────────── */

const FeaturedLink = ({ item }: { item: LinkItem }) => {
  return (
    <a
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      className="group mb-4 block"
    >
      <div
        className="relative overflow-hidden rounded-[14px] px-5 py-4 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          border: `1px solid ${C.blueSoft}`,
          background: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = C.blueHover;
          e.currentTarget.style.borderColor = C.blueBorderHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = C.blueSoft;
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <span
              className="block text-[18px] font-medium transition-colors duration-300 sm:text-[20px]"
              style={{ color: C.white90 }}
            >
              <span className="transition-colors duration-300 group-hover:text-[rgb(96,165,250)]">
                {item.label}
              </span>
            </span>
            <span
              className="mt-0.5 block font-['JetBrains_Mono',monospace] text-[12px]"
              style={{ color: C.white30 }}
            >
              {item.description}
            </span>
          </div>
          <ArrowUpRight
            size={18}
            className="flex-shrink-0 transition-transform duration-300 group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
            style={{ color: C.white50 }}
          />
        </div>
      </div>
    </a>
  );
};

/* ─── Text Link (minimal, no box) ──────────────────────────── */

const TextLink = ({
  item,
  showSeparator,
}: {
  item: LinkItem;
  showSeparator: boolean;
}) => {
  return (
    <>
      <a
        href={item.href}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        className="group block py-3"
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <span className="relative inline-block">
              <span
                className="block text-[17px] font-medium text-white/90 transition-colors duration-300 group-hover:text-[rgb(96,165,250)] sm:text-[18px]"
              >
                {item.label}
              </span>
              {/* Animated underline */}
              <span
                className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-x-100"
                style={{ backgroundColor: C.blue }}
              />
            </span>
            <span
              className="mt-0.5 block font-['JetBrains_Mono',monospace] text-[11px]"
              style={{ color: C.white30 }}
            >
              {item.description}
            </span>
          </div>
          <ArrowUpRight
            size={16}
            className="flex-shrink-0 text-white/20 transition-all duration-300 group-hover:translate-x-[3px] group-hover:-translate-y-[3px] group-hover:text-[rgb(96,165,250)]"
          />
        </div>
      </a>
      {showSeparator && (
        <div
          className="h-px w-full"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, ${C.white06} 0, ${C.white06} 4px, transparent 4px, transparent 10px)`,
          }}
        />
      )}
    </>
  );
};

export default Visit;
