import { useEffect, useRef } from "react";

interface ParticleNetworkProps {
  particleCount?: number;
  interactionDistance?: number;
  className?: string;
  speed?: number;
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number; // depth 0 (far) .. 1 (near)
  sx: number; // intro scatter offset
  sy: number;
  rx: number; // last rendered x (used for connections)
  ry: number;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const ParticleNetwork = ({
  particleCount = 100,
  interactionDistance = 150,
  className = "",
  speed = 0.4,
}: ParticleNetworkProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let particles: Particle[] = [];
    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let introStart = 0;

    const mouse = { x: -9999, y: -9999, nx: 0, ny: 0, active: false };
    const parallax = { x: 0, y: 0 };

    // Flow-field tuning (organic, swirling drift).
    const FLOW_SCALE = 0.0015; // spatial frequency of the field
    const FLOW_STRENGTH = 0.03 * (speed / 0.4);
    const MAX_SPEED = 0.55 * (speed / 0.4);
    const CURSOR_RADIUS = 170;

    const initParticles = () => {
      width = container.clientWidth;
      height = container.clientHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const baseArea = 1920 * 1080;
      const densityFactor = Math.max(0.5, Math.min(1.5, (width * height) / baseArea));
      const count = Math.max(40, Math.floor(particleCount * densityFactor));

      particles = [];
      for (let i = 0; i < count; i++) {
        const z = Math.random();
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0,
          vy: 0,
          z,
          sx: (Math.random() - 0.5) * 120,
          sy: (Math.random() - 0.5) * 120,
          rx: 0,
          ry: 0,
        });
      }
      introStart = performance.now();
    };

    const step = (now: number) => {
      const intro = prefersReducedMotion ? 1 : Math.min(1, (now - introStart) / 1100);
      const e = easeOutCubic(intro);
      const t = now * 0.00018;

      parallax.x += (mouse.nx - parallax.x) * 0.05;
      parallax.y += (mouse.ny - parallax.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (!prefersReducedMotion) {
          // Curl-like flow field: smooth, swirling, deterministic.
          const ax = Math.cos(p.y * FLOW_SCALE + t + p.z * 2);
          const ay = Math.sin(p.x * FLOW_SCALE - t + p.z * 2);
          p.vx += ax * FLOW_STRENGTH * (0.6 + p.z);
          p.vy += ay * FLOW_STRENGTH * (0.6 + p.z);

          // Gentle pull toward the cursor.
          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const d = Math.hypot(dx, dy);
            if (d > 0 && d < interactionDistance) {
              const f = (interactionDistance - d) / interactionDistance;
              p.vx -= (dx / d) * f * 0.08;
              p.vy -= (dy / d) * f * 0.08;
            }
          }

          p.vx *= 0.96;
          p.vy *= 0.96;

          const sp = Math.hypot(p.vx, p.vy);
          const max = MAX_SPEED * (0.5 + p.z);
          if (sp > max) {
            p.vx = (p.vx / sp) * max;
            p.vy = (p.vy / sp) * max;
          }

          p.x += p.vx;
          p.y += p.vy;

          // Wrap around the edges for continuous, organic flow.
          if (p.x < -12) p.x = width + 12;
          else if (p.x > width + 12) p.x = -12;
          if (p.y < -12) p.y = height + 12;
          else if (p.y > height + 12) p.y = -12;
        }

        const par = 22 * p.z;
        const rx = p.x + p.sx * (1 - e) + parallax.x * par;
        const ry = p.y + p.sy * (1 - e) + parallax.y * par;
        p.rx = rx;
        p.ry = ry;

        const radius = 0.6 + p.z * 1.7;
        ctx.beginPath();
        ctx.arc(rx, ry, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226,237,255,${e * (0.3 + 0.45 * p.z)})`;
        ctx.fill();
      }

      // Particle-to-particle mesh.
      const maxDist = 124;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.rx - b.rx;
          const dy = a.ry - b.ry;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxDist * maxDist) {
            const d = Math.sqrt(d2);
            const opacity = 0.12 * (1 - d / maxDist) * e * Math.min(a.z, b.z + 0.25);
            if (opacity <= 0.008) continue;
            ctx.strokeStyle = `rgba(165,198,255,${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.rx, a.ry);
            ctx.lineTo(b.rx, b.ry);
            ctx.stroke();
          }
        }
      }

      // Cursor constellation: weave nearby particles toward the pointer.
      if (mouse.active && !prefersReducedMotion) {
        for (const p of particles) {
          const dx = p.rx - mouse.x;
          const dy = p.ry - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < CURSOR_RADIUS * CURSOR_RADIUS) {
            const d = Math.sqrt(d2);
            const opacity = 0.16 * (1 - d / CURSOR_RADIUS) * e;
            if (opacity <= 0.008) continue;
            ctx.strokeStyle = `rgba(180,205,255,${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.rx, p.ry);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      if (!prefersReducedMotion) animationFrameId = requestAnimationFrame(step);
    };

    const start = () => {
      cancelAnimationFrame(animationFrameId);
      if (prefersReducedMotion) {
        step(performance.now());
      } else {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    const handleResize = () => {
      initParticles();
      start();
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.nx = width ? (mouse.x / width) * 2 - 1 : 0;
      mouse.ny = height ? (mouse.y / height) * 2 - 1 : 0;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else if (!prefersReducedMotion) {
        introStart = performance.now();
        animationFrameId = requestAnimationFrame(step);
      }
    };

    initParticles();
    start();

    window.addEventListener("resize", handleResize);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [particleCount, interactionDistance, speed]);

  return (
    <div ref={containerRef} className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
};
