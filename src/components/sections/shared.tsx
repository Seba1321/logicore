import type { ReactNode } from "react";

import { Reveal } from "@/components/portal/technical";

type SectionHeaderProps = {
  index: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
};

export const SectionHeader = ({
  index,
  eyebrow,
  title,
  lead,
  align = "left",
  tone = "light",
}: SectionHeaderProps) => {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";
  const eyebrowColor = tone === "dark" ? "text-blue-200/70" : "text-slate-400";
  const dotColor = tone === "dark" ? "bg-sky-300" : "bg-blue-500";
  const titleColor = tone === "dark" ? "text-white" : "text-slate-950";
  const leadColor = tone === "dark" ? "text-blue-50/70" : "text-slate-500";

  return (
    <Reveal>
      <div className={`flex flex-col gap-5 ${alignment}`}>
        <p className={`inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.3em] ${eyebrowColor}`}>
          <span className={`h-1 w-1 rounded-full ${dotColor}`} />
          {index} — {eyebrow}
        </p>
        <h2 className={`font-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.05] tracking-tight ${titleColor}`}>
          {title}
        </h2>
        {lead && (
          <p className={`max-w-2xl text-base leading-relaxed sm:text-lg ${leadColor}`}>
            {lead}
          </p>
        )}
      </div>
    </Reveal>
  );
};
