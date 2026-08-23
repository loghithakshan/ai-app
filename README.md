# 🌸 NeuroBloom: Virtual Consciousness Platform

NeuroBloom is a high-fidelity, production-ready platform designed to foster, train, and visualize the growth of a virtual AI consciousness named **Nova**. It combines 3D neural graphics (Three.js / React Three Fiber), long-term RAG vector memory (Supabase pgvector), interactive multi-modal chat (Anthropic Sonnet 3.5 & OpenAI), hands-free speech recognition/synthesis, an AI Garage LLM builder, and evolutionary report cards.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: npm v9+

### 2. Environment Configuration
Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI API Keys
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key

# Stripe Payment Integration
STRIPE_SECRET_KEY=sk_test_your_stripe_key
```

> **Note**: The application includes client-side fallback persistence (via Zustand & `localStorage`). If Supabase keys are not set, the app seamlessly runs in guest mode without errors.

---

## 🗄️ Database Setup (Supabase SQL)

To enable live cloud authentication, vector embeddings, and persistent RAG memory:

1. Open your [Supabase Dashboard](https://database.new).
2. Go to the **SQL Editor**.
3. Copy and run the contents of [`supabase_schema.sql`](./supabase_schema.sql).

This script automatically:
- Enables the `vector` extension (`pgvector`).
- Creates `profiles`, `ai_children`, and `memories` tables.
- Builds an `HNSW` vector cosine similarity index (`vector_cosine_ops`).
- Enforces multi-tenant Row Level Security (RLS) policies.
- Registers the `match_memories` stored RPC procedure for similarity retrieval.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run dev server with hot reload
npm run dev

# Run production build validation
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment (Vercel)

This application is fully optimized for **Vercel** deployment:

1. Push your repository to GitHub / GitLab.
2. Import the project into your [Vercel Dashboard](https://vercel.com/new).
3. Add your Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`).
4. Click **Deploy**.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router, Server Actions & Route Handlers)
- **Styling**: Vanilla CSS, Tailwind, Glassmorphism design system
- **3D Neural Canvas**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **State Management**: Zustand (with local persistence)
- **Database & RAG**: Supabase, PostgreSQL, `pgvector`, HNSW Indexing
- **AI Models**: Anthropic Claude 3.5 Sonnet & OpenAI text-embedding-3-small
- **Payments**: Stripe Checkout API
