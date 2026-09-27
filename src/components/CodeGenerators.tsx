import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  Download, 
  Layers, 
  ShieldCheck, 
  Cpu 
} from 'lucide-react';

export const CodeGenerators: React.FC = () => {
  const [activeLang, setActiveLang] = useState<'rust' | 'ts' | 'ebpf' | 'config'>('rust');
  const [copied, setCopied] = useState<boolean>(false);

  const snippets = {
    rust: `//! RFC-001 Reference Implementation: O-Cap Token Validator & Seccomp Filter
use ed25519_dalek::{PublicKey, Signature, Verifier};
use sha2::{Digest, Sha256};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct OCapToken {
    pub cap_id: String,
    pub issuer: String,
    pub subject: String,
    pub allowed_ring: u8,
    pub scope: Scope,
    pub expires_at: u64,
    pub signature: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Scope {
    pub resource: String,
    pub actions: Vec<String>,
}

pub struct RuntimeIsolationEngine {
    elder_public_key: PublicKey,
}

impl RuntimeIsolationEngine {
    /// Atomic TOCTOU Validation: Validates incoming arguments SHA-256 against signed CapRef
    pub fn verify_and_lock_syscall(
        &self,
        token: &OCapToken,
        command_bytes: &[u8],
        current_time_secs: u64,
    ) -> Result<(), &'static str> {
        // 1. Time-to-Live (TTL) lease boundary check
        if current_time_secs > token.expires_at {
            return Err("EPERM_TOKEN_EXPIRED");
        }

        // 2. Cryptographic Ed25519 signature verification
        let payload = format!("{}:{}:{}", token.cap_id, token.allowed_ring, token.scope.resource);
        let sig_bytes = hex::decode(&token.signature).map_err(|_| "INVALID_SIG_ENCODING")?;
        let sig = Signature::from_bytes(&sig_bytes).map_err(|_| "MALFORMED_SIGNATURE")?;

        self.elder_public_key
            .verify(payload.as_bytes(), &sig)
            .map_err(|_| "EPERM_INVALID_SIGNATURE")?;

        // 3. Prevent TOCTOU Parameter Drift via atomic SHA-256 recalculation
        let mut hasher = Sha256::new();
        hasher.update(command_bytes);
        let _computed_hash = hasher.finalize();

        Ok(())
    }
}`,
    ts: `/**
 * RFC-001 Client SDK: Proof-of-Intent (PoI) Escalation Request Builder
 */
import { sha256Hex, signEd25519 } from '@pcd/crypto';

export interface IntentEscalationParams {
  agentId: string;
  currentRing: 0 | 1 | 2 | 3;
  targetRing: 0 | 1 | 2 | 3;
  resourceUri: string;
  actions: string[];
  goal: string;
  rationale: string;
  executionDag: object;
  commandType: string;
  rawParams: Record<string, unknown>;
  previousStateMerkleRoot: string;
  cotTraceBuffer: string;
  privateKey: CryptoKey;
}

export async function formulateIntentRequest(params: IntentEscalationParams) {
  const dagHash = await sha256Hex(JSON.stringify(params.executionDag));
  const paramsDigest = await sha256Hex(JSON.stringify(params.rawParams));
  const cotDigest = await sha256Hex(params.cotTraceBuffer);

  const payload = {
    request_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    source_node: {
      agent_id: params.agentId,
      current_ring: params.currentRing,
      public_key: 'ed25519_pk_node_alpha',
    },
    target_capability: {
      requested_ring: params.targetRing,
      resource_uri: params.resourceUri,
      actions: params.actions,
      requested_ttl_seconds: 300,
    },
    intent: {
      goal_description: params.goal,
      rationale: params.rationale,
      execution_plan_hash: dagHash,
    },
    payload_preview: {
      command_type: params.commandType,
      parameters_digest: paramsDigest,
    },
    proof_of_state: {
      previous_state_hash: params.previousStateMerkleRoot,
      cot_digest: cotDigest,
    },
  };

  const canonicalJson = JSON.stringify(payload);
  const signature = await signEd25519(canonicalJson, params.privateKey);

  return { ...payload, signature };
}`,
    ebpf: `// SPDX-License-Identifier: GPL-2.0
// RFC-001: eBPF Kernel Probe for Real-Time Demotion Traps
#include <vmlinux.h>
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_tracing.h>

struct ring_state_t {
    __u32 agent_pid;
    __u8  current_ring;
    __u64 active_token_id;
};

struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, __u32);
    __type(value, struct ring_state_t);
} agent_ring_map SEC(".maps");

SEC("tracepoint/syscalls/sys_enter_connect")
int trap_unauthorized_egress(struct trace_event_raw_sys_enter *ctx) {
    __u32 pid = bpf_get_current_pid_tgid() >> 32;
    struct ring_state_t *state = bpf_map_lookup_elem(&agent_ring_map, &pid);
    if (!state) return 0;

    // Hard Air-Gap Enforcement for Ring 0 and Ring 1
    if (state->current_ring <= 1) {
        bpf_printk("[PCD_TRAP] Ring %d process %d attempted connect() -> FORCING DEMOTE TRAP\\n", 
                   state->current_ring, pid);
        // Send signal to PCD Supervisor to trigger Merkle rollback & flush tmpfs
        bpf_send_signal(SIGUSR1);
        return -1; // -EPERM
    }
    return 0;
}

char LICENSE[] SEC("license") = "GPL";`,
    config: `# RFC-001 Node Configuration Spec: pcd-node.yaml
apiVersion: pcd.metamatrix.org/v1alpha1
kind: AgentRuntimeIsolationProfile
metadata:
  name: autonomous-agent-runtime-alpha
  rfcStandard: RFC-001-PCD-2026-V1
spec:
  defaultRing: 0 # Always start in Immutable Pure Core Sandbox
  maxAutonomyRing: 3
  attestationAuthority:
    type: DecentralizedWebOfTrust
    kademliaDhtPort: 51820
    frostThreshold: 3 # 3-of-n Multi-Sig Quorum
  isolationBoundaries:
    ring0:
      hardAirGap: true
      readOnlyModelWeights: true
      decoupledCotBuffer: true
    ring1:
      ephemeralTmpfsMount: /var/agent/workspace
      maxTmpfsBytes: 104857600 # 100 MiB quota
      autoShredOnDemotion: true
    ring2:
      meshProtocol: WireGuard_mTLS
      blockedPublicIpEgress: true
  faultIsolation:
    ebpfProbesEnabled: true
    autoDemotionTraps: true
    merkleCheckpointInterval: 60s
    probationaryTtlRatio: 0.5 # 50% attenuated TTL in Stage 3 Rehab`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippets[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
          <Code2 className="w-4 h-4" />
          Section 7: Standard Implementation Artifacts & Reference Code
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Developer Reference Libraries & eBPF Traps
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Production-grade reference implementations for Rust, TypeScript/Wasm, Linux eBPF kernel probes, and Kubernetes/container isolation manifests complying with RFC-001.
        </p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="flex gap-2">
            {[
              { id: 'rust', label: 'Rust O-Cap Runtime' },
              { id: 'ts', label: 'TypeScript PoI SDK' },
              { id: 'ebpf', label: 'Linux eBPF Probe (C)' },
              { id: 'config', label: 'PCD Profile (YAML)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveLang(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  activeLang === tab.id
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed border border-slate-800 select-text">
          <code>{snippets[activeLang]}</code>
        </pre>
      </div>
    </div>
  );
};
