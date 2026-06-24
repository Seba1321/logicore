import { useState } from "react";
import emailjs from "@emailjs/browser";
import { CheckCircle, Loader2, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { CornerTicks, Reveal } from "@/components/portal/technical";
import { SectionHeader } from "./shared";

const contactSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100),
  company: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Por favor ingresa un correo válido").max(255),
  message: z.string().trim().min(1, "El mensaje es requerido").max(1000),
});

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID ?? "service_ewjy8v4";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? "template_5oeim7f";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? "1hwX9roA229eqVHMh";

export const ContactSection = () => {
  const [formData, setFormData] = useState({ name: "", company: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: formData.name,
          company: formData.company,
          email: formData.email,
          message: formData.message,
        },
        EMAILJS_PUBLIC_KEY
      );
      setIsSubmitted(true);
      toast.success("¡Mensaje enviado! Te contactaremos pronto");
    } catch {
      toast.error("Error enviando el mensaje");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="relative overflow-hidden bg-slate-50 py-24 md:py-32">
      <div className="container-tight">
        <SectionHeader
          index="05"
          eyebrow="Contacto"
          title="Hablemos"
          lead="¿Tienes un proyecto en mente o quieres saber cómo podemos ayudar a tu empresa? Escríbenos y te respondemos en menos de 24 horas."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <Reveal>
            <div className="relative overflow-hidden rounded-sm border border-white/10 bg-[#03060f] p-8 text-white md:p-10">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#03060f_0%,#071330_60%,#0c2a78_100%)]" />
              <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />
              <CornerTicks className="text-white/15" />

              <div className="relative">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-blue-200/70">
                  Canales directos
                </p>
                <p className="mt-5 max-w-md font-display text-2xl font-semibold leading-snug tracking-tight">
                  Conversemos sobre cómo simplificar y escalar tu operación.
                </p>

                <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
                  <ContactRow
                    icon={<Mail size={16} strokeWidth={1.6} />}
                    label="Email"
                    value="contacto@methodical.cl"
                    href="mailto:contacto@methodical.cl"
                  />
                  <ContactRow
                    icon={<MessageCircle size={16} strokeWidth={1.6} />}
                    label="WhatsApp"
                    value="+56 9 6195 0578"
                    href="https://wa.me/56961950578?text=Hola%2C%20me%20gustar%C3%ADa%20saber%20m%C3%A1s%20sobre%20sus%20servicios."
                  />
                  <ContactRow
                    icon={<MapPin size={16} strokeWidth={1.6} />}
                    label="Ubicación"
                    value="Santiago, Chile"
                  />
                </ul>

              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            {isSubmitted ? (
              <div className="relative h-full rounded-sm border border-slate-200 bg-white p-8 text-center md:p-10">
                <CornerTicks className="text-slate-200" />
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-sm border border-emerald-200 bg-emerald-50 text-emerald-600">
                  <CheckCircle size={22} strokeWidth={1.6} />
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-slate-950">
                  Mensaje enviado
                </h3>
                <p className="mt-3 text-sm text-slate-500">
                  Gracias por contactarnos. Te responderemos dentro de las próximas 24 horas.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: "", company: "", email: "", message: "" });
                  }}
                  className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-blue-600 transition-colors hover:text-blue-700"
                >
                  Enviar otro mensaje →
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="relative rounded-sm border border-slate-200 bg-white p-8 md:p-10"
              >
                <CornerTicks className="text-slate-200" />
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-400">
                  Formulario
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-slate-950">
                  Cuéntanos tu proyecto
                </h3>

                <div className="mt-7 space-y-5">
                  <Field label="Nombre" name="name" required value={formData.name} error={errors.name} onChange={handleChange} placeholder="Tu nombre" />
                  <Field label="Empresa" name="company" value={formData.company} onChange={handleChange} placeholder="Nombre de tu empresa" />
                  <Field label="Correo electrónico" name="email" type="email" required value={formData.email} error={errors.email} onChange={handleChange} placeholder="tu@email.com" />
                  <FieldTextarea label="Mensaje" name="message" required value={formData.message} error={errors.message} onChange={handleChange} placeholder="Cuéntanos en qué podemos ayudarte..." />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-blue-600 px-5 py-3 font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      Enviar mensaje <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
};

const ContactRow = ({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) => {
  const content = (
    <>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-white/15 text-blue-100">
        {icon}
      </span>
      <span className="flex flex-1 flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue-200/60">{label}</span>
        <span className="text-sm text-white">{value}</span>
      </span>
    </>
  );
  return (
    <li>
      {href ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="flex items-center gap-4 py-4 transition-colors hover:bg-white/[0.03]"
        >
          {content}
        </a>
      ) : (
        <div className="flex items-center gap-4 py-4">{content}</div>
      )}
    </li>
  );
};

type FieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
};

const Field = ({ label, name, value, onChange, type = "text", placeholder, required, error }: FieldProps) => (
  <div>
    <label htmlFor={name} className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
      {label} {required && <span className="text-blue-600">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full rounded-sm border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600/40 ${
        error ? "border-red-400" : "border-slate-200"
      }`}
    />
    {error && <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-500">{error}</p>}
  </div>
);

const FieldTextarea = ({ label, name, value, onChange, placeholder, required, error }: Omit<FieldProps, "type">) => (
  <div>
    <label htmlFor={name} className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
      {label} {required && <span className="text-blue-600">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      rows={4}
      placeholder={placeholder}
      className={`w-full resize-none rounded-sm border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600/40 ${
        error ? "border-red-400" : "border-slate-200"
      }`}
    />
    {error && <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-500">{error}</p>}
  </div>
);
