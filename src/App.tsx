/**
 * RFC-001: Progressive Capability Delegation (PCD) Architecture Workbench
 * Standard: RFC-001-PCD-2026-V1
 * Author: Mark Krzan (Metamatrix Working Group)
 */
import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { ConcentricRingsVisualizer } from './components/ConcentricRingsVisualizer';
import { ProofOfIntentEngine } from './components/ProofOfIntentEngine';
import { FaultIsolationLab } from './components/FaultIsolationLab';
import { WebOfTrustMesh } from './components/WebOfTrustMesh';
import { ThreatMatrixLab } from './components/ThreatMatrixLab';
import { RfcReader } from './components/RfcReader';
import { CodeGenerators } from './components/CodeGenerators';
import { AuditLogTerminal } from './components/AuditLogTerminal';
import { AutonomyRingLevel, AuditLogEntry, CapabilityToken } from './types/rfc';
import { fastHexDigest } from './utils/cryptoSim';
import { 
  ShieldCheck, 
  Layers, 
  Key, 
  AlertTriangle, 
  Users, 
  FileText, 
  ArrowRight,
  Activity,
  Terminal,
  Cpu
} from 'lucide-react';

const INITIAL_MERKLE_ROOT = fastHexDigest('initial_merkle_state_ring_0_checkpoint');

const INITIAL_LOGS: AuditLogEntry[] = [
  {
    id: 'log-boot-1',
    timestamp: Date.now() - 12000,
    ring: 0,
    type: 'STATE_ROLLBACK',
    title: 'PCD System Initialization Complete',
    details: 'Hardware isolation boundaries initialized. Default Ring 0 Immutable Core mounted (hard air-gap).',
    status: 'INFO',
    merkleRoot: INITIAL_MERKLE_ROOT,
  },
  {
    id: 'log-boot-2',
    timestamp: Date.now() - 8000,
    ring: 0,
    type: 'GATE_EVAL',
    title: 'Seccomp-bpf System Profile Attached',
    details: 'Blocked 11 dangerous syscalls (execve, mount, ptrace, socket, bind). Ambient host identity zeroed.',
    status: 'SUCCESS',
    merkleRoot: INITIAL_MERKLE_ROOT,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('rings');
  const [currentRing, setCurrentRing] = useState<AutonomyRingLevel>(0);
  const [merkleRoot, setMerkleRoot] = useState<string>(INITIAL_MERKLE_ROOT);
  const [activeToken, setActiveToken] = useState<CapabilityToken | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_LOGS);

  // Handlers for state updates
  const handleCapabilityMinted = (token: CapabilityToken, targetRing: AutonomyRingLevel) => {
    setActiveToken(token);
    setCurrentRing(targetRing);
    const newRoot = fastHexDigest(`${merkleRoot}-mint-${token.cap_id}`);
    setMerkleRoot(newRoot);
  };

  const handleDemoteRing = (targetRing: AutonomyRingLevel, newMerkleRoot: string) => {
    setCurrentRing(targetRing);
    setActiveToken(null);
    setMerkleRoot(newMerkleRoot);
  };

  const handleRehabilitated = (targetRing: AutonomyRingLevel) => {
    setCurrentRing(targetRing);
    const newRoot = fastHexDigest(`${merkleRoot}-rehab-graduated`);
    setMerkleRoot(newRoot);
  };

  const handleAddAuditLog = (entry: AuditLogEntry) => {
    setAuditLogs((prev) => [entry, ...prev]);
  };

  const handleResetAll = () => {
    setCurrentRing(0);
    setActiveToken(null);
    setMerkleRoot(INITIAL_MERKLE_ROOT);
    setAuditLogs([
      {
        id: `reset_${Date.now()}`,
        timestamp: Date.now(),
        ring: 0,
        type: 'STATE_ROLLBACK',
        title: 'System Hard Reset to Ring 0 Sandbox',
        details: 'Revoked all active tokens, flushed tmpfs memory, rolled back to genesis Merkle checkpoint.',
        status: 'INFO',
        merkleRoot: INITIAL_MERKLE_ROOT,
      },
      ...INITIAL_LOGS,
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRing={currentRing}
        merkleRoot={merkleRoot}
        onResetAll={handleResetAll}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Nav Cards when on Rings View */}
        {activeTab === 'rings' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setActiveTab('poi')}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all text-left group"
            >
              <div className="flex items-center justify-between text-emerald-400 mb-1">
                <Key className="w-4 h-4" />
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="font-bold text-xs text-white">PoI Escalation</div>
              <div className="text-[11px] text-slate-400">3-Gate zero-trust evaluation</div>
            </button>

            <button
              onClick={() => setActiveTab('faults')}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-900 transition-all text-left group"
            >
              <div className="flex items-center justify-between text-rose-400 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="font-bold text-xs text-white">Ring Demotion Traps</div>
              <div className="text-[11px] text-slate-400">Non-destructive fault isolation</div>
            </button>

            <button
              onClick={() => setActiveTab('wot')}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all text-left group"
            >
              <div className="flex items-center justify-between text-amber-400 mb-1">
                <Users className="w-4 h-4" />
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="font-bold text-xs text-white">Web of Trust Mesh</div>
              <div className="text-[11px] text-slate-400">t-of-n threshold consensus</div>
            </button>

            <button
              onClick={() => setActiveTab('threats')}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-left group"
            >
              <div className="flex items-center justify-between text-cyan-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="font-bold text-xs text-white">Threat Matrix Lab</div>
              <div className="text-[11px] text-slate-400">Adversarial red-team proofs</div>
            </button>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'rings' && (
          <ConcentricRingsVisualizer
            currentAgentRing={currentRing}
            merkleRoot={merkleRoot}
            onSelectRing={(ring) => {
              // Allows inspecting any ring
            }}
          />
        )}

        {activeTab === 'poi' && (
          <ProofOfIntentEngine
            currentRing={currentRing}
            merkleRoot={merkleRoot}
            onCapabilityMinted={handleCapabilityMinted}
            onAuditLog={handleAddAuditLog}
          />
        )}

        {activeTab === 'faults' && (
          <FaultIsolationLab
            currentRing={currentRing}
            onDemoteRing={handleDemoteRing}
            onAuditLog={handleAddAuditLog}
            onRehabilitated={handleRehabilitated}
          />
        )}

        {activeTab === 'wot' && (
          <WebOfTrustMesh onAuditLog={handleAddAuditLog} />
        )}

        {activeTab === 'threats' && (
          <ThreatMatrixLab onAuditLog={handleAddAuditLog} />
        )}

        {activeTab === 'rfc' && (
          <RfcReader />
        )}

        {activeTab === 'code' && (
          <CodeGenerators />
        )}

        {/* Append-Only Audit Telemetry Stream (Shown on operational views) */}
        {activeTab !== 'rfc' && (
          <AuditLogTerminal
            logs={auditLogs}
            onClearLogs={() => setAuditLogs([])}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold">RFC-001-PCD-2026-V1</span>
            <span>•</span>
            <span>Metamatrix Working Group</span>
            <span>•</span>
            <span>Author: Mark Krzan</span>
          </div>

          <div className="font-mono text-[11px] text-slate-500">
            Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0)
          </div>
        </div>
      </footer>
    </div>
  );
}
