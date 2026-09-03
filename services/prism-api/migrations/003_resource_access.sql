create table if not exists resource_access_grants (
 id uuid primary key default gen_random_uuid(),
 resource_id uuid not null references resources(id) on delete cascade,
 patient_id uuid references patients(id) on delete cascade,
 audience text not null check (audience in ('patient','medbridge_clinician')),
 purpose text not null,
 consent_reference text,
 access_session_id text,
 granted_at timestamptz not null default now(),
 expires_at timestamptz,
 revoked_at timestamptz,
 created_by text
);
create index if not exists resource_access_resource_idx on resource_access_grants(resource_id);
create index if not exists resource_access_session_idx on resource_access_grants(access_session_id);