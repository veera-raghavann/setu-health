create table if not exists document_evidence (
 id uuid primary key default gen_random_uuid(),
 patient_id uuid references patients(id) on delete cascade,
 resource_id uuid not null references resources(id) on delete restrict,
 processing_run_id uuid references document_processing_runs(id) on delete set null,
 evidence_kind text not null,
 value_json jsonb not null,
 care_pathway text not null default 'unknown',
 verification_status text not null default 'source_extracted',
 source_page integer,
 source_text text,
 confidence numeric,
 observed_at timestamptz,
 category text,
 fhir_resource_type text,
 fhir_projection_status text default 'pending',
 original_resource_id uuid,
 source_region jsonb,
 created_at timestamptz not null default now()
);
create index if not exists document_evidence_resource_idx on document_evidence(resource_id);
create index if not exists document_evidence_patient_idx on document_evidence(patient_id);
