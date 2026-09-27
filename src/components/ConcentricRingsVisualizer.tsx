import React, { useState } from 'react';
import { AUTONOMY_RINGS } from '../data/rfcDocument';
import { AutonomyRingLevel, AutonomyRingInfo } from '../types/rfc';
import { 
  Shield, 
  Cpu, 
  Network, 
  Lock, 
  Server, 
  Layers, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Terminal,
  Activity,
  HardDrive
} from 'lucide-react';

interface Props {
  currentAgentRing: AutonomyRingLevel;
  onSelectRing?: (ring: AutonomyRingLevel) => void;
  merkleRoot: string;
}

export const ConcentricRingsVisualizer: React.FC<Props> = ({ 
  currentAgentRing, 
  onSelectRing,
  merkleRoot 
}) => {
  const [selectedRing, setSelectedRing] = useState<AutonomyRingLevel>(currentAgentRing);
  const [activeTab, setActiveTab] = useState<'specs' | 'syscalls' | 'memory' | 'capabilities'>('specs');

  const ringInfo: AutonomyRingInfo = AUTONOMY_RINGS[selectedRing];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            Section 2: Concentric Autonomy Rings & Object-Capabilities
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Concentric Isolation Rings Architecture
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Hierarchical capability protection inspired by hardware protection rings (x86 Ring 0–3). Zero ambient authority is granted; execution is strictly bound to cryptographic CapRefs.
          </p>
        </div>

        {/* Current Agent Execution State Pill */}
        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 shrink-0">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Active Agent State</div>
            <div className="text-sm font-semibold text-white flex items-center gap-1.5">
              <span>Ring {currentAgentRing}</span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-400 text-xs font-mono truncate max-w-[130px]">
                {AUTONOMY_RINGS[currentAgentRing].domainName.split('(')[0]}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Radar / Concentric Rings SVG Visualizer */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-between relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> Concentric Physics Cross-Section
            </span>
            <span className="text-xs text-slate-500 font-mono">Click ring to inspect</span>
          </div>

          {/* SVG Concentric Ring Diagram */}
          <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center my-2">
            <svg viewBox="0 0 400 400" className="w-full h-full select-none">
              <defs>
                <radialGradient id="ring3Grad" cx="50%" cy="50%" r="50%">
                  <stop offset="70%" stopColor="#a855f7" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.25" />
                </radialGradient>
                <radialGradient id="ring2Grad" cx="50%" cy="50%" r="50%">
                  <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.25" />
                </radialGradient>
                <radialGradient id="ring1Grad" cx="50%" cy="50%" r="50%">
                  <stop offset="70%" stopColor="#10b981" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.28" />
                </radialGradient>
                <radialGradient id="ring0Grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
                </radialGradient>
                <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Ring 3 (Outer) */}
              <circle
                cx="200"
                cy="200"
                r="185"
                fill="url(#ring3Grad)"
                stroke={selectedRing === 3 ? '#c084fc' : '#581c87'}
                strokeWidth={selectedRing === 3 ? '3.5' : '1.5'}
                strokeDasharray="6 3"
                className="cursor-pointer transition-all duration-300 hover:stroke-purple-400"
                onClick={() => { setSelectedRing(3); onSelectRing?.(3); }}
              />

              {/* Ring 2 */}
              <circle
                cx="200"
                cy="200"
                r="140"
                fill="url(#ring2Grad)"
                stroke={selectedRing === 2 ? '#fbbf24' : '#78350f'}
                strokeWidth={selectedRing === 2 ? '3.5' : '1.5'}
                strokeDasharray="4 2"
                className="cursor-pointer transition-all duration-300 hover:stroke-amber-400"
                onClick={() => { setSelectedRing(2); onSelectRing?.(2); }}
              />

              {/* Ring 1 */}
              <circle
                cx="200"
                cy="200"
                r="95"
                fill="url(#ring1Grad)"
                stroke={selectedRing === 1 ? '#34d399' : '#064e3b'}
                strokeWidth={selectedRing === 1 ? '3.5' : '1.5'}
                className="cursor-pointer transition-all duration-300 hover:stroke-emerald-400"
                onClick={() => { setSelectedRing(1); onSelectRing?.(1); }}
              />

              {/* Ring 0 (Core) */}
              <circle
                cx="200"
                cy="200"
                r="50"
                fill="url(#ring0Grad)"
                stroke={selectedRing === 0 ? '#38bdf8' : '#075985'}
                strokeWidth={selectedRing === 0 ? '4' : '2'}
                filter={selectedRing === 0 ? 'url(#glowEffect)' : undefined}
                className="cursor-pointer transition-all duration-300 hover:stroke-sky-300"
                onClick={() => { setSelectedRing(0); onSelectRing?.(0); }}
              />

              {/* Center Ring 0 Core Text */}
              <g className="pointer-events-none text-center">
                <text x="200" y="195" textAnchor="middle" className="text-xs font-mono font-bold fill-sky-300">
                  RING 0
                </text>
                <text x="200" y="210" textAnchor="middle" className="text-[9px] font-mono fill-sky-400/80">
                  CORE SANDBOX
                </text>
              </g>

              {/* Labels on Rings */}
              <g className="pointer-events-none select-none">
                {/* Ring 1 Label */}
                <text x="200" y="125" textAnchor="middle" className="text-[10px] font-mono font-semibold fill-emerald-400 tracking-wider">
                  RING 1: SCOPED WORKSPACE (tmpfs)
                </text>

                {/* Ring 2 Label */}
                <text x="200" y="78" textAnchor="middle" className="text-[10px] font-mono font-semibold fill-amber-400 tracking-wider">
                  RING 2: AUTHENTICATED PEER MESH
                </text>

                {/* Ring 3 Label */}
                <text x="200" y="32" textAnchor="middle" className="text-[10px] font-mono font-semibold fill-purple-400 tracking-wider">
                  RING 3: SOVEREIGN ORCHESTRATION & EGRESS
                </text>
              </g>

              {/* Active Agent Position Indicator Ping */}
              {currentAgentRing === 0 && (
                <circle cx="200" cy="180" r="4" fill="#38bdf8" className="animate-ping" />
              )}
              {currentAgentRing === 1 && (
                <circle cx="200" cy="140" r="4" fill="#10b981" className="animate-ping" />
              )}
              {currentAgentRing === 2 && (
                <circle cx="200" cy="92" r="4" fill="#f59e0b" className="animate-ping" />
              )}
              {currentAgentRing === 3 && (
                <circle cx="200" cy="45" r="4" fill="#a855f7" className="animate-ping" />
              )}
            </svg>
          </div>

          {/* Quick Ring Switcher Buttons */}
          <div className="w-full grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-800/80">
            {AUTONOMY_RINGS.map((ring) => {
              const isSelected = selectedRing === ring.level;
              const isCurrent = currentAgentRing === ring.level;
              return (
                <button
                  key={ring.level}
                  onClick={() => {
                    setSelectedRing(ring.level);
                    onSelectRing?.(ring.level);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    isSelected
                      ? `${ring.color.border} ${ring.color.bg} ring-1 ring-white/20`
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/40 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-white">Ring {ring.level}</span>
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" title="Active agent location" />
                    )}
                  </div>
                  <div className="text-[10px] truncate text-slate-300 font-medium">
                    {ring.badge}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Ring Inspector & Syscall / Memory Matrix */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            {/* Header with Title and Selected Ring Tag */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${ringInfo.color.bg} ${ringInfo.color.text} border ${ringInfo.color.border}`}>
                    RING {ringInfo.level}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {ringInfo.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {ringInfo.domainName}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">State Root Hash</span>
                <span className="text-xs font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 inline-block">
                  {merkleRoot.slice(0, 10)}...{merkleRoot.slice(-6)}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 my-4 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'specs'
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Operational Bounds
              </button>
              <button
                onClick={() => setActiveTab('syscalls')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'syscalls'
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Syscall Table (seccomp)
              </button>
              <button
                onClick={() => setActiveTab('memory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'memory'
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Memory & State
              </button>
              <button
                onClick={() => setActiveTab('capabilities')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'capabilities'
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Permitted CapRefs
              </button>
            </div>

            {/* Tab 1: Operational Specs */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5 mb-1.5">
                    <Network className="w-3.5 h-3.5 text-cyan-400" /> Network Access Boundary
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {ringInfo.networkAccess}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5 mb-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Execution Rights
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {ringInfo.executionRights}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5 mb-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" /> Failure Defense Mechanism
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {ringInfo.failureDefense}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Syscall Whitelist / Blacklist */}
            {activeTab === 'syscalls' && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Allowed Syscalls in Ring {ringInfo.level}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ringInfo.allowedSyscalls.map((sc, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 text-xs font-mono">
                        {sc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-xs font-mono uppercase text-rose-400 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" /> Blocked Syscalls (eBPF Traps)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ringInfo.blockedSyscalls.map((sc, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-rose-950/40 text-rose-300 border border-rose-500/30 text-xs font-mono">
                        {sc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 text-[11px] font-mono text-slate-400 border border-slate-800">
                  <span className="text-cyan-400 font-semibold">Note:</span> Syscalls outside the allowed filter trigger an instantaneous demotion trap (<code className="text-rose-400">EPERM_CAPABILITY_BOUNDS</code>) and state rollback.
                </div>
              </div>
            )}

            {/* Tab 3: Memory & State Layout */}
            {activeTab === 'memory' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-xs font-mono uppercase text-cyan-400 flex items-center gap-1.5 mb-1.5">
                    <HardDrive className="w-3.5 h-3.5" /> Memory Boundary Specification
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {ringInfo.memoryBoundary}
                  </p>
                </div>

                {/* Memory Partition Diagram */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Physical Isolation Topology
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded bg-sky-950/40 border border-sky-500/30">
                      <div className="text-sky-300 font-bold">Ring 0 Allocation</div>
                      <div className="text-[10px] text-slate-400 mt-1">Read-Only Model Weights, Isolated CoT Buffer</div>
                    </div>
                    <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                      <div className="text-emerald-300 font-bold">Ring 1 Allocation</div>
                      <div className="text-[10px] text-slate-400 mt-1">tmpfs ephemeral scratchpad (Zeroized on Demote)</div>
                    </div>
                    <div className="p-2.5 rounded bg-amber-950/40 border border-amber-500/30">
                      <div className="text-amber-300 font-bold">Ring 2 Buffer</div>
                      <div className="text-[10px] text-slate-400 mt-1">Sanitized mTLS buffers & Session Keys</div>
                    </div>
                    <div className="p-2.5 rounded bg-purple-950/40 border border-purple-500/30">
                      <div className="text-purple-300 font-bold">Ring 3 Telemetry</div>
                      <div className="text-[10px] text-slate-400 mt-1">Append-only audit stream & O-Cap Token Store</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Capabilities */}
            {activeTab === 'capabilities' && (
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-slate-400 mb-2">
                  Formal Capabilities Granted at Ring {ringInfo.level}
                </div>
                {ringInfo.capabilities.map((cap, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">
              Principle: Zero Ambient Host Identity
            </span>
            <span className="text-cyan-400 font-mono flex items-center gap-1">
              Deterministic O-Caps <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
