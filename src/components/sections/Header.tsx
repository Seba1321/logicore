import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

type NavLink = { name: string; href: string; route?: boolean };

const navLinks: NavLink[] = [
  { name: "Inicio", href: "#inicio" },
  { name: "Servicios", href: "#servicios" },
  { name: "Proyectos", href: "/proyectos", route: true },
  { name: "Equipo", href: "/equipo", route: true },
  { name: "Por qué Methodical", href: "#porque" },
  { name: "Investigación", href: "/research", route: true },
];

const sectionIds = navLinks.filter((l) => !l.route).map((l) => l.href.slice(1));
// También observamos #contacto para que el subrayado se libere al llegar ahí
// (no hay link de nav para contacto, así que ninguno queda activo).
const observedSectionIds = [...sectionIds, "contacto"];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    observedSectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.35 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollToSection = (href: string) => {
    setIsMobileMenuOpen(false);
    if (!isHome) {
      navigate(`/${href}`);
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Transparent over the dark hero; solidifies once the user scrolls (or opens the menu).
  const onHero = !isScrolled && !isMobileMenuOpen;

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        onHero
          ? "border-b border-white/10 bg-[#05070f]/60 backdrop-blur-md"
          : "border-b border-border bg-background/85 shadow-sm backdrop-blur-md"
      }`}
    >
      <div className="container-tight">
        <nav className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#inicio");
            }}
            className="flex items-center"
          >
            <img
              src="/logo-transparente.png"
              alt="Methodical"
              className={`h-10 w-auto object-contain transition ${onHero ? "brightness-0 invert" : ""}`}
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-4 lg:flex xl:gap-6">
            {navLinks.map((link) => {
              const isActive = link.route
                ? location.pathname === link.href || location.pathname.startsWith(`${link.href}/`)
                : isHome && activeSection === link.href.slice(1);
              const linkClass = `whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? onHero
                    ? "border-b-2 border-blue-400 pb-0.5 text-white"
                    : "border-b-2 border-blue-600 pb-0.5 font-semibold text-foreground"
                  : onHero
                    ? "text-white/70 hover:text-white"
                    : "text-muted-foreground hover:text-foreground"
              }`;
              if (link.route) {
                return (
                  <Link key={link.name} to={link.href} className={linkClass}>
                    {link.name}
                  </Link>
                );
              }
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className={linkClass}
                >
                  {link.name}
                </a>
              );
            })}
            <Link
              to="/portal"
              className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                onHero
                  ? "border-white/20 text-white/90 hover:bg-white/10"
                  : "border-border text-foreground/80 hover:bg-secondary"
              }`}
            >
              Acceso empresas
            </Link>
            <a
              href="#contacto"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#contacto");
              }}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Contáctanos
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`-mr-3 p-3 lg:hidden ${onHero ? "text-white" : "text-foreground"}`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border bg-background lg:hidden"
          >
            <div className="container-tight flex flex-col gap-4 py-4">
              {navLinks.map((link) => {
                const isActive = link.route
                  ? location.pathname === link.href || location.pathname.startsWith(`${link.href}/`)
                  : isHome && activeSection === link.href.slice(1);
                const mobileClass = `py-2 text-base font-medium transition-colors ${
                  isActive
                    ? "border-l-2 border-blue-600 pl-3 font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`;
                return link.route ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={mobileClass}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    className={mobileClass}
                  >
                    {link.name}
                  </a>
                );
              })}
              <Link
                to="/portal"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md border border-border px-6 py-3 text-center font-medium text-foreground/80 transition-colors hover:bg-secondary"
              >
                Acceso empresas
              </Link>
              <a
                href="#contacto"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("#contacto");
                }}
                className="mt-2 rounded-md bg-blue-600 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-blue-500"
              >
                Contáctanos
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
