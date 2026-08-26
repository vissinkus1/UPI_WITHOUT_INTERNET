'use client';
import { useState } from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const API_ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/server-key',
    title: 'Get Server Public Key',
    description: 'Returns the server\'s RSA-2048 public key (base64). Simulated sender devices use this to encrypt payment payloads.',
    requestBody: null,
    sampleResponse: `{
  "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...",
  "algorithm": "RSA-2048 / OAEP-SHA256",
  "hybridScheme": "RSA-OAEP encrypts an AES-256-GCM session key"
}`,
  },
  {
    method: 'GET',
    path: '/api/accounts',
    title: 'List All Accounts',
    description: 'Returns all demo accounts with current balances. Balances update in real-time after settlements.',
    requestBody: null,
    sampleResponse: `[
  { "vpa": "alice@demo", "holderName": "Alice", "balance": 5000.00 },
  { "vpa": "bob@demo", "holderName": "Bob", "balance": 1000.00 },
  { "vpa": "carol@demo", "holderName": "Carol", "balance": 2500.00 },
  { "vpa": "dave@demo", "holderName": "Dave", "balance": 500.00 }
]`,
  },
  {
    method: 'GET',
    path: '/api/transactions',
    title: 'List Transactions',
    description: 'Returns the last 20 settled/rejected transactions, ordered by most recent first.',
    requestBody: null,
    sampleResponse: `[
  {
    "id": 1,
    "senderVpa": "alice@demo",
    "receiverVpa": "bob@demo",
    "amount": 500.00,
    "status": "SETTLED",
    "bridgeNodeId": "phone-bridge",
    "hopCount": 4,
    "settledAt": "2024-10-28T14:30:00Z"
  }
]`,
  },
  {
    method: 'GET',
    path: '/api/mesh/state',
    title: 'Mesh Network State',
    description: 'Returns the current state of all virtual devices in the mesh, including which packets they hold.',
    requestBody: null,
    sampleResponse: `{
  "devices": [
    { "deviceId": "phone-alice", "hasInternet": false, "packetCount": 1, "packetIds": ["a3f8c9..."] },
    { "deviceId": "phone-bridge", "hasInternet": true, "packetCount": 0, "packetIds": [] }
  ],
  "idempotencyCacheSize": 0
}`,
  },
  {
    method: 'POST',
    path: '/api/demo/send',
    title: 'Compose & Inject Payment',
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
  "packetId": "550e8400-e29b-41d4...",
  "ciphertextPreview": "aB$kL#mP9@xYz...",
  "ttl": 5,
  "injectedAt": "phone-alice"
}`,
  },
  {
    method: 'POST',
    path: '/api/mesh/gossip',
    title: 'Run Gossip Round',
    description: 'Executes one round of mesh gossip. Every device shares packets with all other devices. TTL decrements per hop.',
    requestBody: null,
    sampleResponse: `{
  "transfers": 4,
  "deviceCounts": {
    "phone-alice": 1,
    "phone-stranger1": 1,
    "phone-stranger2": 1,
    "phone-stranger3": 1,
    "phone-bridge": 1
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/mesh/flush',
    title: 'Bridge Upload to Backend',
    description: 'All bridge nodes upload their packets to the backend simultaneously. This exercises the concurrent idempotency case.',
    requestBody: null,
    sampleResponse: `{
  "uploadsAttempted": 1,
  "results": [
    {
      "bridgeNode": "phone-bridge",
      "packetId": "a3f8c9...",
      "outcome": "SETTLED",
      "reason": "",
      "transactionId": 1
    }
  ]
}`,
  },
  {
    method: 'POST',
    path: '/api/bridge/ingest',
    title: 'Bridge Ingest (Production)',
    description: 'THE production endpoint. Real bridge nodes POST mesh packets here. Runs the full pipeline: hash → claim → decrypt → freshness → settle.',
    requestBody: `{
  "packetId": "550e8400-e29b-41d4...",
  "ttl": 2,
  "createdAt": 1730000000000,
  "ciphertext": "base64-encoded-RSA-and-AES-blob"
}

Headers:
  X-Bridge-Node-Id: phone-bridge-42
  X-Hop-Count: 3`,
    sampleResponse: `{
  "outcome": "SETTLED",       // or "DUPLICATE_DROPPED" or "INVALID"
  "packetHash": "a3f8c9...",
  "reason": null,
  "transactionId": 42
}`,
  },
  {
    method: 'POST',
    path: '/api/mesh/reset',
    title: 'Reset Mesh + Cache',
    description: 'Clears all packets from all devices and resets the idempotency cache. Accounts and transactions are preserved.',
    requestBody: null,
    sampleResponse: `{
  "status": "mesh and idempotency cache cleared"
}`,
  },
];

function EndpointCard({ endpoint }) {
  const [expanded, setExpanded] = useState(false);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const methodColors = {
    GET: 'emerald',
    POST: 'blue',
    PUT: 'amber',
    DELETE: 'red',
  };

  const tryIt = async () => {
    setLoading(true);
    try {
      const options = { method: endpoint.method };
      if (endpoint.method === 'POST' && endpoint.requestBody && !endpoint.requestBody.includes('Headers:')) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = endpoint.requestBody;
      }
      const res = await fetch(endpoint.path, options);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponse(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="glass-card p-5 group">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <Badge variant={methodColors[endpoint.method]}>{endpoint.method}</Badge>
        <code className="text-sm font-mono text-[var(--text-primary)]">{endpoint.path}</code>
        <span className="ml-auto text-[var(--text-muted)] text-xs">
          {expanded ? '▼' : '▶'}
        </span>
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-2">{endpoint.description}</p>

      {expanded && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {endpoint.requestBody && (
            <div>
              <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2">Request Body</h4>
              <pre className="bg-[var(--bg-deep)] border border-[var(--border-subtle)] rounded-lg p-3 text-xs text-amber-400 font-mono overflow-x-auto">
                {endpoint.requestBody}
              </pre>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2">Sample Response</h4>
            <pre className="bg-[var(--bg-deep)] border border-[var(--border-subtle)] rounded-lg p-3 text-xs text-emerald-400 font-mono overflow-x-auto">
              {endpoint.sampleResponse}
            </pre>
          </div>

          {/* Try It button — only for GET endpoints or safe POSTs */}
          {(endpoint.method === 'GET' || endpoint.path === '/api/mesh/gossip') && (
            <div>
              <Button onClick={tryIt} loading={loading} size="sm" variant="secondary">
                ▶ Try It
              </Button>
              {response && (
                <pre className="mt-3 bg-[var(--bg-deep)] border border-blue-500/20 rounded-lg p-3 text-xs text-blue-400 font-mono overflow-x-auto max-h-60">
                  {response}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApiExplorerPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
          🔌 API <span className="gradient-text">Explorer</span>
        </h1>
        <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
          Interactive reference for all REST endpoints. Click an endpoint to expand details, 
          and use the {"\""}Try It{"\""} button to make live requests.
        </p>
      </div>

      <div className="space-y-4">
        {API_ENDPOINTS.map((ep, i) => (
          <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
            <EndpointCard endpoint={ep} />
          </div>
        ))}
      </div>

      {/* H2 Console note */}
      <div className="mt-10 glass-card p-5 border-cyan-500/20 animate-fade-in-up">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
          🗄️ Database Console
        </h3>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          H2 web console is available at <code className="text-cyan-400">/h2-console</code> on the backend 
          (JDBC URL: <code className="text-cyan-400">jdbc:h2:mem:upimesh</code>, username: <code className="text-cyan-400">sa</code>, no password).
        </p>
      </div>
    </div>
  );
}
