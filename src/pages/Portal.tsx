import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticleNetwork } from "@/components/ui/ParticleNetwork";
import { PortalDashboard } from "@/components/portal/PortalDashboard";
import { toast } from "@/hooks/use-toast";
import { clearPortalSession, getPortalSession, savePortalSession } from "@/lib/portal-session";
import { isSupabaseConfigured, supabase, type EmpresaLogin, type PortalData } from "@/lib/supabase";

const Portal = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [empresaSession, setEmpresaSession] = useState<EmpresaLogin | null>(null);
  const [portalData, setPortalData] = useState<PortalData | null>(null);

  const loadPortalData = async (sessionToken: string) => {
    if (!supabase) return null;

    setIsLoadingPortal(true);

    const { data, error } = await supabase.rpc("get_portal_empresa", {
      p_session_token: sessionToken,
    });

    setIsLoadingPortal(false);

    if (error || !data) {
      clearPortalSession();
      toast({
        title: "No se pudo cargar el portal",
        description: "La sesión expiró o falta ejecutar el SQL actualizado del portal.",
        variant: "destructive",
      });
      return null;
    }

    const nextPortalData = data as PortalData;
    setPortalData(nextPortalData);
    return nextPortalData;
  };

  useEffect(() => {
    const savedSession = getPortalSession();
    if (!savedSession) return;
    setEmpresaSession(savedSession);
    loadPortalData(savedSession.session_token);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      toast({
        title: "Supabase no configurado",
        description: "Agrega VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en tu archivo .env.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase.rpc("login_empresa", {
      p_usuario: username.trim(),
      p_password: password,
    });

    setPassword("");

    if (error) {
      setIsSubmitting(false);
      toast({
        title: "No se pudo ingresar",
        description: "Revisa tu conexión a internet e intenta nuevamente.",
        variant: "destructive",
      });
      return;
    }

    const empresa = Array.isArray(data) ? data[0] : null;

    if (!empresa?.session_token) {
      setIsSubmitting(false);
      toast({
        title: "Credenciales inválidas",
        description: "La empresa, el usuario o la contraseña no coinciden.",
        variant: "destructive",
      });
      return;
    }

    const nextSession = empresa as EmpresaLogin;
    savePortalSession(nextSession);
    setEmpresaSession(nextSession);
    await loadPortalData(nextSession.session_token);
    setIsSubmitting(false);

    toast({
      title: `Bienvenido, ${nextSession.empresa}`,
      description: "Acceso validado correctamente.",
    });
  };

  const handleLogout = async () => {
    if (supabase && empresaSession?.session_token) {
      await supabase.rpc("logout_empresa", { p_session_token: empresaSession.session_token });
    }

    clearPortalSession();
    setEmpresaSession(null);
    setPortalData(null);
  };

  if (!empresaSession) {
    return (
      <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#03060f] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#03060f_0%,#06112e_32%,#103183_70%,#1e50d6_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_40%,rgba(96,150,255,0.32),transparent_62%)]" />
        </div>
        <ParticleNetwork className="opacity-90" particleCount={110} speed={0.3} />
        <div className="container-tight relative z-10 flex min-h-screen flex-col py-6 md:py-8">
          <PortalPublicHeader />
          <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1fr_430px] lg:py-20">
            <div className="max-w-2xl">
              <p className="mb-6 inline-flex items-center gap-2.5 font-display text-[11px] font-medium uppercase tracking-[0.14em] text-sky-200/70">
                <span className="h-1 w-1 rounded-full bg-sky-300" />
                Portal privado para clientes
              </p>
              <h1 className="font-display text-[clamp(2.4rem,5.5vw,4rem)] font-semibold leading-[1.08] tracking-tight">
                Acceso para empresas que trabajan con Methodical
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-blue-100/65">
                Ingresa con las credenciales entregadas por nuestro equipo para revisar avance, BPMN, hallazgos e informes del levantamiento.
              </p>
            </div>

            <div className="rounded-sm border border-white/10 bg-white p-6 text-foreground md:p-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <p className="font-display text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Acceso clientes</p>
                  <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">Ingresar al portal</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Usa el nombre de tu empresa o tu usuario asignado.</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="portal-usuario">Empresa o usuario</Label>
                    <Input
                      id="portal-usuario"
                      type="text"
                      autoComplete="username"
                      placeholder="Nombre de empresa o usuario"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portal-contrasena">Contraseña</Label>
                    <Input
                      id="portal-contrasena"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="mt-7 w-full bg-blue-600 hover:bg-blue-500" disabled={isSubmitting}>
                  {isSubmitting ? "Validando..." : "Ingresar"}
                </Button>
                <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
                  Si todavía no tienes credenciales, solicítalas a tu contacto Methodical.
                </p>
              </form>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <PortalDashboard
      session={empresaSession}
      data={portalData}
      isLoading={isLoadingPortal}
      onLogout={handleLogout}
    />
  );
};

const PortalPublicHeader = () => (
  <nav className="flex items-center justify-between gap-4">
    <Link to="/" aria-label="Volver al inicio de Methodical">
      <img src="/logo-transparente.png" alt="Methodical" className="h-9 w-auto object-contain brightness-0 invert" />
    </Link>
    <Link
      to="/"
      className="rounded-sm border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
    >
      Volver al sitio
    </Link>
  </nav>
);

export default Portal;
