# Middle Me

**Middle Me** is an AI-powered mediation platform that helps people find common ground across differences—in personal disagreements or at work. It combines a warm, emotionally intelligent mediator (powered by LLMs) with **RAG** (retrieval over news and policy) so conversations stay grounded in real context, and offers a dedicated **EAP (Employee Assistance Program)** mode for workplace conflict and wellness.

## What It Does

- **Personal mediation:** You describe your view and the other side’s view; the AI mediates in a structured chat, reflects both perspectives, and asks short adaptive questions to de-escalate and find shared values.
- **Workplace / EAP mode:** Same flow tuned for work: professional tone, aligned with company policy and inclusion, so teams can resolve conflict and strengthen relationships without leaving the app.
- **RAG-backed responses:** Each turn can pull in relevant articles (or policy) via vector search so the mediator can reference real-world context and reduce bias from the model alone.
- **Structured journey:** Emotional check-ins, “meet in the middle” summaries, and optional session memory so progress is visible and conversations feel contained and safe.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | TailwindCSS, shadcn/ui (Radix) |
| **Backend / Data** | Supabase: Auth, Postgres, pgvector, Realtime, Edge Functions |
| **AI** | LangChain, Google Gemini (gemini-2.5-flash) |
| **RAG** | Embeddings (Supabase/embed or compatible) + pgvector similarity search over `articles` |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/cscx1/Middle-Me.git
cd Middle-Me
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Enable **pgvector:** `Database → Extensions → vector`.
3. Run migrations: `supabase db push` or apply SQL in `supabase/migrations/` via the SQL editor.
4. (Optional) Enable Realtime on `articles` for live trending: `Database → Replication → articles`.

### 3. Environment

Create `.env.local` with:

- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Gemini:** `GOOGLE_API_KEY` from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Scraper (optional):** `NEWS_API_KEY` from [newsapi.org](https://newsapi.org) for the news edge function

### 4. Run the app

```bash
npm run dev
```

### 5. (Optional) Deploy the news-scraper Edge Function

```bash
supabase functions deploy scrape-news --env-file .env.local
```

---

## Project Layout

```
src/
├── app/
│   ├── (auth)/              # login, signup
│   └── (dashboard)/        # dashboard, sessions, business (EAP)
├── components/
│   ├── features/           # auth, sessions, business, emotional meter, summaries
│   ├── shared/             # Sidebar, etc.
│   └── ui/                 # shared UI (modals, etc.)
├── lib/
│   ├── supabase/           # server + browser clients
│   ├── ai/                 # LangChain + Gemini (mediation + business chains)
│   └── scraper/            # RAG retrieval + edge function trigger
├── actions/                # server actions (auth, sessions)
└── types/
supabase/
├── migrations/             # Postgres schema (incl. pgvector, sessions, articles)
└── functions/              # Deno edge functions (e.g. scrape-news)
```

---

## Main Flows

**Mediation chat (with RAG)**  
1. User sends a message in a session.  
2. `retrieveContext()` runs vector similarity over `articles` (and optional policy docs).  
3. Top matches are passed as context into the mediation chain (Gemini).  
4. The model responds as a neutral mediator; both user and AI messages are stored in Supabase.

**EAP / Business mode**  
- Same flow with a dedicated business chain and dashboard; tone and prompts are tuned for workplace conflict and policy-aware guidance.

**Trending / news (optional)**  
- `scrape-news` edge function fetches and embeds news, upserts into `articles`.  
- A `trending_topics`-style view and Realtime subscription can drive a live “trending” UI.
