import { API_BASE } from './constants';

/**
 * API client for the UPI Mesh backend.
 * All endpoints are proxied through Next.js rewrites in development.
 */

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

// ---- Server Key ----
export const getServerKey = () => request('/api/server-key');

// ---- Accounts ----
export const getAccounts = () => request('/api/accounts');

// ---- Transactions ----
export const getTransactions = () => request('/api/transactions');

// ---- Mesh State ----
export const getMeshState = () => request('/api/mesh/state');

// ---- Demo: Send Payment ----
export const sendPayment = ({ senderVpa, receiverVpa, amount, pin, ttl = 5, startDevice = 'phone-alice' }) =>
  request('/api/demo/send', {
    method: 'POST',
    body: JSON.stringify({ senderVpa, receiverVpa, amount: parseFloat(amount), pin, ttl, startDevice }),
  });

// ---- Mesh: Gossip ----
export const runGossip = () => request('/api/mesh/gossip', { method: 'POST' });

// ---- Mesh: Flush Bridges ----
export const flushBridges = () => request('/api/mesh/flush', { method: 'POST' });

// ---- Mesh: Reset ----
export const resetMesh = () => request('/api/mesh/reset', { method: 'POST' });

// ---- Bridge: Ingest (production endpoint) ----
export const bridgeIngest = (packet, bridgeNodeId = 'test-bridge', hopCount = 0) =>
  request('/api/bridge/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Bridge-Node-Id': bridgeNodeId,
      'X-Hop-Count': String(hopCount),
    },
    body: JSON.stringify(packet),
  });
