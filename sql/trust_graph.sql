create table if not exists trust_graph_nodes (
  id text primary key,
  node_type text not null check (node_type in ('event', 'device', 'campaign')),
  ref_id text not null,
  label text not null,
  score numeric(5,2) not null default 0,
  risk text not null default 'SAFE' check (risk in ('SAFE', 'WATCH', 'HIGH_RISK')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_trust_graph_nodes_type_ref
  on trust_graph_nodes(node_type, ref_id);

create index if not exists idx_trust_graph_nodes_risk
  on trust_graph_nodes(risk);

create index if not exists idx_trust_graph_nodes_score
  on trust_graph_nodes(score);

create table if not exists trust_graph_edges (
  id bigserial primary key,
  source_id text not null references trust_graph_nodes(id) on delete cascade,
  target_id text not null references trust_graph_nodes(id) on delete cascade,
  edge_type text not null check (
    edge_type in (
      'event_previous',
      'event_device',
      'event_campaign',
      'device_campaign'
    )
  ),
  weight numeric(8,2) not null default 1,
  risk text not null default 'LOW' check (risk in ('LOW', 'MEDIUM', 'HIGH')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_trust_graph_edges_unique
  on trust_graph_edges(source_id, target_id, edge_type);

create index if not exists idx_trust_graph_edges_source
  on trust_graph_edges(source_id);

create index if not exists idx_trust_graph_edges_target
  on trust_graph_edges(target_id);

create index if not exists idx_trust_graph_edges_type
  on trust_graph_edges(edge_type);