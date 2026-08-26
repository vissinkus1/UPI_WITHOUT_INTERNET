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
      { x: 0.15, y: 0.3, label: '📱', radius: 18, color: '#3b82f6' },
      { x: 0.35, y: 0.15, label: '📱', radius: 14, color: '#8b5cf6' },
      { x: 0.55, y: 0.4, label: '📱', radius: 16, color: '#6366f1' },
      { x: 0.3, y: 0.65, label: '📱', radius: 14, color: '#a78bfa' },
      { x: 0.7, y: 0.2, label: '📱', radius: 15, color: '#818cf8' },
      { x: 0.8, y: 0.55, label: '📡', radius: 20, color: '#10b981' },
      { x: 0.5, y: 0.75, label: '📱', radius: 13, color: '#7c3aed' },
      { x: 0.9, y: 0.8, label: '🏦', radius: 22, color: '#06b6d4' },
    ];

    const connections = [
      [0, 1], [0, 3], [1, 2], [1, 4], [2, 4], [2, 5],
      [3, 2], [3, 6], [4, 5], [5, 7], [6, 5],
    ];

    // Traveling packets
    const packets = [
      { from: 0, to: 1, speed: 0.008, offset: 0 },
      { from: 1, to: 2, speed: 0.006, offset: 0.3 },
      { from: 2, to: 5, speed: 0.007, offset: 0.6 },
      { from: 5, to: 7, speed: 0.009, offset: 0.1 },
      { from: 3, to: 6, speed: 0.005, offset: 0.5 },
      { from: 4, to: 5, speed: 0.007, offset: 0.8 },
    ];

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function draw() {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);
      time += 0.01;

      // Draw connections
      connections.forEach(([a, b]) => {
        const na = nodes[a], nb = nodes[b];
        ctx.beginPath();
        ctx.moveTo(na.x * w, na.y * h);
        ctx.lineTo(nb.x * w, nb.y * h);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Draw traveling packets
      packets.forEach(p => {
        const progress = ((time * p.speed * 60 + p.offset) % 1);
        const na = nodes[p.from], nb = nodes[p.to];
        const px = na.x + (nb.x - na.x) * progress;
        const py = na.y + (nb.y - na.y) * progress;
        const alpha = Math.sin(progress * Math.PI);

        ctx.beginPath();
        ctx.arc(px * w, py * h, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${alpha * 0.8})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(px * w, py * h, 10, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${alpha * 0.15})`;
        ctx.fill();
      });

      // Draw nodes
      nodes.forEach((node, i) => {
        const nx = node.x * w;
        const ny = node.y * h;
        const bobY = Math.sin(time * 2 + i * 0.8) * 3;

        // Outer glow
        ctx.beginPath();
        ctx.arc(nx, ny + bobY, node.radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = node.color.replace(')', ', 0.08)').replace('rgb', 'rgba');
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(nx, ny + bobY, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
        ctx.fill();
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Emoji
        ctx.font = `${node.radius * 0.9}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, nx, ny + bobY);
      });

      animationId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[350px]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
