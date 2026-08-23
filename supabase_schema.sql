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

-- Ensure all columns exist on pre-existing ai_children table
ALTER TABLE public.ai_children ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.ai_children ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.ai_children ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Nova';
ALTER TABLE public.ai_children ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'NEWBORN';
ALTER TABLE public.ai_children ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.ai_children ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE public.ai_children ADD COLUMN IF NOT EXISTS traits TEXT[] DEFAULT ARRAY['Curious', 'Empathetic', 'Creative'];
ALTER TABLE public.ai_children ADD COLUMN IF NOT EXISTS completed_lessons TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.ai_children ADD COLUMN IF NOT EXISTS stats JSONB;

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

-- Ensure all columns exist on pre-existing memories table
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS child_id UUID;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'moment';
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS timestamp BIGINT DEFAULT (extract(epoch from now()) * 1000)::BIGINT;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE;

-- Safely add foreign key constraint if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'memories_child_id_fkey') THEN
    BEGIN
      ALTER TABLE public.memories ADD CONSTRAINT memories_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.ai_children(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

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
DROP POLICY IF EXISTS "Users can view and manage their own profile" ON public.profiles;
CREATE POLICY "Users can view and manage their own profile" 
  ON public.profiles FOR ALL 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view and manage their own AI child" ON public.ai_children;
CREATE POLICY "Users can view and manage their own AI child" 
  ON public.ai_children FOR ALL 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view and manage their own memories" ON public.memories;
CREATE POLICY "Users can view and manage their own memories" 
  ON public.memories FOR ALL 
  USING (auth.uid() = user_id);

-- 7. Vector Similarity Search Function (RAG Procedure)
DROP FUNCTION IF EXISTS match_memories(vector(1536), float, int, uuid);
DROP FUNCTION IF EXISTS match_memories(vector, float, int, uuid);
DROP FUNCTION IF EXISTS match_memories(vector, double precision, integer, uuid);
DROP FUNCTION IF EXISTS match_memories;

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
  "timestamp" bigint,
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
