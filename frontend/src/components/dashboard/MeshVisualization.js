'use client';
import { useEffect, useRef } from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { DEVICE_POSITIONS, MESH_CONNECTIONS } from '@/lib/constants';

export default function MeshVisualization({ meshState }) {
  const canvasRef = useRef(null);
  const devicesData = meshState?.devices || [];

  // Build a lookup
  const deviceMap = {};
  devicesData.forEach(d => { deviceMap[d.deviceId] = d; });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    }

    function draw() {
      resize();
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      const dpr = window.devicePixelRatio;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Draw connections
      MESH_CONNECTIONS.forEach(([a, b]) => {
        const pa = DEVICE_POSITIONS[a];
        const pb = DEVICE_POSITIONS[b];
        if (!pa || !pb) return;

        const ax = pa.x / 100 * w, ay = pa.y / 100 * h;
        const bx = pb.x / 100 * w, by = pb.y / 100 * h;

        // Check if both have packets
        const aDevice = deviceMap[a];
        const bDevice = deviceMap[b];
        const active = aDevice?.packetCount > 0 && bDevice?.packetCount > 0;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = active ? 'rgba(59, 130, 246, 0.4)' : 'rgba(148, 163, 184, 0.1)';
        ctx.lineWidth = active ? 2 : 1;
        if (active) {
          ctx.setLineDash([5, 5]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw nodes
      Object.entries(DEVICE_POSITIONS).forEach(([id, pos]) => {
        const x = pos.x / 100 * w;
        const y = pos.y / 100 * h;
        const device = deviceMap[id];
        const hasPackets = device?.packetCount > 0;
        const isBridge = device?.hasInternet;
        const radius = isBridge ? 28 : 22;

        // Outer glow
        if (hasPackets) {
          const grad = ctx.createRadialGradient(x, y, radius, x, y, radius + 16);
          grad.addColorStop(0, isBridge ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.12)');
          grad.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(x, y, radius + 16, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(17, 24, 39, 0.95)';
        ctx.fill();
        ctx.strokeStyle = isBridge ? '#10b981' : hasPackets ? '#3b82f6' : 'rgba(148,163,184,0.25)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Icon
        ctx.font = `${radius * 0.7}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isBridge ? '📡' : '📱', x, y);

        // Label
        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
        ctx.fillText(pos.label, x, y + radius + 14);

        // Packet count badge
        if (hasPackets) {
          const badgeX = x + radius * 0.7;
          const badgeY = y - radius * 0.7;
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, 10, 0, Math.PI * 2);
          ctx.fillStyle = isBridge ? '#10b981' : '#3b82f6';
          ctx.fill();
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(device.packetCount), badgeX, badgeY);
        }
      });
    }

    draw();
    const interval = setInterval(draw, 500);
    window.addEventListener('resize', draw);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', draw);
    };
  }, [meshState]);

  return (
    <Card glow="blue" className="h-full">
      <CardHeader icon="📱">
        Mesh Network
        <Badge variant="blue" className="ml-2">{devicesData.length} devices</Badge>
      </CardHeader>

      <div className="relative w-full" style={{ minHeight: '320px' }}>
        <canvas ref={canvasRef} className="w-full h-full absolute inset-0" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[var(--accent-emerald)]"></span>
          Bridge (4G)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[var(--accent-blue)]"></span>
          Has packets
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border border-[var(--border-default)]"></span>
          Idle
        </div>
        <div className="ml-auto text-[var(--text-muted)]">
          Cache: {meshState?.idempotencyCacheSize ?? 0}
        </div>
      </div>
    </Card>
  );
}
