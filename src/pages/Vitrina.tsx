import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { ArrowUpRight, Monitor, Play, Smartphone, Tablet, X } from "lucide-react";

import { CornerTicks, Reveal } from "@/components/portal/technical";
import { supabase, type Vitrina, type VitrinaEstado, type VitrinaItem, type VitrinaTipo } from "@/lib/supabase";
import { canPreviewInline, groupVitrinaItems, toVideoEmbed } from "@/lib/vitrina";

const TIPO_LABEL: Record<VitrinaTipo, string> = {
  web: "Sitio web",
  demo: "Demo",
  video: "Video",
  imagen: "Diseño",
  documento: "Documento",
};

const ESTADO: Record<VitrinaEstado, { label: string; className: string }> = {
  en_diseno: { label: "En diseño", className: "border-violet-200 bg-violet-50 text-violet-700" },
  en_desarrollo: { label: "En desarrollo", className: "border-blue-200 bg-blue-50 text-blue-700" },
  en_revision: { label: "Para tu revisión", className: "border-amber-200 bg-amber-50 text-amber-700" },
  listo: { label: "Listo", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
};

type Device = "escritorio" | "tablet" | "movil";

const DEVICE_WIDTH: Record<Device, string> = {
  escritorio: "100%",
  tablet: "820px",
  movil: "390px",
};

const formatDate = (value: string | null) =>
  value
    ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })
    : null;

const useNoIndex = () => {
  useEffect(() => {
    const tag = document.createElement("meta");
    tag.name = "robots";
    tag.content = "noindex, nofollow";
    document.head.appendChild(tag);
    return () => {
      document.head.removeChild(tag);
    };
  }, []);
};

const VitrinaPage = () => {
  const { token } = useParams();
  const [vitrina, setVitrina] = useState<Vitrina | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [active, setActive] = useState<VitrinaItem | null>(null);

  useNoIndex();

  useEffect(() => {
    if (!supabase || !token) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      const { data } = await supabase.rpc("get_vitrina", { p_token: token });
      if (data) setVitrina(data as Vitrina);
      setIsLoading(false);
    };

    load();
  }, [token]);

  useEffect(() => {
    document.title = vitrina ? `${vitrina.titulo} · Methodical` : "Methodical";
  }, [vitrina]);

  if (isLoading) return <FullPageState text="Cargando…" />;

  if (!vitrina) {
    return <FullPageState text="Este enlace no está disponible. Pídele a tu contacto en Methodical uno vigente." />;
  }

  const groups = groupVitrinaItems(vitrina.items);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="relative overflow-hidden bg-[#03060f] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#03060f_0%,#071330_60%,#0c2a78_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_30%,rgba(96,150,255,0.18),transparent_65%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-8 sm:px-6 md:pb-20">
          <img src="/logo-transparente.png" alt="Methodical" className="h-8 w-auto object-contain brightness-0 invert" />
          <p className="mt-12 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-blue-200/70">
            <span className="h-1 w-1 rounded-full bg-blue-500" />
            — {vitrina.cliente ? `Vitrina · ${vitrina.cliente}` : "Vitrina"}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-semibold tracking-tight md:text-5xl">{vitrina.titulo}</h1>
          {vitrina.mensaje && <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70">{vitrina.mensaje}</p>}
          {vitrina.updated_at && (
            <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
              Actualizado {formatDate(vitrina.updated_at)}
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        {groups.length === 0 && (
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500">— Pronto habrá avances aquí</p>
        )}

        {groups.map((group, groupIndex) => (
          <section key={group.grupo ?? "_"} className={groupIndex > 0 ? "mt-14" : undefined}>
            {group.grupo && (
              <h2 className="mb-6 flex items-baseline gap-3 border-b border-slate-200 pb-3 font-display text-xl font-semibold tracking-tight text-slate-900">
                <span className="font-mono text-[11px] font-normal tracking-[0.2em] text-blue-600">
                  {String(groupIndex + 1).padStart(2, "0")}
                </span>
                {group.grupo}
              </h2>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item, index) => (
                <Reveal key={item.id} delay={Math.min(index, 5) * 0.05}>
                  <ItemCard item={item} onOpen={() => setActive(item)} />
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="border-t border-slate-200 py-8 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
        Methodical · enlace privado, no lo compartas fuera de tu equipo
      </footer>

      {active && <Viewer item={active} onClose={() => setActive(null)} />}
    </div>
  );
};

const ItemCard = ({ item, onOpen }: { item: VitrinaItem; onOpen: () => void }) => {
  const inline = canPreviewInline(item);
  const estado = item.estado ? ESTADO[item.estado] : null;

  return (
    <article className="group relative flex h-full flex-col rounded-sm border border-slate-200 bg-white transition hover:border-blue-600">
      <button
        type="button"
        onClick={inline ? onOpen : undefined}
        disabled={!inline}
        className="relative block aspect-video w-full overflow-hidden border-b border-slate-200 bg-slate-100 text-left disabled:cursor-default"
        aria-label={inline ? `Ver ${item.titulo}` : undefined}
      >
        {item.captura_url || item.tipo === "imagen" ? (
          <img
            src={item.captura_url ?? item.url ?? undefined}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
          />
        ) : (item.tipo === "web" || item.tipo === "demo") && inline ? (
          <LiveThumbnail url={item.url ?? ""} />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#071330] bg-grid-dark">
            <span className="font-display text-lg font-semibold text-white/80">{TIPO_LABEL[item.tipo]}</span>
          </div>
        )}
        {item.tipo === "video" && inline && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#071330] shadow">
              <Play className="h-5 w-5 translate-x-0.5" />
            </span>
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">{TIPO_LABEL[item.tipo]}</span>
          {estado && (
            <span className={`rounded-sm border px-2 py-0.5 font-display text-[11px] font-medium ${estado.className}`}>
              {estado.label}
            </span>
          )}
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-slate-900">{item.titulo}</h3>
        {item.descripcion && <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.descripcion}</p>}
        {item.nota && (
          <p className="mt-3 rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">{item.nota}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
          {inline && (
            <button
              type="button"
              onClick={onOpen}
              className="rounded-sm bg-[#071330] px-4 py-2 font-display text-sm font-medium text-white transition hover:bg-[#1e50d6]"
            >
              Ver aquí
            </button>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-display text-sm font-medium text-slate-700 hover:text-blue-600"
            >
              Abrir en pestaña nueva <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
          {item.fecha && <span className="ml-auto font-mono text-[11px] text-slate-400">{formatDate(item.fecha)}</span>}
        </div>
      </div>
    </article>
  );
};

// Sin captura, la tarjeta muestra el sitio real a escala: así refleja siempre
// lo último publicado. El iframe se pinta a 4x y se reduce, sin interacción.
const LiveThumbnail = ({ url }: { url: string }) => (
  <span className="pointer-events-none absolute inset-0 overflow-hidden bg-white">
    <iframe
      src={url}
      title=""
      tabIndex={-1}
      aria-hidden
      loading="lazy"
      className="h-[400%] w-[400%] origin-top-left scale-[0.25] border-0"
    />
  </span>
);

const Viewer = ({ item, onClose }: { item: VitrinaItem; onClose: () => void }) => {
  const [device, setDevice] = useState<Device>("escritorio");
  const isSite = item.tipo === "web" || item.tipo === "demo";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const url = item.url ?? "";
  let content: ReactNode;
  if (item.tipo === "imagen") {
    content = <img src={url} alt={item.titulo} className="mx-auto max-h-full max-w-full object-contain" />;
  } else if (item.tipo === "video") {
    const embed = toVideoEmbed(url);
    content = embed ? (
      <iframe src={embed} title={item.titulo} className="aspect-video w-full max-w-5xl bg-black" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
    ) : (
      <video src={url} controls autoPlay className="max-h-full max-w-full bg-black" />
    );
  } else {
    content = (
      <iframe
        src={url}
        title={item.titulo}
        className="h-full bg-white shadow-2xl transition-[width] duration-300"
        style={{ width: isSite ? DEVICE_WIDTH[device] : "100%", maxWidth: "100%" }}
      />
    );
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={item.titulo} className="fixed inset-0 z-50 flex flex-col bg-[#03060f]/95 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3 text-white sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-blue-200/60">— {TIPO_LABEL[item.tipo]}</p>
          <p className="truncate font-display text-base font-semibold">{item.titulo}</p>
        </div>
        {isSite && (
          <div role="tablist" aria-label="Tamaño de pantalla" className="hidden rounded-sm border border-white/15 bg-white/10 p-1 sm:inline-flex">
            {(
              [
                ["escritorio", Monitor, "Escritorio"],
                ["tablet", Tablet, "Tablet"],
                ["movil", Smartphone, "Móvil"],
              ] as const
            ).map(([value, Icon, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={device === value}
                aria-label={label}
                title={label}
                onClick={() => setDevice(value)}
                className={`rounded-sm px-3 py-1.5 transition ${device === value ? "bg-white text-[#071330]" : "text-white/70 hover:text-white"}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-sm border border-white/15 px-3 py-1.5 font-display text-sm text-white/80 hover:text-white"
        >
          Pestaña nueva <ArrowUpRight className="h-4 w-4" />
        </a>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-sm p-2 text-white/70 hover:bg-white/10 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-3 sm:p-6">{content}</div>
    </div>
  );
};

const FullPageState = ({ text }: { text: string }) => (
  <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#03060f] p-6 text-white">
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#03060f_0%,#071330_60%,#0c2a78_100%)]" />
    <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />
    <div className="relative max-w-md rounded-sm border border-white/15 bg-white/[0.04] p-8 text-center backdrop-blur-sm">
      <CornerTicks className="text-white/20" />
      <img src="/logo-transparente.png" alt="Methodical" className="mx-auto h-10 w-auto object-contain brightness-0 invert" />
      <p className="mt-6 font-display text-[11px] font-medium uppercase tracking-[0.14em] text-blue-200/60">— Vitrina</p>
      <p className="mt-3 font-display text-lg font-semibold tracking-tight text-white">{text}</p>
    </div>
  </main>
);

export default VitrinaPage;
