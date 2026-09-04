alter table if exists document_evidence add column if not exists observed_at timestamptz;
alter table if exists document_evidence add column if not exists category text;
alter table if exists document_evidence add column if not exists fhir_resource_type text;
alter table if exists document_evidence add column if not exists fhir_projection_status text not null default 'pending';
alter table if exists document_evidence add column if not exists original_resource_id uuid;
alter table if exists document_evidence add column if not exists source_region jsonb;
create index if not exists document_evidence_resource_idx on document_evidence(resource_id);
create index if not exists document_evidence_patient_idx on document_evidence(patient_id);
create index if not exists document_evidence_patient_time_idx on document_evidence(patient_id,observed_at desc);
