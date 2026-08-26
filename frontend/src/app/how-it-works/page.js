export const metadata = {
  title: 'How It Works — UPI Mesh Offline Payments',
  description: 'Understanding the encryption, mesh gossip, and settlement pipeline behind offline UPI payments.',
};

const PIPELINE_STEPS = [
  {
    step: 1,
    title: 'Sender Composes Payment',
    icon: '📝',
    color: 'from-blue-500 to-indigo-600',
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
  nonce: "550e8400-...",  // UUID
  signedAt: 1730000000000  // epoch ms
}`,
  },
  {
    step: 2,
    title: 'Hybrid Encryption',
    icon: '🔐',
    color: 'from-purple-500 to-violet-600',
    description: 'The payload is encrypted using the server\'s public key with a hybrid RSA + AES-GCM scheme — the same pattern TLS uses.',
    details: [
      'Generate a fresh AES-256 key for this packet',
      'Encrypt JSON payload with AES-256-GCM (fast + authenticated)',
      'Encrypt just the AES key with RSA-OAEP (small data, max security)',
      'GCM auth tag ensures any tampering causes decryption to fail',
    ],
    code: `Wire format (base64):
┌──────────────────────┬──────────┬────────────────────┐
│ 256 bytes            │ 12 bytes │ variable length    │
│ RSA-encrypted        │ GCM IV   │ AES ciphertext     │
│ AES key              │          │ + 16-byte GCM tag  │
└──────────────────────┴──────────┴────────────────────┘`,
  },
  {
    step: 3,
    title: 'Mesh Packet Created',
    icon: '📦',
    color: 'from-cyan-500 to-blue-600',
    description: 'The ciphertext is wrapped in a MeshPacket with outer fields (packetId, TTL) readable by intermediates for routing.',
    details: [
      'packetId: UUID for gossip-level dedup by intermediates',
      'TTL: decrements per hop, prevents infinite loops',
      'createdAt: when the packet was created',
      'ciphertext: opaque blob — intermediates cannot read it',
    ],
    code: `MeshPacket {
  packetId: "a3f8c9...",
  ttl: 5,
  createdAt: 1730000000000,
  ciphertext: "base64(RSA+AES blob)"
  // ↑ intermediates see this but can't decrypt it
}`,
  },
  {
    step: 4,
    title: 'Gossip Protocol',
    icon: '📡',
    color: 'from-emerald-500 to-teal-600',
    description: 'Devices broadcast packets to nearby devices via Bluetooth. Each hop decrements TTL. Packets spread organically as people walk past each other.',
    details: [
      'Each device shares all packets with neighbors in range',
      'Devices track seen packetIds to avoid re-accepting the same packet',
      'TTL=0 packets are held but not forwarded further',
      'In the demo, "in range" means all devices (fast-forward mode)',
    ],
    code: `Round 1: Alice → Stranger1, Stranger2, Stranger3, Bridge
Round 2: TTL decrements again, no new transfers
         (all devices already hold the packet)

Real-world: this happens organically as people
walk past each other over minutes/hours`,
  },
  {
    step: 5,
    title: 'Bridge Node Gets Online',
    icon: '🌐',
    color: 'from-amber-500 to-orange-600',
    description: 'A bridge node (device with internet) walks outside and gets 4G. It POSTs every packet it holds to the backend.',
    details: [
      'Multiple bridges may hold the same packet',
      'All upload simultaneously → "duplicate storm"',
      'This is where idempotency is critical',
    ],
    code: `POST /api/bridge/ingest
X-Bridge-Node-Id: phone-bridge
X-Hop-Count: 3

{ packetId, ttl, createdAt, ciphertext }`,
  },
  {
    step: 6,
    title: 'Server Pipeline',
    icon: '⚙️',
    color: 'from-rose-500 to-pink-600',
    description: 'The backend runs a 5-step pipeline: hash → claim → decrypt → freshness check → settle.',
    details: [
      '1. SHA-256(ciphertext) — compute idempotency key',
      '2. ConcurrentHashMap.putIfAbsent — atomic claim (like Redis SETNX)',
      '3. RSA-OAEP decrypt AES key → AES-GCM decrypt payload',
      '4. Check signedAt within 24 hours (replay protection)',
      '5. @Transactional debit sender + credit receiver + write ledger',
    ],
    code: `hash = SHA-256(ciphertext)
if !idempotency.claim(hash):     → DUPLICATE_DROPPED
instruction = decrypt(ciphertext) → may throw (tampered)
if age > 24h:                     → INVALID (stale)
settlement.settle(instruction)    → SETTLED ✅`,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-14 animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
          How <span className="gradient-text">UPI Mesh</span> Works
        </h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          A step-by-step walkthrough of the complete pipeline — from composing a payment 
          offline to settling it on the backend via untrusted intermediaries.
        </p>
      </div>

      {/* Pipeline Steps */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/30 via-purple-500/30 to-emerald-500/30 hidden md:block" />

        <div className="space-y-8">
          {PIPELINE_STEPS.map((item, i) => (
            <div key={i} className="relative animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex gap-6">
                {/* Step number */}
                <div className="hidden md:flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} 
                                flex items-center justify-center text-xl z-10
                                shadow-lg`}
                  >
                    {item.icon}
                  </div>
                </div>

                {/* Content card */}
                <div className="flex-1 glass-card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="md:hidden text-xl">{item.icon}</span>
                    <div>
                      <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Step {item.step}</span>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{item.title}</h3>
                    </div>
                  </div>
                  
                  <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Details */}
                  <ul className="space-y-1.5 mb-4">
                    {item.details.map((detail, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                        <span className="text-[var(--accent-blue)] mt-0.5">▸</span>
                        {detail}
                      </li>
                    ))}
                  </ul>

                  {/* Code block */}
                  <pre className="bg-[var(--bg-deep)] border border-[var(--border-subtle)] rounded-lg p-4 text-xs text-emerald-400 font-mono overflow-x-auto leading-relaxed">
                    {item.code}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="mt-16 animate-fade-in-up">
        <div className="glass-card p-8">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 text-center">
            🏗️ System Architecture
          </h2>
          <pre className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono leading-relaxed overflow-x-auto text-center">
{`┌─────────────────────────────────────────────────────┐
│              SENDER PHONE (offline)                  │
│  PaymentInstruction { sender, receiver, amount, ... }│
│              │ encrypt with server's RSA public key   │
│   MeshPacket { packetId, ttl, ciphertext }           │
└──────────────────────────┬──────────────────────────┘
                           │ Bluetooth gossip
                           ▼
      ┌─────────┐  hop  ┌─────────┐  hop  ┌─────────┐
      │stranger1│ ────▶ │stranger2│ ────▶ │ bridge  │
      └─────────┘       └─────────┘       └────┬────┘
                                               │ HTTPS POST
                                               ▼
┌─────────────────────────────────────────────────────┐
│            SPRING BOOT BACKEND                       │
│  [1] hash ciphertext (SHA-256)                       │
│  [2] IdempotencyService.claim(hash)                  │
│  [3] HybridCryptoService.decrypt(ciphertext)         │
│  [4] Freshness check: signedAt within 24h            │
│  [5] SettlementService.settle() @Transactional       │
└─────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </div>

      {/* Limitations Section */}
      <div className="mt-12 animate-fade-in-up">
        <div className="glass-card p-6 border-amber-500/20">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            ⚠️ Honest Limitations
          </h3>
          <div className="space-y-3 text-sm text-[var(--text-muted)] leading-relaxed">
            <p><strong className="text-amber-400">No real-time verification:</strong> The receiver has no way to verify the sender has funds. It{"'"}s an IOU until settled.</p>
            <p><strong className="text-amber-400">Double-spend offline:</strong> A malicious sender with ₹500 could send to two people offline. Whichever hits the backend first wins.</p>
            <p><strong className="text-amber-400">Real BLE is hard:</strong> Background BLE on Android is throttled. iOS peripheral mode is locked down. This demo simulates the mesh.</p>
            <p><strong className="text-emerald-400">Best described as:</strong> {"\""}Mesh-routed deferred settlement{"\""}  rather than {"\""}real-time offline UPI.{"\""} The cryptography and idempotency are real engineering.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
