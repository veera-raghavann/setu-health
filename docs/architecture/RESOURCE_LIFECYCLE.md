# PRISM Resource Lifecycle

## Non-negotiable rule

Uploaded and processed health files are resources, not temporary request payloads.

A patient may return later and access the original file, processed representation and evidence extracted from it.

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

Recommended production adapters:

- S3-compatible private bucket
- Cloudflare R2 private bucket
- MinIO for local development

## Access rule

Resources are private by default and accessed through authenticated authorization checks or short-lived signed URLs. A storage key alone must never grant public access.

## Deletion rule

Medical resources should support soft deletion and retention policy controls. Derived resources must never silently lose their parent provenance.