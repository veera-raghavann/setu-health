alter table document_evidence add column if not exists category text;
alter table document_evidence add column if not exists fhir_resource_type text;
alter table document_evidence add column if not exists fhir_projection_status text not null default 'pending';
alter table document_evidence add column if not exists original_resource_id uuid;
alter table document_evidence add column if not exists source_region jsonb;
create index if not exists document_evidence_category_idx on document_evidence(category);
create index if not exists document_evidence_fhir_status_idx on document_evidence(fhir_projection_status);