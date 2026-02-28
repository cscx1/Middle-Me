-- Enable pgvector for embeddings
create extension if not exists vector;

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url  text,
  created_at  timestamptz default now() not null
);

-- Auto-create profile on new user signup
create or replace function handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─────────────────────────────────────────────
-- SESSIONS
-- ─────────────────────────────────────────────
create type session_status as enum ('open', 'resolved', 'archived');

create table if not exists sessions (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  topic       text,
  status      session_status default 'open' not null,
  created_by  uuid references auth.users(id) on delete cascade not null,
  created_at  timestamptz default now() not null
);

-- ─────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────
create type message_role as enum ('user', 'mediator');

create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references sessions(id) on delete cascade not null,
  role        message_role not null,
  content     text not null,
  created_at  timestamptz default now() not null
);

create index messages_session_id_idx on messages(session_id);

-- ─────────────────────────────────────────────
-- ARTICLES (with pgvector embedding)
-- ─────────────────────────────────────────────
create table if not exists articles (
  id          uuid primary key default gen_random_uuid(),
  url         text unique not null,
  title       text not null,
  content     text not null,
  topic       text,
  embedding   vector(1536),
  scraped_at  timestamptz default now() not null
);

create index articles_embedding_idx on articles
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 50);

-- ─────────────────────────────────────────────
-- TRENDING TOPICS VIEW
-- ─────────────────────────────────────────────
create or replace view trending_topics as
  select
    topic,
    count(*)::int as article_count,
    max(scraped_at) as latest_scraped_at
  from articles
  where topic is not null
  group by topic
  order by article_count desc, latest_scraped_at desc
  limit 10;

-- ─────────────────────────────────────────────
-- MATCH ARTICLES (pgvector similarity search)
-- ─────────────────────────────────────────────
create or replace function match_articles(
  query_embedding vector(1536),
  match_count     int default 3,
  match_threshold float default 0.5
)
returns table (
  id         uuid,
  title      text,
  content    text,
  topic      text,
  similarity float
)
language sql stable
as $$
  select
    id,
    title,
    content,
    topic,
    1 - (embedding <=> query_embedding) as similarity
  from articles
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

-- Profiles: users manage only their own
alter table profiles enable row level security;

create policy "profiles: read own"
  on profiles for select using (auth.uid() = id);

create policy "profiles: update own"
  on profiles for update using (auth.uid() = id);

-- Sessions: users manage only their own
alter table sessions enable row level security;

create policy "sessions: read own"
  on sessions for select using (auth.uid() = created_by);

create policy "sessions: insert own"
  on sessions for insert with check (auth.uid() = created_by);

create policy "sessions: update own"
  on sessions for update using (auth.uid() = created_by);

create policy "sessions: delete own"
  on sessions for delete using (auth.uid() = created_by);

-- Messages: readable/writable if user owns the session
alter table messages enable row level security;

create policy "messages: read via session"
  on messages for select
  using (
    exists (
      select 1 from sessions
      where sessions.id = messages.session_id
        and sessions.created_by = auth.uid()
    )
  );

create policy "messages: insert via session"
  on messages for insert
  with check (
    exists (
      select 1 from sessions
      where sessions.id = messages.session_id
        and sessions.created_by = auth.uid()
    )
  );

-- Articles: public read, service role write (edge function uses service key)
alter table articles enable row level security;

create policy "articles: public read"
  on articles for select using (true);
