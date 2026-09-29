/**
 * High-fidelity Client-side Mesh & Settlement Simulator
 * 
 * Provides an offline standalone simulation engine that matches the Spring Boot
 * backend logic: RSA+AES wire formatting, hop TTL decrementing,
 * gossip propagation, concurrent bridge upload, and atomic idempotency dedup.
 */

const DEFAULT_ACCOUNTS = [
  { vpa: 'alice@demo', holderName: 'Alice', balance: 5000.00 },
  { vpa: 'bob@demo', holderName: 'Bob', balance: 1000.00 },
  { vpa: 'carol@demo', holderName: 'Carol', balance: 2500.00 },
  { vpa: 'dave@demo', holderName: 'Dave', balance: 500.00 },
];

const INITIAL_DEVICES = [
  { deviceId: 'phone-alice', name: 'Alice (Sender)', hasInternet: false, packetIds: [], battery: 94, rssi: -42 },
  { deviceId: 'phone-stranger1', name: 'Stranger 1', hasInternet: false, packetIds: [], battery: 78, rssi: -58 },
  { deviceId: 'phone-stranger2', name: 'Stranger 2', hasInternet: false, packetIds: [], battery: 65, rssi: -64 },
  { deviceId: 'phone-stranger3', name: 'Stranger 3', hasInternet: false, packetIds: [], battery: 82, rssi: -51 },
  { deviceId: 'phone-bridge', name: 'Bridge Node (4G)', hasInternet: true, packetIds: [], battery: 88, rssi: -38 },
];

function sha256Sim(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256_${hex}${Date.now().toString(16).slice(-6)}`;
}

function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class MeshSimulator {
  constructor() {
    this.reset();
  }

  reset() {
    this.accounts = JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS));
    this.devices = JSON.parse(JSON.stringify(INITIAL_DEVICES));
    this.packets = new Map(); // packetId -> packetObj
    this.idempotencyCache = new Set();
    this.transactions = [
      {
        id: 101,
        senderVpa: 'alice@demo',
        receiverVpa: 'bob@demo',
        amount: 250.00,
        status: 'SETTLED',
        bridgeNodeId: 'phone-bridge',
        hopCount: 3,
        settledAt: new Date(Date.now() - 3600000).toISOString(),
        packetHash: 'sha256_genesis_demo',
      }
    ];
    this.nextTxId = 102;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  getMeshState() {
    return {
      devices: this.devices.map(d => ({
        deviceId: d.deviceId,
        name: d.name,
        hasInternet: d.hasInternet,
        packetCount: d.packetIds.length,
        packetIds: [...d.packetIds],
        battery: d.battery,
        rssi: d.rssi,
      })),
      idempotencyCacheSize: this.idempotencyCache.size,
    };
  }

  getAccounts() {
    return JSON.parse(JSON.stringify(this.accounts));
  }

  getTransactions() {
    return JSON.parse(JSON.stringify(this.transactions));
  }

  getDevicePackets(deviceId) {
    const dev = this.devices.find(d => d.deviceId === deviceId);
    if (!dev) return [];
    return dev.packetIds.map(id => this.packets.get(id)).filter(Boolean);
  }

  getPacket(packetId) {
    return this.packets.get(packetId);
  }

  setDeviceInternet(deviceId, hasInternet) {
    const dev = this.devices.find(d => d.deviceId === deviceId);
    if (dev) {
      dev.hasInternet = !!hasInternet;
      this.notify();
    }
  }

  sendPayment({ senderVpa, receiverVpa, amount, pin, ttl = 5, startDevice = 'phone-alice' }) {
    const packetId = generateUuid();
    const nonce = generateUuid();
    const signedAt = Date.now();
    const numericAmount = parseFloat(amount);

    const rawInstruction = JSON.stringify({ senderVpa, receiverVpa, amount: numericAmount, nonce, signedAt });
    const packetHash = sha256Sim(rawInstruction);
    const mockRsaSessionKey = btoa('RSA2048_ENC_AES256_SESSION_KEY_' + packetId.slice(0, 16)).repeat(3).slice(0, 128);
    const mockIv = btoa('GCM_IV_12B_' + packetId.slice(0, 8)).slice(0, 16);
    const mockCipher = btoa(rawInstruction).replace(/=/g, '');
    const ciphertext = `${mockRsaSessionKey}:${mockIv}:${mockCipher}`;

    const packet = {
      packetId,
      ttl: parseInt(ttl, 10),
      originalTtl: parseInt(ttl, 10),
      createdAt: signedAt,
      ciphertext,
      ciphertextPreview: ciphertext.substring(0, 36) + '...',
      injectedAt: startDevice,
      senderVpa,
      receiverVpa,
      amount: numericAmount,
      pin,
      hash: packetHash,
      hops: 0,
      path: [startDevice],
    };

    this.packets.set(packetId, packet);

    const dev = this.devices.find(d => d.deviceId === startDevice);
    if (dev && !dev.packetIds.includes(packetId)) {
      dev.packetIds.push(packetId);
    }

    this.notify();

    return {
      packetId,
      ciphertextPreview: packet.ciphertextPreview,
      ttl: packet.ttl,
      injectedAt: startDevice,
      hash: packetHash,
    };
  }

  runGossip(connections = [
    ['phone-alice', 'phone-stranger1'],
    ['phone-alice', 'phone-stranger3'],
    ['phone-stranger1', 'phone-stranger2'],
    ['phone-stranger1', 'phone-stranger3'],
    ['phone-stranger2', 'phone-bridge'],
    ['phone-stranger3', 'phone-stranger2'],
    ['phone-stranger3', 'phone-bridge'],
  ]) {
    let transfers = 0;
    const deviceMap = new Map(this.devices.map(d => [d.deviceId, d]));
    const hopEvents = [];

    connections.forEach(([fromId, toId]) => {
      const fromDev = deviceMap.get(fromId);
      const toDev = deviceMap.get(toId);
      if (!fromDev || !toDev) return;

      fromDev.packetIds.forEach(pktId => {
        const pkt = this.packets.get(pktId);
        if (pkt && pkt.ttl > 1 && !toDev.packetIds.includes(pktId)) {
          toDev.packetIds.push(pktId);
          pkt.ttl -= 1;
          pkt.hops += 1;
          if (!pkt.path.includes(toId)) pkt.path.push(toId);
          transfers++;
          hopEvents.push({ packetId: pktId, from: fromId, to: toId });
        }
      });

      toDev.packetIds.forEach(pktId => {
        const pkt = this.packets.get(pktId);
        if (pkt && pkt.ttl > 1 && !fromDev.packetIds.includes(pktId)) {
          fromDev.packetIds.push(pktId);
          pkt.ttl -= 1;
          pkt.hops += 1;
          if (!pkt.path.includes(fromId)) pkt.path.push(fromId);
          transfers++;
          hopEvents.push({ packetId: pktId, from: toId, to: fromId });
        }
      });
    });

    const deviceCounts = {};
    this.devices.forEach(d => {
      deviceCounts[d.deviceId] = d.packetIds.length;
    });

    this.notify();

    return {
      transfers,
      deviceCounts,
      hopEvents,
    };
  }

  flushBridges() {
    const bridgeDevices = this.devices.filter(d => d.hasInternet && d.packetIds.length > 0);
    const results = [];
    let uploadsAttempted = 0;

    bridgeDevices.forEach(bridge => {
      const packetsToProcess = [...bridge.packetIds];
      bridge.packetIds = [];

      packetsToProcess.forEach(pktId => {
        uploadsAttempted++;
        const pkt = this.packets.get(pktId);
        if (!pkt) return;

        if (this.idempotencyCache.has(pkt.hash)) {
          results.push({
            bridgeNode: bridge.deviceId,
            packetId: pkt.packetId,
            outcome: 'DUPLICATE_DROPPED',
            reason: 'Packet hash already claimed in atomic idempotency registry',
          });
          return;
        }

        const sender = this.accounts.find(a => a.vpa === pkt.senderVpa);
        const receiver = this.accounts.find(a => a.vpa === pkt.receiverVpa);

        if (!sender || sender.balance < pkt.amount) {
          results.push({
            bridgeNode: bridge.deviceId,
            packetId: pkt.packetId,
            outcome: 'INVALID',
            reason: 'Insufficient balance or invalid sender account',
          });
          return;
        }

        this.idempotencyCache.add(pkt.hash);

        sender.balance -= pkt.amount;
        if (receiver) {
          receiver.balance += pkt.amount;
        }

        const tx = {
          id: this.nextTxId++,
          senderVpa: pkt.senderVpa,
          receiverVpa: pkt.receiverVpa,
          amount: pkt.amount,
          status: 'SETTLED',
          bridgeNodeId: bridge.deviceId,
          hopCount: pkt.hops || 2,
          settledAt: new Date().toISOString(),
          packetHash: pkt.hash,
        };

        this.transactions.unshift(tx);

        results.push({
          bridgeNode: bridge.deviceId,
          packetId: pkt.packetId,
          outcome: 'SETTLED',
          reason: '',
          transactionId: tx.id,
        });
      });
    });

    this.notify();

    return {
      uploadsAttempted,
      results,
    };
  }

  simulateReplayAttack(packetId) {
    const pkt = this.packets.get(packetId);
    if (!pkt) throw new Error('Packet not found');

    const isDuplicate = this.idempotencyCache.has(pkt.hash);
    return {
      packetId,
      attemptedAt: new Date().toISOString(),
      hash: pkt.hash,
      outcome: isDuplicate ? 'DUPLICATE_DROPPED' : 'SETTLED',
      reason: isDuplicate ? 'Replay attack blocked: ciphertext hash exists in atomic idempotency cache' : 'Packet settled',
    };
  }

  simulateTamperAttack(packetId) {
    const pkt = this.packets.get(packetId);
    if (!pkt) throw new Error('Packet not found');

    const tampered = pkt.ciphertext.slice(0, 10) + 'X' + pkt.ciphertext.slice(11);
    return {
      packetId,
      originalCiphertext: pkt.ciphertextPreview,
      tamperedCiphertext: tampered.substring(0, 36) + '...',
      outcome: 'REJECTED',
      reason: 'AES-GCM Authentication Tag mismatch — payload tampered in transit',
    };
  }
}

export const meshSimulator = new MeshSimulator();
