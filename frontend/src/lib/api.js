import { API_BASE } from './constants';
import { meshSimulator } from './meshEngine';

/**
 * Universal API Client with Intelligent Hybrid Fallback
 * 
 * Auto-detects Spring Boot backend on localhost:8080.
 * If backend is unreachable, smoothly defaults to the high-fidelity
 * client-side mesh simulator without generating network proxy errors.
 */

let forcedEngineMode = 'auto'; // 'auto' | 'simulator' | 'live'
let backendIsLive = false;
let lastProbeTime = 0;
let consecutiveFailures = 0;
const PROBE_BACKOFF_MS = 20000; // only re-probe backend every 20s if down

const listeners = new Set();

export function setForcedEngineMode(mode) {
  forcedEngineMode = mode;
  if (mode === 'live' || mode === 'auto') {
    lastProbeTime = 0; // force immediate re-probe
    consecutiveFailures = 0;
  }
  notifyStatus();
}

export function getEngineStatus() {
  return {
    mode: forcedEngineMode,
    isLive: backendIsLive,
    effectiveMode: forcedEngineMode === 'simulator' ? 'simulator' : (backendIsLive ? 'live' : 'simulator'),
  };
}

export function onEngineStatusChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyStatus() {
  const status = getEngineStatus();
  listeners.forEach(fn => fn(status));
}

async function request(path, options = {}) {
  if (forcedEngineMode === 'simulator') {
    throw new Error('SIMULATOR_MODE');
  }

  // If in auto mode and backend previously failed, avoid flooding failed requests
  const now = Date.now();
  if (forcedEngineMode === 'auto' && !backendIsLive && consecutiveFailures > 0) {
    if (now - lastProbeTime < PROBE_BACKOFF_MS) {
      throw new Error('BACKEND_STANDBY');
    }
  }

  lastProbeTime = now;
  const url = `${API_BASE}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1800);

  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }

    if (!backendIsLive) {
      backendIsLive = true;
      consecutiveFailures = 0;
      notifyStatus();
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    consecutiveFailures++;
    if (backendIsLive) {
      backendIsLive = false;
      notifyStatus();
    }
    throw err;
  }
}

// ---- Server Key ----
export const getServerKey = async () => {
  try {
    return await request('/api/server-key');
  } catch {
    return {
      publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3fJ+qC9...[RSA-2048 VIRTUAL PUBKEY]',
      algorithm: 'RSA-2048 / OAEP-SHA256',
      hybridScheme: 'RSA-OAEP encrypts an AES-256-GCM session key',
    };
  }
};

// ---- Accounts ----
export const getAccounts = async () => {
  try {
    return await request('/api/accounts');
  } catch {
    return meshSimulator.getAccounts();
  }
};

// ---- Transactions ----
export const getTransactions = async () => {
  try {
    return await request('/api/transactions');
  } catch {
    return meshSimulator.getTransactions();
  }
};

// ---- Mesh State ----
export const getMeshState = async () => {
  try {
    return await request('/api/mesh/state');
  } catch {
    return meshSimulator.getMeshState();
  }
};

// ---- Demo: Send Payment ----
export const sendPayment = async ({ senderVpa, receiverVpa, amount, pin, ttl = 5, startDevice = 'phone-alice' }) => {
  try {
    return await request('/api/demo/send', {
      method: 'POST',
      body: JSON.stringify({ senderVpa, receiverVpa, amount: parseFloat(amount), pin, ttl: parseInt(ttl, 10), startDevice }),
    });
  } catch {
    return meshSimulator.sendPayment({ senderVpa, receiverVpa, amount, pin, ttl, startDevice });
  }
};

// ---- Mesh: Gossip ----
export const runGossip = async () => {
  try {
    return await request('/api/mesh/gossip', { method: 'POST' });
  } catch {
    return meshSimulator.runGossip();
  }
};

// ---- Mesh: Flush Bridges ----
export const flushBridges = async () => {
  try {
    return await request('/api/mesh/flush', { method: 'POST' });
  } catch {
    return meshSimulator.flushBridges();
  }
};

// ---- Mesh: Reset ----
export const resetMesh = async () => {
  try {
    return await request('/api/mesh/reset', { method: 'POST' });
  } catch {
    meshSimulator.reset();
    return { status: 'mesh and idempotency cache cleared (simulator)' };
  }
};

// ---- Node & Packet Inspector Helpers ----
export const getDevicePackets = (deviceId) => {
  return meshSimulator.getDevicePackets(deviceId);
};

export const getPacketDetails = (packetId) => {
  return meshSimulator.getPacket(packetId);
};

export const setDeviceInternet = (deviceId, hasInternet) => {
  meshSimulator.setDeviceInternet(deviceId, hasInternet);
};

export const simulateReplayAttack = (packetId) => {
  return meshSimulator.simulateReplayAttack(packetId);
};

export const simulateTamperAttack = (packetId) => {
  return meshSimulator.simulateTamperAttack(packetId);
};

// ---- Bridge: Ingest (production endpoint) ----
export const bridgeIngest = async (packet, bridgeNodeId = 'test-bridge', hopCount = 0) => {
  return request('/api/bridge/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Bridge-Node-Id': bridgeNodeId,
      'X-Hop-Count': String(hopCount),
    },
    body: JSON.stringify(packet),
  });
};
