import React, { useState } from 'react';
import { AuditLogEntry } from '../types/rfc';
import { formatTime } from '../utils/cryptoSim';
import { 
  Terminal, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  XCircle,
  Copy,
  Check
} from 'lucide-react';

interface Props {
  logs: AuditLogEntry[];
  onClearLogs: () => void;
}

export const AuditLogTerminal: React.FC<Props> = ({ logs, onClearLogs }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const filteredLogs = logs.filter(log => {
    if (filterType !== 'ALL' && log.status !== filterType) return false;
    if (search.trim() && !log.title.toLowerCase().includes(search.toLowerCase()) && !log.details.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const exportLogsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pcd-audit-telemetry-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyLogs = () => {
    navigator.clipboard.writeText(JSON.stringify(logs, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            Append-Only Audit Telemetry Stream (RFC-001 Section 2.3)
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
            {logs.length} Events
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Filters */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success Only</option>
            <option value="WARN">Warnings / Demotions</option>
            <option value="DANGER">Breaches & Faults</option>
            <option value="INFO">Informational</option>
          </select>

          {/* Copy */}
          <button
            onClick={copyLogs}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            title="Copy logs JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Export JSON */}
          <button
            onClick={exportLogsAsJson}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            title="Export telemetry JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear */}
          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Logs List */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto font-mono text-xs pr-1">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-6 text-slate-600 text-xs italic">
            No audit log entries found matching criteria.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const statusColor = 
              log.status === 'SUCCESS' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20' :
              log.status === 'WARN' ? 'text-amber-400 border-amber-500/30 bg-amber-950/20' :
              log.status === 'DANGER' ? 'text-rose-400 border-rose-500/30 bg-rose-950/20' :
              'text-cyan-400 border-cyan-500/30 bg-cyan-950/20';

            return (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all space-y-1"
              >
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{formatTime(log.timestamp)}</span>
                    <span className={`px-2 py-0.2 rounded border text-[9px] font-bold ${statusColor}`}>
                      {log.type}
                    </span>
                    <span className="font-bold text-white">{log.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-cyan-400 font-bold">Ring {log.ring}</span>
                    <span className="text-[10px] text-slate-600 font-mono hidden md:inline">
                      Root: {log.merkleRoot.slice(0, 8)}...
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 leading-snug pl-1">
                  {log.details}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
