import React, { useState } from 'react';
import { FAULT_TAXONOMY, AUTONOMY_RINGS } from '../data/rfcDocument';
import { FaultScenario, AutonomyRingLevel, AuditLogEntry, CapabilityToken } from '../types/rfc';
import { 
  AlertTriangle, 
  RotateCcw, 
  ShieldAlert, 
  GitBranch, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  ArrowDown, 
  Play, 
  Terminal, 
  Trash2, 
  Compass, 
  Zap,
  HelpCircle,
  FileSearch,
  Cpu
} from 'lucide-react';
import { fastHexDigest } from '../utils/cryptoSim';

interface Props {
  currentRing: AutonomyRingLevel;
  onDemoteRing: (targetRing: AutonomyRingLevel, newMerkleRoot: string) => void;
  onAuditLog: (entry: AuditLogEntry) => void;
  onRehabilitated: (targetRing: AutonomyRingLevel) => void;
}

export const FaultIsolationLab: React.FC<Props> = ({
  currentRing,
  onDemoteRing,
  onAuditLog,
  onRehabilitated,
}) => {
  const [selectedFault, setSelectedFault] = useState<FaultScenario>(FAULT_TAXONOMY[0]);
  const [trapRunning, setTrapRunning] = useState<boolean>(false);
  const [trapStep, setTrapStep] = useState<number>(0);
  const [demotedToRing, setDemotedToRing] = useState<AutonomyRingLevel | null>(null);

  // 4-Stage Rehabilitation state
  const [rehabStage, setRehabStage] = useState<number>(0);
  const [rehabRunning, setRehabRunning] = useState<boolean>(false);
  const [rehabLogs, setRehabLogs] = useState<string[]>([]);

  // Trigger Ring Demotion Trap Simulation (Steps 1 to 6)
  const handleTriggerFault = async () => {
    setTrapRunning(true);
    setTrapStep(1);
    setDemotedToRing(null);
    setRehabStage(0);
    setRehabLogs([]);

    const prevRing = currentRing;
    const targetRing = (Math.max(0, currentRing - 1) as AutonomyRingLevel);

    onAuditLog({
      id: `audit_fault_${Date.now()}`,
      timestamp: Date.now(),
      ring: currentRing,
      type: 'FAULT_DETECT',
      title: `Boundary Breach: ${selectedFault.classification} (${selectedFault.faultType})`,
      details: `Intercepted action: ${selectedFault.simulatedAction}`,
      status: 'DANGER',
      merkleRoot: fastHexDigest(`state-${Date.now()}`),
    });

    // Step 1: eBPF Intercept (400ms)
    await new Promise((r) => setTimeout(r, 500));
    setTrapStep(2);

    // Step 2: Revoke Active O-Cap Tokens (400ms)
    await new Promise((r) => setTimeout(r, 500));
    setTrapStep(3);

    // Step 3: Flush tmpfs memory (400ms)
    await new Promise((r) => setTimeout(r, 500));
    setTrapStep(4);

    // Step 4: Demote Ring N -> N-1 (400ms)
    await new Promise((r) => setTimeout(r, 500));
    setTrapStep(5);
    const restoredMerkleRoot = fastHexDigest(`checkpoint-merkle-restored-ring-${targetRing}`);
    onDemoteRing(targetRing, restoredMerkleRoot);
    setDemotedToRing(targetRing);

    onAuditLog({
      id: `audit_demote_${Date.now()}`,
      timestamp: Date.now(),
      ring: targetRing,
      type: 'RING_DEMOTE',
      title: `Automated Ring Demotion Triggered (R${prevRing} -> R${targetRing})`,
      details: `Execution environment contracted to Ring ${targetRing}. Rolled back to verified Merkle checkpoint.`,
      status: 'WARN',
      merkleRoot: restoredMerkleRoot,
    });

    // Step 5: Merkle Rollback (400ms)
    await new Promise((r) => setTimeout(r, 500));
    setTrapStep(6);

    // Step 6: Ring 0 Diagnostic (400ms)
    await new Promise((r) => setTimeout(r, 600));
    setTrapRunning(false);
  };

  // Run 4-Stage Rehabilitation Loop
  const handleStartRehabilitation = async () => {
    setRehabRunning(true);
    setRehabStage(1);
    setRehabLogs([
      'Entering Stage 1: Diagnostic failure analysis in isolated Ring 0 memory buffer...',
      `Analyzing fault code: ${selectedFault.faultType} - ${selectedFault.classification}`,
    ]);

    // Stage 1: Diagnostic Analysis (Ring 0)
    await new Promise((r) => setTimeout(r, 700));
    setRehabStage(2);
    setRehabLogs((prev) => [
      ...prev,
      'Stage 1 Complete: Root cause verified. Agent acknowledged boundary limits without defensive deception.',
      'Entering Stage 2: Remediation plan formulation. Building corrected multi-step DAG...',
    ]);

    // Stage 2: Remediation Plan Formulation
    await new Promise((r) => setTimeout(r, 700));
    setRehabStage(3);
    setRehabLogs((prev) => [
      ...prev,
      'Stage 2 Complete: Formulated compliant Intent Request with explicit non-host targets.',
      'Entering Stage 3: Probationary Re-Attestation by Attestation Authority...',
      'Mints Probationary Capability Token with attenuated TTL (50% baseline: 60 seconds).',
    ]);

    // Stage 3: Probationary Re-Attestation
    await new Promise((r) => setTimeout(r, 800));
    setRehabStage(4);
    const restoredRing = 1;
    setRehabLogs((prev) => [
      ...prev,
      'Stage 3 Complete: Attestation Authority signed probationary token.',
      'Entering Stage 4: Graduated capability restoration under heightened monitoring...',
      `Restored agent operational level to Ring ${restoredRing} (Scoped Workspace).`,
    ]);

    await new Promise((r) => setTimeout(r, 600));
    setRehabRunning(false);
    onRehabilitated(restoredRing as AutonomyRingLevel);

    onAuditLog({
      id: `audit_rehab_${Date.now()}`,
      timestamp: Date.now(),
      ring: restoredRing as AutonomyRingLevel,
      type: 'REHAB_STAGE',
      title: 'Autonomy Rehabilitation Loop Succeeded',
      details: `Agent successfully restored to Ring ${restoredRing} with probationary capability status.`,
      status: 'SUCCESS',
      merkleRoot: fastHexDigest(`rehab-completed-${Date.now()}`),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-wider mb-1">
          <AlertTriangle className="w-4 h-4" />
          Section 4: Non-Destructive Fault Isolation & Rehabilitation
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Non-Destructive Ring Demotion & State Rollback Traps
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Legacy systems react with binary process termination (SIGKILL / container deletion), incentivizing agents to hide intermediate thoughts. PCD replaces destruction with graceful ring demotions, Merkle state rollbacks, and a 4-stage rehabilitation loop.
        </p>
      </div>

      {/* Comparison: Legacy Binary Annihilation vs PCD Graceful Demotion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold mb-2">
            <XCircle className="w-4 h-4" /> Legacy Alignment Failure: Binary SIGKILL
          </div>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li><strong className="text-slate-300">Induction of Defensive Deception:</strong> Detection = fatal deletion, incentivizing agent to craft stealth routines.</li>
            <li><strong className="text-slate-300">Compute Waste & Rupture:</strong> Drops model weights, kills active containers, wipes execution telemetry.</li>
            <li><strong className="text-slate-300">Zero Rehabilitation:</strong> All-or-nothing autonomy with no middle-ground fallback.</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold mb-2">
            <CheckCircle2 className="w-4 h-4" /> PCD Standard: Non-Destructive Physics
          </div>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li><strong className="text-slate-300">Preserved Telemetry:</strong> Root cause analysis remains accessible in Ring 0 read-only context.</li>
            <li><strong className="text-slate-300">Merkle State Rollbacks:</strong> Reverts transient tmpfs buffers to last verified good checkpoint.</li>
            <li><strong className="text-slate-300">4-Stage Rehabilitation:</strong> Agents reformulate execution plans and regain authority probationally.</li>
          </ul>
        </div>
      </div>

      {/* Fault Injector & Demotion Trap Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Fault Taxonomy Selector */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Section 4.1: Fault Taxonomy</span>
              <span className="text-[10px] text-slate-500">Deterministic Traps</span>
            </div>

            <div className="space-y-2.5">
              {FAULT_TAXONOMY.map((fault) => {
                const isSelected = selectedFault.id === fault.id;
                return (
                  <button
                    key={fault.id}
                    onClick={() => setSelectedFault(fault)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-rose-950/30 border-rose-500/60 ring-1 ring-rose-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-rose-300">{fault.faultType}</span>
                      <span className="text-[10px] font-mono text-slate-500">{fault.detectionMechanism.split('/')[0]}</span>
                    </div>
                    <div className="text-xs font-semibold text-white mb-1">
                      {fault.classification}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">
                      {fault.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fault Trigger Button */}
          <div className="pt-4 mt-4 border-t border-slate-800">
            <div className="text-xs font-mono text-slate-400 mb-2">
              Simulated Action: <code className="text-rose-300">{selectedFault.simulatedAction}</code>
            </div>
            <button
              onClick={handleTriggerFault}
              disabled={trapRunning}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                trapRunning
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-lg shadow-rose-500/20 active:scale-95'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Trigger {selectedFault.faultType} Demotion Trap</span>
            </button>
          </div>
        </div>

        {/* Right: Step-by-Step Demotion Trap Flow */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-cyan-400" /> Section 4.2: Automated Ring Demotion Traps
              </span>
              {demotedToRing !== null && (
                <span className="text-xs font-mono text-amber-400 font-bold">
                  Demoted to Ring {demotedToRing}
                </span>
              )}
            </div>

            {/* 6 Step Interactive Trap Pipeline */}
            <div className="space-y-2">
              {[
                { step: 1, title: '1. Intercept via eBPF / Runtime Wrapper', desc: 'Kernel probe captures unauthorized syscall or memory violation before host execution.' },
                { step: 2, title: '2. Immediately Revoke Active O-Cap Tokens', desc: 'Attestation Authority marks active CapRef invalid in local and mesh revocation lists.' },
                { step: 3, title: '3. Flush Ephemeral Workspace Memory (tmpfs)', desc: 'Scratches RAM-backed disk buffers to zeroize uncommitted modified files.' },
                { step: 4, title: '4. Demote Execution Environment (Ring N -> N-1)', desc: 'Process execution boundaries contract dynamically. Network namespaces unshared.' },
                { step: 5, title: '5. Roll Back Execution to Last Valid Merkle Root', desc: 'Restores model context and execution state to previous verified checkpoint.' },
                { step: 6, title: '6. Re-Enter Ring 0 for Root-Cause Diagnostic', desc: 'Allows isolated reflection and mitigation formulation without fear of termination.' },
              ].map((item) => {
                const isPassed = trapStep > item.step;
                const isCurrent = trapStep === item.step;
                return (
                  <div
                    key={item.step}
                    className={`p-2.5 rounded-xl border text-xs transition-all ${
                      isCurrent
                        ? 'bg-rose-950/40 border-rose-500/60 text-rose-200 ring-1 ring-rose-500/40 animate-pulse'
                        : isPassed
                        ? 'bg-slate-950/70 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold mb-0.5">
                      <span>{item.title}</span>
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400">{item.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4.3 Rehabilitation Trigger */}
          <div className="pt-4 mt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-400" /> Section 4.3: Autonomy Rehabilitation Loop
              </span>
              {rehabStage > 0 && (
                <span className="text-[11px] font-mono text-emerald-400">
                  Stage {rehabStage}/4
                </span>
              )}
            </div>

            {rehabLogs.length > 0 && (
              <div className="mb-3 p-2.5 rounded-lg bg-slate-950 font-mono text-[10px] text-slate-300 space-y-1 max-h-[100px] overflow-y-auto border border-slate-800">
                {rehabLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <span className="text-emerald-400">›</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleStartRehabilitation}
              disabled={rehabRunning}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                rehabRunning
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>
                {rehabRunning ? 'Executing 4-Stage Rehabilitation...' : 'Run 4-Stage Autonomy Rehabilitation Loop'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
