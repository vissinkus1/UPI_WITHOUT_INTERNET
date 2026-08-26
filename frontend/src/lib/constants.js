// API base URL — uses Next.js rewrite proxy in dev, direct URL in production
export const API_BASE = '';  // Empty = same origin (uses next.config.mjs rewrites)

// Polling intervals (ms)
export const POLL_INTERVAL_MESH = 2000;
export const POLL_INTERVAL_ACCOUNTS = 2000;
export const POLL_INTERVAL_TRANSACTIONS = 3000;

// Demo accounts
export const DEMO_ACCOUNTS = [
  { vpa: 'alice@demo', name: 'Alice', emoji: '👩' },
  { vpa: 'bob@demo', name: 'Bob', emoji: '👨' },
  { vpa: 'carol@demo', name: 'Carol', emoji: '👩‍💻' },
  { vpa: 'dave@demo', name: 'Dave', emoji: '🧑‍💼' },
];

// Status config
export const STATUS_CONFIG = {
  SETTLED: { label: 'Settled', color: 'var(--accent-emerald)', bg: 'rgba(16, 185, 129, 0.15)', icon: '✅' },
  REJECTED: { label: 'Rejected', color: 'var(--accent-red)', bg: 'rgba(239, 68, 68, 0.15)', icon: '❌' },
  DUPLICATE_DROPPED: { label: 'Duplicate', color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.15)', icon: '⚠️' },
  INVALID: { label: 'Invalid', color: 'var(--accent-red)', bg: 'rgba(239, 68, 68, 0.15)', icon: '🚫' },
};

// Device positions for mesh visualization (x, y percentages)
export const DEVICE_POSITIONS = {
  'phone-alice': { x: 15, y: 30, label: 'Alice' },
  'phone-stranger1': { x: 40, y: 15, label: 'Stranger 1' },
  'phone-stranger2': { x: 65, y: 45, label: 'Stranger 2' },
  'phone-stranger3': { x: 35, y: 70, label: 'Stranger 3' },
  'phone-bridge': { x: 85, y: 50, label: 'Bridge' },
};

// Mesh connections (which devices are "in range")
export const MESH_CONNECTIONS = [
  ['phone-alice', 'phone-stranger1'],
  ['phone-alice', 'phone-stranger3'],
  ['phone-stranger1', 'phone-stranger2'],
  ['phone-stranger1', 'phone-stranger3'],
  ['phone-stranger2', 'phone-bridge'],
  ['phone-stranger3', 'phone-stranger2'],
  ['phone-stranger3', 'phone-bridge'],
];
