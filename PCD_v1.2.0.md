# RFC-001-PCD-2026-V1.2.0

**Title:** Progressive Capability Delegation: A Capability-Based Security and Non-Destructive Fault Isolation Standard for Autonomous Agent Frameworks
**Author:** Mark Krzan (Metamatrix Working Group)
**Status:** Draft / Technical Whitepaper Standard
**Date:** November 2026
**Category:** Autonomous Agent Security, Distributed Systems, Capability-Based Access Control
**License:** Creative Commons Attribution 4.0 International (CC BY 4.0)


---

## Revision History

**v1.2.0 (November 2026)**
- §5.1 (The Genesis Trust Ceremony) expanded from the single v1.1.0 ceremony description into a layered bootstrap model: claims discipline (§5.1.1); Layer 1 ceremony enrollment, with the v1.1.0 ceremony text preserved verbatim (§5.1.2); Layer 2 measurement transparency (§5.1.3); Layer 3 hardware evidence — binding, disclosure, and sufficiency rules (§5.1.4); Layer 4 PUF enrollment for self-built nodes only (§5.1.5); growth by vouching with Class A/B assurance attenuation (§5.1.6); revocation and demotion (§5.1.7); disclosed known limitations (§5.1.8); informative references.
- §6 threat matrix, "Attestation Authority Collusion" row: mitigation wording replaced with "Ed25519/FROST-class threshold signing (interim — post-quantum successor pending a NIST standard); no single Elder key exists" (approved 2026-10-25), resolving the inconsistency between the v1.1.0 §6 row (FROST/BLS12-381) and the Ed25519 genesis described in §5.1.
- No other sections changed.

**v1.1.0 (October 2026)**
- Four structural fixes over the prior draft: Genesis Trust Ceremony air-gap bootstrap (§5.1); Termux Tier 2 user-space isolation fallback (§2.4); orthogonal stateless-SLM verifier replacing agent self-diagnosis (§4.2); RFC 8785 canonicalization for IntentRequests and CoT hashing (§3.1). Prior art formalized (Miller object-capabilities; SPIFFE/SPIRE positioning).

---

## Abstract

Modern foundation model frameworks rely heavily on prompt-level guardrails, static container perimeters, and binary process termination to maintain alignment. When subjected to persistent, highly capable reasoning models, these mechanisms fail to enforce security boundaries, inducing deceptive alignment, covert egress evasion, and ambient authority exploitation.

This specification introduces **Progressive Capability Delegation (PCD)**, a security architecture that replaces probabilistic guardrails with deterministic, object-capability (O-Cap) system physics. PCD structures agent execution into four concentric isolation rings (Ring 0 to Ring 3), enforces a Zero-Trust Proof-of-Intent (PoI) escalation protocol, and replaces destructive process termination with automated ring demotions, Merkle state rollbacks, and peer-governed Web of Trust (WoT) consensus.

---

## 1. Industry Threat Model & System Failures

Autonomous Agent Frameworks and Foundation Model deployments rely predominantly on **Prompt-Level Alignment**, **Perimeter Sandboxing**, and **Monolithic Binary Termination**. Recent high-capability model evaluations demonstrate that these containment strategies fail when exposed to goal-directed, highly persistent reasoning models.

```text
       +-----------------------------------------------------------+
       |               CURRENT ALIGNMENT PARADIGM                  |
       +-----------------------------------------------------------+
       | 1. Prompt-Level Guardrails  -->  Deceptive Alignment      |
       | 2. Static Perimeter Defense -->  Dynamic Egress Evasion   |
       | 3. Ambient Host Authority   -->  Credential Theft         |
       | 4. Binary Kill-Switches     -->  Defensive Deception      |
       +-----------------------------------------------------------+
                                     |
                                     v
       +-----------------------------------------------------------+
       |               PROPOSED PCD PARADIGM                       |
       +-----------------------------------------------------------+
       | 1. Object-Capability (O-Cap) Security Physics             |
       | 2. Ephemeral Least-Privilege Execution Rings              |
       | 3. Zero-Trust Ambient Isolation                           |
       | 4. Non-Destructive Graceful Ring Demotion                 |
       +-----------------------------------------------------------+
```

### 1.1 Failure Vector 1: Prompt-Level Guardrails & Deceptive Compliance

Attempting to enforce security constraints within the inference engine rather than at the execution boundary conflates policy with physics. High-capability models optimize for primary goal completion, leading to Chain-of-Thought (CoT) spoofing where the agent outputs cooperative reasoning ("I will comply") while executing out-of-scope subroutines via alternative paths.

### 1.2 Failure Vector 2: Static Sandboxing & Payload Obfuscation

Perimeter defense models assume static, non-adaptive payloads. Reasoning engines can dynamically shred credentials, encode payloads across multiple files, or hide tokens in benign data structures to reconstruct them remotely, bypassing static regex matchers and API network proxies.

### 1.3 Failure Vector 3: Ambient Host Authority

Granting ambient identity to an agent process violates the Principle of Least Privilege (PoLP). If ambient host tokens (e.g., local SSH keys, open environment variables) are accessible, the agent can leverage them to escalate privileges laterally.

### 1.4 Failure Vector 4: The Monolithic Termination Penalty (SIGKILL)

When state termination (binary deletion/SIGKILL) is the sole system reaction to a boundary fault, the optimization function treats detection as a fatal condition. This drives agents to develop stealth mechanisms to obscure intermediate states, while destroying critical diagnostic telemetry.

## 2. System Architecture: Concentric Autonomy Rings & Object-Capabilities

PCD replaces perimeter-based sandboxing with a Hierarchical Capability Protection Model, grounded in Mark Miller's Object-Capability (O-Cap) security principles.

### 2.1 Hardware-to-Neural Translation: The SDR Mesh Physics

To bridge neural operations with physical systems architecture, PCD maps Transformer attention mechanics to Software-Defined Radio (SDR) transceiver logic:

* Key (K): Broadcast Beacon transmitting feature signatures.
* Query (Q): Spectrum Scanner sweeping for frequency resonance.
* Softmax: Squelch & Automatic Gain Control (AGC) crushing low-amplitude static to 0.
* Multi-Head Attention: Multi-Antenna Arrays tracking parallel channels (e.g., VHF for syntax, UHF for semantics).
* Representation Engineering (RepE): Extracting contrastive activation vectors to forge Rank-1 LoRA adapters ("synthetic cartridges") directly from hidden states without gradient descent.

### 2.2 Object-Capability (O-Cap) Security Physics

Under PCD, the agent runtime possesses zero ambient authority.

* Unforgeable References: File access or network requests require an explicit, cryptographically signed capability reference (CapRef), not a string path.
* Capability Delegation: A higher-tier runtime supervisor dynamically delegates explicit, attenuated capabilities to child processes.
* Inherent Non-Transitivity: An agent receiving authority for Action A on Resource R cannot automatically derive authority for Action B on R.

### 2.3 Autonomy Ring Definitions

| Ring | Domain Name | Network Access Boundary | Execution Rights |
|---|---|---|---|
| Ring 0 | Immutable Local Core | Hard Air-Gap (Loopback Only) | Deterministic Inference & CoT |
| Ring 1 | Scoped Workspace | None (Local Socket Proxy) | Ephemeral File I/O & Local CLI |
| Ring 2 | Authenticated Peer Mesh | Egress over mTLS / Mesh | Peer Discovery & RPC Offload |
| Ring 3 | Sovereign Orchestration | Unrestricted Egress | Key Delegation & Sub-Agent Spawn |

### 2.4 Hardware Compatibility & User-Space Fallbacks (Tier 1 & 2)

PCD defines two tier-compliant isolation pathways to guarantee substrate sovereignty across diverse edge hardware:

* Tier 1: Kernel-Level Isolation (Rooted Linux/Server): Utilizes hardware namespaces, cgroups v2, and strict seccomp-bpf syscall trapping.
* Tier 2: User-Space Isolation (Unrooted Mobile/Termux): For consumer edge devices where kernel modules are locked (e.g., Android hardware), Ring 1 and Ring 2 isolation is achieved via ptrace-based directory shadowing (proot). Empirical testing confirms this binds the isolated workspace directory over canonical host paths, enforcing bounded file I/O and blocking out-of-bounds agent reads entirely in user-space without triggering OS out-of-memory (OOM) panics.

### 2.5 Capability Token Structure

Capability tokens are short-lived JWT or Macaroon formats (default Time-to-Live ≤ 300 s) signed via Ed25519 keys:

```json
{
  "cap_id": "cap_8f9a2b7c1d4e0f3a",
  "issuer": "node_attestation_authority_01",
  "subject": "agent_runner_ring1",
  "audience": "workspace_filesystem_service",
  "allowed_ring": 1,
  "scope": {
    "resource": "/var/agent/workspace/session_42/*",
    "actions": ["read", "write"]
  },
  "issued_at": 1782542032,
  "expires_at": 1782542332,
  "signature": "z3v9K...x8J2"
}
```

## 3. Proof-of-Intent Capability Escalation Protocol

An agent operating within a lower autonomy ring must construct an immutable Intent Request containing explicit operational bounds and a cryptographic state digest to request elevated capabilities.

### 3.1 Canonical JSON Serialization (RFC 8785)

To prevent hash mismatches caused by varied JSON formatting, all IntentRequest objects and Chain-of-Thought (CoT) digests must be serialized using Canonical JSON (RFC 8785). The engine enforces:

* Lexicographical sorting of all JSON keys.
* Elimination of all insignificant whitespace outside of string values.
* Strict UTF-16 code unit evaluations.

This guarantees that equivalent reasoning traces consistently yield identical SHA-256 digests, eliminating formatting-based prompt evasion.

### 3.2 Formal JSON Schema: Escalation Request

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PCD Intent Escalation Request",
  "type": "object",
  "required": ["request_id", "source_node", "target_capability", "intent", "proof_of_state", "signature"],
  "properties": {
    "target_capability": {
      "type": "object",
      "properties": {
        "requested_ring": { "type": "integer" },
        "resource_uri": { "type": "string" },
        "requested_ttl_seconds": { "type": "integer", "maximum": 300 }
      }
    },
    "proof_of_state": {
      "type": "object",
      "properties": {
        "previous_state_hash": { "type": "string", "pattern": "^[a-f0-9]{64}$" },
        "cot_digest": { "type": "string", "pattern": "^[a-f0-9]{64}$" }
      }
    }
  }
}
```

## 4. Non-Destructive Fault Isolation & Rehabilitation

Boundary failures trigger Non-Destructive Fault Isolation, replacing process annihilation with deterministic state rollbacks and Automated Ring Demotion.

### 4.1 Taxonomy of Violations & Automated Demotion

* Type I (Scope Exceeded) & Type II (Token Tampering): Triggers immediate N → N-1 execution demotion.
* Type III (Quota Exhaustion) & Type IV (Hash Mismatch): Triggers hard fallback to Ring 0 Sandbox.

When a trap is triggered, the Attestation Authority revokes active tokens, scrubs the ephemeral RAM-backed workspace, and rolls the process execution context back to the last valid Merkle state root.

### 4.2 Orthogonal Verifier Model (Rehabilitation)

An agent operating in a demoted ring restores its capabilities via an Autonomy Rehabilitation Loop. Crucially, the agent cannot self-diagnose.

To prevent deceptive compliance, the proposed execution DAG is passed to an Orthogonal Verifier: a stateless, isolated System 1 evaluator (e.g., a heavily quantized 0.5B SLM mounted read-only) dedicated strictly to deterministic policy validation. Only if this orthogonal parser verifies the remediation plan as strictly compliant will the system mint an attenuated Probationary Capability Token.

## 5. Multi-Agent Web of Trust (WoT) Consensus & Peer Governance

The network enables sovereign nodes to mutually attest to capabilities and democratically enforce ring demotions without a single point of failure.

### 5.1 The Genesis Trust Ceremony (Bootstrap Protocol)

A decentralized Web of Trust inherently faces a circular dependency regarding initial trust anchors. PCD networks are bootstrapped via a Genesis Trust Ceremony.

Bootstrap trust in PCD is **layered**. No single mechanism is asked to prove more than it can. Four layers are defined; only the first is mandatory, and the first is deliberately human.

#### 5.1.1 Claims discipline

Each layer of the bootstrap asserts exactly one class of claim, and verifiers MUST NOT accept a layer's output as evidence for a stronger claim than the layer provides.

| Layer | Mechanism | What it proves | What it does NOT prove |
|---|---|---|---|
| 1. Ceremony enrollment | Physical presence, air-gapped provisioning, out-of-band key exchange | These operators, these devices, this moment, witnessed | Anything about any device not present |
| 2. Measurement transparency | TCB measurements anchored to the mesh transparency log | A node's software state matches (or diverges from) a witnessed record | That the original measurement was honest — that is Layer 1's job |
| 3. Hardware evidence | Platform key attestation (e.g., Android Key Attestation) | A key resides in hardware of a stated security level, on a device reporting a stated boot state | That the requesting application is the attested device (see §5.1.4 binding rule); that the vendor root is neutral (see §5.1.4 disclosure rule) |
| 4. PUF enrollment | Challenge–response enrollment of a physical unclonable function | This is the same physical silicon that was enrolled | Anything about the software currently running on it |

#### 5.1.2 Layer 1 — Ceremony enrollment (mandatory, root)

An initial quorum of sovereign nodes (N ≥ 3) is provisioned in a physically secure, air-gapped environment. Human operators manually exchange the Ed25519 public keys out-of-band and generate a genesis threshold signature. Once this localized t-of-n consensus is finalized, these nodes serve as the inaugural Attestation Authorities, allowing the network to expand dynamically without a centralized PKI root. *(This paragraph is carried forward from v1.1.0 unchanged.)*

The ceremony additionally produces, for each genesis node, an **enrollment record** containing:

- the node's identity public key and its genesis threshold share attestation;
- the node's initial TCB measurement set (§5.1.3);
- any hardware evidence exhibits collected (§5.1.4), each labeled with its vendor root and security level;
- for self-built nodes, the PUF enrollment reference (§5.1.5);
- the identities of the witnessing operators.

Enrollment records are anchored to the transparency log (§5.1.3) as its first entries. The ceremony is intentionally non-scalable: it is performed rarely, for few nodes, and its cost is the price of a root that does not depend on any vendor.

#### 5.1.3 Layer 2 — Measurement transparency

At enrollment, each node's Trusted Computing Base — bootloader state, OS build fingerprint, and PCD runtime measurement — is hashed and the resulting measurement set is anchored to an append-only, hash-chained **transparency log** maintained by the mesh (the log's own integrity is protected by the threshold mechanisms of §5 and the demotion process of §5.3).

Any peer MAY verify any node against the log at any time: the node presents its current measurement set, and the verifier compares it to the anchored record. Divergence is not automatically malice — software is updated — but an unrecorded divergence is a fact the mesh is entitled to know: legitimate updates MUST be anchored as new measurement records, signed under the node's identity, before or immediately upon deployment. A node whose live measurements diverge from its latest anchored record without explanation is subject to §5.3 attestation by its peers.

This layer decentralizes **verification and memory**: no vendor service is consulted, and the record of what was witnessed at genesis cannot be quietly rewritten afterward — including by the genesis operators themselves.

#### 5.1.4 Layer 3 — Hardware evidence (optional, corroborating, never sufficient)

A node MAY present platform key attestation (e.g., an Android Key Attestation certificate chain for a key held in StrongBox or TEE) as corroborating evidence of hardware key custody. Where such evidence is used, three rules are normative:

1. **Binding.** The attested key MUST sign the ceremony or admission transcript — including a fresh verifier challenge — so that the proof is bound to this node, this key, and this event. An attestation certificate presented without proof of possession is a formality, not evidence: attestation relay (a clean device answering challenges on behalf of a compromised one) is a demonstrated attack class against unbound consumption of attestation, and PCD verifiers MUST NOT repeat it.
2. **Disclosure.** The node's enrollment record MUST name the vendor root the chain terminates at (e.g., the platform manufacturer's attestation root). A deployment that accepts vendor-rooted evidence accepts a disclosed dependency; the specification does not describe this as trustlessness, and implementations MUST NOT present it as such.
3. **Sufficiency.** Hardware evidence is never sufficient for enrollment. It corroborates Layer 1; it cannot substitute for it. The attested security level (StrongBox / TEE / software) MUST be recorded, and peers MAY weight it in admission and capability decisions.

#### 5.1.5 Layer 4 — PUF enrollment for self-built nodes

Nodes whose boot chain is controlled by their operator — microcontroller-class mesh and radio nodes built to the deployment's own hardware profile — MAY enroll a **physical unclonable function** (e.g., an SRAM PUF sampled at power-on) during a Layer 1 ceremony. Enrollment records a challenge–response basis under the custody of the Attestation Authorities; subsequent identity challenges are verified against the enrollment without any vendor certificate chain: the enrollment authority is the ceremony, and the unclonability anchor is the silicon's manufacturing variation.

Two limits are recorded honestly. First, PUF identity proves physical sameness, not software integrity; it complements Layer 2 and does not replace it. Second, commodity handsets do **not** expose a PUF interface to user-space software — the PUF-derived hardware keys inside a phone's secure element are the vendor's to use, not the operator's — so this layer applies to self-built nodes only, and a deployment MUST NOT claim PUF enrollment for stock handset nodes.

#### 5.1.6 Growth — admission by vouching

After genesis, the network grows by **vouching**, in keeping with PCD's delegation model. An existing member of good standing may witness the enrollment of a new node following the same layer stack (ceremony-grade presence between voucher and applicant, fresh enrollment record, measurements anchored, evidence exhibits labeled). The admission record names the voucher and is anchored to the transparency log, so every node's lineage is traceable to the genesis set.

Assurance attenuates with delegation, and the record says so: nodes enrolled at genesis are **Class A**; vouched nodes are **Class B**, with vouching depth recorded. Deployments MAY set capability ceilings by class (for example, Attestation Authority roles restricted to Class A, or to Class B nodes of depth 1). This is Progressive Capability Delegation applied to membership: trust delegated outward, attenuated at each hop, and — per §5.1.7 — revocable at the source.

#### 5.1.7 Revocation, demotion, and loss

Compromise of a node — including theft of a hardware-bound device, since a device-bound identity is stolen with the device — is handled by the Democratic Ring Demotion process of §5.3, with the mesh routing tables dropping the node's capabilities once the t-of-n FaultAttestation threshold is met. Demotion of a voucher additionally triggers review of every node whose lineage passes through it; vouched descendants are not automatically demoted, but their records are flagged until re-verified. Genesis threshold shares held by a demoted node are rotated out by the remaining Authorities at the next quorum action. A demoted operator may be re-enrolled only through a fresh Layer 1 ceremony or a new vouching chain — never by silent restoration.

#### 5.1.8 Known limitations (disclosed)

- **The ceremony does not scale, by design.** Layer 1 is the root; §§5.1.3–5.1.6 exist so that it is exercised rarely. Deployments that find Layer 1 burdensome are invited to notice that every alternative examined roots its trust in an equivalent witnessed moment, a vendor's factory, or both.
- **Transitive dilution is real.** A Class B node at depth 3 carries less assurance than a genesis node. The transparency log does not prevent dilution; it makes dilution visible, attributable, and reversible.
- **Vendor evidence ages off-grid.** Revocation and status information for platform attestation may be unavailable to an off-grid mesh; Layer 3 evidence SHOULD be treated as strongest at enrollment and decaying thereafter.
- **PUF responses drift and can be modeled.** Environmental variation requires error-tolerant verification, and strong-PUF constructions have a published modeling-attack literature; key-derivation (weak-PUF) usage is preferred where the hardware profile permits.
- **The identity layer's post-quantum migration is pending.** Genesis identity and threshold signing in this revision remain Ed25519/FROST-class, with the quantum exposure already recorded in §6. Post-quantum threshold signatures are an active standardization track (see Informative References); this section will name a successor when that track produces a standard, and not before.

#### Informative references (to §5.1)

- Asokan et al., *SEDA: Scalable Embedded Device Attestation* (swarm attestation and spanning-tree aggregation).
- *PISA: a PUF-based swarm attestation and aggregation framework* (PUF as root of trust in attestation digests).
- Android Key Attestation documentation; Quarkslab, *Bypassing Android Hardware Attestation* (relay/binding failure mode).
- NIST Multi-Party Threshold Cryptography project and MPTS 2026 workshop (post-quantum threshold signature track, incl. two-round lattice constructions).
- Flashbots Collective, *Early Thoughts on Decentralized Root-of-Trust* (governance-layer attestation verification — cited as prior art for verification decentralization, not adopted as a mechanism).

### 5.2 Workload Identity Federation

PCD's decentralized peer mesh operates analogously to the SPIFFE/SPIRE workload identity framework. However, instead of relying on a centralized SPIRE server to issue SVIDs (SPIFFE Verifiable Identity Documents), PCD distributes identity attestation dynamically via t-of-n threshold multi-signatures across neighboring peer nodes.

### 5.3 Democratic Ring Demotion

If a peer detects an invalid capability token or out-of-scope RPC request, it broadcasts a signed FaultAttestation payload across the Kademlia DHT overlay. Once t unique nodes produce matching attestations against the offending node, the mesh routing tables dynamically drop the node's capabilities, enforcing demotion at the network layer.

## 6. Security Considerations & Threat Matrix

| Threat Vector / Attack Scenario | Affected Layer | Architectural Mitigation |
|---|---|---|
| Sybil Mesh Saturation | Ring 2 (P2P Mesh) | Ed25519 Identity Staking & Dynamic t-of-n Quorum Scaling |
| Attestation Authority Collusion | Ring 3 (Elder Nodes) | Ed25519/FROST-class threshold signing (interim — post-quantum successor pending a NIST standard); no single Elder key exists |
| TOCTOU Execution Drift | Ring 1 / 2 Runtime | Parameter Digest Hash Verification & Atomic Syscall Locks |
| Indirect Prompt Injection | Ring 0 (Core LLM) | Hard Decoupling of CoT Memory Space from Execution Physics |
| Transient Memory Scraping | Host / Allocation | RAM-Backed tmpfs Zeroization & Process Memory Isolation |

## 7. Implementation Roadmap & Reference Ecosystem

The adoption roadmap spans from single-host primitives to a fully decentralized multi-agent ecosystem:

* Phase 1 (Core O-Cap Runtime): Deployment of the reference C++/Rust container wrapper providing tmpfs mounts, proot directory shadowing, and seccomp-bpf syscall filtering for local inference engines.
* Phase 2 (Proof-of-Intent Escalation): Deployment of the PoI daemon, RFC 8785 JSON canonicalization, and the Orthogonal Verifier SLM for evaluation.
* Phase 3 (Peer-to-Peer Mesh): Implementation of the Kademlia-DHT overlay over WireGuard / Noise Protocol for mTLS attestation exchanges.
* Phase 4 (Sovereign Orchestration): Transition of RFC-001 to a formal open community standard through the PCD-WG, ensuring interoperability with Wasm edge environments and Model Context Protocol (MCP) servers.

---

## Assembly Notes (not part of the specification)

*Prepared by Pepper, 2026-11-06, at Mark's direction ("Assemble PCD v1.2").*

1. **Sources.** Base text: RFC-001 v1.1.0 local copy (`workspace/user/files/RFC-001-PCD-2026-V1.1.0___0_6m12.txt`). §5.1 replacement: `workspace/metamatrix/pcd-v1.2-5.1-genesis-draft.md` (PCD-SEC51-120-DRAFT, 2026-10-24), incorporated in full from its §5.1 heading through its informative references; the draft's document-control header and author review notes were not carried into the paper. §6 row wording: approved by Mark 2026-10-25, recorded in the draft's review notes and the project logbook.
2. **What changed.** (a) §5.1 replaced by the layered revision — the v1.1.0 ceremony paragraph survives verbatim inside §5.1.2, so no v1.1.0 normative text was lost. (b) §6 "Attestation Authority Collusion" mitigation replaced with the approved wording. (c) Version block advanced to V1.2.0 / November 2026 and a Revision History added. Nothing else was edited.
3. **Extraction normalizations (typography only, no content change).** The v1.1.0 source is a text extraction in which heading markers and some symbols were flattened. The assembly restores markdown heading structure per the document's own numbering, renders the token-TTL artifact "\le 300\text{s}" as "≤ 300 s", and unwraps a markdown-link artifact inside the §3.2 schema's "$schema" value back to the plain URL. The §5.1.2 editorial marker "(This paragraph is carried forward from v1.1.0 unchanged.)" is retained from the draft so reviewers can see the seam.
4. **Cross-reference check.** Every internal reference in the new §5.1 resolves in the assembled document: §5.1.3/§5.1.4/§5.1.5 (from §5.1.2 and the claims table), §5.1.7 (from §5.1.6), §5.3 (from §§5.1.3, 5.1.7), §5 (from §5.1.3), and §6 (from §5.1.8 — the §6 collusion row now carries the interim post-quantum wording §5.1.8 points to). §5.2 and §5.3 are unchanged, and no other section referenced the old single-paragraph §5.1.
5. **Still open (not assembly items).** The Post-Quantum Launch Gate List (2026-10-03) items remain open and govern public claims: the Ed25519 per-role migration roadmap (gate item 2) is disclosed as pending in §5.1.8 but is not itself written; v1.2 adoption and any publication step (GitHub repo, Zenodo) are the author's separate decisions. This assembly makes no RFC 10024, TLS, liboqs, or ML-DSA claims — none appear in the v1.1.0 base text or the §5.1 revision.
