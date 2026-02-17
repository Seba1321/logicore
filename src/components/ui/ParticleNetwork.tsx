import { useEffect, useRef } from "react";

interface ParticleNetworkProps {
  particleCount?: number;
  interactionDistance?: number;
  className?: string;
  speed?: number;
}

export const ParticleNetwork = ({
  particleCount = 100,
  interactionDistance = 120,
  className = "",
  speed = 0.5,
}: ParticleNetworkProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseVx: number;
      baseVy: number;
    }[] = [];
    
    let animationFrameId: number;
    let width = 0;
    let height = 0;
    
    // Mouse state
    const mouse = { x: -1000, y: -1000 };

    const initParticles = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      
      // Handle high DPI displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      particles = [];
      
      // Adaptive density: Scale particle count based on screen area relative to 1080p
      const baseArea = 1920 * 1080;
      const currentArea = width * height;
      const densityFactor = Math.max(0.6, Math.min(2.0, currentArea / baseArea));
      const calculatedCount = Math.floor(particleCount * densityFactor);

      for (let i = 0; i < (calculatedCount < 40 ? 40 : calculatedCount); i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          baseVx: (Math.random() - 0.5) * speed,
          baseVy: (Math.random() - 0.5) * speed,
        });
      }
    };

    const handleResize = () => {
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw particles
      particles.forEach((p, i) => {
        // Interaction with mouse (Repel)
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < interactionDistance) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (interactionDistance - distance) / interactionDistance;
          
          p.vx += forceDirectionX * force * 0.5;
          p.vy += forceDirectionY * force * 0.5;
        }

        // Return to base speed (friction)
        p.vx = p.vx * 0.95 + p.baseVx * 0.05;
        p.vy = p.vy * 0.95 + p.baseVy * 0.05;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Boundary bounce
        if (p.x < 0 || p.x > width) {
            p.vx = -p.vx;
            p.baseVx = -p.baseVx;
        }
        if (p.y < 0 || p.y > height) {
            p.vy = -p.vy;
            p.baseVy = -p.baseVy;
        }

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2); // Increased size
        ctx.fillStyle = "rgba(100, 220, 255, 0.8)"; // Brighter, higher opacity
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(100, 220, 255, 0.5)";
        ctx.fill();
        
        // Reset shadow for lines to optimize performance
        ctx.shadowBlur = 0;

        // Draw connections
        const connectionDist = 150; // Increased connection distance
        
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx2 = p.x - p2.x;
            const dy2 = p.y - p2.y;
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

            if (dist2 < connectionDist) {
                ctx.beginPath();
                // Increased opacity and thickness
                const opacity = 0.5 * (1 - dist2 / connectionDist);
                ctx.strokeStyle = `rgba(100, 220, 255, ${opacity})`;
                ctx.lineWidth = 1.0; 
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // Initialize
    initParticles();
    animate();

    // Listeners
    window.addEventListener("resize", handleResize);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [particleCount, interactionDistance, speed]);

  return (
    <div ref={containerRef} className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
