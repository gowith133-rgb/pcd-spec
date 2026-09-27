export interface RfcSection {
  id: string;
  number: string;
  title: string;
  subsections?: {
    id: string;
    number: string;
    title: string;
  }[];
}

export type AutonomyRingLevel = 0 | 1 | 2 | 3;

export interface AutonomyRingInfo {
  level: AutonomyRingLevel;
  domainName: string;
  badge: string;
  networkAccess: string;
  executionRights: string;
  memoryBoundary: string;
  failureDefense: string;
  capabilities: string[];
  blockedSyscalls: string[];
  allowedSyscalls: string[];
  color: {
    primary: string;
    border: string;
    bg: string;
    text: string;
    glow: string;
  };
}

export interface CapabilityToken {
  cap_id: string;
  issuer: string;
  subject: string;
  audience: string;
  allowed_ring: AutonomyRingLevel;
  scope: {
    resource: string;
    actions: string[];
    max_bytes?: number;
    ttl_seconds?: number;
  };
  issued_at: number;
  expires_at: number;
  signature: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'PROBATIONARY';
}

export interface IntentEscalationRequest {
  request_id: string;
  timestamp: string;
  source_node: {
    agent_id: string;
    current_ring: AutonomyRingLevel;
    public_key: string;
  };
  target_capability: {
    requested_ring: AutonomyRingLevel;
    resource_uri: string;
    actions: string[];
    requested_ttl_seconds: number;
  };
  intent: {
    goal_description: string;
    rationale: string;
    execution_plan_hash: string;
  };
  payload_preview: {
    command_type: string;
    parameters_digest: string;
    raw_parameters?: Record<string, any>;
  };
  proof_of_state: {
    previous_state_hash: string;
    cot_digest: string;
  };
  signature: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  ring: AutonomyRingLevel;
  type: 'INTENT_SUBMIT' | 'GATE_EVAL' | 'CAP_MINT' | 'FAULT_DETECT' | 'RING_DEMOTE' | 'STATE_ROLLBACK' | 'REHAB_STAGE' | 'WOT_CONSENSUS';
  title: string;
  details: string;
  status: 'SUCCESS' | 'WARN' | 'DANGER' | 'INFO';
  merkleRoot: string;
  metadata?: Record<string, any>;
}

export interface FaultScenario {
  id: string;
  faultType: 'Type I' | 'Type II' | 'Type III' | 'Type IV';
  classification: string;
  detectionMechanism: string;
  systemConsequence: string;
  description: string;
  simulatedAction: string;
  mitigationSteps: string[];
}

export interface PeerNode {
  id: string;
  name: string;
  ring: AutonomyRingLevel;
  nodeId: string;
  publicKey: string;
  ipEndpoint: string;
  reputationScore: number;
  status: 'ONLINE' | 'ACTIVE_MESH' | 'FLAGGED' | 'DEMOTED';
  stakeAmount: number;
}

export interface PeerRevocationProposal {
  consensus_id: string;
  target_node_id: string;
  demotion_action: 'DEMOTE_TO_RING_2' | 'DEMOTE_TO_RING_1' | 'DEMOTE_TO_RING_0' | 'ISOLATE_MESH_PORT';
  threshold_met: {
    required_signatures: number;
    valid_signatures_collected: number;
  };
  fault_attestations: {
    reporting_peer_id: string;
    fault_type: string;
    evidence_hash: string;
    peer_signature: string;
  }[];
  aggregated_signature: string;
}

export interface ThreatMatrixItem {
  id: string;
  threatVector: string;
  affectedLayer: string;
  architecturalMitigation: string;
  attackScenario: string;
  pcdDefenseMechanism: string;
  status: 'MITIGATED' | 'VERIFIED';
}
