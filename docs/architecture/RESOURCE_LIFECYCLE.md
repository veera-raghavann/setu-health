# PRISM Resource Lifecycle

## Non-negotiable rule

Uploaded and processed health files are resources, not temporary request payloads.

A patient may return later and access the original file, processed representation and evidence extracted from it.

## MedBridge interoperability

The same resources may be resolved inside MedBridge for an authorized clinician session. This does not copy them into an unrestricted doctor repository.

The access chain remains:

Patient resource → authorization context → MedBridge resolver → clinician split-view.

## Resource chain

Original upload

→ immutable original resource

→ processing run

→ processed resource(s)

→ extracted evidence

Every derived artefact points back to its parent.

## Example

```
lab-report.pdf
Resource: RES-001 (original)
        │
        ├── OCR processing run
        │
        ▼
Resource: RES-002 (processed searchable PDF/text)
        │
        ▼
Evidence items
- HbA1c
- Creatinine
- Collection date
```

## Storage rule

PostgreSQL stores metadata and lineage. Binary content belongs in object storage.

## Access rule

Resources are private by default. Patient access and MedBridge clinician access are separate authorization contexts. Storage keys alone never grant access.

## Deletion rule

Medical resources should support soft deletion and retention policy controls. Derived resources must never silently lose parent provenance.