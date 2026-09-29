export const metadata = {
  title: 'How It Works — UPI Mesh Offline Payments',
  description: 'Understanding the encryption, mesh gossip, and settlement pipeline behind offline UPI payments.',
};

const PIPELINE_STEPS = [
  {
    step: 1,
    title: 'Sender Composes Payment',
    icon: '📝',
    color: '#2997ff',
    description: 'The sender\'s phone builds a PaymentInstruction with a unique nonce, timestamp, amount, and PIN hash.',
    details: [
      'UUID nonce guarantees uniqueness — even identical payments produce different ciphertexts',
      'signedAt timestamp enables replay protection (24-hour freshness window)',
      'PIN hash simulates real UPI PIN verification',
    ],
    code: `PaymentInstruction {
  senderVpa: "alice@demo",
  receiverVpa: "bob@demo",
  amount: 500.00,
  pinHash: "sha256(1234)",
  nonce: "550e8400-e29b-41d4-a716-446655440000",
  signedAt: 1730000000000  // epoch ms
}`,
  },
  {
    step: 2,
    title: 'Hybrid Encryption Scheme',
    icon: '🔐',
    color: '#bf5af2',
    description: 'The payload is encrypted using the server\'s public key with a hybrid RSA + AES-GCM scheme — the same pattern TLS uses.',
    details: [
      'Generate a fresh AES-256 key for this packet',
      'Encrypt JSON payload with AES-256-GCM (fast + authenticated)',
      'Encrypt just the AES key with RSA-OAEP (small data, max security)',
      'GCM auth tag ensures any tampering causes decryption to fail immediately',
    ],
    code: `Wire format (base64):
┌──────────────────────┬──────────┬────────────────────────┐
│ 256 bytes            │ 12 bytes │ variable length        │
│ RSA-encrypted        │ GCM IV   │ AES ciphertext         │
│ AES key              │          │ + 16-byte GCM auth tag │
└──────────────────────┴──────────┴────────────────────────┘`,
  },
  {
    step: 3,
    title: 'Mesh Packet Envelope Created',
    icon: '📦',
    color: '#64d2ff',
    description: 'The ciphertext is wrapped in a MeshPacket with outer fields (packetId, TTL) readable by intermediates for routing.',
    details: [
      'packetId: UUID for gossip-level dedup by intermediates',
      'TTL: decrements per hop, prevents infinite loops',
      'createdAt: when the packet was created',
      'ciphertext: opaque blob — intermediates cannot read or tamper with it',
    ],
    code: `MeshPacket {
  packetId: "a3f8c92b-8b5e-4731-9f20-1a73d8c4e521",
  ttl: 5,
  createdAt: 1730000000000,
  ciphertext: "base64(RSA+AES blob)"
  // ↑ intermediates see this outer envelope but can't decrypt it
}`,
  },
  {
    step: 4,
    title: 'Bluetooth Gossip Protocol',
    icon: '📡',
    color: '#30d158',
    description: 'Devices broadcast packets to nearby devices via Bluetooth Low Energy (BLE). Each hop decrements TTL. Packets spread organically as people walk past each other.',
    details: [
      'Each device shares all packets with neighbors in range',
      'Devices track seen packetIds to avoid re-accepting the same packet',
      'TTL=0 packets are held but not forwarded further',
      'In the demo, in range simulation provides fast-forward mesh propagation',
    ],
    code: `Hop 1: Alice (Basement) → Stranger 1, Stranger 3
Hop 2: Stranger 1 → Stranger 2
Hop 3: Stranger 2 → Bridge (4G Gateway Node)`,
  },
  {
    step: 5,
    title: 'Bridge Uploads to Backend',
    icon: '🚀',
    color: '#ff9f0a',
    description: 'When any bridge node walks outside and connects to 4G LTE, it flushes all cached packets via HTTPS POST to the backend ingest endpoint.',
    details: [
      'Endpoint: POST /api/bridge/ingest',
      'Headers: X-Bridge-Node-Id, X-Hop-Count',
      'Bridge nodes are dumb conduits — they have zero decryption keys',
      'Multiple bridges may upload the same packet concurrently',
    ],
    code: `HTTP Request:
POST /api/bridge/ingest
X-Bridge-Node-Id: phone-bridge-42
X-Hop-Count: 3

{
  "packetId": "a3f8c92b-...",
  "ttl": 2,
  "createdAt": 1730000000000,
  "ciphertext": "..."
}`,
  },
  {
    step: 6,
    title: 'Backend Verification & Settlement',
    icon: '🏦',
    color: '#ff453a',
    description: 'The backend executes the full verification and settlement pipeline in a strict order to ensure safety.',
    details: [
      'Step 6a: SHA-256 hash the ciphertext blob',
      'Step 6b: IdempotencyService.claim() using ConcurrentHashMap.putIfAbsent()',
      'Step 6c: Decrypt RSA key, then decrypt AES-GCM payload',
      'Step 6d: Verify freshness (signedAt within 24h window)',
      'Step 6e: @Transactional debit sender, credit receiver in H2 DB',
    ],
    code: `Backend Settlement Pipeline:
1. hash = sha256(ciphertext)
2. claimed = idempotencyMap.putIfAbsent(hash, CLAIMED)
   └── If null: first to claim, proceed to settle
   └── If exists: DUPLICATE_DROPPED (200 OK, no-op)
3. payload = rsaDecrypt(aesKey) -> aesGcmDecrypt(ciphertext)
4. assert(now - payload.signedAt < 24h)
5. @Transactional debit(alice, 500) -> credit(bob, 500)`,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-[var(--text-secondary)]">
          <span>Security & Routing Specification</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
          The 6-Step Settlement Pipeline
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
          From an offline basement to bank ledger settlement: how encryption, peer gossip, and atomic idempotency make zero-connectivity UPI possible.
        </p>
      </div>

      {/* Step by step pipeline */}
      <div className="space-y-6">
        {PIPELINE_STEPS.map((item) => (
          <div 
            key={item.step}
            className="apple-card p-6 sm:p-7 relative overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border border-white/[0.08]"
                style={{ background: `${item.color}15`, color: item.color }}
              >
                {item.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] uppercase font-bold tracking-wider" style={{ color: item.color }}>
                    Step {item.step}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    Phase 0{item.step}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                  {item.description}
                </p>

                <ul className="space-y-1.5 mb-4 text-xs text-[var(--text-muted)]">
                  {item.details.map((detail, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="text-[#2997ff] mt-0.5 font-bold">›</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <pre className="p-3.5 rounded-xl bg-black/50 border border-white/[0.06] text-xs font-mono text-[#30d158] overflow-x-auto leading-relaxed">
                  {item.code}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Architecture ASCII Flow */}
      <div className="mt-16 apple-card p-6 sm:p-8">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 text-center tracking-tight">
          Complete System Data Flow
        </h2>
        <pre className="text-xs text-[var(--text-secondary)] font-mono leading-relaxed overflow-x-auto text-center p-4 rounded-xl bg-black/40 border border-white/[0.06]">
{`┌─────────────────────────────────────────────────────┐
│              SENDER PHONE (Offline)                 │
│  PaymentInstruction { sender, receiver, amount, ... }│
│              │ Encrypt via server's RSA-2048 key    │
│   MeshPacket { packetId, ttl, ciphertext }           │
└──────────────────────────┬──────────────────────────┘
                           │ Bluetooth Low Energy (BLE)
                           ▼
      ┌─────────┐  hop  ┌─────────┐  hop  ┌─────────┐
      │stranger1│ ────▶ │stranger2│ ────▶ │ bridge  │
      └─────────┘       └─────────┘       └────┬────┘
                                               │ HTTPS POST
                                               ▼
┌─────────────────────────────────────────────────────┐
│            BANKING BACKEND SERVICE                  │
│  [1] SHA-256 hash ciphertext blob                   │
│  [2] IdempotencyService.claim(hash) CAS lock        │
│  [3] HybridCryptoService.decrypt(ciphertext)        │
│  [4] Freshness check: signedAt within 24h           │
│  [5] SettlementService.settle() @Transactional      │
└─────────────────────────────────────────────────────┘`}
        </pre>
      </div>

      {/* Honest Limitations */}
      <div className="mt-8 apple-card p-6 border-amber-500/20 bg-amber-500/[0.02]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <span>⚠️</span> Technical Assumptions & Real-World Boundaries
        </h3>
        <div className="space-y-2.5 text-xs text-[var(--text-muted)] leading-relaxed">
          <p><strong className="text-amber-400">Deferred Settlement:</strong> The offline receiver cannot confirm funds until backend settlement completes. It acts as an encrypted deferred IOU.</p>
          <p><strong className="text-amber-400">Offline Double-Spend:</strong> A malicious sender could sign two ₹500 payments offline with only ₹500 balance. The first packet uploaded by any bridge node settles; subsequent packets fail funds check.</p>
          <p><strong className="text-amber-400">Mobile OS BLE Constraints:</strong> Real-world Android background BLE is throttled and iOS peripheral mode is sandboxed. In production, this would leverage Wi-Fi Aware, Nearby Connections, or sound-based acoustic data beacons.</p>
        </div>
      </div>
    </div>
  );
}
