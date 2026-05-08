import { supabase } from "@/lib/supabase";
import OpenAI from "openai";

/**
 * MemoryService: Production-grade RAG (Retrieval Augmented Generation)
 * Uses Supabase pgvector for persistent long-term memory.
 */

export type MemoryNode = {
  id: string;
  content: string;
  type: string;
  timestamp: number;
};

// Lazy-initialized OpenAI client for embeddings
let _openai: OpenAI | null = null;
const getOpenAI = () => {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
};

export class MemoryService {
  /**
   * Generates a vector embedding for a given text using OpenAI.
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await getOpenAI().embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error("Embedding generation failed:", error);
      throw error;
    }
  }

  /**
   * Adds a memory to both the database and the vector store.
   */
  public async addMemory(memory: MemoryNode) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // 1. Generate embedding
      const embedding = await this.generateEmbedding(memory.content);

      // 2. Persist to Supabase pgvector
      const { error } = await supabase.from('memories').insert({
        id: memory.id,
        user_id: user.id,
        content: memory.content,
        type: memory.type,
        timestamp: memory.timestamp,
        embedding: embedding, // This goes into the vector(1536) column
      });

      if (error) throw error;
      return memory;
    } catch (e) {
      console.error("Failed to persist memory to vector store:", e);
      // Fallback for demo: return memory even if persistence fails
      return memory;
    }
  }

  /**
   * Retrieves memories from Supabase.
   */
  public async getMemories(userId?: string) {
    const { data, error } = await supabase
      .from('memories')
      .select('id, content, type, timestamp')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error("Failed to fetch memories:", error);
      return [];
    }
    return data as MemoryNode[];
  }

  /**
   * Performs a vector similarity search to find relevant context.
   */
  public async retrieveContext(query: string, limit: number = 3): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return "";

      // 1. Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);

      // 2. Call the RPC function in Supabase for similarity search
      const { data, error } = await supabase.rpc('match_memories', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: limit,
        p_user_id: user.id
      });

      if (error) throw error;

      const memoryLines = data.map((m: any) => `- [${m.type.toUpperCase()}] ${m.content}`);

      return memoryLines.length > 0 
        ? `\n\nRELEVANT MEMORIES ABOUT YOU AND THE USER:\n${memoryLines.join("\n")}`
        : "";
    } catch (e) {
      console.error("Memory retrieval error:", e);
      return "";
    }
  }
}
