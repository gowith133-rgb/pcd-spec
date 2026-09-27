import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Key, 
  AlertTriangle, 
  Users, 
  BookOpen, 
  Code2, 
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { AutonomyRingLevel } from '../types/rfc';

export type ActiveTab = 'rings' | 'poi' | 'faults' | 'wot' | 'threats' | 'rfc' | 'code';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentRing: AutonomyRingLevel;
  merkleRoot: string;
  onResetAll: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  currentRing,
  merkleRoot,
  onResetAll,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'rings', label: 'Concentric Rings', icon: Layers },
    { id: 'poi', label: 'Proof-of-Intent', icon: Key },
    { id: 'faults', label: 'Fault Isolation', icon: AlertTriangle },
    { id: 'wot', label: 'Web of Trust', icon: Users },
    { id: 'threats', label: 'Threat Matrix', icon: ShieldCheck },
    { id: 'rfc', label: 'RFC Specification', icon: BookOpen },
    { id: 'code', label: 'Reference Code', icon: Code2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & RFC Identifier */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950 font-bold">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight text-sm md:text-base">
                  RFC-001: PCD Standard
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  2026-V1
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono hidden md:block">
                Progressive Capability Delegation Architecture
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status & Controls */}
          <div className="flex items-center gap-3">
            {/* Merkle Root Pill */}
            <div className="hidden sm:flex flex-col text-right font-mono">
              <span className="text-[9px] text-slate-500 uppercase">Merkle Root</span>
              <span className="text-[11px] text-slate-300">
                {merkleRoot.slice(0, 8)}...
              </span>
            </div>

            {/* Current Agent Ring Pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <div className="font-mono text-xs font-bold text-white">
                Ring {currentRing}
              </div>
            </div>

            {/* Reset Simulation State Button */}
            <button
              onClick={onResetAll}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
              title="Reset Simulation State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/80 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
