# PCD — Progressive Capability Delegation

PCD is a specification for delegating capabilities to AI agents in
bounded, verifiable steps: an agent receives exactly the authority a
task needs, that authority is attested and recorded, and every
delegation can be audited after the fact. It is the capability-security
architecture of the [MetaMatrix](https://github.com/gowith133-rgb/Metamatrix_v_2)
project.

## Status

**Current published specification: v1.1.0.**
A v1.2.0 revision — a layered attestation model covering ceremony
enrollment, measurement transparency, and growth by vouching — has
been assembled and is in review; v1.1.0 remains the current text
until it is adopted.

**What works today**
- The full v1.1.0 specification text, presented as an **interactive
  explorer** (this repo is a Vite/React site): every section of the
  spec is browsable, with worked examples.
- Hands-on **labs** that demonstrate the core mechanisms in the
  browser — capability grants, attenuation, attestation chains —
  as client-side teaching demos.

**What this is not (yet)**
- Not a production implementation. The labs demonstrate the concepts;
  no reference implementation of the full protocol (enrollment
  ceremony, mesh-ledger anchoring, threshold signing) exists yet.
- The specification is a design document: claims in it are design
  positions, marked as such, not measurements of a running system.

## Running the explorer

```bash
npm install
npm run dev
```

## Layout

| Path | What it is |
|---|---|
| `src/data/specData.ts` | The specification text (v1.1.0), section by section |
| `src/components/` | The explorer UI: section browser, diagrams |
| `src/components/labs/` | The interactive concept labs |
