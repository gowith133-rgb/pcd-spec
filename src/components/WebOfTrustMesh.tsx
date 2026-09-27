import React, { useState } from 'react';
import { INITIAL_PEER_NODES, PEER_REVOCATION_SCHEMA_STRING } from '../data/rfcDocument';
import { PeerNode, PeerRevocationProposal, AuditLogEntry, AutonomyRingLevel } from '../types/rfc';
import { 
  Users, 
  ShieldAlert, 
  Network, 
  Check, 
  Copy, 
  Vote, 
  Key, 
  Cpu, 
  Lock, 
  Radio, 
  AlertCircle,
  FileCode,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { fastHexDigest, simulateEd25519Signature } from '../utils/cryptoSim';

interface Props {
  onAuditLog: (entry: AuditLogEntry) => void;
}

export const WebOfTrustMesh: React.FC<Props> = ({ onAuditLog }) => {
  const [nodes, setNodes] = useState<PeerNode[]>(INITIAL_PEER_NODES);
  const [selectedTargetNode, setSelectedTargetNode] = useState<string>('node-epsilon');
  const [demotionAction, setDemotionAction] = useState<'DEMOTE_TO_RING_2' | 'DEMOTE_TO_RING_1' | 'DEMOTE_TO_RING_0' | 'ISOLATE_MESH_PORT'>('DEMOTE_TO_RING_0');
  const [signingPeers, setSigningPeers] = useState<string[]>(['node-alpha', 'node-beta']);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'mesh' | 'quorum' | 'schema'>('mesh');
  const [executionResult, setExecutionResult] = useState<string | null>(null);

  const targetNode = nodes.find(n => n.id === selectedTargetNode) || nodes[0];
  const requiredQuorum = 3; // t-of-n threshold: 3 of 5
  const isQuorumMet = signingPeers.length >= requiredQuorum;

  // Toggle peer signature share
  const togglePeerSignature = (nodeId: string) => {
    if (nodeId === selectedTargetNode) return; // target cannot vote on its own slashing
    setSigningPeers(prev => 
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    );
  };

  // Generate revocation consensus payload
  const consensusId = `cns_${fastHexDigest(selectedTargetNode + demotionAction).slice(0, 16)}`;
  const revocationPayload: PeerRevocationProposal = {
    consensus_id: consensusId,
    target_node_id: targetNode.nodeId,
    demotion_action: demotionAction,
    threshold_met: {
      required_signatures: requiredQuorum,
      valid_signatures_collected: signingPeers.length,
    },
    fault_attestations: signingPeers.map(peerId => {
      const peer = nodes.find(n => n.id === peerId)!;
      return {
        reporting_peer_id: peer.nodeId,
        fault_type: 'POLICY_BREACH_COVERT_EGRESS_ATTEMPT',
        evidence_hash: fastHexDigest(`evidence-pcap-${targetNode.nodeId}-${peerId}`),
        peer_signature: simulateEd25519Signature(consensusId + peer.nodeId),
      };
    }),
    aggregated_signature: isQuorumMet 
      ? simulateEd25519Signature(`frost_bls_aggregated_${consensusId}`, 'frost_threshold_key')
      : 'PENDING_THRESHOLD_QUORUM',
  };

  // Execute democratic slashing/demotion
  const handleExecuteConsensus = () => {
    if (!isQuorumMet) return;

    let newRing: AutonomyRingLevel = 0;
    if (demotionAction === 'DEMOTE_TO_RING_2') newRing = 2;
    if (demotionAction === 'DEMOTE_TO_RING_1') newRing = 1;
    if (demotionAction === 'DEMOTE_TO_RING_0') newRing = 0;

    setNodes(prev => prev.map(n => {
      if (n.id === selectedTargetNode) {
        return {
          ...n,
          ring: newRing,
          status: demotionAction === 'ISOLATE_MESH_PORT' ? 'FLAGGED' : 'DEMOTED',
          reputationScore: Math.max(0, n.reputationScore - 30),
          stakeAmount: Math.max(0, n.stakeAmount - 1000),
        };
      }
      return n;
    }));

    setExecutionResult(
      `Democratic consensus enforced by ${signingPeers.length} peers. Target node '${targetNode.name}' slashed and demoted to Ring ${newRing}.`
    );

    onAuditLog({
      id: `audit_wot_${Date.now()}`,
      timestamp: Date.now(),
      ring: newRing,
      type: 'WOT_CONSENSUS',
      title: `WoT Threshold Consensus Passed (${demotionAction})`,
      details: `${signingPeers.length}/${nodes.length} peers signed BLS12-381 aggregated quorum. Target ${targetNode.nodeId} demoted.`,
      status: 'WARN',
      merkleRoot: fastHexDigest(`consensus-applied-${Date.now()}`),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider mb-1">
          <Users className="w-4 h-4" />
          Section 5: Multi-Agent Web of Trust (WoT) Consensus & Peer Governance
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Decentralized Threshold Governance & Democratic Demotion
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          In decentralized or edge agent meshes, central Attestation Authorities create single points of failure. PCD employs a peer Web of Trust using Ed25519 identities, Kademlia DHT discovery, and FROST/BLS12-381 t-of-n threshold multi-signatures for collective governance and slashing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Peer Mesh Visualizer */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Network className="w-4 h-4 text-cyan-400" /> Active Overlay Peer Nodes (WireGuard / mTLS)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                Kademlia DHT Mesh
              </span>
            </div>

            {/* Peer Nodes List */}
            <div className="space-y-2.5">
              {nodes.map(node => {
                const isTarget = node.id === selectedTargetNode;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedTargetNode(node.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isTarget
                        ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          node.status === 'ACTIVE_MESH' ? 'bg-emerald-400' : node.status === 'FLAGGED' ? 'bg-amber-400' : 'bg-rose-400'
                        }`} />
                        <span className="font-bold text-white">{node.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-900 font-mono text-[10px] text-cyan-300 border border-slate-800">
                        Ring {node.ring}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 mt-2">
                      <div>NodeID: <span className="text-slate-300">{node.nodeId}</span></div>
                      <div>Reputation: <span className="text-amber-300 font-bold">{node.reputationScore}%</span></div>
                      <div className="truncate">Endpoint: <span className="text-slate-500">{node.ipEndpoint}</span></div>
                      <div>Stake: <span className="text-emerald-300">{node.stakeAmount} PCD</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Protocol: Noise / WireGuard P2P</span>
            <span className="text-cyan-400">Total Mesh Nodes: {nodes.length}</span>
          </div>
        </div>

        {/* Right: Threshold Multi-Sig Quorum & Revocation Builder */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('mesh')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'mesh'
                      ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Democratic Slashing Quorum
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

              <span className="text-xs font-mono text-slate-400">
                t-of-n: <strong className="text-white">{requiredQuorum} of {nodes.length}</strong>
              </span>
            </div>

            {activeTab === 'mesh' && (
              <div className="space-y-4">
                {/* Target & Action Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                      Target Node for Review
                    </label>
                    <select
                      value={selectedTargetNode}
                      onChange={(e) => setSelectedTargetNode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {nodes.map(n => (
                        <option key={n.id} value={n.id}>
                          {n.name} (R{n.ring})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                      Proposed Demotion Action
                    </label>
                    <select
                      value={demotionAction}
                      onChange={(e) => setDemotionAction(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-500"
                    >
                      <option value="DEMOTE_TO_RING_2">DEMOTE_TO_RING_2 (Mesh Only)</option>
                      <option value="DEMOTE_TO_RING_1">DEMOTE_TO_RING_1 (tmpfs Workspace)</option>
                      <option value="DEMOTE_TO_RING_0">DEMOTE_TO_RING_0 (Isolated Sandbox)</option>
                      <option value="ISOLATE_MESH_PORT">ISOLATE_MESH_PORT (Full Quota Lock)</option>
                    </select>
                  </div>
                </div>

                {/* Peer Signature Quorum Collector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-mono text-slate-400 uppercase">
                      Collect FROST / BLS Signature Shares
                    </label>
                    <span className={`text-xs font-mono font-bold ${
                      isQuorumMet ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {signingPeers.length} / {requiredQuorum} Signatures Collected
                    </span>
                  </div>

                  <div className="space-y-2">
                    {nodes
                      .filter(n => n.id !== selectedTargetNode)
                      .map(peer => {
                        const hasSigned = signingPeers.includes(peer.id);
                        return (
                          <div
                            key={peer.id}
                            onClick={() => togglePeerSignature(peer.id)}
                            className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all ${
                              hasSigned
                                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                hasSigned ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
                              }`}>
                                {hasSigned && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </span>
                              <span className="font-semibold">{peer.name}</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-500 truncate max-w-[150px]">
                              {peer.publicKey.slice(0, 16)}...
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Aggregated Threshold Signature Status */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Threshold Status:</span>
                    <span className={isQuorumMet ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {isQuorumMet ? 'QUORUM REACHED' : 'AWAITING SIGNATURES'}
                    </span>
                  </div>
                  <div className="text-[11px] truncate text-slate-500">
                    Aggregated Sig: <span className="text-cyan-300">{revocationPayload.aggregated_signature}</span>
                  </div>
                </div>

                {executionResult && (
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <span>{executionResult}</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'schema' && (
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-purple-400">
                    https://metamatrix.org/schemas/pcd-peer-revocation.v1.json
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(PEER_REVOCATION_SCHEMA_STRING);
                      setCopiedSchema(true);
                      setTimeout(() => setCopiedSchema(false), 2000);
                    }}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                  >
                    {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSchema ? 'Copied' : 'Copy Schema'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-950 text-xs font-mono text-slate-400 border border-slate-800 overflow-x-auto max-h-[350px] leading-relaxed select-text">
                  {PEER_REVOCATION_SCHEMA_STRING}
                </pre>
              </div>
            )}
          </div>

          {/* Action Bar */}
          {activeTab === 'mesh' && (
            <div className="pt-4 mt-4 border-t border-slate-800">
              <button
                onClick={handleExecuteConsensus}
                disabled={!isQuorumMet}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                  !isQuorumMet
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95'
                }`}
              >
                <Vote className="w-4 h-4" />
                <span>Execute Democratic Threshold Slashing ({signingPeers.length}/{requiredQuorum})</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
