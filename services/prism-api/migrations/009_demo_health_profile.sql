create table if not exists patient_profile_items (
 id uuid primary key default gen_random_uuid(),
 patient_id uuid not null references patients(id) on delete cascade,
 category text not null check (category in ('condition','medication','allergy','procedure','family_history','other')),
 value_text text not null,
 source_type text not null check (source_type in ('patient_reported','uploaded_document','abdm_exchange','clinician_confirmed')),
 verification_status text not null default 'unverified',
 resource_id uuid references resources(id) on delete set null,
 created_at timestamptz not null default now()
);
create index if not exists patient_profile_patient_idx on patient_profile_items(patient_id,created_at desc);
