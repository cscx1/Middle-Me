# Middle Me

AI-powered mediation platform that helps people find common ground across differences.

## Tech Stack

- **Next.js 15** (App Router, TypeScript, Server Actions)
- **Supabase** (Auth, Postgres, pgvector, Realtime, Edge Functions)
- **LangChain + Claude** (claude-3-5-sonnet-20241022)
- **TailwindCSS + shadcn/ui**

## Getting Started

### 1. Clone and install

```bash
git clone <repo>
cd Middle-Me
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Enable pgvector: `Database → Extensions → vector`
3. Run the migration: `supabase db push` or paste `supabase/migrations/0001_init.sql` into the SQL editor
4. Enable Realtime on the `articles` table: `Database → Replication → articles`

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (for edge functions)
- `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)
- `NEWS_API_KEY` — from [newsapi.org](https://newsapi.org) (free tier works)

### 4. Run the dev server

```bash
npm run dev
```

### 5. (Optional) Deploy the scraper Edge Function

```bash
supabase functions deploy scrape-news --env-file .env.local
```

Trigger a scrape manually:
```bash
curl -X POST https://<project>.supabase.co/functions/v1/scrape-news \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"query": "political debate immigration climate"}'
```

## Architecture

```
src/
├── app/
│   ├── (auth)/          # login, signup
│   └── (dashboard)/     # protected: dashboard, sessions
├── components/
│   ├── features/        # auth, sessions, trending
│   └── shared/          # Sidebar
├── lib/
│   ├── supabase/        # server + browser clients
│   ├── ai/              # LangChain chain + Claude
│   └── scraper/         # RAG retrieval + edge function trigger
├── actions/             # server actions (auth, sessions)
└── types/               # shared TypeScript types
supabase/
├── migrations/          # Postgres schema
└── functions/           # Deno edge functions
```

## Key Flows

**Chat with AI Mediator:**
1. User submits a message → `sendMessage` server action
2. `retrieveContext()` runs pgvector similarity search over `articles`
3. Top-3 articles injected as context into `mediationChain.invoke()`
4. Claude responds as neutral mediator, both messages persisted to Supabase

**Trending Topics (Realtime):**
1. `scrape-news` edge function fetches news → embeds → upserts `articles`
2. `trending_topics` SQL view aggregates by topic
3. `TrendingTopics` component subscribes to `articles` inserts via Supabase Realtime
4. UI updates live without page refresh
