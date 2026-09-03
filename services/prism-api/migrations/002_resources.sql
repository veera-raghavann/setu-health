create table if not exists resources (
 id uuid primary key default gen_random_uuid(),
 patient_id uuid references patients(id) on delete cascade,
 original_filename text not null,
 media_type text not null,
 byte_size bigint not null,
 sha256 text not null,
 storage_key text not null unique,
 resource_kind text not null check (resource_kind in ('original','processed')),
 parent_resource_id uuid references resources(id),
 created_at timestamptz not null default now(),
 deleted_at timestamptz
);
create index if not exists resources_patient_idx on resources(patient_id);
create index if not exists resources_parent_idx on resources(parent_resource_id);

create table if not exists document_processing_runs (
 id uuid primary key default gen_random_uuid(),
 source_resource_id uuid not null references resources(id),
 processed_resource_id uuid references resources(id),
 processor text not null,
 processor_version text,
 status text not null check (status in ('queued','processing','completed','failed')),
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 completed_at timestamptz
);