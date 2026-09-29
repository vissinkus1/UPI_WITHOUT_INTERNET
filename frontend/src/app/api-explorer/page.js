'use client';
import { useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { 
  getServerKey, 
  getAccounts, 
  getTransactions, 
  getMeshState, 
  runGossip, 
  flushBridges, 
  resetMesh,
  sendPayment
} from '@/lib/api';

const API_ENDPOINTS = [
  {
    id: 'server-key',
    method: 'GET',
    path: '/api/server-key',
    title: 'Get Server RSA Public Key',
    description: 'Returns the server\'s RSA-2048 public key (base64). Simulated sender devices use this to encrypt payment payloads.',
    requestBody: null,
    sampleResponse: `{
  "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3fJ+qC9...",
  "algorithm": "RSA-2048 / OAEP-SHA256",
  "hybridScheme": "RSA-OAEP encrypts an AES-256-GCM session key"
}`,
    action: () => getServerKey(),
  },
  {
    id: 'accounts',
    method: 'GET',
    path: '/api/accounts',
    title: 'List All Ledger Accounts',
    description: 'Returns all demo accounts with current balances. Balances update in real-time after settlements.',
    requestBody: null,
    sampleResponse: `[
  { "vpa": "alice@demo", "holderName": "Alice", "balance": 5000.00 },
  { "vpa": "bob@demo", "holderName": "Bob", "balance": 1000.00 }
]`,
    action: () => getAccounts(),
  },
  {
    id: 'transactions',
    method: 'GET',
    path: '/api/transactions',
    title: 'List Transaction Ledger',
    description: 'Returns the settled/rejected transactions, ordered by most recent first.',
    requestBody: null,
    sampleResponse: `[
  {
    "id": 101,
    "senderVpa": "alice@demo",
    "receiverVpa": "bob@demo",
    "amount": 500.00,
    "status": "SETTLED",
    "bridgeNodeId": "phone-bridge",
    "hopCount": 4,
    "settledAt": "2026-09-29T18:30:00Z"
  }
]`,
    action: () => getTransactions(),
  },
  {
    id: 'mesh-state',
    method: 'GET',
    path: '/api/mesh/state',
    title: 'Mesh Network Telemetry',
    description: 'Returns the current state of all virtual devices in the mesh, including which packets they hold.',
    requestBody: null,
    sampleResponse: `{
  "devices": [
    { "deviceId": "phone-alice", "hasInternet": false, "packetCount": 1, "packetIds": ["a3f8c9..."] },
    { "deviceId": "phone-bridge", "hasInternet": true, "packetCount": 0, "packetIds": [] }
  ],
  "idempotencyCacheSize": 1
}`,
    action: () => getMeshState(),
  },
  {
    id: 'demo-send',
    method: 'POST',
    path: '/api/demo/send',
    title: 'Compose & Inject Offline Payment',
    description: 'Simulates a sender phone: builds PaymentInstruction, encrypts with server public key, wraps in MeshPacket, injects at specified device.',
    requestBody: `{
  "senderVpa": "alice@demo",
  "receiverVpa": "bob@demo",
  "amount": 500,
  "pin": "1234",
  "ttl": 5,
  "startDevice": "phone-alice"
}`,
    sampleResponse: `{
  "packetId": "550e8400-e29b-41d4-a716-446655440000",
  "ciphertextPreview": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...",
  "ttl": 5,
  "injectedAt": "phone-alice"
}`,
    action: () => sendPayment({ senderVpa: 'alice@demo', receiverVpa: 'bob@demo', amount: 500, pin: '1234', ttl: 5, startDevice: 'phone-alice' }),
  },
  {
    id: 'mesh-gossip',
    method: 'POST',
    path: '/api/mesh/gossip',
    title: 'Execute Mesh Gossip Round',
    description: 'Executes one round of mesh gossip. Devices share held packets with connected neighbors in range. TTL decrements per hop.',
    requestBody: null,
    sampleResponse: `{
  "transfers": 4,
  "deviceCounts": {
    "phone-alice": 1,
    "phone-stranger1": 1,
    "phone-bridge": 1
  }
}`,
    action: () => runGossip(),
  },
  {
    id: 'mesh-flush',
    method: 'POST',
    path: '/api/mesh/flush',
    title: 'Bridge Upload to Backend',
    description: 'All bridge nodes upload their cached packets to the backend simultaneously, exercising the concurrent idempotency check.',
    requestBody: null,
    sampleResponse: `{
  "uploadsAttempted": 1,
  "results": [
    {
      "bridgeNode": "phone-bridge",
      "packetId": "a3f8c9...",
      "outcome": "SETTLED",
      "transactionId": 102
    }
  ]
}`,
    action: () => flushBridges(),
  },
  {
    id: 'mesh-reset',
    method: 'POST',
    path: '/api/mesh/reset',
    title: 'Reset Mesh & Idempotency Cache',
    description: 'Clears all packets from all devices and resets the idempotency cache while preserving account ledgers.',
    requestBody: null,
    sampleResponse: `{
  "status": "mesh and idempotency cache cleared"
}`,
    action: () => resetMesh(),
  },
];

function EndpointCard({ endpoint }) {
  const [expanded, setExpanded] = useState(false);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const isGet = endpoint.method === 'GET';

  const tryIt = async () => {
    setLoading(true);
    try {
      const data = await endpoint.action();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apple-card p-5 transition-all">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Badge variant={isGet ? 'emerald' : 'blue'}>{endpoint.method}</Badge>
          <code className="text-xs sm:text-sm font-mono text-[var(--text-primary)] font-semibold">
            {endpoint.path}
          </code>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
            {endpoint.title}
          </span>
          <span className="text-[11px] text-[var(--text-muted)] w-5 h-5 rounded-full bg-white/[0.04] flex items-center justify-center">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
        {endpoint.description}
      </p>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-4 animate-fade-in">
          {endpoint.requestBody && (
            <div>
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1.5">
                Request Payload Body
              </div>
              <pre className="bg-black/50 border border-white/[0.06] rounded-xl p-3 text-xs text-[#ff9f0a] font-mono overflow-x-auto leading-relaxed">
                {endpoint.requestBody}
              </pre>
            </div>
          )}

          <div>
            <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1.5">
              Response Schema
            </div>
            <pre className="bg-black/50 border border-white/[0.06] rounded-xl p-3 text-xs text-[#30d158] font-mono overflow-x-auto leading-relaxed">
              {endpoint.sampleResponse}
            </pre>
          </div>

          <div>
            <Button onClick={tryIt} loading={loading} size="sm" variant="secondary" icon="▶">
              Execute Endpoint
            </Button>
            {response && (
              <pre className="mt-3 bg-black/60 border border-[#2997ff]/30 rounded-xl p-3 text-xs text-[#2997ff] font-mono overflow-x-auto max-h-60 leading-relaxed">
                {response}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiExplorerPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-[var(--text-secondary)]">
          <span>REST API Reference</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          API Explorer & Live Playground
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
          Interact directly with mesh routing, cryptographic generation, and backend settlement endpoints. Works in both live backend and simulated client environments.
        </p>
      </div>

      <div className="space-y-3.5">
        {API_ENDPOINTS.map((ep) => (
          <EndpointCard key={ep.id} endpoint={ep} />
        ))}
      </div>

      <div className="mt-10 apple-card p-5 border-white/[0.08]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">🗄️</span>
          <h3 className="text-xs font-semibold text-[var(--text-primary)]">
            H2 In-Memory Database Console
          </h3>
        </div>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          When the Spring Boot backend is running locally, access the live SQL console at <code className="text-[#64d2ff] font-mono">http://localhost:8080/h2-console</code> (JDBC URL: <code className="text-[#64d2ff] font-mono">jdbc:h2:mem:upimesh</code>, User: <code className="text-[#64d2ff] font-mono">sa</code>, Password: blank).
        </p>
      </div>
    </div>
  );
}
