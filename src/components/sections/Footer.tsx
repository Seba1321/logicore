import { Linkedin, Instagram, Mail } from "lucide-react";

const footerNav = [
  { name: "Inicio", href: "#inicio" },
  { name: "Servicios", href: "#servicios" },
  { name: "Proyectos", href: "#proyectos" },
  { name: "Equipo", href: "#equipo" },
  { name: "Por qué Methodical", href: "#porque" },
  { name: "Contacto", href: "#contacto" },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container-tight">
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left justify-between gap-10">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <p className="text-xl font-bold mb-1">Methodical</p>
            <p className="text-sm opacity-70 mb-4">
              Automatización y datos para PYMEs
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/company/methodicalchile/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={16} />
              </a>
              <a
                href="https://www.instagram.com/methodical.cl"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="mailto:hola@methodical.cl"
                className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Nav links */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest opacity-50 mb-4">
              Navegación
            </p>
            <ul className="space-y-2">
              {footerNav.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest opacity-50 mb-4">
              Contacto
            </p>
            <p className="text-sm opacity-70">hola@methodical.cl</p>
            <p className="text-sm opacity-70 mt-1">Santiago, Chile</p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-background/10 text-center">
          <p className="text-sm opacity-70">
            © {currentYear} Methodical. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
