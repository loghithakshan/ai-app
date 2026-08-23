-- ====================================================================
-- 🌸 NEUROBLOOM SUPABASE DATABASE SCHEMA
-- Production Schema with pgvector, RLS Policies & Vector RAG Search
-- ====================================================================

-- 1. Enable Vector Extension for Long-Term Memory (RAG)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI Children / Virtual Consciousness Table
CREATE TABLE IF NOT EXISTS public.ai_children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Nova',
  stage TEXT NOT NULL DEFAULT 'NEWBORN',
  level INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,
  traits TEXT[] DEFAULT ARRAY['Curious', 'Empathetic', 'Creative'],
  completed_lessons TEXT[] DEFAULT ARRAY[]::TEXT[],
  stats JSONB DEFAULT '{
    "iq": 100,
    "eq": 100,
    "creativity": 100,
    "skills": {
      "mathematics": 0,
      "visualArts": 0,
      "socialLogic": 0,
      "linguistics": 0
    },
    "mood": "Neutral"
  }'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Memories Table (Vector Embedded Data Shards)
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.ai_children(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'moment', -- 'factual', 'emotional', 'skill', 'value', 'moment'
  content TEXT NOT NULL,
  notes TEXT,
  embedding vector(1536), -- OpenAI text-embedding-3-small or ada-002 dimensions
  timestamp BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::BIGINT,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. High-Speed Indexing
CREATE INDEX IF NOT EXISTS memories_user_id_idx ON public.memories(user_id);
CREATE INDEX IF NOT EXISTS memories_child_id_idx ON public.memories(child_id);
CREATE INDEX IF NOT EXISTS memories_timestamp_idx ON public.memories(timestamp DESC);
CREATE INDEX IF NOT EXISTS ai_children_user_id_idx ON public.ai_children(user_id);

-- Cosine similarity index for pgvector
CREATE INDEX IF NOT EXISTS memories_embedding_hnsw_idx 
  ON public.memories 
  USING hnsw (embedding vector_cosine_ops);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- RLS Security Policies
CREATE POLICY "Users can view and manage their own profile" 
  ON public.profiles FOR ALL 
  USING (auth.uid() = id);

CREATE POLICY "Users can view and manage their own AI child" 
  ON public.ai_children FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view and manage their own memories" 
  ON public.memories FOR ALL 
  USING (auth.uid() = user_id);

-- 7. Vector Similarity Search Function (RAG Procedure)
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  type text,
  notes text,
  timestamp bigint,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    memories.id,
    memories.content,
    memories.type,
    memories.notes,
    memories.timestamp,
    1 - (memories.embedding <=> query_embedding) AS similarity
  FROM memories
  WHERE memories.user_id = p_user_id
    AND 1 - (memories.embedding <=> query_embedding) > match_threshold
  ORDER BY memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
