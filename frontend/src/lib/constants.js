// API base URL — uses Next.js rewrite proxy in dev, direct URL in production
export const API_BASE = '';  // Empty = same origin (uses next.config.mjs rewrites)

// Polling intervals (ms)
export const POLL_INTERVAL_MESH = 1500;
export const POLL_INTERVAL_ACCOUNTS = 2000;
export const POLL_INTERVAL_TRANSACTIONS = 2500;

// Demo accounts
export const DEMO_ACCOUNTS = [
  { vpa: 'alice@demo', name: 'Alice', role: 'Buyer (Basement)', emoji: '👩', gradient: 'from-blue-500 to-indigo-600' },
  { vpa: 'bob@demo', name: 'Bob', role: 'Merchant / Seller', emoji: '👨', gradient: 'from-emerald-500 to-teal-600' },
  { vpa: 'carol@demo', name: 'Carol', role: 'Peer Node', emoji: '👩‍💻', gradient: 'from-purple-500 to-violet-600' },
  { vpa: 'dave@demo', name: 'Dave', role: 'Peer Node', emoji: '🧑‍💼', gradient: 'from-amber-500 to-orange-600' },
];

// Status config
export const STATUS_CONFIG = {
  SETTLED: { label: 'Settled', color: '#30d158', bg: 'rgba(48, 209, 88, 0.12)', border: 'rgba(48, 209, 88, 0.28)', icon: '✓' },
  REJECTED: { label: 'Rejected', color: '#ff453a', bg: 'rgba(255, 69, 58, 0.12)', border: 'rgba(255, 69, 58, 0.28)', icon: '✕' },
  DUPLICATE_DROPPED: { label: 'Duplicate Dropped', color: '#ff9f0a', bg: 'rgba(255, 159, 10, 0.12)', border: 'rgba(255, 159, 10, 0.28)', icon: '⊘' },
  INVALID: { label: 'Invalid Payload', color: '#ff453a', bg: 'rgba(255, 69, 58, 0.12)', border: 'rgba(255, 69, 58, 0.28)', icon: '!' },
};

// Device metadata & initial layout coordinates
export const DEVICE_METADATA = {
  'phone-alice': {
    id: 'phone-alice',
    label: 'Alice (Sender)',
    role: 'Sender Node (Offline)',
    x: 18,
    y: 35,
    icon: '📱',
    color: '#2997ff',
    desc: 'Offline in basement parking. Encrypts packet with server pubkey and broadcasts via Bluetooth BLE.',
  },
  'phone-stranger1': {
    id: 'phone-stranger1',
    label: 'Stranger 1',
    role: 'Relay Hop 1 (Offline)',
    x: 42,
    y: 18,
    icon: '🚶',
    color: '#8e8e93',
    desc: 'Commuter passing by stairwell. Forwards opaque ciphertext without deciphering.',
  },
  'phone-stranger2': {
    id: 'phone-stranger2',
    label: 'Stranger 2',
    role: 'Relay Hop 2 (Offline)',
    x: 62,
    y: 42,
    icon: '🚶',
    color: '#8e8e93',
    desc: 'Building resident in elevator lobby. Decrements TTL and echoes to nearby peers.',
  },
  'phone-stranger3': {
    id: 'phone-stranger3',
    label: 'Stranger 3',
    role: 'Relay Hop 3 (Offline)',
    x: 38,
    y: 72,
    icon: '🚶',
    color: '#8e8e93',
    desc: 'Ground floor security guard phone. Stores packet temporarily in local flash memory.',
  },
  'phone-bridge': {
    id: 'phone-bridge',
    label: 'Bridge (4G Uplink)',
    role: 'Internet Bridge Gateway',
    x: 84,
    y: 50,
    icon: '📡',
    color: '#30d158',
    desc: 'Delivery driver stepping outdoors with active 4G LTE. Flushes stored packets directly to backend.',
  },
};

export const DEVICE_POSITIONS = Object.fromEntries(
  Object.entries(DEVICE_METADATA).map(([k, v]) => [k, { x: v.x, y: v.y, label: v.label }])
);

// Mesh connections (which devices are in Bluetooth range)
export const MESH_CONNECTIONS = [
  ['phone-alice', 'phone-stranger1'],
  ['phone-alice', 'phone-stranger3'],
  ['phone-stranger1', 'phone-stranger2'],
  ['phone-stranger1', 'phone-stranger3'],
  ['phone-stranger2', 'phone-bridge'],
  ['phone-stranger3', 'phone-stranger2'],
  ['phone-stranger3', 'phone-bridge'],
];
