'use client';
import { useState, useCallback, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { 
  getMeshState, 
  getAccounts, 
  getTransactions, 
  sendPayment, 
  runGossip, 
  flushBridges, 
  resetMesh,
  getEngineStatus,
  setForcedEngineMode,
  onEngineStatusChange 
} from '@/lib/api';
import { POLL_INTERVAL_MESH, POLL_INTERVAL_ACCOUNTS, POLL_INTERVAL_TRANSACTIONS } from '@/lib/constants';
import DemoFlowPanel from '@/components/dashboard/DemoFlowPanel';
import MeshVisualization from '@/components/dashboard/MeshVisualization';
import AccountBalances from '@/components/dashboard/AccountBalances';
import TransactionLedger from '@/components/dashboard/TransactionLedger';
import ActivityLog from '@/components/dashboard/ActivityLog';
import StatsOverview from '@/components/dashboard/StatsOverview';

export default function DashboardPage() {
  const [logs, setLogs] = useState([]);
  const [engineStatus, setEngineStatus] = useState(getEngineStatus());
  const [gossipHopTrigger, setGossipHopTrigger] = useState(0);

  useEffect(() => {
    return onEngineStatusChange((status) => {
      setEngineStatus(status);
    });
  }, []);

  const mesh = useApi(useCallback(() => getMeshState(), []), POLL_INTERVAL_MESH);
  const accounts = useApi(useCallback(() => getAccounts(), []), POLL_INTERVAL_ACCOUNTS);
  const txs = useApi(useCallback(() => getTransactions(), []), POLL_INTERVAL_TRANSACTIONS);

  const addLog = (type, message) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, type, message }, ...prev].slice(0, 100));
  };

  const refreshAll = () => {
    mesh.refresh();
    accounts.refresh();
    txs.refresh();
  };

  const handleSendPayment = async (params) => {
    try {
      const result = await sendPayment(params);
      addLog('inject', `Packet ${result.packetId.substring(0, 8)} encrypted via RSA-2048 at ${result.injectedAt} (TTL ${result.ttl})`);
      addLog('inject', `Ciphertext wire preview: ${result.ciphertextPreview}`);
      setGossipHopTrigger(prev => prev + 1);
      refreshAll();
    } catch (err) {
      addLog('error', `Send failed: ${err.message}`);
    }
  };

  const handleGossip = async () => {
    try {
      const result = await runGossip();
      setGossipHopTrigger(prev => prev + 1);
      addLog('gossip', `Bluetooth Gossip Round: ${result.transfers || 0} transfers executed across mesh`);
      refreshAll();
    } catch (err) {
      addLog('error', `Gossip failed: ${err.message}`);
    }
  };

  const handleFlushBridges = async () => {
    try {
      const result = await flushBridges();
      addLog('bridge', `${result.uploadsAttempted} bridge gateway upload(s) to backend:`);
      result.results?.forEach(res => {
        const type = res.outcome === 'SETTLED' ? 'settled' : res.outcome === 'DUPLICATE_DROPPED' ? 'duplicate' : 'error';
        addLog(type, `Gateway ${res.bridgeNode} packet ${res.packetId.slice(0, 8)} → ${res.outcome}${res.reason ? ` (${res.reason})` : ''}`);
      });
      refreshAll();
    } catch (err) {
      addLog('error', `Bridge flush failed: ${err.message}`);
    }
  };

  const handleReset = async () => {
    try {
      await resetMesh();
      addLog('reset', 'Mesh packet memory buffer & atomic idempotency cache cleared');
      refreshAll();
    } catch (err) {
      addLog('error', `Reset failed: ${err.message}`);
    }
  };

  const isLiveBackend = engineStatus.effectiveMode === 'live';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header bar */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
            <span>Offline Mesh Payments Console</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Simulate end-to-end zero-connectivity UPI payments with BLE mesh routing and atomic deferred settlement.
          </p>
        </div>

        {/* Engine mode switcher pill */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center gap-1">
            <button
              onClick={() => setForcedEngineMode('auto')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                engineStatus.mode === 'auto'
                  ? 'bg-white/[0.15] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              Auto Detect
            </button>
            <button
              onClick={() => setForcedEngineMode('simulator')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                engineStatus.mode === 'simulator'
                  ? 'bg-[#2997ff] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              Client Simulator
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLiveBackend ? 'bg-[#30d158]' : 'bg-[#2997ff]'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveBackend ? 'bg-[#30d158]' : 'bg-[#2997ff]'}`}></span>
            </span>
            <span className="text-[11px] font-mono text-[var(--text-secondary)]">
              {isLiveBackend ? 'Spring Boot 8080' : 'Web Simulator Engine'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="mb-6 animate-fade-in">
        <StatsOverview 
          meshState={mesh.data} 
          accounts={accounts.data} 
          transactions={txs.data} 
        />
      </div>

      {/* Main Grid: Pipeline Controller + Interactive Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3-Step Demo Flow */}
        <div className="lg:col-span-5 space-y-6">
          <DemoFlowPanel
            onSendPayment={handleSendPayment}
            onGossip={handleGossip}
            onFlushBridges={handleFlushBridges}
            onReset={handleReset}
          />
          <AccountBalances accounts={accounts.data} />
        </div>

        {/* Right Column: Interactive Canvas & Node Telemetry */}
        <div className="lg:col-span-7 space-y-6">
          <MeshVisualization 
            meshState={mesh.data} 
            onGossipHop={gossipHopTrigger} 
          />
        </div>
      </div>

      {/* Bottom Grid: Transaction Ledger & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
        <div className="lg:col-span-8">
          <TransactionLedger transactions={txs.data} />
        </div>
        <div className="lg:col-span-4">
          <ActivityLog logs={logs} onClear={() => setLogs([])} />
        </div>
      </div>
    </div>
  );
}
