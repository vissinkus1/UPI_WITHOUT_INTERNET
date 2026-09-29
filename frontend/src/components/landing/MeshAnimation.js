'use client';
import { useEffect, useRef } from 'react';

export default function MeshAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    const nodes = [
      { x: 0.10, y: 0.48, label: '📱', name: 'Alice (Basement)', radius: 22, color: '#2997ff' },
      { x: 0.30, y: 0.24, label: '🚶', name: 'Stranger 1 (Stairs)', radius: 18, color: '#a1a1a6' },
      { x: 0.50, y: 0.52, label: '🚶', name: 'Stranger 2 (Lobby)', radius: 18, color: '#a1a1a6' },
      { x: 0.28, y: 0.76, label: '🚶', name: 'Stranger 3 (Parking)', radius: 18, color: '#a1a1a6' },
      { x: 0.72, y: 0.38, label: '📡', name: 'Bridge Node (4G)', radius: 24, color: '#30d158' },
      { x: 0.90, y: 0.64, label: '🏦', name: 'Banking Ledger', radius: 24, color: '#bf5af2' },
    ];

    const connections = [
      [0, 1], [0, 3], [1, 2], [3, 2], [2, 4], [3, 4], [4, 5]
    ];

    const packets = [
      { from: 0, to: 1, speed: 0.007, offset: 0, color: '#2997ff' },
      { from: 1, to: 2, speed: 0.006, offset: 0.3, color: '#2997ff' },
      { from: 2, to: 4, speed: 0.008, offset: 0.6, color: '#2997ff' },
      { from: 4, to: 5, speed: 0.010, offset: 0.85, color: '#30d158' },
      { from: 0, to: 3, speed: 0.005, offset: 0.5, color: '#2997ff' },
      { from: 3, to: 4, speed: 0.007, offset: 0.15, color: '#2997ff' },
    ];

    function resize() {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    }

    resize();

    function render() {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      time += 0.01;

      // Draw connection lines
      connections.forEach(([a, b]) => {
        const na = nodes[a], nb = nodes[b];
        const bobA = Math.sin(time * 1.2 + a) * 2;
        const bobB = Math.sin(time * 1.2 + b) * 2;

        ctx.beginPath();
        ctx.moveTo(na.x * w, na.y * h + bobA);
        ctx.lineTo(nb.x * w, nb.y * h + bobB);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      });

      // Draw traveling packet particles
      packets.forEach(p => {
        const progress = ((time * p.speed * 60 + p.offset) % 1);
        const na = nodes[p.from], nb = nodes[p.to];
        const bobA = Math.sin(time * 1.2 + p.from) * 2;
        const bobB = Math.sin(time * 1.2 + p.to) * 2;

        const curX = (na.x + (nb.x - na.x) * progress) * w;
        const curY = (na.y * h + bobA) + ((nb.y * h + bobB) - (na.y * h + bobA)) * progress;

        ctx.beginPath();
        ctx.arc(curX, curY, 4, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw nodes
      nodes.forEach((node, i) => {
        const nx = node.x * w;
        const bobY = Math.sin(time * 1.2 + i) * 2;
        const ny = node.y * h + bobY;

        // Subtle outer glow
        ctx.beginPath();
        ctx.arc(nx, ny, node.radius + 10, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}14`;
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(nx, ny, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(18, 22, 31, 0.94)';
        ctx.fill();
        ctx.strokeStyle = `${node.color}77`;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Emoji
        ctx.font = `${node.radius * 0.72}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, nx, ny);

        // Name label
        ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'rgba(245, 245, 247, 0.85)';
        ctx.fillText(node.name, nx, ny + node.radius + 8);
      });

      animationId = requestAnimationFrame(render);
    }

    render();

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] rounded-2xl bg-black/50 border border-white/[0.08] overflow-hidden select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/[0.1] text-xs font-mono text-[var(--text-secondary)] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse"></span>
        <span>Peer-to-Peer Bluetooth Simulation Active</span>
      </div>
      <div className="absolute bottom-4 right-4 px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/[0.08] text-[11px] font-mono text-[var(--text-muted)] hidden sm:block">
        Zero Cellular Data Required at Origin
      </div>
    </div>
  );
}
