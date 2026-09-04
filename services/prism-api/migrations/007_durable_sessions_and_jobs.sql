create table if not exists prism_processing_jobs (
 id uuid primary key,
 resource_id uuid not null references resources(id) on delete cascade,
 status text not null check(status in ('queued','processing','completed','failed')),
 attempt integer not null default 0,
 error text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists prism_processing_jobs_status_idx on prism_processing_jobs(status,created_at);
alter table document_evidence add column if not exists observed_at timestamptz;
create index if not exists document_evidence_patient_time_idx on document_evidence(patient_id,observed_at desc);
