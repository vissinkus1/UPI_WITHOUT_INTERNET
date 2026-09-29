'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import NodeInspectorDrawer from './NodeInspectorDrawer';
import PacketInspectorModal from './PacketInspectorModal';
import { DEVICE_METADATA, MESH_CONNECTIONS } from '@/lib/constants';
import { getDevicePackets, setDeviceInternet } from '@/lib/api';

export default function MeshVisualization({ meshState, onGossipHop }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Dynamic node positions that can be dragged by user
  const [positions, setPositions] = useState(() => {
    const initial = {};
    Object.entries(DEVICE_METADATA).forEach(([id, meta]) => {
      initial[id] = { x: meta.x, y: meta.y };
    });
    return initial;
  });

  const [draggingId, setDraggingId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [inspectingPacket, setInspectingPacket] = useState(null);
  const [pingAnimations, setPingAnimations] = useState([]); // [{ id, deviceId, radius, alpha }]

  // Particles animating along mesh lines
  const particlesRef = useRef([]);

  const devicesData = meshState?.devices || [];
  const deviceMap = {};
  devicesData.forEach(d => { deviceMap[d.deviceId] = d; });

  // Reset node positions to default
  const handleResetPositions = () => {
    const initial = {};
    Object.entries(DEVICE_METADATA).forEach(([id, meta]) => {
      initial[id] = { x: meta.x, y: meta.y };
    });
    setPositions(initial);
  };

  // Trigger simulated ping wave from a device
  const handleBroadcastPing = (deviceId) => {
    setPingAnimations(prev => [
      ...prev,
      { id: Math.random(), deviceId, radius: 24, alpha: 1 }
    ]);
  };

  // Spawn animated packet particles across connected nodes
  const spawnHopParticles = useCallback(() => {
    const newParticles = [];
    MESH_CONNECTIONS.forEach(([a, b]) => {
      const pa = positions[a];
      const pb = positions[b];
      const devA = deviceMap[a];
      const devB = deviceMap[b];
      if (pa && pb && (devA?.packetCount > 0 || devB?.packetCount > 0)) {
        newParticles.push({
          fromX: pa.x,
          fromY: pa.y,
          toX: pb.x,
          toY: pb.y,
          progress: 0,
          speed: 0.015 + Math.random() * 0.01,
          color: '#2997ff',
        });
      }
    });
    particlesRef.current = [...particlesRef.current, ...newParticles].slice(-24);
  }, [positions, deviceMap]);

  // Hook into external gossip hop events if provided
  useEffect(() => {
    if (onGossipHop) {
      spawnHopParticles();
    }
  }, [onGossipHop, spawnHopParticles]);

  // Canvas drawing & animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

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
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      const dpr = window.devicePixelRatio || 1;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // 1. Draw connection lines
      MESH_CONNECTIONS.forEach(([a, b]) => {
        const pa = positions[a];
        const pb = positions[b];
        if (!pa || !pb) return;

        const ax = (pa.x / 100) * w;
        const ay = (pa.y / 100) * h;
        const bx = (pb.x / 100) * w;
        const by = (pb.y / 100) * h;

        const devA = deviceMap[a];
        const devB = deviceMap[b];
        const active = (devA?.packetCount > 0 && devB?.packetCount > 0);
        const highlighted = (hoveredId === a || hoveredId === b);

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);

        if (active) {
          ctx.strokeStyle = highlighted ? 'rgba(41, 151, 255, 0.75)' : 'rgba(41, 151, 255, 0.45)';
          ctx.lineWidth = highlighted ? 2.5 : 1.8;
          ctx.setLineDash([6, 6]);
          ctx.lineDashOffset = -Date.now() / 60;
        } else {
          ctx.strokeStyle = highlighted ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = highlighted ? 1.5 : 1;
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 2. Draw animated moving packet particles
      particlesRef.current.forEach((p, idx) => {
        p.progress += p.speed;
        const curX = ((p.fromX + (p.toX - p.fromX) * p.progress) / 100) * w;
        const curY = ((p.fromY + (p.toY - p.fromY) * p.progress) / 100) * h;

        // Particle Glow
        ctx.beginPath();
        ctx.arc(curX, curY, 4, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      // Purge finished particles
      particlesRef.current = particlesRef.current.filter(p => p.progress < 1);

      // 3. Draw ping waves
      setPingAnimations(prev => {
        return prev.map(ping => {
          const pos = positions[ping.deviceId];
          if (!pos) return null;
          const px = (pos.x / 100) * w;
          const py = (pos.y / 100) * h;

          ctx.beginPath();
          ctx.arc(px, py, ping.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(41, 151, 255, ${ping.alpha * 0.7})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          return {
            ...ping,
            radius: ping.radius + 1.2,
            alpha: ping.alpha - 0.02,
          };
        }).filter(p => p && p.alpha > 0);
      });

      // 4. Draw Device Nodes
      Object.entries(positions).forEach(([id, pos]) => {
        const x = (pos.x / 100) * w;
        const y = (pos.y / 100) * h;
        const device = deviceMap[id];
        const meta = DEVICE_METADATA[id] || { label: id, icon: '📱' };
        const hasPackets = (device?.packetCount || 0) > 0;
        const isBridge = device?.hasInternet;
        const isHovered = hoveredId === id;
        const isSelected = selectedNodeId === id;
        const isDragging = draggingId === id;

        const baseRadius = isBridge ? 26 : 22;
        const radius = (isHovered || isSelected || isDragging) ? baseRadius + 3 : baseRadius;

        // Outer ambient glow
        if (hasPackets || isBridge || isSelected) {
          const glowColor = isBridge 
            ? 'rgba(48, 209, 88, 0.22)' 
            : isSelected 
              ? 'rgba(255, 159, 10, 0.25)' 
              : 'rgba(41, 151, 255, 0.22)';
          const grad = ctx.createRadialGradient(x, y, radius, x, y, radius + 20);
          grad.addColorStop(0, glowColor);
          grad.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(x, y, radius + 20, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Bridge 4G Radar Pulse
        if (isBridge) {
          const pulseRadius = radius + 8 + (Math.sin(Date.now() / 300) * 4);
          ctx.beginPath();
          ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(48, 209, 88, 0.35)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Node Circle Body
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected 
          ? '#1e2433' 
          : isHovered 
            ? '#171b26' 
            : 'rgba(18, 22, 31, 0.94)';
        ctx.fill();

        // Node Border
        ctx.strokeStyle = isBridge 
          ? '#30d158' 
          : hasPackets 
            ? '#2997ff' 
            : isSelected 
              ? '#ff9f0a' 
              : 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = (isSelected || isDragging) ? 2.5 : isBridge ? 2 : 1.5;
        ctx.stroke();

        // Node Icon (Emoji / Symbol)
        ctx.font = `${Math.round(radius * 0.75)}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(meta.icon, x, y);

        // Label Pill underneath
        ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(245, 245, 247, 0.82)';
        ctx.fillText(meta.label, x, y + radius + 8);

        // Subtitle (role or packet count)
        ctx.font = '10px -apple-system, sans-serif';
        ctx.fillStyle = isBridge ? '#30d158' : 'rgba(161, 161, 166, 0.65)';
        const roleLabel = isBridge ? '4G Gateway' : hasPackets ? `${device.packetCount} in RAM` : 'Idle';
        ctx.fillText(roleLabel, x, y + radius + 22);

        // Packet Count Pill Badge
        if (hasPackets) {
          const badgeX = x + radius * 0.72;
          const badgeY = y - radius * 0.72;
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, 9, 0, Math.PI * 2);
          ctx.fillStyle = isBridge ? '#30d158' : '#2997ff';
          ctx.fill();
          ctx.strokeStyle = '#07080b';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.font = 'bold 9px -apple-system, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(device.packetCount), badgeX, badgeY);
        }
      });

      animId = requestAnimationFrame(render);
    }

    render();

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [positions, deviceMap, hoveredId, selectedNodeId, draggingId]);

  // Mouse & Touch Interaction Handlers
  const getNodeAtCoords = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    for (const [id, pos] of Object.entries(positions)) {
      const nodeX = (pos.x / 100) * w;
      const nodeY = (pos.y / 100) * h;
      const dist = Math.hypot(x - nodeX, y - nodeY);
      if (dist <= 30) {
        return id;
      }
    }
    return null;
  };

  const handleMouseDown = (e) => {
    const nodeId = getNodeAtCoords(e.clientX, e.clientY);
    if (nodeId) {
      setDraggingId(nodeId);
      setSelectedNodeId(nodeId);
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (draggingId) {
      const xPercent = Math.max(8, Math.min(92, ((e.clientX - rect.left) / rect.width) * 100));
      const yPercent = Math.max(10, Math.min(88, ((e.clientY - rect.top) / rect.height) * 100));
      setPositions(prev => ({
        ...prev,
        [draggingId]: { x: xPercent, y: yPercent },
      }));
    } else {
      const hovered = getNodeAtCoords(e.clientX, e.clientY);
      setHoveredId(hovered);
      canvas.style.cursor = hovered ? 'grab' : 'default';
    }
  };

  const handleMouseUp = () => {
    if (draggingId) {
      setDraggingId(null);
      if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
    }
  };

  const handleCanvasClick = (e) => {
    const nodeId = getNodeAtCoords(e.clientX, e.clientY);
    setSelectedNodeId(nodeId);
  };

  // Selected device data for inspector drawer
  const selectedDevice = selectedNodeId ? deviceMap[selectedNodeId] || { deviceId: selectedNodeId } : null;
  const selectedDevicePackets = selectedNodeId ? getDevicePackets(selectedNodeId) : [];

  return (
    <div className="space-y-4">
      <Card glow="blue" className="relative overflow-hidden">
        <CardHeader 
          icon="📡" 
          action={
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
                Drag nodes to reposition
              </span>
              <Button size="sm" variant="secondary" onClick={spawnHopParticles} icon="⚡">
                Pulse Mesh
              </Button>
              <Button size="sm" variant="ghost" onClick={handleResetPositions}>
                Reset
              </Button>
            </div>
          }
        >
          <span className="font-semibold text-base tracking-tight">Interactive Bluetooth Mesh Topology</span>
          <Badge variant="blue" className="ml-2">{devicesData.length || 5} Active Nodes</Badge>
        </CardHeader>

        {/* Canvas container */}
        <div 
          ref={containerRef}
          className="relative w-full rounded-2xl bg-black/40 border border-white/[0.06] overflow-hidden select-none"
          style={{ height: '360px' }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
            className="w-full h-full block"
          />

          {/* Canvas Floating Legend */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none text-[11px] text-[var(--text-muted)] px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/[0.06]">
            <div className="flex items-center gap-3.5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#30d158]"></span>
                <span className="text-[var(--text-secondary)]">4G Gateway</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2997ff]"></span>
                <span className="text-[var(--text-secondary)]">Packets in Buffer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
                <span className="text-[var(--text-secondary)]">Relay Hop</span>
              </div>
            </div>
            <div className="text-[10px] text-[var(--text-muted)] hidden sm:block">
              Click node to inspect hardware & buffer
            </div>
          </div>
        </div>
      </Card>

      {/* Node Inspector Drawer */}
      {selectedDevice && (
        <NodeInspectorDrawer
          node={selectedDevice}
          packets={selectedDevicePackets}
          onClose={() => setSelectedNodeId(null)}
          onToggleInternet={(id, hasInternet) => {
            setDeviceInternet(id, hasInternet);
          }}
          onInspectPacket={(pkt) => setInspectingPacket(pkt)}
          onBroadcastPing={handleBroadcastPing}
        />
      )}

      {/* Packet Dissector Modal */}
      {inspectingPacket && (
        <PacketInspectorModal
          packet={inspectingPacket}
          onClose={() => setInspectingPacket(null)}
        />
      )}
    </div>
  );
}
