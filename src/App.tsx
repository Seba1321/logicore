import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
// Visit es un hub de enlaces que se abre escribiendo la URL directamente.
// Lo cargamos eagerly (sin lazy) para evitar el flash de "Cargando…" del
// chunk diferido al hacer deep-link a /visit.
import Visit from "./pages/Visit";

const Portal = lazy(() => import("./pages/Portal"));
const Team = lazy(() => import("./pages/Team"));
const Projects = lazy(() => import("./pages/Projects"));
const Research = lazy(() => import("./pages/Research"));
const Privacy = lazy(() => import("./pages/Privacy"));
const BpmnViewerPage = lazy(() => import("./pages/BpmnViewerPage"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500">
      Cargando…
    </span>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/equipo" element={<Team />} />
            <Route path="/proyectos" element={<Projects />} />
            <Route path="/research" element={<Research />} />
            <Route path="/privacidad" element={<Privacy />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/portal/bpmn/:diagramId" element={<BpmnViewerPage />} />
            <Route path="/visit" element={<Visit />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
