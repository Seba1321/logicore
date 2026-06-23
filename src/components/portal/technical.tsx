import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Scroll-reveal wrapper with a subtle rise + fade. Respects reduced motion. */
export const Reveal = ({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

/** Number that counts up once it scrolls into view. */
export const CountUp = ({
  value,
  className,
  suffix = "",
}: {
  value: number;
  className?: string;
  suffix?: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
};

/** Decorative blueprint corner marks for a panel (needs a relative parent). */
export const CornerTicks = ({ className = "text-slate-300" }: { className?: string }) => (
  <span aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
    <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-current" />
    <span className="absolute right-0 top-0 h-2.5 w-2.5 border-r border-t border-current" />
    <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-current" />
    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-current" />
  </span>
);
