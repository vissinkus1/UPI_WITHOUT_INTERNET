'use client';
import { useState, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { getMeshState, getAccounts, getTransactions, sendPayment, runGossip, flushBridges, resetMesh } from '@/lib/api';
import { POLL_INTERVAL_MESH, POLL_INTERVAL_ACCOUNTS, POLL_INTERVAL_TRANSACTIONS } from '@/lib/constants';
import DemoFlowPanel from '@/components/dashboard/DemoFlowPanel';
import MeshVisualization from '@/components/dashboard/MeshVisualization';
import AccountBalances from '@/components/dashboard/AccountBalances';
import TransactionLedger from '@/components/dashboard/TransactionLedger';
import ActivityLog from '@/components/dashboard/ActivityLog';
import StatsOverview from '@/components/dashboard/StatsOverview';

export default function DashboardPage() {
  const [logs, setLogs] = useState([]);

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
      addLog('inject', `📤 Packet ${result.packetId.substring(0, 8)} encrypted & injected at ${result.injectedAt} (TTL ${result.ttl})`);
      addLog('inject', `   ciphertext: ${result.ciphertextPreview}`);
      refreshAll();
    } catch (err) {
      addLog('error', `❌ Send failed: ${err.message}`);
    }
  };

  const handleGossip = async () => {
    try {
      const result = await runGossip();
      addLog('gossip', `🔄 Gossip: ${result.transfers} transfer(s) — ${JSON.stringify(result.deviceCounts)}`);
      refreshAll();
    } catch (err) {
      addLog('error', `❌ Gossip failed: ${err.message}`);
    }
  };

  const handleFlushBridges = async () => {
    try {
      const result = await flushBridges();
      addLog('bridge', `📡 ${result.uploadsAttempted} bridge upload(s):`);
      result.results?.forEach(res => {
        const type = res.outcome === 'SETTLED' ? 'settled' : res.outcome === 'DUPLICATE_DROPPED' ? 'duplicate' : 'error';
        addLog(type, `   ${res.bridgeNode} packet ${res.packetId} → ${res.outcome}${res.reason ? ` (${res.reason})` : ''}`);
      });
      refreshAll();
    } catch (err) {
      addLog('error', `❌ Bridge flush failed: ${err.message}`);
    }
  };

  const handleReset = async () => {
    try {
      await resetMesh();
      addLog('reset', '🗑 Mesh + idempotency cache cleared');
      refreshAll();
    } catch (err) {
      addLog('error', `❌ Reset failed: ${err.message}`);
    }
  };

  const isConnected = !mesh.error && !mesh.loading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-6 animate-fade-in-up">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              📊 Dashboard
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Walk through the complete offline payment demo in 3 steps
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </span>
            <span className={`text-xs font-medium ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
              {isConnected ? 'Backend Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-6 animate-fade-in-up delay-100">
        <StatsOverview meshState={mesh.data} accounts={accounts.data} transactions={txs.data} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Demo Flow */}
        <div className="lg:col-span-5 animate-fade-in-up delay-200">
          <DemoFlowPanel
            onSendPayment={handleSendPayment}
            onGossip={handleGossip}
            onFlushBridges={handleFlushBridges}
            onReset={handleReset}
          />
        </div>

        {/* Right Column: Mesh + Accounts */}
        <div className="lg:col-span-7 space-y-6">
          <div className="animate-fade-in-up delay-300">
            <MeshVisualization meshState={mesh.data} />
          </div>
          <div className="animate-fade-in-up delay-400">
            <AccountBalances accounts={accounts.data} />
          </div>
        </div>
      </div>

      {/* Bottom: Transaction Ledger + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-8 animate-fade-in-up delay-500">
          <TransactionLedger transactions={txs.data} />
        </div>
        <div className="lg:col-span-4 animate-fade-in-up delay-600">
          <ActivityLog logs={logs} />
        </div>
      </div>
    </div>
  );
}
