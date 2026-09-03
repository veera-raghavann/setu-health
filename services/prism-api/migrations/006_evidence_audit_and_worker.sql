alter table document_processing_runs add column if not exists worker_job_id text;
alter table document_processing_runs add column if not exists source_sha256 text;
alter table document_processing_runs add column if not exists error text;
create table if not exists evidence_audit (
 id uuid primary key default gen_random_uuid(),
 evidence_id uuid not null references document_evidence(id) on delete cascade,
 action text not null,
 actor_type text not null,
 actor_id text,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists evidence_audit_evidence_idx on evidence_audit(evidence_id);