create extension if not exists "pgcrypto";
create table if not exists patients (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists intake_sessions (
 id uuid primary key,
 patient_id uuid references patients(id) on delete set null,
 language text not null,
 entry_point text not null,
 state text not null,
 pathway text not null default 'unknown',
 clinical_context jsonb not null default '{}'::jsonb,
 next_action jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists evidence_items (
 id uuid primary key default gen_random_uuid(),
 patient_id uuid references patients(id) on delete cascade,
 source_type text not null check (source_type in ('patient_reported','uploaded_document','abdm_exchange','clinician_confirmed')),
 care_pathway text not null default 'unknown',
 verification_status text not null default 'unverified',
 resource_type text,
 resource_id text,
 document_id uuid,
 source_locator jsonb,
 payload jsonb not null,
 created_at timestamptz not null default now()
);
create index if not exists evidence_patient_idx on evidence_items(patient_id);
create index if not exists evidence_source_idx on evidence_items(source_type);