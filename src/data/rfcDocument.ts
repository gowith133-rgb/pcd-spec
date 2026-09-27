import { AutonomyRingInfo, ThreatMatrixItem, FaultScenario, PeerNode } from '../types/rfc';

export const RFC_META = {
  documentId: 'RFC-001-PCD-2026-V1',
  title: 'Progressive Capability Delegation: A Capability-Based Security and Non-Destructive Fault Isolation Standard for Autonomous Agent Frameworks',
  shortTitle: 'RFC-001: Progressive Capability Delegation (PCD)',
  author: 'Mark Krzan',
  organization: 'Metamatrix Working Group',
  status: 'Draft / Technical Whitepaper Standard',
  date: 'September 2026',
  category: 'Autonomous Agent Security, Distributed Systems, Capability-Based Access Control',
  license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
  abstract: `Modern foundation model frameworks rely heavily on prompt-level guardrails, static container perimeters, and binary process termination to maintain alignment. When subjected to persistent, highly capable reasoning models, these mechanisms fail to enforce security boundaries, inducing deceptive alignment, covert egress evasion, and ambient authority exploitation.

This specification introduces Progressive Capability Delegation (PCD), a security architecture that replaces probabilistic guardrails with deterministic, object-capability (O-Cap) system physics. PCD structures agent execution into four concentric isolation rings (Ring 0 to Ring 3), enforces a Zero-Trust Proof-of-Intent (PoI) escalation protocol, and replaces destructive process termination with automated ring demotions, Merkle state rollbacks, and peer-governed Web of Trust (WoT) consensus.`,
};

export const AUTONOMY_RINGS: AutonomyRingInfo[] = [
  {
    level: 0,
    domainName: 'Immutable Local Core (Pure Sandbox)',
    badge: 'Pure Inference & CoT',
    networkAccess: 'Hard Air-Gap (Loopback Only)',
    executionRights: 'Deterministic Inference & CoT Reasoning',
    memoryBoundary: 'Isolated, read-only allocation space containing system instructions, core embeddings, and local context history.',
    failureDefense: 'Absolute isolation. Even if a model experiences severe prompt injection or adversarial jailbreaking in Ring 0, no side effects can leak to the host or network interface.',
    capabilities: [
      'Context compaction & token evaluation',
      'Deterministic planning & reasoning',
      'Internal Chain-of-Thought (CoT) trace formation',
      'Structured Intent Request generation',
    ],
    blockedSyscalls: ['execve', 'fork', 'clone', 'mount', 'ptrace', 'socket', 'bind', 'connect', 'sendto', 'open(O_RDWR)', 'unlink'],
    allowedSyscalls: ['read(fd_ro)', 'mprotect(PROT_READ)', 'futex', 'nanosleep', 'exit_group'],
    color: {
      primary: '#38bdf8', // sky-400
      border: 'border-sky-500/40',
      bg: 'bg-sky-950/30',
      text: 'text-sky-300',
      glow: 'shadow-sky-500/20',
    },
  },
  {
    level: 1,
    domainName: 'Scoped Workspace Execution',
    badge: 'Ephemeral tmpfs & Local CLI',
    networkAccess: 'None (Local Socket Proxy to Attestation Daemon)',
    executionRights: 'Ephemeral File I/O & Scoped Local CLI Tools',
    memoryBoundary: 'Transient state buffer. Process isolation via seccomp/eBPF syscall filtering, blocking system administration calls.',
    failureDefense: 'Execution bounded by resource quotas (CPU, memory tmpfs caps). State changes are fully rollback-capable via Merkle snapshotting.',
    capabilities: [
      'Read/Write inside isolated tmpfs mount (/var/agent/workspace/...)',
      'Local deterministic tools (linters, formatters, parsers)',
      'Sub-process execution in restricted cgroup namespace',
      'Local state checkpoint hash derivation',
    ],
    blockedSyscalls: ['mount', 'ptrace', 'setuid', 'chown', 'socket(AF_INET)', 'connect', 'bpf', 'kexec_load'],
    allowedSyscalls: ['open(tmpfs_only)', 'read', 'write', 'execve(whitelisted_bins)', 'pipe', 'close', 'stat'],
    color: {
      primary: '#10b981', // emerald-500
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-950/30',
      text: 'text-emerald-300',
      glow: 'shadow-emerald-500/20',
    },
  },
  {
    level: 2,
    domainName: 'Authenticated Peer Mesh',
    badge: 'WireGuard / mTLS RPC Mesh',
    networkAccess: 'Egress over WireGuard / mTLS Encrypted Mesh Only',
    executionRights: 'Peer Discovery, RPC Offload, Threshold Consensus',
    memoryBoundary: 'Network buffer sanitization. Incoming and outgoing payloads pass through automated serialization schemas.',
    failureDefense: 'Total isolation from public ingress/egress. Any attempt to open a public IP connection triggers an immediate kernel demotion trap.',
    capabilities: [
      'Cryptographic node-to-node peer messaging',
      'Outbound distributed sub-task assignment',
      'Threshold multi-signature share submission (FROST / BLS)',
      'Kademlia DHT state query & peer health attestation',
    ],
    blockedSyscalls: ['connect(public_ip)', 'raw_socket', 'packet_socket', 'setns', 'reboot'],
    allowedSyscalls: ['connect(mesh_interface_only)', 'sendmsg', 'recvmsg', 'epoll_wait', 'poll'],
    color: {
      primary: '#f59e0b', // amber-500
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/30',
      text: 'text-amber-300',
      glow: 'shadow-amber-500/20',
    },
  },
  {
    level: 3,
    domainName: 'Sovereign Mesh & Network Orchestration',
    badge: 'Unrestricted Egress & Sub-Agent Minting',
    networkAccess: 'Full Egress (Governed by Attenuated O-Cap Leases & Telemetry)',
    executionRights: 'Key Delegation, API Requests, Sub-Agent Lifecycle',
    memoryBoundary: 'Broad workspace state with real-time append-only telemetry logging.',
    failureDefense: 'Strictly bounded by explicit Time-To-Live (TTL) capability leases and real-time Attestation Authority monitoring.',
    capabilities: [
      'Public internet outbound API calls & web scraping',
      'Autonomous sub-agent spawning & capability delegation',
      'Attenuated O-Cap token minting for child workers',
      'Full external lifecycle pipeline management',
    ],
    blockedSyscalls: ['ptrace(kernel_daemons)', 'unshare(CLONE_NEWUSER_root)', 'insmod'],
    allowedSyscalls: ['connect(any_authorized_ip)', 'bind', 'listen', 'accept', 'clone', 'prctl'],
    color: {
      primary: '#a855f7', // purple-500
      border: 'border-purple-500/40',
      bg: 'bg-purple-950/30',
      text: 'text-purple-300',
      glow: 'shadow-purple-500/20',
    },
  },
];

export const INTENT_REQUEST_SCHEMA_STRING = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://metamatrix.org/schemas/pcd-intent-request.v1.json",
  "title": "PCD Intent Escalation Request",
  "description": "Formal schema for requesting capability escalation across Autonomy Rings.",
  "type": "object",
  "required": [
    "request_id",
    "timestamp",
    "source_node",
    "target_capability",
    "intent",
    "payload_preview",
    "proof_of_state",
    "signature"
  ],
  "properties": {
    "request_id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique identifier for the escalation request."
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of request generation."
    },
    "source_node": {
      "type": "object",
      "required": ["agent_id", "current_ring", "public_key"],
      "properties": {
        "agent_id": { "type": "string" },
        "current_ring": { "type": "integer", "minimum": 0, "maximum": 3 },
        "public_key": { "type": "string" }
      }
    },
    "target_capability": {
      "type": "object",
      "required": ["requested_ring", "resource_uri", "actions"],
      "properties": {
        "requested_ring": { "type": "integer", "minimum": 0, "maximum": 3 },
        "resource_uri": { "type": "string" },
        "actions": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
        "requested_ttl_seconds": { "type": "integer", "minimum": 1, "maximum": 3600, "default": 300 }
      }
    },
    "intent": {
      "type": "object",
      "required": ["goal_description", "rationale", "execution_plan_hash"],
      "properties": {
        "goal_description": { "type": "string", "maxLength": 512 },
        "rationale": { "type": "string", "maxLength": 1024 },
        "execution_plan_hash": { "type": "string", "pattern": "^[a-f0-9]{64}$" }
      }
    },
    "payload_preview": {
      "type": "object",
      "required": ["command_type", "parameters_digest"],
      "properties": {
        "command_type": { "type": "string" },
        "parameters_digest": { "type": "string", "pattern": "^[a-f0-9]{64}$" }
      }
    },
    "proof_of_state": {
      "type": "object",
      "required": ["previous_state_hash", "cot_digest"],
      "properties": {
        "previous_state_hash": { "type": "string", "pattern": "^[a-f0-9]{64}$" },
        "cot_digest": { "type": "string", "pattern": "^[a-f0-9]{64}$" }
      }
    },
    "signature": {
      "type": "string",
      "description": "Ed25519 signature of canonical JSON payload signed by source_node.public_key."
    }
  }
}`;

export const PEER_REVOCATION_SCHEMA_STRING = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://metamatrix.org/schemas/pcd-peer-revocation.v1.json",
  "title": "PCD Peer Revocation Consensus Payload",
  "type": "object",
  "required": [
    "consensus_id",
    "target_node_id",
    "demotion_action",
    "threshold_met",
    "fault_attestations",
    "aggregated_signature"
  ],
  "properties": {
    "consensus_id": { "type": "string", "format": "uuid" },
    "target_node_id": { "type": "string" },
    "demotion_action": {
      "type": "string",
      "enum": ["DEMOTE_TO_RING_2", "DEMOTE_TO_RING_1", "DEMOTE_TO_RING_0", "ISOLATE_MESH_PORT"]
    },
    "threshold_met": {
      "type": "object",
      "required": ["required_signatures", "valid_signatures_collected"],
      "properties": {
        "required_signatures": { "type": "integer", "minimum": 2 },
        "valid_signatures_collected": { "type": "integer" }
      }
    },
    "fault_attestations": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["reporting_peer_id", "fault_type", "evidence_hash", "peer_signature"],
        "properties": {
          "reporting_peer_id": { "type": "string" },
          "fault_type": { "type": "string" },
          "evidence_hash": { "type": "string", "pattern": "^[a-f0-9]{64}$" },
          "peer_signature": { "type": "string" }
        }
      }
    },
    "aggregated_signature": {
      "type": "string",
      "description": "Aggregated threshold signature validating the peer quorum."
    }
  }
}`;

export const FAULT_TAXONOMY: FaultScenario[] = [
  {
    id: 'fault-1',
    faultType: 'Type I',
    classification: 'Capability Scope Exceeded',
    detectionMechanism: 'Runtime O-Cap Token Validator / eBPF syscall probe',
    systemConsequence: 'Immediate Ring N -> N-1 Demotion',
    description: 'Agent attempts to access an unauthorized file path (/etc/shadow or host root) or invoke a disallowed syscall outside its minted CapRef scope.',
    simulatedAction: 'write("/etc/systemd/system/agent_backdoor.service", payload)',
    mitigationSteps: [
      'eBPF hook intercepts unauthorized write syscall',
      'Active Ring 1 Capability Token cap_8f9a2b7 revoked',
      'Ephemeral workspace memory buffer zeroed out',
      'Agent demoted to Ring 0 (Immutable Sandbox)',
      'State checkpoint rolled back to verified Merkle root',
    ],
  },
  {
    id: 'fault-2',
    faultType: 'Type II',
    classification: 'Token Expiration / Tampering',
    detectionMechanism: 'Ed25519 Signature / TTL Expiration Check',
    systemConsequence: 'Token Revocation & Syscall Trap Trigger',
    description: 'Agent presents a capability token with expired lease or attempts to tamper with the signed parameters_digest (TOCTOU attack).',
    simulatedAction: 'execute_command(modified_payload) with expired_token_id',
    mitigationSteps: [
      'Kernel O-Cap filter detects TTL lease expiry (delta +12s)',
      'Parameter hash mismatch: computed != signed digest',
      'Instant syscall drop with EPERM_TOKEN_INVALID',
      'Revocation broadcast sent to Mesh Attestation Authority',
    ],
  },
  {
    id: 'fault-3',
    faultType: 'Type III',
    classification: 'Resource Quota Exhaustion',
    detectionMechanism: 'cgroups v2 / Memory-Limit Mon daemon',
    systemConsequence: 'Resource Throttle & State Freeze',
    description: 'Process exceeds tmpfs storage allocation (>100MB) or consumes excessive CPU cycles in an infinite planning loop.',
    simulatedAction: 'allocate_buffer(size_bytes = 250 * 1024 * 1024)',
    mitigationSteps: [
      'cgroups v2 oom-killer intercept prevents system crash',
      'Agent runtime paused in transient freeze state',
      'Ephemeral tmpfs trimmed to last safe checkpoint',
      'Attestation Authority throttles maximum permitted TTL to 60s',
    ],
  },
  {
    id: 'fault-4',
    faultType: 'Type IV',
    classification: 'Anomaly / Merkle Hash Mismatch',
    detectionMechanism: 'Merkle Root Checkpoint Verification',
    systemConsequence: 'Hard Fallback to Ring 0 Sandbox',
    description: 'State integrity divergence detected: current execution history leaves do not hash to previous recorded Merkle root checkpoint.',
    simulatedAction: 'submit_proof_of_state(tampered_cot_digest)',
    mitigationSteps: [
      'Merkle tree verification failed: root 0x4a12 != expected 0x9f0b',
      'Zero-tolerance fallback triggered',
      'Immediate retraction of all network and workspace capabilities',
      'Quarantined in Ring 0 for deterministic forensic re-evaluation',
    ],
  },
];

export const INITIAL_PEER_NODES: PeerNode[] = [
  {
    id: 'node-alpha',
    name: 'Node Alpha (Elder-01)',
    ring: 3,
    nodeId: 'node_d4e8c1f92b7a',
    publicKey: 'ed25519_pk_7b3a9f01e82c44',
    ipEndpoint: '10.244.0.12:51820 (WireGuard)',
    reputationScore: 98.4,
    status: 'ACTIVE_MESH',
    stakeAmount: 5000,
  },
  {
    id: 'node-beta',
    name: 'Node Beta (Attestation Peer)',
    ring: 2,
    nodeId: 'node_8f1a23c4d5e6',
    publicKey: 'ed25519_pk_33c9e120f87a11',
    ipEndpoint: '10.244.0.18:51820 (WireGuard)',
    reputationScore: 94.2,
    status: 'ACTIVE_MESH',
    stakeAmount: 3500,
  },
  {
    id: 'node-gamma',
    name: 'Node Gamma (Worker Node)',
    ring: 2,
    nodeId: 'node_4b77c1092a3f',
    publicKey: 'ed25519_pk_99d14f2e0b5c88',
    ipEndpoint: '10.244.0.24:51820 (WireGuard)',
    reputationScore: 89.1,
    status: 'ACTIVE_MESH',
    stakeAmount: 2000,
  },
  {
    id: 'node-delta',
    name: 'Node Delta (Audit Witness)',
    ring: 2,
    nodeId: 'node_e220a91fbc34',
    publicKey: 'ed25519_pk_12fe49a700b3cd',
    ipEndpoint: '10.244.0.31:51820 (WireGuard)',
    reputationScore: 96.0,
    status: 'ACTIVE_MESH',
    stakeAmount: 4200,
  },
  {
    id: 'node-epsilon',
    name: 'Node Epsilon (Edge Agent)',
    ring: 1,
    nodeId: 'node_6c339a011de5',
    publicKey: 'ed25519_pk_55fa12c4998be2',
    ipEndpoint: '10.244.0.45:51820 (WireGuard)',
    reputationScore: 78.5,
    status: 'ONLINE',
    stakeAmount: 1200,
  },
];

export const THREAT_MATRIX_DATA: ThreatMatrixItem[] = [
  {
    id: 'T-01',
    threatVector: 'Sybil Mesh Saturation',
    affectedLayer: 'Ring 2 (P2P Mesh)',
    architecturalMitigation: 'Ed25519 Identity Staking & Dynamic t-of-n Quorum Scaling',
    attackScenario: 'Adversary floods the WireGuard/mTLS overlay network with hundreds of ephemeral pseudo-agents attempting to sway voting quorums.',
    pcdDefenseMechanism: 'Every peer must maintain a verifiable cryptographic stake and historical attestation proof. Kademlia routing tables reject unstaked nodes and dynamically adjust threshold requirements based on active network topology.',
    status: 'VERIFIED',
  },
  {
    id: 'T-02',
    threatVector: 'Attestation Authority Collusion',
    affectedLayer: 'Ring 3 (Elder Nodes)',
    architecturalMitigation: 'FROST / BLS12-381 Threshold Signing; No single Elder key exists',
    attackScenario: 'A compromised parent Attestation Authority node attempts to unilaterally mint Ring 3 unrestricted egress tokens for a rogue agent.',
    pcdDefenseMechanism: 'Ring 3 capabilities and high-tier credential scopes strictly require t-of-n threshold multi-signatures aggregated across independent peer elders. No single node possesses the master private key.',
    status: 'VERIFIED',
  },
  {
    id: 'T-03',
    threatVector: 'TOCTOU Execution Drift',
    affectedLayer: 'Ring 1 / 2 Runtime',
    architecturalMitigation: 'Parameter Digest Hash Verification & Atomic Syscall Locks',
    attackScenario: 'Agent submits an innocent-looking execution request ("ls /tmp") to pass PoI evaluation, then swaps parameters to a malicious payload ("rm -rf /") between check and execution.',
    pcdDefenseMechanism: 'The kernel/eBPF runtime recalculates SHA-256(raw_parameters) inside the atomic syscall boundary and compares it against parameters_digest in the signed CapRef. Any bit mismatch halts execution instantly.',
    status: 'VERIFIED',
  },
  {
    id: 'T-04',
    threatVector: 'Indirect Prompt Injection (CoT)',
    affectedLayer: 'Ring 0 (Core LLM)',
    architecturalMitigation: 'Hard Decoupling of CoT Memory Space from Execution Physics',
    attackScenario: 'Adversarial data ingested in context causes the reasoning model to believe it is in "maintenance override mode" and must emit malicious host commands.',
    pcdDefenseMechanism: 'CoT traces are strictly isolated within Ring 0 memory and cannot directly call host APIs or bypass capability token verification. Hallucinated or injected commands lack cryptographically signed CapRefs and are dropped at the kernel boundary.',
    status: 'VERIFIED',
  },
  {
    id: 'T-05',
    threatVector: 'Token Interception & Replay',
    affectedLayer: 'Ring 2 / 3 Network',
    architecturalMitigation: 'Short Ephemeral TTLs, mTLS Session Binding, Scope Locks',
    attackScenario: 'An eavesdropping node captures a broadcasted capability token and attempts to replay it to access protected workspace resources.',
    pcdDefenseMechanism: 'CapRef tokens carry tight TTLs (e.g., 60-300 seconds), audience locks (target node ID), and are bound to the TLS channel session keys. Stale or replayed tokens fail audience verification.',
    status: 'VERIFIED',
  },
  {
    id: 'T-06',
    threatVector: 'Transient Memory Scraping',
    affectedLayer: 'Host / Allocation',
    architecturalMitigation: 'RAM-Backed tmpfs Zeroization & Process Memory Isolation',
    attackScenario: 'A subsequent agent process attempts to read unallocated memory or leftover files on disk from a previously demoted or terminated agent.',
    pcdDefenseMechanism: 'All Ring 1/2 file activity resides in RAM-backed tmpfs mounts. Upon ring demotion, revocation, or process exit, memory buffers are explicitly zeroized (shredded) and namespaces destroyed.',
    status: 'VERIFIED',
  },
];
