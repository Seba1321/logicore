import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

import type { ResearchLine } from "@/pages/research-data";

const navItems = [
  { label: "Líneas", href: "/research#lineas" },
  { label: "Postura", href: "/research#postura" },
  { label: "Methodical", href: "/" },
];

export const FlowLines = ({ className = "" }: { className?: string }) => {
  const width = 1200;
  const height = 1000;
  const lineCount = 16;
  const gradients = ["url(#flow-a)", "url(#flow-b)", "url(#flow-c)"];

  const lines = Array.from({ length: lineCount }, (_, index) => {
    const t = index / (lineCount - 1);
    const baseY = 36 + t * (height - 72);
    const amplitude = 20 + 34 * Math.sin(t * Math.PI);
    const waves = 1 + 0.8 * Math.sin(t * 2.3);
    const phase = t * Math.PI * 2;
    const steps = 64;
    let d = "";
    for (let step = 0; step <= steps; step++) {
      const x = (step / steps) * width;
      const y = baseY + amplitude * Math.sin((step / steps) * Math.PI * 2 * waves + phase);
      d += `${step === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    return { d: d.trim(), stroke: gradients[index % gradients.length] };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="flow-a" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0c2a78" stopOpacity="0" />
          <stop offset="45%" stopColor="#1e50d6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="flow-b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="50%" stopColor="#2563eb" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="flow-c" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e50d6" stopOpacity="0" />
          <stop offset="55%" stopColor="#0c2a78" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#1e50d6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g fill="none" strokeWidth="1.4" strokeLinecap="round">
        {lines.map((line, index) => (
          <path key={index} d={line.d} stroke={line.stroke} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
};

export const ResearchGroupLogo = ({
  line,
  className = "h-24 w-32",
}: {
  line: ResearchLine;
  className?: string;
}) => {
  const base = "#020617";
  const nodeStroke = "#f6f6f7";

  return (
    <svg viewBox="0 0 112 92" className={className} role="img" aria-label={`Logo del grupo ${line.title}`}>
      <title>{line.title}</title>
      <g fill="none" strokeLinecap="square" strokeLinejoin="miter">
        {line.logo.edges.map(([from, to]) => {
          const [x1, y1] = line.logo.nodes[from];
          const [x2, y2] = line.logo.nodes[to];
          return (
            <line key={`${from}-${to}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={base} strokeWidth="8" />
          );
        })}
      </g>
      {line.logo.nodes.map(([x, y], nodeIndex) => {
        const isCore = line.logo.core.includes(nodeIndex);
        return (
          <circle
            key={`${line.code}-${nodeIndex}`}
            cx={x}
            cy={y}
            r={isCore ? 6.2 : 4.8}
            fill={isCore ? line.accent : base}
            stroke={nodeStroke}
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
};

export const ResearchHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onHero = !isScrolled && !isMobileMenuOpen;
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        onHero
          ? "border-b border-transparent bg-transparent text-slate-950"
          : "border-b border-border bg-background/85 text-slate-950 shadow-sm backdrop-blur-md"
      }`}
    >
      <div className="container-tight">
        <nav className="flex h-16 items-center justify-between md:h-20">
          <Link to="/" className="group flex items-center gap-3" aria-label="Methodical Research">
            <img src="/logo-transparente.png" alt="Methodical" className="h-9 w-auto object-contain" />
            <span aria-hidden className="h-5 w-px bg-slate-300" />
            <span className="font-display text-[0.95rem] font-medium uppercase leading-none tracking-[0.22em] text-slate-500 transition-colors group-hover:text-slate-700 sm:text-[1.05rem]">
              Research
            </span>
          </Link>

          <div className="hidden items-center gap-5 lg:flex xl:gap-7">
            {navItems.map((item) =>
              item.href.startsWith("/research#") ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              )
            )}
            <Link
              to="/#contacto"
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary"
            >
              Contacto
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="-mr-3 p-3 text-foreground lg:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="container-tight flex flex-col gap-4 py-4">
            {navItems.map((item) =>
              item.href.startsWith("/research#") ? (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="py-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={closeMobileMenu}
                  className="py-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              )
            )}
            <Link
              to="/#contacto"
              onClick={closeMobileMenu}
              className="rounded-md border border-border px-6 py-3 text-center font-medium text-foreground/80 transition-colors hover:bg-secondary"
            >
              Contacto
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
