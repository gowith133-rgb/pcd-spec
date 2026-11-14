# PCD — Progressive Capability Delegation

PCD is a specification for delegating capabilities to AI agents in
bounded, verifiable steps: an agent receives exactly the authority a
task needs, that authority is attested and recorded, and every
delegation can be audited after the fact. It is the capability-security
architecture of the [MetaMatrix](https://github.com/gowith133-rgb/Metamatrix_v_2)
project.

## Status

**Current published specification: v1.2.0** (adopted 2026-11-14).
Archived on Zenodo: [doi:10.5281/zenodo.24226143](https://doi.org/10.5281/zenodo.24226143)
(all-versions DOI: [10.5281/zenodo.24226142](https://doi.org/10.5281/zenodo.24226142)).
The full v1.2.0 text is in this repo as
[`PCD_v1.2.0.md`](PCD_v1.2.0.md). It supersedes v1.1.0: §5.1 is now a
layered attestation model covering ceremony enrollment, measurement
transparency, hardware evidence, and growth by vouching, with one
§6 threat-matrix row updated.

**What works today**
- The full v1.1.0 specification text, presented as an **interactive
  explorer** (this repo is a Vite/React site): every section of the
  spec is browsable, with worked examples. (The explorer still
  presents v1.1.0; a v1.2.0 refresh of the site data is pending.)
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
