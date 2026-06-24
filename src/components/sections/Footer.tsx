import { Instagram, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const navColumns: Array<{ title: string; links: Array<{ label: string; href: string; external?: boolean }> }> = [
  {
    title: "Navegación",
    links: [
      { label: "Inicio", href: "#inicio" },
      { label: "Servicios", href: "#servicios" },
      { label: "Proyectos", href: "#proyectos" },
      { label: "Equipo", href: "/equipo", external: true },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Por qué Methodical", href: "#porque" },
      { label: "Contacto", href: "#contacto" },
      { label: "Portal clientes", href: "/portal", external: true },
      { label: "Política de privacidad", href: "/privacidad", external: true },
    ],
  },
  {
    title: "Contacto",
    links: [
      { label: "contacto@methodical.cl", href: "mailto:contacto@methodical.cl", external: true },
      { label: "+56 9 6195 0578", href: "https://wa.me/56961950578", external: true },
      { label: "Santiago, Chile", href: "#" },
    ],
  },
];

const socials = [
  { Icon: Linkedin, href: "https://www.linkedin.com/company/methodicalchile/", label: "LinkedIn" },
  { Icon: Instagram, href: "https://www.instagram.com/methodical.cl", label: "Instagram" },
  { Icon: Mail, href: "mailto:contacto@methodical.cl", label: "Email" },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative overflow-hidden bg-[#03060f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="container-tight relative py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.2fr_2fr]">
          <div>
            <img
              src="/logo-transparente.png"
              alt="Methodical"
              className="h-10 w-auto object-contain brightness-0 invert"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-blue-50/65">
              Automatización, datos y procesos para empresas que quieren operar mejor.
            </p>
            <div className="mt-7 flex items-center gap-2">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-sm border border-white/15 text-blue-100 transition-colors hover:border-blue-400/60 hover:text-white"
                >
                  <Icon size={15} strokeWidth={1.6} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {navColumns.map((column) => (
              <div key={column.title}>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-blue-200/60">
                  {column.title}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {column.links.map((link) => {
                    const isHash = link.href.startsWith("#");
                    const isInternal = link.href.startsWith("/");
                    const isExternal = link.href.startsWith("http") || link.href.startsWith("mailto:");

                    if (isInternal) {
                      return (
                        <li key={link.label}>
                          <Link to={link.href} className="text-sm text-blue-50/70 transition-colors hover:text-white">
                            {link.label}
                          </Link>
                        </li>
                      );
                    }

                    if (isExternal) {
                      return (
                        <li key={link.label}>
                          <a
                            href={link.href}
                            target={link.href.startsWith("http") ? "_blank" : undefined}
                            rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="text-sm text-blue-50/70 transition-colors hover:text-white"
                          >
                            {link.label}
                          </a>
                        </li>
                      );
                    }

                    return (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          onClick={(event) => {
                            if (!isHash) return;
                            event.preventDefault();
                            scrollToSection(link.href);
                          }}
                          className="text-sm text-blue-50/70 transition-colors hover:text-white"
                        >
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue-200/50">
            © {currentYear} Methodical · Santiago, Chile
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue-200/40">
            MTHDCL · v{currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
};
