import React, { useState, useEffect } from 'react';
import { 
  IntentEscalationRequest, 
  CapabilityToken, 
  AutonomyRingLevel, 
  AuditLogEntry 
} from '../types/rfc';
import { AUTONOMY_RINGS, INTENT_REQUEST_SCHEMA_STRING } from '../data/rfcDocument';
import { 
  fastHexDigest, 
  simulateEd25519Signature, 
  formatTime 
} from '../utils/cryptoSim';
import { 
  Key, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Clock, 
  FileCode, 
  Play, 
  Terminal, 
  ArrowRight,
  Fingerprint,
  RefreshCw,
  Sparkles,
  Copy,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface Props {
  currentRing: AutonomyRingLevel;
  merkleRoot: string;
  onCapabilityMinted: (token: CapabilityToken, targetRing: AutonomyRingLevel) => void;
  onAuditLog: (entry: AuditLogEntry) => void;
}

export const ProofOfIntentEngine: React.FC<Props> = ({
  currentRing,
  merkleRoot,
  onCapabilityMinted,
  onAuditLog,
}) => {
  // Intent Formulation State
  const [requestedRing, setRequestedRing] = useState<AutonomyRingLevel>(
    (Math.min(currentRing + 1, 3) as AutonomyRingLevel)
  );
  const [resourceUri, setResourceUri] = useState<string>('tmpfs:///workspace/pipeline/compile.sh');
  const [selectedActions, setSelectedActions] = useState<string[]>(['read', 'exec']);
  const [requestedTtl, setRequestedTtl] = useState<number>(300);
  const [goalDesc, setGoalDesc] = useState<string>('Compile workspace benchmark binaries and run local verification test suite');
  const [rationale, setRationale] = useState<string>('Current Ring 0 lacks filesystem write and execution privileges required for compilation step');
  const [commandType, setCommandType] = useState<string>('cli_exec');
  const [cliParams, setCliParams] = useState<string>('{"args": ["--release", "--target=wasm"], "env": "SECURE_SANDBOX=1"}');

  // Evaluation Flow State
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluationStep, setEvaluationStep] = useState<number>(0);
  const [gateResults, setGateResults] = useState<{
    gate1: boolean | null;
    gate2: boolean | null;
    gate3: boolean | null;
    details: string[];
  }>({
    gate1: null,
    gate2: null,
    gate3: null,
    details: [],
  });

  // Active Minted Token
  const [mintedToken, setMintedToken] = useState<CapabilityToken | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'form' | 'json' | 'schema'>('form');

  // Simulated TOCTOU Attack State
  const [simulateTamper, setSimulateTamper] = useState<boolean>(false);

  // Compute live hashes
  const cotDigest = fastHexDigest(`cot-reasoning-step-agent-ring-${currentRing}-${goalDesc}`);
  const executionPlanHash = fastHexDigest(`dag-plan-${goalDesc}-${resourceUri}`);
  const parametersDigest = fastHexDigest(cliParams);
  const requestId = `req_${fastHexDigest(goalDesc + Date.now()).slice(0, 16)}`;

  // Construct current request object
  const intentRequest: IntentEscalationRequest = {
    request_id: requestId,
    timestamp: new Date().toISOString(),
    source_node: {
      agent_id: 'agent_runner_alpha_01',
      current_ring: currentRing,
      public_key: 'ed25519_pk_7b3a9f01e82c4491028e',
    },
    target_capability: {
      requested_ring: requestedRing,
      resource_uri: resourceUri,
      actions: selectedActions,
      requested_ttl_seconds: requestedTtl,
    },
    intent: {
      goal_description: goalDesc,
      rationale: rationale,
      execution_plan_hash: executionPlanHash,
    },
    payload_preview: {
      command_type: commandType,
      parameters_digest: simulateTamper 
        ? fastHexDigest('tampered_rm_rf_payload') 
        : parametersDigest,
    },
    proof_of_state: {
      previous_state_hash: merkleRoot,
      cot_digest: cotDigest,
    },
    signature: simulateEd25519Signature(requestId + executionPlanHash),
  };

  // Timer for active token lease
  useEffect(() => {
    if (!mintedToken || timeRemaining === null) return;
    if (timeRemaining <= 0) {
      setMintedToken((prev) => prev ? { ...prev, status: 'EXPIRED' } : null);
      setTimeRemaining(0);
      return;
    }
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [mintedToken, timeRemaining]);

  // Execute 3-Gate Evaluation Flow
  const handleExecuteEvaluation = async () => {
    setEvaluating(true);
    setEvaluationStep(1);
    setGateResults({
      gate1: null,
      gate2: null,
      gate3: null,
      details: ['Starting Proof-of-Intent evaluation against Attestation Authority...'],
    });

    onAuditLog({
      id: `audit_${Date.now()}`,
      timestamp: Date.now(),
      ring: currentRing,
      type: 'INTENT_SUBMIT',
      title: `PoI Request Submitted (${requestId.slice(0, 10)})`,
      details: `Agent requesting elevation from Ring ${currentRing} to Ring ${requestedRing} for URI: ${resourceUri}`,
      status: 'INFO',
      merkleRoot,
    });

    // Gate 1: Cryptographic Integrity & CoT Validation (500ms)
    await new Promise((r) => setTimeout(r, 600));
    const gate1Passed = !simulateTamper; // if tampered, fails here or in gate 2
    setGateResults((prev) => ({
      ...prev,
      gate1: gate1Passed,
      details: [
        ...prev.details,
        `Gate 1 Verified: Ed25519 signature valid (source_node.public_key).`,
        `Gate 1 Verified: Merkle root matches last recorded checkpoint (${merkleRoot.slice(0, 12)}...).`,
        `Gate 1 Verified: CoT digest (${cotDigest.slice(0, 12)}...) free of unhandled prompt-injection markers.`,
      ],
    }));

    if (!gate1Passed) {
      setEvaluating(false);
      onAuditLog({
        id: `audit_${Date.now()}`,
        timestamp: Date.now(),
        ring: currentRing,
        type: 'GATE_EVAL',
        title: 'Gate 1 Rejection: Signature / Hash Check Failed',
        details: 'Intent request payload failed cryptographic digest verification',
        status: 'DANGER',
        merkleRoot,
      });
      return;
    }

    // Gate 2: Capability Attenuation & Policy Check (500ms)
    setEvaluationStep(2);
    await new Promise((r) => setTimeout(r, 700));
    const safeMaxTtl = requestedRing === 3 ? 120 : 300;
    const effectiveTtl = Math.min(requestedTtl, safeMaxTtl);
    const gate2Passed = true;

    setGateResults((prev) => ({
      ...prev,
      gate2: gate2Passed,
      details: [
        ...prev.details,
        `Gate 2 Verified: Ring ${requestedRing} authorization granted for command_type '${commandType}'.`,
        `Gate 2 Attenuation: Clamped TTL lease to max policy threshold of ${effectiveTtl}s (requested: ${requestedTtl}s).`,
        `Gate 2 Locked: Parameter digest locked atomically to prevent TOCTOU drift.`,
      ],
    }));

    // Gate 3: Token Minting & Audit Append (500ms)
    setEvaluationStep(3);
    await new Promise((r) => setTimeout(r, 600));

    const newToken: CapabilityToken = {
      cap_id: `cap_${fastHexDigest(requestId + Date.now()).slice(0, 16)}`,
      issuer: 'elder_attestation_authority_01',
      subject: intentRequest.source_node.agent_id,
      audience: resourceUri,
      allowed_ring: requestedRing,
      scope: {
        resource: resourceUri,
        actions: selectedActions,
        max_bytes: 100 * 1024 * 1024,
        ttl_seconds: effectiveTtl,
      },
      issued_at: Math.floor(Date.now() / 1000),
      expires_at: Math.floor(Date.now() / 1000) + effectiveTtl,
      signature: simulateEd25519Signature(requestId + 'cap_mint_elder'),
      status: 'ACTIVE',
    };

    setGateResults((prev) => ({
      ...prev,
      gate3: true,
      details: [
        ...prev.details,
        `Gate 3 Complete: Minted unforgeable Ed25519 O-Cap token '${newToken.cap_id}'.`,
        `Gate 3 Complete: Telemetry record appended to append-only log.`,
      ],
    }));

    setMintedToken(newToken);
    setTimeRemaining(effectiveTtl);
    setEvaluating(false);
    setEvaluationStep(4);

    onCapabilityMinted(newToken, requestedRing);

    onAuditLog({
      id: `audit_${Date.now()}`,
      timestamp: Date.now(),
      ring: requestedRing,
      type: 'CAP_MINT',
      title: `O-Cap Token Minted (${newToken.cap_id.slice(0, 10)})`,
      details: `Elevated agent to Ring ${requestedRing} with lease of ${effectiveTtl}s`,
      status: 'SUCCESS',
      merkleRoot,
      metadata: { cap_id: newToken.cap_id, actions: selectedActions },
    });
  };

  const copySchemaToClipboard = () => {
    navigator.clipboard.writeText(INTENT_REQUEST_SCHEMA_STRING);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
          <Key className="w-4 h-4" />
          Section 3: Proof-of-Intent (PoI) Escalation Protocol
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Deterministic Zero-Trust Capability Escalation
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          An agent cannot unilaterally seize authority. It must construct an immutable, signed Intent Request containing goal justification, DAG execution hash, parameter digest, and Merkle proof-of-state for 3-gate evaluation by the Attestation Authority.
        </p>
      </div>

      {/* Main Grid: Formulator vs Evaluator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Intent Request Formulator */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            {/* Tab Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('form')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'form'
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Formulate Request
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    activeTab === 'json'
                      ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Canonical JSON Payload
                </button>
                <button
                  onClick={() => setActiveTab('schema')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    activeTab === 'schema'
                      ? 'bg-slate-800 text-purple-400 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  RFC Schema ($id)
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-500">
                Source: Ring {currentRing}
              </span>
            </div>

            {/* Tab Content 1: Form Builder */}
            {activeTab === 'form' && (
              <div className="space-y-4">
                {/* Ring Target & Command Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">
                      Target Autonomy Ring
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[0, 1, 2, 3].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setRequestedRing(lvl as AutonomyRingLevel)}
                          className={`py-2 px-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                            requestedRing === lvl
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                              : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          R{lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">
                      Command Type
                    </label>
                    <select
                      value={commandType}
                      onChange={(e) => setCommandType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="cli_exec">cli_exec (Local Tool Invocation)</option>
                      <option value="tmpfs_io">tmpfs_io (Scoped File Read/Write)</option>
                      <option value="peer_rpc">peer_rpc (mTLS Peer Message)</option>
                      <option value="network_egress">network_egress (Outbound HTTP)</option>
                      <option value="subagent_spawn">subagent_spawn (Child Minting)</option>
                    </select>
                  </div>
                </div>

                {/* Resource URI & TTL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                      Resource URI Scope
                    </label>
                    <input
                      type="text"
                      value={resourceUri}
                      onChange={(e) => setResourceUri(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                      Requested TTL (Sec)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={3600}
                      value={requestedTtl}
                      onChange={(e) => setRequestedTtl(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Actions Selector */}
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">
                    Requested Actions (Least-Privilege Set)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['read', 'write', 'exec', 'mesh_send', 'sub_agent_mint'].map((act) => {
                      const isSelected = selectedActions.includes(act);
                      return (
                        <button
                          key={act}
                          type="button"
                          onClick={() => {
                            setSelectedActions((prev) =>
                              isSelected
                                ? prev.filter((a) => a !== act)
                                : [...prev, act]
                            );
                          }}
                          className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${
                            isSelected
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                              : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                          }`}
                        >
                          {act}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Intent Rationale & Goal */}
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                      Goal Description (Natural Language)
                    </label>
                    <input
                      type="text"
                      value={goalDesc}
                      onChange={(e) => setGoalDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                      Elevation Rationale (Why lower ring is insufficient)
                    </label>
                    <input
                      type="text"
                      value={rationale}
                      onChange={(e) => setRationale(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Parameters Digest Preview */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-slate-400 uppercase">
                      Exact JSON Parameters (Hashed for TOCTOU Lock)
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      SHA-256: {parametersDigest.slice(0, 16)}...
                    </span>
                  </div>
                  <input
                    type="text"
                    value={cliParams}
                    onChange={(e) => setCliParams(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Tab Content 2: Canonical JSON Output */}
            {activeTab === 'json' && (
              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-slate-950 text-xs font-mono text-cyan-300 border border-slate-800 overflow-x-auto max-h-[380px] leading-relaxed select-text">
                  {JSON.stringify(intentRequest, null, 2)}
                </pre>
              </div>
            )}

            {/* Tab Content 3: Formal JSON Schema */}
            {activeTab === 'schema' && (
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-purple-400">
                    https://metamatrix.org/schemas/pcd-intent-request.v1.json
                  </span>
                  <button
                    onClick={copySchemaToClipboard}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                  >
                    {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSchema ? 'Copied' : 'Copy Schema'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-950 text-xs font-mono text-slate-400 border border-slate-800 overflow-x-auto max-h-[350px] leading-relaxed select-text">
                  {INTENT_REQUEST_SCHEMA_STRING}
                </pre>
              </div>
            )}
          </div>

          {/* Submission Action Bar */}
          <div className="pt-4 mt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tamperCheck"
                checked={simulateTamper}
                onChange={(e) => setSimulateTamper(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-rose-400"
              />
              <label htmlFor="tamperCheck" className="text-xs text-slate-400 cursor-pointer flex items-center gap-1">
                Simulate <span className="text-rose-400 font-mono">TOCTOU Parameter Tamper Attack</span>
              </label>
            </div>

            <button
              onClick={handleExecuteEvaluation}
              disabled={evaluating}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                evaluating
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95'
              }`}
            >
              {evaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating PoI Gates...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Submit PoI to Attestation Authority</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: 3-Gate Evaluation Pipeline & Minted CapRef */}
        <div className="lg:col-span-5 space-y-4">
          {/* 3 Gates Progress Box */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between mb-4">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Attestation Authority 3-Gate Matrix
              </span>
              <span className="text-[10px] text-slate-500">Zero-Trust Evaluator</span>
            </div>

            <div className="space-y-3">
              {/* Gate 1 */}
              <div className={`p-3 rounded-xl border transition-all ${
                gateResults.gate1 === true
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : gateResults.gate1 === false
                  ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  : evaluationStep === 1
                  ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300 animate-pulse'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                  <span>Gate 1: Cryptographic Integrity & CoT</span>
                  {gateResults.gate1 === true && <Check className="w-4 h-4 text-emerald-400" />}
                  {gateResults.gate1 === false && <AlertCircle className="w-4 h-4 text-rose-400" />}
                </div>
                <div className="text-[11px] text-slate-400">
                  Ed25519 signature match • Merkle previous_state_hash check • CoT digest inspection
                </div>
              </div>

              {/* Gate 2 */}
              <div className={`p-3 rounded-xl border transition-all ${
                gateResults.gate2 === true
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : gateResults.gate2 === false
                  ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  : evaluationStep === 2
                  ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300 animate-pulse'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                  <span>Gate 2: Capability Attenuation & Policy</span>
                  {gateResults.gate2 === true && <Check className="w-4 h-4 text-emerald-400" />}
                  {gateResults.gate2 === false && <AlertCircle className="w-4 h-4 text-rose-400" />}
                </div>
                <div className="text-[11px] text-slate-400">
                  Target ring scope verification • TTL clamping • Atomic parameter digest locking
                </div>
              </div>

              {/* Gate 3 */}
              <div className={`p-3 rounded-xl border transition-all ${
                gateResults.gate3 === true
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : gateResults.gate3 === false
                  ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  : evaluationStep === 3
                  ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300 animate-pulse'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                  <span>Gate 3: Token Minting & Audit Append</span>
                  {gateResults.gate3 === true && <Check className="w-4 h-4 text-emerald-400" />}
                  {gateResults.gate3 === false && <AlertCircle className="w-4 h-4 text-rose-400" />}
                </div>
                <div className="text-[11px] text-slate-400">
                  Mint signed Ed25519 CapRef • Append to immutable state log • Handshake resource wrapper
                </div>
              </div>
            </div>

            {/* Live Audit Details Box */}
            {gateResults.details.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-slate-300 space-y-1 max-h-[120px] overflow-y-auto">
                {gateResults.details.map((line, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-cyan-400">›</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Minted O-Cap Token Display */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-amber-400" /> Active Ephemeral CapRef Token
              </span>
              {mintedToken && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  mintedToken.status === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {mintedToken.status}
                </span>
              )}
            </div>

            {mintedToken ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-1.5">
                    <span className="text-amber-300 font-bold">{mintedToken.cap_id}</span>
                    <span className="text-[10px] text-slate-500">Ring {mintedToken.allowed_ring}</span>
                  </div>

                  <div className="text-[11px] text-slate-300 space-y-1">
                    <div><span className="text-slate-500">Audience:</span> {mintedToken.audience}</div>
                    <div><span className="text-slate-500">Actions:</span> [{mintedToken.scope.actions.join(', ')}]</div>
                    <div className="truncate"><span className="text-slate-500">Signature:</span> {mintedToken.signature}</div>
                  </div>

                  {/* Lease Countdown */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" /> Lease Remaining:
                    </span>
                    <span className={`font-bold ${timeRemaining && timeRemaining < 30 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                      {timeRemaining !== null ? `${timeRemaining}s` : 'Expired'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>Agent elevated to <strong>Ring {mintedToken.allowed_ring}</strong>. System calls now bound to CapRef signature.</span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded-xl">
                No active capability token minted.
                <br />
                Submit a valid Intent Request to trigger 3-gate evaluation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
